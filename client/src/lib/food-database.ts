// Comprehensive food database for search autocomplete
export const foodCategories = {
  fruits: [
    "Apple", "Green Apple", "Red Apple", "Gala Apple", "Fuji Apple", "Granny Smith Apple",
    "Banana", "Green Banana", "Plantain", "Orange", "Navel Orange", "Blood Orange", "Mandarin",
    "Grapes", "Red Grapes", "Green Grapes", "Strawberries", "Blueberries", "Raspberries", 
    "Blackberries", "Cranberries", "Dried Cranberries", "Elderberry", "Gooseberry",
    "Pineapple", "Fresh Pineapple", "Mango", "Kiwi Fruit", "Peach", "White Peach", "Yellow Peach",
    "Pear", "Asian Pear", "Plum", "Cherries", "Sweet Cherries", "Tart Cherries",
    "Watermelon", "Cantaloupe", "Honeydew", "Casaba Melon", "Lemon", "Lime", "Key Lime",
    "Grapefruit", "Pink Grapefruit", "Ruby Red Grapefruit", "Avocado", "Hass Avocado",
    "Coconut", "Fresh Coconut", "Coconut Meat", "Dates", "Medjool Dates", "Figs", "Dried Figs",
    "Apricot", "Dried Apricot", "Nectarine", "Papaya", "Passion Fruit", "Dragon Fruit",
    "Pomegranate", "Persimmon", "Star Fruit", "Lychee", "Rambutan", "Jackfruit", "Durian", "Cactus Fruit"
  ],
  vegetables: [
    "Broccoli", "Broccolini", "Carrots", "Baby Carrots", "Purple Carrots",
    "Spinach", "Baby Spinach", "Lettuce", "Romaine Lettuce", "Iceberg Lettuce", "Butter Lettuce",
    "Tomatoes", "Cherry Tomatoes", "Roma Tomatoes", "Beefsteak Tomatoes", "Heirloom Tomatoes",
    "Cucumber", "English Cucumber", "Persian Cucumber", "Bell Pepper", "Red Bell Pepper", "Green Bell Pepper",
    "Yellow Bell Pepper", "Orange Bell Pepper", "Jalapeño", "Serrano Pepper", "Habanero", "Poblano",
    "Onion", "Red Onion", "White Onion", "Yellow Onion", "Green Onion", "Scallions", "Shallot",
    "Garlic", "Potatoes", "Russet Potato", "Red Potato", "Yukon Gold",
    "Sweet Potatoes", "Purple Sweet Potato", "Yam", "Zucchini", "Yellow Squash",
    "Eggplant", "Japanese Eggplant", "Celery", "Celery Stalks", "Cauliflower", "Purple Cauliflower",
    "Brussels Sprouts", "Asparagus", "White Asparagus", "Green Beans", "Yellow Beans", "Wax Beans",
    "Corn", "Sweet Corn", "Corn on the Cob", "Peas", "Snow Peas", "Sugar Snap Peas", "Split Peas",
    "Mushrooms", "Button Mushrooms", "Portobello", "Shiitake", "Oyster Mushrooms", "Cremini", "Enoki",
    "Kale", "Baby Kale", "Arugula", "Watercress", "Cabbage", "Red Cabbage", "Napa Cabbage",
    "Bok Choy", "Baby Bok Choy", "Leek", "Radish", "Daikon Radish", "Beets", "Golden Beets",
    "Turnip", "Rutabaga", "Parsnip", "Fennel", "Artichoke", "Okra", "Collard Greens", "Swiss Chard"
  ],
  grains: [
    "White Rice", "Brown Rice", "Wild Rice", "Jasmine Rice", "Basmati Rice", "Arborio Rice",
    "Quinoa", "Red Quinoa", "Black Quinoa", "Oats", "Steel Cut Oats", "Rolled Oats", "Instant Oats",
    "Wheat Bread", "Whole Wheat Bread", "White Bread", "Sourdough Bread", "Rye Bread", "Pumpernickel",
    "Multigrain Bread", "Gluten Free Bread", "Pita Bread", "Naan", "Flatbread",
    "Pasta", "Whole Wheat Pasta", "Gluten Free Pasta", "Spaghetti", "Penne", "Fusilli", "Linguine",
    "Barley", "Pearl Barley", "Bulgur", "Couscous", "Pearl Couscous", "Farro", "Millet", "Amaranth",
    "Crackers", "Whole Grain Crackers", "Rice Crackers", "Cereal", "Oat Cereal", "Corn Flakes",
    "Granola", "Muesli", "Bagel", "Everything Bagel", "Plain Bagel", "English Muffin", "Biscuit",
    "Tortilla", "Flour Tortilla", "Corn Tortilla", "Wrap", "Pita", "Lavash"
  ],
  dairy: [
    "Milk", "Whole Milk", "2% Milk", "1% Milk", "Skim Milk", "Fat Free Milk", "Lactose Free Milk",
    "Almond Milk", "Soy Milk", "Oat Milk", "Coconut Milk", "Rice Milk", "Cashew Milk", "Hemp Milk",
    "Yogurt", "Greek Yogurt", "Plain Yogurt", "Vanilla Yogurt", "Strawberry Yogurt", "Blueberry Yogurt",
    "Skyr", "Kefir", "Cheese", "Cheddar Cheese", "Sharp Cheddar", "Mild Cheddar", "Mozzarella",
    "Fresh Mozzarella", "Swiss Cheese", "Provolone", "Gouda", "Brie", "Camembert", "Feta",
    "Goat Cheese", "Blue Cheese", "Parmesan", "Pecorino", "Cottage Cheese", "Ricotta",
    "Cream Cheese", "Mascarpone", "Butter", "Salted Butter", "Unsalted Butter", "Clarified Butter",
    "Ice Cream", "Frozen Yogurt", "Gelato", "Sorbet", "Sour Cream", "Heavy Cream", "Half and Half"
  ],
  proteins: [
    "Chicken Breast", "Chicken Thigh", "Chicken Wings", "Whole Chicken", "Ground Chicken", "Chicken Drumstick",
    "Beef", "Ground Beef", "Lean Ground Beef", "Steak", "Ribeye", "Sirloin", "Filet Mignon", "Beef Brisket",
    "Pork", "Pork Chops", "Pork Tenderloin", "Ground Pork", "Bacon", "Ham", "Prosciutto", "Sausage",
    "Turkey", "Ground Turkey", "Turkey Breast", "Turkey Thigh", "Deli Turkey", "Turkey Bacon",
    "Fish", "Salmon", "Atlantic Salmon", "Wild Salmon", "Tuna", "Yellowfin Tuna", "Albacore Tuna",
    "Cod", "Halibut", "Tilapia", "Mahi Mahi", "Swordfish", "Mackerel", "Sardines", "Anchovies",
    "Trout", "Bass", "Snapper", "Sole", "Flounder", "Catfish", "Haddock",
    "Shrimp", "Prawns", "Crab", "King Crab", "Snow Crab", "Lobster", "Scallops", "Clams", "Mussels", "Oysters",
    "Eggs", "Chicken Eggs", "Duck Eggs", "Quail Eggs", "Egg Whites", "Egg Yolks",
    "Tofu", "Firm Tofu", "Soft Tofu", "Silken Tofu", "Tempeh", "Seitan", "TVP",
    "Beans", "Black Beans", "Kidney Beans", "Red Kidney Beans", "Chickpeas", "Garbanzo Beans",
    "Lentils", "Red Lentils", "Green Lentils", "Brown Lentils", "Navy Beans", "Pinto Beans",
    "Lima Beans", "Cannellini Beans", "Fava Beans", "Edamame", "Soybeans"
  ],
  nuts_seeds: [
    "Almonds", "Walnuts", "Cashews", "Peanuts", "Pecans", "Pistachios", "Brazil Nuts", 
    "Hazelnuts", "Macadamia Nuts", "Pine Nuts", "Sunflower Seeds", "Pumpkin Seeds", 
    "Chia Seeds", "Flax Seeds", "Sesame Seeds", "Hemp Seeds", "Poppy Seeds",
    "Peanut Butter", "Almond Butter", "Cashew Butter", "Walnut Butter", "Tahini", "Sunflower Seed Butter"
  ],
  beverages: [
    "Water", "Filtered Water", "Tap Water", "Sparkling Water", "Mineral Water", "Alkaline Water",
    "Coffee", "Black Coffee", "Espresso", "Americano", "Latte", "Cappuccino", "Macchiato", "Mocha",
    "Iced Coffee", "Cold Brew", "Frappuccino", "Decaf Coffee", "Instant Coffee",
    "Tea", "Green Tea", "Black Tea", "White Tea", "Oolong Tea", "Herbal Tea", "Chamomile Tea",
    "Peppermint Tea", "Chai Tea", "Earl Grey", "English Breakfast Tea", "Iced Tea", "Sweet Tea",
    "Soda", "Cola", "Coca Cola", "Pepsi", "Diet Coke", "Diet Pepsi", "Sprite", "7UP", "Ginger Ale",
    "Root Beer", "Dr Pepper", "Mountain Dew", "Orange Soda", "Lemon Lime Soda",
    "Energy Drink", "Red Bull", "Monster", "Rockstar", "Sports Drink", "Gatorade", "Powerade",
    "Juice", "Apple Juice", "Orange Juice", "Cranberry Juice", "Grape Juice", "Pomegranate Juice",
    "Pineapple Juice", "Grapefruit Juice", "Tomato Juice", "V8", "Carrot Juice", "Beet Juice",
    "Beer", "Light Beer", "IPA", "Lager", "Wheat Beer", "Stout", "Pilsner",
    "Wine", "Red Wine", "White Wine", "Rosé", "Champagne", "Prosecco", "Sangria",
    "Cocktail", "Martini", "Margarita", "Vodka", "Whiskey", "Rum", "Gin", "Tequila",
    "Smoothie", "Green Smoothie", "Fruit Smoothie", "Protein Shake", "Pre Workout", "Post Workout",
    "Coconut Water", "Kombucha", "Milk Tea", "Bubble Tea", "Hot Chocolate", "Eggnog"
  ],
  processed_foods: [
    "Pizza", "Cheese Pizza", "Pepperoni Pizza", "Margherita Pizza", "Hamburger", "Cheeseburger",
    "Veggie Burger", "Turkey Burger", "Hot Dog", "Beef Hot Dog", "Turkey Hot Dog", "Corn Dog",
    "French Fries", "Sweet Potato Fries", "Onion Rings", "Chips", "Potato Chips", "Corn Chips",
    "Tortilla Chips", "Pita Chips", "Cookies", "Chocolate Chip Cookies", "Oatmeal Cookies",
    "Candy", "Gummy Bears", "Hard Candy", "Chocolate", "Dark Chocolate", "Milk Chocolate",
    "White Chocolate", "Chocolate Bar", "Cake", "Chocolate Cake", "Vanilla Cake", "Birthday Cake",
    "Pie", "Apple Pie", "Pumpkin Pie", "Cherry Pie", "Donuts", "Glazed Donut", "Chocolate Donut",
    "Muffin", "Blueberry Muffin", "Bran Muffin", "Crackers", "Saltines", "Graham Crackers",
    "Pretzels", "Soft Pretzels", "Popcorn", "Caramel Popcorn", "Granola Bar", "Protein Bar",
    "Energy Bar", "Cereal Bar", "Sandwich", "PB&J", "Grilled Cheese", "BLT", "Club Sandwich", "Flan", "Cheesecake", "Pancake"
  ],
  condiments_spices: [
    "Salt", "Pepper", "Garlic Powder", "Onion Powder", "Paprika", "Cumin", "Oregano",
    "Basil", "Thyme", "Rosemary", "Cinnamon", "Ginger", "Turmeric", "Chili Powder",
    "Ketchup", "Mustard", "Mayo", "Mayonnaise", "Ranch Dressing", "Italian Dressing",
    "Olive Oil", "Vegetable Oil", "Coconut Oil", "Butter", "Hot Sauce", "Soy Sauce",
    "Vinegar", "Balsamic Vinegar", "Honey", "Maple Syrup", "Sugar", "Brown Sugar"
  ]
};

export function searchFoods(query: string, limit = 10): string[] {
  if (!query || query.length < 2) return [];
  
  const allFoods = Object.values(foodCategories).flat();
  const results = allFoods.filter(food => 
    food.toLowerCase().includes(query.toLowerCase())
  );
  
  return results.slice(0, limit);
}

// Function to determine food category for a given food name
export function getFoodCategory(foodName: string): string {
  const lowerFoodName = foodName.toLowerCase();
  
  for (const [category, foods] of Object.entries(foodCategories)) {
    if (foods.some(food => food.toLowerCase() === lowerFoodName)) {
      return category;
    }
  }
  
  // Fallback to general matching if exact match not found
  if (lowerFoodName.includes('apple') || lowerFoodName.includes('banana') || lowerFoodName.includes('berry') || lowerFoodName.includes('fruit')) return 'fruits';
  if (lowerFoodName.includes('carrot') || lowerFoodName.includes('broccoli') || lowerFoodName.includes('spinach') || lowerFoodName.includes('vegetable')) return 'vegetables';
  if (lowerFoodName.includes('rice') || lowerFoodName.includes('bread') || lowerFoodName.includes('pasta') || lowerFoodName.includes('grain')) return 'grains';
  if (lowerFoodName.includes('milk') || lowerFoodName.includes('cheese') || lowerFoodName.includes('yogurt')) return 'dairy';
  if (lowerFoodName.includes('chicken') || lowerFoodName.includes('beef') || lowerFoodName.includes('fish') || lowerFoodName.includes('protein')) return 'proteins';
  if (lowerFoodName.includes('nut') || lowerFoodName.includes('seed')) return 'nuts_seeds';
  if (lowerFoodName.includes('coffee') || lowerFoodName.includes('tea') || lowerFoodName.includes('juice') || lowerFoodName.includes('water')) return 'beverages';
  if (lowerFoodName.includes('pizza') || lowerFoodName.includes('burger') || lowerFoodName.includes('fries')) return 'processed_foods';
  if (lowerFoodName.includes('salt') || lowerFoodName.includes('pepper') || lowerFoodName.includes('sauce')) return 'condiments_spices';
  
  return 'other';
}

// Function to get category-specific icon component
import { Apple, Carrot, Wheat, Milk, Atom, Nut, Coffee, Pizza, ChefHat, Utensils } from "lucide-react";

export function getCategoryIcon(category: string) {
  switch (category) {
    case 'fruits':
      return Apple;
    case 'vegetables':
      return Carrot;
    case 'grains':
      return Wheat;
    case 'dairy':
      return Milk;
    case 'proteins':
      return Atom;
    case 'nuts_seeds':
      return Nut;
    case 'beverages':
      return Coffee;
    case 'processed_foods':
      return Pizza;
    case 'condiments_spices':
      return ChefHat;
    default:
      return Utensils;
  }
}
