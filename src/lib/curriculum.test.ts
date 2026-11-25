import { describe, expect, it } from "vitest";
import {
  FREE_LESSON_SLUGS,
  LESSONS,
  STAGES,
  isLessonUnlocked,
} from "./curriculum";
import { FREE_MAX_LESSONS } from "./quota";

describe("curriculum & 4 learning stages", () => {
  it("defines exactly 4 proficiency stages", () => {
    expect(STAGES.map((s) => s.id)).toEqual([
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
      "EXPERT",
    ]);
  });

  it("provides exactly 5 free lessons and unlocks all lessons for PRO", () => {
    expect(FREE_LESSON_SLUGS).toHaveLength(FREE_MAX_LESSONS);

    const freeUnlockedCount = LESSONS.filter((lesson) =>
      isLessonUnlocked("FREE", lesson)
    ).length;
    const proUnlockedCount = LESSONS.filter((lesson) =>
      isLessonUnlocked("PRO", lesson)
    ).length;

    expect(freeUnlockedCount).toBe(5);
    expect(proUnlockedCount).toBe(LESSONS.length);
    expect(LESSONS.length).toBeGreaterThanOrEqual(16);
  });
});
