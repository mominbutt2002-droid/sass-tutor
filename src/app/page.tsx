"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Crown,
  Headphones,
  Mic,
  ShieldCheck,
  Sparkles,
  SpellCheck2,
  Volume2,
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
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/components/providers";
import { STAGES } from "@/lib/curriculum";

export default function HomePage() {
  const { locale, t, user } = useApp();
  const [yearlyBilling, setYearlyBilling] = useState(false);

  const freeFeatures =
    locale === "ru"
      ? [
          "10 минут практики каждый день",
          "Автоматический сброс лимита в полночь (00:00)",
          "5 бесплатных уроков по базовым темам",
          "Интерактивные квизы и задачи",
          "Проверка грамматики и правописания",
          "Доступ к AI-агенту gemini-3.5-flash-lite",
        ]
      : [
          "10 minutes of daily practice",
          "Automatic quota reset at midnight (00:00)",
          "5 free foundational lessons",
          "Interactive quizzes and exercises",
          "Grammar and spelling checks",
          "Powered by gemini-3.5-flash-lite",
        ];

  const proFeatures =
    locale === "ru"
      ? [
          "Неограниченное время практики 24/7",
          "Все 16+ уроков на 4 этапах (A1–C2)",
          "Проверка произношения (запись с микрофона)",
          "Speaking: живой диалог с AI-репетитором",
          "Listening: аудирование и диктанты с озвучкой",
          "Глубокий разбор ошибок и персональные тренажёры",
        ]
      : [
          "Unlimited practice time 24/7",
          "All 16+ lessons across 4 stages (A1–C2)",
          "Pronunciation check via microphone audio",
          "Speaking: live conversational Russian practice",
          "Listening: audio comprehension & dictation",
          "Deep error breakdown & targeted drills",
        ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#DAEAFF] via-[#A1C6F6]/45 to-[#DAEAFF] dark:from-[#031725] dark:via-[#022E5B] dark:to-[#031725] py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge className="bg-[#499BED]/20 text-[#022E5B] dark:text-[#A1C6F6] border border-[#499BED]/40 font-heading gap-1.5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-[#499BED]" />
              {t.hero.badge}
            </Badge>

            <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1] text-[#031725] dark:text-[#DAEAFF]">
              {t.hero.title}
            </h1>

            <p className="max-w-2xl text-lg sm:text-xl text-[#022E5B]/90 dark:text-[#A1C6F6]">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={user ? "/dashboard" : "/register"}>
                <Button size="lg" className="font-heading gap-2 text-base shadow-md">
                  {t.hero.ctaStart}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tutor">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-heading gap-2 text-base border-[#499BED]/50 bg-card/70 hover:bg-card"
                >
                  {t.hero.ctaTutor}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 max-w-lg">
              <div className="rounded-xl border border-border bg-card/70 p-3 backdrop-blur-sm">
                <div className="font-heading text-xl font-bold text-[#499BED]">4</div>
                <div className="text-xs text-muted-foreground">
                  {locale === "ru" ? "этапа A1–C2" : "stages A1–C2"}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/70 p-3 backdrop-blur-sm">
                <div className="font-heading text-xl font-bold text-[#499BED]">10 мин</div>
                <div className="text-xs text-muted-foreground">
                  {locale === "ru" ? "сброс в 00:00" : "resets 00:00"}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/70 p-3 backdrop-blur-sm">
                <div className="font-heading text-xl font-bold text-[#499BED]">5 уроков</div>
                <div className="text-xs text-muted-foreground">
                  {locale === "ru" ? "бесплатно" : "free tier"}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tutor Preview Card */}
          <div className="lg:col-span-5">
            <Card className="border-[#499BED]/40 bg-card/95 shadow-xl">
              <CardHeader className="border-b border-border/70 pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-heading text-xs">
                    gemini-3.5-flash-lite
                  </Badge>
                  <Badge className="bg-[#499BED] text-[#031725] font-heading text-xs">
                    Live Preview
                  </Badge>
                </div>
                <CardTitle className="font-heading text-lg pt-2">
                  {locale === "ru"
                    ? "Разбор речи и правописания"
                    : "Speech & Spelling Feedback"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="rounded-xl bg-muted/60 p-3.5 border border-border/70">
                  <div className="font-heading text-xs uppercase text-muted-foreground mb-1">
                    {locale === "ru" ? "Фраза ученика" : "Student input"}
                  </div>
                  <p className="text-base font-medium">
                    «Мы пойдём в <span className="underline decoration-destructive">машыне</span> к{" "}
                    <span className="underline decoration-[#499BED]">моей другу</span>.»
                  </p>
                </div>

                <div className="space-y-2.5 rounded-xl bg-[#022E5B] text-[#DAEAFF] p-4">
                  <div className="flex items-center gap-2 font-heading text-xs text-[#A1C6F6]">
                    <SpellCheck2 className="h-4 w-4 text-[#499BED]" />
                    {locale === "ru" ? "Исправление AI-репетитора" : "AI Tutor Correction"}
                  </div>
                  <p className="text-base">
                    «Мы поéдем на <strong>маши́не</strong> к <strong>моему́ дру́гу</strong>.»
                  </p>
                  <ul className="space-y-1 text-sm text-[#A1C6F6]">
                    <li>• ЖИ–ШИ пишется с И: «машина».</li>
                    <li>• «Друг» — муж. род, дат. падеж: «моему другу».</li>
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs font-heading">
                    <Mic className="h-3.5 w-3.5 text-[#499BED]" />
                    Pro Audio
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs font-heading">
                    <Headphones className="h-3.5 w-3.5 text-[#499BED]" />
                    Listening
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs font-heading">
                    <Volume2 className="h-3.5 w-3.5 text-[#499BED]" />
                    Speaking
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4 Learning Stages */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl space-y-2">
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            {t.stagesTitle}
          </h2>
          <p className="text-muted-foreground text-lg">{t.stagesSubtitle}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, idx) => (
            <Card
              key={stage.id}
              className="flex flex-col justify-between border-border hover:border-[#499BED]/60 transition-colors"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-heading">
                    {stage.cefr}
                  </Badge>
                  <span className="font-heading text-xs text-muted-foreground">
                    0{idx + 1}
                  </span>
                </div>
                <CardTitle className="font-heading text-xl pt-2">
                  {locale === "ru" ? stage.titleRu : stage.titleEn}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-[#499BED]">
                  {locale === "ru" ? stage.subtitleRu : stage.subtitleEn}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {locale === "ru" ? stage.descriptionRu : stage.descriptionEn}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/dashboard?stage=${stage.id}`} className="w-full">
                  <Button variant="outline" className="w-full font-heading text-xs">
                    {locale === "ru" ? "Открыть программу" : "View Stage"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center space-y-3 mb-10">
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              {t.pricing.title}
            </h2>
            <p className="text-muted-foreground text-lg">{t.pricing.subtitle}</p>

            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 mt-2">
              <span
                className={`font-heading text-sm ${
                  !yearlyBilling ? "font-bold text-primary" : "text-muted-foreground"
                }`}
              >
                {t.pricing.monthly}
              </span>
              <Switch
                checked={yearlyBilling}
                onCheckedChange={setYearlyBilling}
                aria-label="Toggle yearly billing"
              />
              <span
                className={`font-heading text-sm ${
                  yearlyBilling ? "font-bold text-primary" : "text-muted-foreground"
                }`}
              >
                {t.pricing.yearly}
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Free Card */}
            <Card className="flex flex-col justify-between border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-2xl flex items-center gap-2">
                    <BookOpenCheck className="h-5 w-5 text-[#499BED]" />
                    {t.pricing.freeTitle}
                  </CardTitle>
                  <Badge variant="outline" className="font-heading gap-1">
                    <Clock className="h-3 w-3" /> 10 мин/день
                  </Badge>
                </div>
                <div className="pt-3 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-extrabold">
                    {t.pricing.freePrice}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t.pricing.freePeriod}
                  </span>
                </div>
                <CardDescription className="text-base pt-1">
                  {t.pricing.freeDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {freeFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#499BED] mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Link href={user ? "/dashboard" : "/register"} className="w-full">
                  <Button variant="outline" className="w-full font-heading">
                    {t.pricing.chooseFree}
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Pro Card */}
            <Card className="flex flex-col justify-between border-[#499BED] bg-gradient-to-b from-card to-[#DAEAFF]/40 dark:to-[#022E5B]/90 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-2xl flex items-center gap-2">
                    <Crown className="h-5 w-5 text-[#499BED]" />
                    {t.pricing.proTitle}
                  </CardTitle>
                  <Badge className="bg-[#499BED] text-[#031725] font-heading gap-1">
                    <Award className="h-3 w-3" /> Stripe Pro
                  </Badge>
                </div>
                <div className="pt-3 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-extrabold">
                    {yearlyBilling
                      ? t.pricing.proYearlyPrice
                      : t.pricing.proMonthlyPrice}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {yearlyBilling
                      ? locale === "ru"
                        ? "/ год"
                        : "/ year"
                      : locale === "ru"
                      ? "/ мес"
                      : "/ month"}
                  </span>
                </div>
                <CardDescription className="text-base pt-1">
                  {t.pricing.proDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {proFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-sm">
                    <ShieldCheck className="h-4 w-4 text-[#499BED] mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Link href="/billing" className="w-full">
                  <Button className="w-full font-heading gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t.pricing.choosePro}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
