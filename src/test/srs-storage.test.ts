import { describe, expect, it } from "vitest";
import {
  buildDefaultSrsDeck,
  getSrsDeckStorageKey,
  mergeSrsDeckWithDefaults,
} from "@/lib/srs-storage";

describe("user-scoped SRS storage", () => {
  it("builds a user-specific key and skips anonymous users", () => {
    expect(getSrsDeckStorageKey("student/1")).toBe(
      "egyptian_lms_srs_vocab_deck:student%2F1"
    );
    expect(getSrsDeckStorageKey()).toBeNull();
  });

  it("preserves remedial cards while restoring the standard deck", () => {
    const remedialCard = {
      id: "remedial-q1",
      word: "Grandpa",
      phonics: "Silent d blend",
      arabicMeaning: "الجد",
      exampleSentence: "This is my grandpa.",
      category: "مراجعة كويز",
      intervalDays: 1,
      repetitions: 0,
      easeFactor: 2.3,
      dueDate: new Date().toISOString(),
    };

    const mergedDeck = mergeSrsDeckWithDefaults([remedialCard]);

    expect(mergedDeck[0]).toEqual(remedialCard);
    expect(mergedDeck).toHaveLength(buildDefaultSrsDeck().length + 1);
    expect(mergedDeck.some((card) => card.id === "vocab-1")).toBe(true);
  });
});
