# Architecture Decision Records

This document captures key decisions made during development, their context, and rationale.

---

## ADR-001: Prayer Count as 5/5 (Not 6/6)

### Status
Accepted

### Context
Initially, the app counted all 6 prayer toggles (Fajr, Dhur, Asr, Maghrib, Ishaa, Taraweeh) as a single "prayers completed" metric, displaying "X/6".

### Decision
Count only the 5 obligatory daily prayers. Taraweeh is tracked separately with a "Ramadan Night Prayer" label and is only visible during the Ramadan phase.

### Rationale
1. **Islamic Accuracy**: There are exactly 5 obligatory (fard) daily prayers in Islam
2. **Taraweeh is Optional**: It's a Sunnah (recommended) prayer specific to Ramadan
3. **User Confusion**: Showing "5/6" would make users feel incomplete even if they prayed all required prayers
4. **Phase Awareness**: Taraweeh doesn't apply outside Ramadan

### Consequences
- Prayer progress shows as `X/5`
- Taraweeh has its own visual section with divider
- Scoring calculations use `/5` for normalization
- Taraweeh toggle hidden outside Ramadan phase

---

## ADR-002: Year-Round Phase System

### Status
Accepted

### Context
The app was initially designed only for the 30 days of Ramadan. Users wanted to:
- Prepare before Ramadan starts
- Continue tracking habits after Ramadan ends
- See countdown to next Ramadan

### Decision
Implement a three-phase system: `pre-ramadan`, `ramadan`, `post-ramadan`.

### Rationale
1. **Preparation Value**: Building habits before Ramadan helps success during
2. **Continuity**: Spiritual habits shouldn't end when Ramadan does
3. **Engagement**: Users can use the app year-round instead of uninstalling
4. **Sunnah Fasting**: Muslims often fast on Mondays/Thursdays outside Ramadan

### Implementation
```typescript
type AppPhase = "pre-ramadan" | "ramadan" | "post-ramadan";

function getPhaseInfo(): PhaseInfo {
  // Compare current date against RAMADAN_DATES
  // Return appropriate phase and context
}
```

### Consequences
- UI adapts based on current phase
- Features like Taraweeh/Sahoor are phase-gated
- AI prompts include phase context
- Countdown works in all phases (to current or next Ramadan)

---

## ADR-003: Client-Side AI with Optional Server Route

### Status
Accepted

### Context
The app needs AI features but has constraints:
- No server infrastructure budget
- Privacy concerns about sending data
- Users may have their own OpenAI API keys

### Decision
Support both:
1. **Direct Client**: User provides their own API key, calls OpenAI directly
2. **Server Route**: Deploy with server-side key via `/api/ai` route

### Rationale
1. **Flexibility**: Works for both hosted and self-deployed scenarios
2. **Cost Control**: Users pay for their own AI usage
3. **Privacy**: User can verify what's sent (browser network tab)
4. **Graceful Degradation**: App works without AI (demo insights, local stats)

### Implementation
```typescript
if (useApiRoute) {
  // POST to /api/ai with prompts
} else {
  // Direct fetch to OpenAI API with user's key
}
```

### Consequences
- Two code paths to maintain
- Users need to understand API key management
- Server deployment optional, not required

---

## ADR-004: PWA-First Architecture

### Status
Accepted

### Context
The primary use case is daily tracking on mobile devices. Native apps require:
- App store approval process
- Separate iOS/Android codebases
- More complex deployment

### Decision
Build as a Progressive Web App (PWA) with full offline support.

### Rationale
1. **Single Codebase**: One app for all platforms
2. **Instant Updates**: No app store approval delays
3. **Offline Support**: Works without internet (critical for prayer times)
4. **Installable**: Add to home screen like a native app
5. **Web Distribution**: Share via URL, no downloads

### Implementation
- Serwist for service worker
- localStorage for data persistence
- Responsive design for all screen sizes
- Install prompts at appropriate moments

### Consequences
- Some native features unavailable (notifications limited, no widget)
- iOS PWA support has quirks
- Must handle offline/online transitions gracefully

---

## ADR-005: Zustand for State Management

### Status
Accepted

### Context
Need global state for:
- User profile and preferences
- Daily tracking data
- AI configuration
- Onboarding status

### Decision
Use Zustand with localStorage persistence.

### Rationale
1. **Simplicity**: Minimal boilerplate vs Redux
2. **Performance**: Selective subscriptions, no context re-renders
3. **Persistence**: Built-in `persist` middleware
4. **Migration**: Supports versioned storage migrations
5. **TypeScript**: Excellent type inference

### Implementation
```typescript
export const useStore = create<RamadanStore>()(
  persist(
    (set, get) => ({ /* state and actions */ }),
    {
      name: "ramadan-guide-storage",
      version: 5,
      migrate: (state, version) => { /* handle upgrades */ }
    }
  )
);
```

### Consequences
- All data in one store (could split if grows too large)
- Migration logic needed for breaking changes
- localStorage has ~5MB limit (sufficient for text data)

---

## ADR-006: Robust AI JSON Parsing

### Status
Accepted

### Context
AI models (GPT-4o-mini, GPT-4o) sometimes return:
- Clean JSON: `{"key": "value"}`
- Markdown-wrapped: ` ```json\n{...}\n``` `
- Text with JSON: `Here is the response: {...}`

This caused "Failed to parse AI response as JSON" errors.

### Decision
Implement multi-strategy parsing with fallbacks.

### Rationale
1. **Resilience**: Don't fail on minor format variations
2. **User Experience**: Errors are frustrating and opaque
3. **Model Agnostic**: Different models have different tendencies

### Implementation
```typescript
function parseJSONResponse<T>(text: string): T {
  // 1. Try direct parse
  // 2. Try markdown extraction
  // 3. Try object regex match
  // 4. Try array regex match
  // 5. Throw error if all fail
}
```

### Consequences
- More robust AI integration
- Slightly more complex parsing code
- May accept malformed responses (acceptable trade-off)

---

## ADR-007: Coach Hamza AI Persona

### Status
Accepted

### Context
Generic AI responses feel impersonal. The app is based on Coach Hamza Abdullah's book and methodology.

### Decision
All AI responses speak in Coach Hamza's voice with his perspective as a retired NFL player who fasted during 8 training camp seasons.

### Rationale
1. **Authenticity**: Based on real experience, not hypothetical advice
2. **Trust**: Users connect with a real person's story
3. **Consistency**: Unified voice across all features
4. **Relatability**: Athlete-to-athlete connection

### Implementation
```typescript
const COACH_HAMZA_SYSTEM_PROMPT = `
You are Coach Hamza Abdullah, a retired NFL player...
You fasted during 8 NFL training camp seasons...
Speak from personal experience, not general advice...
`;
```

### Consequences
- All prompts include persona context (token cost)
- Content must align with Coach Hamza's actual views
- Updates require coordination with ProBigBros team

---

## ADR-008: D3.js for Visualizations

### Status
Accepted

### Context
The dashboard needs charts for:
- Sleep patterns (bar chart)
- Hydration trends (line chart)
- 30-day calendar heatmap
- Radial clock for schedule

### Decision
Use D3.js for custom SVG visualizations.

### Rationale
1. **Flexibility**: Complete control over appearance
2. **Performance**: SVG renders smoothly
3. **Animations**: D3 transitions are fluid
4. **No Dependencies**: Single library for all charts
5. **Accessibility**: Can add proper ARIA labels

### Consequences
- More code than a chart library
- Learning curve for D3 patterns
- Must handle responsive sizing manually
- SSR considerations (render on client only)

---

## ADR-009: Hardcoded Ramadan Dates

### Status
Accepted

### Context
Ramadan follows the Islamic lunar calendar and dates shift each year. Options:
1. Calculate based on lunar calendar algorithms
2. Use an external API
3. Hardcode known dates

### Decision
Hardcode Ramadan dates for 2025-2027, update manually each year.

### Rationale
1. **Simplicity**: No complex calendar math
2. **Reliability**: No API dependency
3. **Accuracy**: Actual dates depend on moon sighting, not algorithms
4. **Maintainability**: Easy annual update

### Implementation
```typescript
const RAMADAN_DATES = {
  2025: { start: "2025-02-28", end: "2025-03-29" },
  2026: { start: "2026-02-17", end: "2026-03-18" },
  2027: { start: "2027-02-07", end: "2027-03-08" },
};
```

### Consequences
- Must update annually (add to release checklist)
- Dates are approximate (moon sighting varies by region)
- Fallback behavior needed for unknown years

---

## ADR-010: Install Prompt Timing

### Status
Accepted

### Context
PWA install prompts need strategic timing:
- Too early: User doesn't know what they're installing
- Too late: User may close tab before seeing it
- Original: 30s first visit, 2s return visit

### Decision
Show install banner on onboarding step 1, before user starts inputting data.

### Rationale
1. **Data Persistence**: User understands data will be saved
2. **Commitment Point**: They've decided to try the app
3. **Not Blocking**: Banner is dismissible
4. **Platform Awareness**: iOS needs instructions, Android has native prompt

### Implementation
- `InstallBanner` component (compact, inline)
- `InstallPrompt` component (modal, with instructions)
- Show banner in onboarding, prompt after engagement

### Consequences
- Better install conversion rate
- User sees value proposition first
- May still miss users who speed through onboarding

---

## ADR-011: Privacy-Preserving Accountability Partner

### Status
Accepted

### Context
Social accountability is the app's core differentiator. Other Muslim apps (Muslim Pro, etc.) either have no social features or build full social networks that raise privacy concerns (Muslim Pro's data was sold to the US military). Users want motivation from a partner without sacrificing privacy.

### Decision
Build a minimal accountability partner system that shares only aggregate daily stats (prayer count 0-5, hydration on/off track, streak days) via 6-character partner codes. No user accounts, no names, no chat.

### Rationale
1. **Privacy First**: Only 4 aggregate fields ever leave the device
2. **No Accounts**: Anonymous device IDs eliminate identity risk
3. **Simple UX**: Generate code, share via text, enter code — done
4. **Trust**: After Muslim Pro scandal, privacy is a competitive advantage
5. **Minimal Backend**: In-memory store works for MVP, Vercel KV for production

### Implementation
```typescript
// What gets synced (per user, daily) — ONLY this
interface DailySync {
  oderId: string;            // Anonymous device ID
  prayerCount: number;       // 0-5
  hydrationOnTrack: boolean; // 4+ glasses = on track
  streak: number;            // Consecutive days with 5/5 prayers
  lastUpdated: number;       // Timestamp
}
```

- Partner codes: 6-char alphanumeric (4 consonants + digit + alphanumeric)
- Connection state: localStorage (not Zustand) for partner metadata
- Sync throttle: Max once per hour
- API routes: `/api/partner/{connect,sync,disconnect}`
- Home widget: `PartnerWidget.tsx` shows partner stats or "Add Partner" CTA

### Consequences
- Users get accountability without privacy trade-offs
- In-memory API store resets on deploy (must migrate to Vercel KV for production)
- No push notifications for partner events (future consideration)
- Partner pairs are 1:1 (no group support yet)

---

## ADR-012: Partner Data in localStorage vs Zustand

### Status
Accepted

### Context
The accountability partner system needs to store connection metadata (partner code, device ID, connection timestamp). The app already uses Zustand with localStorage persistence for all other state.

### Decision
Store partner connection metadata directly in localStorage (separate keys) and only sync `partnerStats` through Zustand for UI reactivity.

### Rationale
1. **Separation of Concerns**: Connection state is infrastructure, not app state
2. **Independent Lifecycle**: Partner connection persists even if Zustand store is reset
3. **Security**: Device ID and codes shouldn't be part of exportable store data
4. **Sync Logic**: The sync module reads/writes localStorage directly, avoiding circular dependencies with Zustand

### Implementation
- `ramadan-partner-my-code`: This device's generated code
- `ramadan-partner-code`: Connected partner's code
- `ramadan-partner-stats`: Cached partner stats (JSON)
- `ramadan-partner-last-sync`: Timestamp of last sync
- `ramadan-guide-device-id`: Anonymous device identifier

Zustand only holds: `partnerStats` (for dashboard reactivity) and `lastPartnerSync`.

### Consequences
- Two storage mechanisms to understand (localStorage + Zustand)
- Partner data not included in Zustand backup/restore
- Clear separation between connection plumbing and display state

---

## ADR-013: Educational Series with AI Companion Guides

### Status
Accepted

### Context
The app needed educational content beyond coaching tips. Coach Hamza and scholars produce lecture series, but users often watch passively without retaining key takeaways, action items, or Islamic references.

### Decision
Build a comprehensive educational series system with AI-generated companion guides that extract hadiths, Qur'anic verses, key quotes, action items, discussion questions, and glossary terms from lecture transcripts.

### Rationale
1. **Active Learning**: Companion guides transform passive viewing into interactive study
2. **Rich Content Extraction**: AI can reliably extract Islamic references (hadiths with sources, verses with surah/ayah numbers) from transcripts
3. **Actionable**: Categorized action items (spiritual, practical, social, study) give users concrete next steps
4. **Cross-Referencing**: Cross-episode connections help users see the bigger picture across a series
5. **Scholar Attribution**: Multi-scholar support allows diverse voices while maintaining content integrity

### Implementation
- Admin panel (`/admin/series`) for CRUD operations on scholars, series, and episodes
- Separate admin Zustand store (`admin-store.ts`) in localStorage for content management
- Companion guide generation via `/api/series/generate` using transcripts
- Section-level regeneration for fine-tuning AI output
- User tracking via `seriesUserData` in main Zustand store

### Consequences
- Significant codebase expansion (series/, components/series/, admin/)
- Two separate Zustand stores (main app + admin)
- Admin panel requires ADMIN_SECRET for publish authentication
- Companion quality depends on transcript quality

---

## ADR-014: Vercel Blob for Series Data Distribution

### Status
Accepted

### Context
Series data (episodes, companion guides) needs to be available to all users. Options:
1. Bundle in the app build (static, large bundle)
2. Fetch from a database at runtime
3. Upload to Vercel Blob as static JSON files

### Decision
Use Vercel Blob storage for published series data, with static JSON files in `/public/data/series/` as fallback.

### Rationale
1. **Decoupled Publishing**: Admin can publish new content without rebuilding/redeploying
2. **CDN Distribution**: Vercel Blob serves from edge locations globally
3. **Fallback Safety**: Static files in `/public/data/` work if Blob is unavailable
4. **Versioning**: Publish timestamps enable cache invalidation
5. **Cost Effective**: Blob storage is cheaper than a database for read-heavy static content

### Implementation
```typescript
// fetcher.ts - tries Blob first, falls back to static
async function fetchSeriesIndex(): Promise<Series[]> {
  try {
    return await fetch(`${BLOB_BASE_URL}/series-index.json`).then(r => r.json());
  } catch {
    return await fetch('/data/series/series-index.json').then(r => r.json());
  }
}
```

### Consequences
- Requires `BLOB_READ_WRITE_TOKEN` and `NEXT_PUBLIC_BLOB_BASE_URL` env vars
- Admin must publish explicitly (or via auto-publish)
- Static fallback can become stale if not updated

---

## ADR-015: Canvas-Rendered Badge Sharing

### Status
Accepted

### Context
Badge achievements need to be shareable on social media. Options:
1. Server-side image generation (Vercel OG)
2. Client-side canvas rendering
3. Pre-designed static images per badge

### Decision
Use client-side Canvas 2D rendering with animated effects for badge images and video export.

### Rationale
1. **No Server Cost**: All rendering happens in the browser
2. **Rich Visuals**: Canvas allows dynamic effects (sparkles, glow, geometric patterns) impossible with static images
3. **Animated Export**: 3-second video loops are more engaging for social sharing than static images
4. **Tier Differentiation**: Bronze/silver/gold get distinct visual treatments dynamically
5. **Two Formats**: Feed (1080x1080) and Story (1080x1920) cover major social platforms

### Implementation
- `capture.ts`: Full 2D canvas renderer with Islamic geometric patterns, animated sparkles, tier-specific glow
- `share.ts`: Web Share API integration with fallback to download
- Renders frame-by-frame for video export via MediaRecorder API

### Consequences
- Canvas rendering code is complex (~500 lines in capture.ts)
- Video export requires browser MediaRecorder support
- No server-side OG images for link previews (separate OG route exists for series)
- High-quality output at 1080p resolution

---

## ADR-016: Separate Admin Store for Series Management

### Status
Accepted

### Context
The series admin panel needs to manage draft content (scholars, series, episodes, companions, transcripts, generation statuses) that should not pollute the main app Zustand store.

### Decision
Create a separate Zustand store (`admin-store.ts`) persisted to localStorage under a different key, exclusively for admin-side series management.

### Rationale
1. **Separation of Concerns**: Admin data (drafts, transcripts, generation status) is irrelevant to end users
2. **Independent Lifecycle**: Admin can reset their data without affecting user tracking
3. **Storage Efficiency**: Keeps the main store lean for regular users
4. **No Migration Conflicts**: Admin store can evolve independently without bumping main store version

### Implementation
```typescript
// admin-store.ts - separate from useStore.ts
const useAdminStore = create<SeriesAdminStore>()(
  persist(
    (set, get) => ({ /* admin state and CRUD actions */ }),
    { name: "ramadan-series-admin" }
  )
);
```

### Consequences
- Two Zustand stores to understand
- Admin data only available on the device where it was created
- No sync between admin devices (publish to Blob is the sync mechanism)
