/**
 * Batch 3: Authentication Frontend - Verification Test
 *
 * This test verifies that all frontend authentication components,
 * pages, and context providers have been created correctly.
 */

import { describe, test, expect, beforeAll } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";

describe("Batch 3: Authentication Frontend", () => {
  const basePath = path.join(process.cwd(), "src");

  describe("Auth Context & Providers", () => {
    test("AuthContext should exist and export AuthProvider and useAuth", () => {
      const authContextPath = path.join(basePath, "contexts", "auth-context.tsx");
      expect(fs.existsSync(authContextPath)).toBe(true);

      const content = fs.readFileSync(authContextPath, "utf-8");
      expect(content).toContain("AuthProvider");
      expect(content).toContain("useAuth");
    });

    test("Providers should include AuthProvider", () => {
      const providersPath = path.join(basePath, "app", "providers.tsx");
      const content = fs.readFileSync(providersPath, "utf-8");
      expect(content).toContain("AuthProvider");
    });
  });

  describe("Auth Pages", () => {
    const authPages = [
      { dir: "login", file: "page.tsx", component: "LoginForm" },
      { dir: "register", file: "page.tsx", component: "RegisterForm" },
      { dir: "verify-email", file: "page.tsx", component: "VerifyEmailForm" },
      { dir: "forgot-password", file: "page.tsx", component: "ForgotPasswordForm" },
      { dir: "verify-reset", file: "page.tsx", component: "PasswordResetForm" },
    ];

    authPages.forEach(({ dir, file, component }) => {
      test(`${dir} page should exist`, () => {
        const pagePath = path.join(
          basePath,
          "app",
          "(auth)",
          dir,
          file
        );
        expect(fs.existsSync(pagePath)).toBe(true);
      });

      test(`${dir} form component should exist`, () => {
        const componentPath = path.join(
          basePath,
          "components",
          "auth",
          `${dir.replace("-", "-")}-form.tsx`
        );
        const expectedComponentFile =
          dir === "verify-reset"
            ? "password-reset-form.tsx"
            : `${dir.replace("-", "-")}-form.tsx`;

        const fullPath = path.join(
          basePath,
          "components",
          "auth",
          expectedComponentFile
        );
        expect(fs.existsSync(fullPath)).toBe(true);

        const content = fs.readFileSync(fullPath, "utf-8");
        expect(content).toContain(component);
      });
    });
  });

  describe("Auth Components", () => {
    const componentsWithApi = [
      "register-form.tsx",
      "verify-email-form.tsx",
      "forgot-password-form.tsx",
      "password-reset-form.tsx",
    ];

    componentsWithApi.forEach((component) => {
      test(`${component} should import Convex API`, () => {
        const componentPath = path.join(
          basePath,
          "components",
          "auth",
          component
        );
        expect(fs.existsSync(componentPath)).toBe(true);

        const content = fs.readFileSync(componentPath, "utf-8");
        expect(content).toContain("@/convex/generated/api.js");
      });
    });

    test("login-form.tsx should use useAuth context instead of direct API", () => {
      const componentPath = path.join(
        basePath,
        "components",
        "auth",
        "login-form.tsx"
      );
      const content = fs.readFileSync(componentPath, "utf-8");
      expect(content).toContain("useAuth");
      expect(content).toContain("login");
    });
  });

  describe("Route Protection", () => {
    test("ProtectedRoute component should exist", () => {
      const protectedRoutePath = path.join(
        basePath,
        "components",
        "protected-route.tsx"
      );
      expect(fs.existsSync(protectedRoutePath)).toBe(true);

      const content = fs.readFileSync(protectedRoutePath, "utf-8");
      expect(content).toContain("ProtectedRoute");
      expect(content).toContain("useAuth");
    });

    test("Dashboard layout should use ProtectedRoute", () => {
      const layoutPath = path.join(
        basePath,
        "app",
        "(dashboard)",
        "layout.tsx"
      );
      const content = fs.readFileSync(layoutPath, "utf-8");
      expect(content).toContain("ProtectedRoute");
    });
  });

  describe("Convex Integration", () => {
    test("Convex client should be configured", () => {
      const clientPath = path.join(basePath, "lib", "convex", "client.ts");
      expect(fs.existsSync(clientPath)).toBe(true);

      const content = fs.readFileSync(clientPath, "utf-8");
      expect(content).toContain("ConvexHttpClient");
      expect(content).toContain("NEXT_PUBLIC_CONVEX_URL");
    });

    test("Convex React hooks should be configured", () => {
      const reactPath = path.join(basePath, "lib", "convex", "react.ts");
      expect(fs.existsSync(reactPath)).toBe(true);
    });

    test("Generated API file should exist (manual or from codegen)", () => {
      const apiPath = path.join("convex", "_generated", "api.js");
      expect(fs.existsSync(apiPath)).toBe(true);

      const content = fs.readFileSync(apiPath, "utf-8");
      expect(content).toContain("export const api");
    });
  });

  describe("Auth Flow Integration", () => {
    test("RegisterForm should use register mutation", () => {
      const registerFormPath = path.join(
        basePath,
        "components",
        "auth",
        "register-form.tsx"
      );
      const content = fs.readFileSync(registerFormPath, "utf-8");
      expect(content).toContain("api.auth.register");
    });

    test("VerifyEmailForm should use verifyEmail mutation", () => {
      const verifyFormPath = path.join(
        basePath,
        "components",
        "auth",
        "verify-email-form.tsx"
      );
      const content = fs.readFileSync(verifyFormPath, "utf-8");
      expect(content).toContain("api.auth.verifyEmail");
    });

    test("ForgotPasswordForm should use requestPasswordReset mutation", () => {
      const forgotFormPath = path.join(
        basePath,
        "components",
        "auth",
        "forgot-password-form.tsx"
      );
      const content = fs.readFileSync(forgotFormPath, "utf-8");
      expect(content).toContain("api.auth.requestPasswordReset");
    });

    test("PasswordResetForm should use resetPassword mutation", () => {
      const resetFormPath = path.join(
        basePath,
        "components",
        "auth",
        "password-reset-form.tsx"
      );
      const content = fs.readFileSync(resetFormPath, "utf-8");
      expect(content).toContain("api.auth.resetPassword");
    });
  });

  describe("OAuth Configuration", () => {
    test("Login form should support optional OAuth", () => {
      const loginFormPath = path.join(
        basePath,
        "components",
        "auth",
        "login-form.tsx"
      );
      const content = fs.readFileSync(loginFormPath, "utf-8");
      // Should have conditional rendering based on NEXT_PUBLIC_ENABLE_OAUTH
      expect(content).toMatch(/NEXT_PUBLIC_ENABLE_OAUTH|process\.env/);
    });
  });
});
