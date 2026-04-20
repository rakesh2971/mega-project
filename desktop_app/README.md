# NeuroMate — Desktop App

NeuroMate Desktop is a high-performance Windows (and cross-platform) native application built with **Tauri v2**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. It delivers the full NeuroMate experience as a lightweight native binary with a glassmorphic UI, a dual-window architecture (main app + always-on-top floating avatar), and deep OS integration via Tauri plugins.

---

## Tech Stack

| Layer          | Technology |
|----------------|------------|
| UI Framework   | React 19, TypeScript, Vite 7 |
| Styling        | Tailwind CSS v4, `tailwindcss-animate` |
| State          | Zustand |
| Routing        | React Router DOM v7 |
| Icons          | Lucide React |
| Rust Backend   | Tauri v2 (Rust) |
| Native Plugins | `plugin-notification`, `plugin-shell`, `plugin-opener` |
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

## File Structure

```
desktop_app/
├── src/                          # React frontend source
│   ├── assets/                   # Bundled images and icons
│   ├── components/
│   │   ├── avatar/
│   │   │   └── AvatarCanvas.tsx  # Animated avatar renderer for float window
│   │   └── layout/
│   │       ├── AppLayout.tsx     # Root layout wrapper (sidebar + title bar + outlet)
│   │       ├── Sidebar.tsx       # Collapsible glassmorphic navigation sidebar
│   │       └── TitleBar.tsx      # Custom frameless window title bar (drag, min/max/close)
│   ├── hooks/
│   │   └── useTauri.ts           # Hook wrapping Tauri IPC commands (window control, notifications)
│   ├── lib/
│   │   └── utils.ts              # Utility helpers (cn class merger)
│   ├── pages/
│   │   ├── Home.tsx              # Dashboard home / welcome screen
│   │   ├── Dashboard.tsx         # Productivity metrics & stats
│   │   ├── Productivity.tsx      # Task tracker & focus timer
│   │   ├── KillSwitch.tsx        # Site/app distraction blocker
│   │   ├── Community.tsx         # Community feed
│   │   ├── Settings.tsx          # App settings panel
│   │   └── AvatarFloat.tsx       # Avatar float window entry page
│   ├── store/
│   │   └── useAppStore.ts        # Zustand global state (theme, user, avatar, settings)
│   ├── App.tsx                   # React Router routes definition
│   ├── main.tsx                  # React entry point (mounts to #root)
│   ├── index.css                 # Global Tailwind + custom glassmorphic design tokens
│   └── vite-env.d.ts             # Vite environment type declarations
│
├── src-tauri/                    # Rust / Tauri backend
│   ├── src/
│   │   └── main.rs               # Tauri app setup, command registration, plugin init
│   ├── capabilities/
│   │   └── default.json          # Tauri capability permissions (IPC allowlist)
│   ├── icons/                    # App icons for all platforms (PNG, ICO, ICNS)
│   ├── gen/                      # Auto-generated Tauri bindings (do not edit)
│   ├── tauri.conf.json           # Tauri configuration (windows, bundle, security)
│   ├── Cargo.toml                # Rust dependencies
│   ├── Cargo.lock
│   └── build.rs                  # Tauri build script
│
├── public/                       # Static assets served at root
├── dist/                         # Vite build output (generated, do not commit)
├── .vscode/                      # VS Code workspace settings & extensions
├── index.html                    # Vite HTML entry
├── vite.config.ts                # Vite + Tauri plugin config
├── tsconfig.json                 # TypeScript root config
├── tsconfig.node.json            # TypeScript config for Vite/Node tooling
├── package.json                  # npm dependencies & scripts
├── package-lock.json
└── .gitignore
```

---

## Getting Started

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Rust & Cargo](https://rustup.rs/) (stable toolchain)
- [Tauri CLI prerequisites for Windows](https://tauri.app/start/prerequisites/) (WebView2, build tools)

### Install Dependencies

```bash
cd desktop_app
npm install
```

### Run in Development

```bash
npm run tauri dev
```

This starts the Vite dev server and opens the native Tauri window simultaneously with hot-module replacement.

### Build for Production

```bash
npm run tauri build
```

Produces a signed `.exe` installer and `.msi` bundle in `src-tauri/target/release/bundle/`.

---

## Key Features (Desktop App)

- 🪟 **Custom Frameless Window** — Glassmorphic chrome with drag-to-move title bar
- 👾 **Floating Avatar** — Always-on-top transparent overlay with animated AI avatar
- 🗂️ **Collapsible Sidebar** — Icon-only or full-label navigation
- 📊 **Dashboard** — Personal productivity overview and streaks
- ⏱️ **Productivity** — Focus mode, timers, task management
- 🚫 **Kill Switch** — Native OS-level site/app blocker
- 🏘️ **Community** — Community feed inside the desktop shell
- ⚙️ **Settings** — Theme, avatar, notification, and account config
- 🔔 **Native Notifications** — OS toast notifications via Tauri plugin
- 🌐 **Shell Integration** — Open external links natively via Tauri shell plugin
