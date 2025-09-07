import { useQuery, useMutation } from "@tanstack/react-query";
import { FoodEntry, SymptomEntry } from "@shared/schema";
import { Utensils, AlertTriangle, Clock, Trash2 } from "lucide-react";
import SymptomLogger from "./symptom-logger";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getFoodCategory, getCategoryIcon } from "@/lib/food-database";

type TimelineEntry = (FoodEntry | SymptomEntry) & {
  type?: "food" | "symptom";
};

function isSymptomEntry(entry: FoodEntry | SymptomEntry): entry is SymptomEntry {
  return 'severity' in entry;
}

export default function TodayLog() {
  const today = new Date().toISOString().split('T')[0];
  const { toast } = useToast();
  
  const { data: todayEntries, isLoading } = useQuery<TimelineEntry[]>({
    queryKey: [`/api/timeline/${today}`],
    enabled: !!localStorage.getItem('auth_token'), // Only run when authenticated
    retry: false,
    staleTime: 0, // Always fresh data for real-time updates
    select: (data) => {
    return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },
  });

  const deleteFoodMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/foods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/timeline/${today}`] });
      toast({ 
        title: "Food entry deleted", 
        description: "The food log has been removed successfully." 
      });
    },
    onError: () => {
      toast({ 
        title: "Delete failed", 
        description: "Failed to delete food entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  const deleteSymptomMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/symptoms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/timeline/${today}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms/recent"] });
      toast({ 
        title: "Symptom entry deleted", 
        description: "The symptom log has been removed successfully." 
      });
    },
    onError: () => {
      toast({ 
        title: "Delete failed", 
        description: "Failed to delete symptom entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDelete = (entry: TimelineEntry) => {
    const isSymptom = isSymptomEntry(entry);
    if (isSymptom) {
      deleteSymptomMutation.mutate(entry.id);
    } else {
      deleteFoodMutation.mutate(entry.id);
    }
  };

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

  const getTimePeriod = (timestamp: Date | string): 'morning' | 'afternoon' | 'evening' => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    
    if (hours < 12) return 'morning';
    if (hours < 18) return 'afternoon';
    return 'evening';
  };

  const groupEntriesByTimePeriod = (entries: TimelineEntry[]) => {
    const grouped = {
      morning: [] as TimelineEntry[],
      afternoon: [] as TimelineEntry[],
      evening: [] as TimelineEntry[]
    };

    entries.forEach(entry => {
      const period = getTimePeriod(entry.timestamp);
      grouped[period].push(entry);
    });

    // Sort entries within each period chronologically
    Object.values(grouped).forEach(periodEntries => {
      periodEntries.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });

    return grouped;
  };

  const TimePeriodSection = ({ 
    title, 
    entries, 
    icon 
  }: { 
    title: string; 
    entries: TimelineEntry[]; 
    icon: string;
  }) => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-bold text-gray-700">{title}</h3>
        <span className="text-sm text-gray-500">({entries.length} entries)</span>
      </div>
      
      {entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map((entry, index) => {
            const isSymptom = isSymptomEntry(entry);
            const borderColor = isSymptom ? "border-lab-red" : "border-lab-green";
            const iconBgColor = isSymptom ? "bg-lab-red/10" : "bg-lab-green/10";
            const iconColor = isSymptom ? "text-lab-red" : "text-lab-green";
            
            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl p-2 lab-shadow border-l-4 ${borderColor}`}
                data-testid={`entry-${title.toLowerCase()}-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center mt-1`}>
                      {isSymptom ? (
                        <AlertTriangle className={iconColor} size={16} />
                      ) : (() => {
                        const category = getFoodCategory((entry as FoodEntry).foodName);
                        const IconComponent = getCategoryIcon(category);
                        return <IconComponent className={iconColor} size={16} />;
                      })()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800" data-testid={`text-entry-name-${title.toLowerCase()}-${index}`}>
                        {isSymptom ? entry.symptomName : (entry as FoodEntry).foodName}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock size={12} />
                          <span className="font-mono" data-testid={`text-entry-time-${title.toLowerCase()}-${index}`}>
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
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
                  <button
                    onClick={() => handleDelete(entry)}
                    disabled={deleteFoodMutation.isPending || deleteSymptomMutation.isPending}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    data-testid={`button-delete-${title.toLowerCase()}-${index}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400">
          <p className="text-sm">No entries logged yet</p>
        </div>
      )}
    </div>
  );

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

  const groupedEntries = todayEntries ? groupEntriesByTimePeriod(todayEntries) : {
    morning: [],
    afternoon: [],
    evening: []
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">📓 Today's Data</h2>
        <SymptomLogger />
      </div>
      
      {todayEntries && todayEntries.length > 0 ? (
        <div>
          <TimePeriodSection 
            title="Morning" 
            entries={groupedEntries.morning} 
            icon="⏰"
          />
          <TimePeriodSection 
            title="Afternoon" 
            entries={groupedEntries.afternoon} 
            icon="☀️"
          />
          <TimePeriodSection 
            title="Evening" 
            entries={groupedEntries.evening} 
            icon="🌙"
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-500 mb-4">No data points recorded yet!</p>
          <p className="text-sm text-gray-400">Start collecting data to begin your food experiment!</p>
        </div>
      )}
    </section>
  );
}
