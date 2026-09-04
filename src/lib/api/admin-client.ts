"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface AdminApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Executes an admin mutation action via POST /api/admin/actions
 */
export async function executeAdminAction<TResult = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showToast?: boolean;
  }
): Promise<AdminApiResponse<TResult>> {
  const showToast = options?.showToast ?? true;

  try {
    const res = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      const errorMsg = data.error || options?.errorMessage || "حدث خطأ أثناء معالجة الطلب.";
      if (showToast) {
        toast.error(errorMsg);
      }
      return { success: false, error: errorMsg };
    }

    if (showToast && options?.successMessage) {
      toast.success(options.successMessage);
    }

    return { success: true, data: data as TResult };
  } catch (err) {
    const errorMsg = options?.errorMessage || "حدث خطأ في الاتصال بالخادم.";
    if (showToast) {
      toast.error(errorMsg);
    }
    return { success: false, error: errorMsg };
  }
}

/**
 * Fetches admin resource data via GET /api/admin/actions?type={resourceType}
 */
export async function fetchAdminData<T = unknown>(resourceType: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/admin/actions?type=${encodeURIComponent(resourceType)}`);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data as T | null;
  } catch {
    return null;
  }
}

/**
 * React hook for fetching and refreshing admin resource data
 */
export function useAdminQuery<T>(
  resourceType: string,
  initialData: T,
  extractData?: (apiResponse: Record<string, unknown>) => T | undefined
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminData<Record<string, unknown>>(resourceType);
      if (response) {
        if (extractData) {
          const extracted = extractData(response);
          if (extracted !== undefined) {
            setData(extracted);
          }
        } else if (response[resourceType]) {
          setData(response[resourceType] as T);
        }
      }
    } catch {
      setError("فشل تحميل البيانات من الخادم");
    } finally {
      setIsLoading(false);
    }
  }, [resourceType, extractData]);

  useEffect(() => {
    let active = true;

    fetchAdminData<Record<string, unknown>>(resourceType)
      .then((response) => {
        if (!active || !response) return;
        if (extractData) {
          const extracted = extractData(response);
          if (extracted !== undefined) {
            setData(extracted);
          }
        } else if (response[resourceType]) {
          setData(response[resourceType] as T);
        }
      })
      .catch(() => {
        if (active) setError("فشل تحميل البيانات");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [resourceType, extractData]);

  return { data, setData, isLoading, error, refetch };
}
