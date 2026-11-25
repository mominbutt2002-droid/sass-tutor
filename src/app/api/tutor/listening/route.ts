import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { GEMINI_MODEL, generateListeningExercise } from "@/lib/gemini";
import { canAccessFeature, type LearningStage } from "@/lib/quota";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canAccessFeature(user.plan, "LISTENING")) {
    return NextResponse.json(
      { error: "PRO_PLAN_REQUIRED", feature: "LISTENING" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const stage = (["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(
    body.stage
  )
    ? body.stage
    : user.preferredLevel) as LearningStage;
  const topic = typeof body.topic === "string" ? body.topic.trim() : undefined;
  const uiLocale = body.uiLocale === "en" ? "en" : "ru";

  try {
    const exercise = await generateListeningExercise({
      stage,
      topic,
      uiLocale,
    });

    return NextResponse.json({ exercise, model: GEMINI_MODEL });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI_ERROR";
    if (message === "GEMINI_API_KEY_MISSING") {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY_MISSING",
          message:
            "Добавьте GEMINI_API_KEY в файл .env для генерации аудирования через gemini-3.5-flash-lite.",
        },
        { status: 503 }
      );
    }
    console.error("Listening error:", err);
    return NextResponse.json({ error: "AI_REQUEST_FAILED" }, { status: 500 });
  }
}
