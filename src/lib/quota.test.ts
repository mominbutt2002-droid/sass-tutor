import { describe, expect, it } from "vitest";
import {
  FREE_DAILY_SECONDS,
  FREE_MAX_LESSONS,
  buildQuotaSnapshot,
  canAccessFeature,
  getDateKeyForTimezone,
  getNextMidnightTimestamp,
} from "./quota";

describe("quota & midnight reset engine", () => {
  it("resets dateKey at exact local midnight in the user's timezone", () => {
    // 2026-11-25 23:59:59 in Europe/Moscow (UTC+3) is 2026-11-25T20:59:59Z
    const beforeMidnight = new Date("2026-11-25T20:59:59.000Z");
    // 2026-11-26 00:00:00 in Europe/Moscow (UTC+3) is 2026-11-25T21:00:00Z
    const atMidnight = new Date("2026-11-25T21:00:00.000Z");

    expect(getDateKeyForTimezone("Europe/Moscow", beforeMidnight)).toBe(
      "2026-11-25"
    );
    expect(getDateKeyForTimezone("Europe/Moscow", atMidnight)).toBe(
      "2026-11-26"
    );
  });

  it("computes the next midnight timestamp within 24 hours", () => {
    const now = new Date("2026-11-25T18:30:00.000Z");
    const nextMidnight = getNextMidnightTimestamp("Europe/Moscow", now);
    // 18:30Z = 21:30 MSK, so next midnight MSK is 21:00Z (2.5 hours later)
    expect(nextMidnight).toBeGreaterThan(now.getTime());
    expect(nextMidnight - now.getTime()).toBeLessThanOrEqual(
      2.5 * 60 * 60 * 1000 + 1000
    );
    expect(
      getDateKeyForTimezone("Europe/Moscow", new Date(nextMidnight))
    ).toBe("2026-11-26");
  });

  it("enforces 10-minute (600s) daily limit for FREE and unlimited for PRO", () => {
    const freeOk = buildQuotaSnapshot({
      plan: "FREE",
      secondsUsed: 240,
      timezone: "UTC",
      now: new Date("2026-11-25T12:00:00.000Z"),
    });
    expect(freeOk.dailyLimitSeconds).toBe(FREE_DAILY_SECONDS);
    expect(freeOk.remainingSeconds).toBe(360);
    expect(freeOk.isExceeded).toBe(false);
    expect(freeOk.freeLessonsLimit).toBe(FREE_MAX_LESSONS);

    const freeExhausted = buildQuotaSnapshot({
      plan: "FREE",
      secondsUsed: 600,
      timezone: "UTC",
      now: new Date("2026-11-25T12:00:00.000Z"),
    });
    expect(freeExhausted.remainingSeconds).toBe(0);
    expect(freeExhausted.isExceeded).toBe(true);

    const pro = buildQuotaSnapshot({
      plan: "PRO",
      secondsUsed: 5000,
      timezone: "UTC",
      now: new Date("2026-11-25T12:00:00.000Z"),
    });
    expect(pro.dailyLimitSeconds).toBeNull();
    expect(pro.remainingSeconds).toBeNull();
    expect(pro.isExceeded).toBe(false);
    expect(pro.freeLessonsLimit).toBeNull();
  });

  it("gates Pro-only features while keeping Free features accessible", () => {
    expect(canAccessFeature("FREE", "GRAMMAR")).toBe(true);
    expect(canAccessFeature("FREE", "SPELLING")).toBe(true);
    expect(canAccessFeature("FREE", "QUIZ")).toBe(true);
    expect(canAccessFeature("FREE", "TASKS")).toBe(true);

    expect(canAccessFeature("FREE", "PRONUNCIATION")).toBe(false);
    expect(canAccessFeature("FREE", "SPEAKING")).toBe(false);
    expect(canAccessFeature("FREE", "LISTENING")).toBe(false);
    expect(canAccessFeature("FREE", "ERROR_ANALYSIS")).toBe(false);
    expect(canAccessFeature("FREE", "UNLIMITED_TIME")).toBe(false);

    expect(canAccessFeature("PRO", "PRONUNCIATION")).toBe(true);
    expect(canAccessFeature("PRO", "SPEAKING")).toBe(true);
    expect(canAccessFeature("PRO", "LISTENING")).toBe(true);
    expect(canAccessFeature("PRO", "ERROR_ANALYSIS")).toBe(true);
    expect(canAccessFeature("PRO", "UNLIMITED_TIME")).toBe(true);
  });
});
