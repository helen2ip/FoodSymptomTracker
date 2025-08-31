import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertSymptomEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { searchSymptoms } from "@/lib/symptom-database";

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

  // Fetch recent symptoms for personalized quick options
  const { data: recentSymptoms = [] } = useQuery<string[]>({
    queryKey: ["/api/symptoms/recent"],
    enabled: isOpen // Only fetch when dialog is open
  });

  const addSymptomMutation = useMutation({
    mutationFn: async (symptomEntry: InsertSymptomEntry) => {
      const response = await apiRequest("POST", "/api/symptoms", symptomEntry);
      return response.json();
    },
    onSuccess: () => {
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeline", today] });
      setIsOpen(false);
      resetForm();
      toast({
        title: "Reaction recorded! ✏️",
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
    <Button variant="outline" className="text-lab-red border-lab-red/20 hover:bg-lab-red/5 font-mono">
      ✏️ Log Reaction
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
            <span className="font-mono">🧪 Record Reaction</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="symptom-name" className="font-mono text-sm">Reaction Type</Label>
            <Input
              id="symptom-name"
              type="text"
              placeholder="🔍 e.g., Skin itching, Bloating..."
              value={symptomName}
              onChange={(e) => handleSymptomNameChange(e.target.value)}
              data-testid="input-symptom-name"
            />
            
            {/* Quick suggestions */}
            {symptomName.length < 2 && recentSymptoms.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-lab-purple font-mono mb-2">⚡ Recent REACTIONS</p>
                <div className="flex flex-wrap gap-1">
                  {recentSymptoms.slice(0, 5).map((symptom, index) => (
                    <button
                      key={`recent-${index}`}
                      type="button"
                      className="text-xs px-2 py-1 bg-lab-purple/10 hover:bg-lab-purple/20 text-lab-purple border border-lab-purple/20 rounded-full transition-colors"
                      onClick={() => setSymptomName(symptom)}
                      data-testid={`button-recent-symptom-${index}`}
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
                    onClick={() => {
                      setSymptomName(suggestion);
                      setSuggestions([]); // Add this line to clear the suggestions
                    }}
                    data-testid={`button-symptom-suggestion-${index}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="severity" className="font-mono text-sm">INTENSITY_SCALE (1-5)</Label>
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
            <Label htmlFor="notes" className="font-mono text-sm">OBSERVATION_NOTES (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Record additional observations about the reaction..."
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
              className="flex-1 science-gradient text-white font-mono"
              data-testid="button-submit-symptom"
            >
              {addSymptomMutation.isPending ? "PROCESSING..." : "RECORD_DATA"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
