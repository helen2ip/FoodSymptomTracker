import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FoodEntry, InsertFoodEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Apple, Carrot, Wheat, Milk, Atom, Nut, Coffee, 
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
      return Atom;
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

// Category to color mapping
function getCategoryColors(category: string) {
  switch (category) {
    case 'fruits':
      return 'from-red-400 to-pink-500'; // Red/pink for fruits
    case 'vegetables':
      return 'from-green-400 to-emerald-500'; // Green for vegetables
    case 'grains':
      return 'from-amber-300 to-orange-400'; // Golden/amber for grains
    case 'dairy':
      return 'from-blue-300 to-violet-400'; // Blue for dairy
    case 'proteins':
      return 'from-purple-500 to-violet-600'; // Purple for proteins
    case 'nuts_seeds':
      return 'from-yellow-600 to-amber-700'; // Yellow/brown for nuts
    case 'beverages':
      return 'from-teal-500 to-blue-600'; // Teal for beverages
    case 'processed_foods':
      return 'from-orange-500 to-red-600'; // Orange/red for processed
    case 'condiments_spices':
      return 'from-rose-400 to-pink-600'; // Rose for condiments
    default:
      return 'from-gray-400 to-slate-500'; // Gray fallback
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
      queryClient.invalidateQueries({ queryKey: [`/api/timeline/${today}`] });
      queryClient.invalidateQueries({ predicate: (query) => !!query.queryKey[0]?.toString().startsWith('/api/timeline') });
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

  // Don't show the section if there are no frequent foods
  if (!frequentFoods || frequentFoods.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">⚡ Quick Add</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {frequentFoods?.slice(0, 6).map((food, index) => (
          <button
            key={food.id}
            className="bg-white p-1 rounded-2xl lab-shadow hover:lab-shadow-strong transition-all active:scale-95 border border-lab-purple/20 hover:border-lab-purple/40 hover:bg-lab-purple/5"
            onClick={() => handleFoodClick(food.foodName)}
            disabled={addFoodMutation.isPending}
            data-testid={`button-frequent-food-${index}`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColors(getFoodCategory(food.foodName))} rounded-full flex items-center justify-center bubble-animation shadow-lg`} 
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
