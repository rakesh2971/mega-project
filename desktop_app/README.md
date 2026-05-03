# NeuroMate — Desktop App

NeuroMate Desktop is a high-performance Windows (and cross-platform) native application built with **Tauri v2**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. It delivers the full NeuroMate experience as a lightweight native binary with a glassmorphic UI, a dual-window architecture (main app + always-on-top floating avatar), deep OS integration via Tauri plugins, and a complex backend including AI microservices.

---

## Tech Stack

| Layer          | Technology |
|----------------|------------|
| UI Framework   | React 19, TypeScript, Vite |
| Styling        | Tailwind CSS v4, `tailwindcss-animate` |
| State          | Zustand |
| Routing        | React Router DOM v7 |
| Icons          | Lucide React |
| Rust Backend   | Tauri v2 (Rust) |
| Native Plugins | `plugin-notification`, `plugin-shell`, `plugin-opener` |
| AI Services    | Python (stt, tts, noise cancellation, rvc pipelines) |
| Database       | PostgreSQL with `pgvector` |
| OS Target      | Windows (primary), macOS, Linux |

---

## Dual-Window Architecture

The app spawns **two native windows**:

| Window Label   | Purpose |
|----------------|---------|
| `main`         | Primary app UI — 1200×800, custom title bar, glassmorphic sidebar |
| `avatar-float` | Always-on-top 300×400 transparent floating avatar overlay |

Both windows are frameless (`decorations: false`) with transparency enabled. The avatar window is hidden by default and toggled from within the app.

---

## Architecture & File Structure

The project has evolved into a robust multi-component architecture:

```
desktop_app/
├── desktop/                      # The main application bundle
│   ├── frontend/                 # React frontend source (formerly src/)
│   │   ├── src/                  
│   │   │   ├── components/       # UI components (avatar, community, layout, etc.)
│   │   │   ├── pages/            # App routes (Home, Dashboard, Community, etc.)
│   │   │   ├── store/            # Zustand global state 
│   │   │   └── ...               
│   │   ├── package.json          
│   │   └── vite.config.ts        
│   └── backend/                  # Rust / Tauri backend (formerly src-tauri/)
│       ├── src/                  # Tauri app setup, command registration, plugin init
│       ├── tauri.conf.json       # Tauri configuration (windows, bundle, security)
│       └── Cargo.toml            
│
├── client/                       # Python AI client services
│   ├── client.py                 # Core AI service client 
│   ├── noise_cancel.py           # Noise cancellation processing
│   ├── stt_server.py             # Speech-to-Text inference server
│   └── tortoise_api.py           # Text-to-Speech API integration
│
├── server/                       # Rust-based networking / backend server
│   ├── src/                      
│   └── Cargo.toml                
│
├── database/                     # Database schemas and initialization
│   ├── init.sql                  # Initial schema setup
│   ├── migrations.sql            # Ongoing database migrations
│   └── pgvector/                 # Vector DB extensions
│
├── middleware/                   # Rust middleware layer
│   ├── src/                      
│   └── Cargo.toml                
│
├── src/                          # Audio / RVC TTS pipelines
│   ├── rvc/                      # Retrieval-based Voice Conversion 
│   └── rvc-tts-pipe/             
│
├── streamingassetts/             # Media and streaming assets
└── README.md                     # This file
```

---

## Getting Started

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Rust & Cargo](https://rustup.rs/) (stable toolchain)
- [Python 3.10+](https://www.python.org/) for AI client microservices
- [PostgreSQL](https://www.postgresql.org/) (Remote instance connected via Tailscale, or local config)
- [Tauri CLI prerequisites for Windows](https://tauri.app/start/prerequisites/) (WebView2, build tools)

### Install Dependencies

Install the root dependencies (for concurrent startup scripts):
```bash
cd desktop_app
npm install
```

Install the frontend dependencies:
```bash
cd desktop/frontend
npm install
```

Install Python requirements for the client services:
```bash
cd ../client
pip install -r requirements.txt
```

### Run in Development

Launch the frontend and Tauri backend concurrently from the root directory:

```bash
cd desktop_app
npm start
```

Alternatively, you can run them in separate terminals:

**Terminal 1 (Frontend):**
```bash
cd desktop_app/desktop/frontend
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd desktop_app/desktop/backend
npx @tauri-apps/cli dev
```

*(Note: Ensure your Python services and Rust server components are running in separate terminal instances if you are testing features requiring full backend parity like TTS, STT, or Vector database interactions.)*

### Build for Production

```bash
cd desktop_app/desktop/frontend
npm run tauri build
```

Produces a signed `.exe` installer and `.msi` bundle in `desktop/backend/target/release/bundle/`.

---

## Key Features & Progress

- 🪟 **Custom Frameless Window** — Glassmorphic chrome with drag-to-move title bar
- 👾 **Floating Avatar** — Always-on-top transparent overlay with animated AI avatar
- 💬 **Persistent Chat Sessions** — DB-backed chat session management with historical searching, titling, and loading
- 🏘️ **Community Experience** — Rich feed with Reddit-style threads, Q&A tabs, upvoting, custom reposts, and live trending topics
- 🏆 **Community Challenges** — Real-time DB-backed habit challenges with dynamic join mechanisms
- 📊 **Dashboard** — Personal productivity overview, activity logging, and streak tracking
- ⏱️ **Productivity & Kill Switch** — Focus mode, timers, task management, and native OS-level site/app blocker
- 📡 **Robust Connectivity** — Automated Tailscale bridging to remote PostgreSQL, connection pool initialization, and UI telemetry updates
- 🗣️ **AI Audio Pipeline** — Custom STT server, Tortoise API TTS, RVC pipeline integrations, and advanced noise cancellation
- ⚙️ **Settings & System Integration** — Theme config, OS toast notifications, and native external link handling
