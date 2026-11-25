import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { GEMINI_MODEL, evaluatePronunciationAudio } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { canAccessFeature, type LearningStage } from "@/lib/quota";
import { uploadPronunciationAudio } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canAccessFeature(user.plan, "PRONUNCIATION")) {
    return NextResponse.json(
      { error: "PRO_PLAN_REQUIRED", feature: "PRONUNCIATION" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const targetPhrase = String(body.targetPhrase || "").trim();
  const audioBase64 = String(body.audioBase64 || "").trim();
  const mimeType = String(body.mimeType || "audio/webm").trim();
  const stage = (["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(
    body.stage
  )
    ? body.stage
    : user.preferredLevel) as LearningStage;
  const uiLocale = body.uiLocale === "en" ? "en" : "ru";

  if (!targetPhrase || !audioBase64) {
    return NextResponse.json(
      { error: "targetPhrase and audioBase64 are required" },
      { status: 400 }
    );
  }

  // Persist audio recording to Neon Object Storage ("uploads" bucket)
  const storedAudio = await uploadPronunciationAudio({
    userId: user.id,
    audioBase64,
    mimeType,
  }).catch((err) => {
    console.warn("Neon Object Storage upload failed:", err);
    return null;
  });

  try {
    const result = await evaluatePronunciationAudio({
      stage,
      targetPhrase,
      audioBase64,
      mimeType,
      uiLocale,
    });

    await prisma.tutorMessage.create({
      data: {
        userId: user.id,
        mode: "PRONUNCIATION",
        stage,
        role: "assistant",
        content: `Score: ${result.score}/100 — ${result.stressFeedback}`,
        feedbackJson: JSON.stringify(result),
        audioKey: storedAudio?.key ?? null,
      },
    });

    return NextResponse.json({
      result,
      model: GEMINI_MODEL,
      audioKey: storedAudio?.key ?? null,
      audioUrl: storedAudio?.url ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI_ERROR";
    if (message === "GEMINI_API_KEY_MISSING") {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY_MISSING",
          message:
            "Добавьте GEMINI_API_KEY в файл .env для анализа аудио через gemini-3.5-flash-lite.",
          audioKey: storedAudio?.key ?? null,
          audioUrl: storedAudio?.url ?? null,
        },
        { status: 503 }
      );
    }
    console.error("Pronunciation error:", err);
    return NextResponse.json({ error: "AI_REQUEST_FAILED" }, { status: 500 });
  }
}
