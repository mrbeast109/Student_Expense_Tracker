const SUGGESTION_TEMPLATES = {
  food: "You're spending {pct}% more on food/food-delivery than your usual average — cooking at the mess a couple more times a week could help.",
  travel: "Travel spending is up {pct}% this month — consider bundling trips or using metro/bus passes.",
  entertainment: "Entertainment spend is {pct}% above your average — maybe space out outings this month.",
  subscriptions: "You're paying for {count} subscriptions — check if any are unused and worth pausing.",
  groceries: "Grocery spend is {pct}% higher than usual — buying in bulk with roommates could cut costs.",
  default: "Your {category} spend is {pct}% above your usual average this month.",
};

export function generateSavingsSuggestions(
  currentMonthByCategory,
  historicalAvgByCategory,
  subscriptionCount = 0
) {
  const suggestions = [];

  for (const [category, currentAmount] of Object.entries(currentMonthByCategory)) {
    const avg = historicalAvgByCategory[category];
    if (!avg || avg <= 0) continue;

    const pctIncrease = Math.round(((currentAmount - avg) / avg) * 100);
    if (pctIncrease >= 20) {
      const template = SUGGESTION_TEMPLATES[category] || SUGGESTION_TEMPLATES.default;
      suggestions.push(
        template.replace("{pct}", pctIncrease).replace("{category}", category)
      );
    }
  }

  if (subscriptionCount >= 3) {
    suggestions.push(
      SUGGESTION_TEMPLATES.subscriptions.replace("{count}", subscriptionCount)
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("Your spending looks steady this month — no red flags. Keep it up!");
  }

  return suggestions;
}
