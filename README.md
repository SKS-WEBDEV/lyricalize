# Cloudflare Workers React Template

[cloudflarebutton]

A modern, production-ready full-stack application template built with Cloudflare Workers, React, and TypeScript. This template provides a robust foundation for building scalable web applications with serverless backend capabilities.

## Features

- **Serverless Backend**: Powered by Cloudflare Workers with Hono framework for fast API routes
- **Modern React Frontend**: Built with React 18, React Router, and TanStack Query
- **Styling & UI**: Tailwind CSS with shadcn/ui components, dark mode support, and smooth animations
- **Type Safety**: Full TypeScript support across frontend and worker code
- **Developer Experience**: Hot reloading, ESLint, and Cloudflare-specific tooling
- **Deployment Ready**: One-click deployment to Cloudflare Workers with automatic asset handling

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for blazing-fast builds and dev server
- Tailwind CSS with custom design system
- shadcn/ui components and Radix UI primitives
- React Router v6 for client-side routing
- TanStack React Query for data fetching

### Backend & Infrastructure
- Cloudflare Workers for serverless compute
- Hono framework for API routing and middleware
- Cloudflare KV and Durable Objects support (extensible)
- Wrangler CLI for local development and deployment

### Developer Tools
- Bun package manager
- ESLint with TypeScript rules
- PostCSS and Autoprefixer

## Getting Started

### Prerequisites
- Bun (recommended) or Node.js 18+
- A Cloudflare account (for deployment)

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd <project-directory>
bun install
```

### Development

Start the local development server:

```bash
bun run dev
```

This will launch:
- Vite dev server for the React frontend
- Cloudflare Workers local environment for API routes
- Hot module replacement enabled

The application will be available at `http://localhost:3000`.

### Building for Production

Create an optimized production build:

```bash
bun run build
```

Preview the production build locally:

```bash
bun run preview
```

## Project Structure

```
├── src/                  # React frontend source
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities and configuration
├── worker/               # Cloudflare Worker backend
│   ├── index.ts          # Main worker entry point
│   └── userRoutes.ts     # Custom API routes
├── shared/               # Shared types and utilities
└── wrangler.jsonc        # Cloudflare configuration
```

## API Routes

API endpoints are defined in `worker/userRoutes.ts`. All routes are automatically mounted under `/api/*`.

Example custom route:

```ts
app.get('/api/hello', (c) => c.json({ message: 'Hello from Workers!' }));
```

The template includes built-in routes for health checks and client error reporting.

## Deployment

[cloudflarebutton]

### Manual Deployment

Deploy to Cloudflare Workers:

```bash
bun run deploy
```

This command builds the project and deploys using Wrangler.

### Configuration

Update `wrangler.jsonc` with your Worker name, routes, and environment variables as needed.

Ensure you have authenticated with Cloudflare:

```bash
bunx wrangler login
```

## Customization

- **UI Components**: Modify components in `src/components/` or add new shadcn/ui components
- **Styling**: Extend the theme in `tailwind.config.js` and `src/index.css`
- **Routes**: Add frontend routes in `src/main.tsx` and API routes in `worker/userRoutes.ts`
- **Sidebar**: Customize or remove the demo sidebar in `src/components/app-sidebar.tsx`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## License

This project is licensed under the MIT License.