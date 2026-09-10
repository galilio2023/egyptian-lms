/**
 * Centralized Google Gemini AI Configuration
 * Default model: gemini-3.5-flash-lite (high-throughput, ultra low-latency & cost efficient)
 */
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

/**
 * Builds the standard Google Generative Language API endpoint URL for content generation
 */
export function getGeminiGenerateContentUrl(apiKey: string, model: string = DEFAULT_GEMINI_MODEL): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}
