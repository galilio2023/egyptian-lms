/**
 * Device Fingerprinting & Persistence Utility
 * 
 * Provides stable client device identification by synchronizing across:
 * 1. Document Cookies (elite_device_id) with 1-year expiration (survives localStorage wipes)
 * 2. LocalStorage (elite_device_id)
 * 3. Screen and browser characteristics for stable entropy
 */

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    return "server-env";
  }

  // 1. Try reading from cookie first
  const cookieMatch = document.cookie.match(/(?:^|;\s*)elite_device_id=([^;]*)/);
  if (cookieMatch && cookieMatch[1] && cookieMatch[1].trim()) {
    const cookieId = decodeURIComponent(cookieMatch[1].trim());
    try {
      localStorage.setItem("elite_device_id", cookieId);
    } catch {}
    return cookieId;
  }

  // 2. Try reading from localStorage
  try {
    const stored = localStorage.getItem("elite_device_id");
    if (stored && stored.trim()) {
      persistDeviceIdCookie(stored.trim());
      return stored.trim();
    }
  } catch {}

  // 3. Generate a stable device ID combining screen dimensions and random entropy
  const screenPart = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
  const randomPart = Math.random().toString(36).substring(2, 11);
  const newDeviceId = `dev-${screenPart}-${randomPart}`;

  // 4. Persist to both storage layers
  try {
    localStorage.setItem("elite_device_id", newDeviceId);
  } catch {}
  persistDeviceIdCookie(newDeviceId);

  return newDeviceId;
}

export function persistDeviceIdCookie(deviceId: string): void {
  if (typeof document === "undefined") return;
  const oneYearSeconds = 365 * 24 * 60 * 60;
  document.cookie = `elite_device_id=${encodeURIComponent(deviceId)}; path=/; max-age=${oneYearSeconds}; SameSite=Lax`;
}
