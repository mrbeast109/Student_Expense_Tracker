const CATEGORY_KEYWORDS = {
  food: [
    "restaurant", "cafe", "coffee", "swiggy", "zomato", "dominos", "pizza",
    "burger", "kfc", "mcdonald", "food", "dhaba", "canteen", "mess", "tiffin",
    "biryani", "chai", "tea", "snack", "bakery", "sweet", "dosa", "thali",
  ],
  travel: [
    "uber", "ola", "rapido", "taxi", "cab", "metro", "irctc", "railway",
    "bus", "petrol", "diesel", "fuel", "flight", "airlines", "indigo",
    "redbus", "auto", "parking", "toll",
  ],
  stationery: [
    "stationery", "xerox", "photocopy", "printout", "notebook", "pen",
    "book", "bookstore", "print", "binding", "stapler",
  ],
  rent: ["rent", "hostel fee", "pg", "landlord", "lease", "accommodation"],
  subscriptions: [
    "netflix", "spotify", "amazon prime", "hotstar", "youtube premium",
    "subscription", "recharge", "jio", "airtel", "vodafone", "sim",
  ],
  groceries: [
    "grocery", "groceries", "bigbasket", "blinkit", "zepto", "supermarket",
    "kirana", "vegetable", "fruit", "milk", "provisions", "dmart",
  ],
  entertainment: [
    "movie", "cinema", "pvr", "inox", "bookmyshow", "game", "gaming",
    "concert", "party", "club",
  ],
  utilities: [
    "electricity", "water bill", "wifi", "broadband", "gas", "utility",
    "laundry", "maintenance",
  ],
  health: [
    "pharmacy", "medicine", "medical", "hospital", "clinic", "doctor",
    "apollo", "chemist",
  ],
};

export function classifyExpense(merchant = "", itemNames = []) {
  const haystack = `${merchant} ${itemNames.join(" ")}`.toLowerCase();

  let bestCategory = "other";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce(
      (acc, kw) => acc + (haystack.includes(kw) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}
