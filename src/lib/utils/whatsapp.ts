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

function maskPhoneNumber(phone: string): string {
  if (phone.length <= 6) return "***";
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
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
  const maskedPhone = maskPhoneNumber(formattedPhone);
  const apiKey = process.env.WHATSAPP_API_KEY;
  const apiUrl = process.env.WHATSAPP_API_URL;
  const instanceId = process.env.WHATSAPP_INSTANCE_ID;

  if (apiKey && apiUrl) {
    // CWE-319: Enforce HTTPS transport encryption
    if (!apiUrl.startsWith("https://")) {
      console.error("WhatsApp Gateway URL rejected: Must use HTTPS transport");
      return {
        success: false,
        error: "WHATSAPP_API_URL must use HTTPS protocol",
      };
    }

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
        signal: AbortSignal.timeout(10000),
        redirect: "error",
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: true,
          messageId: data.messageId || data.id || `wa-${Date.now()}`,
          simulated: false,
        };
      } else {
        const errorText = await response.text().catch(() => "");
        console.warn(`WhatsApp Gateway response error (${response.status}) for ${maskedPhone}`);
        return {
          success: false,
          error: `WhatsApp gateway returned HTTP ${response.status}`,
        };
      }
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
      console.error(`WhatsApp Gateway request failed for ${maskedPhone}:`, isTimeout ? "Timeout" : "Connection failed");
      return {
        success: false,
        error: isTimeout ? "WhatsApp gateway request timed out after 10s" : "WhatsApp gateway connection failed",
      };
    }
  }

  // Graceful simulation mode (only when gateway credentials are not configured)
  // CWE-532: Log only delivery metadata with masked phone, omitting sensitive student academic message body
  console.log(`[WhatsApp Automated Notification] Simulation dispatched to +${maskedPhone}`, {
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
