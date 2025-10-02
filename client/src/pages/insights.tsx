import { useQuery, useMutation } from "@tanstack/react-query";
import { Correlation } from "@shared/schema";
import { TrendingUp, Lightbulb, Microscope, ArrowRight, Beaker, Activity } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";

export default function Insights() {
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/correlations/analyze");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/correlations"] });
    },
  });

  const { data: correlations, isLoading } = useQuery<Correlation[]>({
    queryKey: ["/api/correlations"],
  });

  useEffect(() => {
    analyzeMutation.mutate();
  }, []);

  if (isLoading || analyzeMutation.isPending) {
    return (
      <div className="pb-24">
        <header className="science-gradient safe-area-top px-6 py-4 text-white">
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <TrendingUp size={24} />
            <span>Lab Insights</span>
          </h1>
        </header>

        <main className="px-6 py-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-lab-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Activity className="text-lab-blue" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Analyzing Your Data...</h3>
            <p className="text-gray-500">
              Running correlation analysis on your food and symptom logs
            </p>
          </div>
        </main>
      </div>
    );
  }

  const highConfidenceCorrelations = correlations?.filter(c => c.confidence > 0.7) || [];
  const moderateCorrelations = correlations?.filter(c => c.confidence >= 0.5 && c.confidence <= 0.7) || [];
  const lowConfidenceCorrelations = correlations?.filter(c => c.confidence < 0.5) || [];

  return (
    <div className="pb-24">
      <header className="science-gradient safe-area-top px-6 py-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-4 w-3 h-3 bg-white rounded-full" />
          <div className="absolute top-6 left-8 w-2 h-2 bg-white rounded-full" />
          <div className="absolute top-8 right-6 w-2 h-2 bg-white rounded-full" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-xl font-bold flex items-center space-x-2 mb-2">
            <TrendingUp size={24} />
            <span>Lab Insights</span>
          </h1>
          <p className="text-sm opacity-90">Scientific discoveries from your data</p>
        </div>
      </header>

      <main className="px-6 py-6">
        {/* High Confidence Correlations */}
        {highConfidenceCorrelations.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Microscope className="text-lab-amber" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Confirmed Patterns</h2>
              <span className="text-xs bg-lab-amber/20 text-lab-amber px-2 py-1 rounded-full">
                &gt;70% Confidence
              </span>
            </div>

            <div className="space-y-4">
              {highConfidenceCorrelations.map((correlation, index) => (
                <div
                  key={correlation.id}
                  className="bg-gradient-to-br from-lab-amber/10 to-lab-amber/20 rounded-2xl p-5 border border-lab-amber/20"
                  data-testid={`correlation-high-${index}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-lab-amber rounded-full flex items-center justify-center">
                        <Lightbulb className="text-white" size={16} />
                      </div>
                      <span className="font-bold text-gray-800">Strong Correlation</span>
                    </div>
                    <span className="text-xs bg-lab-amber text-white px-3 py-1 rounded-full font-mono font-bold">
                      {(correlation.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">
                    <strong className="text-lab-amber">Pattern confirmed!</strong> {correlation.symptomName} symptoms appear {correlation.occurrences} time{correlation.occurrences !== 1 ? 's' : ''} within 24 hours after consuming {correlation.foodName}.
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-lab-blue rounded-full" />
                        <span className="text-sm text-gray-600">{correlation.foodName}</span>
                      </div>
                      <ArrowRight className="text-gray-400" size={16} />
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-lab-red rounded-full" />
                        <span className="text-sm text-gray-600">{correlation.symptomName}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      n={correlation.occurrences}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Moderate Confidence Correlations */}
        {moderateCorrelations.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Beaker className="text-lab-blue" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Emerging Patterns</h2>
              <span className="text-xs bg-lab-blue/20 text-lab-blue px-2 py-1 rounded-full">
                50-70% Confidence
              </span>
            </div>

            <div className="space-y-4">
              {moderateCorrelations.map((correlation, index) => (
                <div
                  key={correlation.id}
                  className="bg-white rounded-2xl p-4 lab-shadow border border-lab-blue/10"
                  data-testid={`correlation-moderate-${index}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-lab-blue/10 rounded-full flex items-center justify-center">
                      <Beaker className="text-lab-blue" size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-800">Potential Connection</h3>
                        <span className="text-xs bg-lab-blue text-white px-3 py-1 rounded-full font-mono font-bold">
                          {(correlation.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Detecting a possible link between {correlation.foodName} and {correlation.symptomName}. More data needed to confirm.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-lab-blue rounded-full" />
                            <span className="text-xs text-gray-600">{correlation.foodName}</span>
                          </div>
                          <ArrowRight className="text-gray-400" size={12} />
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-lab-red rounded-full" />
                            <span className="text-xs text-gray-600">{correlation.symptomName}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">
                          n={correlation.occurrences}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Low Confidence Correlations */}
        {lowConfidenceCorrelations.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="text-gray-500" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Weak Signals</h2>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                &lt;50% Confidence
              </span>
            </div>

            <div className="space-y-3">
              {lowConfidenceCorrelations.map((correlation, index) => (
                <div
                  key={correlation.id}
                  className="bg-gray-50 rounded-xl p-3 border border-gray-200"
                  data-testid={`correlation-low-${index}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="text-gray-400" size={14} />
                      <span className="text-sm font-medium text-gray-700">Observed Pattern</span>
                    </div>
                    <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded-full font-mono">
                      {(correlation.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-600">{correlation.foodName}</span>
                      <ArrowRight className="text-gray-300" size={10} />
                      <span className="text-xs text-gray-600">{correlation.symptomName}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      n={correlation.occurrences}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experiment Suggestions */}
        {correlations && correlations.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Beaker className="text-lab-green" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Suggested Experiments</h2>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 lab-shadow border border-lab-green/10">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-lab-green/10 rounded-full flex items-center justify-center">
                    <span className="text-lab-green text-sm">🧪</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Elimination Challenge</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Try removing your most correlated foods for 5 days to test the hypothesis.
                    </p>
                    <button 
                      className="text-lab-green text-sm font-medium"
                      data-testid="button-elimination-challenge"
                    >
                      Start Challenge →
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 lab-shadow border border-lab-blue/10">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-lab-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-lab-blue text-sm">📊</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Symptom Timing Study</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Log symptoms with precise timing to identify reaction windows.
                    </p>
                    <button 
                      className="text-lab-blue text-sm font-medium"
                      data-testid="button-timing-study"
                    >
                      Begin Study →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* No Data State */}
        {(!correlations || correlations.length === 0) && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Patterns Detected Yet</h3>
            <p className="text-gray-500 mb-6">
              Need more data to find correlations between foods and symptoms
            </p>
            <div className="bg-lab-blue/10 rounded-xl p-4 text-left max-w-sm mx-auto">
              <h4 className="font-medium text-gray-800 mb-3">📊 Minimum Requirements</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-lab-blue rounded-full" />
                  <span>Log at least <strong>5 different foods</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-lab-red rounded-full" />
                  <span>Record at least <strong>1 symptom</strong></span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Keep logging daily to build a comprehensive dataset for accurate pattern detection.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
