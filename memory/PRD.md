# MyRecovery - Recovery Companion Mobile App

## Overview
MyRecovery is a mobile application designed to help individuals in addiction recovery manage cravings, track progress, and access coping tools. Built with Expo React Native for cross-platform support.

## Tech Stack
- **Frontend:** Expo React Native with TypeScript
- **Backend:** FastAPI with Python
- **Database:** MongoDB
- **Authentication:** JWT-based email/password auth

## Core Features

### 1. Authentication & Onboarding
- Email/password registration and login
- 3-step onboarding process
- Emergency contact setup
- Personalized timer settings

### 2. Home Dashboard
- Welcome message with user name
- Quick access "I'm Having a Craving" button
- Navigation tiles to all features
- Emergency call shortcut

### 3. Craving Flow (3-Step Guided Process)
- Step 1: Identify triggers (9 predefined + custom)
- Step 2: Rate intensity (1-10 scale)
- Step 3: Identify needs (distract, calm, support, escape, reflect)
- Auto-creates craving session in database

### 4. Coping Tools Library
- 9 coping tools with step-by-step instructions
- 5 mandatory tools for craving sessions
- Optional tools for additional support
- Mark as complete functionality
- Reach Out tool with phone contacts

### 5. Journal
- Create entries (craving vs daily check-in)
- Track triggers, intensity, tools used, outcome
- View insights (top triggers, most helpful tools)
- Entry history with filtering

### 6. Progress Tracking
- Day streak counter
- Days clean tracker
- 14-day craving chart
- Weekly summary statistics
- Top triggers and most helpful tools insights

### 7. Calendar
- Monthly view calendar
- Add/delete events
- Event reminders
- Visual indicators for days with events

### 8. Resources
- Default support hotlines (SAMHSA, NA, AA, Crisis Text Line)
- Custom resource management
- Quick link to external resources

### 9. Settings
- Profile management
- Sponsor/emergency contact setup
- Timer duration preferences
- Sobriety date tracking
- Account deletion

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/onboarding` - Complete onboarding

### Coping Tools
- `GET /api/coping-tools` - Get all tools
- `POST /api/coping-tools/{id}/favorite` - Toggle favorite

### Craving Sessions
- `POST /api/craving-sessions` - Create session
- `GET /api/craving-sessions` - Get all sessions
- `PATCH /api/craving-sessions/{id}/complete` - Complete session

### Journal
- `POST /api/journal` - Create entry
- `GET /api/journal` - Get all entries
- `GET /api/journal/{id}` - Get single entry
- `GET /api/journal/insights` - Get insights

### Progress
- `GET /api/progress` - Get stats
- `GET /api/progress/chart-data` - Get chart data

### Calendar
- `GET /api/calendar/events` - Get events
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/{id}` - Update event
- `DELETE /api/calendar/events/{id}` - Delete event

### Resources
- `GET /api/resources` - Get resources
- `POST /api/resources` - Create resource
- `DELETE /api/resources/{id}` - Delete resource

### User
- `PATCH /api/user/settings` - Update settings
- `DELETE /api/user/delete-account` - Delete account

## Database Collections
- `users` - User profiles and settings
- `coping_tools` - Seeded coping tools data
- `craving_sessions` - User craving sessions
- `journal_entries` - Journal entries
- `calendar_events` - Calendar events
- `resources` - User-added resources
- `timer_guidance` - Timer step messages

## Status: MVP Complete
- All backend endpoints functional (21/21 tested - 100% pass rate)
- Frontend screens implemented for all features
- Authentication flow working
- Database persistence working
