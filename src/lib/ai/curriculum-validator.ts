/**
 * Curriculum Quality & Integrity Validator.
 * Validates parsed curriculum structures against Egyptian Ministry pedagogical standards.
 */

import { ParsedCurriculumUnit } from "./curriculum-intake-parser";

export interface ValidationErrorItem {
  field: string;
  message: string;
  severity: "critical" | "error";
}

export interface ValidationWarningItem {
  field: string;
  message: string;
}

export interface CurriculumValidationResult {
  valid: boolean;
  score: number; // Quality score 0-100
  errors: ValidationErrorItem[];
  warnings: ValidationWarningItem[];
}

export function validateParsedCurriculum(unit: ParsedCurriculumUnit): CurriculumValidationResult {
  const errors: ValidationErrorItem[] = [];
  const warnings: ValidationWarningItem[] = [];
  let deductions = 0;

  // 1. Title validation
  if (!unit.titleEnglish?.trim()) {
    errors.push({
      field: "العنوان بالإنجليزية",
      message: "عنوان الوحدة باللغة الإنجليزية مطلوب.",
      severity: "critical",
    });
    deductions += 25;
  }

  if (!unit.titleArabic?.trim()) {
    errors.push({
      field: "العنوان بالعربية",
      message: "عنوان الوحدة باللغة العربية مطلوب لتسهيل الفهم على أولياء الأمور.",
      severity: "error",
    });
    deductions += 15;
  }

  // 2. Lessons validation
  if (!unit.lessons || unit.lessons.length === 0) {
    errors.push({
      field: "الدروس والمحاضرات",
      message: "يجب أن تحتوي الوحدة على درس تعليمي واحد على الأقل.",
      severity: "critical",
    });
    deductions += 30;
  } else {
    if (unit.lessons.length > 10) {
      warnings.push({
        field: "عدد الدروس",
        message: "تحتوي الوحدة على أكثر من 10 دروس، قد يشكل ذلك عبئاً دراسياً على الطلاب الصغار.",
      });
      deductions += 5;
    }
    const hasFreePreview = unit.lessons.some((l) => l.isFreePreview);
    if (!hasFreePreview) {
      warnings.push({
        field: "معاينة مجانية",
        message: "يُفضل تفعيل درس واحد كمعاينة مجانية لجذب الطلاب وأولياء الأمور.",
      });
      deductions += 5;
    }
  }

  // 3. Vocabulary validation
  if (!unit.vocabulary || unit.vocabulary.length === 0) {
    warnings.push({
      field: "المفردات والصوتيات",
      message: "لم يتم العثور على قائمة مفردات رئيسية داخل هذه الوحدة.",
    });
    deductions += 15;
  } else if (unit.vocabulary.length < 4) {
    warnings.push({
      field: "المفردات",
      message: "عدد المفردات المستخرجة قليل جداً (أقل من 4 كلمات).",
    });
    deductions += 5;
  }

  // 4. Quiz Questions validation
  if (!unit.quizQuestions || unit.quizQuestions.length === 0) {
    warnings.push({
      field: "بنك الأسئلة",
      message: "لم يتم استخراج أسئلة اختبار تفاعلي لهذه الوحدة.",
    });
    deductions += 15;
  } else {
    unit.quizQuestions.forEach((q, idx) => {
      const hasCorrect = q.options?.some((o) => o.isCorrect);
      if (!hasCorrect) {
        errors.push({
          field: `السؤال ${idx + 1}`,
          message: `السؤال "${q.questionText}" لا يحتوي على إجابة صحيحة محددة.`,
          severity: "critical",
        });
        deductions += 15;
      }
      if (!q.options || q.options.length < 2) {
        errors.push({
          field: `السؤال ${idx + 1}`,
          message: `يجب أن يحتوي السؤال على خيارين على الأقل.`,
          severity: "error",
        });
        deductions += 10;
      }
    });
  }

  const score = Math.max(0, 100 - deductions);
  const valid = errors.filter((e) => e.severity === "critical").length === 0;

  return {
    valid,
    score,
    errors,
    warnings,
  };
}
