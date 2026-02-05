import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";
import { MealPlanInput } from "../types";

export function buildMealPlanPrompts(input: MealPlanInput) {
  const systemPrompt = COACH_HAMZA_SYSTEM_PROMPT;

  const hydrationStatus =
    input.hydrationLevel <= 3
      ? "well hydrated"
      : input.hydrationLevel <= 5
        ? "moderately hydrated"
        : "dehydrated — needs extra focus on fluids";

  const userPrompt = `Generate a personalized Ramadan meal plan for this athlete.

## Athlete Profile
- Sport: ${input.sport || "General athletics"}
- Training today: ${input.trainingType || "rest"}
- Hydration: ${input.glassesOfWater}/8 glasses, Urine color ${input.hydrationLevel}/8 (${hydrationStatus})
- Day ${input.dayOfRamadan} of Ramadan

## Coach Hamza's Nutrition Rules
- Sahoor: Slow-release energy — dates, fruits, complex carbs, protein
- Iftar: Start with dates + water, hydrating foods/fruits FIRST, then balanced plate (35% veg, 35% protein, 30% carbs)
- Post-Taraweeh: Recovery protein shake + hydration
- Hydration: Coconut water, electrolyte drinks, watermelon/cucumber juice

Respond in this exact JSON format:
{
  "sahoor": {
    "foods": ["food1", "food2", "food3", "food4", "food5"],
    "reasoning": "Why these foods for this athlete's needs today"
  },
  "iftar": {
    "foods": ["food1", "food2", "food3", "food4", "food5"],
    "reasoning": "Why these foods help recovery and rehydration"
  },
  "postTaraweeh": {
    "foods": ["food1", "food2"],
    "reasoning": "Why this supports overnight recovery"
  },
  "hydrationPlan": "Specific hydration strategy for between Iftar and Sahoor"
}`;

  return { systemPrompt, userPrompt };
}
