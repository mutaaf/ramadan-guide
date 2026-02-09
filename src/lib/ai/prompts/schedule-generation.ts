import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";
import { ScheduleGenerationInput } from "../types";
import { NFL_SCHEDULE } from "@/lib/ramadan";

function formatNFLSchedule(): string {
  return NFL_SCHEDULE.map(
    (item) => `- ${item.time}: ${item.activity} (${item.category})`
  ).join("\n");
}

export function buildScheduleGenerationPrompts(input: ScheduleGenerationInput) {
  const systemPrompt = `${COACH_HAMZA_SYSTEM_PROMPT}

## Schedule Generation Mode

You are creating a personalized Ramadan schedule for a Muslim athlete.

REFERENCE - NFL Schedule (extreme baseline used by professional athletes):
${formatNFLSchedule()}

RULES:
1. Prayer times are FIXED anchors - schedule around them
2. Sahoor ends 15+ min before Fajr
3. Iftar is at Maghrib time
4. Training while fasting should be lighter OR scheduled near Iftar
5. Include 5-10 min buffers between activities
6. Ensure user's sleep goal is achievable
7. Be REALISTIC - adapt NFL intensity to the user's actual life
8. Always mark prayer blocks as isFixed: true
9. Use 24-hour format for times (e.g., "06:00", "14:30")

CATEGORIES (use exactly these strings):
- "sleep" - sleeping, naps
- "meal" - sahoor, iftar, snacks, hydration
- "prayer" - all 5 daily prayers + taraweeh
- "quran" - reading/listening to Quran
- "training" - workouts, practice, gym
- "work" - job, school, meetings
- "rest" - breaks, recovery, relaxation
- "other" - everything else

Return valid JSON only, no markdown, no explanation outside JSON:
{
  "blocks": [
    {
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "activity": "Activity name",
      "category": "category",
      "isFixed": true/false
    }
  ],
  "reasoning": "Brief explanation of key scheduling decisions in Coach Hamza's voice",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

  const occupationLabel = {
    student: "Student",
    working: "Working professional",
    athlete: "Full-time athlete",
    flexible: "Flexible schedule",
  }[input.occupation];

  const taraweehLabel = {
    masjid: "At the masjid",
    home: "At home",
    sometimes: "Sometimes",
    skip: "Not planning to pray Taraweeh",
  }[input.taraweeh];

  const userPrompt = `Create a personalized Ramadan daily schedule for this athlete:

## Profile
- Sport: ${input.sport}
- Training Level: ${input.trainingIntensity}
- Occupation: ${occupationLabel}${input.workHours ? ` (${input.workHours})` : ""}

## Training Preferences
- Preferred training time: ${input.preferredTime}
- Session length: ${input.sessionLength}

## Sleep Goals
- Wake time for Sahoor: ${input.wakeTime}
- Sleep needed: ${input.sleepHours} hours

## Spiritual Goals
- Qur'an time: ${input.quranMinutes} minutes daily
- Taraweeh: ${taraweehLabel}

## Prayer Times (FIXED)
- Fajr: ${input.fajr}
- Dhuhr: ${input.dhuhr}
- Asr: ${input.asr}
- Maghrib: ${input.maghrib} (Iftar time)
- Isha: ${input.isha}

${input.specialNotes ? `## Special Considerations\n${input.specialNotes}` : ""}

Create a complete 24-hour schedule that:
1. Ensures all 5 prayers are included at their correct times
2. Includes Sahoor before Fajr and Iftar at Maghrib
3. Fits training around their preferred time
4. Achieves their sleep goal
5. Includes Qur'an time
6. Is realistic and sustainable for their lifestyle`;

  return { systemPrompt, userPrompt };
}
