// Comprehensive symptom database for search autocomplete
export const commonSymptoms = [
  // Digestive symptoms (most common food intolerance symptoms)
  "Bloating", "Gas", "Stomach Pain", "Nausea", "Heartburn", "Acid Reflux",
  "Diarrhea", "Constipation", "Cramps", "Stomach Cramps", "Indigestion",
  
  // Skin reactions (common allergy symptoms)
  "Skin Rash", "Skin Itching", "Hives", "Eczema", "Swelling", "Red Skin", "Dry Skin", 
  
  // Respiratory symptoms
  "Runny Nose", "Sneezing", "Congestion", "Watery Eyes", "Itchy Eyes", "Cough",
  "Wheezing", "Difficulty Breathing", "Throat Irritation", "Sinus Pressure",
  
  // Neurological symptoms
  "Headache", "Migraine", "Fatigue", "Dizziness", "Brain Fog", "Irritability",
  "Mood Changes", "Anxiety", "Sleep Issues",
  
  // Other common symptoms
  "Joint Pain", "Muscle Aches", "Back Pain", "Inflammation", "Low Energy",
  "Feeling Unwell", "Food Cravings", "Weight Changes", "Yeast Infection"
];

export function searchSymptoms(query: string, limit = 10): string[] {
  if (!query || query.length < 2) return [];
  
  const results = commonSymptoms.filter(symptom => 
    symptom.toLowerCase().includes(query.toLowerCase())
  );
  
  return results.slice(0, limit);
}