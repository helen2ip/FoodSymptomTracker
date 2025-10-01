import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertSymptomEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Clock, ChevronDown } from "lucide-react";
import { searchSymptoms } from "@/lib/symptom-database";

type TimeOption = "now" | string;

interface SymptomLoggerProps {
  trigger?: React.ReactNode;
}

export default function SymptomLogger({ trigger }: SymptomLoggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [symptomName, setSymptomName] = useState("");
  const [severity, setSeverity] = useState(1);
  const [selectedTimeOption, setSelectedTimeOption] = useState<TimeOption>("now");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch recent symptoms for personalized quick options
  const { data: recentSymptoms = [] } = useQuery<string[]>({
    queryKey: ["/api/symptoms/recent"],
    enabled: isOpen // Only fetch when dialog is open
  });

  // Generate time options from yesterday midnight to current hour
  const generateTimeOptions = (): Array<{ value: string; label: string }> => {
    const options: Array<{ value: string; label: string }> = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    // Start from yesterday midnight
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 1);
    startTime.setHours(0, 0, 0, 0);
    
    // End at current hour
    const endTime = new Date();
    endTime.setHours(currentHour, 0, 0, 0);
    
    // Generate hourly options
    const current = new Date(startTime);
    while (current <= endTime) {
      const isToday = current.toDateString() === now.toDateString();
      const isYesterday = current.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
      
      let dayLabel = '';
      if (isToday) dayLabel = 'Today';
      else if (isYesterday) dayLabel = 'Yesterday';
      
      const timeLabel = formatHour(current.getHours());
      const label = `${dayLabel} ${timeLabel}`;
      
      options.push({
        value: current.toISOString(),
        label: label
      });
      
      // Move to next hour
      current.setHours(current.getHours() + 1);
    }
    
    return options;
  };

  // Format hour for display (12-hour format)
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  // Helper function to get the timestamp based on selected options
  const getSelectedTimestamp = (): Date => {
    if (selectedTimeOption === 'now') {
      return new Date();
    }
    return new Date(selectedTimeOption);
  };

  // Check if we're using time selection (not "now")
  const isUsingTimeSelection = selectedTimeOption !== 'now';
  
  // Get available time options
  const timeOptions = generateTimeOptions().reverse();

  const addSymptomMutation = useMutation({
    mutationFn: async (symptomEntry: InsertSymptomEntry) => {
      const response = await apiRequest("POST", "/api/symptoms", symptomEntry);
      return response.json();
    },
    onSuccess: () => {
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms/recent"] });
      queryClient.invalidateQueries({ queryKey: [`/api/timeline/${today}`] });
      queryClient.invalidateQueries({ predicate: (query) => !!query.queryKey[0]?.toString().startsWith('/api/timeline') });
      setIsOpen(false);
      resetForm();
      toast({
        title: "Reaction recorded! ✏️",
      });
    },
    onError: () => {
      toast({
        title: "Failed to log symptom",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSymptomName("");
    setSeverity(1);
    setSelectedTimeOption("now");
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
      timestamp: getSelectedTimestamp(),
    });
  };

  const defaultTrigger = (
    <Button variant="outline" className="text-lab-red border-lab-red/20 hover:bg-lab-red/5 font-mono">
      🧪 Log Reaction
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
            <Label htmlFor="symptom-name" className="font-mono text-sm">REACTION TYPE</Label>
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
                <p className="text-xs text-lab-purple font-mono mb-2">⚡ Recent Reactions</p>
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
            <Label htmlFor="severity" className="font-mono text-sm">INTENSITY_SCALE</Label>
            <div>
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
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {severity === 1 && "Mild"}
                {severity === 2 && "Light"}
                {severity === 3 && "Moderate"}
                {severity === 4 && "Strong"}
                {severity === 5 && "Severe"}
              </div>
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-lab-purple" />
              <span className="text-sm font-medium text-gray-700">Started since...</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Now Button */}
              <button
                type="button"
                onClick={() => setSelectedTimeOption('now')}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeOption === 'now'
                    ? 'bg-lab-red text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid="button-symptom-time-now"
              >
                Now
              </button>

              {/* Combined Past Time Dropdown */}
              <div className="relative">
                <select
                  value={selectedTimeOption === 'now' ? '' : selectedTimeOption}
                  onChange={(e) => setSelectedTimeOption(e.target.value as TimeOption)}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium appearance-none cursor-pointer focus:outline-none transition-colors ${
                    isUsingTimeSelection
                      ? 'bg-lab-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:bg-gray-200'
                  }`}
                  data-testid="select-symptom-past-time"
                >
                  <option value="" disabled>In the Past</option>
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className={`absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                  isUsingTimeSelection ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!symptomName.trim() || addSymptomMutation.isPending}
            className="w-full science-gradient text-white font-mono"
            data-testid="button-submit-symptom"
          >
            {addSymptomMutation.isPending ? "PROCESSING..." : "Record Data"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
