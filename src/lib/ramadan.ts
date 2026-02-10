// Ramadan dates (approximate — these shift yearly based on moon sighting)
// For 2025: ~Feb 28 - Mar 29
// For 2026: ~Feb 17 - Mar 18
const RAMADAN_DATES: Record<number, { start: string; end: string }> = {
  2025: { start: "2025-02-28", end: "2025-03-29" },
  2026: { start: "2026-02-17", end: "2026-03-18" },
  2027: { start: "2027-02-07", end: "2027-03-08" },
};

// App phases for year-round tracking
export type AppPhase = "pre-ramadan" | "ramadan" | "post-ramadan";

export interface PhaseInfo {
  phase: AppPhase;
  dayOfRamadan: number;      // 1-30 during Ramadan, 0 otherwise
  daysUntilRamadan: number;  // Days until next Ramadan starts
  daysSinceRamadan: number;  // Days since Ramadan ended (0 if before/during)
  currentYear: number;
  ramadanYear: number;       // Which year's Ramadan we're tracking toward/in
  ramadanStartDate: string;  // YYYY-MM-DD format
  ramadanEndDate: string;    // YYYY-MM-DD format
}

export function getPhaseInfo(): PhaseInfo {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Check current year and next year for relevant Ramadan dates
  for (const y of [currentYear, currentYear + 1]) {
    const dates = RAMADAN_DATES[y];
    if (!dates) continue;

    const start = new Date(dates.start + "T00:00:00");
    const end = new Date(dates.end + "T23:59:59");

    // Currently in Ramadan
    if (now >= start && now <= end) {
      const dayOfRamadan = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return {
        phase: "ramadan",
        dayOfRamadan,
        daysUntilRamadan: 0,
        daysSinceRamadan: 0,
        currentYear,
        ramadanYear: y,
        ramadanStartDate: dates.start,
        ramadanEndDate: dates.end,
      };
    }

    // Before this Ramadan (pre-ramadan)
    if (now < start) {
      const diff = start.getTime() - now.getTime();
      const daysUntil = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return {
        phase: "pre-ramadan",
        dayOfRamadan: 0,
        daysUntilRamadan: daysUntil,
        daysSinceRamadan: 0,
        currentYear,
        ramadanYear: y,
        ramadanStartDate: dates.start,
        ramadanEndDate: dates.end,
      };
    }

    // After this Ramadan - check if next year's Ramadan is closer
    if (now > end) {
      const nextYearDates = RAMADAN_DATES[y + 1];
      if (nextYearDates) {
        const nextStart = new Date(nextYearDates.start + "T00:00:00");
        const diffToNext = nextStart.getTime() - now.getTime();
        const diffSinceEnd = now.getTime() - end.getTime();
        const daysUntil = Math.ceil(diffToNext / (1000 * 60 * 60 * 24));
        const daysSince = Math.floor(diffSinceEnd / (1000 * 60 * 60 * 24));

        return {
          phase: "post-ramadan",
          dayOfRamadan: 0,
          daysUntilRamadan: daysUntil,
          daysSinceRamadan: daysSince,
          currentYear,
          ramadanYear: y + 1, // Tracking toward next year
          ramadanStartDate: nextYearDates.start,
          ramadanEndDate: nextYearDates.end,
        };
      }
    }
  }

  // Fallback for years not in our dates
  const fallback = RAMADAN_DATES[2025];
  return {
    phase: "post-ramadan",
    dayOfRamadan: 0,
    daysUntilRamadan: 0,
    daysSinceRamadan: 0,
    currentYear,
    ramadanYear: 2025,
    ramadanStartDate: fallback.start,
    ramadanEndDate: fallback.end,
  };
}

export function getRamadanDates(year?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  return RAMADAN_DATES[y] ?? RAMADAN_DATES[2025];
}

export function getRamadanCountdown(): {
  days: number;
  hours: number;
  minutes: number;
  active: boolean;
  dayOfRamadan: number;
} {
  const phaseInfo = getPhaseInfo();

  if (phaseInfo.phase === "ramadan") {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      active: true,
      dayOfRamadan: phaseInfo.dayOfRamadan,
    };
  }

  if (phaseInfo.phase === "pre-ramadan") {
    const now = new Date();
    const start = new Date(phaseInfo.ramadanStartDate + "T00:00:00");
    const diff = start.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes, active: false, dayOfRamadan: 0 };
  }

  // Post-ramadan - count down to next Ramadan
  const now = new Date();
  const nextStart = new Date(phaseInfo.ramadanStartDate + "T00:00:00");
  const diff = nextStart.getTime() - now.getTime();

  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes, active: false, dayOfRamadan: 0 };
  }

  return { days: 0, hours: 0, minutes: 0, active: false, dayOfRamadan: 0 };
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const CHECKLIST_ITEMS = [
  { key: "hydration", label: "Hydration Preparation" },
  { key: "accountability", label: "Accountability Partner" },
  { key: "surah", label: "Primary Surah to Read and Recite" },
  { key: "fasting-plan", label: "Fasting Plan" },
  { key: "training-plan", label: "Training and Competing Plan" },
  { key: "clear-heart", label: "Clear heart of hate and ill-will" },
  { key: "goals", label: "Set Ramadan Goals" },
  { key: "fast-from", label: "Choose something else to Fast from" },
  { key: "duaa", label: "Ask Allah to make it easy" },
];

export const CHALLENGES = [
  { key: "hadith", label: "Memorize an Authentic Hadith" },
  { key: "invite", label: "Invite a Non-Muslim friend or family over for Iftar" },
  { key: "interfaith", label: "Attend an interfaith event" },
  { key: "elderly", label: "Volunteer at a Home for the Elderly" },
  { key: "donate-quran", label: "Donate a Qur'an" },
  { key: "iftar-setup", label: "Help setup Iftar at the Masjid" },
  { key: "homeless", label: "Feed the Homeless" },
  { key: "seerah", label: "Read a book on the Seerah of the Prophet" },
  { key: "smile", label: "Smile" },
  { key: "surah-new", label: "Memorize a new Surah" },
];

export const HYDRATION_OPTIONS = [
  { name: "Coconut Water", timing: "Sahoor & Iftar" },
  { name: "Sports Drink", timing: "Iftar" },
  { name: "Water", timing: "Sahoor & Iftar" },
  { name: "Pickle Juice", timing: "Iftar" },
  { name: "Protein Shake", timing: "Post Taraweeh" },
  { name: "Electrolyte Drink", timing: "Sahoor & Iftar" },
  { name: "Cucumber Juice", timing: "Iftar" },
  { name: "Watermelon Juice", timing: "Iftar" },
  { name: "Fruit Smoothie", timing: "Sahoor & Iftar" },
];

export const PRONUNCIATION_GUIDE = [
  { term: "Duaa", phonetic: "Do-aa", meaning: "Prayer to Allah" },
  { term: "Ramadan", phonetic: "Ra-ma-dhan", meaning: "Ninth Month of Islamic Calendar" },
  { term: "Mubarak", phonetic: "Moo-ba-rek", meaning: "Blessed" },
  { term: "Salams", phonetic: "Sa-laam-s", meaning: "Peace" },
  { term: "Masjid", phonetic: "Mass-jid", meaning: "Mosque; Muslim's Place of Worship" },
  { term: "Sahoor", phonetic: "Sa-hoor", meaning: "Beginning of the Fast Meal" },
  { term: "Iftar", phonetic: "If-tar", meaning: "Closing of the Fast Meal" },
  { term: "Layla tul Qadr", phonetic: "Lay-la-tool-Qa-der", meaning: "Night of Power" },
  { term: "Qur'an", phonetic: "Qoor-ann", meaning: "Final Revelation and Muslim Holy Book" },
  { term: "Surah", phonetic: "Soor-aah", meaning: "Chapters in the Qur'an; 114 Total" },
  { term: "Ayah", phonetic: "Eye-aah", meaning: "Verses in the Qur'an" },
  { term: "Juz", phonetic: "Ju-zz", meaning: "Sections in the Qur'an; 30 Total" },
  { term: "Rak'ah", phonetic: "Ra-Ka-ah", meaning: "A single unit of prayer" },
  { term: "Salah", phonetic: "Sa-laah", meaning: "One of the five daily prayers" },
  { term: "Taraweeh", phonetic: "Ta-ra-weee", meaning: "Night prayers offered in Ramadan" },
  { term: "Alhamdulillah", phonetic: "Al-Ham-doo-lee-la", meaning: "All Praises are to Allah" },
  { term: "SubhanAllah", phonetic: "Soob-ha-na-la", meaning: "Supreme Glory to Allah" },
  { term: "Laillhaillallah", phonetic: "La-e-la-ha-ila-la", meaning: "There is no God but Allah" },
  { term: "Allahu Akbar", phonetic: "Allah-who-ak-bar", meaning: "Allah is the Greatest" },
  { term: "Sunnah", phonetic: "Soo-Nuh", meaning: "The Path of Prophet Muhammad" },
  { term: "InshaAllah", phonetic: "In-shaa-Allah", meaning: "God willing" },
  { term: "Astaghfirullah", phonetic: "Arr-staa-g-fee-roo-la", meaning: "God forgive me" },
  { term: "As-Salamu-Alaikum", phonetic: "ahs-sa-lamb-oo-alay-koom", meaning: "Peace be unto you" },
];

export const FIVE_PILLARS = [
  { name: "Shahadah", phonetic: "Sha-haa-duh", description: "To testify that there is no deity worthy of worship except Allah, and that Muhammad is His last and final Prophet" },
  { name: "Salah", phonetic: "Suh-la", description: "To perform the five daily prayers: Fajr, Dhur, Asr, Maghrib, and Ishaa" },
  { name: "Zakah", phonetic: "Zuh-kah", description: "To give 2.5% of your wealth to charity every year" },
  { name: "Sawm", phonetic: "So-mm", description: "To fast the month of Ramadan; as long as you are healthy and at home" },
  { name: "Hajj", phonetic: "Ha-jj", description: "To perform the pilgrimage to the House in Mecca, Saudi Arabia; as long as you are healthy and wealthy enough" },
];

export const TRANSITION_STEPS = [
  { number: 1, title: "DUA", description: "Say a sincere prayer and intention to transition our life permanently toward Allah and away from that which takes us away from Him." },
  { number: 2, title: "PILLARS", description: "Prioritize the Five Pillars of Islam: Shahadah, Salah, Zakah, Sawm, and Hajj." },
  { number: 3, title: "QUR'AN", description: "Establish your Qur'an as your BFF. Listen to your BFF morning and night. Reiterate and Recite everything your BFF says." },
  { number: 4, title: "DISTANCE", description: "Get away from that sin that you are currently in or have a habit of returning to. Get away from individuals and groups that remind you of that sin." },
  { number: 5, title: "FORGIVENESS", description: "Ask Allah to forgive you for all of your sins. The ones you know about and the ones you don't. The ones done in secret and in the open." },
];

export const SELF_CARE_TIPS = [
  "Don't accept every invitation",
  "Take time off Social Media",
  "Take daily scheduled breaks",
  "Don't try and do everything",
  "Don't compare your Ramadan to others",
  "Take naps",
];

export const SCHEDULE_CATEGORY_COLORS: Record<string, string> = {
  sleep: "#6366f1",
  meal: "#c9a84c",
  prayer: "#2d6a4f",
  quran: "#c9a84c",
  training: "#ef4444",
  rest: "#8b5cf6",
  work: "#64748b",
  meeting: "#64748b",
  travel: "#94a3b8",
  other: "#94a3b8",
};

export const NFL_SCHEDULE = [
  { time: "4:30 AM", activity: "Wake Up", category: "sleep" },
  { time: "4:45 AM", activity: "Sahoor", category: "meal" },
  { time: "5:30 AM", activity: "Fajr Prayer", category: "prayer" },
  { time: "6:00 AM", activity: "Read Qur'an", category: "quran" },
  { time: "6:15 AM", activity: "Head to Facility", category: "travel" },
  { time: "6:30 AM", activity: "Weight Room", category: "training" },
  { time: "8:00 AM", activity: "Training Room / Tape", category: "training" },
  { time: "9:00 AM", activity: "Practice (Full Pads)", category: "training" },
  { time: "11:30 AM", activity: "End Practice", category: "training" },
  { time: "12:00 PM", activity: "Shower", category: "rest" },
  { time: "12:15 PM", activity: "Dhur Prayer", category: "prayer" },
  { time: "12:30 PM", activity: "Qur'an + Nap", category: "rest" },
  { time: "1:30 PM", activity: "Head to Meetings", category: "travel" },
  { time: "2:00 PM", activity: "Position Meetings", category: "meeting" },
  { time: "3:00 PM", activity: "Training Room / Tape", category: "training" },
  { time: "4:00 PM", activity: "Special Teams Practice", category: "training" },
  { time: "4:45 PM", activity: "Second Practice", category: "training" },
  { time: "6:30 PM", activity: "Cold Plunge / Shower", category: "rest" },
  { time: "7:00 PM", activity: "Asr Prayer", category: "prayer" },
  { time: "7:30 PM", activity: "Iftar", category: "meal" },
  { time: "7:35 PM", activity: "Maghrib Prayer", category: "prayer" },
  { time: "7:45 PM", activity: "Dinner", category: "meal" },
  { time: "8:00 PM", activity: "Team Meeting", category: "meeting" },
  { time: "8:30 PM", activity: "Position Meeting", category: "meeting" },
  { time: "9:30 PM", activity: "End Meetings", category: "meeting" },
  { time: "10:00 PM", activity: "Hydration", category: "meal" },
  { time: "10:30 PM", activity: "Family Call", category: "rest" },
  { time: "11:00 PM", activity: "Ishaa Prayer + Qur'an + Sleep", category: "prayer" },
  { time: "2:00 AM", activity: "Water + Protein + Tahajjud", category: "prayer" },
];
