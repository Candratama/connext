# Convex + Next.js Admin Starter - Design Document

**Date:** 2025-11-07
**Version:** 1.0
**Status:** Approved

## Overview

Transform the existing Shadcnblocks Admin Kit into a production-ready starter template powered by Convex DB and Convex Auth. This general-purpose admin starter includes full RBAC, multi-tenancy, real-time features, and comprehensive authentication flows.

## Requirements Summary

- **Purpose:** General-purpose admin starter template
- **Stack:** Next.js 16 + React 19 + Convex + TailwindCSS v4 + shadcn/ui
- **Auth:** Convex Auth with Email/Password + optional Google OAuth + Email verification
- **Features:** User management, RBAC, multi-tenant orgs, dashboard analytics, settings, activity logs
- **Data:** Both minimal seed and rich demo mode
- **Deployment:** Multi-platform (Vercel, Netlify, Fly.io, Railway)

## Architecture

### Tech Stack
- Frontend: Next.js 16 App Router, React 19, TailwindCSS v4, shadcn/ui
- Backend: Convex (database, auth, real-time)
- Auth: Convex Auth with multiple providers
- Email: Resend API for verification emails
- Database: Convex with full RBAC schema
- Deployment: Multi-platform with auto-detection

### Directory Structure
```
convex/
├── schema.ts                    # Database schema
├── functions/                   # Convex functions
│   ├── users.ts
│   ├── organizations.ts
│   ├── memberships.ts
│   ├── auth.ts
│   ├── activities.ts
│   ├── settings.ts
│   ├── dashboard.ts
│   ├── email.ts
│   └── seed/
│       ├── minimal.ts
│       └── demo.ts
└── seed.ts

scripts/
└── setup.ts                     # Interactive setup script

src/
├── app/(auth)/                  # Auth pages
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   ├── verify-email/
│   └── verify-reset/
├── app/(dashboard)/             # Dashboard pages (existing)
├── app/demo/                    # Demo mode
├── components/
│   ├── auth/                    # Auth components
│   └── protected/               # Route protection
└── lib/convex/                  # Convex client

docs/
├── setup/                       # Setup guides
├── architecture/                # Architecture docs
├── api/                         # API reference
└── examples/                    # Customization examples
```

## Data Schema

### Core Entities

**users**
```typescript
{
  id: string,
  email: string,
  name: string,
  image?: string,
  createdAt: number,
  lastSeenAt: number,
  lastLoginAt?: number,
  emailVerificationCode: string,
  emailVerificationExpires: number,
  isEmailVerified: boolean,
  emailVerificationSentAt: number,
  passwordResetCode?: string,
  passwordResetExpires?: number
}
```

**organizations**
```typescript
{
  id: string,
  name: string,
  slug: string,
  createdAt: number,
  ownerId: string
}
```

**memberships**
```typescript
{
  id: string,
  userId: string,
  orgId: string,
  roleId: string,
  createdAt: number
}
```

**roles**
```typescript
{
  id: string,
  name: string,
  permissions: string[],
  orgId?: string  // null for global roles
}
```

**userProfile**
```typescript
{
  userId: string,
  bio?: string,
  location?: string,
  website?: string,
  preferences: object
}
```

**activities**
```typescript
{
  id: string,
  orgId: string,
  userId: string,
  action: string,
  resource: string,
  metadata: object,
  createdAt: number
}
```

**apiKeys**
```typescript
{
  id: string,
  orgId: string,
  name: string,
  keyHash: string,
  createdAt: number,
  lastUsed?: number
}
```

## Authentication Flow

### Email/Password Registration
1. User fills registration form
2. Convex mutation creates user with `isEmailVerified: false`
3. Generate verification code + expiration
4. Call Resend API to send verification email
5. Redirect to `/verify-email?email=user@example.com`
6. User clicks link in email → calls `verifyEmail` mutation
7. Update `isEmailVerified: true` and redirect to login

### Login Flow
1. User enters credentials
2. Check `isEmailVerified` status
3. If not verified → redirect to `/verify-email`
4. If verified → allow login + redirect to dashboard

### Password Reset
1. User clicks forgot password
2. Send reset code via email
3. User enters code + new password
4. Verify code + update password

### OAuth Providers (Optional)
- Google OAuth: Optional one-click login (disabled by default)
- Enabled via environment variable `NEXT_PUBLIC_ENABLE_OAUTH=true`
- Setup script guides users through OAuth configuration
- Conditionally rendered in UI (only shows if enabled)

## Features to Implement

### Authentication System ✅
- Email/Password with verification (always enabled)
- Google OAuth (optional, enabled via env var)
- Password reset flow
- Email verification via Resend
- Protected routes

### User Management ✅
- User CRUD
- Profile management
- Role-based access control
- Multi-tenant support
- Search and filtering

### Organization System ✅
- Create/update/delete orgs
- Membership management
- Roles (Owner, Admin, Member, Viewer)
- Org switching in UI

### Dashboard & Analytics ✅
- Real-time metrics
- Interactive charts
- Org-specific dashboards
- Export functionality

### Settings ✅
- User preferences
- Organization settings
- Theme switching
- API key management

### Activity Logging ✅
- Audit trail
- Real-time activity feed
- Filters and search
- Export logs

## Data Management

### Demo Mode
- New route: `/demo`
- Rich sample data: 50+ users, 5+ orgs, 90 days of activity
- Realistic charts and metrics
- Toggle in header with banner

### Seed Data
- Minimal: 2-3 test users
- Demo: Rich sample data
- Commands:
  - `pnpm run convex:seed:minimal`
  - `pnpm run convex:seed:demo`

### Real-time Features
- Dashboard charts update live
- Activity logs stream
- User presence indicators
- Optimistic updates

## Frontend Components

### Auth Components
```
components/auth/
├── login-form.tsx              # Conditionally shows OAuth button
├── register-form.tsx           # Email/password only
├── verify-email-form.tsx       # Email verification
├── forgot-password-form.tsx    # Password reset
├── password-reset-form.tsx     # Set new password
└── oauth-button.tsx            # Reusable OAuth button component
```

**OAuth Button Implementation:**
```typescript
// oauth-button.tsx
const isOAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_OAUTH === 'true';

{isOAuthEnabled && (
  <Button onClick={() => signIn('google')} className="w-full">
    <svg className="mr-2 h-4 w-4" />
    Continue with Google
  </Button>
)}
```

### Route Protection
- `require-auth.tsx` HOC
- Check authentication on mount
- Redirect to `/login` if unauthenticated
- Loading state while checking

### Page Structure
- `app/(auth)/` - Public auth pages
- `app/(dashboard)/` - Protected dashboard (existing)
- `app/demo/` - Demo mode showcase

## Integration Strategy

### Convert Existing Pages
1. **User Management** - Replace mock with Convex queries
2. **Dashboard** - Convert charts to real data
3. **Settings** - Connect to mutations
4. **Activity Logs** - Add real-time feed

### Keep Existing
- All shadcn/ui components
- Page layouts and styling
- Theme system
- Navigation structure

## Environment Variables

```bash
# Convex
CONVEX_DEPLOYMENT=
CONVEX_DEVELOPMENT_KEY=

# OAuth (Optional - set to "true" to enable)
NEXT_PUBLIC_ENABLE_OAUTH=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Required)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Process

### Interactive Setup Script
Run the setup script to configure the project:
```bash
pnpm run setup
```

**Setup Script Flow:**
1. Welcome message and project configuration
2. Ask: "Enable Google OAuth? (y/n)"
   - If yes:
     - Prompt for `GOOGLE_CLIENT_ID`
     - Prompt for `GOOGLE_CLIENT_SECRET`
     - Validate credentials
     - Set `NEXT_PUBLIC_ENABLE_OAUTH=true` in .env
   - If no: Set `NEXT_PUBLIC_ENABLE_OAUTH=false`
3. Ask: "Enter Resend API key" (required)
4. Generate/update `.env.local` file
5. Display success message with next steps

**Benefits:**
- No commented code
- Clean UI (OAuth button only shows if enabled)
- Easy to enable/disable later
- Guided user experience
- Industry standard approach

### Manual Setup (Alternative)
If you prefer manual setup:
1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_ENABLE_OAUTH=true` to enable Google OAuth
3. Add your OAuth credentials
4. See `docs/setup/oauth.md` for detailed instructions

### Setup Script Implementation (scripts/setup.ts)

**Key Features:**
- Welcome banner and project info
- Interactive prompts using `@inquirer/prompts`
- Validates email format and OAuth credentials
- Creates .env.local if doesn't exist
- Updates existing file if it exists
- Atomic file operations (backup before changes)
- Colored output for better UX
- Error handling and rollback

**Dependencies Added:**
```json
{
  "dependencies": {
    "@inquirer/prompts": "^6.0.1"
  },
  "devDependencies": {
    "tsx": "^4.7.0"
  }
}
```

**Script Flow:**
```typescript
// 1. Welcome
console.log(banner);
console.log('Welcome to Convex Admin Starter!');

// 2. Project name (optional customization)
const projectName = await input({ message: 'Project name?' });

// 3. OAuth configuration
const enableOAuth = await confirm({
  message: 'Enable Google OAuth? (recommended)',
  default: false
});

if (enableOAuth) {
  const clientId = await input({ message: 'Google Client ID:' });
  const clientSecret = await password({ message: 'Google Client Secret:' });
  // Validate credentials
}

// 4. Resend API key (required)
const resendKey = await password({ message: 'Resend API Key (required):' });

// 5. Generate .env.local
const envContent = generateEnvFile({
  enableOAuth,
  clientId,
  clientSecret,
  resendKey
});

await fs.writeFile('.env.local', envContent);

// 6. Success message
console.log(green('✓ Setup complete!'));
console.log('Next steps:\n  1. pnpm install\n  2. pnpm convex:dev\n  3. pnpm dev');
```

**Benefits of This Approach:**
- User-friendly setup experience
- No need to read documentation for basic setup
- Validates inputs before writing files
- Can be re-run to update configuration
- Easy to extend with more options later
- Industry standard (used by Vercel, Supabase, etc.)

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "format": "prettier --check .",
    "format:fix": "prettier --write .",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "setup": "tsx scripts/setup.ts",
    "convex:dev": "convex dev",
    "convex:deploy": "convex deploy",
    "convex:seed:minimal": "convex run seed:minimal",
    "convex:seed:demo": "convex run seed:demo",
    "seed": "pnpm convex:seed:minimal",
    "seed:demo": "pnpm convex:seed:demo"
  }
}
```

**New Dependencies for Setup:**
- `tsx` - TypeScript execution for setup script
- `inquirer` - Interactive prompts (or use `@inquirer/prompts`)

## Documentation Structure

```
docs/
├── README.md                    # Quick start
├── setup/                       # Setup guides
│   ├── getting-started.md       # 5-step setup
│   ├── setup-script.md          # Interactive setup guide
│   ├── manual-setup.md          # Manual configuration
│   ├── convex-setup.md          # Convex config
│   ├── oauth-setup.md           # Enabling OAuth guide
│   ├── deployment.md            # Platform guides
│   └── customization.md         # Customization guide
├── architecture/
│   ├── data-model.md            # Schema docs
│   ├── auth-flow.md             # Auth documentation
│   └── real-time.md             # Real-time features
├── api/
│   ├── convex-functions.md      # API reference
│   └── client-hooks.md          # React hooks
└── examples/
    ├── adding-entities.md       # CRUD tutorial
    ├── custom-roles.md          # RBAC examples
    └── real-time.md             # Live updates
```

## Deployment Support

### Platforms
- Vercel (recommended)
- Netlify
- Fly.io
- Railway

### Configuration Files
- `vercel.json`
- `netlify.toml`
- `Dockerfile`
- `docker-compose.yml`
- `.env.example` (with optional OAuth vars)
- `scripts/setup.ts` (interactive setup script)

## Implementation Estimate

- **Backend (Convex):** ~1,500 lines
- **Frontend (Auth + Protection):** ~800 lines
- **Documentation:** ~2,000 words
- **Setup Files:** ~10 configuration files
- **Total:** ~3,300 lines of code + docs

## Success Criteria

- ✅ Full authentication with email verification
- ✅ Multi-tenant support
- ✅ Role-based access control
- ✅ Real-time features
- ✅ Demo mode with rich data
- ✅ Complete documentation
- ✅ Multi-platform deployment
- ✅ Zero mock data in production mode

## Next Steps

Ready for implementation. Create worktree and proceed with:
1. Convex setup and schema
2. Authentication flow
3. Page conversion
4. Documentation
5. Deployment configuration
