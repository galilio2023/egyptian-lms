import React from "react";

export interface StudentDashboardProfile {
  name: string;
  phone: string;
  gradeTitle: string;
  gradeLevel: number;
  gradeSlug: string;
  xpPoints: number;
  nextLevelXp: number;
  levelNumber: number;
  streakDays: number;
  completedLessons: number;
  activeQuizzes: number;
}

export interface MascotItem {
  id: string;
  name: string;
  SvgComponent: React.ComponentType<{ className?: string }>;
  title: string;
}
