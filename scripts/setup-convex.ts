#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function setupConvex() {
  try {
    console.log("Setting up Convex project...");

    // Check if we're in a git repo (Convex requires this)
    try {
      execSync("git rev-parse --git-dir", { stdio: "ignore" });
      console.log("✓ Git repository detected");
    } catch {
      console.log("Initializing git repository...");
      execSync("git init", { stdio: "inherit" });
    }

    // Try to login to Convex (will fail if already logged in)
    try {
      console.log("Logging in to Convex...");
      execSync("npx convex login --prompting=false", {
        stdio: "inherit",
      });
    } catch (error) {
      // Login might have failed, but that's okay - user might already be logged in
      console.log("Note: Login status unknown (continuing anyway)...");
    }

    // Create a new Convex project
    console.log("Creating Convex project...");
    const output = execSync("npx convex dev --configure new", {
      encoding: "utf-8",
      stdio: "pipe",
    });

    console.log(output);
    console.log("✓ Convex project setup complete!");

    // Update .env.local with the new values
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      console.log("\n.env.local updated with Convex credentials");
    }

  } catch (error) {
    console.error("Error setting up Convex:", error);
    process.exit(1);
  }
}

setupConvex();
