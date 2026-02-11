# Ramadan Guide for Athletes

A Progressive Web App (PWA) that helps Muslim athletes thrive during Ramadan. Built with Next.js 16, React 19, and AI-powered coaching from Coach Hamza Abdullah.

## Features

### Daily Tracking
- **5 Daily Prayers** + Taraweeh (Ramadan only)
- **Hydration Monitoring** - 8 glasses goal with visual tracking
- **Sleep & Energy** - Track rest quality and energy levels
- **Qur'an Progress** - 30 Juz tracker with completion percentage
- **Tasbeeh Counter** - Digital dhikr with daily history

### AI-Powered Coaching
- **Coach Hamza** - Personalized advice from a retired NFL player who fasted 8 seasons
- **Daily Insights** - Pattern recognition for sleep, prayer, hydration
- **Training Advisor** - Workout modifications based on fasting state
- **Meal Planner** - Sahoor/Iftar recommendations for athletes
- **Schedule Builder** - AI-generated 24-hour Ramadan routine

### Year-Round Support
- **Pre-Ramadan**: Countdown + preparation checklist
- **During Ramadan**: Full tracking for all 30 days
- **Post-Ramadan**: Maintain habits, track Sunnah fasts

### Learning Resources
- Ramadan basics and etiquette
- Prophet's fasting practices (SAW)
- Laylatul Qadr guide
- Arabic pronunciation guide
- Transition to Islam resources

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **React**: 19.2
- **State**: [Zustand](https://zustand-demo.pmnd.rs/) with localStorage persistence
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [D3.js](https://d3js.org/)
- **PWA**: [Serwist](https://serwist.pages.dev/) (service worker)
- **AI**: OpenAI API (optional)
- **Testing**: [Playwright](https://playwright.dev/)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ramadan-guide.git
cd ramadan-guide

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

Create `.env.local` for AI features:

```env
OPENAI_API_KEY=your-api-key-here
```

Or configure the API key in-app via Settings.

## Project Structure

```
src/
├── app/                 # Next.js pages
│   ├── api/ai/         # AI API routes
│   ├── tracker/        # Daily tracking features
│   ├── learn/          # Educational content
│   └── ...
├── components/
│   ├── ai/             # AI-powered components
│   └── ...
├── lib/
│   ├── ai/             # AI integration (prompts, client)
│   ├── ramadan.ts      # Date/phase utilities
│   └── prayer-times.ts # Prayer times API
└── store/
    └── useStore.ts     # Global state
```

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
npm run test     # Playwright tests
npm run test:ui  # Interactive test UI
```

## PWA Installation

The app is installable on mobile devices:

**iOS Safari**:
1. Tap Share button
2. Tap "Add to Home Screen"
3. Tap "Add"

**Android Chrome**:
1. Tap menu (⋮)
2. Tap "Install App" or "Add to Home Screen"

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

- **Coach Hamza Abdullah** - Retired NFL player, content creator, voice of the app
- **ProBigBros** - [probigbros.com](https://probigbros.com)
- Based on the book "Ramadan Guide for Athletes"

## License

Private project - All rights reserved.

---

*Bismillah - May this app help you have your best Ramadan yet.*
