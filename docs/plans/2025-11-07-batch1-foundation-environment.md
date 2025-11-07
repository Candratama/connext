# Batch 1: Foundation & Environment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish the foundation for Convex integration with proper environment setup, dependencies, and project structure

**Architecture:** Create Convex backend infrastructure, update package.json with new dependencies, set up environment variables, and prepare the project structure for full-stack development

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex, pnpm, TailwindCSS v4, shadcn/ui

---

## Task 1: Initialize Convex Project

**Files:**
- Create: `convex/schema.ts`
- Create: `convex/README.md`
- Create: `convex/.gitignore`

**Step 1: Create Convex directory and schema file**

Run: `mkdir -p convex/functions`
Create: `convex/schema.ts` with content:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Schema will be implemented in future tasks
});
```

**Step 2: Create Convex README**

Create: `convex/README.md` with content:
```markdown
# Convex Backend

This directory contains the Convex backend for the admin starter.

## Setup
1. Run `pnpm convex:dev` to start the development server
2. Your backend will be available at the provided URL

## Schema
See `schema.ts` for the database schema definition.

## Functions
See `functions/` directory for query and mutation functions.
```

**Step 3: Create Convex gitignore**

Create: `convex/.gitignore` with content:
```
node_modules/
dev.db*
.resolutionCache/
```

**Step 4: Commit**

Run: `git add convex/`
Run: `git commit -m "feat: initialize Convex project structure

- Add convex/ directory
- Create schema.ts template
- Add convex/README.md
- Add convex/.gitignore"`

---

## Task 2: Add Convex Dependencies

**Files:**
- Modify: `package.json:61-76`

**Step 1: Install Convex dependencies**

Run: `pnpm add convex @types/node`

**Step 2: Add Convex CLI to devDependencies**

Modify: `package.json` - Add to devDependencies section:
```json
"convex": "^1.11.0"
```

**Step 3: Commit**

Run: `git add package.json pnpm-lock.yaml`
Run: `git commit -m "feat: add Convex dependencies

- Add convex package
- Add type definitions for Convex""

---

## Task 3: Create Environment Configuration

**Files:**
- Create: `.env.example`
- Create: `.env.local` (gitignored)
- Create: `scripts/setup.ts` (setup script placeholder)

**Step 1: Create .env.example**

Create: `.env.example` with content:
```bash
# Convex
# Get these from: https://dashboard.convex.dev
CONVEX_DEPLOYMENT=your-deployment-url
CONVEX_DEVELOPMENT_KEY=your-development-key

# OAuth (Optional - set to "true" to enable)
NEXT_PUBLIC_ENABLE_OAUTH=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Required)
# Get from: https://resend.com
RESEND_API_KEY=re_your_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 2: Create .env.local**

Create: `.env.local` with content:
```bash
# Convex (will be updated after running npx convex dev)
CONVEX_DEPLOYMENT=
CONVEX_DEVELOPMENT_KEY=

# OAuth (Optional)
NEXT_PUBLIC_ENABLE_OAUTH=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 3: Update .gitignore**

Verify `.gitignore` contains:
```
.env.local
```

**Step 4: Create setup script placeholder**

Create: `scripts/setup.ts` with content:
```typescript
#!/usr/bin/env tsx

/**
 * Setup Script for Convex Admin Starter
 * This script helps configure the project with your API keys and preferences
 */

import fs from 'fs';

console.log('🚀 Convex Admin Starter - Setup\n');

// Get project name
const projectName = process.argv[2] || 'my-admin-app';

console.log(`Project name: ${projectName}\n`);

console.log('Setup script placeholder - Will be implemented in later task\n');
console.log('For now, please:');
console.log('1. Copy .env.example to .env.local');
console.log('2. Add your API keys to .env.local');
console.log('3. Run: pnpm convex:dev');
```

**Step 5: Commit**

Run: `git add .env.example .env.local scripts/setup.ts`
Run: `git commit -m "feat: add environment configuration

- Add .env.example with all required variables
- Add .env.local (gitignored)
- Add placeholder setup script""

---

## Task 4: Update Package.json Scripts

**Files:**
- Modify: `package.json:6-14`

**Step 1: Add Convex scripts to package.json**

Modify: `package.json` - Add to scripts section:
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

**Step 2: Add tsx to devDependencies**

Modify: `package.json` - Add to devDependencies section:
```json
"tsx": "^4.7.0"
```

**Step 3: Commit**

Run: `git add package.json pnpm-lock.yaml`
Run: `git commit -m "feat: add package.json scripts for Convex and setup

- Add setup script command
- Add convex:dev and convex:deploy
- Add seed commands
- Add tsx for setup script""

---

## Task 5: Create Convex Client Configuration

**Files:**
- Create: `src/lib/convex/client.ts`
- Create: `src/lib/convex/react.ts`

**Step 1: Create Convex client setup**

Create: `src/lib/convex/client.ts` with content:
```typescript
import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL. Set it in .env.local"
  );
}

/**
 * Convex HTTP client for the browser
 * Used for direct API calls if needed
 */
export const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL
);
```

**Step 2: Create Convex React hooks**

Create: `src/lib/convex/react.ts` with content:
```typescript
import { ConvexReactClient } from "convex/react";
import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

/**
 * Convex client for React
 * This is what you use in your components
 */
export const convexClient = new ConvexReactClient(convexUrl);

/**
 * HTTP client for server-side usage
 */
export const convexHttpClient = new ConvexHttpClient(convexUrl);
```

**Step 3: Commit**

Run: `git add src/lib/convex/`
Run: `git commit -m "feat: add Convex client configuration

- Add client.ts for HTTP client setup
- Add react.ts for React hooks
- Support both client-side and server-side usage""

---

## Task 6: Create Database Schema Definition

**Files:**
- Modify: `convex/schema.ts`

**Step 1: Define users table**

Modify: `convex/schema.ts` with content:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.number(),
    lastLoginAt: v.optional(v.number()),
    emailVerificationCode: v.optional(v.string()),
    emailVerificationExpires: v.optional(v.number()),
    isEmailVerified: v.boolean(),
    emailVerificationSentAt: v.optional(v.number()),
    passwordResetCode: v.optional(v.string()),
    passwordResetExpires: v.optional(v.number())
  }).index("by_email", ["email"]),
});
```

**Step 2: Commit**

Run: `git add convex/schema.ts`
Run: `git commit -m "feat: add users table to schema

- Define users table with all auth fields
- Index by email for quick lookups
- Support email verification and password reset""

---

## Task 7: Create Initial Directory Structure

**Files:**
- Create: `convex/functions/auth.ts`
- Create: `convex/functions/users.ts`
- Create: `convex/functions/seed/minimal.ts`
- Create: `convex/functions/seed/demo.ts`
- Create: `convex/seed.ts`

**Step 1: Create auth functions file**

Create: `convex/functions/auth.ts` with content:
```typescript
import { mutation, query } from "convex/server";

/**
 * Authentication-related functions
 * Will be implemented in Batch 2
 */
export const example = query((ctx) => {
  return "Auth functions placeholder";
});

export const exampleMutation = mutation((ctx) => {
  return "Auth mutation placeholder";
});
```

**Step 2: Create users functions file**

Create: `convex/functions/users.ts` with content:
```typescript
import { query, mutation } from "convex/server";

/**
 * User management functions
 * Will be implemented in Batch 4
 */
export const list = query((ctx) => {
  return "User list placeholder";
});

export const create = mutation((ctx) => {
  return "Create user placeholder";
});
```

**Step 3: Create seed functions**

Create: `convex/functions/seed/minimal.ts` with content:
```typescript
import { mutation } from "convex/server";

/**
 * Seed database with minimal test data
 * Will be implemented in Batch 2
 */
export const run = mutation(async (ctx) => {
  return "Seed minimal placeholder";
});
```

Create: `convex/functions/seed/demo.ts` with content:
```typescript
import { mutation } from "convex/server";

/**
 * Seed database with rich demo data
 * Will be implemented in Batch 5
 */
export const run = mutation(async (ctx) => {
  return "Seed demo placeholder";
});
```

**Step 4: Create seed index file**

Create: `convex/seed.ts` with content:
```typescript
import { seedMinimal } from "./functions/seed/minimal";
import { seedDemo } from "./functions/seed/demo";

export { seedMinimal, seedDemo };
```

**Step 5: Commit**

Run: `git add convex/functions/ convex/seed.ts`
Run: `git commit -m "feat: create function directory structure

- Add auth.ts and users.ts placeholder functions
- Add seed/minimal.ts and seed/demo.ts
- Add seed index file
- Ready for implementation in future batches""

---

## Task 8: Add Missing Environment Variable to .env.local

**Files:**
- Modify: `.env.local`

**Step 1: Add NEXT_PUBLIC_CONVEX_URL to .env.local**

Modify: `.env.local` with content:
```bash
# Convex
CONVEX_DEPLOYMENT=
CONVEX_DEVELOPMENT_KEY=
NEXT_PUBLIC_CONVEX_URL=

# OAuth (Optional)
NEXT_PUBLIC_ENABLE_OAUTH=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 2: Update .env.example**

Modify: `.env.example` with content:
```bash
# Convex
# Get these from: https://dashboard.convex.dev
CONVEX_DEPLOYMENT=your-deployment-url
CONVEX_DEVELOPMENT_KEY=your-development-key
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud

# OAuth (Optional - set to "true" to enable)
NEXT_PUBLIC_ENABLE_OAUTH=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Required)
# Get from: https://resend.com
RESEND_API_KEY=re_your_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 3: Commit**

Run: `git add .env.example .env.local`
Run: `git commit -m "feat: add NEXT_PUBLIC_CONVEX_URL to environment

- Add NEXT_PUBLIC_CONVEX_URL to .env.example
- Add NEXT_PUBLIC_CONVEX_URL to .env.local
- Prepare for Convex URL configuration""

---

## Task 9: Create Development Documentation

**Files:**
- Create: `docs/development.md`

**Step 1: Create development guide**

Create: `docs/development.md` with content:
```markdown
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
```

**Step 2: Commit**

Run: `git add docs/development.md`
Run: `git commit -m "docs: add development guide

- Document setup process
- List available commands
- Explain project structure""

---

## Task 10: Verify Setup

**Files:**
- Modify: `README.md` (existing)

**Step 1: Update README.md with new setup instructions**

Modify: `README.md` with content:
```markdown
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
```

**Step 2: Commit**

Run: `git add README.md`
Run: `git commit -m "docs: update README with setup instructions

- Add Convex setup steps
- Document setup script
- List planned features
- Improve overall presentation""

---

## Task 11: Create Verification Test

**Files:**
- Create: `__tests__/batch1-setup.test.ts`

**Step 1: Create verification test**

Create: `__tests__/batch1-setup.test.ts` with content:
```typescript
/**
 * Batch 1 Setup Verification Test
 * Verifies that all foundation components are in place
 */

describe("Batch 1: Foundation & Environment", () => {
  test("convex directory exists", () => {
    const fs = require("fs");
    expect(fs.existsSync("convex")).toBe(true);
    expect(fs.existsSync("convex/schema.ts")).toBe(true);
  });

  test("package.json has required scripts", () => {
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    expect(pkg.scripts["convex:dev"]).toBe("convex dev");
    expect(pkg.scripts["setup"]).toBeDefined();
  });

  test("environment files exist", () => {
    const fs = require("fs");
    expect(fs.existsSync(".env.example")).toBe(true);
    expect(fs.existsSync(".env.local")).toBe(true);
  });

  test("Convex client configuration exists", () => {
    const fs = require("fs");
    expect(fs.existsSync("src/lib/convex/client.ts")).toBe(true);
    expect(fs.existsSync("src/lib/convex/react.ts")).toBe(true);
  });

  test("development documentation exists", () => {
    const fs = require("fs");
    expect(fs.existsSync("docs/development.md")).toBe(true);
  });
});
```

**Step 2: Run verification test**

Run: `npm test -- __tests__/batch1-setup.test.ts`
Expected: PASS (all 5 tests)

**Step 3: Commit**

Run: `git add __tests__/batch1-setup.test.ts`
Run: `git commit -m "test: add Batch 1 verification test

- Verify convex directory and schema
- Check package.json scripts
- Verify environment files
- Check Convex client config
- Verify documentation""

---

## Summary

**Batch 1 Complete!** Foundation is now established with:

✅ Convex project initialized
✅ Dependencies added
✅ Environment configuration
✅ Package.json scripts updated
✅ Convex client setup
✅ Database schema started
✅ Directory structure created
✅ Documentation written
✅ Verification test created

**Next Steps:**
Proceed to Batch 2: Authentication Backend to implement user registration, login, and email verification.
