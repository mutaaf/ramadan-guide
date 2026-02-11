# Changelog

All notable changes to the Ramadan Guide project.

## [Unreleased]

### Added
- **Accountability Partner System** (Phase 1)
  - Privacy-preserving partner pairing via 6-character codes
  - Partner dashboard (`/partner`) showing side-by-side progress comparison
  - Partner connect page (`/partner/connect`) for code generation and entry
  - PartnerWidget on home dashboard showing partner stats or "Add Partner" CTA
  - API routes for connect, sync, and disconnect (`/api/partner/`)
  - Daily stat sync: prayer count, hydration status, streak days
  - Celebration messages when both partners complete all prayers
  - Disconnect with confirmation modal
  - Share partner code via Web Share API or clipboard
- Comprehensive documentation (CLAUDE.md, README.md, ARCHITECTURE.md)
- AI knowledge base for future developers and LLMs

### Changed
- Zustand store migrated to v6 (added `partnerStats`, `lastPartnerSync`, `getPrayerStreak()`)
- More page navigation now includes "Accountability Partner" link

---

## [0.1.0] - 2025 (Initial Development)

### Core Features

#### Tracking System
- Daily journal with prayer tracking (5 daily + Taraweeh)
- Hydration tracker (8 glasses goal)
- Sleep and rest quality logging
- Qur'an progress (30 Juz with percentage)
- Tasbeeh counter with history
- Mood and training type tracking
- Sahoor/Iftar meal logging

#### AI Integration
- Coach Hamza persona (retired NFL player voice)
- Daily coaching insights
- Training advice based on fasting state
- Meal planning for athletes
- Reflection and duaa generation
- AI-powered schedule builder
- Pattern recognition for health metrics

#### Phase-Aware System
- Pre-Ramadan: Countdown mode + preparation features
- Ramadan: Full 30-day tracking
- Post-Ramadan: Maintenance mode + habit continuation
- Taraweeh only visible during Ramadan phase

#### PWA Features
- Installable on iOS and Android
- Offline support via service worker
- Local data persistence
- Install prompts during onboarding

#### Learning Resources
- Ramadan basics and etiquette
- Prophet's fasting practices
- Laylatul Qadr guide
- Arabic pronunciation guide
- Five Pillars of Islam
- Transition to Islam resources

### Technical Decisions

#### Prayer Count (5/5 not 6/6)
- **Decision**: Count only 5 obligatory daily prayers
- **Rationale**: Taraweeh is optional and Ramadan-specific
- **Implementation**: Separate tracking with visual divider

#### Year-Round Tracking
- **Decision**: Support pre/during/post Ramadan phases
- **Rationale**: Users want to prepare and maintain habits
- **Implementation**: `getPhaseInfo()` function with phase-aware UI

#### AI Response Parsing
- **Decision**: Multiple fallback strategies for JSON extraction
- **Rationale**: LLMs sometimes wrap JSON in markdown or add text
- **Implementation**: Try direct parse → markdown → object match → array match

#### Client-Side API Keys
- **Decision**: Store API key in localStorage
- **Rationale**: No server costs, user controls their own key
- **Implementation**: Optional server route for deployment scenarios

#### PWA-First Design
- **Decision**: Design for mobile installation first
- **Rationale**: Primary use case is daily tracking on phones
- **Implementation**: Serwist service worker, responsive UI

### Known Issues Resolved

1. **Prayer count showing 6/6** → Fixed to 5/5 + separate Taraweeh
2. **JSON parsing errors in schedule builder** → Added robust fallback parsing
3. **Install prompt too late** → Moved to onboarding step 1
4. **No year-round support** → Added phase system

---

## Design Philosophy

### Principles

1. **Offline-First**: Every feature should work without internet
2. **Privacy-Focused**: All data stays on device
3. **Culturally Authentic**: Content reviewed for Islamic accuracy
4. **Athlete-Centric**: Designed for training + fasting balance
5. **Progressive Enhancement**: Works without AI, better with it

### UX Decisions

- Dark theme (easier on eyes during late-night Taraweeh)
- Gold accent color (elegance, Ramadan association)
- Bottom navigation (mobile ergonomics)
- Card-based layouts (scannable, touch-friendly)
- Minimal required inputs (respect user's time)

### AI Coaching Philosophy

- **Personal**: Use athlete's name and sport
- **Practical**: Actionable advice, not generic
- **Encouraging**: Positive reinforcement
- **Experienced**: Speak from Coach Hamza's NFL seasons
- **Islamic**: Connect athletic discipline to spiritual practice

---

## Migration Notes

### Storage Version History

| Version | Changes |
|---------|---------|
| 0 | Initial release |
| 1 | Added `useApiRoute` flag |
| 2 | Migrated `juzCompleted[]` to `juzProgress[]`, added tasbeeh |
| 3 | Added `userProfile` and `userMemory` |
| 4 | Added health patterns, smart prompts, entry sources |
| 5 | Added `customSchedule` for AI-generated routines |
| 6 | Added `partnerStats`, `lastPartnerSync` for accountability partner |

### Upgrade Path

Zustand's persist middleware handles migrations automatically. When adding new state:

1. Increment `version` in persist config
2. Add migration logic in `migrate` function
3. Initialize new fields with defaults

---

## Future Considerations

### Potential Features
- [x] Accountability partner (Phase 1 — code-based pairing)
- [ ] Challenge rooms (anonymous themed challenges with leaderboards)
- [ ] Streak celebrations (shareable milestone images)
- [ ] Proactive check-ins (Coach Hamza initiates based on patterns)
- [ ] Prayer quality (Khushu) tracking
- [ ] Emotional state check before journal
- [ ] Family/group tracking
- [ ] Multi-language support
- [ ] Notification reminders

### Technical Debt
- [ ] Migrate partner API from in-memory store to Vercel KV for production persistence
- [ ] Add more Playwright tests (including partner flow)
- [ ] Improve error boundaries
- [ ] Add Sentry or error tracking
- [ ] Optimize bundle size
- [ ] Add E2E tests for AI flows

### Content Updates
- [ ] Add more hadith content
- [ ] Regional Ramadan date handling
- [ ] More sports-specific advice
- [ ] Video content integration
