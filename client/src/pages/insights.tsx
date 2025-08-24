import { useQuery } from "@tanstack/react-query";
import { Correlation } from "@shared/schema";
import { TrendingUp, Lightbulb, Microscope, ArrowRight, Beaker } from "lucide-react";

export default function Insights() {
  const { data: correlations, isLoading } = useQuery<Correlation[]>({
    queryKey: ["/api/correlations"],
  });

  if (isLoading) {
    return (
      <div className="pb-24">
        <header className="science-gradient safe-area-top px-6 py-4 text-white">
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <TrendingUp size={24} />
            <span>Lab Insights</span>
          </h1>
        </header>

        <main className="px-6 py-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 lab-shadow animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const highConfidenceCorrelations = correlations?.filter(c => c.confidence > 0.7) || [];
  const moderateCorrelations = correlations?.filter(c => c.confidence >= 0.5 && c.confidence <= 0.7) || [];

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
                High Confidence
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
                      <span className="font-bold text-gray-800">Strong Correlation Found</span>
                    </div>
                    <span className="text-xs bg-lab-amber/20 text-lab-amber px-2 py-1 rounded-full font-medium">
                      {Math.round(correlation.confidence * 100)}% Match
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">
                    <strong>Pattern confirmed!</strong> {correlation.symptomName} symptoms appear to be linked to {correlation.foodName} consumption.
                    This pattern occurred in {correlation.occurrences} recorded instances.
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
                Under Investigation
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
                        <span className="text-xs bg-lab-blue/10 text-lab-blue px-2 py-1 rounded-full">
                          {Math.round(correlation.confidence * 100)}% Match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        We're detecting a possible link between {correlation.foodName} and {correlation.symptomName}.
                        More data needed to confirm this pattern.
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
                        <span className="text-xs text-gray-500">
                          {correlation.occurrences} occurrences
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experiment Suggestions */}
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

        {/* No Data State */}
        {(!correlations || correlations.length === 0) && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Insights Yet</h3>
            <p className="text-gray-500 mb-6">
              Keep logging foods and symptoms to discover correlations and patterns in your data.
            </p>
            <div className="bg-lab-blue/10 rounded-xl p-4 text-left max-w-sm mx-auto">
              <h4 className="font-medium text-gray-800 mb-2">💡 Tip for Better Insights</h4>
              <p className="text-sm text-gray-600">
                Log consistently for at least a week and include both foods and any symptoms you experience.
                Our algorithms need time to detect meaningful patterns.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
