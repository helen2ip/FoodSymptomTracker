import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FoodEntry, SymptomEntry } from "@shared/schema";
import { Utensils, AlertTriangle, Clock, Calendar, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getFoodCategory, getCategoryIcon } from "@/lib/food-database";

type TimelineEntry = (FoodEntry | SymptomEntry) & {
  type?: "food" | "symptom";
};

function isSymptomEntry(entry: FoodEntry | SymptomEntry): entry is SymptomEntry {
  return 'severity' in entry;
}

export default function Timeline() {
  // Default to today's date
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const { toast } = useToast();
  
  const { data: timelineEntries, isLoading } = useQuery<TimelineEntry[]>({
    queryKey: [`/api/timeline/${selectedDate}`],
    enabled: !!selectedDate && !!localStorage.getItem('auth_token'), // Only run when we have a date and auth token
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });

  const deleteFoodMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/foods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/timeline/${selectedDate}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/foods/frequent"] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/timeline/${selectedDate}`] });
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

  const formatDateTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getSeverityDots = (severity: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${
          i < severity ? "bg-lab-red" : "bg-gray-200"
        }`}
      />
    ));
  };

  const groupEntriesByDate = (entries: TimelineEntry[]) => {
    const grouped = entries.reduce((acc, entry) => {
      const date = new Date(entry.timestamp).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, TimelineEntry[]>);

    return Object.entries(grouped).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  };

  const todayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const clearFilter = () => {
    setSelectedDate("all");
  };

  if (isLoading) {
    return (
      <div className="pb-24">
        <header className="science-gradient safe-area-top px-6 py-4 text-white">
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Clock size={24} />
            <span>Lab Timeline</span>
          </h1>
        </header>

        <main className="px-6 py-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 lab-shadow animate-pulse">
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
        </main>
      </div>
    );
  }

  const groupedEntries = timelineEntries ? groupEntriesByDate(timelineEntries) : [];

  return (
    <div className="pb-24">
      <header className="science-gradient safe-area-top px-6 py-4 text-white">
        <h1 className="text-xl font-bold flex items-center space-x-2 mb-4">
          <Clock size={24} />
          <span>Lab Timeline</span>
        </h1>
        
        {/* Filters */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={selectedDate === "all" ? "secondary" : "default"}
            onClick={selectedDate === "all" ? todayFilter : clearFilter}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            data-testid="button-filter-today"
          >
            <Filter size={14} className="mr-1" />
            {selectedDate === "all" ? "Today Only" : "Show All"}
          </Button>
          
          {timelineEntries && (
            <span className="text-sm opacity-80">
              {timelineEntries.length} entries
            </span>
          )}
        </div>
      </header>

      <main className="px-6 py-6">
        {groupedEntries.length > 0 ? (
          <div className="space-y-6">
            {groupedEntries.map(([dateString, entries]) => {
              const date = new Date(dateString);
              const isToday = date.toDateString() === new Date().toDateString();
              const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
              
              let dateLabel = date.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              });
              
              if (isToday) dateLabel = "Today";
              else if (isYesterday) dateLabel = "Yesterday";

              return (
                <div key={dateString}>
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar size={16} className="text-lab-blue" />
                    <h2 className="font-bold text-gray-800">{dateLabel}</h2>
                    <span className="text-sm text-gray-500">({entries.length} entries)</span>
                  </div>
                  
                  <div className="space-y-3">
                    {entries.map((entry, index) => {
                      const isSymptom = isSymptomEntry(entry);
                      const borderColor = isSymptom ? "border-lab-red" : "border-lab-green";
                      const iconBgColor = isSymptom ? "bg-lab-red/10" : "bg-lab-green/10";
                      const iconColor = isSymptom ? "text-lab-red" : "text-lab-green";
                      const tagColor = isSymptom ? "bg-lab-red/10 text-lab-red" : "bg-lab-green/10 text-lab-green";
                      const { time } = formatDateTime(entry.timestamp);
                      
                      return (
                        <div
                          key={entry.id}
                          className={`bg-white rounded-2xl p-2 lab-shadow border-l-4 ${borderColor}`}
                          data-testid={`timeline-entry-${index}`}
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
                                <h3 className="font-medium text-gray-800" data-testid={`text-timeline-entry-name-${index}`}>
                                  {isSymptom ? entry.symptomName : (entry as FoodEntry).foodName}
                                </h3>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                                    <Clock size={12} />
                                    <span className="font-mono">{time}</span>
                                  </div>
                                </div>
                                {isSymptom && (
                                  <div className="flex items-center space-x-1 mt-2">
                                    {getSeverityDots(entry.severity)}
                                    <span className="text-xs text-gray-500 ml-2">
                                      Severity {entry.severity}/5
                                    </span>
                                  </div>
                                )}
                                {isSymptom && entry.notes && (
                                  <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(entry)}
                              disabled={deleteFoodMutation.isPending || deleteSymptomMutation.isPending}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                              data-testid={`button-delete-timeline-${index}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Timeline Entries</h3>
            <p className="text-gray-500 mb-6">
              {selectedDate === "all"
                ? "Start logging foods and symptoms to see your timeline"
                : "No entries found for the selected date" 
              }
            </p>
            {selectedDate !== "all" && (
              <Button onClick={clearFilter} variant="outline">
                View All Entries
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
