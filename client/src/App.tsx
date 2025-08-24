import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Timeline from "@/pages/timeline";
import Insights from "@/pages/insights";
import Achievements from "@/pages/achievements";
import Settings from "@/pages/settings";
import BottomNav from "@/components/bottom-nav";

function Router() {
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
