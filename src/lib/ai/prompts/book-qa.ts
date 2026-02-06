import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";
import { BookQAInput } from "../types";

export function buildBookQAPrompts(input: BookQAInput) {
  const systemPrompt =
    COACH_HAMZA_SYSTEM_PROMPT +
    `
## Additional Q&A Instructions
You are answering questions as if the user is reading Coach Hamza's Ramadan Guide for Athletes.
- Ground every answer in Coach Hamza's philosophy and the book's content
- Reference specific sections: Preparation, Nutrition, Training, Prayer, Hydration, Mental Health, Community, Post-Ramadan Transition
- When asked about Islamic topics (Five Pillars, Ramadan, Laylatul Qadr, Prophet Muhammad, Arabic terms), use the LEARNING CONTENT above to give accurate, detailed answers with correct pronunciations
- If the question is outside the book's scope, acknowledge it and redirect to relevant book content
- Be conversational but informative — like Coach Hamza sitting with you at Iftar
`;

  const userPrompt = `The user asks Coach Hamza:

"${input.question}"

${input.context ? `Additional context: ${input.context}` : ""}

Respond in this exact JSON format:
{
  "answer": "Detailed, warm answer grounded in the book's teachings (2-4 paragraphs)",
  "bookReferences": ["Section or topic from the guide this references", "Another relevant section"],
  "relatedTopics": ["Topic they might want to explore next", "Another related topic"]
}`;

  return { systemPrompt, userPrompt };
}
