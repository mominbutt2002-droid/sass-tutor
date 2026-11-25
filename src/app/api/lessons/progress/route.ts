import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLessonBySlug, isLessonUnlocked } from "@/lib/curriculum";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id },
  });
  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const lessonSlug = String(body.lessonSlug || "");
  const lesson = getLessonBySlug(lessonSlug);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  if (!isLessonUnlocked(user.plan, lesson)) {
    return NextResponse.json(
      { error: "PRO_PLAN_REQUIRED" },
      { status: 403 }
    );
  }

  const quizScore = Math.max(0, Math.min(100, Number(body.quizScore ?? 0)));
  const completed = Boolean(body.completed);

  const record = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonSlug: {
        userId: user.id,
        lessonSlug: lesson.slug,
      },
    },
    create: {
      userId: user.id,
      lessonSlug: lesson.slug,
      stage: lesson.stage,
      completed,
      quizScore,
      completedAt: completed ? new Date() : null,
    },
    update: {
      completed: completed || undefined,
      quizScore,
      completedAt: completed ? new Date() : undefined,
    },
  });

  return NextResponse.json({ record });
}
