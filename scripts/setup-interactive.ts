#!/usr/bin/env node

import readline from "readline";
import fs from "fs";
import path from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const questions = [
  {
    key: "NEXT_PUBLIC_APP_URL",
    question: "Enter your app URL (default: http://localhost:3000): ",
    default: "http://localhost:3000",
  },
  {
    key: "CONVEX_DEPLOYMENT",
    question: "Enter your Convex deployment URL (from convex.dev dashboard): ",
    required: true,
  },
  {
    key: "RESEND_API_KEY",
    question: "Enter your Resend API key (from resend.com): ",
    required: true,
  },
  {
    key: "FROM_EMAIL",
    question: "Enter sender email (e.g., noreply@yourdomain.com): ",
    required: true,
  },
  {
    key: "GOOGLE_CLIENT_ID",
    question: "Enter your Google Client ID (from console.cloud.google.com): ",
    required: false,
  },
  {
    key: "GOOGLE_CLIENT_SECRET",
    question: "Enter your Google Client Secret (optional): ",
    required: false,
  },
];

console.log("\n🚀 Connext Admin Template - Interactive Setup\n");
console.log("This script will help you configure your environment variables.\n");
console.log("Make sure you have:");
console.log("✓ Convex account (convex.dev)");
console.log("✓ Resend account (resend.com)\n");

const answers: Record<string, string> = {};

async function askQuestion(q: typeof questions[0]): Promise<void> {
  return new Promise((resolve) => {
    const prompt = q.default && !q.required 
      ? `${q.question}` 
      : q.question;
    
    rl.question(prompt, (answer) => {
      const value = answer.trim() || q.default || "";
      
      if (q.required && !value) {
        console.log("⚠️  This field is required. Please try again.\n");
        askQuestion(q).then(resolve);
      } else {
        answers[q.key] = value;
        resolve();
      }
    });
  });
}

async function main() {
  for (const question of questions) {
    await askQuestion(question);
  }

  console.log("\n📝 Generating .env.local file...\n");

  const envContent = `# Connext Admin Template - Environment Configuration
# Generated on ${new Date().toISOString()}

NEXT_PUBLIC_APP_URL=${answers.NEXT_PUBLIC_APP_URL}
CONVEX_DEPLOYMENT=${answers.CONVEX_DEPLOYMENT}
RESEND_API_KEY=${answers.RESEND_API_KEY}
FROM_EMAIL=${answers.FROM_EMAIL}
GOOGLE_CLIENT_ID=${answers.GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${answers.GOOGLE_CLIENT_SECRET}
NEXT_PUBLIC_GOOGLE_CLIENT_ID=${answers.GOOGLE_CLIENT_ID}
NODE_ENV=development
`;

  const envPath = path.join(process.cwd(), ".env.local");
  fs.writeFileSync(envPath, envContent);

  console.log("✅ Created .env.local file");
  console.log("\n📦 Next steps:\n");
  console.log("1. Install dependencies:");
  console.log("   pnpm install\n");
  console.log("2. Start Convex dev server:");
  console.log("   pnpm convex:dev\n");
  console.log("3. In a new terminal, start the Next.js dev server:");
  console.log("   pnpm dev\n");
  console.log("4. Open http://localhost:3000 in your browser\n");
  console.log("🎉 Setup complete! Happy coding!\n");

  rl.close();
}

main().catch((error) => {
  console.error("❌ Error during setup:", error);
  rl.close();
  process.exit(1);
});
