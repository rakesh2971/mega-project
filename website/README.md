# NeuroMate — Website

NeuroMate is an AI-powered productivity and mental wellness platform. This folder contains the complete web application stack split into three sub-directories: a React/Vite frontend, an Express/Node.js backend API, and a PostgreSQL database schema.

---

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v3, Radix UI, shadcn/ui, TanStack Query |
| Backend  | Node.js, Express, Supabase (PostgreSQL), Sentry |
| Database | PostgreSQL via Supabase (schema managed with raw SQL) |

---

## File Structure

```
website/
├── frontend/                     # React + Vite web application
│   ├── public/                   # Static assets (favicon, images)
│   ├── src/
│   │   ├── assets/               # Bundled images and icons
│   │   ├── components/           # Reusable UI components
│   │   │   ├── activities/       # Activity tracking components
│   │   │   ├── community/        # Community feature components
│   │   │   ├── ui/               # shadcn/ui base components
│   │   │   ├── ContributionCalendar.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── PersonalSectionPanel.tsx
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # Utility functions (e.g., cn helper)
│   │   ├── pages/                # Route-level page components
│   │   │   ├── Home.tsx          # Landing / hero page
│   │   │   ├── Auth.tsx          # Login & registration
│   │   │   ├── Dashboard.tsx     # User dashboard
│   │   │   ├── Features.tsx      # Feature showcase
│   │   │   ├── Pricing.tsx       # Pricing tiers
│   │   │   ├── Download.tsx      # Desktop app download
│   │   │   ├── Community.tsx     # Community hub (nested routes)
│   │   │   ├── CommunityChallenges.tsx
│   │   │   ├── CommunityQA.tsx
│   │   │   ├── CommunitySettings.tsx
│   │   │   ├── CommunityTrending.tsx
│   │   │   ├── Profile.tsx       # User profile & stats
│   │   │   ├── Settings.tsx      # Account settings (full page)
│   │   │   ├── Productivity.tsx  # Productivity tracker
│   │   │   ├── KillSwitch.tsx    # App/site blocker
│   │   │   ├── Resources.tsx     # Learning resources
│   │   │   ├── About.tsx         # About page
│   │   │   ├── Contact.tsx       # Contact form
│   │   │   ├── CustomizeAvatar.tsx
│   │   │   ├── MyPosts.tsx
│   │   │   └── NotFound.tsx      # 404 fallback
│   │   ├── App.tsx               # Root component & React Router setup
│   │   ├── main.tsx              # App entry point
│   │   └── index.css             # Global Tailwind styles
│   ├── .env                      # Environment variables (Supabase URL & keys)
│   ├── .gitignore
│   ├── components.json           # shadcn/ui config
│   ├── eslint.config.js
│   ├── index.html                # HTML entry point
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── backend/                      # Express REST API
│   ├── routes/                   # API route handlers
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── activities.js         # Activity CRUD & analytics
│   │   ├── profile.js            # User profile management
│   │   ├── beta.js               # Beta sign-up handling
│   │   └── contact.js            # Contact form submission
│   ├── db.js                     # Supabase client initialization
│   ├── server.js                 # Express app setup, CORS, route mounting
│   ├── instrument.js             # Sentry performance monitoring setup
│   ├── .env                      # Environment variables (Supabase, Sentry DSN)
│   ├── package.json
│   └── package-lock.json
│
└── database/
    └── schema.sql                # Full PostgreSQL schema (tables, indexes, RLS policies)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Database Setup
Run the SQL schema against your Supabase project:
```bash
# In the Supabase SQL Editor, paste and run:
database/schema.sql
```

### 2. Backend

```bash
cd website/backend
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, SENTRY_DSN
npm install
npm run dev            # starts on http://localhost:3000
```

### 3. Frontend

```bash
cd website/frontend
cp .env.example .env   # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm install
npm run dev            # starts on http://localhost:5173
```

---

## Key Features (Website)

- 🔐 **Authentication** — Supabase Auth (email/password, OAuth)
- 📊 **Dashboard** — Activity streaks, contribution calendar, progress charts
- 🏆 **Community** — Q&A, trending posts, challenges, leaderboards
- ⚙️ **Settings** — Full account management, notification preferences
- 🚫 **Kill Switch** — Distraction blocker configuration
- 📚 **Resources** — Curated learning materials
- 📈 **Productivity** — Task tracking and analytics
- 📡 **Error Monitoring** — Sentry integration on both frontend and backend
