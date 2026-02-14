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
| AI | OpenAI API | gpt-4o-mini, gpt-4o, Whisper |
| Blob Storage | Vercel Blob | 2.2.0 |
| Analytics | Vercel Analytics | 1.6.1 |
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
| 16 | Educational Series | Done | `src/lib/series/`, `src/app/learn/series/`, `src/components/series/` |
| 17 | Admin Panel (Series) | Done | `src/app/admin/series/`, `src/components/series/admin/`, `src/lib/series/admin-store.ts` |
| 18 | Badge Achievement System | Done | `src/lib/badges/`, `src/app/dashboard/badges/`, `src/components/badges/` |
| 19 | Voice Journal (Whisper) | Done | `src/app/api/ai/whisper/route.ts`, `src/components/VoiceRecorder.tsx` |
| 20 | Desktop Dock Navigation | Done | `src/components/DockNav.tsx` |
| 21 | Series Publishing Pipeline | Done | `src/app/api/series/publish/route.ts`, `src/lib/series/publish-status.ts` |
| 22 | Companion Guide Generation | Done | `src/lib/series/prompts/`, `src/app/api/series/generate/route.ts` |

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

  // Educational series tracking
  seriesUserData: SeriesUserData;   // Completions, bookmarks, notes, action items

  // Badge achievement system
  badgeUnlocks: Record<string, { unlockedAt: number; shareCount: number }>;

  // Dashboard customization
  enabledRings: RingId[];           // "prayers" | "water" | "dhikr" | "quran" | "series"
}
```

**Migration Strategy:** Version-based migrations in `useStore.ts` (current: v10).

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

### Educational Series System

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Admin UI   │────▶│  Admin Store  │────▶│ /api/series/ │
│ /admin/series│     │ (localStorage)│     │   publish    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │ Vercel Blob  │
                                          │  Storage     │
                                          └──────┬───────┘
                                                  │
                     ┌────────────────────────────┤
                     ▼                            ▼
              ┌──────────────┐           ┌──────────────┐
              │ series-index │           │  episodes.json│
              │    .json     │           │ + companions  │
              └──────────────┘           └──────────────┘
                     │                            │
                     ▼                            ▼
              ┌──────────────────────────────────────────┐
              │  User: /learn/series → fetcher.ts        │
              │  (Blob with static /public/data fallback)│
              └──────────────────────────────────────────┘
```

**Data Model:**
- `Scholar`: id, name, title, bio, links (youtube, website)
- `Series`: id, scholarId, title, description, tags, status (draft/published)
- `Episode`: id, seriesId, episodeNumber, title, duration, youtubeUrl
- `CompanionGuide`: summary, hadiths, verses, keyQuotes, actionItems, discussionQuestions, glossary, crossEpisodeConnections

**Companion Guide Generation Pipeline:**
1. Admin provides YouTube transcript (manual or via `/api/series/transcript`)
2. AI analyzes transcript → generates CompanionGuide sections
3. Admin reviews/edits in rich editor UI
4. Sections can be individually regenerated via `/api/series/regenerate-section`
5. Cross-episode connections computed when multiple episodes exist

**User Tracking (SeriesUserData):**
```typescript
interface SeriesUserData {
  completedEpisodes: Record<string, boolean>;
  bookmarkedEpisodes: Record<string, boolean>;
  episodeNotes: Record<string, string>;
  lastViewed: { seriesId: string; episodeId: string; timestamp: number } | null;
  seriesProgress: Record<string, { startedAt: number; lastEpisodeId: string }>;
  savedActionItems: Record<string, SavedActionItem>;
}
```

### Badge Achievement System

**17 Badges across 5 Categories:**

| Category | Badge | Tier | Criteria |
|----------|-------|------|----------|
| Journey | Bismillah | Bronze | Started Ramadan journey |
| Prayer | Consistent | Bronze | 3-day prayer streak |
| Prayer | Steadfast | Silver | 7-day prayer streak |
| Prayer | Devoted | Gold | 21-day prayer streak |
| Prayer | Perfect Month | Gold | 30-day prayer streak |
| Quran | First Juz | Bronze | Completed 1 Juz |
| Quran | Halfway There | Silver | Completed 15 Juz |
| Quran | Khatm al-Quran | Gold | Completed 30 Juz |
| Fasting | First Fast | Bronze | First fast day |
| Fasting | 10 Days Strong | Silver | 10 fasting days |
| Fasting | Full Ramadan | Gold | 30 fasting days |
| Wellness | First Guide | Bronze | Completed 1 episode |
| Wellness | Series Scholar | Silver | Completed entire series |
| Wellness | Well Hydrated | Silver | 7 days with 8+ glasses |
| Wellness | Remembrance | Bronze | 1,000 cumulative tasbeeh |

**Canvas Rendering System (`capture.ts`):**
- Two formats: Feed (1080x1080) and Story (1080x1920)
- Dark gradient background with Islamic geometric star patterns
- Animated sparkle effects with sinusoidal movement
- 8-pointed star badge icon with tier-specific glow (bronze/silver/gold)
- 3-second animated video export (MP4/WebM)
- Web Share API with fallback to download

**Badge Evaluation Flow:**
```
Store state changes → deriveRamadanState()
  → reads days, juzProgress, seriesUserData
  → compares against badge criteria
  → updates badgeUnlocks in store
  → NewBadgeBanner shows notification
```

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
├── badges/                  # Achievement badge components
│   ├── BadgeCard.tsx        # Individual badge display
│   ├── BadgeShareModal.tsx  # Full share UI with preview
│   └── NewBadgeBanner.tsx   # New badge notification
├── series/                  # Series & episode components
│   ├── SeriesCard.tsx       # Series list card
│   ├── EpisodeCard.tsx      # Episode list item
│   ├── CompanionContent.tsx # Study guide display
│   ├── ActionItemList.tsx   # Trackable action items
│   ├── HadithCard.tsx       # Hadith display
│   ├── VerseCard.tsx        # Qur'anic verse display
│   ├── ShareButton.tsx      # Share functionality
│   └── admin/               # Admin panel components
│       ├── SeriesForm.tsx   # Series CRUD form
│       ├── EpisodeForm.tsx  # Episode editor
│       ├── ScholarForm.tsx  # Scholar management
│       ├── CompanionEditor.tsx # Companion guide editor
│       ├── PublishButton.tsx   # Publish to Vercel Blob
│       └── ExportButton.tsx   # JSON export
├── ui/
│   ├── CircularSlider.tsx   # Interactive circular input
│   └── ConfirmDialog.tsx    # Confirmation modal
├── BottomNav.tsx            # Mobile navigation
├── DockNav.tsx              # Desktop dock navigation
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
├── badges/
│   ├── definitions.ts       # 17 badge definitions (5 categories, 3 tiers)
│   ├── evaluate.ts          # Badge unlock logic, deriveRamadanState()
│   ├── capture.ts           # Canvas 2D rendering + video export
│   └── share.ts             # Web Share API + fallback download
├── series/
│   ├── types.ts             # Scholar, Series, Episode, CompanionGuide
│   ├── hooks.ts             # useSeriesIndex, useSeriesDetail, useEpisode
│   ├── admin-store.ts       # Admin Zustand store (localStorage)
│   ├── fetcher.ts           # Blob + static file fetching with cache
│   ├── publish-status.ts    # Readiness computation for publishing
│   ├── diff.ts              # Change tracking since last publish
│   ├── validation.ts        # Series data validation
│   ├── useAutoPublish.ts    # Automated publish triggers
│   └── prompts/             # AI prompt builders
│       ├── companion-generation.ts  # Full guide from transcript
│       ├── section-regeneration.ts  # Regenerate single section
│       └── cross-episode.ts         # Cross-episode connections
├── ramadan.ts               # Ramadan dates, countdown, helpers
└── prayer-times.ts          # Prayer time calculations
```

### Route Structure

```
src/app/
├── page.tsx                 # Home/landing
├── layout.tsx               # Root layout
├── dashboard/               # Analytics dashboard
│   ├── page.tsx             # Main dashboard with charts
│   └── badges/page.tsx      # Achievement badges showcase
├── ask/page.tsx             # Ask Coach Hamza
├── admin/                   # Admin panel
│   └── series/
│       ├── page.tsx         # Series management dashboard
│       ├── import/page.tsx  # Bulk data import
│       ├── scholars/page.tsx # Scholar management
│       ├── [seriesId]/page.tsx         # Edit series
│       └── [seriesId]/[episodeId]/page.tsx # Edit episode + companion
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
│   ├── pronunciation/page.tsx
│   └── series/              # Educational series
│       ├── page.tsx         # Browse all published series
│       ├── bookmarks/page.tsx # Saved episodes
│       ├── [seriesId]/page.tsx         # Series detail + episodes
│       └── [seriesId]/[episodeId]/page.tsx # Episode + companion guide
├── prepare/                 # Preparation guides
│   ├── page.tsx
│   ├── checklist/page.tsx
│   ├── transition/page.tsx
│   ├── communication/page.tsx
│   └── duaa/page.tsx
├── tracker/                 # Daily tracking
│   ├── page.tsx
│   ├── schedule/
│   │   ├── page.tsx         # Daily routine view
│   │   └── customize/page.tsx # AI schedule builder wizard
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
│   ├── ai/whisper/route.ts  # Audio transcription (Whisper)
│   ├── partner/             # Partner sync API
│   │   ├── connect/route.ts
│   │   ├── sync/route.ts
│   │   └── disconnect/route.ts
│   └── series/              # Series management API
│       ├── generate/route.ts           # Companion guide generation
│       ├── regenerate-section/route.ts # Regenerate single section
│       ├── publish/route.ts            # Publish to Vercel Blob
│       ├── transcript/route.ts         # Transcript extraction
│       ├── playlist/route.ts           # Playlist import
│       ├── verify-token/route.ts       # Admin auth verification
│       └── og/[episodeId]/route.ts     # OG image generation
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

### Adding a New Badge

1. **Define the badge** in `src/lib/badges/definitions.ts`:
```typescript
{
  id: "your-badge-id",
  name: "Badge Name",
  description: "How user earned it",
  tier: "bronze" | "silver" | "gold",
  category: "journey" | "prayer" | "quran" | "fasting" | "wellness",
  criteria: "Criteria description",
  shareText: "I just earned..."
}
```

2. **Add evaluation logic** in `src/lib/badges/evaluate.ts`:
```typescript
// Inside deriveRamadanState() function
if (yourCondition) {
  unlocked.push("your-badge-id");
}
```

3. Badge auto-evaluates on store changes and appears in `/dashboard/badges`

### Adding a New Series

1. Use admin panel at `/admin/series` (recommended) or programmatically via `admin-store.ts`
2. Create scholar → Create series → Add episodes → Generate companion guides
3. Publish via admin "Publish" button → uploads to Vercel Blob
4. Users automatically see published series at `/learn/series`

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
- **v6 → v7**: Added `seriesUserData` for educational series tracking
- **v7 → v8**: Added `enabledRings` for dashboard ring customization
- **v8 → v9**: Added `savedActionItems` to seriesUserData
- **v9 → v10**: Added `badgeUnlocks` for achievement badge tracking

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
OPENAI_API_KEY=sk-...                    # Server-side API key (optional if client provides)

# Vercel Blob Storage (for publishing series data)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... # Get from: Vercel Dashboard > Storage > Blob
NEXT_PUBLIC_BLOB_BASE_URL=https://your-id.public.blob.vercel-storage.com

# Admin secret for publish endpoint (any strong random string)
ADMIN_SECRET=replace-with-a-strong-random-token
```

Users can also provide their own OpenAI API key via Settings, stored in the Zustand store.

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

*Last updated: 2026-02-13*
*Maintained by: Development Team & AI Agents*
