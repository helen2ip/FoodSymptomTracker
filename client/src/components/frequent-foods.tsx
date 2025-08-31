import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FoodEntry, InsertFoodEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Apple, Carrot, Wheat, Milk, Fish, Nut, Coffee, 
  Pizza, ChefHat, Utensils 
} from "lucide-react";
import { foodCategories } from "@/lib/food-database";

// Function to determine food category
function getFoodCategory(foodName: string): string {
  const lowerFoodName = foodName.toLowerCase();
  
  for (const [category, foods] of Object.entries(foodCategories)) {
    if (foods.some(food => food.toLowerCase() === lowerFoodName)) {
      return category;
    }
  }
  
  // Fallback for foods not in our database
  return 'unknown';
}

// Category to icon mapping
function getCategoryIcon(category: string) {
  switch (category) {
    case 'fruits':
      return Apple;
    case 'vegetables':
      return Carrot;
    case 'grains':
      return Wheat;
    case 'dairy':
      return Milk;
    case 'proteins':
      return Fish;
    case 'nuts_seeds':
      return Nut;
    case 'beverages':
      return Coffee;
    case 'processed_foods':
      return Pizza;
    case 'condiments_spices':
      return ChefHat;
    default:
      return Utensils;
  }
}

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
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ["/api/foods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/foods", "frequent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timeline", today] });
      toast({
        title: "Specimen logged! 🧪",
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
      timestamp: new Date()
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
          {[...Array(8)].map((_, i) => (
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
        <h2 className="text-lg font-bold text-gray-800">🧪 Quick Add Specimens</h2>
        <span className="text-sm text-lab-purple font-medium">Your go-to foods</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {frequentFoods?.slice(0, 8).map((food, index) => (
          <button
            key={food.id}
            className="bg-white p-4 rounded-2xl lab-shadow hover:lab-shadow-strong transition-all active:scale-95 border border-lab-purple/20 hover:border-lab-purple/40 hover:bg-lab-purple/5"
            onClick={() => handleFoodClick(food.foodName)}
            disabled={addFoodMutation.isPending}
            data-testid={`button-frequent-food-${index}`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 bg-gradient-to-br from-lab-purple to-lab-blue rounded-full flex items-center justify-center bubble-animation shadow-lg`} 
                   style={{ animationDelay: `${index * 0.5}s` }}>
                {(() => {
                  const category = getFoodCategory(food.foodName);
                  const IconComponent = getCategoryIcon(category);
                  return <IconComponent className="w-6 h-6 text-white" />;
                })()}
              </div>
              <span className="font-medium text-sm text-center" data-testid={`text-food-name-${index}`}>
                {food.foodName}
              </span>
              <div className="flex items-center space-x-1 text-xs text-lab-purple">
                <span className="font-mono bg-lab-purple/10 px-2 py-1 rounded-full">×{food.logCount || 0}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
