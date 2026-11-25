import { prisma } from "./prisma";
import {
  FREE_DAILY_SECONDS,
  buildQuotaSnapshot,
  getDateKeyForTimezone,
  normalizeTimezone,
  type PlanTier,
  type QuotaSnapshot,
} from "./quota";

export async function getUserQuotaSnapshot(params: {
  userId: string;
  plan: PlanTier;
  timezone?: string | null;
}): Promise<QuotaSnapshot> {
  const tz = normalizeTimezone(params.timezone);
  const dateKey = getDateKeyForTimezone(tz);

  const usage = await prisma.dailyUsage.findUnique({
    where: {
      userId_dateKey: {
        userId: params.userId,
        dateKey,
      },
    },
  });

  return buildQuotaSnapshot({
    plan: params.plan,
    secondsUsed: usage?.secondsUsed ?? 0,
    timezone: tz,
  });
}

export async function consumePracticeSeconds(params: {
  userId: string;
  plan: PlanTier;
  timezone?: string | null;
  secondsToAdd: number;
}): Promise<{ allowed: boolean; quota: QuotaSnapshot }> {
  const tz = normalizeTimezone(params.timezone);
  const dateKey = getDateKeyForTimezone(tz);
  const safeIncrement = Math.max(0, Math.min(120, Math.round(params.secondsToAdd)));

  const existing = await prisma.dailyUsage.findUnique({
    where: {
      userId_dateKey: {
        userId: params.userId,
        dateKey,
      },
    },
  });

  const currentUsed = existing?.secondsUsed ?? 0;

  if (params.plan === "FREE" && currentUsed >= FREE_DAILY_SECONDS) {
    return {
      allowed: false,
      quota: buildQuotaSnapshot({
        plan: "FREE",
        secondsUsed: currentUsed,
        timezone: tz,
      }),
    };
  }

  const nextUsed =
    params.plan === "FREE"
      ? Math.min(FREE_DAILY_SECONDS, currentUsed + safeIncrement)
      : currentUsed + safeIncrement;

  await prisma.dailyUsage.upsert({
    where: {
      userId_dateKey: {
        userId: params.userId,
        dateKey,
      },
    },
    create: {
      userId: params.userId,
      dateKey,
      secondsUsed: nextUsed,
    },
    update: {
      secondsUsed: nextUsed,
    },
  });

  return {
    allowed: true,
    quota: buildQuotaSnapshot({
      plan: params.plan,
      secondsUsed: nextUsed,
      timezone: tz,
    }),
  };
}
