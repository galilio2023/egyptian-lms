import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { INITIAL_GRADES, INITIAL_UNITS, INITIAL_LESSONS, INITIAL_QUIZ, INITIAL_PLATFORM_SETTINGS } from './mock-data';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Seed Teacher / Admin User
  console.log("Creating/verifying admin and teacher users...");
  const adminPhone = "01000000000";
  const [existingAdmin] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.phoneNumber, adminPhone))
    .limit(1);

  let adminUserId = existingAdmin?.id;
  if (!adminUserId) {
    const adminId = "admin-primary";
    await db.insert(schema.user).values({
      id: adminId,
      name: "المشرف الأكاديمي",
      phoneNumber: adminPhone,
      email: `admin@elite-academy.edu.eg`,
      emailVerified: true,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    adminUserId = adminId;
  }

  // 2. Seed Grades
  console.log("Seeding grades...");
  const gradeIdMap = new Map<string, string>(); // slug -> db id

  for (const g of INITIAL_GRADES) {
    const [existing] = await db
      .select()
      .from(schema.grade)
      .where(eq(schema.grade.slug, g.slug))
      .limit(1);

    if (existing) {
      gradeIdMap.set(g.slug, existing.id);
    } else {
      const [inserted] = await db.insert(schema.grade).values({
        titleArabic: g.titleArabic,
        titleEnglish: g.titleEnglish,
        slug: g.slug,
        gradeNumber: g.gradeNumber,
        badgeColor: g.badgeColor,
        orderIndex: g.gradeNumber,
      }).returning({ id: schema.grade.id });
      gradeIdMap.set(g.slug, inserted.id);
    }
  }

  // 3. Seed Course Units
  console.log("Seeding course units...");
  const unitIdMap = new Map<string, string>(); // mock id (e.g. u-101) -> db id

  for (const u of INITIAL_UNITS) {
    const dbGradeId = gradeIdMap.get(u.gradeSlug);
    if (!dbGradeId) continue;

    const [existing] = await db
      .select()
      .from(schema.courseUnit)
      .where(eq(schema.courseUnit.slug, u.slug))
      .limit(1);

    if (existing) {
      unitIdMap.set(u.id, existing.id);
    } else {
      const [inserted] = await db.insert(schema.courseUnit).values({
        gradeId: dbGradeId,
        title: u.title,
        slug: u.slug,
        description: u.description,
        thumbnailUrl: u.thumbnailUrl,
        price: u.priceEgp,
        orderIndex: 1,
        isPublished: true,
      }).returning({ id: schema.courseUnit.id });
      unitIdMap.set(u.id, inserted.id);
    }
  }

  // 4. Seed Lessons for Unit 1
  console.log("Seeding lessons for Unit 1...");
  const dbUnitId = unitIdMap.get("u-101");
  let firstLessonId: string | null = null;

  if (dbUnitId) {
    for (const l of INITIAL_LESSONS) {
      const [existing] = await db
        .select()
        .from(schema.lesson)
        .where(eq(schema.lesson.slug, l.slug))
        .limit(1);

      if (existing) {
        if (!firstLessonId) firstLessonId = existing.id;
      } else {
        const [inserted] = await db.insert(schema.lesson).values({
          unitId: dbUnitId,
          title: l.title,
          slug: l.slug,
          videoProvider: "bunny",
          videoId: l.videoUrl,
          videoDurationSeconds: 1440,
          pdfAttachmentUrl: l.pdfAttachmentUrl,
          isFreePreview: l.isFreePreview,
          orderIndex: l.orderIndex,
        }).returning({ id: schema.lesson.id });
        if (!firstLessonId) firstLessonId = inserted.id;
      }
    }
  }

  // 5. Seed Interactive Quiz & Questions
  console.log("Seeding quiz & questions...");
  if (dbUnitId && firstLessonId) {
    const [existingQuiz] = await db
      .select()
      .from(schema.quiz)
      .where(eq(schema.quiz.unitId, dbUnitId))
      .limit(1);

    let quizId = existingQuiz?.id;
    if (!quizId) {
      const [insertedQuiz] = await db.insert(schema.quiz).values({
        lessonId: firstLessonId,
        unitId: dbUnitId,
        title: INITIAL_QUIZ.title,
        timeLimitMinutes: INITIAL_QUIZ.timeLimitMinutes,
        passPercentage: INITIAL_QUIZ.passPercentage,
        maxAttempts: 3,
      }).returning({ id: schema.quiz.id });
      quizId = insertedQuiz.id;

      // Seed Questions
      for (let i = 0; i < INITIAL_QUIZ.questions.length; i++) {
        const q = INITIAL_QUIZ.questions[i];
        await db.insert(schema.quizQuestion).values({
          quizId: quizId,
          questionText: q.text,
          questionAudioUrl: q.audioUrl,
          questionType: "multiple_choice",
          options: q.options,
          explanation: q.explanation,
          points: 1,
          orderIndex: i + 1,
        });
      }
    }
  }

  // 6. Seed Sample Center Voucher Codes
  console.log("Seeding sample scratch card vouchers...");
  if (dbUnitId) {
    const sampleVouchers = [
      "ELITE-GR1-2026-VIP",
      "ELITE-GR1-9982-101",
      "ELITE-GR1-7764-202",
      "ELITE-GR1-5541-303",
    ];

    for (const code of sampleVouchers) {
      const [existing] = await db
        .select()
        .from(schema.voucherCode)
        .where(eq(schema.voucherCode.code, code))
        .limit(1);

      if (!existing) {
        await db.insert(schema.voucherCode).values({
          code,
          unitId: dbUnitId,
          isRedeemed: false,
          batchName: "دفعة سناتر أكتوبر التجريبية 2026",
        });
      }
    }
  }

  // 7. Seed Platform Settings & Branding
  console.log("Seeding platform settings & branding...");
  const [existingSettings] = await db
    .select()
    .from(schema.platformSettings)
    .where(eq(schema.platformSettings.id, "default"))
    .limit(1);

  if (!existingSettings) {
    await db.insert(schema.platformSettings).values({
      id: "default",
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
    });
  }

  console.log("✅ Seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  });
