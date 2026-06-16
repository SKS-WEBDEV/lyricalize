# 🎵 Lyricalize

> A full-stack music and lyrics web application — search songs, view synchronized lyrics, and stream audio, all in one place.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/SKS-WEBDEV/lyricalize)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-lyricalize.vercel.app-brightgreen)](https://lyricalize.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-94.5%25-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 What is Lyricalize?

Lyricalize is a modern music player web app that lets you search for songs, read lyrics, and listen to tracks — all from a clean, responsive interface. It fetches real-time music data and lyrics via API, plays audio at the best available quality (up to 320kbps), and presents everything in a polished editor-style UI with dark mode support.

---

## ✨ Features

- **Song Search** — Find tracks instantly with a fast, real-time search experience
- **Lyrics Viewer** — Read synced lyrics for any searched track in the built-in editor panel
- **Audio Playback** — Stream songs at the highest available quality (12kbps → 320kbps with auto best-quality selection)
- **Music Panel UI** — Sidebar-style music panel with track info, player controls, and queue management
- **Dark Mode** — Full dark/light theme support powered by Tailwind CSS
- **Serverless Backend** — API routes handled by a Cloudflare Worker, keeping the backend fast and scalable
- **Responsive Design** — Works seamlessly across desktop and mobile browsers

---

## 🛠️ Tech Stack

### Frontend
| Technology | Role |
|---|---|
| React 18 + TypeScript | Core UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| TanStack React Query | Data fetching & caching |
| Tailwind CSS | Styling & theming |
| shadcn/ui + Radix UI | Accessible component primitives |
| Zustand | Global audio/track state management |

### Backend & Infrastructure
| Technology | Role |
|---|---|
| Cloudflare Workers | Serverless API compute |
| Hono | Lightweight API routing framework |
| Wrangler CLI | Local dev & deployment tooling |

### Developer Tools
- **Bun** — Fast package manager & runtime
- **ESLint** — TypeScript-aware linting
- **PostCSS + Autoprefixer** — CSS processing

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (for deployment)

### Installation

```bash
git clone https://github.com/SKS-WEBDEV/lyricalize.git
cd lyricalize
bun install
```

### Development

Start the local development server (React frontend + Cloudflare Worker API):

```bash
bun run dev
```

The app will be available at **http://localhost:3000** with hot module replacement enabled.

### Production Build

```bash
# Build for production
bun run build

# Preview production build locally
bun run preview
```

---

## 📁 Project Structure

```
lyricalize/
├── src/                          # React frontend
│   ├── components/
│   │   └── editor/
│   │       └── MusicPanel.tsx    # Music player UI panel
│   ├── hooks/
│   │   └── useAudioEngine.ts     # Audio playback engine
│   ├── lib/
│   │   └── api.ts                # API client & data fetching
│   ├── pages/                    # Route-level page components
│   └── main.tsx                  # App entry & routing
├── worker/
│   ├── index.ts                  # Cloudflare Worker entry point
│   └── userRoutes.ts             # Custom API route definitions
├── public/                       # Static assets
├── prompts/                      # AI prompt files
├── wrangler.jsonc                 # Cloudflare Worker configuration
├── vite.config.ts                # Vite build configuration
└── tailwind.config.js            # Tailwind theme & design system
```

---

## 🎧 How Audio Playback Works

1. **Search** — User searches for a song; the API returns tracks with validated download URL arrays
2. **Select** — Clicking a track stores it in Zustand global state
3. **URL Selection** — The audio engine picks the best available quality:
   - 🥇 Highest bitrate (preferred)
   - 🥈 320kbps
   - 🥉 160kbps
   - 🔁 Fallback to lowest available
4. **Playback** — The audio element (mounted in the DOM for full browser compatibility) loads and plays the track
5. **Events** — Browser fires `loadstart → loadeddata → canplay → playing` in sequence

### Download URL Structure (from API)

```json
{
  "downloadUrl": [
    { "quality": "12kbps",  "url": "https://..." },
    { "quality": "48kbps",  "url": "https://..." },
    { "quality": "96kbps",  "url": "https://..." },
    { "quality": "160kbps", "url": "https://..." },
    { "quality": "320kbps", "url": "https://..." }
  ]
}
```

---

## 🌐 API Routes

All API endpoints are defined in `worker/userRoutes.ts` and mounted under `/api/*`.

```typescript
// Example custom route
app.get('/api/hello', (c) => c.json({ message: 'Hello from Workers!' }));
```

Built-in routes include health checks and client error reporting.

---

## ☁️ Deployment

### One-Click Deploy to Cloudflare

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/SKS-WEBDEV/lyricalize)

### Manual Deployment

```bash
# Authenticate with Cloudflare (first time only)
bunx wrangler login

# Build and deploy
bun run deploy
```

Update `wrangler.jsonc` with your Worker name, routes, and any environment variables before deploying.

---

## 🔧 Customization

| What to change | Where |
|---|---|
| UI Components | `src/components/` or add new shadcn/ui components |
| Theme & Colors | `tailwind.config.js` and `src/index.css` |
| Frontend Routes | `src/main.tsx` |
| API Routes | `worker/userRoutes.ts` |
| App Sidebar | `src/components/app-sidebar.tsx` |

---

## 🐛 Debugging Audio

Open DevTools (F12) and check the console for these logs:

```
[AudioEngine] 🔧 Audio element created. crossOrigin=anonymous
[AudioEngine] 📍 Audio element added to DOM
[AudioEngine] 🎵 Track Change
[AudioEngine] 📥 Setting audio src and calling load()...
[AudioEngine] 🔗 audio.src confirmed: https://...
[MusicPanel] Track selected: {...}
```

If audio doesn't play, verify:
- The browser console for errors
- Network tab to confirm audio URLs are being fetched
- Browser audio permissions are enabled
- Audio file format compatibility (MP4 is broadly supported)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live App**: [lyricalize.vercel.app](https://lyricalize.vercel.app)
- **Repository**: [github.com/SKS-WEBDEV/lyricalize](https://github.com/SKS-WEBDEV/lyricalize)
