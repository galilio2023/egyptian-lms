import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { INITIAL_PLATFORM_SETTINGS, type MockPlatformSettings } from "@/lib/db/mock-data";

export type PlatformSettingsData = MockPlatformSettings;

let cachedSettings: MockPlatformSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 15000; // 15 seconds in-memory cache

/**
 * Retrieves the platform branding, teacher information, and contact phone settings.
 * First checks an in-memory cache, then queries the platform_settings table in PostgreSQL,
 * falling back gracefully to sensible generic defaults.
 */
export async function getPlatformSettings(): Promise<MockPlatformSettings> {
  const now = Date.now();
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSettings;
  }

  try {
    const [dbSettings] = await db
      .select()
      .from(schema.platformSettings)
      .where(eq(schema.platformSettings.id, "default"))
      .limit(1);

    if (dbSettings) {
      cachedSettings = {
        id: dbSettings.id,
        academyNameArabic: dbSettings.academyNameArabic || INITIAL_PLATFORM_SETTINGS.academyNameArabic,
        academyNameEnglish: dbSettings.academyNameEnglish || INITIAL_PLATFORM_SETTINGS.academyNameEnglish,
        teacherNameArabic: dbSettings.teacherNameArabic || INITIAL_PLATFORM_SETTINGS.teacherNameArabic,
        teacherNameEnglish: dbSettings.teacherNameEnglish || INITIAL_PLATFORM_SETTINGS.teacherNameEnglish,
        teacherTitle: dbSettings.teacherTitle || INITIAL_PLATFORM_SETTINGS.teacherTitle,
        teacherBio: dbSettings.teacherBio || INITIAL_PLATFORM_SETTINGS.teacherBio,
        whatsappNumber: dbSettings.whatsappNumber || INITIAL_PLATFORM_SETTINGS.whatsappNumber,
        hotlineNumber: dbSettings.hotlineNumber || INITIAL_PLATFORM_SETTINGS.hotlineNumber,
        inquiriesNumber: dbSettings.inquiriesNumber || INITIAL_PLATFORM_SETTINGS.inquiriesNumber,
        vodafoneCashNumber: dbSettings.vodafoneCashNumber || INITIAL_PLATFORM_SETTINGS.vodafoneCashNumber,
        instapayAddress: dbSettings.instapayAddress || INITIAL_PLATFORM_SETTINGS.instapayAddress,
        heroVideoUrl: dbSettings.heroVideoUrl || INITIAL_PLATFORM_SETTINGS.heroVideoUrl,
        sampleLectures: dbSettings.sampleLectures || INITIAL_PLATFORM_SETTINGS.sampleLectures,
      };
      cacheTimestamp = now;
      return cachedSettings;
    }
  } catch (err) {
    console.warn("Platform settings fetch DB fallback:", err);
  }

  return INITIAL_PLATFORM_SETTINGS;
}

/**
 * Invalidates the in-memory cache so subsequent reads immediately reflect updates.
 */
export function invalidatePlatformSettingsCache(): void {
  cachedSettings = null;
  cacheTimestamp = 0;
}
