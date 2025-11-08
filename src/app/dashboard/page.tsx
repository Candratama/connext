import { redirect } from "next/navigation";

/**
 * Main Dashboard Page
 *
 * Redirects to the default dashboard layout (dashboard-1)
 * This ensures /dashboard is accessible after login.
 */
export default function Dashboard() {
  // Redirect to the default dashboard layout
  redirect("/dashboard-1");
}
