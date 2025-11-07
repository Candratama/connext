import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL. Set it in .env.local"
  );
}

/**
 * Convex HTTP client for the browser
 * Used for direct API calls if needed
 */
export const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL
);
