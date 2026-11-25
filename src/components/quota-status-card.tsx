"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Crown, Sparkles, TimerReset } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers";

function formatCountdown(targetIso: string, nowMs: number): string {
  const diffMs = Math.max(0, new Date(targetIso).getTime() - nowMs);
  const totalSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

export function QuotaStatusCard() {
  const { quota, locale, t, progress } = useApp();
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!quota) return null;

  const isPro = quota.plan === "PRO";
  const usedSeconds = quota.secondsUsed;
  const limitSeconds = quota.dailyLimitSeconds ?? 600;
  const remaining = quota.remainingSeconds ?? 0;
  const percentRemaining = isPro
    ? 100
    : Math.max(0, Math.min(100, Math.round((remaining / limitSeconds) * 100)));
  const completedLessons = progress.filter((p) => p.completed).length;

  return (
    <Card className="border-[#499BED]/30 bg-card/90 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            {isPro ? (
              <Crown className="h-4 w-4 text-[#499BED]" />
            ) : (
              <Clock className="h-4 w-4 text-[#499BED]" />
            )}
            {isPro
              ? t.quota.unlimited
              : locale === "ru"
              ? "Дневной лимит практики (Free)"
              : "Daily Practice Quota (Free)"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isPro
              ? locale === "ru"
                ? "Безлимитное время, произношение, Speaking, Listening и разбор ошибок активны."
                : "Unlimited time, pronunciation check, Speaking, Listening, and error breakdown enabled."
              : locale === "ru"
              ? `Использовано ${Math.floor(usedSeconds / 60)}м ${
                  usedSeconds % 60
                }с из 10 минут. Сброс в полночь (${quota.timezone}).`
              : `Used ${Math.floor(usedSeconds / 60)}m ${
                  usedSeconds % 60
                }s of 10 minutes. Resets at midnight (${quota.timezone}).`}
          </p>
        </div>

        {!isPro && (
          <Link href="/billing">
            <Button size="sm" className="font-heading gap-1.5 shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
              {t.quota.upgradePro}
            </Button>
          </Link>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {!isPro && (
          <>
            <Progress value={percentRemaining} className="h-2.5" />
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-heading tabular-nums">
                  {t.quota.remaining}: {Math.floor(remaining / 60)}:
                  {String(remaining % 60).padStart(2, "0")}
                </Badge>
                <Badge variant="outline" className="font-heading tabular-nums">
                  {t.quota.freeLessons}: {Math.min(5, completedLessons)} / 5
                </Badge>
              </div>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground font-heading text-xs tabular-nums">
                <TimerReset className="h-3.5 w-3.5 text-[#499BED]" />
                {t.quota.resetCountdown}:{" "}
                {formatCountdown(quota.nextMidnightIso, nowMs)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
