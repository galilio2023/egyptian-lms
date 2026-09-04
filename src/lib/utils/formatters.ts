/**
 * Centralized formatting utilities for timecodes and Egyptian currency.
 */

export function formatSecondsToTime(secs: number): string {
  const roundedSecs = Math.floor(secs);
  const hours = Math.floor(roundedSecs / 3600);
  const mins = Math.floor((roundedSecs % 3600) / 60);
  const remainder = roundedSecs % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${remainder
      .toString()
      .padStart(2, "0")}`;
  }

  return `${mins}:${remainder.toString().padStart(2, "0")}`;
}

export function formatEgyptianCurrency(amount: number): string {
  return `${amount.toLocaleString("ar-EG")} ج.م`;
}
