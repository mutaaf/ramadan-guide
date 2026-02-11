# Architecture Deep Dive

This document provides detailed technical context for developers working on the Ramadan Guide codebase.

## State Management

### Zustand Store (`src/store/useStore.ts`)

The app uses a single Zustand store with persistence to localStorage.

#### Key State Slices

```typescript
// User identity & profile
userName: string
sport: string
onboarded: boolean
userProfile: UserProfile        // Detailed profile
userMemory: UserMemory          // AI-learned preferences

// Daily tracking
days: Record<string, DayEntry>  // Keyed by "YYYY-MM-DD"
juzProgress: number[]           // 30 items, 0-100 each
tasbeehHistory: TasbeehHistory  // Dhikr counts per day
checklist: Record<string, boolean>
challengesCompleted: Record<string, boolean>

// AI configuration
apiKey: string
useApiRoute: boolean            // Use /api/ai vs direct API
aiModelPreference: string

// Custom schedule
customSchedule: CustomSchedule | null

// Accountability partner
partnerStats: PartnerStats | null
lastPartnerSync: number | null
```

#### Persistence & Migration

Storage version is tracked for migrations:

```typescript
{
  name: "ramadan-guide-storage",
  version: 6,  // Current version
  migrate: (state, version) => {
    // Handle upgrades from older versions
  }
}
```

When adding new state fields, increment the version and add migration logic.

---

## Phase System

### How It Works

The app determines the current phase by comparing today's date against known Ramadan dates:

```typescript
// src/lib/ramadan.ts
const RAMADAN_DATES = {
  2025: { start: "2025-02-28", end: "2025-03-29" },
  2026: { start: "2026-02-17", end: "2026-03-18" },
  2027: { start: "2027-02-07", end: "2027-03-08" },
};
```

### PhaseInfo Return Value

```typescript
interface PhaseInfo {
  phase: "pre-ramadan" | "ramadan" | "post-ramadan";
  dayOfRamadan: number;      // 1-30 during Ramadan, 0 otherwise
  daysUntilRamadan: number;  // Days until next Ramadan
  daysSinceRamadan: number;  // Days since last Ramadan ended
  currentYear: number;
  ramadanYear: number;       // Year we're tracking toward
  ramadanStartDate: string;
  ramadanEndDate: string;
}
```

### Usage Pattern

```typescript
const phaseInfo = getPhaseInfo();

if (phaseInfo.phase === "ramadan") {
  // Show full Ramadan features
} else if (phaseInfo.phase === "pre-ramadan") {
  // Show countdown, preparation mode
} else {
  // Post-Ramadan maintenance mode
}
```

---

## AI Integration

### Request Flow

```
User Action
    ↓
useAI Hook (components)
    ↓
executeAIRequest (lib/ai/client.ts)
    ↓
┌─────────────────┐
│ Check Cache     │ → Cache Hit → Return cached response
└─────────────────┘
    ↓ Cache Miss
┌─────────────────┐
│ Build Prompts   │ → systemPrompt + userPrompt
└─────────────────┘
    ↓
┌─────────────────┐     ┌─────────────────┐
│ useApiRoute?    │ Yes │ /api/ai route   │
└─────────────────┘ ──→ └─────────────────┘
    ↓ No
┌─────────────────┐
│ Direct OpenAI   │ → Uses client-side API key
└─────────────────┘
    ↓
┌─────────────────┐
│ Parse Response  │ → JSON extraction with fallbacks
└─────────────────┘
    ↓
┌─────────────────┐
│ Cache Result    │ → IndexedDB with TTL
└─────────────────┘
    ↓
Return to component
```

### JSON Parsing Strategy

The `parseJSONResponse` function handles various AI output formats:

1. **Direct parse**: Clean JSON response
2. **Markdown extraction**: ` ```json ... ``` ` blocks
3. **Object extraction**: Find `{...}` in text
4. **Array extraction**: Find `[...]` in text

This robustness prevents "Failed to parse AI response" errors.

### Prompt Architecture

Each AI feature has a prompt builder in `src/lib/ai/prompts/`:

```typescript
export function buildFeaturePrompts(input: FeatureInput) {
  const systemPrompt = `${COACH_HAMZA_SYSTEM_PROMPT}

    // Feature-specific instructions...
  `;

  const userPrompt = `
    // User context and data...

    Respond in this exact JSON format:
    {
      "field1": "...",
      "field2": "..."
    }
  `;

  return { systemPrompt, userPrompt };
}
```

### Coach Hamza System Prompt

Located in `src/lib/ai/prompts/system.ts`, this defines the AI persona:

- Retired NFL player (Washington Redskins, Denver Broncos)
- Fasted during 8 NFL training camp seasons
- Direct, encouraging, practical advice style
- Connects athletic discipline to Ramadan practices

---

## Prayer Times Integration

### Aladhan API

```typescript
// src/lib/prayer-times.ts
const API_BASE = "https://api.aladhan.com/v1";

interface PrayerTimes {
  Fajr: string;    // "05:23"
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}
```

### Location Caching

Coordinates are cached to avoid repeated geolocation requests:

```typescript
interface CachedLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

// Cached for 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;
```

### Next Prayer Calculation

The `getNextPrayer` function returns:
- Prayer name
- Prayer time
- Countdown string ("in 2h 15m")

Used in the home dashboard prayer widget.

---

## PWA Architecture

### Service Worker (Serwist)

Configured in `next.config.ts`:

```typescript
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});
```

### Caching Strategy

- **Static assets**: Cache-first
- **API responses**: Network-first with fallback
- **Prayer times**: Stale-while-revalidate

### Offline Support

- All pages work offline (static generation)
- AI features gracefully degrade to cached or demo content
- localStorage data always available

---

## Component Patterns

### AI-Powered Components

```typescript
export function AIFeatureComponent({ input }: Props) {
  const { data, loading, error, generate, cached } = useAI<
    FeatureInput,
    FeatureOutput
  >("feature-name", input, buildPrompts, { autoTrigger: true });

  if (loading) return <Skeleton />;
  if (error) return <ErrorState onRetry={generate} />;
  if (!data) return null;

  return <FeatureUI data={data} />;
}
```

### Card Component

Standard container with entrance animation:

```typescript
<Card delay={0.1} className="custom-classes">
  {/* Content */}
</Card>
```

### Page Structure

```typescript
export default function FeaturePage() {
  return (
    <div>
      <PageHeader title="Title" subtitle="Subtitle" back="/parent" />
      <div className="px-6 pb-8">
        {/* Page content */}
      </div>
    </div>
  );
}
```

---

## Styling System

### CSS Variables

Defined in `globals.css`:

```css
:root {
  --background: #0a0a0a;
  --foreground: #ededed;
  --card: rgba(255, 255, 255, 0.03);
  --surface-1: rgba(255, 255, 255, 0.05);
  --surface-2: rgba(255, 255, 255, 0.08);
  --accent-gold: #c9a84c;
  --accent-green: #4ade80;
  --accent-blue: #60a5fa;
  --muted: rgba(255, 255, 255, 0.5);
  /* ... */
}
```

### Tailwind Integration

Custom values via CSS variables:

```html
<div style={{ color: "var(--accent-gold)" }}>
  Gold text
</div>
```

### Animation Patterns

Using Framer Motion:

```typescript
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

---

## Testing Strategy

### Playwright Tests

Located in `tests/` or `e2e/`:

```typescript
import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Ramadan Guide/);
});
```

### Running Tests

```bash
npm run test        # Headless
npm run test:ui     # Interactive UI
```

### What to Test

- Critical user flows (onboarding, tracking)
- AI feature error handling
- Offline functionality
- Data persistence

---

## Performance Considerations

### Code Splitting

- Each page is a separate chunk
- AI components lazy-loaded where appropriate

### Caching Layers

1. **Browser Cache**: Static assets
2. **Service Worker**: Offline pages
3. **IndexedDB**: AI responses (via AICache)
4. **localStorage**: User data (via Zustand)

### Optimization Tips

- Use `useMemo` for expensive calculations
- Lazy load charts and visualizations
- Minimize re-renders with proper dependency arrays

---

## Security Notes

1. **API Key Storage**: Client-side in localStorage (user's own key)
2. **No Server-Side Data**: All data stays on device
3. **AI Requests**: Go directly to OpenAI or through Vercel API route
4. **No Analytics**: Privacy-focused (Vercel Analytics optional)

---

## Common Gotchas

1. **Date Handling**: Always use `getTodayString()` for consistency
2. **Hydration**: Check `mounted` state before accessing localStorage
3. **Prayer Names**: Match exactly: "fajr", "dhur", "asr", "maghrib", "ishaa", "taraweeh"
4. **Phase Changes**: `getPhaseInfo()` should be called fresh, not cached
5. **AI Model Names**: "gpt-4o-mini" or "gpt-4o" (not "gpt-4")
