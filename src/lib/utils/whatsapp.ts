/**
 * Centralized WhatsApp helper to format Egyptian phone numbers and generate wa.me deep links.
 */
export function formatEgyptianWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("01") && digits.length === 11) {
    return `2${digits}`;
  }
  if (digits.startsWith("1") && digits.length === 10) {
    return `20${digits}`;
  }
  if (digits.startsWith("20") && digits.length === 12) {
    return digits;
  }
  return digits;
}

export function getWhatsAppChatUrl(phone: string, message?: string): string {
  const formattedPhone = formatEgyptianWhatsAppNumber(phone);
  if (!message) {
    return `https://wa.me/${formattedPhone}`;
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
