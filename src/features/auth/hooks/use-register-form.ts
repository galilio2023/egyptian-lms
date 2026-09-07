"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth/auth-client";
import { validateEgyptianPhone } from "@/lib/utils";
import { apiPost } from "@/lib/api/api-client";
import { getOrCreateDeviceId } from "@/lib/utils/device";

export function useRegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [fullname, setFullname] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [gradeLevel, setGradeLevel] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateStep1 = () => {
    setError("");
    if (!fullname.trim() || fullname.trim().split(" ").length < 2) {
      setError("يرجى إدخال اسم الطالب ثنائياً على الأقل.");
      return false;
    }
    const cleanStd = validateEgyptianPhone(studentPhone);
    if (!cleanStd) {
      setError("يرجى إدخال رقم موبايل مصري صحيح للطالب مكون من 11 رقم (010, 011, 012, 015).");
      return false;
    }
    return true;
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateStep1()) {
      setStep(1);
      setIsLoading(false);
      return;
    }

    const cleanStd = validateEgyptianPhone(studentPhone);
    const cleanParent = validateEgyptianPhone(parentPhone);
    if (!cleanParent) {
      setError("يرجى إدخال رقم موبايل صحيح لولي الأمر لإرسال تقارير المتابعة والدرجات.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف أو أرقام على الأقل.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      setIsLoading(false);
      return;
    }

    if (!governorate) {
      setError("يرجى اختيار المحافظة.");
      setIsLoading(false);
      return;
    }

    try {
      const deviceId = getOrCreateDeviceId();

      const result = await signUp.email({
        name: fullname.trim(),
        email: `${cleanStd}@elite-academy.edu.eg`,
        password,
        phoneNumber: cleanStd as string,
      });

      if (result?.error) {
        const rawMsg = result.error.message || "";
        if (
          rawMsg.toLowerCase().includes("user already exists") ||
          rawMsg.toLowerCase().includes("email") ||
          rawMsg.toLowerCase().includes("phone")
        ) {
          setError("رقم موبايل الطالب مسجل بالفعل لدينا. يمكنك تسجيل الدخول مباشرة إلى حسابك، أو استخدام رقم موبايل آخر.");
        } else if (rawMsg.toLowerCase().includes("password")) {
          setError("كلمة المرور غير صالحة. يرجى التأكد من كتابة 8 أحرف أو أرقام على الأقل.");
        } else {
          setError(rawMsg || "حدث خطأ أثناء إنشاء الحساب. تأكد من البيانات وحاول مرة أخرى.");
        }
        setIsLoading(false);
        return;
      }

      try {
        await apiPost(
          "/api/student/register-profile",
          {
            phoneNumber: cleanStd,
            parentPhoneNumber: cleanParent,
            governorate,
            gradeLevel: parseInt(gradeLevel) || 1,
            deviceId,
          },
          { showToast: false }
        );
      } catch {
        // Continue if profile extension sync was partial
      }

      router.push("/portal/dashboard");
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال بالسيرفر. يرجى المحاولة مرة أخرى.");
      setIsLoading(false);
    }
  };

  return {
    step,
    setStep,
    fullname,
    setFullname,
    studentPhone,
    setStudentPhone,
    parentPhone,
    setParentPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    governorate,
    setGovernorate,
    gradeLevel,
    setGradeLevel,
    isLoading,
    error,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleNextStep,
    handleRegister,
  };
}
