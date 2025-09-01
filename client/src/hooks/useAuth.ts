import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useEffect } from "react";

export function useAuth() {
  const queryClient = useQueryClient();

  // Check for fallback login parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login_success');
    const userId = urlParams.get('user_id');
    
    if (loginSuccess === 'true' && userId) {
      console.log('Fallback login detected, setting session for user:', userId);
      // Remove parameters from URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // Set session via API
      apiRequest('POST', '/api/auth/set-session', { userId })
        .then(() => {
          console.log('Fallback session set successfully');
          queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        })
        .catch((error) => {
          console.error('Failed to set fallback session:', error);
        });
    }
  }, [queryClient]);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: 1, // Allow one retry for session establishment
    retryDelay: 500, // Wait 500ms before retry
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}
