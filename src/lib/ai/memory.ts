// AI Memory Service for continuous learning from user interactions

import { UserProfile, UserMemory, DayEntry } from "@/store/useStore";

export interface ConversationAnalysis {
  topics: string[];
  preferences: {
    mealTypes?: string[];
    dietaryRestrictions?: string[];
  };
  insights: {
    strugglingAreas?: string[];
    achievements?: string[];
  };
  shouldSaveNote: boolean;
  noteContent?: string;
}

// Keywords to detect topics in conversations
const TOPIC_KEYWORDS: Record<string, string[]> = {
  hydration: ["water", "hydrat", "drink", "thirst", "dehydrat", "electrolyte"],
  nutrition: ["eat", "food", "meal", "sahoor", "iftar", "diet", "calorie", "protein", "carb"],
  training: ["train", "workout", "exercise", "practice", "gym", "weight", "cardio"],
  prayer: ["pray", "salah", "salat", "fajr", "dhur", "asr", "maghrib", "ishaa", "taraweeh"],
  quran: ["quran", "recit", "read", "surah", "ayah", "juz", "memoriz"],
  sleep: ["sleep", "rest", "tired", "fatigue", "nap", "energy"],
  fasting: ["fast", "ramadan", "hunger", "thirst", "break fast"],
  mental: ["stress", "anxious", "motivat", "depress", "mental", "focus", "mindset"],
  injury: ["injur", "pain", "hurt", "recover", "heal"],
  competition: ["game", "match", "compet", "perform", "race", "fight"],
};

// Keywords that indicate struggle
const STRUGGLE_KEYWORDS = [
  "struggle", "hard", "difficult", "can't", "cannot", "problem",
  "issue", "trouble", "help", "worried", "concern", "fail",
  "tired", "exhausted", "weak", "hungry", "thirsty",
];

// Keywords that indicate achievement
const ACHIEVEMENT_KEYWORDS = [
  "did it", "made it", "completed", "finished", "success",
  "great", "amazing", "proud", "accomplish", "achieved",
  "finally", "managed to", "able to", "improved",
];

/**
 * Analyze a conversation to extract learnings
 */
export function analyzeConversation(
  userMessage: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _aiResponse: string
): ConversationAnalysis {
  const messageLower = userMessage.toLowerCase();

  // Detect topics discussed
  const topics: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => messageLower.includes(kw))) {
      topics.push(topic);
    }
  }

  // Detect meal preferences (simple heuristic)
  const mealTypes: string[] = [];
  const mealKeywords = ["dates", "oatmeal", "eggs", "smoothie", "rice", "chicken", "fish", "soup", "fruit", "yogurt"];
  for (const meal of mealKeywords) {
    if (messageLower.includes(meal)) {
      mealTypes.push(meal);
    }
  }

  // Detect dietary restrictions
  const dietaryRestrictions: string[] = [];
  const restrictionKeywords = {
    vegetarian: ["vegetarian", "no meat"],
    vegan: ["vegan", "plant-based"],
    "gluten-free": ["gluten-free", "no gluten", "celiac"],
    "dairy-free": ["dairy-free", "no dairy", "lactose"],
    halal: ["halal", "zabiha"],
  };
  for (const [restriction, keywords] of Object.entries(restrictionKeywords)) {
    if (keywords.some((kw) => messageLower.includes(kw))) {
      dietaryRestrictions.push(restriction);
    }
  }

  // Detect struggling areas
  const strugglingAreas: string[] = [];
  if (STRUGGLE_KEYWORDS.some((kw) => messageLower.includes(kw))) {
    // Associate struggle with detected topics
    strugglingAreas.push(...topics);
  }

  // Detect achievements
  const achievements: string[] = [];
  if (ACHIEVEMENT_KEYWORDS.some((kw) => messageLower.includes(kw))) {
    achievements.push(...topics);
  }

  // Determine if we should save a note
  const shouldSaveNote = topics.length > 0 && (strugglingAreas.length > 0 || achievements.length > 0);
  let noteContent: string | undefined;

  if (shouldSaveNote) {
    if (strugglingAreas.length > 0) {
      noteContent = `User is struggling with: ${strugglingAreas.join(", ")}`;
    } else if (achievements.length > 0) {
      noteContent = `User achieved progress in: ${achievements.join(", ")}`;
    }
  }

  return {
    topics,
    preferences: {
      mealTypes: mealTypes.length > 0 ? mealTypes : undefined,
      dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
    },
    insights: {
      strugglingAreas: strugglingAreas.length > 0 ? strugglingAreas : undefined,
      achievements: achievements.length > 0 ? achievements : undefined,
    },
    shouldSaveNote,
    noteContent,
  };
}

/**
 * Build a user context string for AI prompts based on profile, memory, and recent activity
 */
export function buildUserContext(
  profile: UserProfile,
  memory: UserMemory,
  recentDays: DayEntry[] = []
): string {
  const parts: string[] = [];

  // User profile summary
  if (profile.userName) {
    parts.push(`User's name: ${profile.userName}`);
  }

  if (profile.sport) {
    parts.push(`Sport: ${profile.sport}`);
  }

  if (profile.trainingIntensity) {
    parts.push(`Training intensity: ${profile.trainingIntensity}`);
  }

  if (profile.fastingExperience) {
    const expLabels: Record<string, string> = {
      "first-time": "First time fasting for Ramadan",
      "some-years": "Has fasted for a few Ramadans",
      "many-years": "Experienced with Ramadan fasting",
    };
    parts.push(expLabels[profile.fastingExperience] || "");
  }

  if (profile.primaryGoals.length > 0) {
    parts.push(`Primary goals: ${profile.primaryGoals.join(", ")}`);
  }

  if (profile.ramadanConcerns.length > 0) {
    parts.push(`Concerns: ${profile.ramadanConcerns.join(", ")}`);
  }

  // Memory-based context
  if (memory.preferredMealTypes.length > 0) {
    parts.push(`Preferred foods: ${memory.preferredMealTypes.join(", ")}`);
  }

  if (memory.dietaryRestrictions.length > 0) {
    parts.push(`Dietary restrictions: ${memory.dietaryRestrictions.join(", ")}`);
  }

  if (memory.strugglingAreas.length > 0) {
    parts.push(`Areas they've struggled with: ${memory.strugglingAreas.slice(-5).join(", ")}`);
  }

  if (memory.achievements.length > 0) {
    parts.push(`Recent achievements: ${memory.achievements.slice(-3).join(", ")}`);
  }

  if (memory.frequentTopics.length > 0) {
    parts.push(`Topics they frequently ask about: ${memory.frequentTopics.slice(-5).join(", ")}`);
  }

  // Recent activity summary
  if (recentDays.length > 0) {
    const avgWater = recentDays.reduce((sum, d) => sum + d.glassesOfWater, 0) / recentDays.length;
    const avgSleep = recentDays.reduce((sum, d) => sum + d.hoursOfSleep, 0) / recentDays.length;
    const prayerCount = recentDays.reduce((sum, d) => {
      return sum + Object.values(d.prayers).filter(Boolean).length;
    }, 0);
    const avgPrayers = prayerCount / recentDays.length;

    parts.push(`\nRecent Activity (last ${recentDays.length} days):`);
    parts.push(`- Average water intake: ${avgWater.toFixed(1)} glasses`);
    parts.push(`- Average sleep: ${avgSleep.toFixed(1)} hours`);
    parts.push(`- Average prayers completed: ${avgPrayers.toFixed(1)}/6`);

    // Common training types
    const trainingTypes = recentDays
      .map((d) => d.trainingType)
      .filter(Boolean);
    if (trainingTypes.length > 0) {
      parts.push(`- Training types: ${[...new Set(trainingTypes)].join(", ")}`);
    }

    // Recent mood
    const moods = recentDays.map((d) => d.mood).filter(Boolean);
    if (moods.length > 0) {
      parts.push(`- Recent moods: ${moods.slice(-3).join(", ")}`);
    }
  }

  // Recent notes (last 3)
  if (memory.notes.length > 0) {
    parts.push("\nRecent insights from conversations:");
    memory.notes.slice(-3).forEach((note) => {
      parts.push(`- [${note.date}] ${note.insight}`);
    });
  }

  // Interaction count
  if (memory.interactionCount > 0) {
    parts.push(`\nTotal interactions with Coach Hamza: ${memory.interactionCount}`);
  }

  return parts.filter(Boolean).join("\n");
}

/**
 * Update user memory with new learnings from a conversation
 */
export function updateMemoryFromConversation(
  currentMemory: UserMemory,
  analysis: ConversationAnalysis
): Partial<UserMemory> {
  const updates: Partial<UserMemory> = {};

  // Update frequent topics (keep last 10)
  if (analysis.topics.length > 0) {
    const allTopics = [...currentMemory.frequentTopics, ...analysis.topics];
    updates.frequentTopics = [...new Set(allTopics)].slice(-10);
  }

  // Update meal preferences
  if (analysis.preferences.mealTypes && analysis.preferences.mealTypes.length > 0) {
    const allMeals = [...currentMemory.preferredMealTypes, ...analysis.preferences.mealTypes];
    updates.preferredMealTypes = [...new Set(allMeals)].slice(-10);
  }

  // Update dietary restrictions
  if (analysis.preferences.dietaryRestrictions && analysis.preferences.dietaryRestrictions.length > 0) {
    const allRestrictions = [...currentMemory.dietaryRestrictions, ...analysis.preferences.dietaryRestrictions];
    updates.dietaryRestrictions = [...new Set(allRestrictions)];
  }

  // Update struggling areas
  if (analysis.insights.strugglingAreas && analysis.insights.strugglingAreas.length > 0) {
    const allStruggles = [...currentMemory.strugglingAreas, ...analysis.insights.strugglingAreas];
    updates.strugglingAreas = [...new Set(allStruggles)].slice(-10);
  }

  // Update achievements
  if (analysis.insights.achievements && analysis.insights.achievements.length > 0) {
    const allAchievements = [...currentMemory.achievements, ...analysis.insights.achievements];
    updates.achievements = [...new Set(allAchievements)].slice(-10);
  }

  return updates;
}
