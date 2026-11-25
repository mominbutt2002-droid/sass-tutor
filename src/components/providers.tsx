"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DICTIONARY, type Locale } from "@/lib/i18n";
import type { LearningStage, PlanTier, QuotaSnapshot } from "@/lib/quota";

export interface ClientUser {
  id: string;
  email: string;
  name: string;
  plan: PlanTier;
  preferredLevel: LearningStage;
  timezone: string;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: string | null;
}

export interface LessonProgressItem {
  lessonSlug: string;
  stage: string;
  completed: boolean;
  quizScore: number;
}

interface AppContextValue {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (typeof DICTIONARY)["ru"] | (typeof DICTIONARY)["en"];
  user: ClientUser | null;
  quota: QuotaSnapshot | null;
  progress: LessonProgressItem[];
  loadingAuth: boolean;
  refreshSession: () => Promise<void>;
  setQuotaState: (q: QuotaSnapshot | null) => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");
  const [user, setUser] = useState<ClientUser | null>(null);
  const [quota, setQuota] = useState<QuotaSnapshot | null>(null);
  const [progress, setProgress] = useState<LessonProgressItem[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        setQuota(null);
        setProgress([]);
        return;
      }
      const data = await res.json();
      setUser(data.user ?? null);
      setQuota(data.quota ?? null);
      setProgress(data.progress ?? []);

      if (data.user) {
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (browserTz && browserTz !== data.user.timezone) {
          fetch("/api/auth/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timezone: browserTz }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((updated) => {
              if (updated?.quota) setQuota(updated.quota);
            })
            .catch(() => {});
        }
      }
    } catch {
      setUser(null);
      setQuota(null);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("glagol_locale");
    if (savedLocale === "en" || savedLocale === "ru") {
      setLocaleState(savedLocale);
    }
    refreshSession();
  }, [refreshSession]);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    window.localStorage.setItem("glagol_locale", loc);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setQuota(null);
    setProgress([]);
  };

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
    >
      <TooltipProvider>
        <AppContext.Provider
          value={{
            locale,
            setLocale,
            t: DICTIONARY[locale],
            user,
            quota,
            progress,
            loadingAuth,
            refreshSession,
            setQuotaState: setQuota,
            logout,
          }}
        >
          {children}
        </AppContext.Provider>
      </TooltipProvider>
    </NextThemesProvider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside AppProviders");
  }
  return ctx;
}
