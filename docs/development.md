# Development Guide

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set up Convex
```bash
npx convex dev
```
This will:
- Create your Convex backend
- Provide you with a deployment URL
- Update your .env.local with credentials

### 3. Update Environment Variables
After running `convex dev`, add the provided URL to `.env.local`:
```bash
NEXT_PUBLIC_CONVEX_URL=https://your-url.convex.cloud
```

### 4. Start Development
```bash
pnpm dev
```

## Project Structure

```
/convex/          - Convex backend
/src/              - Next.js frontend
/scripts/          - Setup and utility scripts
/docs/             - Documentation
```

## Available Commands

- `pnpm dev` - Start Next.js development server
- `pnpm convex:dev` - Start Convex development server
- `pnpm build` - Build for production
- `pnpm seed` - Seed database with minimal data
- `pnpm seed:demo` - Seed database with demo data

## Next Steps

See the implementation plan in `docs/plans/` for what's being built next.
