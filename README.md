# Shadcnblocks.com - Admin Kit

A premium Shadcn admin dashboard by shadcnblocks.com

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment (interactive)
pnpm run setup

# OR manually: copy .env.example to .env.local and add your keys

# Set up Convex backend
npx convex dev

# Start development server
pnpm run dev
```

## Setup Script

Run `pnpm run setup` to configure:
- Google OAuth (optional)
- Resend API key
- Convex deployment

See `docs/development.md` for detailed setup instructions.

## Tech Stack

- shadcn/ui
- TailwindCSS v4
- Next.js 16
- React 19
- TypeScript
- Convex (Backend)
- Eslint v9
- Prettier

## Features (Coming Soon)

- ✅ Convex database integration
- ⏳ Authentication (email + OAuth)
- ⏳ User management
- ⏳ Multi-tenant organizations
- ⏳ Real-time dashboard
- ⏳ RBAC (Role-based access control)
