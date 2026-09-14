import crypto from "crypto";
import nodemailer, { type Transporter } from "nodemailer";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";

const JWT_SECRET = (process.env.JWT_SECRET || "smart-canteen-secret-key") as string;

// Create Ethereal test account for dev emails
let transporter: Transporter | null = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();
  console.log("\n📧 Ethereal email account:", testAccount.user);
  console.log("   Password:", testAccount.password);

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return {
      message: "If an account exists with that email, an OTP has been sent.",
    };
  }

  // Google-only users can't reset password (they don't have one)
  if (user.provider === "google") {
    return {
      message:
        "This account uses Google Sign-In. Please sign in with Google instead.",
    };
  }

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpires },
  });

  // Send email via Ethereal
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: '"SmartCanteen" <noreply@smartcanteen.app>',
      to: email,
      subject: "Your SmartCanteen Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">SmartCanteen Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>Your 6-digit OTP for password reset is:</p>
          <div style="background: #f1f5f9; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This OTP expires in 10 minutes.</p>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`📧 OTP email preview: ${previewUrl}`);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
  }

  return {
    message: "If an account exists with that email, an OTP has been sent.",
  };
};

export const verifyOTP = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.otp || !user.otpExpires) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  if (user.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (new Date() > user.otpExpires) {
    throw new AppError("OTP has expired. Please request a new one.", 400);
  }

  // Generate a short-lived reset token
  const resetToken = jwt.sign(
    { id: user.id, purpose: "password-reset" },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Clear the OTP
  await prisma.user.update({
    where: { id: user.id },
    data: { otp: null, otpExpires: null },
  });

  return { resetToken };
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string
) => {
  let decoded: { id: string; purpose: string };

  try {
    decoded = jwt.verify(resetToken, JWT_SECRET) as {
      id: string;
      purpose: string;
    };
  } catch {
    throw new AppError("Invalid or expired reset token", 400);
  }

  if (decoded.purpose !== "password-reset") {
    throw new AppError("Invalid reset token", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Hash the new password
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(newPassword, salt as crypto.BinaryLike, 64)
    .toString("hex");
  const passwordHash = `${salt}:${hash}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { message: "Password reset successful" };
};
