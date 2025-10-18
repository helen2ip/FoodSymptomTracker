import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Check, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertFoodEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface PhotoFoodLoggerProps {
  selectedTimeOption: "now" | string;
}

interface FoodItem {
  name: string;
}

interface AnalysisResult {
  foods: FoodItem[];
}

export default function PhotoFoodLogger({ selectedTimeOption }: PhotoFoodLoggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newFoodInput, setNewFoodInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getSelectedTimestamp = (): Date => {
    if (selectedTimeOption === 'now') {
      return new Date();
    }
    return new Date(selectedTimeOption);
  };

  const analyzeMutation = useMutation({
    mutationFn: async (imageData: { imageData: string; mimeType: string }) => {
      const response = await apiRequest("POST", "/api/foods/analyze-image", imageData);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Analysis failed");
      }
      return data as AnalysisResult;
    },
    onSuccess: (data) => {
      setDetectedFoods(data.foods.map(f => f.name));
      setShowReview(true);
      setIsAnalyzing(false);
      setAnalysisFailed(false);
      setErrorMessage("");
    },
    onError: (error) => {
      setIsAnalyzing(false);
      setAnalysisFailed(true);
      const errorMsg = (error as Error).message || "Could not identify foods in the image";
      setErrorMessage(errorMsg);
      toast({
        title: "Analysis failed",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Analysis error:", error);
    },
  });

  const logFoodsMutation = useMutation({
    mutationFn: async (foods: string[]) => {
      const timestamp = getSelectedTimestamp();
      const promises = foods.map(foodName =>
        apiRequest("POST", "/api/foods", {
          foodName,
          timestamp
        } as InsertFoodEntry)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ["/api/foods"] });
      queryClient.invalidateQueries({ queryKey: [`/api/timeline/${today}`] });
      queryClient.invalidateQueries({ predicate: (query) => !!query.queryKey[0]?.toString().startsWith('/api/timeline') });
      
      toast({
        title: `${detectedFoods.length} foods logged! 📸`,
        description: "Added to your experiment timeline",
      });
      
      handleClose();
    },
    onError: () => {
      toast({
        title: "Failed to log foods",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setImagePreview(imageData);
      setIsAnalyzing(true);
      
      analyzeMutation.mutate({
        imageData,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewFood = () => {
    if (newFoodInput.trim()) {
      setDetectedFoods([...detectedFoods, newFoodInput.trim()]);
      setNewFoodInput("");
    }
  };

  const handleRemoveFood = (index: number) => {
    setDetectedFoods(detectedFoods.filter((_, i) => i !== index));
  };

  const handleConfirmAndLog = () => {
    if (detectedFoods.length === 0) {
      toast({
        title: "No foods to log",
        description: "Please add at least one food item",
        variant: "destructive",
      });
      return;
    }
    logFoodsMutation.mutate(detectedFoods);
  };

  const handleRetry = () => {
    setAnalysisFailed(false);
    setErrorMessage("");
    const fileInput = cameraInputRef.current || fileInputRef.current;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setImagePreview(null);
    setDetectedFoods([]);
    setShowReview(false);
    setIsAnalyzing(false);
    setAnalysisFailed(false);
    setErrorMessage("");
    setNewFoodInput("");
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-lab-purple to-lab-blue text-white rounded-xl py-6 font-medium text-lg shadow-lg hover:shadow-xl transition-all"
        data-testid="button-photo-logger"
      >
        <Camera className="mr-2" size={20} />
        Take Photo of Food
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-lab-purple">
              {showReview ? "Review Detected Foods" : "Upload Food Photo"}
            </DialogTitle>
          </DialogHeader>

          {!imagePreview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed hover:border-lab-purple hover:bg-lab-purple/5"
                  data-testid="button-camera"
                >
                  <Camera size={32} className="text-lab-purple" />
                  <span className="text-sm font-medium">Take Photo</span>
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed hover:border-lab-blue hover:bg-lab-blue/5"
                  data-testid="button-upload"
                >
                  <Upload size={32} className="text-lab-blue" />
                  <span className="text-sm font-medium">Upload Image</span>
                </Button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
                data-testid="input-camera"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                data-testid="input-file"
              />
            </div>
          ) : showReview ? (
            <div className="space-y-4">
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-700">Detected Foods:</h3>
                
                {detectedFoods.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No foods detected. Add some below.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {detectedFoods.map((food, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-lab-green/10 rounded-lg"
                        data-testid={`food-item-${index}`}
                      >
                        <span className="font-medium text-gray-800">{food}</span>
                        <button
                          onClick={() => handleRemoveFood(index)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`button-remove-food-${index}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newFoodInput}
                    onChange={(e) => setNewFoodInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNewFood()}
                    placeholder="Add missing food..."
                    className="flex-1"
                    data-testid="input-add-food"
                  />
                  <Button
                    onClick={handleAddNewFood}
                    size="icon"
                    disabled={!newFoodInput.trim()}
                    data-testid="button-add-missing-food"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAndLog}
                  disabled={detectedFoods.length === 0 || logFoodsMutation.isPending}
                  className="flex-1 bg-lab-green hover:bg-lab-green/90"
                  data-testid="button-confirm-log"
                >
                  {logFoodsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Logging...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2" size={16} />
                      Log {detectedFoods.length} Food{detectedFoods.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : analysisFailed ? (
            <div className="space-y-4">
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X size={32} className="text-red-500" />
                </div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Analysis Failed</h3>
                <p className="text-sm text-gray-600 mb-1">{errorMessage}</p>
                <p className="text-xs text-gray-500">Please try again or add foods manually</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-close-error"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setAnalysisFailed(false);
                    setShowReview(true);
                    setDetectedFoods([]);
                  }}
                  className="flex-1 bg-lab-blue hover:bg-lab-blue/90"
                  data-testid="button-manual-add"
                >
                  Add Foods Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-lab-purple mb-4" size={48} />
              <p className="text-gray-600 font-medium">Analyzing your food photo...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
