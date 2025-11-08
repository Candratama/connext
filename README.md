# Connext Admin Template

A professional, production-ready admin dashboard template built with modern technologies.

![Connext Admin Template](public/shadcnblocks-admin-logo.svg)

## ✨ Features

### 🚀 Technology Stack
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: TailwindCSS v4 with inline configuration
- **UI Components**: shadcn/ui (36+ components) on Radix UI primitives
- **Language**: TypeScript 5.7.3
- **Package Manager**: pnpm
- **Backend**: Convex (TypeScript-first backend)
- **Authentication**: Email/password with email verification
- **Form Handling**: react-hook-form + zod validation
- **Icons**: lucide-react, @tabler/icons-react, @radix-ui/react-icons
- **Charts**: recharts
- **Theme**: next-themes (light/dark mode via CSS variables)

### 📦 What's Included
- ✅ **Authentication System**
  - Login/Register with email verification
  - Password reset with email
  - Session management
  - Protected routes
  - Security hardening (bcrypt, Zod validation, XSS prevention)

- ✅ **Dashboard Layouts**
  - 5 pre-built dashboard variations
  - Sidebar navigation
  - Responsive design
  - Multi-level routing

- ✅ **UI Components** (36+)
  - Button, Input, Label, Card, Dialog, Dropdown Menu
  - Data Table with @tanstack/react-table
  - Form components with validation
  - Charts and data visualization
  - And many more...

- ✅ **Pages & Routes**
  - Landing page
  - Authentication pages (login, register, forgot-password, reset-password, verify-email)
  - Dashboard with multiple layouts
  - Error pages (401, 403, 404, 503)
  - Settings pages (billing, profile, team, etc.)

- ✅ **Code Quality**
  - TypeScript strict mode
  - ESLint v9 configuration
  - Prettier with import sorting
  - Jest testing framework
  - 83+ passing security tests

## 🚀 Getting Started (Complete Guide)

Follow this step-by-step guide to get the template running in under 10 minutes.

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **pnpm 8+** (recommended) or npm
  ```bash
  npm install -g pnpm
  ```
- **Git** - [Download here](https://git-scm.com/)

### 🔑 Required Accounts

You'll need to sign up for these free services:

1. **Convex** - [convex.dev](https://convex.dev) (free)
   - TypeScript-first backend platform
   - Provides database, authentication, and real-time features

2. **Resend** - [resend.com](https://resend.com) (free tier available)
   - Email delivery service
   - Sends verification and password reset emails

3. **Google Cloud** - [console.cloud.google.com](https://console.cloud.google.com) (free)
   - OAuth 2.0 credentials for Google sign-in
   - Enables users to sign in with their Google accounts
   - Required for Google OAuth authentication

### 📦 Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repo-url>
cd connext

# Verify you're in the right directory
pwd
# Should show: /path/to/connext
```

### 📥 Step 2: Install Dependencies

```bash
# Install all project dependencies
pnpm install

# This will install:
# - Next.js 16
# - React 19
# - TailwindCSS v4
# - shadcn/ui components
# - Convex
# - And more...
```

**Expected output:**
```
Dependencies installed successfully
```

### ⚙️ Step 3: Set Up Environment Variables

**Option A: Interactive Setup (Recommended)**

```bash
# Run the interactive setup script
./scripts/setup.sh
```

The script will prompt you to enter:
- App URL (default: http://localhost:3000)
- Convex deployment URL
- Resend API key
- Sender email
- Google OAuth Client ID and Secret (optional, for Google sign-in)

**Option B: Manual Setup**

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

```env
# Required: Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Required: Get from Convex dashboard (see Step 4)
CONVEX_DEPLOYMENT=your-deployment-url-here

# Required: Get from Resend dashboard (see Step 5)
RESEND_API_KEY=your-resend-api-key-here

# Required: Your verified sender email
FROM_EMAIL=noreply@yourdomain.com

# Optional: Google OAuth credentials (see Step 6)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here

# Optional: Set to development or production
NODE_ENV=development
```

### ☁️ Step 4: Set Up Convex (Backend)

```bash
# Start Convex dev server
pnpm convex:dev
```

**What happens next:**

1. **Browser opens** - Convex will open [dashboard.convex.dev](https://dashboard.convex.dev)
2. **Sign up/Log in** - Create a free account or log in
3. **Create project** - Click "Create a new project"
4. **Choose name** - Enter a name (e.g., "connext-admin")
5. **Select template** - Choose "Start from Scratch"
6. **Copy URL** - After project creation, copy the deployment URL
   - Looks like: `https://happy-animal-123.convex.cloud`

7. **Update .env.local** - Add the URL to your environment:
   ```env
   CONVEX_DEPLOYMENT=https://happy-animal-123.convex.cloud
   ```

8. **Wait for sync** - Keep `pnpm convex:dev` running in terminal
   - You'll see: "Convex: ready!" when it's syncing

**Troubleshooting:**
- If you see "Not logged in": Run `npx convex login` first
- If you need to change projects: Run `npx convex dev` and select different project
- To see logs: Visit the Convex dashboard

### 📧 Step 5: Set Up Resend (Email Service)

1. **Sign up** - Go to [resend.com](https://resend.com) and create an account

2. **Create API Key**
   - Go to "API Keys" in dashboard
   - Click "Create API Key"
   - Give it a name (e.g., "connext-admin")
   - Copy the API key (starts with `re_`)

3. **Add to .env.local**
   ```env
   RESEND_API_KEY=re_1234567890abcdef
   ```

4. **Verify Domain/Sender**
   - Go to "Domains" in Resend dashboard
   - Add your domain or use a test email
   - For development, you can use any email address
   - For production, verify your domain

5. **Test Email**
   - The template will send test emails during registration
   - Check your email inbox (and spam folder)

**Resend Free Tier Limits:**
- 3,000 emails/month
- Perfect for development and small projects

### 🔐 Step 6: Set Up Google OAuth (Optional)

1. **Create Google Cloud Project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Wait for project creation to complete

2. **Enable Google+ API**
   - In the Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Select "Web application"
   - Name it (e.g., "connext-admin")

4. **Configure Authorized Origins and Redirect URIs**
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/auth/google/callback` (for development)
     - `https://yourdomain.com/auth/google/callback` (for production)

5. **Get Credentials**
   - After creation, copy the "Client ID" and "Client Secret"
   - Add them to your `.env.local`:
     ```env
     GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-client-secret-here
     NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     ```

**Note:** Google OAuth is optional. Users can still register and login with email/password without these credentials.

### 🏃 Step 7: Start the Application

**Terminal 1 (Keep Convex running):**
```bash
# Keep this terminal running for Convex
pnpm convex:dev
```

**Terminal 2 (Start Next.js):**
```bash
# In a new terminal, start Next.js dev server
pnpm dev
```

**Expected output:**
```
▲ Next.js 16.0.1 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.1.1:3000

✓ Ready in 1-2s
```

### 🌐 Step 8: Open Your Browser

Navigate to: **http://localhost:3000**

You should see:
1. **Landing page** with "Connext Admin Template" branding
2. "Login" and "Get Started" buttons in the header

### ✅ Step 9: Test the Application

**Test User Registration:**

1. Click "Get Started" → Register page
2. Fill in the form:
   - Name: Your name
   - Email: Your email
   - Password: At least 8 characters with letters and numbers
3. Click "Create account"
4. Check your email for verification code
5. Enter the 6-digit code to verify email
6. You'll be redirected to login

**Test User Login:**

1. Click "Login" → Login page
2. Enter your credentials
3. Click "Sign in"
4. You'll be redirected to dashboard

**Test Dashboard:**

Once logged in, explore:
- `/dashboard` - Main dashboard
- `/dashboard/dashboard-1` - Alternative layout
- `/dashboard/dashboard-2` - Another layout
- `/dashboard/settings` - Settings pages
- Click your avatar → Logout

### 🎉 Success!

Your template is now running! You can:
- ✅ Register and login users
- ✅ Access protected dashboard routes
- ✅ Use multiple dashboard layouts
- ✅ Send password reset emails
- ✅ Verify email addresses

### 🔧 Common Setup Issues

**Issue: "Module not found"**
```bash
Solution: Delete node_modules and reinstall
rm -rf node_modules
pnpm install
```

**Issue: "Convex not syncing"**
```bash
Solution: Restart Convex dev server
# Press Ctrl+C to stop
pnpm convex:dev
```

**Issue: "Email not sending"**
- Check Resend API key is correct
- Check FROM_EMAIL is verified in Resend
- Check spam folder
- Review Resend dashboard logs

**Issue: "Database not found"**
```bash
Solution: Seed the database
pnpm convex:dev
# In another terminal:
pnpm seed
```

### 📚 Next Steps

Now that your template is running, you can:

1. **Customize branding** - Edit logo, colors, text in `src/app/page.tsx`
2. **Add features** - Edit Convex functions in `convex/functions/`
3. **Customize UI** - Modify components in `src/components/ui/`
4. **Configure database** - Edit schema in `convex/schema.ts`
5. **Build for production** - Run `pnpm build && pnpm start`

### 🆘 Need Help?

- Check the [full documentation](#-project-structure) below
- Review the [scripts section](#-available-scripts)
- Run `pnpm test` to verify everything works
- Open an issue on GitHub for bugs

**Happy coding! 🎉**

## 📁 Project Structure

```
connext/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── (errors)/          # Error pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Context providers
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── auth/              # Auth forms
│   ├── lib/                   # Utilities
│   └── hooks/                 # Custom hooks
├── convex/
│   ├── functions/             # Convex backend functions
│   ├── schema.ts              # Database schema
│   └── _generated/            # Generated types
├── public/                    # Static assets
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start dev server at http://localhost:3000
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm format           # Check formatting with Prettier
pnpm format:fix       # Fix formatting issues
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues

# Testing
pnpm test             # Run Jest tests
pnpm test:watch       # Run tests in watch mode

# Convex
pnpm convex:dev       # Start Convex dev server
pnpm convex:deploy    # Deploy to Convex
pnpm seed             # Seed database with minimal data
pnpm seed:demo        # Seed database with demo data
```

## 🎨 Customization

### Styling
- **TailwindCSS v4**: Uses inline `@theme` directive in `src/app/globals.css`
- **Theme**: Edit CSS variables in `globals.css` for colors, fonts, etc.
- **Dark Mode**: Powered by next-themes

### Components
- All shadcn/ui components are in `src/components/ui/`
- Customize in `components.json` configuration
- Add new components: `npx shadcn-ui@latest add component-name`

### Database Schema
- Edit `convex/schema.ts` to modify database structure
- Run `pnpm convex:dev` to apply changes
- Types are automatically generated in `convex/_generated/`

## 🔐 Authentication

The template includes a complete authentication system:

- **Register**: Create account with email verification
- **Login**: Email/password authentication
- **Google OAuth**: Sign in with Google account (optional)
- **Password Reset**: Request reset via email
- **Email Verification**: 6-digit code via email
- **Session Management**: Client-side sessionStorage
- **Route Protection**: Client-side protected routes

### Security Features
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Input validation with Zod
- ✅ XSS prevention
- ✅ SQL injection prevention (Convex ORM)
- ✅ Timing attack prevention
- ✅ Buffer overflow protection
- ✅ Email verification required for login
- ✅ Expiring verification codes

## 🧪 Testing

Run the test suite:
```bash
pnpm test
```

The template includes 83+ passing tests covering:
- Authentication flows
- Security vulnerabilities
- Input validation
- Route protection
- Edge cases

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables from `.env.example`
3. **Deploy**
   - Vercel will auto-detect Next.js and deploy
   - Add Convex production deployment to env vars

### Other Platforms

**Netlify, Railway, Render, etc.**
- Build command: `pnpm build`
- Output directory: `.next`
- Add environment variables from `.env.example`

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) for the amazing component library
- [Radix UI](https://www.radix-ui.com) for accessible primitives
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [Convex](https://convex.dev) for the backend platform
- [Next.js](https://nextjs.org) for the React framework

## 📞 Support

- Create an [issue](https://github.com/yourusername/connext/issues) for bugs
- Check existing issues before creating new ones
- Follow issue templates when reporting

## 🗺️ Roadmap

- [ ] Add middleware for server-side auth
- [ ] Docker support
- [ ] More dashboard layouts
- [ ] i18n internationalization
- [ ] Unit tests for components
- [ ] E2E tests with Playwright
- [ ] GitHub Actions CI/CD

---

Made with ❤️ using Next.js and shadcn/ui
