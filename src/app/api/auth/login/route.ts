import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { normalizeTimezone, type PlanTier } from "@/lib/quota";
import { getUserQuotaSnapshot } from "@/lib/quota-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const timezone = body.timezone ? normalizeTimezone(body.timezone) : null;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Введите email и пароль." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Неверный email или пароль." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Неверный email или пароль." },
        { status: 401 }
      );
    }

    const effectiveTz = timezone ?? user.timezone;
    if (timezone && timezone !== user.timezone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { timezone },
      });
    }

    const token = await createSessionToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    const plan: PlanTier = user.plan === "PRO" ? "PRO" : "FREE";
    const quota = await getUserQuotaSnapshot({
      userId: user.id,
      plan,
      timezone: effectiveTz,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan,
        preferredLevel: user.preferredLevel,
        timezone: effectiveTz,
      },
      quota,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Ошибка входа." }, { status: 500 });
  }
}
