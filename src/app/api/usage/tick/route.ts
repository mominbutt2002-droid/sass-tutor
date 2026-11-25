import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { consumePracticeSeconds } from "@/lib/quota-server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const seconds = Number(body.seconds ?? 15);

  const result = await consumePracticeSeconds({
    userId: user.id,
    plan: user.plan,
    timezone: user.timezone,
    secondsToAdd: Number.isFinite(seconds) ? seconds : 15,
  });

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "DAILY_QUOTA_EXCEEDED",
        quota: result.quota,
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ quota: result.quota });
}
