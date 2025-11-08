import { Resend } from "resend";

/**
 * Send email verification using Resend
 * Internal helper function called from mutations
 */
export async function sendVerificationEmail({
  email,
  code,
  name,
  apiKey,
  fromEmail,
  appUrl,
}: {
  email: string;
  code: string;
  name: string;
  apiKey: string;
  fromEmail: string;
  appUrl: string;
}) {
  try {
    console.log("[EMAIL] Starting verification email send to:", email);
    console.log("[EMAIL] Using API key:", apiKey ? `${apiKey.substring(0, 8)}...` : "MISSING");
    console.log("[EMAIL] From email:", fromEmail);
    console.log("[EMAIL] App URL:", appUrl);

    const resend = new Resend(apiKey);
    const verificationUrl = `${appUrl}/verify-email?code=${code}&email=${email}`;

    console.log("[EMAIL] Calling Resend API...");
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${name}!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}"
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Verify Email
          </a>
          <p>Or enter this verification code:</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
          </div>
          <p style="color: #666; font-size: 12px;">
            This code will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("[EMAIL] Resend API response:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[EMAIL] Error sending verification email:", error);
    console.error("[EMAIL] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Send password reset email
 * Internal helper function called from mutations
 */
export async function sendPasswordResetEmail({
  email,
  code,
  name,
  apiKey,
  fromEmail,
  appUrl,
}: {
  email: string;
  code: string;
  name: string;
  apiKey: string;
  fromEmail: string;
  appUrl: string;
}) {
  try {
    console.log("[EMAIL] Starting password reset email send to:", email);
    console.log("[EMAIL] Using API key:", apiKey ? `${apiKey.substring(0, 8)}...` : "MISSING");
    console.log("[EMAIL] From email:", fromEmail);
    console.log("[EMAIL] App URL:", appUrl);

    const resend = new Resend(apiKey);
    const resetUrl = `${appUrl}/verify-reset?code=${code}&email=${email}`;

    console.log("[EMAIL] Calling Resend API...");
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Password
          </a>
          <p>Or enter this reset code:</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
          </div>
          <p style="color: #666; font-size: 12px;">
            This code will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("[EMAIL] Resend API response:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[EMAIL] Error sending password reset email:", error);
    console.error("[EMAIL] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}
