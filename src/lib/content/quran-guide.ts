// Qur'an reading guidance for Ramadan

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  dailyTarget: string;
  totalDays: number;
  tips: string[];
}

export interface RecommendedSurah {
  number: number;
  name: string;
  arabicName: string;
  meaning: string;
  verses: number;
  reason: string;
  bestTime?: string;
  athleteConnection?: string;
}

export const READING_PLANS: ReadingPlan[] = [
  {
    id: "complete",
    name: "Complete Khatm",
    description: "Complete the entire Qur'an during Ramadan",
    dailyTarget: "1 Juz (20 pages) per day",
    totalDays: 30,
    tips: [
      "Read after Fajr when mind is fresh",
      "Split into smaller sessions: after each prayer",
      "Use audio recitation during commute or workouts",
      "Read during Iftar waiting time",
      "Double up on short days to build buffer",
    ],
  },
  {
    id: "half",
    name: "Half Completion",
    description: "Complete 15 Juz during Ramadan",
    dailyTarget: "Half a Juz (10 pages) per day",
    totalDays: 30,
    tips: [
      "Perfect for busy training schedules",
      "Focus on understanding over speed",
      "Read with translation if helpful",
      "Quality of reflection over quantity",
      "Can complete remaining after Ramadan",
    ],
  },
  {
    id: "focused",
    name: "Focused Study",
    description: "Deep dive into selected surahs with tafsir",
    dailyTarget: "1-2 pages with reflection",
    totalDays: 30,
    tips: [
      "Choose surahs that speak to your situation",
      "Use tafsir (explanation) to understand deeply",
      "Journal your reflections",
      "Memorize key ayahs",
      "Apply lessons to daily life and sport",
    ],
  },
  {
    id: "memorization",
    name: "Memorization Focus",
    description: "Focus on memorizing new surahs",
    dailyTarget: "5-10 verses per day",
    totalDays: 30,
    tips: [
      "Start with shorter surahs from Juz 30",
      "Review previous memorization daily",
      "Recite what you know in prayer",
      "Use repetition during light training",
      "Perfect pronunciation before moving on",
    ],
  },
];

export const RECOMMENDED_SURAHS: RecommendedSurah[] = [
  {
    number: 36,
    name: "Ya-Sin",
    arabicName: "يس",
    meaning: "The Heart of the Qur'an",
    verses: 83,
    reason: "Known as the 'heart of the Qur'an.' Covers resurrection, prophets, and signs of Allah. Brings peace and clarity.",
    bestTime: "After Fajr or before sleeping",
    athleteConnection: "Just as the heart powers your body, this surah powers your spirit. Read it for strength and conviction.",
  },
  {
    number: 67,
    name: "Al-Mulk",
    arabicName: "الملك",
    meaning: "The Sovereignty",
    verses: 30,
    reason: "Protects from punishment of the grave. Intercedes for its reciter. Short enough to memorize.",
    bestTime: "Every night before sleep",
    athleteConnection: "Allah is the King of all — including the field, court, and ring. Remember who truly grants victory.",
  },
  {
    number: 18,
    name: "Al-Kahf",
    arabicName: "الكهف",
    meaning: "The Cave",
    verses: 110,
    reason: "Light between two Fridays. Protection from Dajjal. Stories of faith, patience, and trust in Allah.",
    bestTime: "Friday, between Fajr and Maghrib",
    athleteConnection: "The youth of the cave sacrificed comfort for faith. Your sacrifices in Ramadan are training for greater tests.",
  },
  {
    number: 55,
    name: "Ar-Rahman",
    arabicName: "الرحمن",
    meaning: "The Most Merciful",
    verses: 78,
    reason: "The 'Beauty of the Qur'an.' Lists countless blessings. The refrain 'Which favors will you deny?' brings gratitude.",
    bestTime: "When feeling low or ungrateful",
    athleteConnection: "Count your blessings: your health, your ability, your sport. Every athletic gift is from Ar-Rahman.",
  },
  {
    number: 56,
    name: "Al-Waqi'ah",
    arabicName: "الواقعة",
    meaning: "The Event",
    verses: 96,
    reason: "Protection from poverty. Describes the Day of Judgment and the three groups of people.",
    bestTime: "Every night",
    athleteConnection: "On the ultimate competition day, only three placements matter. Which group will you be in?",
  },
  {
    number: 2,
    name: "Al-Baqarah",
    arabicName: "البقرة",
    meaning: "The Cow",
    verses: 286,
    reason: "Protection for the home. Contains Ayatul Kursi. Longest surah with comprehensive guidance.",
    bestTime: "Read over 3-5 days; last two verses nightly",
    athleteConnection: "Like a playbook for life. Study it thoroughly — it covers every situation you'll face.",
  },
  {
    number: 112,
    name: "Al-Ikhlas",
    arabicName: "الإخلاص",
    meaning: "Sincerity / Purity of Faith",
    verses: 4,
    reason: "Equal to one-third of the Qur'an in reward. Pure declaration of Tawheed (oneness of Allah).",
    bestTime: "In every prayer, multiple times daily",
    athleteConnection: "Four verses, maximum impact. Like a perfect play — simple, pure, unstoppable.",
  },
  {
    number: 1,
    name: "Al-Fatihah",
    arabicName: "الفاتحة",
    meaning: "The Opening",
    verses: 7,
    reason: "The greatest surah. Recited in every rak'ah of prayer. The essence of the Qur'an.",
    bestTime: "Every prayer — master it, understand it deeply",
    athleteConnection: "You recite this 17+ times daily in prayer. Make every recitation count. It's your direct communication with Allah.",
  },
  {
    number: 93,
    name: "Ad-Duha",
    arabicName: "الضحى",
    meaning: "The Morning Hours",
    verses: 11,
    reason: "Revealed to comfort the Prophet during difficult times. A surah of hope and reassurance.",
    bestTime: "When feeling down or struggling",
    athleteConnection: "After every hard loss comes victory. 'And the Hereafter is better for you than the first.' Keep pushing.",
  },
  {
    number: 94,
    name: "Ash-Sharh",
    arabicName: "الشرح",
    meaning: "The Relief / The Expansion",
    verses: 8,
    reason: "'With hardship comes ease' — repeated twice for emphasis. Ultimate source of comfort.",
    bestTime: "When facing challenges",
    athleteConnection: "Every athlete faces setbacks. This surah is your reminder: the breakthrough is coming.",
  },
  {
    number: 103,
    name: "Al-Asr",
    arabicName: "العصر",
    meaning: "The Time",
    verses: 3,
    reason: "Summary of the entire Qur'an in three verses. The formula for salvation.",
    bestTime: "Memorize and reflect daily",
    athleteConnection: "Time is running out — in the game and in life. Use it for faith, good deeds, truth, and patience.",
  },
  {
    number: 114,
    name: "An-Nas",
    arabicName: "الناس",
    meaning: "Mankind",
    verses: 6,
    reason: "Protection from evil whispers. Final surah of the Qur'an. Essential for spiritual protection.",
    bestTime: "Morning and evening adhkar",
    athleteConnection: "Protect yourself from the whispers of doubt before competition. Seek refuge in Allah.",
  },
];

export function getReadingPlan(id: string): ReadingPlan | undefined {
  return READING_PLANS.find((p) => p.id === id);
}

export function formatQuranGuideForAI(): string {
  return `
## Qur'an Reading Plans for Ramadan

${READING_PLANS.map((plan) => `
### ${plan.name}
**Goal:** ${plan.description}
**Daily Target:** ${plan.dailyTarget}
**Tips:**
${plan.tips.map((t) => `- ${t}`).join("\n")}
`).join("\n")}

## Recommended Surahs for Athletes

${RECOMMENDED_SURAHS.map((surah) => `
### Surah ${surah.number}: ${surah.name} (${surah.arabicName})
**Meaning:** ${surah.meaning}
**Verses:** ${surah.verses}
**Why Read It:** ${surah.reason}
${surah.bestTime ? `**Best Time:** ${surah.bestTime}` : ""}
${surah.athleteConnection ? `**For Athletes:** ${surah.athleteConnection}` : ""}
`).join("\n")}
`;
}
