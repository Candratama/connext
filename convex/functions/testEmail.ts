import { actionGeneric } from "convex/server";
import { v } from "convex/values";
import { Resend } from "resend";

/**
 * Test action to verify Resend API key works
 * Run this with: npx convex run functions/testEmail:testResendKey
 */
export const testResendKey = actionGeneric({
  args: {
    testEmail: v.string(),
  },
  handler: async (ctx, { testEmail }) => {
    try {
      console.log("[TEST] Testing Resend API key...");
      console.log("[TEST] API Key:", process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 8)}...` : "MISSING");
      console.log("[TEST] From Email:", process.env.FROM_EMAIL);

      const resend = new Resend(process.env.RESEND_API_KEY);

      // Test sending an email
      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: [testEmail],
        subject: "Resend API Test",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>API Key Test Successful!</h2>
            <p>If you're seeing this email, your Resend API key is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>From: ${process.env.FROM_EMAIL}</li>
              <li>To: ${testEmail}</li>
              <li>Time: ${new Date().toISOString()}</li>
            </ul>
          </div>
        `,
      });

      console.log("[TEST] Resend API response:", JSON.stringify(result, null, 2));

      if (result.error) {
        return {
          success: false,
          error: result.error,
          message: "API key test failed. See error details above.",
        };
      }

      return {
        success: true,
        emailId: result.data?.id,
        message: "Email sent successfully! Check your inbox at " + testEmail,
      };
    } catch (error: any) {
      console.error("[TEST] Error testing API key:", error);
      return {
        success: false,
        error: error.message || String(error),
        message: "Failed to test API key. See error details above.",
      };
    }
  },
});
