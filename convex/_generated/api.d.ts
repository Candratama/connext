/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_auth from "../functions/auth.js";
import type * as functions_email from "../functions/email.js";
import type * as functions_index from "../functions/index.js";
import type * as functions_seed_demo from "../functions/seed/demo.js";
import type * as functions_seed_minimal from "../functions/seed/minimal.js";
import type * as functions_testEmail from "../functions/testEmail.js";
import type * as functions_users from "../functions/users.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/auth": typeof functions_auth;
  "functions/email": typeof functions_email;
  "functions/index": typeof functions_index;
  "functions/seed/demo": typeof functions_seed_demo;
  "functions/seed/minimal": typeof functions_seed_minimal;
  "functions/testEmail": typeof functions_testEmail;
  "functions/users": typeof functions_users;
  seed: typeof seed;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
