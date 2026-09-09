import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { INITIAL_PLATFORM_SETTINGS, type MockPlatformSettings } from "@/lib/db/mock-data";
import { getPlatformSettings, invalidatePlatformSettingsCache } from "@/lib/utils/platform-settings";

export type UpdateSettingsPayload = Partial<MockPlatformSettings>;

export async function getAdminSettingsData() {
  try {
    return await getPlatformSettings();
  } catch (err) {
    console.warn("Platform settings DB note:", err);
    return INITIAL_PLATFORM_SETTINGS;
  }
}

export async function updatePlatformSettings(payload: UpdateSettingsPayload) {
  // Strip immutable / reserved fields from payload
  const { id: _ignoredId, updatedAt: _ignoredUpdatedAt, createdAt: _ignoredCreatedAt, ...safePayload } = payload as Record<string, unknown>;

  const [existing] = await db
    .select()
    .from(schema.platformSettings)
    .where(eq(schema.platformSettings.id, "default"))
    .limit(1);

  if (existing) {
    await db
      .update(schema.platformSettings)
      .set({
        ...safePayload,
        updatedAt: new Date(),
      })
      .where(eq(schema.platformSettings.id, "default"));
  } else {
    await db.insert(schema.platformSettings).values({
      id: "default",
      academyNameArabic: payload.academyNameArabic || INITIAL_PLATFORM_SETTINGS.academyNameArabic,
      academyNameEnglish: payload.academyNameEnglish || INITIAL_PLATFORM_SETTINGS.academyNameEnglish,
      teacherNameArabic: payload.teacherNameArabic || INITIAL_PLATFORM_SETTINGS.teacherNameArabic,
      teacherNameEnglish: payload.teacherNameEnglish || INITIAL_PLATFORM_SETTINGS.teacherNameEnglish,
      teacherTitle: payload.teacherTitle || INITIAL_PLATFORM_SETTINGS.teacherTitle,
      teacherBio: payload.teacherBio || INITIAL_PLATFORM_SETTINGS.teacherBio,
      whatsappNumber: payload.whatsappNumber || INITIAL_PLATFORM_SETTINGS.whatsappNumber,
      hotlineNumber: payload.hotlineNumber || INITIAL_PLATFORM_SETTINGS.hotlineNumber,
      inquiriesNumber: payload.inquiriesNumber || INITIAL_PLATFORM_SETTINGS.inquiriesNumber,
      vodafoneCashNumber: payload.vodafoneCashNumber || INITIAL_PLATFORM_SETTINGS.vodafoneCashNumber,
      instapayAddress: payload.instapayAddress || INITIAL_PLATFORM_SETTINGS.instapayAddress,
      heroVideoUrl: payload.heroVideoUrl || INITIAL_PLATFORM_SETTINGS.heroVideoUrl,
      sampleLectures: payload.sampleLectures || INITIAL_PLATFORM_SETTINGS.sampleLectures,
      enableHeroToys: payload.enableHeroToys ?? INITIAL_PLATFORM_SETTINGS.enableHeroToys,
      enableHeroPhonicsStrip: payload.enableHeroPhonicsStrip ?? INITIAL_PLATFORM_SETTINGS.enableHeroPhonicsStrip,
      enableMascotCards: payload.enableMascotCards ?? INITIAL_PLATFORM_SETTINGS.enableMascotCards,
      themeVibe: payload.themeVibe || INITIAL_PLATFORM_SETTINGS.themeVibe,
      toySquad: payload.toySquad || INITIAL_PLATFORM_SETTINGS.toySquad,
      accentColorPalette: payload.accentColorPalette || INITIAL_PLATFORM_SETTINGS.accentColorPalette,
      backgroundStyle: payload.backgroundStyle || INITIAL_PLATFORM_SETTINGS.backgroundStyle,
      customBackgroundUrl: payload.customBackgroundUrl ?? INITIAL_PLATFORM_SETTINGS.customBackgroundUrl,
      cardVibeStyle: payload.cardVibeStyle || INITIAL_PLATFORM_SETTINGS.cardVibeStyle,
    });
  }

  invalidatePlatformSettingsCache();

  return {
    success: true,
    message: "تم حفظ وتحديث إعدادات المنصة والهوية البصرية ومحاضرات الكاروسيل بنجاح.",
  };
}

export async function resetPlatformSettings() {
  const [existing] = await db
    .select()
    .from(schema.platformSettings)
    .where(eq(schema.platformSettings.id, "default"))
    .limit(1);

  if (existing) {
    await db
      .update(schema.platformSettings)
      .set({
        academyNameArabic: INITIAL_PLATFORM_SETTINGS.academyNameArabic,
        academyNameEnglish: INITIAL_PLATFORM_SETTINGS.academyNameEnglish,
        teacherNameArabic: INITIAL_PLATFORM_SETTINGS.teacherNameArabic,
        teacherNameEnglish: INITIAL_PLATFORM_SETTINGS.teacherNameEnglish,
        teacherTitle: INITIAL_PLATFORM_SETTINGS.teacherTitle,
        teacherBio: INITIAL_PLATFORM_SETTINGS.teacherBio,
        whatsappNumber: INITIAL_PLATFORM_SETTINGS.whatsappNumber,
        hotlineNumber: INITIAL_PLATFORM_SETTINGS.hotlineNumber,
        inquiriesNumber: INITIAL_PLATFORM_SETTINGS.inquiriesNumber,
        vodafoneCashNumber: INITIAL_PLATFORM_SETTINGS.vodafoneCashNumber,
        instapayAddress: INITIAL_PLATFORM_SETTINGS.instapayAddress,
        heroVideoUrl: INITIAL_PLATFORM_SETTINGS.heroVideoUrl,
        sampleLectures: INITIAL_PLATFORM_SETTINGS.sampleLectures,
        enableHeroToys: INITIAL_PLATFORM_SETTINGS.enableHeroToys,
        enableHeroPhonicsStrip: INITIAL_PLATFORM_SETTINGS.enableHeroPhonicsStrip,
        enableMascotCards: INITIAL_PLATFORM_SETTINGS.enableMascotCards,
        themeVibe: INITIAL_PLATFORM_SETTINGS.themeVibe,
        toySquad: INITIAL_PLATFORM_SETTINGS.toySquad,
        accentColorPalette: INITIAL_PLATFORM_SETTINGS.accentColorPalette,
        backgroundStyle: INITIAL_PLATFORM_SETTINGS.backgroundStyle,
        customBackgroundUrl: INITIAL_PLATFORM_SETTINGS.customBackgroundUrl,
        cardVibeStyle: INITIAL_PLATFORM_SETTINGS.cardVibeStyle,
        updatedAt: new Date(),
      })
      .where(eq(schema.platformSettings.id, "default"));
  } else {
    await db.insert(schema.platformSettings).values({
      ...INITIAL_PLATFORM_SETTINGS,
    });
  }

  invalidatePlatformSettingsCache();

  return {
    success: true,
    settings: INITIAL_PLATFORM_SETTINGS,
    message: "تمت استعادة كافة الإعدادات القياسية الافتراضية بنجاح!",
  };
}
