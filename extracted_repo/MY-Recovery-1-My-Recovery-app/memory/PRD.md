# MyRecovery - Recovery Companion App

## Original Problem Statement
Build a mobile-first recovery companion app called "MyRecovery" to help users manage cravings.

## Product Requirements

### Core Features
- **Authentication:** Email and password-based user accounts
- **Core Feature (Craving Flow):** A guided process to help users through a craving
- **Coping Tools Library:** Interactive coping mechanisms
  - **MANDATORY (when from craving flow):**
    - Deep Breathing (4-7-8 pattern) with animated visuals
    - Box Breathing with animated visuals
    - Grounding (5-4-3-2-1 sensory) with text inputs
    - Delay 10 Minutes countdown timer
    - Change Your Location (room inputs + 5-minute timer)
  - **OPTIONAL:**
    - Craving Surfing
    - Take a Short Walk
    - Cold Water Reset
    - Reach Out to Someone
- **Journaling:** Log entries including completed craving sessions
- **Progress Tracking:** Streaks, stats, and 14-day cravings chart
- **Resources:** External links to support websites
- **Settings & Privacy:** User settings, CSV export, privacy page, account deletion
- **Calendar:** Local calendar with monthly/weekly/daily views, event scheduling

### Design Direction
- **App Name:** MyRecovery (heart icon logo)
- **Theme:** Dark mode primary (#0F1115 background)
- **Typography:** Bold, strong hierarchy (40px+ headlines, Inter font)
- **Home Screen:** 
  - Top bar with heart icon + "MYRECOVERY" uppercase
  - "Welcome back" text above user's name
  - Reddish CTA button for craving flow
  - 6 uniform navigation tiles
  - Frosted glass bottom navigation

## Technical Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, date-fns
- **Backend:** FastAPI, MongoDB
- **Authentication:** JWT-based
- **Notifications:** Browser Push + In-app toasts

## Architecture
```
/app/
├── backend/
│   ├── server.py (includes Calendar API endpoints)
│   ├── seed_data.py
│   └── tests/
│       └── test_craving_session.py (NEW)
└── frontend/
    └── src/
        ├── components/
        │   ├── BottomNav.js (Home, Tools, Progress, Settings)
        │   ├── BreathingExercise.js (FIXED - phase cycling)
        │   ├── TopNav.js (NEW - back/home/forward navigation)
        │   ├── DelayExercise.js
        │   ├── GroundingExercise.js
        │   └── SimpleLineChart.js
        └── pages/
            ├── Auth.js
            ├── CalendarPage.js (TopNav added)
            ├── CopingTools.js (TopNav added, craving flow message)
            ├── CravingFlow.js (Updated: 2-step flow, TopNav)
            ├── Home.js (6 tiles, reduced spacing)
            ├── Journal.js (TopNav added)
            ├── JournalAdd.js, JournalDetail.js
            ├── Onboarding.js (Emergency Contact)
            ├── Privacy.js
            ├── Progress.js (TopNav added)
            ├── Resources.js (TopNav added)
            ├── Settings.js (TopNav added)
            └── TimerSession.js
```

## What's Been Implemented

### December 2025 - Session 5
- **App Rebranding:**
  - Changed app name from "Anchor" to "MyRecovery"
  - Replaced Anchor icon with Heart icon (filled, pink #E57373)
  - Updated Auth.js, Home.js, Onboarding.js, index.html
- **Tool Renaming:**
  - "4-7-8 Breathing" → "Deep Breathing"
  - "5-4-3-2-1 Grounding" → "Grounding"
- **Mandatory vs Optional Tools:**
  - 5 tools marked as mandatory when coming from craving flow
  - Mandatory tools show "Required" badge with orange border
  - Optional tools show "Optional" badge with "Mark as Complete" button
  - Progress bar tracks mandatory tool completion (X/5)
- **Change Your Location Exercise:**
  - Created LocationChangeExercise.js component
  - Two room input fields (from/to)
  - 5-minute countdown timer
  - "Start Timer" disabled until both rooms filled
  - "Complete" disabled until timer finishes
- **Session Recording:**
  - Completed tool sessions save to journal
  - When all 5 mandatory tools complete, auto-saves to journal

### December 2025 - Session 4
- **TopNav Component (NEW):**
  - Created reusable TopNav component with back (<), home, and forward (>) buttons
  - Added to all pages: CopingTools, Journal, Progress, Resources, Settings, Calendar, CravingFlow
- **Craving Flow Update:**
  - Simplified from 3 steps to 2 steps
  - Step 1: "What's triggered you?" (select triggers)
  - Step 2: "How intense is the craving?" (slider 1-10)
  - Records date/time when session starts
  - After step 2, navigates to Coping Tools page (not timer session)
  - Shows "Your craving has been recorded" message on Coping Tools when coming from flow
- **Backend Update:**
  - Made `need_type` optional in CravingSessionCreate model
  - Added `started_at` field support for recording session start time

### December 2025 - Session 3
- **UI Tweaks on Home Page:**
  - Reduced vertical spacing (mb-6 instead of mb-8)
  - Made all 6 navigation tiles uniform in size
  - Reordered tiles: Journal, Calendar, Progress, Coping Tools, Resources, Call Emergency Contact
  - "Call Emergency Contact" now shows full label
- **Bottom Navigation Update:**
  - Replaced "Journal" with "Home" (navigates to /home)
  - Icon changed from BookOpen to Home
- **CRITICAL BUG FIX - Breathing Animation:**
  - Fixed phase cycling bug (In → Hold → Out) that was stuck on "In" phase
  - Refactored to use useRef for timers to prevent React cleanup issues
  - Added separate targetScale and animationDuration state variables
  - During "hold" phase, animationDuration is set to 0 to prevent jitter
  - Added data-testid attributes for testing

## API Endpoints
### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/onboarding

### User
- PATCH /api/user/settings
- DELETE /api/user/delete-account

### Calendar (NEW)
- GET /api/calendar/events
- POST /api/calendar/events
- GET /api/calendar/events/{event_id}
- PUT /api/calendar/events/{event_id}
- DELETE /api/calendar/events/{event_id}

### Other
- GET /api/coping-tools
- POST /api/craving-sessions
- GET /api/journal
- GET /api/progress
- GET /api/progress/chart-data
- GET /api/resources
- GET /api/export

## Database Schema

### CalendarEvent (NEW)
```json
{
  "id": "string (UUID)",
  "user_id": "string",
  "title": "string",
  "description": "string (optional)",
  "date": "string (YYYY-MM-DD)",
  "time": "string (HH:MM)",
  "duration": "int (minutes)",
  "reminder": "int (minutes before)",
  "reminder_enabled": "boolean",
  "created_at": "string (ISO datetime)"
}
```

## Pending Tasks

### P1 - High Priority
- Add CravingSessions data to CSV export (`/api/users/export` endpoint)

### P2 - Medium Priority  
- Test Craving Timer persistence across navigation
- Create automated tests for core flows
- Verify journal entries contain all craving session data

### P3 - Backlog
- External calendar sync (Google Calendar, etc.)
- Calendar notifications system for upcoming appointments
- Add statistics for completed coping tools

## Test Credentials
- Email: testuser2@example.com
- Password: test123456
