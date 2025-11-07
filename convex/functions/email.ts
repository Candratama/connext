import { mutation, query } from "convex/server";
import { v } from "convex/values";
import { Resend } from "resend";

/**
 * Send email verification using Resend
 */
export const sendVerificationEmail = mutation(
  async (ctx, { email, code, name }: { email: string; code: string; name: string }) => {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?code=${code}&email=${email}`;

    const result = await resend.emails.send({
      from: "noreply@yourapp.com",
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
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666;">${verificationUrl}</p>
          <p style="color: #666; font-size: 12px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    });

    return result;
  }
);

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = mutation(
  async (ctx, { email, code, name }: { email: string; code: string; name: string }) => {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-reset?code=${code}&email=${email}`;

    const result = await resend.emails.send({
      from: "noreply@yourapp.com",
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
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666;">${resetUrl}</p>
          <p style="color: #666; font-size: 12px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    });

    return result;
  }
);
