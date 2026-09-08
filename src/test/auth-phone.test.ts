import { describe, it, expect } from "vitest";
import { validateEgyptianPhone, normalizeGovernorate } from "@/lib/utils";

describe("Egyptian Phone Validation & Normalization", () => {
  it("validates standard 11-digit mobile numbers for all 4 Egyptian carriers", () => {
    // Vodafone (010)
    expect(validateEgyptianPhone("01012345678")).toBe("01012345678");
    // Etisalat (011)
    expect(validateEgyptianPhone("01198765432")).toBe("01198765432");
    // Orange (012)
    expect(validateEgyptianPhone("01234567890")).toBe("01234567890");
    // WE (015)
    expect(validateEgyptianPhone("01555554444")).toBe("01555554444");
  });

  it("normalizes international prefixes (+20, 0020, 20)", () => {
    expect(validateEgyptianPhone("+201012345678")).toBe("01012345678");
    expect(validateEgyptianPhone("00201012345678")).toBe("01012345678");
    expect(validateEgyptianPhone("201012345678")).toBe("01012345678");
  });

  it("strips spaces, dashes, and parentheses", () => {
    expect(validateEgyptianPhone("010 1234 5678")).toBe("01012345678");
    expect(validateEgyptianPhone("(011) 9876-5432")).toBe("01198765432");
  });

  it("rejects invalid carriers and lengths", () => {
    // 013, 014, 016-019 are invalid mobile prefixes in Egypt
    expect(validateEgyptianPhone("01312345678")).toBeNull();
    expect(validateEgyptianPhone("01412345678")).toBeNull();
    expect(validateEgyptianPhone("01912345678")).toBeNull();
    // Too short / Too long
    expect(validateEgyptianPhone("010123456")).toBeNull();
    expect(validateEgyptianPhone("0101234567899")).toBeNull();
    // Non-Egyptian
    expect(validateEgyptianPhone("+966501234567")).toBeNull();
    expect(validateEgyptianPhone("abc12345678")).toBeNull();
  });
});

describe("Egyptian Governorate Normalization", () => {
  it("normalizes Arabic governorate names to standard slugs", () => {
    expect(normalizeGovernorate("القاهرة")).toBe("cairo");
    expect(normalizeGovernorate("الجيزة")).toBe("giza");
    expect(normalizeGovernorate("الإسكندرية")).toBe("alexandria");
    expect(normalizeGovernorate("الدقهلية (المنصورة)")).toBe("dakahlia");
    expect(normalizeGovernorate("الغربية (طنطا)")).toBe("gharbiya");
  });

  it("defaults empty input to cairo", () => {
    expect(normalizeGovernorate("")).toBe("cairo");
  });
});
