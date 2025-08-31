import { useState, useRef, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { searchFoods } from "@/lib/food-database";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertFoodEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function FoodSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addFoodMutation = useMutation({
    mutationFn: async (foodEntry: InsertFoodEntry) => {
      const response = await apiRequest("POST", "/api/foods", foodEntry);
      return response.json();
    },
    onSuccess: () => {
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ["/api/foods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/foods", "frequent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeline", today] });
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
    addFoodMutation.mutate({
      foodName,
      timestamp: new Date()
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleAddFood(query.trim());
    }
  };

  return (
    <section className="py-6">
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
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-lab-purple to-lab-blue rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
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
