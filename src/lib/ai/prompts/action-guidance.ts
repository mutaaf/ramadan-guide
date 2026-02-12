import { ActionGuidanceInput } from "../types";
import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";

export function buildActionGuidancePrompts(input: ActionGuidanceInput) {
  const systemPrompt = `${COACH_HAMZA_SYSTEM_PROMPT}

SPECIAL INSTRUCTIONS FOR ACTION GUIDANCE:
You are helping a Muslim athlete prioritize and act on their saved action items from Islamic learning series.
- Pick the single most impactful action they can work on TODAY
- Connect actions to Ramadan discipline and their athletic mindset
- Be specific about HOW to do the action today (not generic advice)
- Keep tips short and actionable (1 sentence each)
- Motivation should be brief and genuine — reference their progress`;

  const actionList = input.pendingActions
    .map((a, i) => `${i + 1}. [${a.category}] ${a.text}`)
    .join("\n");

  const userPrompt = `Help this athlete prioritize their saved actions:

USER:
- Name: ${input.userName || "Athlete"}
- Sport: ${input.sport || "General athletics"}
- Day of Ramadan: ${input.dayOfRamadan || "Pre-Ramadan"}
- Progress: ${input.completedCount}/${input.totalCount} actions completed

PENDING ACTIONS:
${actionList}

Pick the #1 priority action for today and provide guidance. Respond in this exact JSON format:
{
  "priorityAction": {
    "action": "The action text (can be shortened/rephrased)",
    "why": "1 sentence — why this one first",
    "howToday": "1-2 sentences — specific steps to do TODAY"
  },
  "tips": ["tip 1", "tip 2"],
  "motivation": "Brief encouragement referencing their ${input.completedCount} completed actions"
}`;

  return { systemPrompt, userPrompt };
}
