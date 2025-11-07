/**
 * Batch 1 Setup Verification Test
 * Verifies that all foundation components are in place
 */

describe("Batch 1: Foundation & Environment", () => {
  test("convex directory exists", () => {
    const fs = require("fs");
    expect(fs.existsSync("convex")).toBe(true);
    expect(fs.existsSync("convex/schema.ts")).toBe(true);
  });

  test("package.json has required scripts", () => {
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    expect(pkg.scripts["convex:dev"]).toBe("convex dev");
    expect(pkg.scripts["setup"]).toBeDefined();
  });

  test("environment files exist", () => {
    const fs = require("fs");
    expect(fs.existsSync(".env.example")).toBe(true);
    expect(fs.existsSync(".env.local")).toBe(true);
  });

  test("Convex client configuration exists", () => {
    const fs = require("fs");
    expect(fs.existsSync("src/lib/convex/client.ts")).toBe(true);
    expect(fs.existsSync("src/lib/convex/react.ts")).toBe(true);
  });

  test("development documentation exists", () => {
    const fs = require("fs");
    expect(fs.existsSync("docs/development.md")).toBe(true);
  });
});
