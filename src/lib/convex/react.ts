import { ConvexReactClient } from "convex/react";
import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

/**
 * Convex client for React
 * This is what you use in your components
 */
export const convexClient = new ConvexReactClient(convexUrl);

/**
 * HTTP client for server-side usage
 */
export const convexHttpClient = new ConvexHttpClient(convexUrl);
