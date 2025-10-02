import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import LabHeader from "@/components/lab-header";
import FoodSearch from "@/components/food-search";
import TodayLog from "@/components/today-log";
import SymptomLogger from "@/components/symptom-logger";

type TimeOption = "now" | string; // "now" or datetime string

export default function Home() {
  // Lift time selection state up to Home component
  const [selectedTimeOption, setSelectedTimeOption] = useState<TimeOption>(() => {
    const saved = localStorage.getItem('foodLog_timeOption');
    return (saved as TimeOption) || 'now';
  });

  // Persist time selection
  useEffect(() => {
    localStorage.setItem('foodLog_timeOption', selectedTimeOption);
  }, [selectedTimeOption]);

  // Check if we're using time selection (not "now")
  const isUsingTimeSelection = selectedTimeOption !== 'now';


  return (
    <div className="pb-24">
      <LabHeader />
      
      <main className="px-6">
        <FoodSearch 
          selectedTimeOption={selectedTimeOption}
          setSelectedTimeOption={setSelectedTimeOption}
        />
        <TodayLog />
      </main>

    </div>
  );
}
