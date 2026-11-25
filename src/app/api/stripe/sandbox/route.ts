import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserQuotaSnapshot } from "@/lib/quota-server";
import { isStripeSandboxEnabled } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!isStripeSandboxEnabled()) {
    return NextResponse.json(
      { error: "Sandbox billing toggle is disabled in live Stripe mode." },
      { status: 403 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const targetPlan = body.plan === "PRO" ? "PRO" : "FREE";

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: targetPlan,
      subscriptionStatus: targetPlan === "PRO" ? "active" : null,
      currentPeriodEnd:
        targetPlan === "PRO"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      preferredLevel: true,
      timezone: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
    },
  });

  const quota = await getUserQuotaSnapshot({
    userId: updated.id,
    plan: targetPlan,
    timezone: updated.timezone,
  });

  return NextResponse.json({ user: updated, quota });
}
