import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Timeline from "@/pages/timeline";
import Insights from "@/pages/insights";
import Achievements from "@/pages/achievements";
import Settings from "@/pages/settings";
import LoginForm from "@/components/login-form";
import BottomNav from "@/components/bottom-nav";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-purple to-lab-blue flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading Food Lab...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="max-w-sm mx-auto bg-lab-surface min-h-screen shadow-xl relative">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/timeline" component={Timeline} />
        <Route path="/insights" component={Insights} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
