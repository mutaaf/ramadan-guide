# Ramadan Guide - AI Knowledge Base

> A PWA coaching app for Muslim athletes during Ramadan, built with Next.js 16, React 19, and AI integration.

**See Also:**
- [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md) - Detailed technical reference
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Deep technical documentation
- [docs/DECISIONS.md](./docs/DECISIONS.md) - Architecture decision records
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) - Version history and changes

## Project Overview

### What This Is
A personalized Ramadan companion app designed specifically for athletes. Created in collaboration with **Coach Hamza Abdullah**, a retired NFL player who fasted during 8 NFL training camp seasons. The app helps Muslim athletes balance their faith, training, and fasting during Ramadan.

### Why It Exists
Athletes face unique challenges during Ramadan:
- Maintaining performance while fasting
- Timing training around prayers and meals
- Staying hydrated in limited windows
- Managing energy and recovery

This app provides AI-powered coaching, tracking, and guidance tailored to these needs.

### Who It's For
- Muslim athletes of all levels (recreational to professional)
- Any sport: football, basketball, soccer, MMA, track, swimming, etc.
- Both Ramadan fasters and those learning about Ramadan

---

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **React**: 19.2.3
- **State**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS 4 + CSS variables for theming
- **Animations**: Framer Motion
- **Charts**: D3.js for visualizations
- **PWA**: Serwist (service worker, offline support)
- **AI**: OpenAI API (GPT-4o-mini / GPT-4o)
- **Testing**: Playwright

### Key Design Decisions

1. **PWA-First**: Designed as an installable app with offline support. All data persists in localStorage.

2. **Phase-Aware System**: The app operates in three modes:
   - `pre-ramadan`: Countdown mode, preparation features
   - `ramadan`: Full tracking (days 1-30)
   - `post-ramadan`: Maintenance mode, habit continuation

3. **5 Daily Prayers + Separate Taraweeh**: The app correctly counts 5 obligatory daily prayers (Fajr, Dhur, Asr, Maghrib, Ishaa) separately from Taraweeh, which is a Ramadan-only night prayer.

4. **AI as Coach Hamza**: All AI responses are written in the voice of Coach Hamza Abdullah, providing personalized, experience-based advice.

5. **Tiered AI Experience**:
   - No API key: Demo insights + locally computed stats
   - With API key: Full personalized AI coaching

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/
│   │   ├── ai/            # AI API routes
│   │   └── partner/       # Accountability partner API routes
│   │       ├── connect/   # Partner code exchange
│   │       ├── sync/      # Stats sync
│   │       └── disconnect/# Remove connection
│   ├── ask/               # Ask Coach Hamza (chat)
│   ├── dashboard/         # Progress dashboard with charts
│   ├── learn/             # Educational content
│   ├── more/              # Settings, about, community
│   ├── onboarding/        # 4-step onboarding wizard
│   ├── partner/           # Accountability partner feature
│   │   ├── page.tsx       # Partner dashboard
│   │   └── connect/       # Generate/enter partner codes
│   ├── prepare/           # Pre-Ramadan preparation
│   └── tracker/           # Daily tracking features
│       ├── journal/       # Daily journal entry
│       ├── hydration/     # Water tracking
│       ├── nutrition/     # Meal planning
│       ├── quran/         # Juz progress
│       ├── schedule/      # AI-generated daily routine
│       └── tasbeeh/       # Dhikr counter
├── components/
│   ├── ai/                # AI-powered components
│   ├── health/            # Smart health tracking
│   ├── schedule/          # Schedule builder wizard
│   ├── ui/                # Reusable UI components
│   └── PartnerWidget.tsx  # Home dashboard partner widget
├── lib/
│   ├── accountability/    # Partner accountability system
│   │   ├── types.ts       # Partner data structures
│   │   └── sync.ts        # Stat sync, code generation
│   ├── ai/                # AI client, prompts, caching
│   │   ├── prompts/       # All AI prompt builders
│   │   ├── client.ts      # OpenAI API wrapper
│   │   ├── cache.ts       # IndexedDB response caching
│   │   ├── hooks.ts       # React hooks for AI features
│   │   ├── memory.ts      # User context building
│   │   └── types.ts       # AI feature types
│   ├── content/           # Static content (hadiths, verses)
│   ├── health/            # Health pattern analysis
│   ├── prayer-times.ts    # Aladhan API integration
│   └── ramadan.ts         # Phase detection, dates, constants
├── store/
│   └── useStore.ts        # Zustand global state
└── config/
    └── charity.ts         # Charity organization data
```

---

## Key Files Reference

### Core State (`src/store/useStore.ts`)
Central Zustand store with:
- `DayEntry`: Daily tracking data (prayers, sleep, hydration, meals, training)
- `UserProfile`: Sport, experience level, goals, concerns
- `UserMemory`: AI learning from conversations
- `CustomSchedule`: AI-generated daily routine
- `HealthPatterns`: Sleep/hydration analysis for smart suggestions
- `partnerStats`: Accountability partner's synced stats
- `getPrayerStreak()`: Consecutive days with all 5 prayers completed

### Phase System (`src/lib/ramadan.ts`)
```typescript
type AppPhase = "pre-ramadan" | "ramadan" | "post-ramadan";

// Key functions:
getPhaseInfo()      // Returns current phase + context
getRamadanCountdown() // Days/hours until or during Ramadan
getTodayString()    // YYYY-MM-DD format
```

Ramadan dates are hardcoded for 2025-2027 (based on lunar calendar predictions).

### AI Integration (`src/lib/ai/`)

**Client (`client.ts`)**:
- `executeAIRequest<T>()`: Main API call with caching
- `parseJSONResponse<T>()`: Robust JSON extraction (handles markdown, bare JSON)

**Prompts (`prompts/*.ts`)**:
- `daily-coaching.ts`: Daily personalized insights
- `meal-plan.ts`: Sahoor/Iftar recommendations
- `training-advice.ts`: Workout modifications
- `reflection.ts`: Duaa and spiritual guidance
- `schedule-generation.ts`: Full 24-hour routine builder
- `ai-insights.ts`: Dashboard pattern analysis

**Hooks (`hooks.ts`)**:
- `useAI<TInput, TOutput>()`: React hook for AI features
- `useAIReady()`: Check if API key is configured

### Prayer Times (`src/lib/prayer-times.ts`)
Uses Aladhan API with location caching:
```typescript
getPrayerTimes(lat, lng)  // Fetches from API
getCachedLocation()        // Returns cached coords
getNextPrayer(times)       // Next prayer with countdown
```

### Accountability Partner (`src/lib/accountability/`)
Privacy-preserving partner system. Only aggregate stats are shared.

**Types (`types.ts`)**:
- `DailySync`: Data synced between partners (prayer count, hydration, streak)
- `PartnerStats`: Received partner stats
- `generatePartnerCode()`: Creates 6-char partner code (e.g., "FAJR7K")
- `getOrCreateDeviceId()`: Anonymous device ID (no user accounts)

**Sync (`sync.ts`)**:
- `connectToPartner(code)`: Connect using partner's code
- `disconnectFromPartner()`: Remove connection, clear local data
- `syncWithPartner(myStats)`: Exchange daily stats with 1-hour throttle
- `buildMySyncData(prayers, water, streak)`: Build sync payload

**Privacy guarantees:**
- No names, no prayer times, no personal details ever leave the device
- Only 4 fields synced: prayerCount (0-5), hydrationOnTrack (bool), streak (number), timestamp
- All partner data stored in localStorage, not in Zustand (connection state)
- Users can disconnect at any time

---

## AI Prompt Guidelines

All AI prompts include:
1. **Coach Hamza persona**: Speaks from personal NFL experience
2. **Phase context**: Pre-Ramadan/Ramadan Day X/Post-Ramadan
3. **User data**: Name, sport, training type, health metrics
4. **JSON output format**: Strictly defined response structure

Example prompt pattern:
```typescript
const phaseContext = phase === "ramadan"
  ? `Day ${dayOfRamadan} of Ramadan`
  : phase === "pre-ramadan"
    ? "Pre-Ramadan preparation"
    : "Post-Ramadan maintenance";
```

---

## Feature Flags by Phase

| Feature | Pre-Ramadan | Ramadan | Post-Ramadan |
|---------|-------------|---------|--------------|
| 5 Daily Prayers | Yes | Yes | Yes |
| Taraweeh Toggle | Hidden | Yes | Hidden |
| Fasting Tracker | Optional | Yes | Optional (Sunnah) |
| Sahoor/Iftar Labels | Hidden | Yes | Hidden |
| Qur'an Tracker | Yes | Yes | Yes |
| Schedule Builder | Yes | Yes | Yes |
| Partner Widget | Yes | Yes | Yes |

---

## Common Tasks

### Adding a New AI Feature
1. Define types in `src/lib/ai/types.ts`
2. Create prompt builder in `src/lib/ai/prompts/`
3. Add feature to `FEATURE_MODEL` and `FEATURE_TTL` in types
4. Create component using `useAI` hook

### Modifying Prayer Count Logic
Search for these patterns (all should use 5, not 6):
- `dailyPrayerCount`
- `prayers / 5`
- `/5` (in display strings)

### Updating Ramadan Dates
Edit `RAMADAN_DATES` in `src/lib/ramadan.ts`:
```typescript
const RAMADAN_DATES = {
  2025: { start: "2025-02-28", end: "2025-03-29" },
  2026: { start: "2026-02-17", end: "2026-03-18" },
  // Add new years as needed
};
```

---

## Known Considerations

1. **Offline-First**: All features should work without network (except AI calls and partner sync)
2. **Data Privacy**: All data stays in localStorage, never sent to servers except AI queries and partner aggregate stats
3. **Cultural Sensitivity**: Content reviewed for Islamic authenticity
4. **Accessibility**: Charts have aria-labels, proper contrast ratios
5. **Mobile-First**: UI designed for phones, scales up for tablets/desktop
6. **Partner Privacy**: Accountability partner only sees aggregate stats (prayer count, hydration status, streak). No names, no personal data.

---

## Testing

```bash
npm run test        # Run Playwright tests
npm run test:ui     # Interactive test UI
npm run lint        # ESLint check
npm run build       # Production build (catches type errors)
```

---

## Deployment

The app is designed for Vercel deployment:
- Static pages pre-rendered at build time
- API routes for AI (optional, can use client-side with API key)
- API routes for partner sync (in-memory store; replace with Vercel KV for production)
- Service worker for offline PWA support

---

## Future Roadmap Ideas

1. **Challenge Rooms**: Anonymous themed challenges (e.g., "30 Days of Fajr") with leaderboards
2. **Streak Celebrations**: Animations + shareable images at milestones (3, 7, 10, 21, 30 days)
3. **Proactive Check-ins**: Coach Hamza initiates based on declining patterns
4. **Prayer Quality (Khushu) Tracking**: Post-prayer quality self-rating
5. **Emotional State Check**: Quick mood pulse before journal entry
6. **Persistent Partner Backend**: Replace in-memory API store with Vercel KV for production
7. **Family Mode**: Track multiple family members
8. **Multi-language**: Arabic, Urdu, Malay, Turkish support

---

## Credits

- **Coach Hamza Abdullah**: Content, voice, methodology
- **ProBigBros**: Partnership and book content
- Built with Next.js, React, Tailwind, and OpenAI
