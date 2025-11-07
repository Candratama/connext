import { ConvexReactClient } from "convex/react";
import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL. Set it in .env.local"
  );
}

/**
 * Convex client for React
 * This is what you use in your components
 */
export const convexClient = new ConvexReactClient(convexUrl);

/**
 * HTTP client for server-side usage
 */
export const convexHttpClient = new ConvexHttpClient(convexUrl);
