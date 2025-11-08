import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/convexClient";

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, error: "CREDENTIAL_REQUIRED", message: "Google credential is required" },
        { status: 400 }
      );
    }

    // Call Convex mutation for Google OAuth
    const result = await api.functions.auth.googleAuth({ credential });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, message: result.message },
        { status: 401 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Google OAuth API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "An error occurred during authentication",
      },
      { status: 500 }
    );
  }
}
