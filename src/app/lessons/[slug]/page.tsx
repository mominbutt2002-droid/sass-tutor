"use client";

import React, { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  Headphones,
  Lock,
  Mic,
  Volume2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuotaStatusCard } from "@/components/quota-status-card";
import { useApp } from "@/components/providers";
import { getLessonBySlug, isLessonUnlocked } from "@/lib/curriculum";

function speakRussian(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ru-RU";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

function LessonDetailInner({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const lesson = getLessonBySlug(slug);
  const { locale, user, quota, setQuotaState, refreshSession, t } = useApp();

  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const [taskChecked, setTaskChecked] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);

  const effectivePlan = user?.plan ?? "FREE";
  const unlocked = lesson ? isLessonUnlocked(effectivePlan, lesson) : false;
  const quotaExceeded = Boolean(
    user && quota && quota.plan === "FREE" && quota.isExceeded
  );

  // Track active practice seconds every 15s for logged-in Free/Pro users
  useEffect(() => {
    if (!user || !lesson || !unlocked || quotaExceeded) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/usage/tick", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seconds: 15 }),
        });
        const data = await res.json();
        if (data.quota) {
          setQuotaState(data.quota);
        }
      } catch {
        // ignore transient network errors
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [user, lesson, unlocked, quotaExceeded, setQuotaState]);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="font-heading text-2xl font-bold">
          {locale === "ru" ? "Урок не найден" : "Lesson not found"}
        </h1>
        <Link href="/dashboard">
          <Button className="font-heading">
            {locale === "ru" ? "Вернуться к курсу" : "Back to Curriculum"}
          </Button>
        </Link>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-heading text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "ru" ? "Назад к урокам" : "Back to lessons"}
        </Link>
        <Card className="border-[#499BED]/50">
          <CardHeader>
            <Badge className="w-fit bg-[#499BED] text-[#031725] font-heading gap-1">
              <Crown className="h-3.5 w-3.5" /> Pro Lesson
            </Badge>
            <CardTitle className="font-heading text-2xl pt-2">
              {locale === "ru" ? lesson.titleRu : lesson.titleEn}
            </CardTitle>
            <CardDescription className="text-base">
              {locale === "ru"
                ? "На бесплатном тарифе открыты 5 базовых уроков. Этот урок, а также Speaking, Listening и проверка произношения доступны в Pro."
                : "5 foundational lessons are free. Unlock this lesson plus Speaking, Listening, and Pronunciation with Pro."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/billing">
              <Button className="font-heading gap-2">
                <Crown className="h-4 w-4" />
                {t.quota.upgradePro}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCheckQuiz = async () => {
    setQuizSubmitted(true);
    const total = lesson.quiz.length;
    const correct = lesson.quiz.filter(
      (q) => quizAnswers[q.id] === q.correctIndex
    ).length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 100;
    setSavedScore(score);

    if (user) {
      await fetch("/api/lessons/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlug: lesson.slug,
          completed: true,
          quizScore: score,
        }),
      });
      await refreshSession();
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-heading text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "ru" ? "Назад к программе" : "Back to Curriculum"}
        </Link>
        <Badge variant="outline" className="font-heading">
          {lesson.stage} • #{lesson.order}
        </Badge>
      </div>

      {user && quota && <QuotaStatusCard />}

      {quotaExceeded ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-destructive">
              {t.quota.limitReachedTitle}
            </CardTitle>
            <CardDescription className="text-base">
              {t.quota.limitReachedBody}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/billing">
              <Button className="font-heading gap-2">
                <Crown className="h-4 w-4" />
                {t.quota.upgradePro}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold">
              {locale === "ru" ? lesson.titleRu : lesson.titleEn}
            </h1>
            <p className="text-muted-foreground text-base">
              {locale === "ru" ? lesson.summaryRu : lesson.summaryEn}
            </p>
          </div>

          <Tabs defaultValue="theory" className="space-y-5">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="theory" className="font-heading text-xs sm:text-sm">
                {locale === "ru" ? "Теория" : "Theory"}
              </TabsTrigger>
              <TabsTrigger value="tasks" className="font-heading text-xs sm:text-sm">
                {locale === "ru" ? "Задачи" : "Tasks"}
              </TabsTrigger>
              <TabsTrigger value="quiz" className="font-heading text-xs sm:text-sm">
                {locale === "ru" ? "Квиз" : "Quiz"}
              </TabsTrigger>
              <TabsTrigger value="pro" className="font-heading text-xs sm:text-sm gap-1">
                {effectivePlan !== "PRO" && <Lock className="h-3 w-3" />}
                Pro Audio
              </TabsTrigger>
            </TabsList>

            {/* Theory */}
            <TabsContent value="theory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">
                    {locale === "ru" ? "Правило и разбор" : "Grammar & Spelling Rule"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base leading-relaxed">
                    {locale === "ru" ? lesson.theoryRu : lesson.theoryEn}
                  </p>
                  <div className="space-y-2.5 pt-2">
                    <h3 className="font-heading text-sm uppercase text-muted-foreground">
                      {locale === "ru" ? "Примеры" : "Examples"}
                    </h3>
                    {lesson.examples.map((ex) => (
                      <div
                        key={ex.ru}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3.5"
                      >
                        <div>
                          <div className="font-semibold text-base">{ex.ru}</div>
                          <div className="text-xs text-muted-foreground">
                            {ex.translit} — {ex.en}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => speakRussian(ex.ru)}
                          title="Прослушать"
                        >
                          <Volume2 className="h-4 w-4 text-[#499BED]" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks */}
            <TabsContent value="tasks" className="space-y-4">
              {lesson.tasks.map((task) => {
                const value = taskInputs[task.id] ?? "";
                const checked = taskChecked[task.id];
                const isCorrect =
                  value.trim().toLowerCase() ===
                  task.expectedAnswer.toLowerCase();

                return (
                  <Card key={task.id}>
                    <CardHeader>
                      <CardTitle className="font-heading text-base">
                        {locale === "ru"
                          ? task.instructionRu
                          : task.instructionEn}
                      </CardTitle>
                      <CardDescription>{task.prompt}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={value}
                          onChange={(e) =>
                            setTaskInputs((prev) => ({
                              ...prev,
                              [task.id]: e.target.value,
                            }))
                          }
                          placeholder={
                            locale === "ru"
                              ? "Введите ответ по-русски..."
                              : "Type your Russian answer..."
                          }
                        />
                        <Button
                          onClick={() =>
                            setTaskChecked((prev) => ({
                              ...prev,
                              [task.id]: true,
                            }))
                          }
                          className="font-heading"
                        >
                          {locale === "ru" ? "Проверить" : "Check"}
                        </Button>
                      </div>
                      {checked && (
                        <div
                          className={`flex items-center gap-2 text-sm ${
                            isCorrect ? "text-[#499BED]" : "text-destructive"
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              {locale === "ru"
                                ? "Верно! Отличная работа."
                                : "Correct! Well done."}
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              {locale === "ru" ? task.hintRu : task.hintEn} (
                              {task.expectedAnswer})
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Quiz */}
            <TabsContent value="quiz" className="space-y-4">
              {lesson.quiz.map((q, idx) => {
                const selected = quizAnswers[q.id];
                return (
                  <Card key={q.id}>
                    <CardHeader>
                      <CardTitle className="font-heading text-base">
                        {idx + 1}. {locale === "ru" ? q.promptRu : q.promptEn}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isPicked = selected === optIdx;
                        const isRight = optIdx === q.correctIndex;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setQuizAnswers((prev) => ({
                                ...prev,
                                [q.id]: optIdx,
                              }))
                            }
                            className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                              quizSubmitted && isRight
                                ? "border-[#499BED] bg-[#499BED]/20 font-semibold"
                                : quizSubmitted && isPicked && !isRight
                                ? "border-destructive bg-destructive/15"
                                : isPicked
                                ? "border-[#499BED] bg-primary/10"
                                : "border-border hover:bg-muted/60"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                      {quizSubmitted && (
                        <p className="text-xs text-muted-foreground pt-1">
                          {locale === "ru" ? q.explanationRu : q.explanationEn}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              <div className="flex items-center justify-between gap-4">
                <Button onClick={handleCheckQuiz} className="font-heading">
                  {locale === "ru" ? "Завершить квиз" : "Submit Quiz"}
                </Button>
                {savedScore !== null && (
                  <Badge className="bg-[#499BED] text-[#031725] font-heading text-sm px-3 py-1">
                    {locale === "ru"
                      ? `Результат: ${savedScore}%`
                      : `Score: ${savedScore}%`}
                  </Badge>
                )}
              </div>
            </TabsContent>

            {/* Pro Audio Practice */}
            <TabsContent value="pro" className="space-y-4">
              {effectivePlan !== "PRO" ? (
                <Card className="border-[#499BED]/50">
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center gap-2">
                      <Crown className="h-5 w-5 text-[#499BED]" />
                      {t.tutor.proLockTitle}
                    </CardTitle>
                    <CardDescription>{t.tutor.proLockDesc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/billing">
                      <Button className="font-heading gap-2">
                        <Crown className="h-4 w-4" />
                        {t.quota.upgradePro}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-heading text-base flex items-center gap-2">
                        <Mic className="h-4 w-4 text-[#499BED]" />
                        {locale === "ru"
                          ? "Фраза для произношения"
                          : "Pronunciation Drill"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-base font-medium">
                        {lesson.proPronunciationPhrase}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            speakRussian(lesson.proPronunciationPhrase)
                          }
                          className="font-heading gap-1.5"
                        >
                          <Volume2 className="h-4 w-4" />
                          {locale === "ru" ? "Эталон" : "Listen"}
                        </Button>
                        <Link
                          href={`/tutor?mode=pronunciation&phrase=${encodeURIComponent(
                            lesson.proPronunciationPhrase
                          )}`}
                        >
                          <Button size="sm" className="font-heading gap-1.5">
                            <Mic className="h-4 w-4" />
                            {locale === "ru"
                              ? "Проверить с AI"
                              : "Check with AI"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="font-heading text-base flex items-center gap-2">
                        <Headphones className="h-4 w-4 text-[#499BED]" />
                        {locale === "ru" ? "Listening и Speaking" : "Listening & Speaking"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {lesson.proSpeakingPrompt}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakRussian(lesson.proListeningScript)}
                        className="font-heading gap-1.5"
                      >
                        <Volume2 className="h-4 w-4" />
                        {locale === "ru"
                          ? "Прослушать аудио-скрипт"
                          : "Play Listening Script"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-12 font-heading text-muted-foreground">
          Загрузка урока...
        </div>
      }
    >
      <LessonDetailInner params={params} />
    </Suspense>
  );
}
