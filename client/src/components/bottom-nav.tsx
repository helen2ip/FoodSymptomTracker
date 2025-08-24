import { Link, useLocation } from "wouter";
import { Home, Clock, TrendingUp, Trophy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Lab", testId: "nav-home" },
  { path: "/timeline", icon: Clock, label: "Data", testId: "nav-timeline" },
  { path: "/insights", icon: TrendingUp, label: "Results", testId: "nav-insights", hasNotification: true },
  { path: "/achievements", icon: Trophy, label: "Awards", testId: "nav-achievements" },
  { path: "/settings", icon: Settings, label: "Config", testId: "nav-settings" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 safe-area-bottom z-50">
      <div className="flex justify-around py-2">
        {navItems.map(({ path, icon: Icon, label, testId, hasNotification }) => {
          const isActive = location === path;
          
          return (
            <Link key={path} href={path}>
              <button
                className={cn(
                  "flex flex-col items-center space-y-1 p-3 transition-colors relative",
                  isActive ? "text-lab-blue" : "text-gray-400 hover:text-lab-blue"
                )}
                data-testid={testId}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
                
                {hasNotification && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-lab-amber rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">2</span>
                  </div>
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
