import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserStats } from "@shared/schema";

export function useStreak() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const updateStreak = useMutation({
    mutationFn: async (updates: Partial<UserStats>) => {
      const response = await apiRequest("PATCH", "/api/stats", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const checkStreakForToday = () => {
    if (!stats?.lastLogDate) return;
    
    const today = new Date();
    const lastLog = new Date(stats.lastLogDate);
    const daysDiff = Math.floor((today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Already logged today, no change needed
      return;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      updateStreak.mutate({
        currentStreak: stats.currentStreak + 1,
        longestStreak: Math.max(stats.longestStreak, stats.currentStreak + 1),
        lastLogDate: today
      });
    } else {
      // Streak broken, reset to 1
      updateStreak.mutate({
        currentStreak: 1,
        lastLogDate: today
      });
    }
  };

  return {
    stats,
    isLoading,
    checkStreakForToday,
    updateStreak: updateStreak.mutate
  };
}
