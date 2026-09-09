import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateSecureVoucherBatch } from "@/lib/security/crypto-voucher";
import { NotFoundError } from "@/server/errors";

export interface SaveVouchersPayload {
  vouchers: Array<{ code: string; serialNumber?: string; priceEgp?: number }>;
  batchName?: string;
  gradeNumber?: number;
  unitId?: string;
}

export interface GenerateSecureVouchersPayload {
  gradeNumber: number;
  quantity: number;
  priceEgp: number;
  batchName?: string;
  unitId?: string;
}

export async function saveVouchers(payload: SaveVouchersPayload) {
  const { vouchers, batchName, gradeNumber, unitId } = payload;

  let unitIdToBind: string | null = (unitId && typeof unitId === "string" && unitId.trim()) ? unitId.trim() : null;

  if (!unitIdToBind) {
    const gradeSlug = `grade-${gradeNumber || 1}`;
    const [foundGrade] = await db
      .select({ id: schema.grade.id })
      .from(schema.grade)
      .where(eq(schema.grade.slug, gradeSlug))
      .limit(1);

    if (foundGrade) {
      const [foundUnit] = await db
        .select({ id: schema.courseUnit.id })
        .from(schema.courseUnit)
        .where(eq(schema.courseUnit.gradeId, foundGrade.id))
        .orderBy(schema.courseUnit.orderIndex)
        .limit(1);
      if (foundUnit) unitIdToBind = foundUnit.id;
    }
  }

  if (!unitIdToBind) {
    throw new NotFoundError("لم يتم العثور على وحدة دراسية مطابقة للصف المحدد لربط كروت الشحن بها.");
  }

  let insertedCount = 0;
  if (vouchers && vouchers.length > 0) {
    const recordsToInsert = vouchers.map((v) => ({
      code: v.code.trim().toUpperCase(),
      unitId: unitIdToBind!,
      isRedeemed: false,
      serialNumber: v.serialNumber || null,
      priceEgp: v.priceEgp || null,
      batchName: batchName || "دفعة سناتر ومكتبات 2026",
    }));

    const inserted = await db
      .insert(schema.voucherCode)
      .values(recordsToInsert)
      .onConflictDoNothing()
      .returning({ id: schema.voucherCode.id });

    insertedCount = inserted.length;
  }

  return {
    success: true,
    count: insertedCount,
    message: `تم حفظ ${insertedCount} كارت شحن بنجاح في قاعدة البيانات وتفعيلها للاستخدام الفوري.`,
  };
}

export async function generateSecureVouchers(payload: GenerateSecureVouchersPayload) {
  const { gradeNumber, quantity, priceEgp, batchName, unitId } = payload;

  const safeGrade = Math.max(1, Math.min(6, gradeNumber || 1));
  const safeQty = Math.max(1, Math.min(500, quantity || 10));
  const safePrice = Math.max(10, priceEgp || 150);

  const generatedList = generateSecureVoucherBatch({
    gradeNumber: safeGrade,
    quantity: safeQty,
    priceEgp: safePrice,
  });

  let unitIdToBind: string | null = (unitId && typeof unitId === "string" && unitId.trim()) ? unitId.trim() : null;

  if (!unitIdToBind) {
    const gradeSlug = `grade-${safeGrade}`;
    const [foundGrade] = await db
      .select({ id: schema.grade.id })
      .from(schema.grade)
      .where(eq(schema.grade.slug, gradeSlug))
      .limit(1);

    if (foundGrade) {
      const [foundUnit] = await db
        .select({ id: schema.courseUnit.id })
        .from(schema.courseUnit)
        .where(eq(schema.courseUnit.gradeId, foundGrade.id))
        .orderBy(schema.courseUnit.orderIndex)
        .limit(1);
      if (foundUnit) unitIdToBind = foundUnit.id;
    }
  }

  if (!unitIdToBind) {
    throw new NotFoundError("لم يتم العثور على وحدة دراسية مطابقة للصف المحدد لربط كروت الشحن بها.");
  }

  let insertedCount = 0;
  if (generatedList.length > 0) {
    const recordsToInsert = generatedList.map((v) => ({
      code: v.code.trim().toUpperCase(),
      unitId: unitIdToBind!,
      isRedeemed: false,
      serialNumber: v.serialNumber || null,
      priceEgp: v.priceEgp || null,
      batchName: batchName || `دفعة كروت سناتر الصف ${safeGrade} - مشفرة عالي الأمان`,
    }));

    const inserted = await db
      .insert(schema.voucherCode)
      .values(recordsToInsert)
      .onConflictDoNothing()
      .returning({ id: schema.voucherCode.id });

    insertedCount = inserted.length;
  }

  return {
    success: true,
    vouchers: generatedList,
    count: insertedCount,
    message: `تم توليد وحفظ ${insertedCount} كارت شحن عالي التشفير بنجاح في قاعدة البيانات.`,
  };
}
