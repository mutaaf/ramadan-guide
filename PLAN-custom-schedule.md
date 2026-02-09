# Custom Schedule Builder Feature Plan

## Overview

Create an LLM-driven interactive schedule builder that helps users create a personalized Ramadan daily routine. Uses the NFL Schedule from Coach Hamza's book as an "extreme baseline" reference while adapting to each user's unique circumstances.

---

## Feature Goals

1. **Personalization**: Generate schedules tailored to user's sport, training intensity, work/school, and lifestyle
2. **Interactive**: Conversational flow with probing questions, not a static form
3. **AI-Driven**: LLM generates schedule based on gathered context
4. **Flexible**: Users can edit, adjust, and regenerate their schedule
5. **Actionable**: Schedule integrates with prayer times and sends optional reminders

---

## Architecture

### Phase 1: Data Structures

**New Store Fields** (add to `useStore.ts`):

```typescript
interface ScheduleBlock {
  id: string;
  startTime: string;      // "06:00" 24h format
  endTime: string;        // "07:00"
  activity: string;       // "Morning Workout"
  category: ScheduleCategory;
  isFixed: boolean;       // Prayer times = fixed, others = flexible
  notes?: string;
}

type ScheduleCategory =
  | "sleep"
  | "meal"
  | "prayer"
  | "quran"
  | "training"
  | "work"
  | "school"
  | "rest"
  | "family"
  | "commute"
  | "other";

interface CustomSchedule {
  id: string;
  name: string;           // "Weekday Schedule", "Game Day", etc.
  blocks: ScheduleBlock[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

interface SchedulePreferences {
  hasCustomSchedule: boolean;
  schedules: CustomSchedule[];
  activeScheduleId: string | null;

  // Gathered from wizard
  occupation: "student" | "working" | "athlete-only" | "other";
  workSchoolStart?: string;   // "09:00"
  workSchoolEnd?: string;     // "17:00"
  commuteMinutes: number;
  preferredTrainingTime: "morning" | "afternoon" | "evening" | "flexible";
  sleepGoalHours: number;
  wakeUpTime: string;         // Target wake time
  hasFamilyTime: boolean;
  familyTimePreference?: "after-iftar" | "after-taraweeh" | "flexible";
}
```

### Phase 2: Schedule Wizard Flow

**New Page**: `/tracker/schedule/customize/page.tsx`

**Wizard Steps** (conversational, one question at a time):

1. **Intro Screen**
   - Show Coach Hamza explaining the feature
   - "Let's build your personalized Ramadan schedule together"
   - Option to see NFL baseline for inspiration

2. **Occupation Question**
   - "What's your main daily commitment?"
   - Options: Student, Working Professional, Full-time Athlete, Other
   - Follow-up: Work/school hours if applicable

3. **Training Question**
   - "When do you prefer to train?"
   - Options: Morning (before work/school), Afternoon, Evening (after work), Flexible
   - Follow-up: How many hours per day?

4. **Sleep Question**
   - "What time do you want to wake up for Sahoor?"
   - Time picker (default based on Fajr time - 45min)
   - "How many hours of sleep do you need to feel good?"

5. **Family/Social Question**
   - "Do you have family time you want to protect?"
   - Options: Yes (after Iftar), Yes (after Taraweeh), Flexible, No

6. **Qur'an Goals Question**
   - "How much Qur'an time do you want daily?"
   - Options: 15 min, 30 min, 1 hour, More
   - "When works best?" Morning, After Fajr, After Dhur, Evening

7. **Commute Question**
   - "How long is your commute?"
   - Quick options: None (WFH), 15 min, 30 min, 45 min, 1 hour+

8. **Special Considerations**
   - Free text: "Anything else I should know about your schedule?"
   - Examples shown: "I have team meetings at 2pm", "Taraweeh at my masjid is 10pm"

9. **Generation Screen**
   - Show loading animation
   - LLM generates personalized schedule
   - Display schedule preview

10. **Review & Edit**
    - Show generated schedule in editable format
    - Drag to adjust times
    - Add/remove blocks
    - Save or regenerate

### Phase 3: AI Prompt for Schedule Generation

**New AI Feature Type** (add to `types.ts`):

```typescript
interface ScheduleGenerationInput {
  // From user profile
  sport: string;
  trainingIntensity: string;
  experienceLevel: string;

  // From wizard
  occupation: string;
  workSchoolHours?: { start: string; end: string };
  commuteMinutes: number;
  preferredTrainingTime: string;
  sleepGoalHours: number;
  wakeUpTime: string;
  familyTimePreference?: string;
  quranGoalMinutes: number;
  quranPreferredTime: string;
  specialConsiderations?: string;

  // From app
  prayerTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };

  // Reference
  nflSchedule: ScheduleItem[];  // For context
}

interface ScheduleGenerationOutput {
  schedule: {
    startTime: string;
    endTime: string;
    activity: string;
    category: string;
    notes?: string;
  }[];
  reasoning: string;           // Brief explanation of key decisions
  tips: string[];              // 2-3 tips for following the schedule
  adjustmentSuggestions: string[];  // Things to tweak based on how it goes
}
```

**New Prompt File**: `src/lib/ai/prompts/schedule-generation.ts`

```typescript
export function buildScheduleGenerationPrompts(input: ScheduleGenerationInput) {
  const system = `You are Coach Hamza, helping create a personalized Ramadan daily schedule.

REFERENCE - NFL Athlete's Ramadan Schedule (extreme baseline):
${formatNFLSchedule(input.nflSchedule)}

This NFL schedule shows what's possible at the highest level. Adapt it to the user's reality.

RULES:
1. Prayer times are FIXED anchors - schedule around them
2. Sahoor must end before Fajr
3. Iftar is at Maghrib - this is a key transition point
4. Training during fasting hours should be lighter intensity
5. Include buffer time between activities (5-10 min)
6. Ensure adequate sleep (user's goal: ${input.sleepGoalHours}h)
7. Be realistic - this isn't an NFL training camp

Output a complete 24-hour schedule in JSON format.`;

  const user = `Create a personalized Ramadan schedule for:

PROFILE:
- Sport: ${input.sport}
- Training Level: ${input.trainingIntensity}
- Experience: ${input.experienceLevel}

DAILY COMMITMENTS:
- Occupation: ${input.occupation}
${input.workSchoolHours ? `- Work/School: ${input.workSchoolHours.start} - ${input.workSchoolHours.end}` : ''}
- Commute: ${input.commuteMinutes} minutes each way
- Preferred Training Time: ${input.preferredTrainingTime}

GOALS:
- Wake Up: ${input.wakeUpTime}
- Sleep Goal: ${input.sleepGoalHours} hours
- Qur'an: ${input.quranGoalMinutes} minutes (${input.quranPreferredTime})
${input.familyTimePreference ? `- Family Time: ${input.familyTimePreference}` : ''}

PRAYER TIMES:
- Fajr: ${input.prayerTimes.fajr}
- Dhuhr: ${input.prayerTimes.dhuhr}
- Asr: ${input.prayerTimes.asr}
- Maghrib: ${input.prayerTimes.maghrib}
- Isha: ${input.prayerTimes.isha}

${input.specialConsiderations ? `SPECIAL NOTES: ${input.specialConsiderations}` : ''}

Generate a realistic, balanced schedule that honors their commitments while maximizing spiritual benefit during Ramadan.`;

  return { system, user };
}
```

### Phase 4: Schedule Display & Editor

**Updated Schedule Page** (`/tracker/schedule/page.tsx`):

```
┌─────────────────────────────────────┐
│  Daily Schedule                     │
│  ────────────────────────────────── │
│  [My Schedule ▼] [NFL Baseline]     │  <- Toggle between custom & NFL
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Radial Clock View       │    │  <- Same D3 visualization
│  │     (or simplified list)    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ☀️ 4:30 AM - Wake for Sahoor│    │
│  │ 🍽️ 4:45 AM - Sahoor         │    │
│  │ 🕌 5:30 AM - Fajr Prayer    │    │
│  │ 📖 5:45 AM - Qur'an (30min) │    │
│  │ ...                         │    │
│  └─────────────────────────────┘    │
│                                     │
│  [✏️ Edit Schedule]                 │
│  [🔄 Regenerate with AI]            │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 💡 Today's Schedule Tip     │    │  <- AI-generated tip
│  │ "Consider a 20-min power    │    │
│  │  nap after Dhuhr..."        │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Edit Mode Features**:
- Tap block to edit time/activity
- Swipe to delete
- "+" button to add new block
- Drag handles to adjust duration
- Category color picker

### Phase 5: Integration Points

1. **Prayer Times Integration**
   - Auto-populate prayer blocks from user's location
   - Update schedule when prayer times change seasonally

2. **Smart Reminders** (optional, future)
   - Push notifications for schedule blocks
   - "Time for Dhuhr in 10 minutes"

3. **Journal Integration**
   - Compare actual vs planned schedule
   - "You planned to train at 6 AM, did you?"

4. **Home Dashboard**
   - Show "Next Up" from schedule
   - Quick glance at today's key times

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/app/tracker/schedule/customize/page.tsx` | Schedule wizard flow |
| `src/lib/ai/prompts/schedule-generation.ts` | AI prompt for schedule creation |
| `src/components/schedule/ScheduleWizard.tsx` | Wizard step components |
| `src/components/schedule/ScheduleEditor.tsx` | Editable schedule view |
| `src/components/schedule/ScheduleBlock.tsx` | Individual block component |

### Modified Files
| File | Changes |
|------|---------|
| `src/store/useStore.ts` | Add `SchedulePreferences`, `CustomSchedule` types and state |
| `src/lib/ai/types.ts` | Add `ScheduleGenerationInput/Output` types |
| `src/app/tracker/schedule/page.tsx` | Add toggle for custom vs NFL, edit button |
| `src/lib/ramadan.ts` | Export `NFL_SCHEDULE` type for reuse |

---

## Implementation Order

### Sprint 1: Foundation (Core Data & Basic Wizard)
1. Add schedule types to store
2. Create basic wizard flow (steps 1-4)
3. Store preferences in Zustand

### Sprint 2: AI Generation
4. Create schedule generation prompt
5. Add AI hook integration
6. Generate and display schedule

### Sprint 3: Editor & Polish
7. Build schedule editor UI
8. Add drag-to-adjust functionality
9. Implement save/load schedules

### Sprint 4: Integration
10. Connect prayer times
11. Update home dashboard
12. Add schedule tips to daily coaching

---

## Open Questions

1. **Multiple Schedules?**
   - Should users have "Weekday" vs "Weekend" schedules?
   - "Game Day" vs "Training Day" for athletes?
   - *Recommendation*: Start with one, add variants in v2

2. **Offline Support?**
   - Schedule generation requires AI
   - *Recommendation*: Cache generated schedule, allow manual edits offline

3. **Prayer Time Source?**
   - Currently using Aladhan API
   - *Recommendation*: Reuse existing prayer time logic from HomeDashboard

4. **Notification Permissions?**
   - Reminders would need push notifications
   - *Recommendation*: Make optional, prompt only if user enables reminders

---

## Success Metrics

- [ ] User can complete wizard in < 3 minutes
- [ ] Generated schedule feels personalized and realistic
- [ ] Users can easily edit times without frustration
- [ ] Schedule displays correctly on mobile
- [ ] AI generation completes in < 10 seconds
