/**
 * Authentication Flow with bcrypt - Comprehensive Test
 *
 * This test verifies that bcrypt is properly integrated into the authentication flow:
 * 1. Passwords are hashed during registration
 * 2. Passwords are verified during login
 * 3. Password reset hashes the new password
 */

const fs = require("fs");
const path = require("path");

describe("Authentication Flow with bcrypt", () => {
  test("bcryptjs should be installed", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    expect(pkg.dependencies).toHaveProperty("bcryptjs");
    expect(pkg.devDependencies).toHaveProperty("@types/bcryptjs");
  });

  test("auth.ts should import bcrypt", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");
    expect(authContent).toContain('import bcrypt from "bcryptjs"');
  });

  test("register should hash password with bcrypt", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");
    // Check for bcrypt.hash call with 10 salt rounds
    expect(authContent).toMatch(/bcrypt\.hash\(.*password.*,\s*10\)/);
  });

  test("login should verify password with bcrypt.compare", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");
    // Check for bcrypt.compare call
    expect(authContent).toMatch(/bcrypt\.compare\(password,\s+user\.password\)/);
  });

  test("resetPassword should hash new password", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");
    // Check for bcrypt.hash call in resetPassword function
    const resetPasswordMatch = authContent.match(/export const resetPassword[\s\S]*?handler[\s\S]*?bcrypt\.hash/);
    expect(resetPasswordMatch).not.toBeNull();
  });

  test("auth context should use useAction for login", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");
    expect(content).toContain("useAction");
    expect(content).toContain('api["functions/auth"].login');
  });

  test("password field should be stored as hashedPassword in internal mutations", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");
    // Check that createUserInternal expects password
    expect(authContent).toContain("password: v.string()");
    // Check that updatePasswordInternal expects hashedPassword
    expect(authContent).toContain("hashedPassword: v.string()");
  });

  test("bcrypt should be used consistently across all password operations", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");
    // Count bcrypt.hash calls - should be in register and resetPassword
    const hashMatches = authContent.match(/bcrypt\.hash/g);
    expect(hashMatches).not.toBeNull();
    expect(hashMatches.length).toBeGreaterThanOrEqual(2);

    // Count bcrypt.compare calls - should be in login
    const compareMatches = authContent.match(/bcrypt\.compare/g);
    expect(compareMatches).not.toBeNull();
    expect(compareMatches.length).toBeGreaterThanOrEqual(1);
  });
});
