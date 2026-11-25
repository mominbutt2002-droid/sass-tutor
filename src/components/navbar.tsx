"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BookOpen,
  Clock,
  Crown,
  Languages,
  LogOut,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/providers";

function formatMmSs(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t, user, quota, logout } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/tutor", label: t.nav.tutor },
    { href: "/billing", label: t.nav.billing },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight block leading-none">
                {t.brandName}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Русский с AI
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-heading text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    active
                      ? "bg-primary/15 text-primary font-semibold dark:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user && quota && (
            <Link href="/billing" className="hidden sm:flex items-center">
              {quota.plan === "PRO" ? (
                <Badge className="gap-1.5 bg-[#499BED] text-[#031725] hover:bg-[#499BED]/90 font-heading">
                  <Crown className="h-3.5 w-3.5" />
                  {t.quota.unlimited}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-[#499BED]/50 bg-[#DAEAFF]/60 dark:bg-[#022E5B] text-foreground font-heading tabular-nums"
                >
                  <Clock className="h-3.5 w-3.5 text-[#499BED]" />
                  {formatMmSs(quota.remainingSeconds ?? 0)} / 10:00
                </Badge>
              )}
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
            aria-label="Toggle language"
            className="font-heading gap-1.5 text-xs"
          >
            <Languages className="h-3.5 w-3.5" />
            {locale.toUpperCase()}
          </Button>

          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="h-8 w-8"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-[#A1C6F6]" />
              ) : (
                <Moon className="h-4 w-4 text-[#022E5B]" />
              )}
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/tutor">
                <Button size="sm" className="hidden lg:inline-flex font-heading gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t.nav.tutor}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title={t.nav.logout}
                className="h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-heading text-xs">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-heading text-xs">
                  {t.nav.register}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="flex md:hidden border-t border-border/60 px-2 py-1.5 justify-around">
        {navLinks.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`font-heading text-xs px-2.5 py-1 rounded-md ${
                active
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
