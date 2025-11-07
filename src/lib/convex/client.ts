import { ConvexHttpClient } from "convex/browser"

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Set it in .env.local")
}

/**
 * Convex HTTP client for the browser
 * Used for direct API calls if needed
 *
 * @example
 * import { convex } from "@/lib/convex/client"
 * const result = await convex.query(myQuery)
 */
export const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)
