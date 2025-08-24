// Comprehensive food database for search autocomplete
export const foodCategories = {
  fruits: [
    "Apple", "Green Apple", "Red Apple", "Banana", "Orange", "Grape", "Strawberry",
    "Blueberry", "Raspberry", "Blackberry", "Pineapple", "Mango", "Kiwi", "Peach",
    "Pear", "Plum", "Cherry", "Watermelon", "Cantaloupe", "Honeydew"
  ],
  vegetables: [
    "Broccoli", "Carrot", "Spinach", "Lettuce", "Tomato", "Cucumber", "Bell Pepper",
    "Onion", "Garlic", "Potato", "Sweet Potato", "Zucchini", "Eggplant", "Celery",
    "Cauliflower", "Brussels Sprouts", "Asparagus", "Green Beans", "Corn", "Peas"
  ],
  grains: [
    "White Rice", "Brown Rice", "Quinoa", "Oats", "Wheat Bread", "Whole Wheat Bread",
    "White Bread", "Pasta", "Whole Wheat Pasta", "Barley", "Bulgur", "Couscous",
    "Crackers", "Cereal", "Granola", "Bagel", "English Muffin", "Tortilla"
  ],
  dairy: [
    "Milk", "Whole Milk", "Skim Milk", "Almond Milk", "Soy Milk", "Oat Milk",
    "Yogurt", "Greek Yogurt", "Cheese", "Cheddar Cheese", "Mozzarella", "Cottage Cheese",
    "Cream Cheese", "Butter", "Ice Cream", "Sour Cream"
  ],
  proteins: [
    "Chicken Breast", "Chicken Thigh", "Ground Chicken", "Beef", "Ground Beef",
    "Pork", "Turkey", "Fish", "Salmon", "Tuna", "Shrimp", "Eggs", "Tofu",
    "Beans", "Black Beans", "Kidney Beans", "Chickpeas", "Lentils", "Nuts", "Almonds"
  ],
  beverages: [
    "Water", "Coffee", "Tea", "Green Tea", "Black Tea", "Herbal Tea", "Soda",
    "Juice", "Apple Juice", "Orange Juice", "Beer", "Wine", "Energy Drink",
    "Sports Drink", "Smoothie", "Coconut Water"
  ]
};

export const commonSymptoms = [
  "Skin Allergies", "Skin Itching", "Skin Rash", "Hives",
  "Bloating", "Gas", "Stomach Pain", "Nausea", "Heartburn", "Acid Reflux",
  "Diarrhea", "Constipation", "Cramps", 
  "Headache", "Migraine", "Fatigue", "Dizziness",
  "Runny Nose", "Sneezing", "Congestion", "Watery Eyes",
  "Joint Pain", "Muscle Aches", "Back Pain"
];

export function searchFoods(query: string, limit = 10): string[] {
  if (!query || query.length < 2) return [];
  
  const allFoods = Object.values(foodCategories).flat();
  const results = allFoods.filter(food => 
    food.toLowerCase().includes(query.toLowerCase())
  );
  
  return results.slice(0, limit);
}

export function searchSymptoms(query: string, limit = 10): string[] {
  if (!query || query.length < 2) return [];
  
  const results = commonSymptoms.filter(symptom => 
    symptom.toLowerCase().includes(query.toLowerCase())
  );
  
  return results.slice(0, limit);
}
