"use client";

import { useState, useEffect } from "react";
import { LivingStorybook } from "@/components/living-storybook";
import {
  fetchBadgesFromSupabase,
  fetchStudentBadgeProgress,
  fetchLessonsForStudent,
  fetchStudentLessonProgress,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import { StorybookMapSkeleton } from "@/components/page-skeletons";
import type { Badge, StudentBadgeProgress, Lesson } from "@/lib/types";

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<StudentBadgeProgress[]>([]);
  const [lessonProgress, setLessonProgress] = useState<
    Record<number, { status: "completed" | "in_progress" | "locked"; highest_score: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [userSection, setUserSection] = useState("Grade 3-A");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      const studentSection = user?.section || "Grade 3-A";
      setUserSection(studentSection);

      const [liveBadges, liveLessons] = await Promise.all([
        fetchBadgesFromSupabase(studentSection),
        fetchLessonsForStudent(studentSection),
      ]);

      setBadges(liveBadges);
      setAllLessons(liveLessons);

      if (user?.id) {
        const [liveProg, liveLessonProg] = await Promise.all([
          fetchStudentBadgeProgress(user.id),
          fetchStudentLessonProgress(user.id),
        ]);
        setBadgeProgress(liveProg);
        setLessonProgress(liveLessonProg);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return <StorybookMapSkeleton />;
  }

  return (
    <LivingStorybook
      badges={badges}
      allLessons={allLessons}
      badgeProgress={badgeProgress}
      lessonProgress={lessonProgress}
      currentUserSection={userSection}
      totalXp={350}
      streakDays={5}
    />
  );
}
