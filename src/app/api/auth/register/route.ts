import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { normalizeTimezone } from "@/lib/quota";
import { getUserQuotaSnapshot } from "@/lib/quota-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim() || email.split("@")[0];
    const timezone = normalizeTimezone(body.timezone);
    const preferredLevel = [
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
      "EXPERT",
    ].includes(body.preferredLevel)
      ? body.preferredLevel
      : "BEGINNER";

    if (!email || !email.includes("@") || password.length < 6) {
      return NextResponse.json(
        { error: "Укажите корректный email и пароль (минимум 6 символов)." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже зарегистрирован." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        plan: "FREE",
        preferredLevel,
        timezone,
      },
    });

    const token = await createSessionToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    const quota = await getUserQuotaSnapshot({
      userId: user.id,
      plan: "FREE",
      timezone: user.timezone,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        preferredLevel: user.preferredLevel,
        timezone: user.timezone,
      },
      quota,
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Ошибка регистрации." },
      { status: 500 }
    );
  }
}
