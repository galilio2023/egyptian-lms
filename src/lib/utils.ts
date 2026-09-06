import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEGP(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Valid Egyptian mobile prefixes: 010, 011, 012, 015 */
const EGYPTIAN_PHONE_REGEX = /^01[0125]\d{8}$/;

/**
 * Validates an Egyptian mobile phone number.
 * Accepts: 01012345678, 2010xxxxxxxx, +2010xxxxxxxx, 002010xxxxxxxx
 * Returns the normalized 11-digit form (0xxxxxxxxxx) or null if invalid.
 */
export function validateEgyptianPhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');
  let normalized = cleaned;

  // Strip country code variants: 0020..., 200..., 20..., 0...
  if (cleaned.startsWith('00200') && cleaned.length === 15) {
    normalized = '0' + cleaned.slice(5);
  } else if (cleaned.startsWith('0020') && cleaned.length === 14) {
    normalized = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('002') && cleaned.length === 14) {
    normalized = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('200') && cleaned.length === 13) {
    normalized = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('20') && cleaned.length === 12) {
    normalized = '0' + cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    normalized = cleaned;
  } else {
    return null;
  }

  return EGYPTIAN_PHONE_REGEX.test(normalized) ? normalized : null;
}

/**
 * Formats an Egyptian phone number to the standard 11-digit form.
 * @deprecated Use validateEgyptianPhone() instead for validation + formatting.
 */
export function formatEgyptianPhone(phone: string): string {
  return validateEgyptianPhone(phone) ?? phone;
}

export const EGYPTIAN_GOVERNORATE_MAP: Record<string, string> = {
  'القاهرة': 'cairo',
  'الجيزة': 'giza',
  'الإسكندرية': 'alexandria',
  'الدقهلية': 'dakahlia',
  'الدقهلية (المنصورة)': 'dakahlia',
  'البحر الأحمر': 'red_sea',
  'البحيرة': 'beheira',
  'الفيوم': 'fayoum',
  'الغربية': 'gharbiya',
  'الغربية (طنطا)': 'gharbiya',
  'الإسماعيلية': 'ismailia',
  'المنوفية': 'menofia',
  'المنيا': 'minya',
  'القليوبية': 'qaliubiya',
  'الوادي الجديد': 'new_valley',
  'السويس': 'suez',
  'أسوان': 'aswan',
  'أسيوط': 'assiut',
  'بني سويف': 'beni_suef',
  'بورسعيد': 'port_said',
  'دمياط': 'damietta',
  'الشرقية': 'sharkia',
  'جنوب سيناء': 'south_sinai',
  'كفر الشيخ': 'kafr_el_sheikh',
  'مطروح': 'matrouh',
  'الأقصر': 'luxor',
  'قنا': 'qena',
  'شمال سيناء': 'north_sinai',
  'سوهاج': 'sohag',
};

export function normalizeGovernorate(gov: string): string {
  if (!gov) return 'cairo';
  return EGYPTIAN_GOVERNORATE_MAP[gov] || gov.toLowerCase().replace(/\s+/g, '_');
}
