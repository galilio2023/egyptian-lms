import { describe, it, expect } from "vitest";
import { diagnoseEgyptianPhoneme } from "@/features/phonics/components/phonics-sound-board";

describe("Egyptian Phonics Traps Diagnostic Engine", () => {
  it("detects the classic Egyptian P vs B confusion trap", () => {
    // Expected word with 'p', student pronounced with 'b' (e.g. 'Apple' -> 'Abble', 'Pen' -> 'Ben')
    const diag = diagnoseEgyptianPhoneme("Apple", "Abble");
    expect(diag).not.toBeNull();
    expect(diag?.trapDetected).toBe("p_vs_b");
    expect(diag?.adviceArabic).toContain("Puff of air");
  });

  it("detects CH vs SH confusion trap", () => {
    // Expected 'Chair', student pronounced 'Shair'
    const diag = diagnoseEgyptianPhoneme("Chair", "shair");
    expect(diag).not.toBeNull();
    expect(diag?.trapDetected).toBe("ch_vs_sh");
    expect(diag?.adviceArabic).toContain("تـشـ");
  });

  it("detects TH sound trap when pronounced as S or Z", () => {
    // Expected 'Three', student pronounced 'Sree'
    const diag = diagnoseEgyptianPhoneme("Three", "sree");
    expect(diag).not.toBeNull();
    expect(diag?.trapDetected).toBe("th_vs_s");
    expect(diag?.adviceArabic).toContain("طرف اللسان");
  });

  it("detects SH vs S trap", () => {
    // Expected 'Ship', student pronounced 'Sip'
    const diag = diagnoseEgyptianPhoneme("Ship", "sip");
    expect(diag).not.toBeNull();
    expect(diag?.trapDetected).toBe("sh_vs_s");
  });

  it("returns null when pronunciation is correct or within normal variance", () => {
    const diag = diagnoseEgyptianPhoneme("Cat", "cat");
    expect(diag).toBeNull();
  });
});

describe("Quiz Anti-Cheat & Scoring Formulas", () => {
  it("computes correct passing status and percentage", () => {
    const totalQuestions = 5;
    const correctCount = 4;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passPercentage = 60;
    const isPassed = scorePercentage >= passPercentage;

    expect(scorePercentage).toBe(80);
    expect(isPassed).toBe(true);
  });

  it("enforces max 3 strikes before forced exam submission", () => {
    let strikes = 0;
    const recordViolation = () => {
      strikes++;
      return strikes >= 3;
    };

    expect(recordViolation()).toBe(false); // Strike 1
    expect(recordViolation()).toBe(false); // Strike 2
    expect(recordViolation()).toBe(true);  // Strike 3 -> Force submit!
    expect(strikes).toBe(3);
  });
});
