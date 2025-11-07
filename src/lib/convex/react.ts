import { ConvexHttpClient } from "convex/browser"
import { ConvexReactClient } from "convex/react"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Set it in .env.local")
}

/**
 * Convex client for React
 * This is what you use in your components with React Query-like hooks
 *
 * @example
 * import { useQuery } from "convex/react"
 * import { api } from "../convex/generated/api"
 *
 * const MyComponent = () => {
 *   const data = useQuery(api.myQueryFunction)
 *   return <div>{data}</div>
 * }
 */
export const convexClient = new ConvexReactClient(convexUrl)

/**
 * HTTP client for server-side usage
 * Use this in API routes or server components
 *
 * @example
 * import { convexHttpClient } from "@/lib/convex/react"
 * const result = await convexHttpClient.query(api.myQuery)
 */
export const convexHttpClient = new ConvexHttpClient(convexUrl)
