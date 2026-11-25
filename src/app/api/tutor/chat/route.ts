import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { GEMINI_MODEL, generateTutorReply } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { canAccessFeature, type LearningStage } from "@/lib/quota";
import { consumePracticeSeconds } from "@/lib/quota-server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const mode = (["GRAMMAR", "QUIZ", "SPEAKING"].includes(body.mode)
    ? body.mode
    : "GRAMMAR") as "GRAMMAR" | "QUIZ" | "SPEAKING";
  const stage = (["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(
    body.stage
  )
    ? body.stage
    : user.preferredLevel) as LearningStage;
  const prompt = String(body.prompt || "").trim();
  const uiLocale = body.uiLocale === "en" ? "en" : "ru";

  if (!prompt) {
    return NextResponse.json({ error: "Empty prompt" }, { status: 400 });
  }

  if (mode === "SPEAKING" && !canAccessFeature(user.plan, "SPEAKING")) {
    return NextResponse.json(
      { error: "PRO_PLAN_REQUIRED", feature: "SPEAKING" },
      { status: 403 }
    );
  }

  const usageResult = await consumePracticeSeconds({
    userId: user.id,
    plan: user.plan,
    timezone: user.timezone,
    secondsToAdd: 20,
  });

  if (!usageResult.allowed) {
    return NextResponse.json(
      { error: "DAILY_QUOTA_EXCEEDED", quota: usageResult.quota },
      { status: 403 }
    );
  }

  try {
    const reply = await generateTutorReply({
      stage,
      mode,
      prompt,
      uiLocale,
    });

    await prisma.tutorMessage.createMany({
      data: [
        {
          userId: user.id,
          mode,
          stage,
          role: "user",
          content: prompt,
        },
        {
          userId: user.id,
          mode,
          stage,
          role: "assistant",
          content: reply,
        },
      ],
    });

    return NextResponse.json({
      reply,
      model: GEMINI_MODEL,
      quota: usageResult.quota,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI_ERROR";
    if (message === "GEMINI_API_KEY_MISSING") {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY_MISSING",
          message:
            "Добавьте GEMINI_API_KEY в файл .env для работы AI-агента gemini-3.5-flash-lite.",
          quota: usageResult.quota,
        },
        { status: 503 }
      );
    }
    console.error("Tutor chat error:", err);
    return NextResponse.json(
      { error: "AI_REQUEST_FAILED", quota: usageResult.quota },
      { status: 500 }
    );
  }
}
