import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const JWT_SECRET = (process.env.JWT_SECRET || "smart-canteen-secret-key") as string;
const JWT_EXPIRES_IN = "7d";
const ALLOWED_DOMAIN = "matrusri.edu.in";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (user: {
  id: string;
  email: string;
  role: string;
  name: string;
}): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyGoogleToken = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new AppError("Invalid Google token", 401);
  }

  const { email, name, sub: googleId } = payload;

  if (!email || !name) {
    throw new AppError("Google account missing email or name", 400);
  }

  // Domain restriction — server-side check
  const domain = email.split("@")[1];
  if (domain !== ALLOWED_DOMAIN) {
    throw new AppError(
      `Only @${ALLOWED_DOMAIN} emails are allowed. Please sign in with your college email.`,
      403
    );
  }

  return { email, name, googleId };
};

export const authenticateWithGoogle = async (idToken: string) => {
  const { email, name, googleId } = await verifyGoogleToken(idToken);

  let user = await prisma.user.findUnique({ where: { email } });

  let profileComplete = true;
  let isNewUser = false;

  if (user) {
    // Existing user — update Google info if they re-link
    if (user.provider !== "google") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { provider: "google" },
      });
    }
    profileComplete = user.profileComplete;
  } else {
    // New user — create with Google auth
    isNewUser = true;
    profileComplete = false;

    user = await prisma.user.create({
      data: {
        name,
        email,
        provider: "google",
        profileComplete: false,
        role: "STUDENT",
      },
    });
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
    profileComplete,
    isNewUser,
  };
};

export const completeProfile = async (
  userId: string,
  rollNumber: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.profileComplete) {
    throw new AppError("Profile already complete", 400);
  }

  // Validate roll number matches email prefix
  const emailPrefix = user.email.split("@")[0];
  if (rollNumber !== emailPrefix) {
    throw new AppError(
      `Roll number must match your email prefix: ${emailPrefix}`,
      400
    );
  }

  // Check roll number uniqueness
  const existing = await prisma.user.findFirst({
    where: { rollNumber, id: { not: userId } },
  });
  if (existing) {
    throw new AppError("Roll number already registered", 409);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      rollNumber,
      profileComplete: true,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    rollNumber: updated.rollNumber,
  };
};
