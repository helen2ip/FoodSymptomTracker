import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const [firstName, setFirstName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    
    setIsSubmitting(true);
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    login(firstName.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-purple/5 via-lab-blue/5 to-lab-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Lab Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-lab-purple to-lab-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FlaskConical className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Food Lab</h1>
          <p className="text-gray-600 font-mono text-sm">
            🔬 Initialize your experiment profile
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 lab-shadow border border-lab-purple/10">
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 font-mono">
                  SCIENTIST_NAME.input
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 border-lab-purple/20 focus:border-lab-purple/40 focus:ring-lab-purple/20"
                  data-testid="input-first-name"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              
              <div className="bg-lab-blue/5 rounded-lg p-3 border border-lab-blue/10">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>Lab Safety Notice:</strong> Only your first name is needed to begin your food sensitivity experiments. No passwords required! 🧪
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!firstName.trim() || isSubmitting}
            className="w-full bg-gradient-to-r from-lab-purple to-lab-blue hover:from-lab-purple/90 hover:to-lab-blue/90 text-white rounded-xl py-3 h-auto font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-start-lab"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Initializing Lab...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2 font-mono">
                <span>START_LAB.exe</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 font-mono">
            v1.0.0 | Your personal food sensitivity laboratory
          </p>
        </div>
      </div>
    </div>
  );
}