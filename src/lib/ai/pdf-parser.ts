/**
 * Lightweight PDF text & structural extractor for uploaded curriculum files in Node.js.
 * Extracts text stream blocks, headings, vocabulary tokens, and exercise patterns.
 */

export interface ExtractedPdfDocument {
  pageCount: number;
  rawText: string;
  headings: string[];
  vocabularyHints: string[];
  hasExercises: boolean;
}

export function extractTextFromPdfBuffer(buffer: Buffer): ExtractedPdfDocument {
  const content = buffer.toString("latin1");
  
  // 1. Estimate page count from PDF trailer / Catalog
  const pageMatches = content.match(/\/Type\s*\/Page\b/g);
  const pageCount = pageMatches ? pageMatches.length : 1;

  // 2. Extract text from Text Objects: BT ... ET
  const textMatches: string[] = [];
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match: RegExpExecArray | null;

  while ((match = btRegex.exec(content)) !== null) {
    const streamContent = match[1];
    // Match literal strings inside parentheses: (Text here)
    const literalMatches = streamContent.match(/\((.*?)\)/g);
    if (literalMatches) {
      for (const lit of literalMatches) {
        // Strip outer parens and clean escape sequences
        const cleaned = lit
          .slice(1, -1)
          .replace(/\\([()\\])/g, "$1")
          .replace(/\\r/g, "\r")
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .trim();
        if (cleaned.length > 0) {
          textMatches.push(cleaned);
        }
      }
    }
    // Match hex strings <48656c6c6f>
    const hexMatches = streamContent.match(/<([0-9a-fA-F\s]+)>/g);
    if (hexMatches) {
      for (const hex of hexMatches) {
        const cleanHex = hex.slice(1, -1).replace(/\s+/g, "");
        if (cleanHex.length % 2 === 0) {
          try {
            const decoded = Buffer.from(cleanHex, "hex").toString("utf-8").trim();
            if (decoded.length > 0 && /^[\x20-\x7E\u0600-\u06FF]+$/.test(decoded)) {
              textMatches.push(decoded);
            }
          } catch {
            // Ignore hex decode errors
          }
        }
      }
    }
  }

  let rawText = textMatches.join(" ");

  // If BT/ET extraction returned sparse text (e.g. compressed streams), extract readable ASCII / Arabic runs
  if (rawText.length < 50) {
    const readableBlocks = content.match(/[\x20-\x7E\u0600-\u06FF]{4,}/g);
    if (readableBlocks) {
      rawText = readableBlocks
        .filter((w) => !w.startsWith("/") && !w.startsWith("%") && !w.includes("obj") && !w.includes("endobj"))
        .join(" ");
    }
  }

  // Extract detected headings (lines with Unit, Lesson, Grammar, Vocabulary)
  const headings: string[] = [];
  const headingRegex = /(?:Unit\s*\d+|Lesson\s*\d+|Phonics|Vocabulary|Let's\s*learn|Reading\s*time)[\w\s:,-]{2,40}/gi;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headingRegex.exec(rawText)) !== null) {
    if (!headings.includes(hMatch[0].trim())) {
      headings.push(hMatch[0].trim());
    }
  }

  // Detect vocabulary candidate words
  const vocabWords = new Set<string>();
  const words = rawText.split(/[\s,.;:!?()"]+/);
  const commonStopWords = new Set([
    "the", "and", "is", "are", "in", "at", "to", "for", "with", "this", "that", "page",
    "unit", "lesson", "read", "listen", "point", "say", "write", "color", "look"
  ]);

  for (const w of words) {
    const cleanWord = w.toLowerCase().replace(/[^a-z]/g, "");
    if (cleanWord.length >= 3 && cleanWord.length <= 15 && !commonStopWords.has(cleanWord)) {
      vocabWords.add(cleanWord);
      if (vocabWords.size >= 25) break;
    }
  }

  const hasExercises = /exercise|choose|complete|quiz|question|answer|match/i.test(rawText);

  return {
    pageCount,
    rawText: rawText.slice(0, 8000), // Cap at 8KB for fast LLM processing
    headings: headings.slice(0, 10),
    vocabularyHints: Array.from(vocabWords).slice(0, 15),
    hasExercises,
  };
}
