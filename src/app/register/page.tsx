"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/components/providers";
import { STAGES } from "@/lib/curriculum";
import type { LearningStage } from "@/lib/quota";

export default function RegisterPage() {
  const router = useRouter();
  const { locale, refreshSession } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLevel, setPreferredLevel] =
    useState<LearningStage>("BEGINNER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          preferredLevel,
          timezone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
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

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-12">
      <Card className="w-full border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-2xl flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#499BED]" />
            {locale === "ru"
              ? "Создать аккаунт (Free)"
              : "Create Free Account"}
          </CardTitle>
          <CardDescription>
            {locale === "ru"
              ? "10 минут практики ежедневно (сброс в полночь) + 5 бесплатных уроков"
              : "10 minutes daily practice (resets at midnight) + 5 free lessons"}
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
                {locale === "ru" ? "Имя" : "Name"}
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={locale === "ru" ? "Елена" : "Elena"}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-heading text-xs uppercase text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-heading text-xs uppercase text-muted-foreground">
                {locale === "ru" ? "Пароль (от 6 символов)" : "Password (6+ chars)"}
              </label>
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-heading text-xs uppercase text-muted-foreground">
                {locale === "ru" ? "Этап изучения" : "Starting Stage"}
              </label>
              <Select
                value={preferredLevel}
                onValueChange={(v) => setPreferredLevel(v as LearningStage)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {locale === "ru" ? st.titleRu : st.titleEn} ({st.cefr})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                ? "Начать обучение"
                : "Start Learning"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {locale === "ru" ? "Уже есть аккаунт? " : "Already have an account? "}
              <Link href="/login" className="text-primary underline">
                {locale === "ru" ? "Войти" : "Sign in"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
