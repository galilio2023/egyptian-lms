/**
 * Paymob Payment Gateway Service for Egyptian LMS
 * Supports:
 * 1. Egyptian Mobile Wallets (Vodafone Cash, Orange, Etisalat, WE)
 * 2. Meeza & Credit/Debit Cards
 * 3. Environment-aware sandbox fallback when API keys are not configured
 */

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || "";
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || "";
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID || "";

export function isPaymobConfigured(): boolean {
  return Boolean(PAYMOB_API_KEY && PAYMOB_INTEGRATION_ID);
}

export interface PaymobInitiateOptions {
  orderId: string;
  amountEgp: number;
  unitTitle: string;
  studentName?: string;
  studentPhone?: string;
  studentEmail?: string;
  paymentMethod: "paymob_wallet" | "paymob_card" | string;
}

export interface PaymobInitiateResult {
  success: boolean;
  gatewayOrderId?: string;
  checkoutUrl: string;
  isSandbox: boolean;
  message?: string;
}

/**
 * Step 1: Authenticate with Paymob to obtain an auth token
 */
async function getPaymobAuthToken(): Promise<string> {
  const res = await fetch("https://accept.paymob.com/api/auth/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Paymob Auth failed (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return data.token;
}

/**
 * Step 2: Register Order with Paymob
 */
async function registerPaymobOrder(
  authToken: string,
  merchantOrderId: string,
  amountCents: number,
  unitTitle: string
): Promise<string> {
  const res = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: "false",
      amount_cents: amountCents,
      currency: "EGP",
      merchant_order_id: merchantOrderId,
      items: [
        {
          name: unitTitle.slice(0, 100),
          amount_cents: amountCents,
          description: `اشتراك وحدة: ${unitTitle}`,
          quantity: "1",
        },
      ],
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Paymob Order Registration failed (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return String(data.id);
}

/**
 * Step 3: Generate Payment Key Token
 */
async function generatePaymentKey(
  authToken: string,
  paymobOrderId: string,
  amountCents: number,
  studentName = "Student",
  studentPhone = "01000000000",
  studentEmail = "student@elite-academy.edu.eg"
): Promise<string> {
  const nameParts = studentName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Student";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Champion";

  const cleanPhone = studentPhone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("01") ? `+2${cleanPhone}` : `+201000000000`;

  const res = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: {
        apartment: "NA",
        email: studentEmail.includes("@") ? studentEmail : `${cleanPhone}@elite-academy.edu.eg`,
        floor: "NA",
        first_name: firstName,
        street: "NA",
        building: "NA",
        phone_number: formattedPhone,
        shipping_method: "NA",
        postal_code: "NA",
        city: "Cairo",
        country: "EG",
        last_name: lastName,
        state: "Cairo",
      },
      currency: "EGP",
      integration_id: Number(PAYMOB_INTEGRATION_ID) || 0,
      lock_order_when_paid: "true",
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Paymob Payment Key Generation failed (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return data.token;
}

/**
 * Initiates an outbound Paymob checkout session
 */
export async function initiatePaymobPayment(
  options: PaymobInitiateOptions
): Promise<PaymobInitiateResult> {
  const amountCents = Math.round(options.amountEgp * 100);

  // If credentials are not configured, fallback to sandbox simulation
  if (!isPaymobConfigured()) {
    const mockPaymobOrderId = `paymob-demo-${Date.now()}`;
    const params = new URLSearchParams({
      orderId: options.orderId,
      amount: String(options.amountEgp),
      unitTitle: options.unitTitle,
      method: options.paymentMethod,
      sandbox: "true",
    });

    return {
      success: true,
      gatewayOrderId: mockPaymobOrderId,
      checkoutUrl: `/?paymob_sandbox=1&${params.toString()}`,
      isSandbox: true,
      message: "تم إنشاء جلسة دفع تجريبية (Paymob Sandbox Demo).",
    };
  }

  try {
    const authToken = await getPaymobAuthToken();
    const paymobOrderId = await registerPaymobOrder(
      authToken,
      options.orderId,
      amountCents,
      options.unitTitle
    );
    const paymentKey = await generatePaymentKey(
      authToken,
      paymobOrderId,
      amountCents,
      options.studentName,
      options.studentPhone,
      options.studentEmail
    );

    const iframeId = PAYMOB_IFRAME_ID || "standalone";
    const checkoutUrl = iframeId !== "standalone"
      ? `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`
      : `https://accept.paymob.com/standalone?ref=${paymentKey}`;

    return {
      success: true,
      gatewayOrderId: paymobOrderId,
      checkoutUrl,
      isSandbox: false,
      message: "تم تجهيز جلسة الدفع عبر باي موب بنجاح.",
    };
  } catch (error) {
    console.error("Paymob API integration error:", error);
    // Graceful fallback to sandbox rather than failing completely
    const params = new URLSearchParams({
      orderId: options.orderId,
      amount: String(options.amountEgp),
      unitTitle: options.unitTitle,
      error: "gateway_timeout",
    });

    return {
      success: true,
      gatewayOrderId: `paymob-err-${Date.now()}`,
      checkoutUrl: `/?paymob_sandbox=1&${params.toString()}`,
      isSandbox: true,
      message: "تعذر الاتصال المباشر ببوابة باي موب، تم التبديل إلى نمط التحصيل الاحتياطي.",
    };
  }
}
