import { Plus } from "lucide-react";
import LabHeader from "@/components/lab-header";
import FoodSearch from "@/components/food-search";
import FrequentFoods from "@/components/frequent-foods";
import TodayLog from "@/components/today-log";
import SymptomLogger from "@/components/symptom-logger";

export default function Home() {
  const handleQuickAdd = () => {
    // Focus on search input
    const searchInput = document.querySelector('input[data-testid="input-food-search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  return (
    <div className="pb-24">
      <LabHeader />
      
      <main className="px-6">
        <FoodSearch />
        <FrequentFoods />
        <TodayLog />
        
        {/* Lab Results Preview */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">🚧 Recent Results</h2>
            <div className="flex items-center space-x-1 text-lab-amber">
              <span className="text-sm font-mono bg-lab-amber/10 px-2 py-1 rounded-full">2 NEW</span>
            </div>
          </div>
          
          {/* Correlation card */}
          <div className="bg-gradient-to-br from-lab-amber/10 to-lab-amber/20 rounded-2xl p-5 border border-lab-amber/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-lab-amber rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🚧</span>
                </div>
                <span className="font-bold text-gray-800">Experiment Result</span>
              </div>
              <span className="text-xs bg-lab-amber/20 text-lab-amber px-2 py-1 rounded-full font-medium">
                85% Match
              </span>
            </div>
            
            <p className="text-gray-700 mb-4">
              <strong>Hypothesis Confirmed!</strong> Skin reactions detected 2-3 hours after dairy consumption. 
              Pattern observed in 4/5 test runs.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-lab-amber rounded-full" />
                  <span className="text-sm text-gray-600">Dairy</span>
                </div>
                <span className="text-gray-400 text-sm">→</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-lab-red rounded-full" />
                  <span className="text-sm text-gray-600">Skin reaction</span>
                </div>
              </div>
              
              <button 
                className="text-lab-amber text-sm font-medium"
                data-testid="button-view-correlation"
              >
                Details →
              </button>
            </div>
          </div>
          
          {/* Insight suggestion */}
          <div className="mt-3 bg-white rounded-2xl p-4 lab-shadow border border-lab-blue/10">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-lab-blue/10 rounded-full flex items-center justify-center">
                <span className="text-lab-blue text-sm">🚧</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Next Test</h3>
                <p className="text-sm text-gray-600">
                  Eliminate dairy for 3 days to verify hypothesis. Let's run this experiment!
                </p>
                <button 
                  className="mt-2 text-lab-blue text-sm font-mono font-bold bg-lab-blue/10 px-3 py-1 rounded-full"
                  data-testid="button-start-experiment"
                >
                  Start test →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 max-w-sm mx-auto">
        <SymptomLogger 
          trigger={
            <button
              className="w-14 h-14 lab-amber-gradient rounded-full lab-shadow-strong flex items-center justify-center text-white text-xl hover:scale-105 transition-transform active:scale-95"
              onClick={handleQuickAdd}
              data-testid="button-floating-action"
            >
              🧪
            </button>
          }
        />
      </div>
    </div>
  );
}
