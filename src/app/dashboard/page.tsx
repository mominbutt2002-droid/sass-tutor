"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Crown,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuotaStatusCard } from "@/components/quota-status-card";
import { useApp } from "@/components/providers";
import { LESSONS, STAGES, isLessonUnlocked } from "@/lib/curriculum";
import type { LearningStage } from "@/lib/quota";

function DashboardContent() {
  const searchParams = useSearchParams();
  const { locale, user, quota, progress, loadingAuth } = useApp();
  const initialStageParam = searchParams.get("stage");
  const [activeStage, setActiveStage] = useState<LearningStage>("BEGINNER");

  useEffect(() => {
    if (
      initialStageParam &&
      ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(
        initialStageParam
      )
    ) {
      setActiveStage(initialStageParam as LearningStage);
    } else if (user?.preferredLevel) {
      setActiveStage(user.preferredLevel);
    }
  }, [initialStageParam, user?.preferredLevel]);

  const effectivePlan = user?.plan ?? "FREE";

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {locale === "ru" ? "Программа обучения" : "Russian Curriculum"}
          </h1>
          <p className="text-muted-foreground text-base">
            {locale === "ru"
              ? "Выберите этап от Начального до Эксперта. 5 базовых уроков доступны бесплатно."
              : "Choose your proficiency stage from Beginner to Expert. 5 core lessons are free."}
          </p>
        </div>
        <Link href="/tutor">
          <Button className="font-heading gap-2">
            <Sparkles className="h-4 w-4" />
            {locale === "ru" ? "AI-Репетитор" : "Open AI Tutor"}
          </Button>
        </Link>
      </div>

      {!loadingAuth && !user && (
        <Card className="border-[#499BED]/50 bg-card">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div>
              <h2 className="font-heading text-lg font-semibold">
                {locale === "ru"
                  ? "Войдите, чтобы сохранять прогресс и квоту 10 мин/день"
                  : "Sign in to track your progress and 10 min/day quota"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {locale === "ru"
                  ? "Доступны готовые демо-аккаунты Free и Pro на странице входа."
                  : "Demo Free and Pro accounts are ready on the sign-in page."}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="outline" className="font-heading">
                  {locale === "ru" ? "Войти" : "Sign in"}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="font-heading">
                  {locale === "ru" ? "Регистрация Free" : "Register Free"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {user && quota && <QuotaStatusCard />}

      <Tabs
        value={activeStage}
        onValueChange={(v) => setActiveStage(v as LearningStage)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1.5 bg-muted/70 p-1.5">
          {STAGES.map((stage) => (
            <TabsTrigger
              key={stage.id}
              value={stage.id}
              className="font-heading flex flex-col items-start gap-0.5 py-2.5 px-3 text-left"
            >
              <span className="text-sm font-semibold">
                {locale === "ru" ? stage.titleRu : stage.titleEn}
              </span>
              <span className="text-xs text-muted-foreground">{stage.cefr}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {STAGES.map((stage) => {
          const stageLessons = LESSONS.filter((l) => l.stage === stage.id);
          return (
            <TabsContent key={stage.id} value={stage.id} className="space-y-4">
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-heading text-xl font-bold">
                      {locale === "ru" ? stage.titleRu : stage.titleEn} (
                      {stage.cefr})
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {locale === "ru"
                        ? stage.descriptionRu
                        : stage.descriptionEn}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-heading">
                    {stageLessons.length}{" "}
                    {locale === "ru" ? "уроков" : "lessons"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {stageLessons.map((lesson) => {
                  const unlocked = isLessonUnlocked(effectivePlan, lesson);
                  const lessonProg = progress.find(
                    (p) => p.lessonSlug === lesson.slug
                  );

                  return (
                    <Card
                      key={lesson.slug}
                      className={`flex flex-col justify-between transition-all ${
                        unlocked
                          ? "border-border hover:border-[#499BED]/60"
                          : "border-border/70 opacity-90"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-heading">
                              #{lesson.order}
                            </Badge>
                            {lesson.isFreeTier ? (
                              <Badge className="bg-[#499BED]/20 text-[#022E5B] dark:text-[#A1C6F6] border border-[#499BED]/40 font-heading">
                                Free
                              </Badge>
                            ) : (
                              <Badge className="bg-[#022E5B] text-[#DAEAFF] dark:bg-[#499BED] dark:text-[#031725] font-heading gap-1">
                                <Crown className="h-3 w-3" /> Pro
                              </Badge>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-heading">
                            <Clock className="h-3.5 w-3.5" />
                            {lesson.durationMinutes}{" "}
                            {locale === "ru" ? "мин" : "min"}
                          </span>
                        </div>

                        <CardTitle className="font-heading text-lg pt-2">
                          {locale === "ru" ? lesson.titleRu : lesson.titleEn}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {locale === "ru" ? lesson.summaryRu : lesson.summaryEn}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(locale === "ru"
                            ? lesson.topicsRu
                            : lesson.topicsEn
                          ).map((topic) => (
                            <Badge
                              key={topic}
                              variant="outline"
                              className="text-xs font-heading"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        {lessonProg?.completed && (
                          <div className="flex items-center gap-1.5 text-sm text-[#499BED] font-heading">
                            <CheckCircle2 className="h-4 w-4" />
                            {locale === "ru"
                              ? `Пройден • Квиз: ${lessonProg.quizScore}%`
                              : `Completed • Quiz: ${lessonProg.quizScore}%`}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter>
                        {unlocked ? (
                          <Link
                            href={`/lessons/${lesson.slug}`}
                            className="w-full"
                          >
                            <Button className="w-full font-heading gap-2">
                              <PlayCircle className="h-4 w-4" />
                              {lessonProg?.completed
                                ? locale === "ru"
                                  ? "Повторить урок"
                                  : "Review Lesson"
                                : locale === "ru"
                                ? "Открыть урок"
                                : "Start Lesson"}
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/billing" className="w-full">
                            <Button
                              variant="outline"
                              className="w-full font-heading gap-2 border-[#499BED]/50"
                            >
                              <Lock className="h-4 w-4 text-[#499BED]" />
                              {locale === "ru"
                                ? "Открыть в тарифе Pro"
                                : "Unlock with Pro"}
                            </Button>
                          </Link>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 font-heading text-muted-foreground">
          Загрузка курса...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
