# Batch 6: Documentation & Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create comprehensive setup script, deployment configurations, and complete documentation for production deployment

**Architecture:** Build interactive setup script with @inquirer/prompts, add multi-platform deployment configs (Vercel, Netlify, Fly.io, Docker), and create extensive documentation

**Tech Stack:** @inquirer/prompts, Docker, Vercel, Netlify, Fly.io, TypeScript

---

## Task 1: Build Interactive Setup Script

**Files:**
- Modify: `scripts/setup.ts`

**Step 1: Replace placeholder with full interactive setup**

Modify: `scripts/setup.ts` with content:
```typescript
import { input, select, confirm } from "@inquirer/prompts";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

const questions = {
  appName: async () => {
    const name = await input({
      message: "What is your app name?",
      default: "my-convex-app",
    });
    return name;
  },

  convexDeployment: async () => {
    const choice = await select({
      message: "Select Convex deployment:",
      choices: [
        { name: "Production (Convex Cloud)", value: "prod" },
        { name: "Development (local)", value: "dev" },
      ],
    });
    return choice;
  },

  enableOAuth: async () => {
    const enable = await confirm({
      message: "Enable Google OAuth? (Requires Google OAuth app setup)",
      default: false,
    });
    return enable;
  },

  resendApiKey: async () => {
    const key = await input({
      message: "Enter Resend API Key (for email verification):",
      validate: (value) => value.length > 0 || "API key is required",
    });
    return key;
  },

  appUrl: async () => {
    const url = await input({
      message: "Enter your app URL:",
      default: "http://localhost:3000",
    });
    return url;
  },
};

async function updatePackageJson(appName: string) {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.name = appName;
  packageJson.description = "Convex-powered admin starter template";

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("✓ Updated package.json");
}

async function updateEnvFiles(resendApiKey: string, appUrl: string, enableOAuth: boolean) {
  const envLocalPath = path.join(process.cwd(), ".env.local");
  const envExamplePath = path.join(process.cwd(), ".env.example");

  // Update .env.local
  const envLocal = [
    `# App Configuration`,
    `NEXT_PUBLIC_APP_URL=${appUrl}`,
    ``,
    `# Convex`,
    `CONVEX_DEPLOYMENT=your-deployment-url`,
    `NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud`,
    ``,
    `# Email (Resend)`,
    `RESEND_API_KEY=${resendApiKey}`,
    `FROM_EMAIL=noreply@${appUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`,
    ``,
    enableOAuth ? `# Google OAuth` : `# OAuth disabled`,
    enableOAuth ? `GOOGLE_CLIENT_ID=your-google-client-id` : `# GOOGLE_CLIENT_ID=`,
    enableOAuth ? `GOOGLE_CLIENT_SECRET=your-google-client-secret` : `# GOOGLE_CLIENT_SECRET=`,
    enableOAuth ? `NEXT_PUBLIC_ENABLE_OAUTH=true` : `# NEXT_PUBLIC_ENABLE_OAUTH=false`,
  ].join("\n");

  fs.writeFileSync(envLocalPath, envLocal);
  console.log("✓ Created .env.local");

  // Update .env.example
  const envExample = [
    `# App Configuration`,
    `NEXT_PUBLIC_APP_URL=${appUrl}`,
    ``,
    `# Convex`,
    `CONVEX_DEPLOYMENT=your-deployment-url`,
    `NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud`,
    ``,
    `# Email (Resend)`,
    `RESEND_API_KEY=re_your_api_key`,
    `FROM_EMAIL=noreply@yourapp.com`,
    ``,
    `# Google OAuth (Optional)`,
    `GOOGLE_CLIENT_ID=your-google-client-id`,
    `GOOGLE_CLIENT_SECRET=your-google-client-secret`,
    `NEXT_PUBLIC_ENABLE_OAUTH=false`,
  ].join("\n");

  fs.writeFileSync(envExamplePath, envExample);
  console.log("✓ Updated .env.example");
}

async function installDependencies() {
  console.log("📦 Installing dependencies...");
  try {
    await execAsync("pnpm install");
    console.log("✓ Dependencies installed");
  } catch (error) {
    console.error("✗ Failed to install dependencies:", error);
  }
}

async function generateConvex() {
  console.log("🔄 Generating Convex types...");
  try {
    await execAsync("npx convex codegen");
    console.log("✓ Convex types generated");
  } catch (error) {
    console.error("✗ Failed to generate Convex types:", error);
  }
}

async function runSeed() {
  console.log("🌱 Seeding database with minimal data...");
  try {
    await execAsync("npx convex run seed:minimal");
    console.log("✓ Database seeded");
  } catch (error) {
    console.error("✗ Failed to seed database:", error);
  }
}

async function main() {
  console.log("\n🚀 Convex Starter Template Setup\n");

  const appName = await questions.appName();
  const convexDeployment = await questions.convexDeployment();
  const enableOAuth = await questions.enableOAuth();
  const resendApiKey = await questions.resendApiKey();
  const appUrl = await questions.appUrl();

  console.log("\n📝 Configuration Summary:");
  console.log(`  App Name: ${appName}`);
  console.log(`  Convex: ${convexDeployment}`);
  console.log(`  OAuth: ${enableOAuth ? "Enabled" : "Disabled"}`);
  console.log(`  Email: Resend API configured`);
  console.log(`  App URL: ${appUrl}`);

  console.log("\n⚙️  Applying configuration...");

  await updatePackageJson(appName);
  await updateEnvFiles(resendApiKey, appUrl, enableOAuth);
  await installDependencies();
  await generateConvex();
  await runSeed();

  console.log("\n✅ Setup complete!\n");
  console.log("Next steps:");
  console.log("  1. Run 'pnpm dev' to start development server");
  console.log("  2. Visit http://localhost:3000");
  console.log("  3. Login with: admin@example.com or test@example.com\n");

  if (enableOAuth) {
    console.log("⚠️  Don't forget to:");
    console.log("  - Configure Google OAuth app at https://console.developers.google.com");
    console.log("  - Add your app URL to OAuth authorized origins\n");
  }
}

main().catch((error) => {
  console.error("\n✗ Setup failed:", error);
  process.exit(1);
});
```

**Step 2: Commit**

Run: `git add scripts/setup.ts`
Run: `git commit -m "feat: implement interactive setup script

- Replace placeholder with full @inquirer/prompts setup
- Collect app name, Convex deployment choice
- Configure OAuth (optional)
- Collect Resend API key
- Set app URL
- Update package.json, .env.local, .env.example
- Install dependencies, generate Convex types
- Run seed data
- Provide clear next steps""

---

## Task 2: Create Deployment Configurations

**Files:**
- Create: `vercel.json`
- Create: `netlify.toml`
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `fly.toml`

**Step 1: Create Vercel configuration**

Create: `vercel.json` with content:
```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "outputDirectory": ".next",
  "env": {
    "CONVEX_DEPLOYMENT": "@convex_deployment",
    "NEXT_PUBLIC_CONVEX_URL": "@next_public_convex_url",
    "RESEND_API_KEY": "@resend_api_key",
    "FROM_EMAIL": "@from_email",
    "GOOGLE_CLIENT_ID": "@google_client_id",
    "GOOGLE_CLIENT_SECRET": "@google_client_secret",
    "NEXT_PUBLIC_ENABLE_OAUTH": "@next_public_enable_oauth"
  },
  "build": {
    "env": {
      "CONVEX_DEPLOYMENT": "@convex_deployment",
      "NEXT_PUBLIC_CONVEX_URL": "@next_public_convex_url"
    }
  }
}
```

**Step 2: Create Netlify configuration**

Create: `netlify.toml` with content:
```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NPM_FLAGS = "--version"
  NODE_VERSION = "18"
  CONVEX_DEPLOYMENT = "your-deployment-url"
  NEXT_PUBLIC_CONVEX_URL = "https://your-deployment-url.convex.cloud"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["convex", "resend"]
```

**Step 3: Create Dockerfile**

Create: `Dockerfile` with content:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV CONVEX_DEPLOYMENT=your-deployment-url
ENV NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud

RUN corepack enable pnpm && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Step 4: Create Docker Compose**

Create: `docker-compose.yml` with content:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - CONVEX_DEPLOYMENT=${CONVEX_DEPLOYMENT}
      - NEXT_PUBLIC_CONVEX_URL=${NEXT_PUBLIC_CONVEX_URL}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - FROM_EMAIL=${FROM_EMAIL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - NEXT_PUBLIC_ENABLE_OAUTH=${NEXT_PUBLIC_ENABLE_OAUTH}
    env_file:
      - .env.local
```

**Step 5: Create Fly.io configuration**

Create: `fly.toml` with content:
```toml
app = "your-app-name"
primary_region = "iad"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "3000"
  NODE_ENV = "production"
  CONVEX_DEPLOYMENT = "your-deployment-url"
  NEXT_PUBLIC_CONVEX_URL = "https://your-deployment-url.convex.cloud"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[services.ports]]
  handlers = ["http"]
  port = 80

[[services.ports]]
  handlers = ["tls", "http"]
  port = 443

[metrics]
  port = 3001
```

**Step 6: Commit**

Run: `git add vercel.json netlify.toml Dockerfile docker-compose.yml fly.toml`
Run: `git commit -m "feat: add multi-platform deployment configs

- Add Vercel config with environment variables
- Add Netlify config with functions support
- Add Dockerfile for containerized deployment
- Add Docker Compose for local container testing
- Add Fly.io config for edge deployment""

---

## Task 3: Create Deployment Documentation

**Files:**
- Create: `docs/deployment.md`

**Step 1: Create comprehensive deployment guide**

Create: `docs/deployment.md` with content:
```markdown
# Deployment Guide

This guide covers deploying your Convex-powered Next.js application to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. ✅ Configured your environment variables (`.env.local`)
2. ✅ Deployed your Convex backend
3. ✅ Generated Convex types (`npx convex codegen`)
4. ✅ Tested locally (`pnpm dev`)

## Platform Deployment

### Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Configure Environment Variables**

   Go to your Vercel dashboard → Project → Settings → Environment Variables and add:
   - `CONVEX_DEPLOYMENT`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `GOOGLE_CLIENT_ID` (if using OAuth)
   - `GOOGLE_CLIENT_SECRET` (if using OAuth)
   - `NEXT_PUBLIC_ENABLE_OAUTH` (if using OAuth)

4. **Deploy**
   ```bash
   vercel
   ```

5. **Update Convex CORS**
   ```bash
   npx convex deploy
   ```
   Add your Vercel domain to Convex allowed origins.

### Netlify

#### Steps:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Configure Environment Variables**

   Go to Netlify dashboard → Site settings → Environment variables:
   - Same as Vercel list above
   - Use `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Docker

#### Steps:

1. **Build Image**
   ```bash
   docker build -t my-convex-app .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env.local my-convex-app
   ```

3. **With Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Fly.io

#### Steps:

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**
   ```bash
   fly auth login
   ```

3. **Update Configuration**
   Edit `fly.toml` and set:
   ```toml
   app = "your-app-name"
   ```

4. **Deploy**
   ```bash
   fly launch
   fly deploy
   ```

5. **Set Secrets**
   ```bash
   fly secrets set CONVEX_DEPLOYMENT=your-deployment
   fly secrets set NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   fly secrets set RESEND_API_KEY=your-key
   fly secrets set FROM_EMAIL=noreply@yourapp.com
   ```

## Convex Deployment

### Deploy Backend

```bash
npx convex deploy
```

This deploys your Convex functions to Convex Cloud.

### Configure CORS

In your Convex dashboard, add your frontend domain to allowed origins.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `CONVEX_DEPLOYMENT` | Yes | Your Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Public Convex URL for client |
| `RESEND_API_KEY` | Yes | For email verification |
| `FROM_EMAIL` | Yes | Sender email address |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret |
| `NEXT_PUBLIC_ENABLE_OAUTH` | No | Set to "true" to enable OAuth |

## SSL/HTTPS

All recommended platforms provide automatic SSL certificates. No additional configuration needed.

## Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test authentication flow
- [ ] Test email verification
- [ ] Test password reset
- [ ] Check Convex dashboard for errors
- [ ] Test on mobile devices
- [ ] Set up monitoring (Vercel Analytics, etc.)

## Troubleshooting

### Build Fails

**Issue:** Convex types not found
**Solution:** Run `npx convex codegen` before building

**Issue:** Environment variables missing
**Solution:** Check your platform's environment variable configuration

### Runtime Errors

**Issue:** Convex connection failed
**Solution:** Verify `NEXT_PUBLIC_CONVEX_URL` is correct

**Issue:** Emails not sending
**Solution:** Check `RESEND_API_KEY` and `FROM_EMAIL` configuration

### OAuth Issues

**Issue:** OAuth not working
**Solution:** Verify:
- OAuth is enabled (`NEXT_PUBLIC_ENABLE_OAUTH=true`)
- Google OAuth app is configured
- Redirect URIs include your domain
- Client ID and Secret are correct

## Support

- [Convex Documentation](https://docs.convex.dev)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
```

**Step 2: Commit**

Run: `git add docs/deployment.md`
Run: `git commit -m "docs: add comprehensive deployment guide

- Document Vercel, Netlify, Docker, Fly.io deployment
- Include step-by-step instructions
- Add environment variables reference
- Add troubleshooting section
- Include post-deployment checklist""

---

## Task 4: Create API Documentation

**Files:**
- Create: `docs/api.md`

**Step 1: Create API reference documentation**

Create: `docs/api.md` with content:
```markdown
# API Reference

Complete reference for Convex functions and React hooks.

## Authentication API

### Functions (Convex)

#### `auth.register`
Register a new user with email verification.

```typescript
const result = await register({ email, name, password });
```

**Parameters:**
- `email: string` - User's email address
- `name: string` - User's full name
- `password: string` - User's password (min 8 chars)

**Returns:**
```typescript
{
  userId: string;
  message: string;
}
```

**Errors:**
- `"User with this email already exists"`

#### `auth.verifyEmail`
Verify email address with 6-digit code.

```typescript
const result = await verifyEmail({ email, code });
```

**Parameters:**
- `email: string` - User's email
- `code: string` - 6-digit verification code

**Returns:**
```typescript
{ message: string }
```

**Errors:**
- `"User not found"`
- `"Invalid verification code"`
- `"Verification code has expired"`

#### `auth.requestPasswordReset`
Request password reset email.

```typescript
const result = await requestPasswordReset({ email });
```

**Parameters:**
- `email: string` - User's email

**Returns:**
```typescript
{ message: string }
```

**Behavior:** Always returns success message (security best practice)

#### `auth.resetPassword`
Reset password with verification code.

```typescript
const result = await resetPassword({ email, code, newPassword });
```

**Parameters:**
- `email: string` - User's email
- `code: string` - 6-digit reset code
- `newPassword: string` - New password

**Returns:**
```typescript
{ message: string }
```

**Errors:**
- `"Invalid reset code"`
- `"Reset code has expired"`

### React Hooks

#### `useAuth`
Access authentication state and methods.

```typescript
const { user, isLoading, isAuthenticated, login, logout } = useAuth();
```

**Returns:**
- `user: User | null` - Current user or null
- `isLoading: boolean` - Loading state
- `isAuthenticated: boolean` - Authentication status
- `login: (email, password) => Promise<void>` - Login method
- `logout: () => void` - Logout method

## Users API

### Functions (Convex)

#### `users.getCurrentUser`
Get current authenticated user.

```typescript
const user = await getCurrentUser();
```

**Returns:**
```typescript
User | null
```

#### `users.getUsers`
Get paginated list of all users.

```typescript
const result = await getUsers({ limit: 50, cursor: null });
```

**Parameters:**
- `limit?: number` - Number of users (default: 50)
- `cursor?: string` - Pagination cursor

**Returns:**
```typescript
{
  page: User[];
  isDone: boolean;
  continueCursor?: string;
}
```

#### `users.getUserById`
Get user by ID.

```typescript
const user = await getUserById({ userId: string });
```

**Parameters:**
- `userId: string` - User ID

**Returns:**
```typescript
User | null
```

#### `users.createUser`
Create a new user (admin only).

```typescript
const user = await createUser({ email, name, image? });
```

**Parameters:**
- `email: string` - User's email
- `name: string` - User's name
- `image?: string` - Optional profile image URL

**Returns:**
```typescript
User
```

**Errors:**
- `"User with this email already exists"`

#### `users.updateUser`
Update user information.

```typescript
const user = await updateUser({ userId, name?, image? });
```

**Parameters:**
- `userId: string` - User ID
- `name?: string` - New name
- `image?: string` - New image URL

**Returns:**
```typescript
User
```

#### `users.deleteUser`
Delete a user (admin only).

```typescript
await deleteUser({ userId: string });
```

**Parameters:**
- `userId: string` - User ID

**Returns:**
```typescript
{ success: true }
```

## Organizations API

### Functions (Convex)

#### `organizations.getOrganizations`
Get all organizations for current user.

```typescript
const orgs = await getOrganizations();
```

**Returns:**
```typescript
Organization[]
```

#### `organizations.getOrganizationById`
Get organization by ID.

```typescript
const org = await getOrganizationById({ orgId: string });
```

**Parameters:**
- `orgId: string` - Organization ID

**Returns:**
```typescript
Organization | null
```

#### `organizations.createOrganization`
Create a new organization.

```typescript
const org = await createOrganization({ name, slug });
```

**Parameters:**
- `name: string` - Organization name
- `slug: string` - URL-friendly slug (unique)

**Returns:**
```typescript
Organization
```

**Errors:**
- `"Organization slug already exists"`

#### `organizations.updateOrganization`
Update organization.

```typescript
const org = await updateOrganization({ orgId, name?, slug? });
```

**Parameters:**
- `orgId: string` - Organization ID
- `name?: string` - New name
- `slug?: string` - New slug

**Returns:**
```typescript
Organization
```

#### `organizations.deleteOrganization`
Delete an organization.

```typescript
await deleteOrganization({ orgId: string });
```

**Parameters:**
- `orgId: string` - Organization ID

**Returns:**
```typescript
{ success: true }
```

## Memberships API

### Functions (Convex)

#### `memberships.getMembers`
Get members of an organization.

```typescript
const members = await getMembers({ orgId: string });
```

**Parameters:**
- `orgId: string` - Organization ID

**Returns:**
```typescript
{
  membershipId: string;
  user: User;
  role: Role;
  joinedAt: number;
}[]
```

#### `memberships.addMember`
Add member to organization.

```typescript
const membership = await addMember({ orgId, userId, roleId });
```

**Parameters:**
- `orgId: string` - Organization ID
- `userId: string` - User ID
- `roleId: string` - Role ID

**Returns:**
```typescript
Membership
```

**Errors:**
- `"User is already a member of this organization"`

#### `memberships.updateMemberRole`
Update member's role.

```typescript
const membership = await updateMemberRole({ membershipId, roleId });
```

**Parameters:**
- `membershipId: string` - Membership ID
- `roleId: string` - New role ID

**Returns:**
```typescript
Membership
```

#### `memberships.removeMember`
Remove member from organization.

```typescript
await removeMember({ orgId, userId });
```

**Parameters:**
- `orgId: string` - Organization ID
- `userId: string` - User ID

**Returns:**
```typescript
{ success: true }
```

## Activities API

### Functions (Convex)

#### `activities.logActivity`
Log a new activity.

```typescript
const activity = await logActivity({ orgId, userId, action, resource, metadata? });
```

**Parameters:**
- `orgId: string` - Organization ID
- `userId: string` - User ID
- `action: string` - Action type (e.g., "create_user")
- `resource: string` - Resource type
- `metadata?: any` - Additional data

**Returns:**
```typescript
Activity
```

#### `activities.getActivities`
Get activities for an organization.

```typescript
const result = await getActivities({ orgId, limit?, cursor? });
```

**Parameters:**
- `orgId: string` - Organization ID
- `limit?: number` - Number of activities (default: 50)
- `cursor?: string` - Pagination cursor

**Returns:**
```typescript
{
  activities: (Activity & { user: User | null })[];
  isDone: boolean;
  continueCursor?: string;
}
```

#### `activities.getUserActivities`
Get activities for a specific user.

```typescript
const activities = await getUserActivities({ userId, limit? });
```

**Parameters:**
- `userId: string` - User ID
- `limit?: number` - Number of activities (default: 50)

**Returns:**
```typescript
Activity[]
```

## Dashboard API

### Functions (Convex)

#### `dashboard.getMetrics`
Get dashboard metrics.

```typescript
const metrics = await getMetrics({ orgId });
```

**Parameters:**
- `orgId: string` - Organization ID

**Returns:**
```typescript
{
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  activityByDay: { date: string; count: number }[];
}
```

#### `dashboard.getRecentActivities`
Get recent activities for dashboard.

```typescript
const activities = await getRecentActivities({ orgId, limit? });
```

**Parameters:**
- `orgId: string` - Organization ID
- `limit?: number` - Number of activities (default: 10)

**Returns:**
```typescript
(Activity & { user: User | null })[]
```

#### `dashboard.getUserGrowth`
Get user growth data by month.

```typescript
const growth = await getUserGrowth({ months? });
```

**Parameters:**
- `months?: number` - Number of months (default: 6)

**Returns:**
```typescript
{ month: string; count: number }[]
```

## Settings API

### Functions (Convex)

#### `settings.getUserProfile`
Get user profile.

```typescript
const profile = await getUserProfile({ userId });
```

**Parameters:**
- `userId: string` - User ID

**Returns:**
```typescript
UserProfile | null
```

#### `settings.updateUserProfile`
Update user profile.

```typescript
const profile = await updateUserProfile({ userId, bio?, location?, website?, preferences? });
```

**Parameters:**
- `userId: string` - User ID
- `bio?: string` - Bio text
- `location?: string` - Location
- `website?: string` - Website URL
- `preferences?: any` - Preferences object

**Returns:**
```typescript
UserProfile
```

## Types

### User
```typescript
{
  _id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: number;
  lastSeenAt: number;
  isEmailVerified: boolean;
}
```

### Organization
```typescript
{
  _id: string;
  name: string;
  slug: string;
  createdAt: number;
  ownerId: string;
}
```

### Role
```typescript
{
  _id: string;
  name: string;
  permissions: string[];
  orgId?: string;
}
```

### Activity
```typescript
{
  _id: string;
  orgId: string;
  userId: string;
  action: string;
  resource: string;
  metadata: any;
  createdAt: number;
}
```

### UserProfile
```typescript
{
  _id: string;
  userId: string;
  bio?: string;
  location?: string;
  website?: string;
  preferences: any;
}
```

## Error Handling

All functions can throw errors. Handle them with try/catch:

```typescript
try {
  const result = await register({ email, name, password });
} catch (error) {
  console.error("Registration failed:", error.message);
  // Handle error (show user-friendly message)
}
```

## Real-time Subscriptions

Convex supports real-time subscriptions. Use `useQuery` for automatic updates:

```typescript
const activities = useQuery(
  api.activities.getActivities,
  { orgId, limit: 10 }
);
// Automatically updates when data changes
```

## Pagination

Use `continueCursor` for pagination:

```typescript
// First page
const firstPage = await getUsers({ limit: 50 });

// Next page
const nextPage = await getUsers({
  limit: 50,
  cursor: firstPage.continueCursor
});
```

## Rate Limiting

Be mindful of query limits:
- Queries should be efficient
- Use indexes for performance
- Limit results with `take()` or `paginate()`
```

**Step 2: Commit**

Run: `git add docs/api.md`
Run: `git commit -m "docs: add comprehensive API reference

- Document all Convex functions
- Document React hooks
- Include parameters, returns, errors
- Add type definitions
- Include usage examples
- Document real-time subscriptions and pagination""

---

## Task 5: Create Customization Guide

**Files:**
- Create: `docs/customization.md`

**Step 1: Create customization guide**

Create: `docs/customization.md` with content:
```markdown
# Customization Guide

How to customize the Convex Starter Template for your specific needs.

## Changing the App Name

### Update package.json

```json
{
  "name": "your-app-name",
  "description": "Your app description"
}
```

### Update README.md

Replace the title and description in `README.md`.

### Update Vercel Project Name

In Vercel dashboard → Settings → General → Project Name.

## Customizing the Color Scheme

### Primary Colors

Edit `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#your-color',
          100: '#your-color',
          // ... up to 900
        }
      }
    }
  }
}
```

### Using Brand Colors

1. Define your brand colors in `tailwind.config.ts`
2. Update `globals.css` with CSS variables
3. Use with Tailwind: `bg-primary-600`, `text-primary`

## Adding New Pages

### Create a New Dashboard Page

1. **Create page file**
   ```typescript
   // src/app/(dashboard)/new-page/page.tsx
   import { ProtectedRoute } from "../../../components/protected-route";

   export default function NewPage() {
     return (
       <ProtectedRoute>
         <div className="p-8">
           <h1 className="text-3xl font-bold">New Page</h1>
         </div>
       </ProtectedRoute>
     );
   }
   ```

2. **Update navigation**
   Edit `src/components/dashboard/sidebar.tsx`

3. **Add route protection**
   Already handled by `ProtectedRoute`

### Create a Public Page

```typescript
// src/app/public-page/page.tsx
export default function PublicPage() {
  return (
    <div className="min-h-screen">
      <h1>Public Page</h1>
    </div>
  );
}
```

## Adding New Database Tables

### 1. Update Schema

Edit `convex/schema.ts`:

```typescript
export default defineSchema({
  // ... existing tables
  yourTable: defineTable({
    name: v.string(),
    userId: v.id("users"),
    // ... fields
  }).index("by_user", ["userId"]),
});
```

### 2. Deploy Schema

```bash
npx convex dev
```

### 3. Create Functions

```typescript
// convex/functions/yourTable.ts
import { query, mutation } from "convex/server";

export const getYourData = query(async (ctx) => {
  return await ctx.db
    .query("yourTable")
    .collect();
});

export const createYourData = mutation(
  async (ctx, { name, userId }: { name: string; userId: string }) => {
    return await ctx.db.insert("yourTable", {
      name,
      userId,
    });
  }
);
```

### 4. Generate Types

```bash
npx convex codegen
```

### 5. Use in React

```typescript
const data = useQuery(api.yourTable.getYourData);
const createData = useMutation(api.yourTable.createYourData);
```

## Customizing Authentication

### Change OAuth Provider

Edit `src/lib/convex/client.ts`:

```typescript
// Change from Google to GitHub, etc.
```

### Custom Login Fields

Edit `src/components/auth/login-form.tsx`:

```typescript
<div>
  <Label htmlFor="username">Username</Label>
  <Input
    id="username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
  />
</div>
```

### Email Verification Customization

Edit email templates in `convex/functions/email.ts`:

```typescript
const result = await resend.emails.send({
  from: "your-email@yourapp.com",
  subject: "Your Custom Subject",
  html: `
    <div style="...">
      <h1>Your Custom Template</h1>
      <!-- Your custom HTML -->
    </div>
  `,
});
```

## Adding Role-Based Access Control

### Check User Role

```typescript
// In a Convex function
export const getRestrictedData = query(
  async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) throw new Error("User not found");

    // Check if user is admin
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const isAdmin = memberships.some(m => m.roleId === adminRoleId);
    if (!isAdmin) throw new Error("Forbidden");

    return await ctx.db.query("secretData").collect();
  }
);
```

### React Component Protection

```typescript
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user is admin
      // Set isAdmin state
    }
  }, [user]);

  if (!isAdmin) {
    return <div>Access denied</div>;
  }

  return <>{children}</>;
}
```

## Customizing the Dashboard

### Add New Stats Card

Edit `src/components/dashboard/overview/components/stats.tsx`:

```typescript
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Your Metric</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{yourValue}</div>
  </CardContent>
</Card>
```

### Add New Chart

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function YourChart({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

## Adding Email Templates

### 1. Create Template

```typescript
// convex/functions/emailTemplates.ts
export const sendCustomEmail = mutation(
  async (ctx, { email, data }: { email: string; data: any }) => {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: [email],
      subject: "Custom Email",
      html: `
        <div>
          <h1>${data.title}</h1>
          <p>${data.message}</p>
        </div>
      `,
    });

    return result;
  }
);
```

### 2. Use in React

```typescript
const sendCustomEmail = useMutation(api.emailTemplates.sendCustomEmail);

await sendCustomEmail({
  email: "user@example.com",
  data: { title: "Hello", message: "Your custom email" }
});
```

## Internationalization (i18n)

### Add react-i18next

```bash
pnpm add react-i18next i18next i18next-browser-languagedetector
```

### Create Translation Files

```typescript
// src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: "Welcome",
          login: "Login"
        }
      },
      es: {
        translation: {
          welcome: "Bienvenido",
          login: "Iniciar sesión"
        }
      }
    }
  });

export default i18n;
```

### Use in Components

```typescript
import { useTranslation } from "react-i18next";

export function Component() {
  const { t } = useTranslation();

  return <h1>{t("welcome")}</h1>;
}
```

## Adding Analytics

### Vercel Analytics

```bash
pnpm add @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Google Analytics

```typescript
// src/lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};
```

## Customizing the Setup Script

Edit `scripts/setup.ts` to:

- Add new configuration questions
- Modify default values
- Add new files
- Change validation logic

## Best Practices

1. **Keep code modular** - Separate concerns
2. **Use TypeScript** - Type everything
3. **Follow naming conventions** - Consistent file and function names
4. **Write tests** - Test your customizations
5. **Document changes** - Update README and docs
6. **Version control** - Commit early and often

## Removing Features

### Remove OAuth

1. Delete OAuth-related code
2. Set `NEXT_PUBLIC_ENABLE_OAUTH=false` in `.env`
3. Remove Google client variables
4. Update auth context to not handle OAuth

### Remove Email Verification

1. Set `isEmailVerified: true` by default in user creation
2. Remove verification code fields
3. Delete verification email code
4. Update auth flows

## Getting Help

- Check existing code for examples
- Review [Convex Documentation](https://docs.convex.dev)
- Check [Next.js Documentation](https://nextjs.org/docs)
- Look at other developers' implementations
```

**Step 2: Commit**

Run: `git add docs/customization.md`
Run: `git commit -m "docs: add customization guide

- Document how to change app name and branding
- Explain color scheme customization
- Guide to adding new pages and database tables
- Show how to customize authentication
- Document RBAC implementation
- Add dashboard customization examples
- Include internationalization guide
- Document analytics integration""

---

## Task 6: Create Troubleshooting Guide

**Files:**
- Create: `docs/troubleshooting.md`

**Step 1: Create troubleshooting guide**

Create: `docs/troubleshooting.md` with content:
```markdown
# Troubleshooting Guide

Common issues and solutions.

## Convex Issues

### "Convex functions not updating"

**Symptoms:**
- Code changes not reflected
- Old function versions running

**Solutions:**

1. **Restart Convex dev server**
   ```bash
   # Stop with Ctrl+C
   npx convex dev
   ```

2. **Force deployment**
   ```bash
   npx convex deploy --force
   ```

3. **Clear function cache**
   ```bash
   rm -rf .convex
   npx convex dev
   ```

### "Type errors in Convex functions"

**Symptoms:**
- TypeScript errors when running functions
- Generated types don't match

**Solutions:**

1. **Regenerate types**
   ```bash
   npx convex codegen
   ```

2. **Restart dev server**
   ```bash
   # Stop and restart
   npx convex dev
   ```

3. **Check for circular dependencies**
   - Ensure functions don't import from each other
   - Use ctx.db for all database operations

### "Database schema mismatch"

**Symptoms:**
- `Schema mismatch` errors
- Functions can't find table

**Solutions:**

1. **Check schema syntax**
   ```typescript
   // convex/schema.ts
   export default defineSchema({
     tableName: defineTable({
       field: v.string(),
     }).index("by_field", ["field"]),
   });
   ```

2. **Deploy schema changes**
   ```bash
   npx convex dev
   # Changes auto-deploy in dev mode
   ```

## Authentication Issues

### "Email verification not working"

**Symptoms:**
- Verification emails not sent
- Emails going to spam

**Solutions:**

1. **Check Resend API key**
   ```bash
   echo $RESEND_API_KEY
   # Should start with re_
   ```

2. **Verify FROM_EMAIL**
   - Must be a verified domain in Resend
   - Check .env.local has correct value

3. **Check email template**
   - Test in Resend dashboard
   - Verify HTML is valid

4. **Check rate limits**
   - Resend has sending limits
   - Check Resend dashboard

### "OAuth login failing"

**Symptoms:**
- OAuth redirect fails
- "Invalid client" error

**Solutions:**

1. **Verify OAuth enabled**
   ```bash
   grep NEXT_PUBLIC_ENABLE_OAUTH .env.local
   # Should be true
   ```

2. **Check Google OAuth config**
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Authorized JavaScript origin: `http://localhost:3000`

3. **Verify client credentials**
   ```bash
   grep GOOGLE_CLIENT .env.local
   # Check IDs match Google Console
   ```

4. **Check NextAuth config**
   - Verify callback URL in `src/lib/next-auth.ts`

### "Session not persisting"

**Symptoms:**
- User gets logged out frequently
- Need to re-login often

**Solutions:**

1. **Check JWT settings**
   ```typescript
   // In NextAuth config
   session: {
     strategy: "jwt",
     maxAge: 30 * 24 * 60 * 60, // 30 days
   }
   ```

2. **Check auth provider config**
   - Ensure session strategy is correct
   - Verify session callbacks

## Database Issues

### "Query performance slow"

**Symptoms:**
- Pages load slowly
- Queries timeout

**Solutions:**

1. **Add database indexes**
   ```typescript
   // In schema.ts
   yourTable: defineTable({
     userId: v.id("users"),
     // Add index
   }).index("by_user", ["userId"]),
   ```

2. **Use pagination**
   ```typescript
   // Instead of collect()
   const results = await ctx.db
     .query("table")
     .paginate({ numItems: 50, cursor });
   ```

3. **Limit results**
   ```typescript
   const results = await ctx.db
     .query("table")
     .take(100); // Limit to 100
   ```

### "Document not found"

**Symptoms:**
- `No document with id` errors
- 404 errors on page load

**Solutions:**

1. **Check ID format**
   ```typescript
   // IDs are strings, but represent document references
   const docId = "abc123"; // Valid
   ```

2. **Handle null cases**
   ```typescript
   const doc = await ctx.db.get(id as any);
   if (!doc) {
     // Handle not found
     return;
   }
   ```

3. **Check reference type**
   ```typescript
   // When querying by reference
   .eq("userId", userId as any)
   ```

## Build Issues

### "Build fails with TypeScript errors"

**Symptoms:**
- `npm run build` fails
- Type errors in console

**Solutions:**

1. **Fix type errors**
   - Check error messages
   - Update types where needed
   - Use `any` if type is complex

2. **Check for missing types**
   ```bash
   pnpm add @types/node
   ```

3. **Skip type checking temporarily**
   ```typescript
   // Not recommended, but for quick fix
   // @ts-ignore
   const result = someFunction();
   ```

### "Module not found"

**Symptoms:**
- `Cannot resolve module` errors
- Import path issues

**Solutions:**

1. **Check import paths**
   ```typescript
   // Use relative or alias paths
   import { something } from "@/lib/file";
   // or
   import { something } from "../../../lib/file";
   ```

2. **Check package.json**
   - Ensure package is installed
   - Check exports field

3. **Clear Next.js cache**
   ```bash
   rm -rf .next
   npm run build
   ```

## Environment Issues

### "Environment variables not loading"

**Symptoms:**
- Undefined process.env
- Fallback values used

**Solutions:**

1. **Check file name**
   - Must be `.env.local` (not .env.development)
   - Must be in project root

2. **Restart dev server**
   ```bash
   # After changing .env.local
   # Stop and restart
   npm run dev
   ```

3. **Check variable names**
   ```bash
   # Must match exactly
   NEXT_PUBLIC_CONVEX_URL
   # Not
   NEXT_PUBLIC_CONVEX_url
   ```

4. **Client vs Server**
   - Only `NEXT_PUBLIC_*` available in browser
   - Other vars only in server/Convex

### "Convex URL not valid"

**Symptoms:**
- "Invalid Convex URL" error
- Connection failures

**Solutions:**

1. **Get correct URL**
   ```bash
   npx convex status
   # Copy the URL
   ```

2. **Set both variables**
   ```bash
   CONVEX_DEPLOYMENT=your-deployment
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

3. **Check deployment**
   ```bash
   npx convex deploy
   ```

## Deployment Issues

### "Vercel build fails"

**Symptoms:**
- Build timeout
- Function errors

**Solutions:**

1. **Check environment variables**
   - Set in Vercel dashboard
   - Match local .env.local

2. **Increase build timeout**
   ```json
   // vercel.json
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/next"
       }
     ]
   }
   ```

3. **Check function logs**
   - Vercel dashboard → Functions → View logs

### "Netlify deploy fails"

**Symptoms:**
- Build error
- 404 on all pages

**Solutions:**

1. **Check netlify.toml**
   ```toml
   [build]
     command = "pnpm build"
     publish = ".next"
   ```

2. **Add _redirects file**
   ```
   /* /index.html 200
   ```

3. **Check build command**
   - Must be `pnpm build` not `npm run build`

## Performance Issues

### "Slow page loads"

**Symptoms:**
- Pages take >3s to load
- High TTFB

**Solutions:**

1. **Optimize queries**
   - Add indexes
   - Use pagination
   - Select only needed fields

2. **Cache data**
   ```typescript
   // Use React Query or SWR
   const { data } = useQuery(api.query, args, {
     staleTime: 5 * 60 * 1000, // 5 minutes
   });
   ```

3. **Lazy load components**
   ```typescript
   const HeavyComponent = dynamic(() => import("./Component"), {
     loading: () => <p>Loading...</p>,
   });
   ```

### "High memory usage"

**Symptoms:**
- Browser tab crashes
- Out of memory errors

**Solutions:**

1. **Limit data in memory**
   - Use pagination
   - Don't collect large arrays

2. **Clean up subscriptions**
   ```typescript
   // In useEffect
   return () => {
     subscription.unsubscribe();
   };
   ```

## Getting More Help

### Check Logs

1. **Convex logs**
   ```bash
   npx convex dev
   # Logs appear in terminal
   ```

2. **Browser console**
   - Open DevTools
   - Check Console and Network tabs

3. **Vercel/Netlify logs**
   - Check platform dashboard
   - View function/build logs

### Enable Debug Mode

1. **Convex debug**
   ```typescript
   // In Convex function
   console.log("Debug info", data);
   ```

2. **Next.js debug**
   ```bash
   DEBUG=* npm run dev
   ```

### Revert to Last Working State

```bash
# Find last good commit
git log --oneline

# Create branch from good commit
git checkout -b fix-branch <commit-hash>

# Cherry-pick your changes
git cherry-pick <commit-hash>
```

### Report Issues

When reporting issues, include:

1. **Error message** (full text)
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Environment**
   - Node version
   - pnpm version
   - OS
5. **Relevant code**
6. **Logs** (sanitized of secrets)

### Common Resources

- [Convex Discord](https://convex.dev/community)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/convex)
```

**Step 2: Commit**

Run: `git add docs/troubleshooting.md`
Run: `git commit -m "docs: add troubleshooting guide

- Document Convex issues and solutions
- Cover authentication problems
- Explain database query performance
- Help with build and deployment errors
- Provide performance optimization tips
- Include debug mode instructions
- Add issue reporting guidelines""

---

## Task 7: Create Example Project

**Files:**
- Create: `docs/examples.md`

**Step 1: Create examples documentation**

Create: `docs/examples.md` with content:
```markdown
# Examples

Real-world examples and use cases.

## Example 1: Adding a Blog Feature

### Overview
Add a blog with posts, categories, and comments.

### Implementation

#### 1. Create Database Schema

```typescript
// convex/schema.ts (add to existing)
posts: defineTable({
  title: v.string(),
  content: v.string(),
  slug: v.string(),
  authorId: v.id("users"),
  categoryId: v.optional(v.id("categories")),
  publishedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_slug", ["slug"])
 .index("by_author", ["authorId"])
 .index("by_published", ["publishedAt"]),

categories: defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
}).index("by_slug", ["slug"]),

comments: defineTable({
  postId: v.id("posts"),
  authorId: v.id("users"),
  content: v.string(),
  createdAt: v.number(),
}).index("by_post", ["postId"])
 .index("by_author", ["authorId"]),
```

#### 2. Create Functions

```typescript
// convex/functions/blog.ts
import { query, mutation } from "convex/server";
import { v } from "convex/values";

export const getPosts = query(async (ctx) => {
  return await ctx.db
    .query("posts")
    .withIndex("by_published", (q) => q.gt("publishedAt", 0))
    .order("desc")
    .collect();
});

export const getPostBySlug = query(
  async (ctx, { slug }: { slug: string }) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  }
);

export const createPost = mutation(
  async (ctx, { title, content, slug, categoryId }: {
    title: string;
    content: string;
    slug: string;
    categoryId?: string;
  }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("posts", {
      title,
      content,
      slug,
      authorId: identity.userId!,
      categoryId: categoryId as any,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
);
```

#### 3. Create React Components

```typescript
// src/components/blog/PostList.tsx
import { useQuery } from "convex/react";
import { api } from "../../convex/generated/api";

export function PostList() {
  const posts = useQuery(api.blog.getPosts);

  if (!posts) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article key={post._id} className="border-b pb-6">
          <h2 className="text-2xl font-bold mb-2">
            <a href={`/blog/${post.slug}`}>{post.title}</a>
          </h2>
          <p className="text-gray-600">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-4">{post.content.substring(0, 200)}...</p>
        </article>
      ))}
    </div>
  );
}
```

```typescript
// src/app/blog/page.tsx
import { PostList } from "../../components/blog/PostList";

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <PostList />
    </div>
  );
}
```

## Example 2: File Upload with Storage

### Overview
Add file upload to user profiles using Convex storage.

### Implementation

#### 1. Create Upload Function

```typescript
// convex/functions/storage.ts
import { mutation } from "convex/server";
import { v } from "convex/values";

export const uploadProfileImage = mutation(
  async (ctx, { userId, fileBuffer }: { userId: string; fileBuffer: Uint8Array }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check if user owns this profile
    const user = await ctx.db.get(userId as any);
    if (!user) throw new Error("User not found");

    // Generate storage ID
    const storageId = await ctx.storage.store(fileBuffer);

    // Update user with new image
    await ctx.db.patch(userId as any, { image: storageId });

    return { storageId };
  }
);
```

#### 2. Create React Component

```typescript
// src/components/profile/ImageUpload.tsx
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/generated/api";

export function ImageUpload({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const uploadImage = useMutation(api.storage.uploadProfileImage);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const fileBuffer = await file.arrayBuffer();

    await uploadImage({
      userId,
      fileBuffer: new Uint8Array(fileBuffer),
    });

    setUploading(false);
    setFile(null);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
```

## Example 3: Real-time Chat

### Overview
Add real-time chat to your app using Convex subscriptions.

### Implementation

#### 1. Create Chat Schema

```typescript
// Add to schema.ts
messages: defineTable({
  roomId: v.string(),
  userId: v.id("users"),
  content: v.string(),
  createdAt: v.number(),
}).index("by_room", ["roomId"])
 .index("by_room_and_created", ["roomId", "createdAt"]),
```

#### 2. Create Chat Functions

```typescript
// convex/functions/chat.ts
import { query, mutation } from "convex/server";
import { v } from "convex/values";

export const getMessages = query(
  async (ctx, { roomId }: { roomId: string }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_room_and_created", (q) =>
        q.eq("roomId", roomId).order("desc")
      )
      .take(50);
  }
);

export const sendMessage = mutation(
  async (ctx, { roomId, content }: { roomId: string; content: string }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("messages", {
      roomId,
      userId: identity.userId!,
      content,
      createdAt: Date.now(),
    });
  }
);
```

#### 3. Create Chat Component

```typescript
// src/components/chat/ChatRoom.tsx
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/generated/api";

export function ChatRoom({ roomId }: { roomId: string }) {
  const [message, setMessage] = useState("");
  const messages = useQuery(api.chat.getMessages, { roomId });
  const sendMessage = useMutation(api.chat.sendMessage);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage({ roomId, content: message });
    setMessage("");
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages?.map((msg) => (
          <div key={msg._id} className="bg-gray-100 p-2 rounded">
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </form>
    </div>
  );
}
```

## Example 4: E-commerce Product Catalog

### Overview
Build a product catalog with categories, filters, and search.

### Implementation

#### 1. Create E-commerce Schema

```typescript
// Add to schema.ts
products: defineTable({
  name: v.string(),
  description: v.string(),
  price: v.number(),
  categoryId: v.id("categories"),
  imageUrls: v.array(v.string()),
  inStock: v.boolean(),
  createdAt: v.number(),
}).index("by_category", ["categoryId"])
 .index("by_stock", ["inStock"])
 .index("by_price", ["price"]),
```

#### 2. Create Product Functions

```typescript
// convex/functions/products.ts
import { query } from "convex/server";
import { v } from "convex/values";

export const getProducts = query(
  async (ctx, { categoryId, minPrice, maxPrice, inStock }: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  } = {}) => {
    let query = ctx.db.query("products");

    if (categoryId) {
      query = query.withIndex("by_category", (q) =>
        q.eq("categoryId", categoryId as any)
      );
    }

    if (inStock !== undefined) {
      query = query.withIndex("by_stock", (q) =>
        q.eq("inStock", inStock)
      );
    }

    return await query.collect();
  }
);

export const searchProducts = query(
  async (ctx, { searchTerm }: { searchTerm: string }) => {
    const products = await ctx.db.query("products").collect();

    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
);
```

#### 3. Create Product Grid

```typescript
// src/components/shop/ProductGrid.tsx
import { useQuery } from "convex/react";
import { api } from "../../convex/generated/api";

export function ProductGrid({ categoryId }: { categoryId?: string }) {
  const products = useQuery(api.products.getProducts, { categoryId });

  if (!products) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product._id} className="border rounded p-4">
          <h3 className="text-lg font-bold">{product.name}</h3>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-xl font-bold mt-2">${product.price}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            disabled={!product.inStock}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Example 5: Multi-tenant SaaS Billing

### Overview
Implement subscription billing with Stripe.

### Implementation

#### 1. Create Billing Schema

```typescript
// Add to schema.ts
subscriptions: defineTable({
  orgId: v.id("organizations"),
  stripeCustomerId: v.string(),
  stripeSubscriptionId: v.string(),
  plan: v.string(), // "basic", "pro", "enterprise"
  status: v.string(), // "active", "canceled", "past_due"
  currentPeriodEnd: v.number(),
  createdAt: v.number(),
}).index("by_org", ["orgId"])
 .index("by_stripe", ["stripeSubscriptionId"]),
```

#### 2. Create Billing Functions

```typescript
// convex/functions/billing.ts
import { query, mutation } from "convex/server";
import { v } from "convex/values";

export const getSubscription = query(
  async (ctx, { orgId }: { orgId: string }) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_org", (q) => q.eq("orgId", orgId as any))
      .unique();
  }
);

export const createSubscription = mutation(
  async (ctx, { orgId, plan }: { orgId: string; plan: string }) => {
    // Call Stripe API to create subscription
    // Update database with subscription info
    // This is a placeholder - implement with actual Stripe SDK
  }
);

export const cancelSubscription = mutation(
  async (ctx, { orgId }: { orgId: string }) => {
    // Cancel in Stripe
    // Update database
  }
);
```

#### 3. Create Billing UI

```typescript
// src/components/billing/SubscriptionCard.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/generated/api";

export function SubscriptionCard({ orgId }: { orgId: string }) {
  const subscription = useQuery(api.billing.getSubscription, { orgId });
  const createSub = useMutation(api.billing.createSubscription);
  const cancelSub = useMutation(api.billing.cancelSubscription);

  return (
    <div className="border rounded p-6">
      <h2 className="text-2xl font-bold">Subscription</h2>

      {subscription ? (
        <div>
          <p className="mt-4">Plan: {subscription.plan}</p>
          <p>Status: {subscription.status}</p>
          <p>Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>

          <button
            onClick={() => cancelSub({ orgId })}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Cancel Subscription
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={() => createSub({ orgId, plan: "pro" })}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Subscribe to Pro
          </button>
        </div>
      )}
    </div>
  );
}
```

## Example 6: Analytics Dashboard

### Overview
Build custom analytics with custom metrics.

### Implementation

#### 1. Create Analytics Schema

```typescript
// Add to schema.ts
metrics: defineTable({
  orgId: v.id("organizations"),
  name: v.string(), // "daily_active_users", "revenue", etc.
  value: v.number(),
  date: v.string(), // YYYY-MM-DD
  metadata: v.optional(v.any()),
}).index("by_org_and_date", ["orgId", "date"])
 .index("by_name", ["name"]),
```

#### 2. Create Analytics Functions

```typescript
// convex/functions/analytics.ts
import { query } from "convex/server";

export const getMetricSeries = query(
  async (ctx, { orgId, metricName, startDate, endDate }: {
    orgId: string;
    metricName: string;
    startDate: string;
    endDate: string;
  }) => {
    return await ctx.db
      .query("metrics")
      .withIndex("by_org_and_date", (q) =>
        q.eq("orgId", orgId as any)
         .gte("date", startDate)
         .lte("date", endDate)
      )
      .collect();
  }
);

export const getCurrentMetric = query(
  async (ctx, { orgId, metricName }: { orgId: string; metricName: string }) => {
    const today = new Date().toISOString().split("T")[0];

    return await ctx.db
      .query("metrics")
      .withIndex("by_org_and_date", (q) =>
        q.eq("orgId", orgId as any).eq("date", today)
      )
      .unique();
  }
);
```

## Tips for Building Examples

1. **Start Simple**
   - Begin with basic CRUD operations
   - Add complexity gradually
   - Test each feature before moving on

2. **Follow Conventions**
   - Use established patterns from the template
   - Follow TypeScript best practices
   - Use the same error handling approach

3. **Think About Performance**
   - Add indexes early
   - Use pagination for large datasets
   - Cache frequently accessed data

4. **Consider Security**
   - Always validate permissions
   - Sanitize user inputs
   - Use proper authentication checks

5. **Test Thoroughly**
   - Test all CRUD operations
   - Test error cases
   - Test real-time updates
   - Test with multiple users

## Contributing Examples

Have a great example? Share it with the community!

- Fork the repository
- Create your example
- Add documentation
- Submit a pull request

See `CONTRIBUTING.md` for guidelines.
```

**Step 2: Commit**

Run: `git add docs/examples.md`
Run: `git commit -m "docs: add comprehensive examples guide

- Blog feature with posts, categories, comments
- File upload using Convex storage
- Real-time chat with subscriptions
- E-commerce product catalog
- Multi-tenant SaaS billing with Stripe
- Custom analytics dashboard
- Best practices and tips""

---

## Task 8: Create Final Tests

**Files:**
- Create: `__tests__/batch6-docs-deployment.test.ts`

**Step 1: Create documentation tests**

Create: `__tests__/batch6-docs-deployment.test.ts` with content:
```typescript
const fs = require("fs");

describe("Batch 6: Documentation & Deployment", () => {
  test("setup script is complete", () => {
    const content = fs.readFileSync("scripts/setup.ts", "utf8");
    expect(content).toContain("@inquirer/prompts");
    expect(content).toContain("appName");
    expect(content).toContain("enableOAuth");
    expect(content).toContain("updatePackageJson");
  });

  test("deployment configs exist", () => {
    expect(fs.existsSync("vercel.json")).toBe(true);
    expect(fs.existsSync("netlify.toml")).toBe(true);
    expect(fs.existsSync("Dockerfile")).toBe(true);
    expect(fs.existsSync("docker-compose.yml")).toBe(true);
    expect(fs.existsSync("fly.toml")).toBe(true);
  });

  test("deployment guide exists", () => {
    expect(fs.existsSync("docs/deployment.md")).toBe(true);
    const content = fs.readFileSync("docs/deployment.md", "utf8");
    expect(content).toContain("Vercel");
    expect(content).toContain("Netlify");
    expect(content).toContain("Docker");
    expect(content).toContain("Fly.io");
  });

  test("API documentation exists", () => {
    expect(fs.existsSync("docs/api.md")).toBe(true);
    const content = fs.readFileSync("docs/api.md", "utf8");
    expect(content).toContain("auth.register");
    expect(content).toContain("users.getUsers");
    expect(content).toContain("organizations.createOrganization");
  });

  test("customization guide exists", () => {
    expect(fs.existsSync("docs/customization.md")).toBe(true);
    const content = fs.readFileSync("docs/customization.md", "utf8");
    expect(content).toContain("Changing the App Name");
    expect(content).toContain("Customizing the Color Scheme");
    expect(content).toContain("Adding New Database Tables");
  });

  test("troubleshooting guide exists", () => {
    expect(fs.existsSync("docs/troubleshooting.md")).toBe(true);
    const content = fs.readFileSync("docs/troubleshooting.md", "utf8");
    expect(content).toContain("Convex Issues");
    expect(content).toContain("Authentication Issues");
    expect(content).toContain("Database Issues");
  });

  test("examples documentation exists", () => {
    expect(fs.existsSync("docs/examples.md")).toBe(true);
    const content = fs.readFileSync("docs/examples.md", "utf8");
    expect(content).toContain("Blog Feature");
    expect(content).toContain("File Upload");
    expect(content).toContain("Real-time Chat");
  });
});
```

**Step 2: Run tests**

Run: `npm test -- __tests__/batch6-docs-deployment.test.ts`
Expected: PASS (all 7 tests)

**Step 3: Commit**

Run: `git add __tests__/batch6-docs-deployment.test.ts`
Run: `git commit -m "test: add Batch 6 documentation and deployment tests

- Verify setup script is complete
- Check all deployment configs exist
- Validate deployment guide
- Confirm API documentation
- Check customization guide
- Verify troubleshooting guide
- Validate examples documentation""

---

## Task 9: Create CONTRIBUTING Guide

**Files:**
- Create: `CONTRIBUTING.md`

**Step 1: Create contributing guide**

Create: `CONTRIBUTING.md` with content:
```markdown
# Contributing to Convex Starter Template

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what's best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

### Suggesting Features

1. Check existing feature requests
2. Create issue with:
   - Clear use case
   - Proposed implementation
   - Alternative solutions considered
   - Additional context

### Submitting Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/convex-starter-template.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Test your changes**
   ```bash
   pnpm install
   pnpm dev
   pnpm test
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a pull request on GitHub

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Use Prettier for formatting
- Add JSDoc comments for functions

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

Examples:
```bash
git commit -m "feat: add file upload component"
git commit -m "fix: resolve OAuth callback error"
git commit -m "docs: update API documentation"
```

### Pull Request Process

1. **Fill out the PR template completely**
2. **Add screenshots for UI changes**
3. **Ensure all tests pass**
4. **Update documentation if needed**
5. **Request review from maintainers**

### Code Review

- All PRs require at least 1 review
- Be open to feedback
- Make requested changes promptly
- Discuss design decisions in comments

## Project Structure

```
├── convex/
│   ├── functions/          # Convex server functions
│   ├── schema.ts           # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   └── lib/              # Utilities
├── docs/                 # Documentation
└── tests/               # Test files
```

## Adding Features

### New Convex Function

1. Create file in `convex/functions/`
2. Export query/mutation functions
3. Add to schema if new table
4. Generate types: `npx convex codegen`
5. Add tests
6. Update API documentation

### New React Component

1. Create in `src/components/`
2. Use TypeScript
3. Follow existing patterns
4. Add to storybook if applicable
5. Add tests

### Documentation Updates

- Update relevant docs in `docs/`
- Keep examples up to date
- Fix typos and broken links
- Add new guides for features

## Testing

### Running Tests

```bash
# All tests
pnpm test

# Specific test file
pnpm test filename.test.ts

# Watch mode
pnpm test -- --watch
```

### Writing Tests

```typescript
describe("Feature Name", () => {
  test("should do something", () => {
    // Arrange
    const input = "test";

    // Act
    const result = function(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

## Questions?

- Join our [Discord](https://convex.dev/community)
- Check [Documentation](https://docs.convex.dev)
- Open an issue

## Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Mentioned in blog posts

Thank you for contributing! 🎉
```

**Step 2: Commit**

Run: `git add CONTRIBUTING.md`
Run: `git commit -m "docs: add contributing guide

- Document code of conduct
- Explain how to report bugs and suggest features
- Provide pull request guidelines
- Add code style and commit message conventions
- Document project structure
- Add testing instructions
- Include recognition for contributors""

---

## Task 10: Create Issue Templates

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`

**Step 1: Create bug report template**

Create: `.github/ISSUE_TEMPLATE/bug_report.md` with content:
```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment (please complete):**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]
 - Node Version: [e.g. 18.17.0]
 - pnpm Version: [e.g. 8.15.0]

**Convex Information:**
 - Convex Dev Version: [e.g. 1.11.0]
 - Deployment: [e.g. local, convex cloud]

**Additional context**
Add any other context about the problem here.
```

**Step 2: Create feature request template**

Create: `.github/ISSUE_TEMPLATE/feature_request.md` with content:
```markdown
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Use Case**
Describe the specific use case where this feature would be helpful.

**Additional context**
Add any other context or screenshots about the feature request here.
```

**Step 3: Commit**

Run: `git add .github/ISSUE_TEMPLATE/bug_report.md .github/ISSUE_TEMPLATE/feature_request.md`
Run: `git commit -m "docs: add GitHub issue templates

- Create bug report template with required fields
- Create feature request template
- Help contributors provide better issues
- Standardize issue format""

---

## Summary

**Batch 6 Complete!** Documentation & deployment is now fully implemented with:

✅ Interactive setup script with @inquirer/prompts
✅ Multi-platform deployment configs (Vercel, Netlify, Docker, Fly.io)
✅ Comprehensive deployment guide
✅ Complete API reference documentation
✅ Customization guide with examples
✅ Troubleshooting guide
✅ Real-world examples (blog, chat, e-commerce, etc.)
✅ Contributing guide
✅ GitHub issue templates
✅ Test suite

**Complete Project Ready!**

All batches (1-6) are now implemented with:
- ✅ Foundation & Environment
- ✅ Authentication Backend
- ✅ Authentication Frontend
- ✅ Core Business Logic
- ✅ Data & Dashboard
- ✅ Documentation & Deployment

**Next Steps:**
Your Convex-powered starter template is now complete and production-ready!
```

**Step 2: Run tests and commit**

Run: `npm test -- __tests__/batch6-docs-deployment.test.ts` and commit

```bash
npm test -- __tests__/batch6-docs-deployment.test.ts
git add __tests__/batch6-docs-deployment.test.ts
git commit -m "test: add Batch 6 documentation and deployment tests"
```

**Step 3: Create CONTRIBUTING guide**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add contributing guide"
```

**Step 4: Create GitHub issue templates**

```bash
mkdir -p .github/ISSUE_TEMPLATE
# Add templates
git add .github/ISSUE_TEMPLATE/
git commit -m "docs: add GitHub issue templates"
```

**Step 5: Create final summary commit**

```bash
git add docs/
git commit -m "docs: add all documentation files

- Deployment guide (Vercel, Netlify, Docker, Fly.io)
- API reference with all functions
- Customization guide with examples
- Troubleshooting guide
- Real-world examples (blog, chat, e-commerce, etc.)
- Contributing guidelines
- GitHub issue templates"
```

**Step 6: Summary**

All batch plans are now complete! You have:

1. **Batch 1**: Foundation & Environment ✅
2. **Batch 2**: Authentication Backend ✅
3. **Batch 3**: Authentication Frontend ✅
4. **Batch 4**: Core Business Logic ✅
5. **Batch 5**: Data & Dashboard ✅
6. **Batch 6**: Documentation & Deployment ✅

Each plan includes:
- Detailed step-by-step tasks (2-5 minutes each)
- TDD approach (test → implement → commit)
- Exact file paths and complete code
- Specific commit messages
- Comprehensive test suites

**You can now execute any batch when ready!**

To execute a batch:
- Use `superpowers:executing-plans` in a new session
- Or use `superpowers:subagent-driven-development` for this session

The entire project is now fully planned and ready for implementation! 🚀
```