import { mutationGeneric } from "convex/server";

/**
 * Seed database with rich demo data
 * Will be implemented in Batch 5
 */
export const run = mutationGeneric({
  handler: async (ctx) => {
    return "Seed demo placeholder";
  },
});
