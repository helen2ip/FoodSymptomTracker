// Comprehensive food database for search autocomplete
export const foodCategories = {
  fruits: [
    "Apple", "Green Apple", "Red Apple", "Banana", "Orange", "Grape", "Grapes", "Strawberry", "Strawberries",
    "Blueberry", "Blueberries", "Raspberry", "Raspberries", "Blackberry", "Blackberries",
    "Pineapple", "Mango", "Kiwi", "Peach", "Pear", "Plum", "Cherry", "Cherries",
    "Watermelon", "Cantaloupe", "Honeydew", "Lemon", "Lime", "Grapefruit", "Avocado",
    "Coconut", "Dates", "Figs", "Apricot", "Nectarine", "Papaya", "Passion Fruit", "Pomegranate"
  ],
  vegetables: [
    "Broccoli", "Carrot", "Carrots", "Spinach", "Lettuce", "Romaine Lettuce", "Iceberg Lettuce",
    "Tomato", "Tomatoes", "Cherry Tomatoes", "Cucumber", "Bell Pepper", "Red Bell Pepper", "Green Bell Pepper",
    "Onion", "Red Onion", "White Onion", "Green Onion", "Garlic", "Potato", "Potatoes", "Sweet Potato", "Sweet Potatoes",
    "Zucchini", "Eggplant", "Celery", "Cauliflower", "Brussels Sprouts", "Asparagus",
    "Green Beans", "Corn", "Peas", "Mushrooms", "Button Mushrooms", "Portobello", "Shiitake",
    "Kale", "Arugula", "Cabbage", "Red Cabbage", "Bok Choy", "Leek", "Radish", "Beets", "Turnip"
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
    "Pork", "Turkey", "Fish", "Salmon", "Tuna", "Cod", "Tilapia", "Shrimp", "Crab", "Lobster",
    "Eggs", "Egg Whites", "Tofu", "Tempeh", "Seitan",
    "Beans", "Black Beans", "Kidney Beans", "Chickpeas", "Lentils", "Navy Beans", "Pinto Beans"
  ],
  nuts_seeds: [
    "Almonds", "Walnuts", "Walnut", "Cashews", "Cashew", "Peanuts", "Peanut", "Pecans", "Pecan",
    "Pistachios", "Pistachio", "Brazil Nuts", "Hazelnuts", "Hazelnut", "Macadamia Nuts",
    "Pine Nuts", "Sunflower Seeds", "Pumpkin Seeds", "Chia Seeds", "Flax Seeds", "Sesame Seeds",
    "Peanut Butter", "Almond Butter", "Cashew Butter", "Tahini"
  ],
  beverages: [
    "Water", "Sparkling Water", "Coffee", "Espresso", "Latte", "Cappuccino", "Black Coffee",
    "Tea", "Green Tea", "Black Tea", "Herbal Tea", "Chai Tea", "Iced Tea",
    "Soda", "Cola", "Diet Soda", "Sprite", "Energy Drink", "Sports Drink",
    "Juice", "Apple Juice", "Orange Juice", "Cranberry Juice", "Grape Juice",
    "Beer", "Wine", "Red Wine", "White Wine", "Cocktail", "Vodka", "Whiskey",
    "Smoothie", "Protein Shake", "Coconut Water", "Kombucha"
  ],
  processed_foods: [
    "Pizza", "Hamburger", "Hot Dog", "French Fries", "Chips", "Potato Chips", "Cookies",
    "Candy", "Chocolate", "Dark Chocolate", "Milk Chocolate", "Cake", "Pie", "Donuts",
    "Muffin", "Crackers", "Pretzels", "Popcorn", "Granola Bar", "Protein Bar"
  ],
  condiments_spices: [
    "Salt", "Pepper", "Garlic Powder", "Onion Powder", "Paprika", "Cumin", "Oregano",
    "Basil", "Thyme", "Rosemary", "Cinnamon", "Ginger", "Turmeric", "Chili Powder",
    "Ketchup", "Mustard", "Mayo", "Mayonnaise", "Ranch Dressing", "Italian Dressing",
    "Olive Oil", "Vegetable Oil", "Coconut Oil", "Butter", "Hot Sauce", "Soy Sauce",
    "Vinegar", "Balsamic Vinegar", "Honey", "Maple Syrup", "Sugar", "Brown Sugar"
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
