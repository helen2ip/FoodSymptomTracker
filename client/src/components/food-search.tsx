import { useState, useRef, useEffect } from "react";
import { Search, Plus, Clock } from "lucide-react";
import { searchFoods } from "@/lib/food-database";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertFoodEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type TimeOption = "now" | "yesterday" | "2-days-ago";

export default function FoodSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Time selection state with persistence
  const [selectedTimeOption, setSelectedTimeOption] = useState<TimeOption>(() => {
    const saved = localStorage.getItem('foodLog_timeOption');
    return (saved as TimeOption) || 'now';
  });
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    const saved = localStorage.getItem('foodLog_hour');
    return saved ? parseInt(saved) : new Date().getHours();
  });

  // Persist time selections
  useEffect(() => {
    localStorage.setItem('foodLog_timeOption', selectedTimeOption);
  }, [selectedTimeOption]);

  useEffect(() => {
    localStorage.setItem('foodLog_hour', selectedHour.toString());
  }, [selectedHour]);

  // Helper function to get the timestamp based on selected options
  const getSelectedTimestamp = (): Date => {
    if (selectedTimeOption === 'now') {
      return new Date();
    }

    const now = new Date();
    const selectedDate = new Date();

    // Set the date based on selection
    if (selectedTimeOption === 'yesterday') {
      selectedDate.setDate(now.getDate() - 1);
    } else if (selectedTimeOption === '2-days-ago') {
      selectedDate.setDate(now.getDate() - 2);
    }

    // Set the selected hour
    selectedDate.setHours(selectedHour, 0, 0, 0);

    return selectedDate;
  };

  // Format hour for display (12-hour format)
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const addFoodMutation = useMutation({
    mutationFn: async (foodEntry: InsertFoodEntry) => {
      const response = await apiRequest("POST", "/api/foods", foodEntry);
      return response.json();
    },
    onSuccess: () => {
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ["/api/foods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/foods", "frequent"] });
      queryClient.invalidateQueries({ queryKey: [`/api/timeline/${today}`] });
      queryClient.invalidateQueries({ predicate: (query) => !!query.queryKey[0]?.toString().startsWith('/api/timeline') });
      setQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
      toast({
        title: "Data point logged! ✏️",
        description: "Added to your experiment timeline",
      });
    },
    onError: () => {
      toast({
        title: "Failed to log food",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (query.length >= 2) {
      const results = searchFoods(query, 5);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleAddFood = (foodName: string) => {
    // First check if there's an exact match in the food database with proper capitalization
    const foodResults = searchFoods(foodName, 50); // Get more results to find exact matches
    const exactMatch = foodResults.find(food => food.toLowerCase() === foodName.toLowerCase());
    
    // Use the properly capitalized version from food database if found
    const normalizedFoodName = exactMatch || foodName;
    
    addFoodMutation.mutate({
      foodName: normalizedFoodName,
      timestamp: getSelectedTimestamp()
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleAddFood(query.trim());
    }
  };

  return (
    <section className="py-6">
      {/* Time Selection Component */}
      <div className="mb-4 bg-white rounded-2xl lab-shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-lab-purple" />
          <span className="text-sm font-medium text-gray-700">When did you consume this?</span>
        </div>
        
        {/* Day Selection */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { value: 'now' as TimeOption, label: 'Now' },
            { value: 'yesterday' as TimeOption, label: 'Yesterday' },
            { value: '2-days-ago' as TimeOption, label: '2 days ago' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedTimeOption(option.value)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeOption === option.value
                  ? 'bg-lab-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid={`button-time-${option.value}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Hour Selection - Only show if not "now" */}
        {selectedTimeOption !== 'now' && (
          <div>
            <span className="text-xs text-gray-600 mb-2 block">Select hour:</span>
            <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto">
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <button
                  key={hour}
                  onClick={() => setSelectedHour(hour)}
                  className={`py-1 px-2 rounded text-xs font-medium transition-colors ${
                    selectedHour === hour
                      ? 'bg-lab-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`button-hour-${hour}`}
                >
                  {formatHour(hour)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="What did you consume?"
          className="w-full pl-12 pr-16 py-4 bg-white rounded-2xl lab-shadow border-2 border-transparent focus:border-lab-purple focus:outline-none text-lg placeholder:text-gray-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          data-testid="input-food-search"
        />
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-lab-green to-lab-blue rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          onClick={() => query.trim() && handleAddFood(query.trim())}
          disabled={!query.trim() || addFoodMutation.isPending}
          data-testid="button-add-food-quick"
        >
          <Plus size={16} className="text-white" />
        </button>
      </div>
      
      {/* Search suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-3 space-y-2 bg-white rounded-xl lab-shadow p-2">
          {suggestions.map((food, index) => (
            <button
              key={index}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
              onClick={() => handleAddFood(food)}
              data-testid={`button-food-suggestion-${index}`}
            >
              <div className="w-8 h-8 bg-lab-purple/10 rounded-full flex items-center justify-center">
                <span className="text-lab-purple text-sm">🧪</span>
              </div>
              <span className="font-medium">{food}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
