"use client";

import { useState } from "react";
import { useAdminQuery, executeAdminAction } from "@/lib/api/admin-client";
import { INITIAL_PLATFORM_SETTINGS, type MockPlatformSettings } from "@/lib/db/mock-data";
import type { FreeSampleLecture } from "@/lib/db/schema";

export function useAdminSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const { data: settings, setData: setSettings, isLoading, refetch } = useAdminQuery<MockPlatformSettings>(
    "settings",
    INITIAL_PLATFORM_SETTINGS,
    (res) => (res.settings ? (res.settings as MockPlatformSettings) : undefined)
  );

  const handleFieldChange = (field: keyof MockPlatformSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const result = await executeAdminAction(
        "update_settings",
        settings as unknown as Record<string, unknown>,
        {
          successMessage: "🎉 تم حفظ الإعدادات بنجاح وتحديثها في قاعدة البيانات!",
          errorMessage: "حدث خطأ أثناء حفظ الإعدادات.",
        }
      );
      return result.success;
    } finally {
      setIsSaving(false);
    }
  };

  const addSampleLecture = (newLecture: FreeSampleLecture) => {
    setSettings((prev) => ({
      ...prev,
      sampleLectures: [newLecture, ...(prev.sampleLectures || [])],
    }));
  };

  const removeSampleLecture = (lectureId: string) => {
    setSettings((prev) => ({
      ...prev,
      sampleLectures: (prev.sampleLectures || []).filter((l: FreeSampleLecture) => l.id !== lectureId),
    }));
  };

  return {
    settings,
    isLoading,
    isSaving,
    refetch,
    handleFieldChange,
    saveSettings,
    addSampleLecture,
    removeSampleLecture,
  };
}
