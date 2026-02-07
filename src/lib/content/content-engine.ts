// Content Engine for personalized quotes, hadiths, and verses
import { DayEntry } from "@/store/useStore";
import { Hadith, HADITHS } from "./hadiths";
import { Verse, VERSES } from "./verses";

// Content item that can be either a hadith or verse
export type ContentItem =
  | { type: "hadith"; content: Hadith }
  | { type: "verse"; content: Verse }
  | { type: "quote"; content: Quote };

export interface Quote {
  id: string;
  text: string;
  source: string;
  theme: ContentTheme;
}

export type ContentTheme =
  | "fasting"
  | "reward"
  | "behavior"
  | "sahoor"
  | "iftar"
  | "strength"
  | "motivation"
  | "mercy"
  | "forgiveness"
  | "patience"
  | "gratitude"
  | "trust"
  | "quran";

export type ContentContext =
  | "home"
  | "dashboard"
  | "quran"
  | "community"
  | "error"
  | "not-found";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type RamadanPhase = "early" | "middle" | "late";

export interface UserContext {
  // From store
  days: Record<string, DayEntry>;
  juzProgress: number[];
  userName?: string;

  // Computed
  timeOfDay: TimeOfDay;
  ramadanDay: number;
  ramadanPhase: RamadanPhase;

  // Analysis
  struggles: string[];
  achievements: string[];
}

// Theme mappings for different user states
const THEME_MAPPINGS = {
  struggles: {
    hydration: ["sahoor", "iftar", "strength"] as ContentTheme[],
    sleep: ["strength", "behavior"] as ContentTheme[],
    prayer: ["reward", "motivation"] as ContentTheme[],
    quran: ["reward", "motivation", "quran"] as ContentTheme[],
    fasting: ["fasting", "strength", "motivation"] as ContentTheme[],
  },
  achievements: {
    "perfect-prayers": ["reward", "mercy"] as ContentTheme[],
    "hydration-goal": ["strength", "reward"] as ContentTheme[],
    "quran-progress": ["reward", "motivation", "quran"] as ContentTheme[],
    "prayer-streak": ["reward", "mercy", "motivation"] as ContentTheme[],
  },
  timeOfDay: {
    morning: ["sahoor", "fasting", "motivation"] as ContentTheme[],
    afternoon: ["patience", "strength"] as ContentTheme[],
    evening: ["iftar", "reward", "gratitude"] as ContentTheme[],
    night: ["mercy", "forgiveness", "reward"] as ContentTheme[],
  },
  ramadanPhase: {
    early: ["mercy", "motivation", "fasting"] as ContentTheme[],
    middle: ["forgiveness", "behavior", "patience"] as ContentTheme[],
    late: ["reward", "mercy", "motivation"] as ContentTheme[],
  },
  context: {
    home: ["motivation", "mercy", "reward"] as ContentTheme[],
    dashboard: ["reward", "motivation", "gratitude"] as ContentTheme[],
    quran: ["quran", "reward", "motivation"] as ContentTheme[],
    community: ["behavior", "mercy", "gratitude"] as ContentTheme[],
    error: ["patience", "trust", "mercy"] as ContentTheme[],
    "not-found": ["trust", "patience", "mercy"] as ContentTheme[],
  },
};

// Cache key generator
function getCacheKey(context: ContentContext): string {
  const today = new Date().toISOString().split("T")[0];
  return `daily-wisdom-${context}-${today}`;
}

// Get cached selection
function getCachedSelection(context: ContentContext): ContentItem | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(getCacheKey(context));
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

// Set cached selection
function setCachedSelection(context: ContentContext, item: ContentItem): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(getCacheKey(context), JSON.stringify(item));
  } catch {
    // Ignore cache errors
  }
}

// Get time of day
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// Get Ramadan phase
export function getRamadanPhase(day: number): RamadanPhase {
  if (day <= 10) return "early";
  if (day <= 20) return "middle";
  return "late";
}

// Analyze user struggles from recent days
function analyzeStruggles(days: Record<string, DayEntry>): string[] {
  const struggles: string[] = [];
  const dayEntries = Object.values(days).slice(-7); // Last 7 days

  if (dayEntries.length === 0) return ["new-user"];

  // Hydration analysis
  const avgHydration =
    dayEntries.reduce((sum, d) => sum + d.glassesOfWater, 0) / dayEntries.length;
  if (avgHydration < 6) struggles.push("hydration");

  // Sleep analysis
  const avgSleep =
    dayEntries.reduce((sum, d) => sum + d.hoursOfSleep, 0) / dayEntries.length;
  if (avgSleep < 6) struggles.push("sleep");

  // Prayer analysis
  const missedPrayers = dayEntries.filter((d) => {
    const prayers = Object.values(d.prayers).filter(Boolean).length;
    return prayers < 5;
  }).length;
  if (missedPrayers > 2) struggles.push("prayer");

  // Fasting analysis
  const missedFasts = dayEntries.filter((d) => !d.fasted).length;
  if (missedFasts > 0) struggles.push("fasting");

  return struggles;
}

// Analyze user achievements
function analyzeAchievements(
  days: Record<string, DayEntry>,
  juzProgress: number[]
): string[] {
  const achievements: string[] = [];
  const dayEntries = Object.values(days)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Prayer streak
  let streak = 0;
  for (const d of dayEntries) {
    const all5 =
      d.prayers.fajr &&
      d.prayers.dhur &&
      d.prayers.asr &&
      d.prayers.maghrib &&
      d.prayers.ishaa;
    if (all5) streak++;
    else break;
  }
  if (streak >= 3) achievements.push("prayer-streak");

  // Hydration goal met today
  const today = dayEntries[0];
  if (today && today.glassesOfWater >= 8) {
    achievements.push("hydration-goal");
  }

  // Quran progress
  const juzDone = juzProgress.filter((p) => p === 100).length;
  if (juzDone >= 5) achievements.push("quran-progress");

  // Perfect prayers today
  if (today) {
    const prayers = Object.values(today.prayers).filter(Boolean).length;
    if (prayers === 6) achievements.push("perfect-prayers");
  }

  return achievements;
}

// Score a content item against user context
function scoreContent(
  item: ContentItem,
  context: UserContext,
  pageContext: ContentContext
): number {
  let score = 0;
  const theme = item.type === "hadith" ? item.content.theme : item.content.theme;

  // Theme match with struggles (+3)
  for (const struggle of context.struggles) {
    const themes = THEME_MAPPINGS.struggles[struggle as keyof typeof THEME_MAPPINGS.struggles];
    if (themes && themes.includes(theme as ContentTheme)) {
      score += 3;
    }
  }

  // Theme match with achievements (+2)
  for (const achievement of context.achievements) {
    const themes = THEME_MAPPINGS.achievements[achievement as keyof typeof THEME_MAPPINGS.achievements];
    if (themes && themes.includes(theme as ContentTheme)) {
      score += 2;
    }
  }

  // Time relevance (+2)
  const timeThemes = THEME_MAPPINGS.timeOfDay[context.timeOfDay];
  if (timeThemes.includes(theme as ContentTheme)) {
    score += 2;
  }

  // Phase relevance (+2)
  const phaseThemes = THEME_MAPPINGS.ramadanPhase[context.ramadanPhase];
  if (phaseThemes.includes(theme as ContentTheme)) {
    score += 2;
  }

  // Page context relevance (+1)
  const contextThemes = THEME_MAPPINGS.context[pageContext];
  if (contextThemes.includes(theme as ContentTheme)) {
    score += 1;
  }

  return score;
}

// Date-seeded random for stable daily selection
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 1000) / 1000;
}

// Get all content items
function getAllContent(): ContentItem[] {
  const items: ContentItem[] = [];

  // Add hadiths
  for (const hadith of HADITHS) {
    items.push({ type: "hadith", content: hadith });
  }

  // Add verses
  for (const verse of VERSES) {
    items.push({ type: "verse", content: verse });
  }

  return items;
}

// Main selection function
export function selectContent(
  pageContext: ContentContext,
  days: Record<string, DayEntry>,
  juzProgress: number[],
  ramadanDay: number = 1,
  userName?: string
): ContentItem {
  // Check cache first
  const cached = getCachedSelection(pageContext);
  if (cached) {
    return cached;
  }

  // Build user context
  const userContext: UserContext = {
    days,
    juzProgress,
    userName,
    timeOfDay: getTimeOfDay(),
    ramadanDay,
    ramadanPhase: getRamadanPhase(ramadanDay),
    struggles: analyzeStruggles(days),
    achievements: analyzeAchievements(days, juzProgress),
  };

  // Get all content and score
  const allContent = getAllContent();
  const scored = allContent.map((item) => ({
    item,
    score: scoreContent(item, userContext, pageContext),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Get top 5 candidates
  const topCandidates = scored.slice(0, 5);

  // Use date-seeded selection for stability
  const today = new Date().toISOString().split("T")[0];
  const seed = `${today}-${pageContext}`;
  const randomIndex = Math.floor(seededRandom(seed) * topCandidates.length);

  const selected = topCandidates[randomIndex].item;

  // Cache the selection
  setCachedSelection(pageContext, selected);

  return selected;
}

// Convenience function for getting content text
export function getContentText(item: ContentItem): { text: string; source: string } {
  if (item.type === "hadith") {
    return {
      text: item.content.text,
      source: item.content.source,
    };
  } else if (item.type === "verse") {
    return {
      text: item.content.text,
      source: `Qur'an ${item.content.reference}`,
    };
  } else {
    return {
      text: item.content.text,
      source: item.content.source,
    };
  }
}
