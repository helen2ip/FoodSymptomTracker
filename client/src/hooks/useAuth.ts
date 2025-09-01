import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();

  // Check if user has auth token
  const hasAuthToken = !!localStorage.getItem('auth_token');

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: hasAuthToken, // Only fetch if we have a token
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  return {
    user,
    isLoading: hasAuthToken ? isLoading : false,
    isAuthenticated: hasAuthToken && !!user && !error,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}
