import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { GEMINI_MODEL, analyzeGrammarAndSpelling } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { canAccessFeature, type LearningStage } from "@/lib/quota";
import { consumePracticeSeconds } from "@/lib/quota-server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const text = String(body.text || "").trim();
  const deepAnalysis = Boolean(body.deepAnalysis);
  const stage = (["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(
    body.stage
  )
    ? body.stage
    : user.preferredLevel) as LearningStage;
  const uiLocale = body.uiLocale === "en" ? "en" : "ru";

  if (!text) {
    return NextResponse.json({ error: "Empty text" }, { status: 400 });
  }

  if (deepAnalysis && !canAccessFeature(user.plan, "ERROR_ANALYSIS")) {
    return NextResponse.json(
      { error: "PRO_PLAN_REQUIRED", feature: "ERROR_ANALYSIS" },
      { status: 403 }
    );
  }

  const usageResult = await consumePracticeSeconds({
    userId: user.id,
    plan: user.plan,
    timezone: user.timezone,
    secondsToAdd: 15,
  });

  if (!usageResult.allowed) {
    return NextResponse.json(
      { error: "DAILY_QUOTA_EXCEEDED", quota: usageResult.quota },
      { status: 403 }
    );
  }

  try {
    const analysis = await analyzeGrammarAndSpelling({
      stage,
      text,
      deepAnalysis,
      uiLocale,
    });

    await prisma.tutorMessage.create({
      data: {
        userId: user.id,
        mode: deepAnalysis ? "ERROR_ANALYSIS" : "GRAMMAR",
        stage,
        role: "assistant",
        content: analysis.summary,
        feedbackJson: JSON.stringify(analysis),
      },
    });

    return NextResponse.json({
      analysis,
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
            "Добавьте GEMINI_API_KEY в файл .env для проверки грамматики через gemini-3.5-flash-lite.",
          quota: usageResult.quota,
        },
        { status: 503 }
      );
    }
    console.error("Grammar check error:", err);
    return NextResponse.json(
      { error: "AI_REQUEST_FAILED", quota: usageResult.quota },
      { status: 500 }
    );
  }
}
