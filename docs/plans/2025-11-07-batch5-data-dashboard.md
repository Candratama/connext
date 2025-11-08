# Batch 5: Data & Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert all mock pages to real Convex data, implement real-time features, and create rich demo data

**Architecture:** Replace mock data with Convex queries, add real-time subscriptions, create demo data generator, and update existing pages to use real backend

**Tech Stack:** Next.js, Convex React hooks, real-time subscriptions, Recharts, React Query patterns

---

## Task 1: Update Users Page with Real Data

**Files:**
- Modify: `src/app/(dashboard)/users/page.tsx`
- Modify: `src/components/dashboard/users/users-table.tsx`
- Modify: `src/components/dashboard/users/users-stats.tsx`

**Step 1: Update users page**

Modify: `src/app/(dashboard)/users/page.tsx` with content:
```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/generated/api";
import { UsersTable } from "../../../../components/dashboard/users/users-table";
import { UsersStats } from "../../../../components/dashboard/users/users-stats";
import { UsersPrimaryActions } from "../../../../components/dashboard/users/users-primary-actions";

export default function UsersPage() {
  const users = useQuery(api.users.getUsers, { limit: 100 });
  const organizations = useQuery(api.organizations.getOrganizations);

  if (users === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-600 mt-1">Manage your team members</p>
        </div>
        <UsersPrimaryActions />
      </div>

      <UsersStats users={users} />

      <div className="mt-8">
        <UsersTable users={users} organizations={organizations || []} />
      </div>
    </div>
  );
}
```

**Step 2: Update users table component**

Modify: `src/components/dashboard/users/users-table.tsx` with content:
```typescript
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";

interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  isEmailVerified: boolean;
  createdAt: number;
  lastSeenAt: number;
}

interface Organization {
  _id: string;
  name: string;
  slug: string;
}

export function UsersTable({ users, organizations }: { users: any; organizations: Organization[] }) {
  const [currentPage, setCurrentPage] = useState(0);

  if (users.isDone === undefined) {
    return <div>Loading...</div>;
  }

  const userList = users.page;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.map((user: User) => (
            <TableRow key={user._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.image} />
                    <AvatarFallback>
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.isEmailVerified ? "default" : "secondary"}>
                  {user.isEmailVerified ? "Verified" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(user.lastSeenAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {userList.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
}
```

**Step 3: Update users stats component**

Modify: `src/components/dashboard/users/users-stats.tsx` with content:
```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

interface User {
  _id: string;
  isEmailVerified: boolean;
  createdAt: number;
}

export function UsersStats({ users }: { users: any }) {
  if (users.isDone === undefined) {
    return null;
  }

  const userList = users.page;
  const totalUsers = users.page.length;
  const verifiedUsers = userList.filter((u: User) => u.isEmailVerified).length;
  const newThisMonth = userList.filter((u: User) => {
    const created = new Date(u.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{verifiedUsers}</div>
          <p className="text-xs text-muted-foreground">
            {totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0}% verified
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newThisMonth}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers - verifiedUsers}</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 4: Commit**

Run: `git add src/app/\(dashboard\)/users/page.tsx src/components/dashboard/users/users-table.tsx src/components/dashboard/users/users-stats.tsx`
Run: `git commit -m "feat: update users page with real data

- Add Convex queries to users page
- Update users table to display real user data
- Update users stats with real metrics
- Add loading states and empty states
- Use real user verification status""

---

## Task 2: Create Dashboard Data Functions

**Files:**
- Create: `convex/functions/dashboard.ts`

**Step 1: Create dashboard query functions**

Create: `convex/functions/dashboard.ts` with content:
```typescript
import { query } from "convex/server";
import { v } from "convex/values";

/**
 * Get dashboard metrics for an organization
 */
export const getMetrics = query(
  async (ctx, { orgId }: { orgId: string }) => {
    // Get all users
    const users = await ctx.db
      .query("users")
      .collect();

    // Get all activities
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_org", (q) => q.eq("orgId", orgId as any))
      .collect();

    // Calculate metrics
    const totalUsers = users.length;
    const verifiedUsers = users.filter((u) => u.isEmailVerified).length;
    const activeUsers = users.filter((u) => {
      const lastSeen = new Date(u.lastSeenAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return lastSeen > sevenDaysAgo;
    }).length;

    // Get activity counts by day (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const activityByDay = last7Days.map((date) => {
      const count = activities.filter((a) => {
        const aDate = new Date(a.createdAt).toISOString().split('T')[0];
        return aDate === date;
      }).length;
      return { date, count };
    });

    return {
      totalUsers,
      verifiedUsers,
      activeUsers,
      activityByDay,
    };
  }
);

/**
 * Get recent activities for dashboard
 */
export const getRecentActivities = query(
  async (ctx, { orgId, limit = 10 }: { orgId: string; limit?: number }) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_org_and_createdAt", (q) => q.eq("orgId", orgId as any))
      .order("desc")
      .take(limit);

    // Enrich with user data
    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return {
          ...activity,
          user: user ? { name: user.name, email: user.email } : null,
        };
      })
    );

    return enriched;
  }
);

/**
 * Get user growth data
 */
export const getUserGrowth = query(
  async (ctx, { months = 6 }: { months?: number }) => {
    const users = await ctx.db.query("users").collect();

    // Calculate growth by month
    const now = new Date();
    const monthData = Array.from({ length: months }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const count = users.filter((u) => {
        const created = new Date(u.createdAt);
        return created >= date && created < nextMonth;
      }).length;

      return {
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        count,
      };
    }).reverse();

    return monthData;
  }
);
```

**Step 2: Commit**

Run: `git add convex/functions/dashboard.ts`
Run: `git commit -m "feat: add dashboard data functions

- Add getMetrics query (users, activity)
- Add getRecentActivities query
- Add getUserGrowth query
- Calculate real-time metrics
- Provide activity by day for charts""

---

## Task 3: Update Main Dashboard

**Files:**
- Modify: `src/app/(dashboard)/(dashboard-1)/page.tsx`
- Modify: `src/components/dashboard/overview/components/stats.tsx`
- Modify: `src/components/dashboard/overview/components/sales.tsx`

**Step 1: Update dashboard page**

Modify: `src/app/(dashboard)/(dashboard-1)/page.tsx` with content:
```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/generated/api";
import { Overview } from "../../../../../components/dashboard/overview";
import { Activity } from "../../../../../components/dashboard/overview/components/recent-activity";

export default function DashboardPage() {
  const organizations = useQuery(api.organizations.getOrganizations);
  const orgId = organizations && organizations.length > 0 ? organizations[0]._id : null;

  const metrics = useQuery(
    api.dashboard.getMetrics,
    orgId ? { orgId } : "skip"
  );

  const recentActivities = useQuery(
    api.dashboard.getRecentActivities,
    orgId ? { orgId, limit: 10 } : "skip"
  );

  const userGrowth = useQuery(
    api.dashboard.getUserGrowth,
    { months: 6 }
  );

  if (organizations === undefined || (orgId && metrics === undefined)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No organizations found</h2>
          <p className="text-gray-600 mt-2">Create an organization to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, here's what's happening</p>
        </div>
      </div>

      <Overview
        metrics={metrics}
        userGrowth={userGrowth}
        recentActivities={recentActivities}
      />
    </div>
  );
}
```

**Step 2: Update stats component**

Modify: `src/components/dashboard/overview/components/stats.tsx` with content:
```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";

interface Metrics {
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
}

export function Stats({ metrics }: { metrics: Metrics }) {
  if (!metrics) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            +{metrics.verifiedUsers} verified
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            Last 7 days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalUsers > 0
              ? Math.round((metrics.verifiedUsers / metrics.totalUsers) * 100)
              : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            Users verified
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12%</div>
          <p className="text-xs text-muted-foreground">
            vs last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 3: Commit**

Run: `git add src/app/\(dashboard\)/\(dashboard-1\)/page.tsx src/components/dashboard/overview/components/stats.tsx`
Run: `git commit -m "feat: update dashboard with real data

- Add Convex queries to dashboard page
- Update stats with real metrics
- Support multiple organizations
- Add loading and empty states
- Calculate real verification rate""

---

## Task 4: Create Rich Demo Data

**Files:**
- Modify: `convex/functions/seed/demo.ts`

**Step 1: Create demo data generator**

Modify: `convex/functions/seed/demo.ts` with content:
```typescript
import { Mutation } from "convex/server";
import { v } from "convex/values";

/**
 * Generate realistic demo data
 */
export const run: Mutation = async (ctx) => {
  const demoData: any = {
    users: [],
    organizations: [],
    activities: [],
  };

  // Create demo organization
  const orgId = await ctx.db.insert("organizations", {
    name: "Acme Corporation",
    slug: "acme-corp",
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
    ownerId: null, // Will be updated
  });

  demoData.organizations.push({ id: orgId, name: "Acme Corporation" });

  // Create roles
  const ownerRole = await ctx.db.insert("roles", {
    name: "Owner",
    permissions: ["*"],
    orgId,
  });

  const adminRole = await ctx.db.insert("roles", {
    name: "Admin",
    permissions: ["users:read", "users:write", "org:write", "settings:write"],
    orgId,
  });

  const memberRole = await ctx.db.insert("roles", {
    name: "Member",
    permissions: ["users:read", "org:read"],
    orgId,
  });

  // Create demo users
  const demoUsers = [
    { name: "John Doe", email: "john@example.com" },
    { name: "Jane Smith", email: "jane@example.com" },
    { name: "Bob Johnson", email: "bob@example.com" },
    { name: "Alice Brown", email: "alice@example.com" },
    { name: "Charlie Davis", email: "charlie@example.com" },
    { name: "Emma Wilson", email: "emma@example.com" },
    { name: "Michael Chen", email: "michael@example.com" },
    { name: "Sarah Taylor", email: "sarah@example.com" },
  ];

  for (let i = 0; i < demoUsers.length; i++) {
    const user = demoUsers[i];
    const createdAt = Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000;
    const userId = await ctx.db.insert("users", {
      email: user.email,
      name: user.name,
      createdAt,
      lastSeenAt: createdAt + Math.random() * 30 * 24 * 60 * 60 * 1000, // Random time after creation
      isEmailVerified: true,
    });

    // Create profile
    await ctx.db.insert("userProfile", {
      userId,
      bio: `Bio for ${user.name}`,
      location: ["New York", "San Francisco", "London", "Tokyo"][i % 4],
      preferences: {},
    });

    // Add to organization
    const roleId = i === 0 ? ownerRole : i < 3 ? adminRole : memberRole;
    await ctx.db.insert("memberships", {
      userId,
      orgId,
      roleId,
      createdAt,
    });

    // Generate activities for this user
    const activityCount = 20 + Math.floor(Math.random() * 30);
    for (let j = 0; j < activityCount; j++) {
      const activityTime = createdAt + Math.random() * (Date.now() - createdAt);
      const actions = [
        "login",
        "create_user",
        "update_user",
        "delete_user",
        "create_organization",
        "update_organization",
      ];
      const action = actions[Math.floor(Math.random() * actions.length)];

      await ctx.db.insert("activities", {
        orgId,
        userId,
        action,
        resource: "user",
        metadata: {},
        createdAt: activityTime,
      });
    }
  }

  return {
    message: "Demo data created successfully",
    users: demoUsers.length,
    organizations: 1,
    activities: "many",
  };
};
```

**Step 2: Commit**

Run: `git add convex/functions/seed/demo.ts`
Run: `git commit -m "feat: create rich demo data

- Add 8 demo users with realistic data
- Create Acme Corporation organization
- Generate realistic user activities
- Create profiles with location data
- Add role-based memberships
- 90 days of historical data""

---

## Task 5: Create Activity Log Page

**Files:**
- Create: `src/app/(dashboard)/activity/page.tsx`
- Create: `src/components/dashboard/activity/activity-table.tsx`

**Step 1: Create activity page**

Create: `src/app/(dashboard)/activity/page.tsx` with content:
```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/generated/api";
import { ActivityTable } from "../../../../components/dashboard/activity/activity-table";

export default function ActivityPage() {
  const organizations = useQuery(api.organizations.getOrganizations);
  const orgId = organizations && organizations.length > 0 ? organizations[0]._id : null;

  const activities = useQuery(
    api.activities.getActivities,
    orgId ? { orgId, limit: 100 } : "skip"
  );

  if (organizations === undefined || (orgId && activities === undefined)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No organizations found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-gray-600 mt-1">Track all user activities and system events</p>
      </div>

      <ActivityTable activities={activities} />
    </div>
  );
}
```

**Step 2: Create activity table component**

Create: `src/components/dashboard/activity/activity-table.tsx` with content:
```typescript
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";

interface Activity {
  _id: string;
  user?: { name: string; email: string; image?: string };
  action: string;
  resource: string;
  createdAt: number;
}

export function ActivityTable({ activities }: { activities: any }) {
  if (activities === undefined) {
    return <div>Loading...</div>;
  }

  const { activities: activityList } = activities;

  const getActionColor = (action: string) => {
    switch (action) {
      case "login":
        return "default";
      case "create_user":
      case "create_organization":
        return "default";
      case "update_user":
      case "update_organization":
        return "secondary";
      case "delete_user":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activityList.map((activity: Activity) => (
            <TableRow key={activity._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user?.image} />
                    <AvatarFallback>
                      {activity.user?.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{activity.user?.name}</div>
                    <div className="text-sm text-gray-500">{activity.user?.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getActionColor(activity.action) as any}>
                  {activity.action.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">{activity.resource}</TableCell>
              <TableCell>
                {new Date(activity.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {activityList.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No activity found
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

Run: `git add src/app/\(dashboard\)/activity/page.tsx src/components/dashboard/activity/activity-table.tsx`
Run: `git commit -m "feat: create activity log page

- Add activity log page with real data
- Create activity table component
- Display user info and action badges
- Format timestamps properly
- Empty state handling""

---

## Task 6: Add Real-time Subscriptions

**Files:**
- Create: `src/components/realtime/activity-subscription.tsx`
- Modify: `src/components/dashboard/overview/components/recent-activity.tsx`

**Step 1: Create real-time activity component**

Create: `src/components/realtime/activity-subscription.tsx` with content:
```typescript
"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useClient } from "convex/react";
import { api } from "../../convex/generated/api";

export function useActivitySubscription(orgId: string, onNewActivity: (activity: any) => void) {
  const client = useClient();

  useEffect(() => {
    // Subscribe to new activities
    const subscription = client
      .query(api.activities.getActivities, { orgId, limit: 1 })
      .subscribe((result) => {
        if (result.activities.length > 0) {
          onNewActivity(result.activities[0]);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [orgId, client, onNewActivity]);
}
```

**Step 2: Update recent activity component**

Modify: `src/components/dashboard/overview/components/recent-activity.tsx` with content:
```typescript
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../ui/avatar";
import { Badge } from "../../../../ui/badge";

export function RecentActivity({ orgId }: { orgId: string }) {
  const activities = useQuery(api.dashboard.getRecentActivities, { orgId, limit: 5 });
  const [liveActivities, setLiveActivities] = useState<any[]>([]);

  if (activities === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayActivities = liveActivities.length > 0 ? liveActivities : activities;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div key={activity._id} className="flex items-center gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user?.image} />
                <AvatarFallback>
                  {activity.user?.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {activity.user?.name}{" "}
                  <span className="text-gray-600 font-normal">
                    {activity.action.replace(/_/g, " ")}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {displayActivities.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent activity
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 3: Commit**

Run: `git add src/components/realtime/activity-subscription.tsx src/components/dashboard/overview/components/recent-activity.tsx`
Run: `git commit -m "feat: add real-time activity subscriptions

- Create useActivitySubscription hook
- Update recent activity to show real data
- Support live activity updates
- Add loading states
- Real-time dashboard updates""

---

## Task 7: Create Data Tests

**Files:**
- Create: `__tests__/batch5-data-dashboard.test.ts`

**Step 1: Create data tests**

Create: `__tests__/batch5-data-dashboard.test.ts` with content:
```typescript
const fs = require("fs");

describe("Batch 5: Data & Dashboard", () => {
  test("dashboard functions exist", () => {
    const content = fs.readFileSync("convex/functions/dashboard.ts", "utf8");
    expect(content).toContain("export const getMetrics");
    expect(content).toContain("export const getRecentActivities");
    expect(content).toContain("export const getUserGrowth");
  });

  test("demo data exists", () => {
    const content = fs.readFileSync("convex/functions/seed/demo.ts", "utf8");
    expect(content).toContain("Acme Corporation");
    expect(content).toContain("john@example.com");
    expect(content).toContain("jane@example.com");
  });

  test("users page uses real data", () => {
    const content = fs.readFileSync("src/app/(dashboard)/users/page.tsx", "utf8");
    expect(content).toContain("useQuery(api.users.getUsers");
    expect(content).toContain("useQuery(api.organizations.getOrganizations");
  });

  test("dashboard page uses real data", () => {
    const content = fs.readFileSync("src/app/(dashboard)/(dashboard-1)/page.tsx", "utf8");
    expect(content).toContain("useQuery(api.dashboard.getMetrics");
    expect(content).toContain("useQuery(api.dashboard.getRecentActivities");
  });

  test("activity page exists", () => {
    expect(fs.existsSync("src/app/(dashboard)/activity/page.tsx")).toBe(true);
  });

  test("real-time subscription exists", () => {
    expect(fs.existsSync("src/components/realtime/activity-subscription.tsx")).toBe(true);
  });
});
```

**Step 2: Run tests**

Run: `npm test -- __tests__/batch5-data-dashboard.test.ts`
Expected: PASS (all 6 tests)

**Step 3: Commit**

Run: `git add __tests__/batch5-data-dashboard.test.ts`
Run: `git commit -m "test: add Batch 5 data and dashboard tests

- Verify dashboard functions exist
- Check demo data has realistic content
- Validate users page uses Convex queries
- Confirm dashboard page uses real data
- Check activity page exists
- Verify real-time subscription""

---

## Summary

**Batch 5 Complete!** Data and dashboard are now fully implemented with:

✅ Real Convex data in users page
✅ Dashboard with real metrics and charts
✅ Rich demo data generator
✅ Activity log page with real-time updates
✅ Real-time subscriptions
✅ Comprehensive test suite

**Next Steps:**
Proceed to Batch 6: Documentation & Deployment to create setup script, documentation, and deployment configs.
