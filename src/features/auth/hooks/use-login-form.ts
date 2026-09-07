"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { signIn, signOut } from "@/lib/auth/auth-client";
import { validateEgyptianPhone } from "@/lib/utils";
import { apiPost } from "@/lib/api/api-client";
import { getOrCreateDeviceId } from "@/lib/utils/device";

export interface DeviceLockedInfo {
  requiresParentTransfer?: boolean;
  parentPhoneMasked?: string;
}

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal/dashboard";

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deviceLockedInfo, setDeviceLockedInfo] = useState<DeviceLockedInfo | null>(null);
  const [parentPhoneInput, setParentPhoneInput] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const cleanPhone = validateEgyptianPhone(phoneNumber);
    if (!cleanPhone) {
      setError("يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقم (010, 011, 012, 015).");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف أو أرقام على الأقل.");
      setIsLoading(false);
      return;
    }

    try {
      const deviceId = getOrCreateDeviceId();

      const result = await signIn.email({
        email: `${cleanPhone}@elite-academy.edu.eg`,
        password,
      });

      if (result.error) {
        setError(result.error.message || "رقم الموبايل أو كلمة المرور غير صحيحة. تأكد من البيانات وحاول مرة أخرى.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiPost<{
          deviceLocked?: boolean;
          requiresParentTransfer?: boolean;
          parentPhoneMasked?: string;
          error?: string;
        }>(
          "/api/auth/verify-device",
          { deviceId, phoneNumber: cleanPhone },
          { showToast: false }
        );

        if (!res.success || res.data?.error) {
          if (res.data?.deviceLocked && res.data?.requiresParentTransfer) {
            setDeviceLockedInfo({
              requiresParentTransfer: true,
              parentPhoneMasked: res.data.parentPhoneMasked,
            });
            setIsLoading(false);
            return;
          }

          try {
            await signOut();
          } catch {
            // Ignore
          }
          setError(res.error || res.data?.error || "حساب الطالب مسجل على جهاز آخر. يرجى مراجعة إدارة الأكاديمية.");
          setIsLoading(false);
          return;
        }
      } catch (deviceCheckErr) {
        console.warn("Device verification network warning:", deviceCheckErr);
      }

      toast.success("تم تسجيل الدخول بنجاح! مرحباً بك في أكاديمية إيليت.");
      router.push(callbackUrl);
    } catch {
      setError("حدث خطأ في الاتصال بالخادم. تأكد من اتصال الإنترنت وحاول مرة أخرى.");
      setIsLoading(false);
    }
  };

  const handleParentTransferConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferring(true);
    try {
      const deviceId = getOrCreateDeviceId();

      const cleanStdPhone = validateEgyptianPhone(phoneNumber);
      const res = await apiPost(
        "/api/auth/verify-device",
        {
          deviceId,
          phoneNumber: cleanStdPhone,
          parentConfirmationPhone: parentPhoneInput,
        },
        { showToast: false }
      );

      if (!res.success) {
        toast.error(res.error || "رقم هاتف ولي الأمر غير متطابق.");
        setIsTransferring(false);
        return;
      }

      toast.success("تم تأكيد ولي الأمر ونقل الحساب لهذا الجهاز بنجاح! 🎉");
      setDeviceLockedInfo(null);
      router.push(callbackUrl);
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCancelTransfer = async () => {
    try {
      await signOut();
    } catch {
      // Ignore
    }
    setDeviceLockedInfo(null);
    setPassword("");
    setError("تم إلغاء نقل الجهاز. يمكنك تسجيل الدخول من جهازك المعتمد سابقاً.");
  };

  return {
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    deviceLockedInfo,
    parentPhoneInput,
    setParentPhoneInput,
    isTransferring,
    handleLogin,
    handleParentTransferConfirm,
    handleCancelTransfer,
  };
}
