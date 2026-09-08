/**
 * Lightweight PDF text & structural extractor for uploaded curriculum files in Node.js.
 * Extracts text stream blocks, decompresses FlateDecode streams, headings, vocabulary tokens, and exercise patterns.
 */

import zlib from "zlib";

export interface ExtractedPdfDocument {
  pageCount: number;
  rawText: string;
  headings: string[];
  vocabularyHints: string[];
  hasExercises: boolean;
}

function extractBtEtText(streamContent: string, target: string[]) {
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match: RegExpExecArray | null;

  while ((match = btRegex.exec(streamContent)) !== null) {
    const block = match[1];
    // Match literal strings inside parentheses: (Text here)
    const literalMatches = block.match(/\((.*?)\)/g);
    if (literalMatches) {
      for (const lit of literalMatches) {
        const cleaned = lit
          .slice(1, -1)
          .replace(/\\([()\\])/g, "$1")
          .replace(/\\r/g, "\r")
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .trim();
        if (cleaned.length > 0) {
          target.push(cleaned);
        }
      }
    }

    // Match hex strings <48656c6c6f>
    const hexMatches = block.match(/<([0-9a-fA-F\s]+)>/g);
    if (hexMatches) {
      for (const hex of hexMatches) {
        const cleanHex = hex.slice(1, -1).replace(/\s+/g, "");
        if (cleanHex.length % 2 === 0) {
          try {
            const decoded = Buffer.from(cleanHex, "hex").toString("utf-8").trim();
            if (decoded.length > 0 && /^[\x20-\x7E\u0600-\u06FF]+$/.test(decoded)) {
              target.push(decoded);
            }
          } catch {
            // Ignore hex decode errors
          }
        }
      }
    }
  }
}

const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50MB limit

export function extractTextFromPdfBuffer(buffer: Buffer): ExtractedPdfDocument {
  if (buffer.length > MAX_PDF_BYTES) {
    throw new Error("ملف PDF يتجاوز الحد الأقصى المسموح به (50 ميجابايت).");
  }

  // Validate PDF header signature
  const isPdf = buffer.length >= 4 && buffer.toString("latin1", 0, 5).startsWith("%PDF");
  if (!isPdf) {
    console.warn("Uploaded buffer lacks standard %PDF signature");
  }

  const content = buffer.toString("latin1");
  
  // 1. Estimate page count from PDF trailer / Catalog
  const pageMatches = content.match(/\/Type\s*\/Page\b/g);
  const pageCount = pageMatches ? pageMatches.length : 1;

  const textMatches: string[] = [];

  // 2. First try standard uncompressed BT ... ET blocks
  extractBtEtText(content, textMatches);

  // 3. If standard BT/ET is sparse, attempt FlateDecode stream decompression
  if (textMatches.length < 20) {
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let streamMatch: RegExpExecArray | null;
    let streamAttempts = 0;
    let decompressedBytes = 0;
    const MAX_DECOMPRESSED_BYTES = 2 * 1024 * 1024; // 2MB limit

    while (
      (streamMatch = streamRegex.exec(content)) !== null &&
      streamAttempts < 40 &&
      decompressedBytes < MAX_DECOMPRESSED_BYTES
    ) {
      streamAttempts++;
      const rawStream = streamMatch[1];
      try {
        const streamBuffer = Buffer.from(rawStream, "latin1");
        let decompressed: string | null = null;
        try {
          decompressed = zlib.inflateSync(streamBuffer).toString("latin1");
        } catch {
          try {
            decompressed = zlib.inflateRawSync(streamBuffer).toString("latin1");
          } catch {
            // Not a valid zlib stream
          }
        }

        if (decompressed) {
          decompressedBytes += decompressed.length;
          extractBtEtText(decompressed, textMatches);
          // If we reached a healthy amount of text, stop to preserve processing speed
          if (textMatches.length >= 200) break;
        }
      } catch {
        // Ignore single stream decompression errors
      }
    }
  }

  let rawText = textMatches.join(" ");

  // 4. Fallback for scanned/unstandardized text: extract readable ASCII / Arabic runs without discarding extracted text
  if (rawText.trim().length < 50) {
    const readableBlocks = content.match(/[\x20-\x7E\u0600-\u06FF]{4,}/g);
    if (readableBlocks) {
      const fallbackRun = readableBlocks
        .filter((w) => !w.startsWith("/") && !w.startsWith("%") && !w.includes("obj") && !w.includes("endobj"))
        .join(" ");
      rawText = rawText.trim().length > 0 ? `${rawText} ${fallbackRun}` : fallbackRun;
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
