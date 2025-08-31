import { FlaskConical, Flame, Trophy, LogOut } from "lucide-react";
import { useStreak } from "@/hooks/use-streak";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function LabHeader() {
  const { stats, isLoading } = useStreak();
  const { user, logout } = useAuth();

  if (isLoading) {
    return <div className="h-32 science-gradient animate-pulse" />;
  }

  return (
    <header className="science-gradient safe-area-top px-6 py-4 text-white relative overflow-hidden">
      {/* Scientific background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 left-4 w-3 h-3 bg-white rounded-full" />
        <div className="absolute top-6 left-8 w-2 h-2 bg-white rounded-full" />
        <div className="absolute top-8 right-6 w-2 h-2 bg-white rounded-full" />
        <div className="absolute bottom-4 right-4 w-3 h-3 bg-white rounded-full" />
      </div>
      
      <div className="relative z-10">
        {/* User Greeting & Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FlaskConical size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                👋 Hello, {user?.firstName}!
              </h1>
              <p className="text-sm opacity-90 font-mono">Experiment #{stats?.currentStreak || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                <Flame className="text-lab-amber" size={16} />
                <span className="font-mono text-sm" data-testid="text-streak-count">
                  {stats?.currentStreak || 0}
                </span>
              </div>
              <p className="text-xs opacity-80 font-mono">STREAK</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 h-auto"
              data-testid="button-logout"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
        
        {/* Progress test tubes */}
        <div className="flex justify-between items-end mb-2">
          <div className="flex space-x-3">
            <div className="flex flex-col items-center">
              <div className="w-5 h-10 bg-white/20 rounded-b-full relative overflow-hidden border border-white/30">
                <div className="absolute bottom-0 left-0 right-0 h-7 bg-lab-green rounded-b-full" />
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/50 rounded-full" />
              </div>
              <span className="text-xs mt-1 font-mono">DATA</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-5 h-10 bg-white/20 rounded-b-full relative overflow-hidden border border-white/30">
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-lab-red rounded-b-full" />
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/50 rounded-full" />
              </div>
              <span className="text-xs mt-1 font-mono">SYMPTOMS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-5 h-10 bg-white/20 rounded-b-full relative overflow-hidden border border-white/30">
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-lab-amber rounded-b-full" />
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/50 rounded-full" />
              </div>
              <span className="text-xs mt-1 font-mono">RESULTS</span>
            </div>
          </div>
          
          {/* Achievement notification */}
          {stats?.achievements && stats.achievements.length > 0 && (
            <div className="achievement-glow bg-lab-amber/20 px-3 py-1 rounded-full border border-lab-amber/30">
              <div className="flex items-center space-x-1">
                <span className="text-lab-amber text-sm">🏆</span>
                <span className="text-xs font-mono font-bold">
                  {stats.achievements[stats.achievements.length - 1]}!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
