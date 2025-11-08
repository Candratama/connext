"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-4">
      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
        <code>{code}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute right-2 top-2 rounded bg-gray-800 p-2 text-gray-400 hover:text-white"
        aria-label="Copy code"
      >
        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img
              src="/shadcnblocks-admin-logo.svg"
              alt="Connext Admin Template"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">Connext Admin Template</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Professional Admin Template
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
              Built with Next.js 16, React 19, TailwindCSS v4, and shadcn/ui. 
              Production-ready authentication, multiple dashboard layouts, and 
              comprehensive UI components.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Start Building</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Getting Started Section */}
        <section className="bg-gray-50 dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Get Started in Minutes
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Follow these simple steps to have your admin template running in under 10 minutes
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold">Clone & Install</h3>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Clone the repository and install dependencies
                </p>
                <CodeBlock
                  code={`git clone <your-repo>
cd connext
pnpm install`}
                />
                <div className="mt-3 text-xs text-gray-500">
                  <Link href="https://github.com" className="text-blue-600 hover:underline">
                    Need help cloning? →
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold">Setup Services</h3>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Configure Convex (backend) and Resend (email)
                </p>
                <CodeBlock
                  code={`# Interactive setup
pnpm setup

# Or configure manually
cp .env.example .env.local
# Edit .env.local with your keys`}
                />
                <div className="mt-3 text-xs text-gray-500">
                  <Link href="https://convex.dev" className="text-blue-600 hover:underline mr-3">
                    Convex →
                  </Link>
                  <Link href="https://resend.com" className="text-blue-600 hover:underline">
                    Resend →
                  </Link>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold">Run & Build</h3>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Start the development servers and open your browser
                </p>
                <CodeBlock
                  code={`# Terminal 1 - Convex
pnpm convex:dev

# Terminal 2 - Next.js
pnpm dev

# Open http://localhost:3000`}
                />
                <div className="mt-3 text-xs text-gray-500">
                  <Link href="https://nextjs.org" className="text-blue-600 hover:underline">
                    Next.js Docs →
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="https://github.com/yourusername/connext#-getting-started" target="_blank">
                <Button size="lg" variant="outline">
                  View Full Documentation
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold">Authentication</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Secure email/password auth with email verification, password reset,
                and session management included.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold">Dashboard Layouts</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Multiple pre-built dashboard layouts with sidebar, tabs, and 
                responsive design.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold">UI Components</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                36+ shadcn/ui components built on Radix UI primitives for 
                accessibility and customization.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2024 Connext Admin Template. Built with ❤️ using Next.js and shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  );
}
