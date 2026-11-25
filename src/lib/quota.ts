export type PlanTier = "FREE" | "PRO";

export type LearningStage =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

export type TutorFeature =
  | "GRAMMAR"
  | "SPELLING"
  | "QUIZ"
  | "TASKS"
  | "PRONUNCIATION"
  | "SPEAKING"
  | "LISTENING"
  | "ERROR_ANALYSIS"
  | "UNLIMITED_TIME";

export const FREE_DAILY_SECONDS = 600; // 10 minutes per day
export const FREE_MAX_LESSONS = 5;

const FREE_FEATURES = new Set<TutorFeature>([
  "GRAMMAR",
  "SPELLING",
  "QUIZ",
  "TASKS",
]);

const PRO_ONLY_FEATURES = new Set<TutorFeature>([
  "PRONUNCIATION",
  "SPEAKING",
  "LISTENING",
  "ERROR_ANALYSIS",
  "UNLIMITED_TIME",
]);

export function canAccessFeature(plan: PlanTier, feature: TutorFeature): boolean {
  if (plan === "PRO") {
    return true;
  }
  if (PRO_ONLY_FEATURES.has(feature)) {
    return false;
  }
  return FREE_FEATURES.has(feature);
}

/**
 * Validates and normalizes an IANA timezone string; falls back to UTC if invalid.
 */
export function normalizeTimezone(timezone?: string | null): string {
  if (!timezone) return "UTC";
  try {
    Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return "UTC";
  }
}

/**
 * Returns YYYY-MM-DD in the user's timezone so usage automatically resets at 00:00 local midnight.
 */
export function getDateKeyForTimezone(
  timezone?: string | null,
  now: Date = new Date()
): string {
  const tz = normalizeTimezone(timezone);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

/**
 * Returns the exact UTC timestamp (ms) of the next 00:00:00 midnight in the user's timezone.
 */
export function getNextMidnightTimestamp(
  timezone?: string | null,
  now: Date = new Date()
): number {
  const tz = normalizeTimezone(timezone);
  const currentKey = getDateKeyForTimezone(tz, now);

  // Coarse step by 15 minutes up to 26 hours ahead until dateKey changes, then binary search to 1s precision.
  const stepMs = 15 * 60 * 1000;
  let low = now.getTime();
  let high = low + 26 * 60 * 60 * 1000;

  let probe = low + stepMs;
  while (probe <= high) {
    if (getDateKeyForTimezone(tz, new Date(probe)) !== currentKey) {
      high = probe;
      low = probe - stepMs;
      break;
    }
    probe += stepMs;
  }

  while (high - low > 1000) {
    const mid = Math.floor((low + high) / 2);
    if (getDateKeyForTimezone(tz, new Date(mid)) === currentKey) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

export interface QuotaSnapshot {
  plan: PlanTier;
  dateKey: string;
  timezone: string;
  secondsUsed: number;
  dailyLimitSeconds: number | null;
  remainingSeconds: number | null;
  isExceeded: boolean;
  nextMidnightIso: string;
  freeLessonsLimit: number | null;
}

export function buildQuotaSnapshot(params: {
  plan: PlanTier;
  secondsUsed: number;
  timezone?: string | null;
  now?: Date;
}): QuotaSnapshot {
  const now = params.now ?? new Date();
  const tz = normalizeTimezone(params.timezone);
  const dateKey = getDateKeyForTimezone(tz, now);
  const nextMidnightIso = new Date(
    getNextMidnightTimestamp(tz, now)
  ).toISOString();

  if (params.plan === "PRO") {
    return {
      plan: "PRO",
      dateKey,
      timezone: tz,
      secondsUsed: params.secondsUsed,
      dailyLimitSeconds: null,
      remainingSeconds: null,
      isExceeded: false,
      nextMidnightIso,
      freeLessonsLimit: null,
    };
  }

  const clampedUsed = Math.max(0, Math.min(FREE_DAILY_SECONDS, params.secondsUsed));
  const remainingSeconds = Math.max(0, FREE_DAILY_SECONDS - clampedUsed);

  return {
    plan: "FREE",
    dateKey,
    timezone: tz,
    secondsUsed: clampedUsed,
    dailyLimitSeconds: FREE_DAILY_SECONDS,
    remainingSeconds,
    isExceeded: remainingSeconds <= 0,
    nextMidnightIso,
    freeLessonsLimit: FREE_MAX_LESSONS,
  };
}
