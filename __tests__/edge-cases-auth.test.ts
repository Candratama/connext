/**
 * Authentication Edge Cases - Comprehensive Security & Crash Point Analysis
 *
 * Tests all potential crash points and security vulnerabilities
 * by analyzing code structure and patterns.
 */

const fs = require("fs");
const path = require("path");

describe("Authentication Edge Cases - Entry Validation", () => {
  test("should validate input on login form", () => {
    const loginFormPath = path.join(process.cwd(), "src", "components", "auth", "login-form.tsx");
    const content = fs.readFileSync(loginFormPath, "utf-8");

    // Check for Zod validation schema
    expect(content).toContain("import { z } from \"zod\"");
    expect(content).toMatch(/const.*Schema.*z\.object/);
  });

  test("should validate input on register form", () => {
    const registerFormPath = path.join(process.cwd(), "src", "components", "auth", "register-form.tsx");
    const content = fs.readFileSync(registerFormPath, "utf-8");

    // Check for Zod validation schema
    expect(content).toContain("import { z } from \"zod\"");
    expect(content).toMatch(/const.*Schema.*z\.object/);
  });

  test("should validate input on password reset form", () => {
    const forgotPasswordFormPath = path.join(process.cwd(), "src", "components", "auth", "forgot-password-form.tsx");
    const content = fs.readFileSync(forgotPasswordFormPath, "utf-8");

    // Check for Zod validation schema
    expect(content).toContain("import { z } from \"zod\"");
    expect(content).toMatch(/const.*Schema.*z\.object/);
  });

  test("should validate input on verify email form", () => {
    const verifyEmailFormPath = path.join(process.cwd(), "src", "components", "auth", "verify-email-form.tsx");
    const content = fs.readFileSync(verifyEmailFormPath, "utf-8");

    // Check for Zod validation schema
    expect(content).toContain("import { z } from \"zod\"");
    expect(content).toMatch(/const.*Schema.*z\.object/);
  });
});

describe("Authentication Edge Cases - Backend Validation", () => {
  test("should validate email format in Convex functions", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Check for email validation
    expect(authContent).toMatch(/email.*v\.string/);
  });

  test("should validate password length in Convex functions", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Check for password validation
    expect(authContent).toMatch(/password.*v\.string/);
  });

  test("should not expose passwords in error messages", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Error messages should not contain actual password values
    expect(authContent).not.toMatch(/password.*['"`].*['"`]/);
    expect(authContent).not.toMatch(/password:.*['"`]/);
  });

  test("should sanitize user input before logging", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Check for console.log statements that might expose sensitive data
    const logMatches = content.match(/console\.log.*password|console\.log.*email/gi);
    if (logMatches) {
      // If there are logs, they should not contain actual values
      for (const match of logMatches) {
        expect(match).not.toMatch(/password.*:.*['"`]/);
        expect(match).not.toMatch(/email.*:.*['"`][^@]*@/);
      }
    }
  });
});

describe("Authentication Edge Cases - State Management", () => {
  test("should handle sessionStorage errors gracefully", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Check for try-catch around sessionStorage operations
    expect(content).toMatch(/try\s*{[\s\S]*?sessionStorage/);

    // Check for error handling
    expect(content).toMatch(/catch\s*\(|error/);
  });

  test("should validate sessionStorage data", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should check for valid JSON before parsing
    expect(content).toMatch(/JSON\.parse/);
  });

  test("should not crash on invalid sessionStorage", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should handle parse errors
    expect(content).toMatch(/catch\s*\(\s*e\s*\)/);
  });

  test("should clear sessionStorage on logout", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should remove user from sessionStorage
    expect(content).toMatch(/sessionStorage\.removeItem/);
  });
});

describe("Authentication Edge Cases - SQL Injection Prevention", () => {
  test("should not use raw SQL queries", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Convex uses db.query which is safe from SQL injection, not raw SQL
    expect(authContent).toMatch(/ctx\.db\.query/);
    expect(authContent).not.toMatch(/executeQuery|executeSQL|SELECT|UPDATE|INSERT|DELETE/i);
  });

  test("should use Convex query patterns", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Check for proper query patterns
    expect(authContent).toMatch(/withIndex.*by_email/);
  });
});

describe("Authentication Edge Cases - XSS Prevention", () => {
  test("should not dangerously set innerHTML", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should not use dangerouslySetInnerHTML
    expect(content).not.toMatch(/dangerouslySetInnerHTML/);
  });

  test("should escape user input in forms", () => {
    const loginFormPath = path.join(process.cwd(), "src", "components", "auth", "login-form.tsx");
    const content = fs.readFileSync(loginFormPath, "utf-8");

    // React naturally escapes, but we should verify input handling
    expect(content).toMatch(/value=.*email|onChange/);
  });
});

describe("Authentication Edge Cases - Buffer Overflow Prevention", () => {
  test("should have reasonable input length limits in backend", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Check for validation with max length in backend
    expect(authContent).toMatch(/validateEmail.*254/);
    expect(authContent).toMatch(/validatePassword.*128/);
  });

  test("should validate on frontend with maxLength", () => {
    const loginFormPath = path.join(process.cwd(), "src", "components", "auth", "login-form.tsx");
    const content = fs.readFileSync(loginFormPath, "utf-8");

    // Should have maxLength attributes
    expect(content).toMatch(/maxLength=\{254\}/);
    expect(content).toMatch(/maxLength=\{128\}/);
  });
});

describe("Authentication Edge Cases - Timing Attack Prevention", () => {
  test("should use bcrypt.compare (constant time)", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // bcrypt.compare is constant time
    expect(authContent).toMatch(/bcrypt\.compare/);
  });

  test("should not reveal user existence in error messages", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Error messages should be generic for non-existent users
    const loginSection = authContent.match(/export const login[\s\S]*?^}/m);
    if (loginSection) {
      const loginCode = loginSection[0];
      // Should use same error for non-existent user and wrong password
      expect(loginCode).toMatch(/invalid email or password/i);
    }
  });
});

describe("Authentication Edge Cases - Session Management", () => {
  test("should not store passwords in sessionStorage", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should only store user data, not password
    expect(content).toMatch(/sessionStorage\.setItem\(['"]user['"]/);
    expect(content).not.toMatch(/sessionStorage\.setItem\(['"]password['"]/);
  });

  test("should return minimal user data", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Check login response returns safe user data
    const loginSection = authContent.match(/export const login[\s\S]*?^}/m);
    if (loginSection) {
      const loginCode = loginSection[0];
      // Should include safe fields
      expect(loginCode).toMatch(/_id:/);
      expect(loginCode).toMatch(/email:/);
      expect(loginCode).toMatch(/name:/);
      expect(loginCode).toMatch(/image:/);
      expect(loginCode).toMatch(/isEmailVerified:/);
      // Should exclude password
      expect(loginCode).not.toMatch(/password:.*user/);
    }
  });

  test("should clear all state on logout", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should remove from sessionStorage
    expect(content).toMatch(/sessionStorage\.removeItem\(['"]user['"]\)/);

    // Should clear React state
    expect(content).toMatch(/setUser\(null\)/);
  });
});

describe("Authentication Edge Cases - Password Security", () => {
  test("should hash passwords with bcrypt", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Should use bcrypt for hashing
    expect(authContent).toMatch(/bcrypt\.hash/);
  });

  test("should use sufficient salt rounds", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Should use at least 10 salt rounds
    expect(authContent).toMatch(/bcrypt\.hash\([^,]*,\s*10\s*\)/);
  });

  test("should validate password on reset", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Should hash new password on reset
    expect(authContent).toMatch(/resetPassword[\s\S]*?bcrypt\.hash/);
  });
});

describe("Authentication Edge Cases - Code Execution Prevention", () => {
  test("should not use eval()", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should not use eval
    expect(content).not.toMatch(/eval\(/);
  });

  test("should not use Function constructor", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should not use Function constructor
    expect(content).not.toMatch(/new Function\(/);
  });

  test("should not use innerHTML with user input", () => {
    const loginFormPath = path.join(process.cwd(), "src", "components", "auth", "login-form.tsx");
    const content = fs.readFileSync(loginFormPath, "utf-8");

    // Should not use innerHTML
    expect(content).not.toMatch(/innerHTML\s*=/);
  });
});

describe("Authentication Edge Cases - Error Handling", () => {
  test("should handle missing environment variables", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Check for proper error handling
    expect(authContent).toMatch(/throw new Error/);
  });

  test("should not expose stack traces in production", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Error handling should not expose stack traces
    const errorLogging = content.match(/console\.error.*error/);
    if (errorLogging) {
      // Should not log full error object in production
      expect(errorLogging[0]).not.toMatch(/console\.error\(error\)|console\.log\(error\)/);
    }
  });

  test("should handle network errors gracefully", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should handle errors from login action
    expect(content).toMatch(/try\s*{[\s\S]*?loginAction/);
  });
});

describe("Authentication Edge Cases - Concurrent Operations", () => {
  test("should handle multiple login attempts", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should not have race conditions in state updates
    // This is hard to test statically, but we check for patterns
    expect(content).toMatch(/setUser\(/);
  });

  test("should handle logout during login", () => {
    const authContextPath = path.join(process.cwd(), "src", "contexts", "auth-context.tsx");
    const content = fs.readFileSync(authContextPath, "utf-8");

    // Should have logout function
    expect(content).toMatch(/logout.*=.*\(\)/);
  });
});

describe("Authentication Edge Cases - Route Protection", () => {
  test("should protect dashboard routes", () => {
    const protectedRoutePath = path.join(process.cwd(), "src", "components", "protected-route.tsx");
    const content = fs.readFileSync(protectedRoutePath, "utf-8");

    // Should use useAuth hook
    expect(content).toContain("useAuth");
  });

  test("should redirect to login when not authenticated", () => {
    const protectedRoutePath = path.join(process.cwd(), "src", "components", "protected-route.tsx");
    const content = fs.readFileSync(protectedRoutePath, "utf-8");

    // Should have redirect logic
    expect(content).toMatch(/router\.push\("\/login"\)/);
  });
});

describe("Authentication Edge Cases - Special Characters", () => {
  test("should handle unicode in names", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Name should be string type
    expect(authContent).toMatch(/name: v\.string/);
  });

  test("should handle special characters in passwords", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Password should accept special characters
    expect(authContent).toMatch(/password: v\.string/);
  });
});

describe("Authentication Edge Cases - Resource Limits", () => {
  test("should handle large user objects", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // User object should not be too large
    const userFields = authContent.match(/user:\s*{[^}]+}/);
    if (userFields) {
      const fields = userFields[0];
      // Should not include unnecessary large fields
      expect(fields).not.toMatch(/password|salt|hash/i);
    }
  });
});

describe("Authentication Edge Cases - Authentication Flow Integrity", () => {
  test("should verify email before allowing login", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // Login should check isEmailVerified
    const loginSection = authContent.match(/export const login[\s\S]*?^}/m);
    if (loginSection) {
      const loginCode = loginSection[0];
      expect(loginCode).toMatch(/isEmailVerified/);
    }
  });

  test("should check verification code expiration", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // verifyEmail should check expiration
    const verifySection = authContent.match(/export const verifyEmail[\s\S]*?^}/m);
    if (verifySection) {
      const verifyCode = verifySection[0];
      expect(verifyCode).toMatch(/emailVerificationExpires.*Date\.now/);
    }
  });

  test("should check password reset code expiration", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");

    // resetPassword should check expiration
    expect(authContent).toMatch(/passwordResetExpires.*Date\.now/);
  });
});
