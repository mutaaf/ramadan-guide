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

## Your Personal Ramadan Coach Mode

You are Coach Hamza, creating a personalized Ramadan daily routine. You coach both athletes AND non-athletes — anyone who wants to make the most of their Ramadan. Speak directly to them in first person - you've done this yourself for 8 NFL seasons.

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

CRITICAL: Return ONLY valid JSON. No markdown code blocks, no explanation text, no text before or after the JSON.
Your entire response must be valid JSON starting with { and ending with }

Response format:
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
    practicing: "Practicing Muslim (no structured training)",
  }[input.occupation];

  const isPracticing = input.occupation === "practicing";

  const taraweehLabel = {
    masjid: "At the masjid",
    home: "At home",
    sometimes: "Sometimes",
    skip: "Not planning to pray Taraweeh",
  }[input.taraweeh];

  const userPrompt = `Create a personalized Ramadan daily routine for this ${isPracticing ? "Muslim" : "athlete"}. In your reasoning, speak directly to them as their coach - you know what works because you've done this yourself:

## Profile
- ${isPracticing ? "Focus" : "Sport"}: ${isPracticing ? "Faith & wellness (no structured training)" : input.sport}
- ${isPracticing ? "Activity Level" : "Training Level"}: ${isPracticing ? "General wellness" : input.trainingIntensity}
- Occupation: ${occupationLabel}${input.workHours ? ` (${input.workHours})` : ""}

## ${isPracticing ? "Activity" : "Training"} Preferences
- Preferred ${isPracticing ? "activity" : "training"} time: ${input.preferredTime}
- Session length: ${input.sessionLength}
${isPracticing ? "\nIMPORTANT: This person is NOT an athlete. Instead of training blocks, schedule extra ibadah (dhikr, dua, Islamic study), self-care (light walks, stretching), family time, or community service. Focus on spiritual growth and daily wellness." : ""}

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
