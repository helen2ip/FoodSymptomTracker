import { useQuery } from "@tanstack/react-query";
import { UserStats } from "@shared/schema";
import { Trophy, Award, Target, Flame, Calendar, TrendingUp } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  category: "streak" | "logging" | "discovery" | "consistency";
}

export default function Achievements() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const achievements: Achievement[] = [
    // Streak achievements
    {
      id: "first-day",
      title: "Lab Rookie",
      description: "Complete your first day of logging",
      icon: "🧪",
      unlocked: (stats?.currentStreak || 0) >= 1,
      category: "streak"
    },
    {
      id: "week-explorer",
      title: "Week Explorer",
      description: "Maintain a 7-day logging streak",
      icon: "🔥",
      unlocked: (stats?.longestStreak || 0) >= 7,
      progress: Math.min(stats?.currentStreak || 0, 7),
      maxProgress: 7,
      category: "streak"
    },
    {
      id: "streak-master",
      title: "Streak Master",
      description: "Achieve a 30-day logging streak",
      icon: "⚡",
      unlocked: (stats?.longestStreak || 0) >= 30,
      progress: Math.min(stats?.longestStreak || 0, 30),
      maxProgress: 30,
      category: "streak"
    },

    // Logging achievements
    {
      id: "food-detective",
      title: "Food Detective",
      description: "Log 50 different foods",
      icon: "🕵️",
      unlocked: (stats?.totalFoodsLogged || 0) >= 50,
      progress: Math.min(stats?.totalFoodsLogged || 0, 50),
      maxProgress: 50,
      category: "logging"
    },
    {
      id: "symptom-tracker",
      title: "Symptom Tracker",
      description: "Log 20 symptoms with details",
      icon: "📊",
      unlocked: (stats?.totalSymptomsLogged || 0) >= 20,
      progress: Math.min(stats?.totalSymptomsLogged || 0, 20),
      maxProgress: 20,
      category: "logging"
    },
    {
      id: "data-scientist",
      title: "Data Scientist",
      description: "Log 100 total entries",
      icon: "👨‍🔬",
      unlocked: ((stats?.totalFoodsLogged || 0) + (stats?.totalSymptomsLogged || 0)) >= 100,
      progress: Math.min((stats?.totalFoodsLogged || 0) + (stats?.totalSymptomsLogged || 0), 100),
      maxProgress: 100,
      category: "logging"
    },

    // Discovery achievements
    {
      id: "pattern-finder",
      title: "Pattern Finder",
      description: "Discover your first correlation",
      icon: "💡",
      unlocked: stats?.achievements?.includes("Pattern Finder") || false,
      category: "discovery"
    },
    {
      id: "correlation-expert",
      title: "Correlation Expert",
      description: "Find 5 high-confidence correlations",
      icon: "🎯",
      unlocked: stats?.achievements?.includes("Correlation Expert") || false,
      category: "discovery"
    },

    // Consistency achievements
    {
      id: "weekend-warrior",
      title: "Weekend Warrior",
      description: "Log entries on weekends",
      icon: "🎪",
      unlocked: stats?.achievements?.includes("Weekend Warrior") || false,
      category: "consistency"
    }
  ];

  const categoryIcons = {
    streak: Flame,
    logging: Calendar,
    discovery: Target,
    consistency: TrendingUp
  };

  const categoryColors = {
    streak: "lab-amber",
    logging: "lab-blue",
    discovery: "lab-green",
    consistency: "lab-red"
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const totalUnlocked = achievements.filter(a => a.unlocked).length;

  if (isLoading) {
    return (
      <div className="pb-24">
        <header className="science-gradient safe-area-top px-6 py-4 text-white">
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Trophy size={24} />
            <span>Lab Awards</span>
          </h1>
        </header>

        <main className="px-6 py-6">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="grid grid-cols-1 gap-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="bg-white rounded-2xl p-4 lab-shadow animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <header className="science-gradient safe-area-top px-6 py-4 text-white relative overflow-hidden">
        {/* Scientific background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-4 w-3 h-3 bg-white rounded-full" />
          <div className="absolute top-6 left-8 w-2 h-2 bg-white rounded-full" />
          <div className="absolute top-8 right-6 w-2 h-2 bg-white rounded-full" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-xl font-bold flex items-center space-x-2 mb-2">
            <Trophy size={24} />
            <span>Lab Awards</span>
          </h1>
          <div className="flex items-center space-x-4">
            <p className="text-sm opacity-90">
              {totalUnlocked} of {achievements.length} achievements unlocked
            </p>
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(totalUnlocked / achievements.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-6">
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
          const colorClass = categoryColors[category as keyof typeof categoryColors];
          
          return (
            <section key={category} className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <CategoryIcon className={`text-${colorClass}`} size={20} />
                <h2 className="text-lg font-bold text-gray-800 capitalize">
                  {category === "streak" ? "Streak Achievements" : 
                   category === "logging" ? "Logging Milestones" :
                   category === "discovery" ? "Discovery Awards" :
                   "Consistency Rewards"}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {categoryAchievements.map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      achievement.unlocked
                        ? `bg-gradient-to-r from-${colorClass}/10 to-${colorClass}/5 border-${colorClass}/20 lab-shadow`
                        : "bg-gray-50 border-gray-200"
                    }`}
                    data-testid={`achievement-${achievement.id}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`text-3xl ${achievement.unlocked ? "" : "grayscale opacity-50"}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className={`font-bold ${
                            achievement.unlocked ? "text-gray-800" : "text-gray-500"
                          }`}>
                            {achievement.title}
                          </h3>
                          {achievement.unlocked && (
                            <div className={`w-6 h-6 bg-${colorClass} rounded-full flex items-center justify-center achievement-glow`}>
                              <Award className="text-white" size={14} />
                            </div>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${
                          achievement.unlocked ? "text-gray-600" : "text-gray-400"
                        }`}>
                          {achievement.description}
                        </p>
                        
                        {achievement.maxProgress && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Progress</span>
                              <span>{achievement.progress || 0} / {achievement.maxProgress}</span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className={`bg-${colorClass} rounded-full h-2 transition-all duration-300`}
                                style={{ 
                                  width: `${Math.min(((achievement.progress || 0) / achievement.maxProgress) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Stats Summary */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Lab Statistics</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 lab-shadow text-center">
              <div className="text-2xl font-bold text-lab-blue mb-1">
                {stats?.currentStreak || 0}
              </div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 lab-shadow text-center">
              <div className="text-2xl font-bold text-lab-green mb-1">
                {stats?.longestStreak || 0}
              </div>
              <div className="text-sm text-gray-600">Longest Streak</div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 lab-shadow text-center">
              <div className="text-2xl font-bold text-lab-amber mb-1">
                {stats?.totalFoodsLogged || 0}
              </div>
              <div className="text-sm text-gray-600">Foods Logged</div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 lab-shadow text-center">
              <div className="text-2xl font-bold text-lab-red mb-1">
                {stats?.totalSymptomsLogged || 0}
              </div>
              <div className="text-sm text-gray-600">Symptoms Logged</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
