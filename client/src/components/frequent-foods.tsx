import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FoodEntry, InsertFoodEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Utensils, TrendingUp } from "lucide-react";

const foodIcons = [
  "🍞", "🍎", "🧀", "☕", "🥛", "🥜", "🥗", "🍌"
];

export default function FrequentFoods() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: frequentFoods, isLoading } = useQuery<FoodEntry[]>({
    queryKey: ["/api/foods", "frequent"],
  });

  const addFoodMutation = useMutation({
    mutationFn: async (foodEntry: InsertFoodEntry) => {
      const response = await apiRequest("POST", "/api/foods", foodEntry);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/foods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/foods", "frequent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeline"] });
      toast({
        title: "Food logged successfully!",
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

  const handleFoodClick = (foodName: string) => {
    addFoodMutation.mutate({
      foodName,
      timestamp: new Date(),
      category: "frequent"
    });
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Lab Favorites</h2>
          <span className="text-sm text-gray-500">Most logged</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl lab-shadow animate-pulse">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-8" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Lab Favorites</h2>
        <span className="text-sm text-gray-500">Most logged</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {frequentFoods?.slice(0, 6).map((food, index) => (
          <button
            key={food.id}
            className="bg-white p-4 rounded-2xl lab-shadow hover:lab-shadow-strong transition-all active:scale-95 border border-lab-blue/10 hover:border-lab-blue/20"
            onClick={() => handleFoodClick(food.foodName)}
            disabled={addFoodMutation.isPending}
            data-testid={`button-frequent-food-${index}`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 science-gradient rounded-full flex items-center justify-center bubble-animation`} 
                   style={{ animationDelay: `${index * 0.5}s` }}>
                <span className="text-xl">
                  {foodIcons[index % foodIcons.length]}
                </span>
              </div>
              <span className="font-medium text-sm text-center" data-testid={`text-food-name-${index}`}>
                {food.foodName}
              </span>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <TrendingUp size={12} className="text-lab-blue" />
                <span data-testid={`text-food-count-${index}`}>{food.logCount || 0}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
