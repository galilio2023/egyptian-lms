"use client";

import { toast } from "sonner";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Universal client-side fetch helper with unified error handling, JSON parsing, and optional toast notifications.
 */
export async function apiClient<T = unknown>(
  url: string,
  init?: RequestInit & ApiRequestOptions
): Promise<ApiResponse<T>> {
  const {
    showToast = true,
    successMessage,
    errorMessage,
    headers,
    ...restInit
  } = init || {};

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...restInit,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.error) {
      const msg = data?.error || errorMessage || `فشل الطلب (${res.status})`;
      if (showToast) {
        toast.error(msg);
      }
      return { success: false, error: msg, data: data as T };
    }

    if (showToast && successMessage) {
      toast.success(successMessage);
    }

    return { success: true, data: data as T };
  } catch {
    const msg = errorMessage || "حدث خطأ أثناء الاتصال بالخادم. يرجى التحقق من اتصالك.";
    if (showToast) {
      toast.error(msg);
    }
    return { success: false, error: msg };
  }
}

/**
 * Perform a GET request with JSON response parsing
 */
export async function apiGet<T = unknown>(
  url: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiClient<T>(url, {
    method: "GET",
    ...options,
  });
}

/**
 * Perform a POST request with JSON body and response parsing
 */
export async function apiPost<T = unknown>(
  url: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiClient<T>(url, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
}
