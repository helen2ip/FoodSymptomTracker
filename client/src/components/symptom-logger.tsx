import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertSymptomEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { searchSymptoms, commonSymptoms } from "@/lib/food-database";

interface SymptomLoggerProps {
  trigger?: React.ReactNode;
}

export default function SymptomLogger({ trigger }: SymptomLoggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [symptomName, setSymptomName] = useState("");
  const [severity, setSeverity] = useState(1);
  const [notes, setNotes] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addSymptomMutation = useMutation({
    mutationFn: async (symptomEntry: InsertSymptomEntry) => {
      const response = await apiRequest("POST", "/api/symptoms", symptomEntry);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeline"] });
      setIsOpen(false);
      resetForm();
      toast({
        title: "Symptom logged successfully!",
        description: "Added to your experiment timeline",
      });
    },
    onError: () => {
      toast({
        title: "Failed to log symptom",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSymptomName("");
    setSeverity(1);
    setNotes("");
    setSuggestions([]);
  };

  const handleSymptomNameChange = (value: string) => {
    setSymptomName(value);
    if (value.length >= 2) {
      const results = searchSymptoms(value, 5);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomName.trim()) return;
    
    addSymptomMutation.mutate({
      symptomName: symptomName.trim(),
      severity,
      notes: notes.trim() || undefined,
      timestamp: new Date(),
    });
  };

  const defaultTrigger = (
    <Button variant="outline" className="text-lab-blue border-lab-blue/20 hover:bg-lab-blue/5">
      + Log Symptom
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild data-testid="button-open-symptom-logger">
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="text-lab-red" size={20} />
            <span>Log Symptom</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="symptom-name">Symptom</Label>
            <Input
              id="symptom-name"
              type="text"
              placeholder="e.g., Skin itching, Bloating..."
              value={symptomName}
              onChange={(e) => handleSymptomNameChange(e.target.value)}
              data-testid="input-symptom-name"
            />
            
            {/* Quick suggestions */}
            {symptomName.length < 2 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">Common symptoms:</p>
                <div className="flex flex-wrap gap-1">
                  {commonSymptoms.slice(0, 6).map((symptom, index) => (
                    <button
                      key={index}
                      type="button"
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-lab-blue/10 rounded-full transition-colors"
                      onClick={() => setSymptomName(symptom)}
                      data-testid={`button-quick-symptom-${index}`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-2 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded transition-colors"
                    onClick={() => setSymptomName(suggestion)}
                    data-testid={`button-symptom-suggestion-${index}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="severity">Severity (1-5)</Label>
            <div className="flex items-center space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    severity >= level
                      ? "bg-lab-red border-lab-red text-white"
                      : "border-gray-300 hover:border-lab-red"
                  }`}
                  onClick={() => setSeverity(level)}
                  data-testid={`button-severity-${level}`}
                >
                  {level}
                </button>
              ))}
              <span className="text-sm text-gray-500 ml-2">
                {severity === 1 && "Mild"}
                {severity === 2 && "Light"}
                {severity === 3 && "Moderate"}
                {severity === 4 && "Strong"}
                {severity === 5 && "Severe"}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about the symptom..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="textarea-symptom-notes"
            />
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              data-testid="button-cancel-symptom"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!symptomName.trim() || addSymptomMutation.isPending}
              className="flex-1 science-gradient text-white"
              data-testid="button-submit-symptom"
            >
              {addSymptomMutation.isPending ? "Logging..." : "Log Symptom"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
