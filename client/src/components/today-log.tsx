import { useQuery } from "@tanstack/react-query";
import { FoodEntry, SymptomEntry } from "@shared/schema";
import { Utensils, AlertTriangle, Clock } from "lucide-react";
import SymptomLogger from "./symptom-logger";

type TimelineEntry = (FoodEntry | SymptomEntry) & {
  type?: "food" | "symptom";
};

function isSymptomEntry(entry: FoodEntry | SymptomEntry): entry is SymptomEntry {
  return 'severity' in entry;
}

export default function TodayLog() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: todayEntries, isLoading } = useQuery<TimelineEntry[]>({
    queryKey: ["/api/timeline", today],
    queryFn: async () => {
      const response = await fetch(`/api/timeline/${today}`);
      if (!response.ok) throw new Error('Failed to fetch timeline');
      return response.json();
    }
  });

  const formatTime = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSeverityDots = (severity: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${
          i < severity ? "bg-lab-red" : "bg-gray-200"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Today's Lab Log</h2>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-2 lab-shadow animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
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
        <h2 className="text-lg font-bold text-gray-800">📓 Today's Data</h2>
        <SymptomLogger />
      </div>
      
      {todayEntries && todayEntries.length > 0 ? (
        <div className="space-y-3">
          {todayEntries.map((entry, index) => {
            const isSymptom = isSymptomEntry(entry);
            const borderColor = isSymptom ? "border-lab-red" : "border-lab-green";
            const iconBgColor = isSymptom ? "bg-lab-red/10" : "bg-lab-green/10";
            const iconColor = isSymptom ? "text-lab-red" : "text-lab-green";
            const tagColor = isSymptom ? "bg-lab-red/10 text-lab-red" : "bg-lab-green/10 text-lab-green";
            
            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl p-2 lab-shadow border-l-4 ${borderColor}`}
                data-testid={`entry-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center mt-1`}>
                      {isSymptom ? (
                        <AlertTriangle className={iconColor} size={16} />
                      ) : (
                        <Utensils className={iconColor} size={16} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800" data-testid={`text-entry-name-${index}`}>
                        {isSymptom ? entry.symptomName : (entry as FoodEntry).foodName}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock size={12} />
                          <span className="font-mono" data-testid={`text-entry-time-${index}`}>
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${tagColor}`}>
                          {isSymptom ? "Symptom" : "Food"}
                        </span>
                      </div>
                      {isSymptom && (
                        <div className="flex items-center space-x-1 mt-2">
                          {getSeverityDots(entry.severity)}
                          <span className="text-xs text-gray-500 ml-2">
                            {entry.severity === 1 && "Mild"}
                            {entry.severity === 2 && "Light"}
                            {entry.severity === 3 && "Moderate"}
                            {entry.severity === 4 && "Strong"}
                            {entry.severity === 5 && "Severe"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-500 mb-4">No data points recorded yet!</p>
          <p className="text-sm text-gray-400">Start collecting data to begin your food experiment! 🧪</p>
        </div>
      )}
    </section>
  );
}
