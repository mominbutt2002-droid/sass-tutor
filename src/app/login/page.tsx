"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApp } from "@/components/providers";

export default function LoginPage() {
  const router = useRouter();
  const { locale, refreshSession } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitLogin = async (targetEmail: string, targetPassword: string) => {
    setError("");
    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          password: targetPassword,
          timezone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        return;
      }
      await refreshSession();
      router.push("/dashboard");
    } catch {
      setError("Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitLogin(email, password);
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-12">
      <Card className="w-full border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-2xl flex items-center gap-2">
            <LogIn className="h-5 w-5 text-[#499BED]" />
            {locale === "ru" ? "Вход в Глагол AI" : "Sign in to Glagol AI"}
          </CardTitle>
          <CardDescription>
            {locale === "ru"
              ? "Продолжите обучение с учётом вашего тарифа и прогресса"
              : "Continue your Russian lessons and track your daily quota"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="font-heading text-xs uppercase text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-heading text-xs uppercase text-muted-foreground">
                {locale === "ru" ? "Пароль" : "Password"}
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
              <div className="font-heading text-xs text-muted-foreground">
                {locale === "ru" ? "Быстрый демо-вход:" : "Quick Demo Sign-in:"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => submitLogin("free@glagol.ai", "demo1234")}
                  className="font-heading text-xs gap-1.5"
                >
                  <User className="h-3.5 w-3.5" />
                  Demo Free
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                  onClick={() => submitLogin("pro@glagol.ai", "demo1234")}
                  className="font-heading text-xs gap-1.5"
                >
                  <Crown className="h-3.5 w-3.5 text-[#499BED]" />
                  Demo Pro
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-heading"
            >
              {loading
                ? "..."
                : locale === "ru"
                ? "Войти"
                : "Sign in"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {locale === "ru" ? "Нет аккаунта? " : "No account yet? "}
              <Link href="/register" className="text-primary underline">
                {locale === "ru" ? "Создать бесплатно" : "Create free account"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
