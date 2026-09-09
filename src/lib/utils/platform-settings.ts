import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { INITIAL_PLATFORM_SETTINGS, type MockPlatformSettings } from "@/lib/db/mock-data";
import { unstable_cache, revalidateTag } from "next/cache";
import { cache } from "react";

export type PlatformSettingsData = MockPlatformSettings;

let localMemSettings: MockPlatformSettings | null = null;

const fetchPlatformSettingsFromDb = async (): Promise<MockPlatformSettings> => {
  try {
    const [dbSettings] = await db
      .select()
      .from(schema.platformSettings)
      .where(eq(schema.platformSettings.id, "default"))
      .limit(1);

    if (dbSettings) {
      localMemSettings = {
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
        enableHeroToys: dbSettings.enableHeroToys !== undefined && dbSettings.enableHeroToys !== null ? dbSettings.enableHeroToys : INITIAL_PLATFORM_SETTINGS.enableHeroToys,
        enableHeroPhonicsStrip: dbSettings.enableHeroPhonicsStrip !== undefined && dbSettings.enableHeroPhonicsStrip !== null ? dbSettings.enableHeroPhonicsStrip : INITIAL_PLATFORM_SETTINGS.enableHeroPhonicsStrip,
        enableMascotCards: dbSettings.enableMascotCards !== undefined && dbSettings.enableMascotCards !== null ? dbSettings.enableMascotCards : INITIAL_PLATFORM_SETTINGS.enableMascotCards,
        themeVibe: (dbSettings.themeVibe as MockPlatformSettings['themeVibe']) || INITIAL_PLATFORM_SETTINGS.themeVibe,
        toySquad: (dbSettings.toySquad as MockPlatformSettings['toySquad']) || INITIAL_PLATFORM_SETTINGS.toySquad,
        accentColorPalette: (dbSettings.accentColorPalette as MockPlatformSettings['accentColorPalette']) || INITIAL_PLATFORM_SETTINGS.accentColorPalette,
        backgroundStyle: (dbSettings.backgroundStyle as MockPlatformSettings['backgroundStyle']) || INITIAL_PLATFORM_SETTINGS.backgroundStyle,
        customBackgroundUrl: dbSettings.customBackgroundUrl ?? INITIAL_PLATFORM_SETTINGS.customBackgroundUrl,
        cardVibeStyle: (dbSettings.cardVibeStyle as MockPlatformSettings['cardVibeStyle']) || INITIAL_PLATFORM_SETTINGS.cardVibeStyle,
      };
      return localMemSettings;
    }
  } catch (err) {
    console.warn("Platform settings fetch DB fallback:", err);
  }

  return INITIAL_PLATFORM_SETTINGS;
};

/**
 * Cached platform settings getter using Next.js Data Cache (unstable_cache).
 * Revalidates every 10 minutes or instantly via revalidateTag('platform-settings').
 */
const getCachedPlatformSettings = unstable_cache(
  fetchPlatformSettingsFromDb,
  ["platform-settings-key"],
  {
    revalidate: 600, // 10 minutes
    tags: ["platform-settings"],
  }
);

/**
 * Request-memoized and Data-Cache optimized getter for platform settings.
 * Safe to call across metadata generators, server components, and layout shells simultaneously.
 */
export const getPlatformSettings = cache(async (): Promise<MockPlatformSettings> => {
  return getCachedPlatformSettings();
});

/**
 * Invalidates both the Next.js Data Cache tag and the process-local cache
 * so updates immediately propagate across all running instances.
 */
export function invalidatePlatformSettingsCache(): void {
  localMemSettings = null;
  try {
    revalidateTag("platform-settings", { expire: 0 });
    revalidateTag("landing-data", { expire: 0 });
  } catch (err) {
    console.warn("Tag revalidation note:", err);
  }
}
