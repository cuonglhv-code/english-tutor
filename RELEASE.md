# Jaxtina Tutor — The Learning Adventure Update 🚀

## What’s New 🌟
Welcome to the all-new Jaxtina Tutor experience! We’ve transformed the platform into a bright, playful "Learning Adventure" designed to make your IELTS preparation more engaging and effective. 
- **Fresh Visual Theme**: Say goodbye to the dark mode; enjoy a welcoming off-white design with vibrant Coral and Teal accents.
- **Gamified Quiz Experience**: Test your knowledge in our revamped 3-phase Quiz system (Setup, Gameplay, and Results).
- **Global Leaderboard**: Compete for a spot in the Top 50 per category and track your progress against fellow learners.
- **Enhanced Practice Wizard**: A smoother, more intuitive step-by-step journey to getting your band score instantly.

## Improvements ✨
- **Mission Tiles**: All main dashboards, courses, and widgets now use a high-radius "Mission Tile" design (48px corners) for a premium, tactile feel.
- **Unified Branding**: Every screen—from Login and Registration to your Academic Analytics—is now unified under a cohesive adventure aesthetic.
- **Detailed Feedback**: Quiz results now clearly display your choices alongside correct answers, with expanded support for both English and Vietnamese.
- **Dynamic Progress**: New organic progress indicators and gradients in the Practice Wizard help you visualize your path to Band 8.0+.

## Technical Changes 🛠️
- **Design System Tokens**: Standardized global CSS variables for `--primary` (#FF7043), `--secondary` (#26A69A), and `--surface` (#FAFAF8).
- **Phase-Based Logic**: Re-engineered the Quiz engine into a robust state-machine handling setup, active play, and localized results.
- **High-Performance API**: The Leaderboard API now supports group-based filtering with a 50-record limit, ensuring rapid load times during peak usage.
- **Routing & i18n Integrity**: Audited all internal links to enforce `/[lang]/` path prefixes and added `yourAnswer`/`correctAnswer` keys to core dictionaries.

## Migration / Notes 📝
- **QA Verification**: Test the Quiz phase transitions and leaderboard sorting logic across different question counts (5, 10, 15, 20).
- **Route Persistence**: Verify that the Language Switcher maintains the active page context without defaulting to the home route.
- **Guest Mode Logic**: Confirm that unauthenticated users can still participate in quizzes with results persisting via `localStorage`.
- **UI Performance**: Check for any layout shifts on mobile devices due to the new high-radius border patterns.
