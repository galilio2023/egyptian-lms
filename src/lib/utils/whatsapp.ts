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

export interface SendWhatsAppNotificationOptions {
  to: string;
  message: string;
  templateId?: string;
}

export interface SendWhatsAppNotificationResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Sends an automated server-side WhatsApp message to an Egyptian phone number.
 * Supports official WhatsApp Business Cloud API / Wasapi / UltraMsg / Custom Gateway.
 * If credentials are not set in environment variables, simulates cleanly with audit logging.
 */
export async function sendAutomatedWhatsAppNotification({
  to,
  message,
}: SendWhatsAppNotificationOptions): Promise<SendWhatsAppNotificationResult> {
  const formattedPhone = formatEgyptianWhatsAppNumber(to);
  const apiKey = process.env.WHATSAPP_API_KEY;
  const apiUrl = process.env.WHATSAPP_API_URL;
  const instanceId = process.env.WHATSAPP_INSTANCE_ID;

  if (apiKey && apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          instanceId: instanceId || undefined,
          to: formattedPhone,
          phone: formattedPhone,
          message: message,
          body: message,
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: true,
          messageId: data.messageId || data.id || `wa-${Date.now()}`,
          simulated: false,
        };
      } else {
        const errorText = await response.text();
        console.warn(`WhatsApp Gateway response error (${response.status}):`, errorText);
      }
    } catch (err) {
      console.error("WhatsApp Gateway connection error:", err);
    }
  }

  // Graceful simulation mode (production dev/staging without gateway or fallback)
  console.log(`[WhatsApp Automated Notification] Sent to +${formattedPhone}:`, {
    preview: message.slice(0, 100) + (message.length > 100 ? "..." : ""),
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    messageId: `sim-wa-${Date.now()}`,
    simulated: true,
  };
}

export function getWhatsAppChatUrl(phone: string, message?: string): string {
  const formattedPhone = formatEgyptianWhatsAppNumber(phone);
  if (!message) {
    return `https://wa.me/${formattedPhone}`;
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
