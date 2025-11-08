/* eslint-disable */
/**
 * Generated Convex client API.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * @module
 */

import type { FunctionReference } from "convex/server";

export declare const api: {
  auth: {
    register: FunctionReference<"mutation", "public">;
    verifyEmail: FunctionReference<"mutation", "public">;
    requestPasswordReset: FunctionReference<"mutation", "public">;
    resetPassword: FunctionReference<"mutation", "public">;
    getUserByEmail: FunctionReference<"query", "public">;
  };
  email: {
    sendVerificationEmail: FunctionReference<"mutation", "public">;
    sendPasswordResetEmail: FunctionReference<"mutation", "public">;
  };
  users: {
    getCurrentUser: FunctionReference<"query", "public">;
  };
  seed: any;
};

export declare const internal: any;
export declare const components: any;

export default api;
