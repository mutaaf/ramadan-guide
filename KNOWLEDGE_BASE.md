# Coach Hamza's Ramadan Guide - Knowledge Base

> A comprehensive reference document for developers and AI agents working on this codebase.

**See Also:**
- [CLAUDE.md](./CLAUDE.md) - High-level overview for AI assistants
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Deep technical documentation
- [docs/DECISIONS.md](./docs/DECISIONS.md) - Architecture decision records (ADRs)
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) - Version history and changes

---

## Quick Reference

### Tech Stack
| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| State Management | Zustand | 5.0.11 |
| Styling | Tailwind CSS | v4 |
| Animations | Framer Motion | 12.31.0 |
| Data Visualization | D3 | 7.9.0 |
| PWA | Serwist | 9.5.4 |
| AI | OpenAI API | gpt-4o-mini, Whisper |
| Testing | Playwright | 1.58.2 |

### Key Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run Playwright E2E tests
```

### Store Quick Access
```typescript
import { useStore } from "@/store/useStore";

// Common selectors
const { days, userName, sport } = useStore();
const apiKey = useStore((s) => s.apiKey);
const getDay = useStore((s) => s.getDay);
```

---

## Feature Inventory

| # | Feature | Status | Key Files |
|---|---------|--------|-----------|
| 1 | Onboarding (4-step) | Done | `src/app/onboarding/` |
| 2 | Prayer Tracking | Done | `src/store/useStore.ts`, `src/lib/prayer-times.ts` |
| 3 | Hydration Tracking | Done | `src/app/tracker/hydration/`, `src/components/health/` |
| 4 | Qur'an Progress | Done | `src/app/tracker/quran/` |
| 5 | Tasbeeh Counter | Done | `src/app/tracker/tasbeeh/` |
| 6 | Journal & Voice Journal | Done | `src/app/tracker/journal/`, `src/components/VoiceRecorder.tsx` |
| 7 | AI Coach (10 modules) | Done | `src/lib/ai/`, `src/components/ai/` |
| 8 | Smart Health Data Entry | Done | `src/lib/health/`, `src/components/health/` |
| 9 | Demo Insights | Done | `src/lib/ai/demoInsights.ts`, `src/components/ai/AIInsights.tsx` |
| 10 | Learning Modules | Done | `src/app/learn/` |
| 11 | Dashboard Analytics | Done | `src/app/dashboard/` |
| 12 | PWA & Offline | Done | `src/app/sw.ts`, `next.config.ts` |
| 13 | AI Schedule Builder | Done | `src/components/schedule/`, `src/lib/ai/prompts/schedule-generation.ts` |
| 14 | Phase-Aware System | Done | `src/lib/ramadan.ts` (pre/during/post Ramadan) |
| 15 | Accountability Partner | Done | `src/lib/accountability/`, `src/app/partner/`, `src/components/PartnerWidget.tsx` |

---

## Architecture Documentation

### State Management Pattern

The app uses Zustand with persistence middleware. State is persisted to localStorage under the key `ramadan-guide-storage`.

**Store Structure:**
```typescript
interface RamadanStore {
  // User identity
  userName: string;
  sport: string;
  onboarded: boolean;
  userProfile: UserProfile;
  userMemory: UserMemory;

  // Tracking data
  days: Record<string, DayEntry>;        // Daily entries by date
  juzProgress: number[];                  // 0-100 for each of 30 Juz
  tasbeehCounters: TasbeehCounter[];
  tasbeehHistory: TasbeehHistory;

  // AI configuration
  apiKey: string;
  aiModelPreference: string;
  useApiRoute: boolean;

  // Health patterns
  healthPatterns: HealthPatterns;
  smartPromptSettings: SmartPromptSettings;
  quickLogEngagement: QuickLogEngagement;

  // Accountability partner
  partnerStats: PartnerStats | null;
  lastPartnerSync: number | null;
}
```

**Migration Strategy:** Version-based migrations in `useStore.ts` (current: v6).

### AI Integration Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Component  │────▶│   useAI()    │────▶│   Cache     │
│ (e.g. Ask)  │     │    Hook      │     │  (IndexedDB)│
└─────────────┘     └──────┬───────┘     └──────┬──────┘
                           │                     │
                           ▼                     │ cache miss
                    ┌──────────────┐             │
                    │ executeAI()  │◀────────────┘
                    │   client.ts  │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌────────────┐            ┌────────────┐
       │ API Route  │            │  Direct    │
       │ /api/ai    │            │  OpenAI    │
       └────────────┘            └────────────┘
```

**10 AI Features:**
1. `daily-coaching` - Daily personalized advice
2. `meal-plan` - Sahoor/Iftar recommendations
3. `book-qa` - Q&A from Ramadan guide
4. `weekly-analysis` - Weekly progress summary
5. `training-advice` - Sport-specific training
6. `reflection` - Daily reflection prompts
7. `voice-journal` - Transcription analysis
8. `behavior-insight` - Pattern-based insights
9. `ai-insights` - Comprehensive AI insights
10. `schedule-generation` - AI-built 24-hour Ramadan routine

### Caching Strategy

**AI Response Cache:**
- Storage: IndexedDB via `src/lib/ai/cache.ts`
- TTL: Feature-specific (defined in `types.ts`)
- Key: Hash of feature + input data
- Cleanup: Automatic on app load

**Prayer Times Cache:**
- Storage: localStorage
- TTL: 24 hours
- Key: `prayer-times-{lat}-{lng}`

### Accountability Partner Flow

```
┌──────────────┐     ┌──────────────┐
│   User A     │     │   User B     │
│  generates   │     │              │
│  code FAJR7K │────▶│ enters code  │
└──────┬───────┘     └──────┬───────┘
       │                     │
       ▼                     ▼
┌──────────────┐     ┌──────────────┐
│ POST /api/   │     │ POST /api/   │
│ partner/     │◀───▶│ partner/     │
│ connect      │     │ connect      │
└──────────────┘     └──────────────┘
       │                     │
       ▼                     ▼
┌──────────────────────────────────┐
│   Daily: POST /api/partner/sync  │
│   Send: {prayerCount, hydration, │
│          streak, timestamp}      │
│   Receive: partner's same stats  │
└──────────────────────────────────┘
```

**Privacy Model**: Only 4 aggregate fields synced. No names, no prayer times, no personal data.
**Offline**: Cached partner stats shown when offline. Sync on next app open.
**Storage**: Connection metadata in localStorage (not Zustand). Partner stats cached locally.

### PWA Capabilities

- **Service Worker:** Serwist-based (`src/app/sw.ts`)
- **Offline Page:** `src/app/offline/page.tsx`
- **Install Prompt:** `src/components/InstallPrompt.tsx`
- **Config:** `next.config.ts` with `withSerwist()`

---

## File Reference

### Component Locations

```
src/components/
├── ai/                      # AI-powered components
│   ├── AIInsights.tsx       # Main insights display (tiered: demo/local/AI)
│   ├── AskCoachHamza.tsx    # Main Q&A interface
│   ├── MealRecommendation.tsx
│   ├── TrainingAdvisor.tsx
│   ├── ReflectionPrompt.tsx
│   ├── WeeklySummary.tsx
│   ├── ProactiveInsight.tsx
│   ├── CoachInsight.tsx
│   ├── AISettingsModal.tsx
│   ├── CacheCleanup.tsx
│   └── DeepDiveLink.tsx
├── health/                  # Health tracking components
│   ├── HealthPromptProvider.tsx
│   ├── HealthPromptSheet.tsx
│   ├── QuickLogWidget.tsx
│   ├── QuickLogCard.tsx
│   ├── HydrationQuickEntry.tsx
│   ├── SleepQuickEntry.tsx
│   └── index.ts
├── ui/
│   └── CircularSlider.tsx   # Interactive circular input
├── BottomNav.tsx            # Mobile navigation
├── Card.tsx                 # Reusable card wrapper
├── DailyWisdom.tsx          # Daily hadith/verse display
├── HomeDashboard.tsx        # Main home dashboard
├── PartnerWidget.tsx        # Accountability partner home widget
├── PageHeader.tsx           # Page title component
├── VoiceRecorder.tsx        # Audio recording
├── VoiceJournalButton.tsx   # Voice journal trigger
└── ...
```

### Library Locations

```
src/lib/
├── ai/
│   ├── types.ts             # AI feature types, cache config
│   ├── client.ts            # AI request execution
│   ├── hooks.ts             # useAI, useAIReady, useAIStream
│   ├── cache.ts             # IndexedDB caching
│   ├── stream.ts            # SSE streaming
│   ├── memory.ts            # User memory/context
│   ├── behavior.ts          # Behavior analysis (no API needed)
│   ├── computeInsightsData.ts # Data aggregation for insights
│   ├── demoInsights.ts      # Demo/local insights system
│   └── prompts/
│       ├── system.ts        # Coach Hamza system prompt
│       ├── daily-coaching.ts
│       ├── meal-plan.ts
│       ├── book-qa.ts
│       ├── weekly-analysis.ts
│       ├── training-advice.ts
│       ├── reflection.ts
│       ├── behavior-insight.ts
│       ├── ai-insights.ts
│       └── voice-journal.ts
├── health/
│   ├── types.ts             # Health pattern types
│   ├── smartDefaults.ts     # Intelligent default values
│   ├── patternDetector.ts   # Pattern analysis
│   └── index.ts
├── content/
│   ├── hadiths.ts           # Hadith collection with themes
│   ├── verses.ts            # Quranic verses
│   ├── stories.ts           # Inspiring stories
│   ├── quran-guide.ts       # Quran reading guide
│   ├── sport-protocols.ts   # Sport-specific guidance
│   └── content-engine.ts    # Content selection logic
├── accountability/
│   ├── types.ts             # Partner data structures, code generation
│   ├── sync.ts              # Stat sync, connection management
│   └── index.ts             # Re-exports
├── ramadan.ts               # Ramadan dates, countdown, helpers
└── prayer-times.ts          # Prayer time calculations
```

### Route Structure

```
src/app/
├── page.tsx                 # Home/landing
├── layout.tsx               # Root layout
├── dashboard/page.tsx       # Analytics dashboard
├── ask/page.tsx             # Ask Coach Hamza
├── onboarding/              # 4-step onboarding
│   ├── page.tsx
│   ├── step-1/page.tsx      # Name, sport
│   ├── step-2/page.tsx      # Experience levels
│   ├── step-3/page.tsx      # Goals, concerns
│   └── step-4/page.tsx      # Confirmation
├── learn/                   # Educational content
│   ├── page.tsx
│   ├── islam/page.tsx       # Five Pillars
│   ├── ramadan/page.tsx     # Ramadan significance
│   ├── laylatul-qadr/page.tsx
│   ├── prophet/page.tsx
│   └── pronunciation/page.tsx
├── prepare/                 # Preparation guides
│   ├── page.tsx
│   ├── checklist/page.tsx
│   ├── transition/page.tsx
│   ├── communication/page.tsx
│   └── duaa/page.tsx
├── tracker/                 # Daily tracking
│   ├── page.tsx
│   ├── schedule/page.tsx
│   ├── quran/page.tsx
│   ├── tasbeeh/page.tsx
│   ├── nutrition/page.tsx
│   ├── hydration/page.tsx
│   └── journal/page.tsx
├── more/                    # Additional resources
│   ├── page.tsx
│   ├── about/page.tsx
│   ├── community/page.tsx
│   ├── wellness/page.tsx
│   ├── not-fasting/page.tsx
│   └── post-ramadan/page.tsx
├── partner/                 # Accountability partner
│   ├── page.tsx             # Partner dashboard / connect prompt
│   └── connect/page.tsx     # Code generation + entry
├── api/
│   ├── ai/route.ts          # Main AI endpoint
│   ├── ai/whisper/route.ts  # Audio transcription
│   └── partner/             # Partner sync API
│       ├── connect/route.ts
│       ├── sync/route.ts
│       └── disconnect/route.ts
└── offline/page.tsx         # Offline fallback
```

---

## Extension Points

### Adding a New AI Feature

1. **Define the feature type** in `src/lib/ai/types.ts`:
```typescript
export type AIFeature =
  | "existing-features"
  | "your-new-feature";

export const AI_FEATURE_CONFIG: Record<AIFeature, {...}> = {
  "your-new-feature": {
    cacheTTL: 1000 * 60 * 60, // 1 hour
    model: "gpt-4o-mini",
  },
};
```

2. **Create prompt builder** in `src/lib/ai/prompts/your-feature.ts`:
```typescript
export function buildYourFeaturePrompts(input: YourInput) {
  return {
    systemPrompt: COACH_HAMZA_SYSTEM + "\n\n[Feature-specific instructions]",
    userPrompt: `[Formatted user input]`,
  };
}
```

3. **Create component** in `src/components/ai/YourFeature.tsx`:
```typescript
const { data, loading, error, generate } = useAI<YourInput, YourOutput>(
  "your-new-feature",
  inputData,
  buildYourFeaturePrompts,
  { autoTrigger: true }
);
```

### Adding a New Tracking Field

1. **Update DayEntry type** in `src/store/useStore.ts`:
```typescript
export interface DayEntry {
  // ... existing fields
  yourNewField: string;
}

export const createEmptyDay = (date: string): DayEntry => ({
  // ... existing defaults
  yourNewField: "",
});
```

2. **Add to store actions** if needed:
```typescript
updateYourField: (date: string, value: string) =>
  set((s) => {
    const existing = s.days[date] ?? createEmptyDay(date);
    return { days: { ...s.days, [date]: { ...existing, yourNewField: value } } };
  }),
```

3. **Update migration version** and add migration logic.

4. **Create UI** in appropriate tracker page.

### Adding a New Learning Module

1. Create page at `src/app/learn/your-topic/page.tsx`
2. Add navigation link in `src/components/LearnNavigation.tsx`
3. Add content to `src/lib/content/` if needed

### Extending the Partner System

1. **Add new synced stat**: Update `DailySync` in `src/lib/accountability/types.ts`
2. **Update sync payload**: Modify `buildMySyncData()` in `sync.ts`
3. **Update partner widget**: Add display in `src/components/PartnerWidget.tsx`
4. **Update partner dashboard**: Add comparison in `src/app/partner/page.tsx`
5. **Update API routes**: Modify `src/app/api/partner/sync/route.ts`

Important: Only sync aggregate data. Never sync prayer times, personal notes, or identifiable info.

---

## Content Library

### Hadith Themes
- `fasting` - Fasting rewards and guidance
- `reward` - Spiritual rewards
- `behavior` - Conduct during Ramadan
- `sahoor` - Pre-dawn meal
- `iftar` - Breaking fast
- `strength` - Physical endurance
- `motivation` - Encouragement
- `mercy` - Divine mercy

### Sport Protocols
Covered sports with specific Ramadan guidance:
- Football
- Basketball
- Soccer
- Track & Field
- Swimming
- MMA/Combat Sports

Each includes: Sahoor focus, training timing, hydration strategy, game-day advice.

---

## Development History

### Version Migrations (useStore)
- **v0 → v1**: Added `useApiRoute` flag
- **v1 → v2**: Migrated `juzCompleted[]` to `juzProgress[]`, added Tasbeeh
- **v2 → v3**: Added `userProfile` and `userMemory`
- **v3 → v4**: Added health patterns, smart prompts, quick log engagement
- **v4 → v5**: Added `customSchedule` for AI-generated routines
- **v5 → v6**: Added `partnerStats` and `lastPartnerSync` for accountability partner

### Key Implementation Patterns

**Tiered Insights System** (AIInsights.tsx):
```
Tier 1 (< 3 days): Demo preview insights (rotating)
Tier 2 (>= 3 days, no API): Locally computed insights
Tier 3 (>= 3 days, API ready): Full AI-generated insights
```

**Smart Health Prompts**: Time-aware prompts based on user patterns and prayer times.

**Content Engine**: Context-aware content selection based on user data, Ramadan day, and activity.

---

## Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-...        # Server-side API key (optional if client provides)
```

Users can also provide their own API key via Settings, stored in the Zustand store.

---

## Testing

### E2E Tests (Playwright)
```bash
npm run test        # Run all tests
npm run test:ui     # Interactive test runner
```

Test files location: `tests/` or `*.spec.ts` files.

---

## Common Patterns

### Reading User Data
```typescript
const { days, getDay } = useStore();
const today = getTodayString();
const todayData = getDay(today);
```

### Checking AI Readiness
```typescript
const ready = useAIReady(); // true if API key or server route enabled
```

### Computing Behavior Analysis
```typescript
import { analyzeBehavior } from "@/lib/ai/behavior";
const dayArray = Object.values(days).filter(d => d.date);
const analysis = analyzeBehavior(dayArray); // Works without AI API
```

### Getting Ramadan Info
```typescript
import { getRamadanCountdown } from "@/lib/ramadan";
const { dayOfRamadan, isRamadan, daysRemaining } = getRamadanCountdown();
```

---

---

## Key Design Decisions

### Prayer Count (5/5 not 6/6)
The app counts **5 obligatory daily prayers** (Fajr, Dhur, Asr, Maghrib, Ishaa) separately from Taraweeh:
- Progress displays as `X/5`
- Taraweeh has its own section with "Ramadan Night Prayer" divider
- Taraweeh only visible during Ramadan phase

### Phase System
The app operates in three modes:
```typescript
type AppPhase = "pre-ramadan" | "ramadan" | "post-ramadan";

// Usage:
const phaseInfo = getPhaseInfo(); // from src/lib/ramadan.ts
if (phaseInfo.phase === "ramadan") {
  // Show full Ramadan features
}
```

Phase-specific features:
| Feature | Pre-Ramadan | Ramadan | Post-Ramadan |
|---------|-------------|---------|--------------|
| 5 Daily Prayers | Yes | Yes | Yes |
| Taraweeh | Hidden | Yes | Hidden |
| Fasting Toggle | Optional | Yes | Optional |
| Sahoor/Iftar | Hidden | Yes | Hidden |

---

*Last updated: 2026-02-11*
*Maintained by: Development Team & AI Agents*
