import { FlaskConical, Flame, Trophy } from "lucide-react";
import { useStreak } from "@/hooks/use-streak";

export default function LabHeader() {
  const { stats, isLoading } = useStreak();

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FlaskConical size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Food Lab</h1>
              <p className="text-sm opacity-90">Day {stats?.currentStreak || 0} Experiment</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              <Flame className="text-lab-amber" size={16} />
              <span className="font-mono text-sm" data-testid="text-streak-count">
                {stats?.currentStreak || 0}
              </span>
            </div>
            <p className="text-xs opacity-80">Day streak</p>
          </div>
        </div>
        
        {/* Progress beakers */}
        <div className="flex justify-between items-end mb-2">
          <div className="flex space-x-2">
            <div className="flex flex-col items-center">
              <div className="w-6 h-8 bg-white/30 rounded-b-full relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-lab-green rounded-b-full" />
              </div>
              <span className="text-xs mt-1">Foods</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-8 bg-white/30 rounded-b-full relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-lab-red rounded-b-full" />
              </div>
              <span className="text-xs mt-1">Symptoms</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-8 bg-white/30 rounded-b-full relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-5 bg-lab-amber rounded-b-full" />
              </div>
              <span className="text-xs mt-1">Insights</span>
            </div>
          </div>
          
          {/* Achievement notification */}
          {stats?.achievements && stats.achievements.length > 0 && (
            <div className="achievement-glow bg-lab-amber/20 px-3 py-1 rounded-full">
              <div className="flex items-center space-x-1">
                <Trophy className="text-lab-amber" size={14} />
                <span className="text-xs font-medium">
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
