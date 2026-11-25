import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { LearningStage, PlanTier } from "./quota";

export const SESSION_COOKIE_NAME = "glagol_session";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET || "glagol-ai-local-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.email !== "string") {
      return null;
    }
    return {
      userId: payload.sub,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  plan: PlanTier;
  preferredLevel: LearningStage;
  timezone: string;
  stripeCustomerId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      preferredLevel: true,
      timezone: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
    },
  });

  if (!user) return null;

  return {
    ...user,
    plan: user.plan === "PRO" ? "PRO" : "FREE",
    preferredLevel: (["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(
      user.preferredLevel
    )
      ? user.preferredLevel
      : "BEGINNER") as LearningStage,
  };
}
