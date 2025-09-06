import { useState, useRef, useEffect } from "react";
import { Search, Plus, Clock, ChevronDown } from "lucide-react";
import { searchFoods } from "@/lib/food-database";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertFoodEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type TimeOption = "now" | "today" | "yesterday" | "2-days-ago";

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
    return saved ? parseInt(saved) : 9; // Default to 9 AM
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
    if (selectedTimeOption === 'today') {
      // Keep today's date
    } else if (selectedTimeOption === 'yesterday') {
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

  // Format date option for display
  const formatDateOption = (option: TimeOption): string => {
    switch (option) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case '2-days-ago': return '2 days ago';
      default: return option;
    }
  };

  // Check if we're using time selection (not "now")
  const isUsingTimeSelection = selectedTimeOption !== 'now';

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
        
        {/* Time Selection */}
        <div className="grid grid-cols-3 gap-2">
          {/* Now Button */}
          <button
            onClick={() => setSelectedTimeOption('now')}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selectedTimeOption === 'now'
                ? 'bg-lab-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            data-testid="button-time-now"
          >
            Now
          </button>

          {/* Date Dropdown */}
          <div className="relative">
            <select
              value={selectedTimeOption === 'now' ? 'today' : selectedTimeOption}
              onChange={(e) => setSelectedTimeOption(e.target.value as TimeOption)}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium appearance-none cursor-pointer focus:outline-none transition-colors ${
                isUsingTimeSelection
                  ? 'bg-lab-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:bg-gray-200'
              }`}
              data-testid="select-date"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="2-days-ago">2 days ago</option>
            </select>
            <ChevronDown size={14} className={`absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none ${
              isUsingTimeSelection ? 'text-white' : 'text-gray-500'
            }`} />
          </div>

          {/* Hour Dropdown */}
          <div className="relative">
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium appearance-none cursor-pointer focus:outline-none transition-colors ${
                isUsingTimeSelection
                  ? 'bg-lab-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:bg-gray-200'
              }`}
              data-testid="select-hour"
            >
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <option key={hour} value={hour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={`absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none ${
              isUsingTimeSelection ? 'text-white' : 'text-gray-500'
            }`} />
          </div>
        </div>
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
