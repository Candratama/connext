import { run as seedMinimal } from "./functions/seed/minimal";
import { run as seedDemo } from "./functions/seed/demo";

export { seedMinimal, seedDemo };

// Export the run functions directly
export const minimal = seedMinimal;
export const demo = seedDemo;
