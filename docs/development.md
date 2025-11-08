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
- Generate client code in `src/convex/generated/`

### 3. Update Environment Variables
After running `convex dev`, the `.env.local` file will be automatically updated with:
- `CONVEX_DEPLOYMENT`
- `CONVEX_DEVELOPMENT_KEY`
- `NEXT_PUBLIC_CONVEX_URL`

### 4. Generate Client Code
After setting up Convex, regenerate the client API types:
```bash
npx convex codegen
```

This creates TypeScript types for all your Convex functions in:
- `src/convex/generated/api.ts` - Client-side API
- `src/convex/generated/server.d.ts` - Server-side types

**Note:** If you see import errors, make sure the generated API file exists and matches your function structure.

### 5. Start Development
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

## Authentication Flow

### Register
1. User fills registration form
2. System creates user with `isEmailVerified: false`
3. Sends verification email via Resend
4. User clicks link in email
5. User enters code to verify
6. Account becomes active

### Login
1. User enters credentials
2. System checks if email is verified
3. If not verified → redirect to verification page
4. If verified → allow login

### Password Reset
1. User clicks "Forgot Password"
2. System sends reset email
3. User clicks link in email
4. User enters new password
5. Password is updated

## Test Users

After running `pnpm seed`, you can use:

- **Admin:** admin@example.com
- **Test:** test@example.com

Both users are pre-verified and ready to use.

## Next Steps

See the implementation plan in `docs/plans/` for what's being built next.
