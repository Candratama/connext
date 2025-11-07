# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Shadcnblocks Admin Kit** - a premium admin dashboard template built with Next.js 16, React 19, TailwindCSS v4, and shadcn/ui. It provides pre-built dashboard layouts, authentication pages, and admin components. This is a **frontend-only project** with no backend API routes.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start
```

## Common Development Commands

```bash
# Development
pnpm run dev              # Start dev server at http://localhost:3000
pnpm run build            # Build for production
pnpm run start            # Start production server

# Code Quality
pnpm run format           # Check formatting with Prettier
pnpm run format:fix       # Fix formatting issues
pnpm run lint             # Run ESLint
pnpm run lint:fix         # Fix ESLint issues
```

**Note**: No test framework is configured (no Jest, Vitest, or testing library).

## High-Level Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: TailwindCSS v4 (inline config, no tailwind.config.js)
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Language**: TypeScript 5.7.3
- **Package Manager**: pnpm
- **Form Handling**: react-hook-form + zod validation
- **Icons**: lucide-react, @tabler/icons-react, @radix-ui/react-icons
- **Charts**: recharts
- **Theme**: next-themes (light/dark mode via CSS variables)

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register, forgot-password)
│   ├── (dashboard)/       # Dashboard routes
│   │   ├── (dashboard-1)/ # Multi-layout dashboard variations
│   │   ├── dashboard-2/   # Alternative layouts
│   │   ├── dashboard-3/
│   │   ├── settings/      # Settings pages (billing, profile, team, etc.)
│   │   ├── tasks/         # Task management
│   │   ├── users/         # User management
│   │   └── developers/    # Developer tools
│   ├── (errors)/          # Error pages (401, 403, 404, 503)
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # Context providers
│   └── globals.css        # Global styles + Tailwind v4 config
├── components/
│   ├── ui/                # 36 shadcn/ui components
│   ├── layout/            # Layout components
│   └── errors/            # Error components
├── hooks/                 # 5 custom React hooks
└── lib/                   # 20+ utility components and helpers
```

### Key Entry Points

- `src/app/layout.tsx` - Root layout (metadata, fonts, providers)
- `src/app/providers.tsx` - Context providers (ThemeProvider, SearchProvider)
- `src/app/globals.css` - Global styles and Tailwind v4 inline configuration

### Configuration Files

- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js config (image domains: ui.shadcn.com, i.pravatar.cc)
- `tsconfig.json` - TypeScript config with `@/*` alias → `./src/*`
- `eslint.config.mjs` - ESLint v9 configuration
- `.prettierrc` - Prettier with import sorting + Tailwind plugin
- `components.json` - shadcn/ui configuration
- `pnpm-workspace.yaml` - pnpm workspace setup

## Code Organization Patterns

### Architecture Pattern
- **Next.js App Router** with route groups: `(auth)`, `(dashboard)`, `(errors)`
- Route groups organize code without affecting URL structure
- Colocation: components, data, and pages grouped by feature

### Component Structure
- **UI Layer**: `src/components/ui/` - 36 shadcn/ui components using Radix primitives
- **Layout Layer**: `src/components/layout/` - Layout-specific components
- **Hooks**: `src/hooks/` - 5 custom hooks (mobile detection, toast, dialog state, etc.)
- **Utils**: `src/lib/` - 20+ utility components (search, date pickers, theme, etc.)

### Styling Approach
- **TailwindCSS v4**: Uses inline `@theme` directive in `globals.css` (no config file)
- **Theming**: CSS variables + next-themes for light/dark mode
- **No traditional tailwind.config.js**

### State Management
- React context and custom hooks
- **No Redux/Zustand** or external state library

### Form Handling
- **react-hook-form** + **zod** for validation
- Consistent pattern across all forms

### Development Practices
- No backend/API routes - purely frontend template
- Mock data with @faker-js/faker
- No test framework configured
- TypeScript strict mode enabled
- Path alias: `@/*` maps to `./src/*` (see tsconfig.json)

## Key Libraries

- **UI Primitives**: @radix-ui/* (complete suite)
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Data Table**: @tanstack/react-table
- **Date/Time**: date-fns, date-fns-tz, react-day-picker
- **Country Data**: country-region-data
- **Icons**: lucide-react, @tabler/icons-react

## Important Notes

- This is a **frontend template only** - no server-side logic or API routes
- Uses **pnpm** as package manager
- **TailwindCSS v4** with inline configuration (not traditional config)
- No testing framework configured
- All components follow shadcn/ui patterns
- Dark/light theme support built-in with next-themes
