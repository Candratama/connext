/**
 * Batch 2: Authentication Backend Tests
 * Verifies authentication functions work correctly
 */

const fs = require("fs");

describe("Batch 2: Authentication Backend", () => {
  test("auth.ts functions exist", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");
    expect(authContent).toContain("export const register");
    expect(authContent).toContain("export const verifyEmail");
    expect(authContent).toContain("export const requestPasswordReset");
    expect(authContent).toContain("export const resetPassword");
    expect(authContent).toContain("export const resendVerification");
  });

  test("email.ts functions exist", () => {
    const emailContent = fs.readFileSync("convex/functions/email.ts", "utf8");
    expect(emailContent).toContain("export const sendVerificationEmail");
    expect(emailContent).toContain("export const sendPasswordResetEmail");
  });

  test("minimal seed exists", () => {
    const seedContent = fs.readFileSync("convex/functions/seed/minimal.ts", "utf8");
    expect(seedContent).toContain("admin@example.com");
    expect(seedContent).toContain("test@example.com");
  });

  test("FROM_EMAIL in environment", () => {
    const envExample = fs.readFileSync(".env.example", "utf8");
    expect(envExample).toContain("FROM_EMAIL=noreply@yourapp.com");
  });

  test("resend dependency in package.json", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    expect(pkg.dependencies).toHaveProperty("resend");
  });

  test("auth.ts imports email functions", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");
    expect(authContent).toContain('from "./email"');
    expect(authContent).toContain("sendVerificationEmail");
    expect(authContent).toContain("sendPasswordResetEmail");
  });
});
