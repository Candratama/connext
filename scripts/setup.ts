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
