import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeTimezone } from "@/lib/quota";
import { getUserQuotaSnapshot } from "@/lib/quota-server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null, quota: null }, { status: 200 });
  }

  const quota = await getUserQuotaSnapshot({
    userId: user.id,
    plan: user.plan,
    timezone: user.timezone,
  });

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id },
    orderBy: { unlockedAt: "asc" },
  });

  return NextResponse.json({ user, quota, progress });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updates: { timezone?: string; preferredLevel?: string; name?: string } = {};

  if (typeof body.timezone === "string") {
    updates.timezone = normalizeTimezone(body.timezone);
  }
  if (
    typeof body.preferredLevel === "string" &&
    ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(
      body.preferredLevel
    )
  ) {
    updates.preferredLevel = body.preferredLevel;
  }
  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updates,
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      preferredLevel: true,
      timezone: true,
    },
  });

  const quota = await getUserQuotaSnapshot({
    userId: updated.id,
    plan: updated.plan === "PRO" ? "PRO" : "FREE",
    timezone: updated.timezone,
  });

  return NextResponse.json({ user: updated, quota });
}
