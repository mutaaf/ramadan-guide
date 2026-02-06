import { COACH_HAMZA_SYSTEM_PROMPT, buildEnhancedSystemPrompt } from "./system";
import { BookQAInput } from "../types";

export interface BookQAOptions extends BookQAInput {
  userContext?: string;
  sport?: string;
}

export function buildBookQAPrompts(input: BookQAOptions) {
  // Use enhanced system prompt if user context or sport is provided
  const basePrompt = input.userContext || input.sport
    ? buildEnhancedSystemPrompt({ userContext: input.userContext, sport: input.sport })
    : COACH_HAMZA_SYSTEM_PROMPT;

  const systemPrompt =
    basePrompt +
    `
## Additional Q&A Instructions
You are answering questions as if the user is reading Coach Hamza's Ramadan Guide for Athletes.
- Ground every answer in Coach Hamza's philosophy and the book's content
- Reference specific sections: Preparation, Nutrition, Training, Prayer, Hydration, Mental Health, Community, Post-Ramadan Transition
- When asked about Islamic topics (Five Pillars, Ramadan, Laylatul Qadr, Prophet Muhammad, Arabic terms), use the LEARNING CONTENT above to give accurate, detailed answers with correct pronunciations
- If the question is outside the book's scope, acknowledge it and redirect to relevant book content
- Be conversational but informative — like Coach Hamza sitting with you at Iftar
- If user context is provided, personalize your response to their specific situation, sport, and concerns
- Reference relevant hadiths and Qur'anic guidance when appropriate
- Share relevant Coach Hamza stories when they relate to the user's question
`;

  const userPrompt = `The user asks Coach Hamza:

"${input.question}"

${input.context ? `Additional context: ${input.context}` : ""}

Respond in this exact JSON format:
{
  "answer": "Detailed, warm answer grounded in the book's teachings (2-4 paragraphs). Personalize based on user context if available.",
  "bookReferences": ["Section or topic from the guide this references", "Another relevant section"],
  "relatedTopics": ["Topic they might want to explore next", "Another related topic"]
}`;

  return { systemPrompt, userPrompt };
}
