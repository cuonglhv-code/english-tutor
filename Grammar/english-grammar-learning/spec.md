# English Grammar Learning Webapp - Design Specification

## Project Overview

**Project Name:** GrammarQuest - English Grammar Learning Platform
**Type:** Interactive Educational Webapp (Integration Card for Existing Next.js Site)
**Target Audience:** Non-native English speakers (children to adults)
**Core Functionality:** Multi-level English grammar learning through practices, games, and homework assignments

## Design Philosophy

An inviting, warm, and encouraging learning environment that makes grammar feel approachable rather than intimidating. The design emphasizes progress visualization, gamification elements, and a sense of achievement.

## Color Palette (Strict - No Blue/Purple)

### Primary Colors
- **Terracotta Orange:** `#D97757` - Main CTA buttons, progress indicators
- **Warm Amber:** `#E8A945` - Highlights, achievements, stars
- **Deep Forest Green:** `#2D5A4A` - Success states, correct answers

### Neutral Colors
- **Warm Charcoal:** `#2C2C2C` - Primary text
- **Warm Grey:** `#6B6B6B` - Secondary text
- **Cream White:** `#FAF7F2` - Background
- **Soft Sand:** `#F0EBE3` - Card backgrounds
- **Light Taupe:** `#E5DED4` - Borders, dividers

### Accent Colors
- **Coral Red:** `#E85D4C` - Errors, incorrect answers
- **Soft Sage:** `#8FAE8B` - Correct answers, success
- **Dusty Rose:** `#C9A8A0` - Secondary accents

## Typography

### Font Families
- **Headings:** 'Playfair Display', serif - Elegant, approachable
- **Body:** 'Inter', sans-serif - Clean, highly readable
- **Accent/UI:** 'DM Sans', sans-serif - Friendly, modern

### Type Scale
- **H1:** 48px / 56px line-height (Page titles)
- **H2:** 32px / 40px line-height (Section titles)
- **H3:** 24px / 32px line-height (Card titles)
- **Body Large:** 18px / 28px line-height (Main content)
- **Body:** 16px / 24px line-height (Standard text)
- **Caption:** 14px / 20px line-height (Helper text)
- **Small:** 12px / 16px line-height (Labels)

## Layout System

### Grid Structure
- **Desktop:** 12-column grid, 1280px max-width container
- **Tablet:** 8-column grid, 768px breakpoint
- **Mobile:** 4-column grid, 480px breakpoint

### Spacing Tokens
- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px
- **2xl:** 48px
- **3xl:** 64px

### Card Design
- Border radius: 16px
- Shadow: `0 4px 24px rgba(44, 44, 44, 0.08)`
- Padding: 24px
- Background: Soft Sand (#F0EBE3)

## Learning Levels Structure

### Level Hierarchy
1. **Basic (Beginner)** - A1, A2 CEFR levels
   - Colors: Light Sage accents
   - Icon: Seedling

2. **Intermediate** - B1, B2 CEFR levels
   - Colors: Warm Amber accents
   - Icon: Growing Tree

3. **Advanced** - C1, C2 CEFR levels
   - Colors: Terracotta accents
   - Icon: Full Tree

## Feature Components

### 1. Practice Cards
- **Structure:** Question, input field, submit button, feedback area
- **States:** Default, Active (editing), Submitted (correct/incorrect), Loading
- **Animation:** Subtle bounce on correct answer, shake on incorrect

### 2. Game Components
- **Drag-and-Drop:** Reorder words to form sentences
- **Multiple Choice:** Select correct answer from options
- **Fill-in-the-Blank:** Type the correct word/phrase
- **Matching:** Connect related items
- **Timed Challenges:** Race against clock for bonus points

### 3. Homework Section
- **Assignment Cards:** Topic, due date, status, completion percentage
- **Submission Tracker:** Completed/Pending/Overdue states
- **Progress Bar:** Visual completion indicator

### 4. Progress Dashboard
- **XP Points:** Accumulated experience
- **Level Badge:** Current level with progress to next
- **Streak Counter:** Consecutive days practiced
- **Achievement Badges:** Unlockable milestones

### 5. Navigation Tabs
- Practices
- Games
- Homework
- Progress

## Interactive Elements

### Button Styles
- **Primary:** Terracotta Orange, white text, 12px radius
- **Secondary:** Outlined, Forest Green border
- **Ghost:** Text only, underline on hover
- **States:** Hover (darken 10%), Active (scale 0.98), Disabled (50% opacity)

### Input Fields
- Border: 2px Light Taupe
- Focus: 2px Terracotta Orange
- Error: 2px Coral Red
- Success: 2px Soft Sage
- Border radius: 8px

### Progress Indicators
- **Linear Bar:** Height 8px, rounded ends
- **Circular:** SVG-based, animated fill
- **Stars:** 1-3 stars per activity based on performance

## Animations & Transitions

### Micro-interactions
- Button hover: `transform: translateY(-2px)`, 200ms ease
- Card hover: `transform: translateY(-4px)`, box-shadow increase
- Correct answer: Green pulse, 300ms
- Incorrect answer: Horizontal shake, 400ms
- Level up: Confetti burst, 1000ms

### Page Transitions
- Section reveal: Fade + slide up, staggered 100ms
- Modal: Backdrop fade + scale from 0.95, 300ms
- Tab switch: Cross-fade, 200ms

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Bottom navigation bar
- Larger touch targets (min 44px)
- Collapsible sections
- Simplified game interactions

### Tablet (768px - 1024px)
- 2-column grid for cards
- Side navigation drawer
- Hover states disabled
- Touch-optimized controls

### Desktop (> 1024px)
- Full navigation visible
- 3-4 column card grid
- Hover effects enabled
- Keyboard shortcuts active

## Integration Card Design

For embedding into existing Next.js site:

### Card Container
- Max-width: 400px
- Full height within parent
- Rounded corners: 24px
- Subtle border: 1px Light Taupe
- Internal scroll for content

### Header
- Gradient overlay from Cream to Soft Sand
- App logo + name
- User avatar (if logged in)

### Main Content Area
- Tab navigation
- Scrollable content zone
- Fixed bottom action bar

## Accessibility

- WCAG 2.1 AA compliance
- Focus indicators on all interactive elements
- Sufficient color contrast (4.5:1 minimum)
- Keyboard navigation support
- Screen reader friendly labels
- Reduced motion option

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90
- Bundle size: < 500KB (initial load)

## Content Categories

### Grammar Topics by Level

**Basic:**
- Nouns & Articles (a, an, the)
- Subject-Verb Agreement
- Present Simple Tense
- Basic Adjectives
- Question Words (Who, What, Where)

**Intermediate:**
- Past & Future Tenses
- Modals (can, should, must)
- Comparatives & Superlatives
- Passive Voice Introduction
- Conditional Sentences (0 & 1)

**Advanced:**
- Perfect Tenses
- Complex Passive Voice
- All Conditional Types
- Subjunctive Mood
- Advanced Clause Structure

## Gamification Elements

- XP Points per correct answer (10-50 based on difficulty)
- Daily streak bonuses
- Achievement unlocks at milestones
- Leaderboard positioning
- Virtual rewards (badges, avatars)
- Level-up celebrations

## Technical Implementation

### Stack
- HTML5, CSS3 (custom properties), Vanilla JavaScript
- No framework dependencies for core functionality
- CSS Grid & Flexbox for layout
- CSS Animations & Transitions
- LocalStorage for progress persistence

### Data Structure
```javascript
{
  user: { id, name, level, xp, streak },
  progress: { level: { completed: [], scores: [] } },
  homework: { id, topic, dueDate, status, score },
  achievements: { id, name, unlocked, date }
}
```

### State Management
- JavaScript module pattern
- Event-driven updates
- Reactive UI updates on data change
