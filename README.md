# Lyricalize

A browser-based lyrics editor and music player. Search for a track, get synced lyrics automatically, and play audio — all in a single-page React app backed by a Cloudflare Worker.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-lyricalize.vercel.app-brightgreen)](https://lyricalize.vercel.app)

## How it works

1. **Search** a song via the [zylaes-saavn](https://zylaes-saavn.vercel.app) API (JioSaavn)
2. **Select** a result — the app auto-fetches synced lyrics from [LRCLIB](https://lrclib.net)
3. **Play** — audio streams directly from the CDN at the best available quality (up to 320kbps)
4. **Edit** — tweak typography, animation, and sync offset in the Design tab
5. **Export** — save your session as a JSON project file

## Stack

| Layer | Tech |
|-------|------|
| UI | React 18, TypeScript, Tailwind CSS 3, shadcn/ui (Radix primitives) |
| State | Zustand (audio + track + lyrics + style) |
| Build | Vite 6, Cloudflare Vite Plugin |
| Backend | Cloudflare Worker (Hono) — error reporting + health check |
| Music API | [zylaes-saavn](https://zylaes-saavn.vercel.app) (API key required) |
| Lyrics API | [LRCLIB](https://lrclib.net) (open, no key needed) |

## Setup

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- A [zylaes-saavn API key](https://zylaes-saavn.vercel.app/docs) — set `JIOSAAVN_API_KEYS` in your zylaes-saavn Vercel instance to enable keyed mode

### Install

```bash
git clone https://github.com/SKS-WEBDEV/lyricalize.git
cd lyricalize
bun install
```

### Configure

Create a `.env` file in the project root:

```
SAAVN_API_KEY=your_api_key_here
```

Get your key by generating one:

```bash
bun -e "console.log(crypto.randomBytes(24).toString('hex'))"
```

Then add it to your zylaes-saavn instance's `JIOSAAVN_API_KEY` environment variable.

### Run

```bash
bun run dev
```

Opens at **http://localhost:3000**.

### Build & Preview

```bash
bun run build
bun run preview
```

## Project structure

```
lyricalize/
├── src/
│   ├── components/editor/
│   │   ├── Sidebar.tsx         # Tab container (Music / Lyrics / Design)
│   │   ├── MusicPanel.tsx      # Search + track selection
│   │   ├── LyricsPanel.tsx     # LRCLIB results + LRC editor + file upload
│   │   ├── DesignPanel.tsx     # Typography, animation, color controls
│   │   ├── Canvas.tsx          # Animated lyrics display (Framer Motion)
│   │   └── BottomPlayer.tsx    # Play/pause, seek, volume, track info
│   ├── hooks/
│   │   └── useAudioEngine.ts   # Fetch → ObjectURL → <audio> element lifecycle
│   ├── lib/
│   │   ├── api.ts              # zylaes-saavn + LRCLIB fetch functions
│   │   └── lrcParser.ts        # LRC timestamp parser
│   └── store/
│       └── useEditorStore.ts   # Zustand: track, lyrics, style, playback state
├── worker/
│   ├── index.ts                # Cloudflare Worker entry (Hono + CORS)
│   └── userRoutes.ts           # /api/health, /api/client-errors
├── vite.config.ts              # Vite + Cloudflare plugin + env injection
└── wrangler.jsonc              # Cloudflare Worker config
```

## Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `SAVN_API_KEY` | `.env` / Vercel | API key for [zylaes-saavn](https://zylaes-saavn.vercel.app). Injected at build time via Vite `define`. |
| `VITE_LOGGER_TYPE` | `.env` | Set to `json` for structured Pino logging in production. |

## Audio playback

The engine in `useAudioEngine.ts` works by:

1. Taking the `downloadUrl[]` array from the search result (CDN links from JioSaavn)
2. Picking the best quality: highest available → 320kbps → 160kbps → fallback
3. Fetching the full audio blob via `fetch()` with CORS
4. Creating an `ObjectURL` and loading it into a DOM `<audio>` element
5. Syncing playback state to Zustand via `requestAnimationFrame` loop

## Lyrics

Two sources, used in sequence:

- **Auto-match** — on track select, `getBestMatchLyrics()` queries LRCLIB by title + artist, picks the best synced match, and loads it instantly
- **Manual browse** — the Lyrics tab shows all LRCLIB results; pick any, or upload your own `.lrc` file

## Deployment

### Vercel (SPA)

1. Push to GitHub
2. Import in Vercel — framework auto-detected as Vite
3. Add env var `SAVN_API_KEY` in Project Settings
4. Deploy

### Cloudflare Workers

```bash
bunx wrangler login
bun run deploy
```

## License

MIT
