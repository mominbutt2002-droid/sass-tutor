"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  Crown,
  FlaskConical,
  ShieldCheck,
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
import { Switch } from "@/components/ui/switch";
import { QuotaStatusCard } from "@/components/quota-status-card";
import { useApp } from "@/components/providers";

function BillingContent() {
  const searchParams = useSearchParams();
  const { locale, user, quota, refreshSession } = useApp();
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const checkoutState = searchParams.get("checkout");
  const isPro = user?.plan === "PRO";

  const handleStripeCheckout = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: yearly ? "yearly" : "monthly" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || data.error || "Stripe checkout unavailable");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(
          locale === "ru"
            ? "Портал Stripe доступен после реальной оплаты через Stripe Checkout."
            : "Stripe Customer Portal is available after a Stripe Checkout payment."
        );
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxSwitch = async (targetPlan: "FREE" | "PRO") => {
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Sandbox switch failed");
        return;
      }
      await refreshSession();
      setMessage(
        locale === "ru"
          ? `Тариф обновлён на ${targetPlan} (Sandbox).`
          : `Plan updated to ${targetPlan} (Sandbox).`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">
          {locale === "ru" ? "Тарифы и оплата через Stripe" : "Plans & Stripe Billing"}
        </h1>
        <p className="text-muted-foreground text-base">
          {locale === "ru"
            ? "Бесплатный тариф даёт 10 минут практики в день со сбросом в полночь. Pro снимает все ограничения."
            : "Free includes 10 minutes/day resetting at midnight. Pro removes all limits."}
        </p>
      </div>

      {checkoutState === "success" && (
        <Card className="border-[#499BED] bg-[#499BED]/15">
          <CardContent className="flex items-center gap-2 py-4 font-heading text-sm">
            <CheckCircle2 className="h-5 w-5 text-[#499BED]" />
            {locale === "ru"
              ? "Оплата успешно завершена! Ваш тариф Pro активируется."
              : "Checkout completed! Your Pro subscription is activating."}
          </CardContent>
        </Card>
      )}

      {user && quota && <QuotaStatusCard />}

      {!user && (
        <Card className="border-[#499BED]/50">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
            <span>
              {locale === "ru"
                ? "Войдите или создайте аккаунт для управления подпиской."
                : "Sign in or create an account to manage your subscription."}
            </span>
            <Link href="/login">
              <Button className="font-heading">
                {locale === "ru" ? "Войти" : "Sign in"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {message && (
        <Card className="border-[#499BED]/50 bg-muted/50">
          <CardContent className="py-3 text-sm">{message}</CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <span className="font-heading text-sm">
          {locale === "ru" ? "Месячный ($12)" : "Monthly ($12)"}
        </span>
        <Switch checked={yearly} onCheckedChange={setYearly} />
        <span className="font-heading text-sm">
          {locale === "ru" ? "Годовой ($99 — скидка 31%)" : "Yearly ($99 — save 31%)"}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-2xl">Free</CardTitle>
              {user && !isPro && <Badge variant="secondary">Активен</Badge>}
            </div>
            <CardDescription className="text-3xl font-heading font-bold text-foreground pt-2">
              $0
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• 10 минут практики в день (сброс в полночь 00:00)</p>
            <p>• 5 бесплатных уроков по базовым темам</p>
            <p>• Квизы, задачи, грамматика и правописание</p>
          </CardContent>
          <CardFooter>
            {user && isPro && (
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => handleSandboxSwitch("FREE")}
                className="w-full font-heading"
              >
                {locale === "ru" ? "Вернуться на Free (Sandbox)" : "Switch to Free (Sandbox)"}
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="border-[#499BED] shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#499BED]" /> Pro
              </CardTitle>
              {isPro && (
                <Badge className="bg-[#499BED] text-[#031725] font-heading">
                  Активен
                </Badge>
              )}
            </div>
            <CardDescription className="text-3xl font-heading font-bold text-foreground pt-2">
              {yearly ? "$99 / год" : "$12 / мес"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#499BED]" />
              Неограниченное время практики
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#499BED]" />
              Проверка произношения (микрофон + Gemini Audio)
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#499BED]" />
              Speaking, Listening и глубокий разбор ошибок
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#499BED]" />
              Все 16 уроков: Начальный, Средний, Продвинутый, Эксперт
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2.5">
            {user && !isPro && (
              <Button
                disabled={loading}
                onClick={handleStripeCheckout}
                className="w-full font-heading gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {locale === "ru"
                  ? "Оплатить через Stripe"
                  : "Subscribe with Stripe"}
              </Button>
            )}

            {user && isPro && (
              <Button
                variant="outline"
                disabled={loading}
                onClick={handlePortal}
                className="w-full font-heading gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {locale === "ru"
                  ? "Управление подпиской Stripe"
                  : "Manage Stripe Subscription"}
              </Button>
            )}

            {user && (
              <Button
                variant="secondary"
                disabled={loading}
                onClick={() => handleSandboxSwitch(isPro ? "FREE" : "PRO")}
                className="w-full font-heading gap-2 text-xs"
              >
                <FlaskConical className="h-3.5 w-3.5 text-[#499BED]" />
                {isPro
                  ? locale === "ru"
                    ? "Sandbox: тест Free-режима"
                    : "Sandbox: test Free mode"
                  : locale === "ru"
                  ? "Sandbox: мгновенно включить Pro"
                  : "Sandbox: activate Pro instantly"}
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-12 font-heading text-muted-foreground">
          Загрузка тарифов...
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
