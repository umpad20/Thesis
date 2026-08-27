import { createClient } from "@/utils/supabase/client";
import type {
  Badge,
  StudentBadgeProgress,
  Lesson,
  LessonPage,
  VocabularyWord,
  Quiz,
  QuizQuestion,
  QuestionChoice,
  LeaderboardEntry,
  InterventionPupil,
  InterventionRadarSummary,
  RankTier,
} from "@/lib/types";

// ============================================================================
// 1. BADGES & STUDENT BADGE PROGRESS
// ============================================================================

/**
 * Fetch badges directly from Supabase ordered by badge_order.
 * If section is provided, returns universal badges (target_section = 'all')
 * PLUS badges matching the specific student's enrolled section.
 */
export async function fetchBadgesFromSupabase(section?: string): Promise<Badge[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("badge_order", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Could not fetch badges from Supabase:", error);
      return [];
    }

    if (section && section !== "all") {
      return (data as Badge[]).filter(
        (b) => !b.target_section || b.target_section === "all" || b.target_section === section
      );
    }

    return data as Badge[];
  } catch (err) {
    console.error("fetchBadgesFromSupabase exception:", err);
    return [];
  }
}

/**
 * Fetch lesson count per badge to enforce the 3-lesson maximum rule
 */
export async function fetchBadgeLessonCounts(): Promise<Record<number, number>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("badge_id");

    if (error || !data) return {};

    const counts: Record<number, number> = {};
    for (const item of data) {
      if (item.badge_id) {
        counts[item.badge_id] = (counts[item.badge_id] || 0) + 1;
      }
    }
    return counts;
  } catch (err) {
    console.error("fetchBadgeLessonCounts error:", err);
    return {};
  }
}

/**
 * Fetch real badge progress for a specific student from Supabase.
 * If the student has no progress records yet, initializes Star Badge 1.
 */
export async function fetchStudentBadgeProgress(
  studentId: string
): Promise<StudentBadgeProgress[]> {
  if (!studentId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("student_badge_progress")
      .select("*")
      .eq("student_id", studentId);

    if (error) {
      console.warn("Error fetching badge progress:", error);
      return [];
    }

    if (!data || data.length === 0) {
      // Auto-initialize Star Badge 1 (in_progress, 0%)
      const initialRow = {
        student_id: studentId,
        badge_id: 1,
        status: "in_progress" as const,
        completion_percentage: 0,
      };

      await supabase.from("student_badge_progress").insert(initialRow);
      return [
        {
          badge_progress_id: 1,
          student_id: studentId,
          badge_id: 1,
          status: "in_progress",
          completion_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }

    return data as StudentBadgeProgress[];
  } catch (err) {
    console.error("fetchStudentBadgeProgress exception:", err);
    return [];
  }
}

// ============================================================================
// 2. STUDENT STATS (XP, LESSONS READ, QUIZZES PASSED)
// ============================================================================

export interface LiveStudentStats {
  full_name: string;
  section: string;
  avatar: string;
  totalXp: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  streakDays: number;
  accuracyRate: number;
}

export async function fetchStudentStats(
  studentId: string,
  studentName = "Pupil",
  section = "Grade 3-A",
  avatar = "🦊"
): Promise<LiveStudentStats> {
  let totalXp = 0;
  let lessonsCompleted = 0;
  let quizzesPassed = 0;
  let accuracyRate = 0;

  if (!studentId) {
    return {
      full_name: studentName,
      section,
      avatar,
      totalXp: 0,
      lessonsCompleted: 0,
      quizzesPassed: 0,
      streakDays: 1,
      accuracyRate: 0,
    };
  }

  try {
    const supabase = createClient();

    // 1. Fetch completed badges to add badge XP
    const { data: badgeProg } = await supabase
      .from("student_badge_progress")
      .select("badge_id, status")
      .eq("student_id", studentId);

    const { data: badges } = await supabase.from("badges").select("badge_id, xp_reward");
    const badgeMap = new Map((badges || []).map((b) => [b.badge_id, b.xp_reward]));

    if (badgeProg) {
      for (const bp of badgeProg) {
        if (bp.status === "completed") {
          totalXp += badgeMap.get(bp.badge_id) || 100;
        }
      }
    }

    // 2. Fetch completed lessons
    const { data: lessonProg } = await supabase
      .from("student_lesson_progress")
      .select("*")
      .eq("student_id", studentId);

    if (lessonProg) {
      lessonsCompleted = lessonProg.filter(
        (lp) => lp.status === "completed" || lp.progress_percentage >= 100
      ).length;
    }

    // 3. Fetch quiz attempts
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("student_id", studentId);

    if (attempts && attempts.length > 0) {
      const passedAttempts = attempts.filter(
        (a) => a.status === "passed" || Number(a.percentage) >= 70
      );
      quizzesPassed = passedAttempts.length;

      // Add quiz XP (100 XP per passed quiz)
      totalXp += quizzesPassed * 100;

      const totalPct = attempts.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0);
      accuracyRate = Math.round(totalPct / attempts.length);
    }
  } catch (err) {
    console.error("fetchStudentStats error:", err);
  }

  return {
    full_name: studentName,
    section,
    avatar,
    totalXp: Math.max(totalXp, 100), // Base welcome XP
    lessonsCompleted,
    quizzesPassed,
    streakDays: Math.max(1, quizzesPassed + 1),
    accuracyRate: accuracyRate || 85,
  };
}

// ============================================================================
// 3. LESSONS & PAGES & VOCABULARY
// ============================================================================

/**
 * Fetch published lessons for a student section (including target_section = 'all')
 */
export async function fetchLessonsForStudent(section = "Grade 3-A"): Promise<Lesson[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("status", "published")
      .order("lesson_order", { ascending: true });

    if (error || !data) {
      console.warn("fetchLessonsForStudent error:", error);
      return [];
    }

    // Filter: Developer core (all) OR matching section
    return data.filter(
      (l) => !l.target_section || l.target_section === "all" || l.target_section === section
    ) as Lesson[];
  } catch (err) {
    console.error("fetchLessonsForStudent exception:", err);
    return [];
  }
}

/**
 * Fetch all lessons (for Teacher Curriculum Manager)
 */
export async function fetchAllLessons(): Promise<Lesson[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .order("lesson_order", { ascending: true });

    if (error || !data) return [];
    return data as Lesson[];
  } catch {
    return [];
  }
}

/**
 * Fetch pages and vocabulary for a specific lesson
 */
export async function fetchLessonDetails(lessonId: number): Promise<{
  pages: LessonPage[];
  vocabulary: VocabularyWord[];
}> {
  try {
    const supabase = createClient();

    const [pagesRes, vocabRes] = await Promise.all([
      supabase
        .from("lesson_pages")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("page_number", { ascending: true }),
      supabase
        .from("vocabulary_words")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("word_id", { ascending: true }),
    ]);

    return {
      pages: (pagesRes.data || []) as LessonPage[],
      vocabulary: (vocabRes.data || []) as VocabularyWord[],
    };
  } catch (err) {
    console.error("fetchLessonDetails error:", err);
    return { pages: [], vocabulary: [] };
  }
}

/**
 * Fetch all vocabulary words across published lessons
 */
export async function fetchAllVocabularyWords(): Promise<VocabularyWord[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("vocabulary_words")
      .select("*")
      .order("word_id", { ascending: true });

    if (error || !data) return [];
    return data as VocabularyWord[];
  } catch {
    return [];
  }
}

// ============================================================================
// 4. QUIZZES & QUESTION BANK
// ============================================================================

export interface QuizWithQuestions extends Quiz {
  questions: Array<
    QuizQuestion & {
      choices: QuestionChoice[];
    }
  >;
}

export async function fetchQuizForLesson(lessonId: number): Promise<QuizWithQuestions | null> {
  try {
    const supabase = createClient();

    // 1. Fetch quiz row
    const { data: quiz, error: quizErr } = await supabase
      .from("quizzes")
      .select("*")
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (quizErr || !quiz) return null;

    // 2. Fetch questions
    const { data: questions, error: qErr } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.quiz_id)
      .order("question_id", { ascending: true });

    if (qErr || !questions) return { ...quiz, questions: [] };

    // 3. Fetch choices for all questions
    const questionIds = questions.map((q) => q.question_id);
    const { data: choices } = await supabase
      .from("question_choices")
      .select("*")
      .in("question_id", questionIds);

    const questionsWithChoices = questions.map((q) => ({
      ...q,
      choices: (choices || []).filter((c) => c.question_id === q.question_id),
    }));

    return {
      ...quiz,
      questions: questionsWithChoices,
    };
  } catch (err) {
    console.error("fetchQuizForLesson error:", err);
    return null;
  }
}

export async function fetchStageFinalQuiz(badgeId: number): Promise<QuizWithQuestions | null> {
  try {
    const supabase = createClient();

    // 1. Fetch Stage Final Quiz row
    const { data: quiz, error: quizErr } = await supabase
      .from("quizzes")
      .select("*")
      .eq("badge_id", badgeId)
      .eq("quiz_type", "badge_final")
      .maybeSingle();

    if (quizErr || !quiz) return null;

    // 2. Fetch questions
    const { data: questions, error: qErr } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.quiz_id)
      .order("question_id", { ascending: true });

    if (qErr || !questions) return { ...quiz, questions: [] };

    // 3. Fetch choices
    const questionIds = questions.map((q) => q.question_id);
    const { data: choices } = await supabase
      .from("question_choices")
      .select("*")
      .in("question_id", questionIds);

    const questionsWithChoices = questions.map((q) => ({
      ...q,
      choices: (choices || []).filter((c) => c.question_id === q.question_id),
    }));

    return {
      ...quiz,
      questions: questionsWithChoices,
    };
  } catch (err) {
    console.error("fetchStageFinalQuiz error:", err);
    return null;
  }
}

export interface StageCurriculumDetail {
  lessons: Array<{
    lesson_id: number;
    lesson_title: string;
    badge_id: number;
    difficulty_level: string;
    lesson_description: string;
    pages: LessonPage[];
    quiz?: {
      quiz_id: number;
      quiz_title: string;
      questions?: Array<{
        question_id: number;
        question_text: string;
        points: number;
        hint: string;
        explanation: string;
        choices: Array<{ choice_id: number; choice_text: string; is_correct: boolean }>;
      }>;
    };
  }>;
  finalQuiz: QuizWithQuestions | null;
}

export async function fetchStageCurriculumDetails(badgeId: number): Promise<StageCurriculumDetail> {
  try {
    const supabase = createClient();

    // 1. Fetch lessons
    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("*")
      .eq("badge_id", badgeId)
      .order("lesson_order", { ascending: true })
      .order("lesson_id", { ascending: true });

    const lessons = lessonsData || [];
    const lessonIds = lessons.map((l) => l.lesson_id);

    // 2. Fetch pages
    let pagesData: LessonPage[] = [];
    if (lessonIds.length > 0) {
      const { data: pages } = await supabase
        .from("lesson_pages")
        .select("*")
        .in("lesson_id", lessonIds)
        .order("page_number", { ascending: true });
      pagesData = (pages as LessonPage[]) || [];
    }

    // 3. Fetch lesson quizzes
    let quizzesData: any[] = [];
    if (lessonIds.length > 0) {
      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("*")
        .in("lesson_id", lessonIds);
      quizzesData = quizzes || [];
    }

    const quizIds = quizzesData.map((q) => q.quiz_id);
    let questionsData: any[] = [];
    let choicesData: any[] = [];
    if (quizIds.length > 0) {
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("*")
        .in("quiz_id", quizIds)
        .order("question_id", { ascending: true });
      questionsData = questions || [];

      const questionIds = questionsData.map((q) => q.question_id);
      if (questionIds.length > 0) {
        const { data: choices } = await supabase
          .from("question_choices")
          .select("*")
          .in("question_id", questionIds);
        choicesData = choices || [];
      }
    }

    const enrichedLessons = lessons.map((l) => {
      const lPages = pagesData.filter((p) => p.lesson_id === l.lesson_id);
      const lQuiz = quizzesData.find((q) => q.lesson_id === l.lesson_id);
      let lQuestionsWithChoices: any[] = [];
      if (lQuiz) {
        const lQuestions = questionsData.filter((q) => q.quiz_id === lQuiz.quiz_id);
        lQuestionsWithChoices = lQuestions.map((q) => ({
          ...q,
          choices: choicesData.filter((c) => c.question_id === q.question_id),
        }));
      }

      return {
        lesson_id: l.lesson_id,
        lesson_title: l.lesson_title,
        badge_id: l.badge_id,
        difficulty_level: l.difficulty_level,
        lesson_description: l.lesson_description,
        pages: lPages,
        quiz: lQuiz ? { ...lQuiz, questions: lQuestionsWithChoices } : undefined,
      };
    });

    const finalQuiz = await fetchStageFinalQuiz(badgeId);

    return {
      lessons: enrichedLessons,
      finalQuiz,
    };
  } catch (err) {
    console.error("fetchStageCurriculumDetails error:", err);
    return {
      lessons: [],
      finalQuiz: null,
    };
  }
}

/**
 * Submit real student quiz attempt directly into Supabase
 */
export async function submitQuizAttempt(params: {
  studentId: string;
  quizId: number;
  lessonId?: number | null;
  badgeId?: number | null;
  isStageFinal?: boolean;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  answers: Array<{ questionId: number; choiceId: number; isCorrect: boolean }>;
}): Promise<{ success: boolean; attemptId?: number }> {
  try {
    const supabase = createClient();

    // 1. Record in quiz_attempts
    const { data: attempt, error: attemptErr } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: params.quizId,
        student_id: params.studentId,
        score: params.score,
        percentage: params.percentage,
        status: params.passed ? "passed" : "failed",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select("attempt_id")
      .single();

    if (attemptErr || !attempt) {
      console.error("Error creating quiz attempt:", attemptErr);
      return { success: false };
    }

    // 2. Record individual answers
    if (params.answers.length > 0) {
      const answerRows = params.answers.map((a) => ({
        attempt_id: attempt.attempt_id,
        question_id: a.questionId,
        selected_choice_id: a.choiceId,
        is_correct: a.isCorrect,
      }));

      await supabase.from("quiz_answers").insert(answerRows);
    }

    // 3. Stage Final Quiz Submission Logic
    if (params.isStageFinal && params.badgeId) {
      if (params.passed) {
        // Stage Mastered! Award Badge Seal and unlock next Stage
        await supabase.from("student_badge_progress").upsert(
          {
            student_id: params.studentId,
            badge_id: params.badgeId,
            status: "completed",
            completion_percentage: 100,
            final_quiz_score: params.percentage,
            earned_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id, badge_id" }
        );

        // Unlock next stage as in_progress
        const nextBadgeId = Number(params.badgeId) + 1;
        const { data: nextBadge } = await supabase
          .from("badges")
          .select("badge_id")
          .eq("badge_id", nextBadgeId)
          .maybeSingle();

        if (nextBadge) {
          const { data: nextBadgeProg } = await supabase
            .from("student_badge_progress")
            .select("status")
            .eq("student_id", params.studentId)
            .eq("badge_id", nextBadgeId)
            .maybeSingle();

          if (!nextBadgeProg || nextBadgeProg.status === "locked") {
            await supabase.from("student_badge_progress").upsert(
              {
                student_id: params.studentId,
                badge_id: nextBadgeId,
                status: "in_progress",
                completion_percentage: 0,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "student_id, badge_id" }
            );
          }
        }
      } else {
        // Failed Stage Final Quiz -> Retained in current stage
        await supabase.from("student_badge_progress").upsert(
          {
            student_id: params.studentId,
            badge_id: params.badgeId,
            status: "in_progress",
            completion_percentage: 90,
            final_quiz_score: params.percentage,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id, badge_id" }
        );
      }
      return { success: true, attemptId: attempt.attempt_id };
    }

    // 4. Regular Lesson Quiz Submission Logic
    if (params.lessonId) {
      if (params.passed) {
        // Passed lesson -> Mark lesson completed
        await supabase.from("student_lesson_progress").upsert(
          {
            student_id: params.studentId,
            lesson_id: params.lessonId,
            progress_percentage: 100,
            status: "completed",
            highest_quiz_score: params.percentage,
            last_accessed: new Date().toISOString(),
          },
          { onConflict: "student_id, lesson_id" }
        );
      } else {
        // Failed lesson -> Retained in lesson (status in_progress)
        await supabase.from("student_lesson_progress").upsert(
          {
            student_id: params.studentId,
            lesson_id: params.lessonId,
            progress_percentage: Math.min(params.percentage, 50),
            status: "in_progress",
            highest_quiz_score: params.percentage,
            last_accessed: new Date().toISOString(),
          },
          { onConflict: "student_id, lesson_id" }
        );
      }

      // Update badge progress completion percentage (stories progress toward stage final)
      let targetBadgeId = params.badgeId;
      if (!targetBadgeId) {
        const { data: lessonRow } = await supabase
          .from("lessons")
          .select("badge_id")
          .eq("lesson_id", params.lessonId)
          .maybeSingle();
        targetBadgeId = lessonRow?.badge_id ?? undefined;
      }

      if (targetBadgeId) {
        const { data: badgeLessons } = await supabase
          .from("lessons")
          .select("lesson_id")
          .eq("badge_id", targetBadgeId);

        const totalLessonsInBadge = badgeLessons?.length || 3;
        const badgeLessonIds = (badgeLessons || []).map((l) => l.lesson_id);

        const { data: completedLessons } = await supabase
          .from("student_lesson_progress")
          .select("lesson_id")
          .eq("student_id", params.studentId)
          .eq("status", "completed")
          .in("lesson_id", badgeLessonIds);

        const completedCount = completedLessons?.length || 0;
        // Percentage reaches up to 90% from lessons; 100% is awarded only on Stage Final Quiz pass
        const newPercentage = Math.min(90, Math.round((completedCount / totalLessonsInBadge) * 90));

        await supabase.from("student_badge_progress").upsert(
          {
            student_id: params.studentId,
            badge_id: targetBadgeId,
            status: "in_progress",
            completion_percentage: newPercentage,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id, badge_id" }
        );
      }
    }

    return { success: true, attemptId: attempt.attempt_id };
  } catch (err) {
    console.error("submitQuizAttempt error:", err);
    return { success: false };
  }
}

export async function fetchStudentLessonProgress(
  studentId: string
): Promise<Record<number, { status: "completed" | "in_progress" | "locked"; highest_score: number }>> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("student_lesson_progress")
      .select("lesson_id, status, highest_quiz_score")
      .eq("student_id", studentId);

    const map: Record<number, { status: "completed" | "in_progress" | "locked"; highest_score: number }> = {};
    for (const item of data || []) {
      map[item.lesson_id] = {
        status: (item.status || "locked") as "completed" | "in_progress" | "locked",
        highest_score: item.highest_quiz_score || 0,
      };
    }
    return map;
  } catch (err) {
    console.error("fetchStudentLessonProgress error:", err);
    return {};
  }
}

// ============================================================================
// 5. TEACHER & REPORT METRICS
// ============================================================================

export interface TeacherReportRow {
  studentId: string;
  name: string;
  section: string;
  gender: string;
  currentBadge: string;
  comprehensionPct: string;
  readingSpeed: string;
  quizzesPassed: string;
  status: "Mastering" | "On Track" | "Needs Review";
  lastActive: string;
}

export async function fetchClassRosterReports(
  section = "all",
  teacherId?: string
): Promise<TeacherReportRow[]> {
  try {
    const supabase = createClient();

    // Fetch student profiles strictly scoped to this teacher
    let profQuery = supabase.from("profiles").select("*").eq("role", "student");

    if (teacherId) {
      profQuery = profQuery.eq("teacher_id", teacherId);
    }

    if (section !== "all") {
      profQuery = profQuery.eq("section", section);
    }

    const { data: profiles } = await profQuery;

    if (!profiles || profiles.length === 0) return [];

    // 3. Fetch all badges for reference
    const { data: badges } = await supabase.from("badges").select("*").order("badge_order");
    const badgeMap = new Map((badges || []).map((b) => [b.badge_id, b.badge_name]));

    // 4. Fetch badge progress and quiz attempts
    const studentIds = profiles.map((p) => p.id);
    const [progRes, attRes] = await Promise.all([
      supabase.from("student_badge_progress").select("*").in("student_id", studentIds),
      supabase.from("quiz_attempts").select("*").in("student_id", studentIds),
    ]);

    const progressList = progRes.data || [];
    const attemptList = attRes.data || [];

    return profiles.map((p) => {
      const studentBadges = progressList.filter((pr) => pr.student_id === p.id);
      const studentAttempts = attemptList.filter((a) => a.student_id === p.id);

      const latestBadgeId = studentBadges.length > 0 ? studentBadges[studentBadges.length - 1].badge_id : 1;
      const badgeName = badgeMap.get(latestBadgeId) || "Stage 1: Reading Star";

      const totalAttempts = studentAttempts.length;
      const passedQuizzes = studentAttempts.filter((a) => a.status === "passed" || a.percentage >= 70).length;
      const quizzesPassedStr = `${passedQuizzes}/${Math.max(totalAttempts, 1)}`;

      let avgScore = 0;
      if (totalAttempts > 0) {
        const totalPct = studentAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
        avgScore = Math.round(totalPct / totalAttempts);
      } else if (studentBadges.some(b => b.status === "completed")) {
        avgScore = 100;
      }

      let status = "Needs Attention";
      if (avgScore >= 80) status = "Mastering";
      else if (avgScore >= 60) status = "Developing";

      return {
        studentId: p.id,
        name: p.full_name || "Student",
        section: p.section || "Grade 3-A",
        currentBadge: badgeName,
        quizzesPassed: quizzesPassedStr,
        comprehensionPct: `${avgScore}%`,
        readingSpeed: avgScore > 0 ? `${Math.round(85 + (avgScore / 100) * 20)} WPM` : "—",
        status: status as "Mastering" | "On Track" | "Needs Review",
        lastActive: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Active recently",
        gender: "Female",
      };
    });
  } catch (err) {
    console.error("fetchClassRosterReports error:", err);
    return [];
  }
}

// ============================================================================
// 11. TEACHER MASTERY STAGE DISTRIBUTION
// ============================================================================

export interface MasteryStageDistribution {
  starCount: number;
  starPct: number;
  ribbonCount: number;
  ribbonPct: number;
  medalCount: number;
  medalPct: number;
  totalStudents: number;
}

export async function fetchMasteryStageDistribution(
  section = "all",
  teacherId?: string
): Promise<MasteryStageDistribution> {
  try {
    const supabase = createClient();

    let profQuery = supabase.from("profiles").select("id, section").eq("role", "student");

    if (teacherId) {
      profQuery = profQuery.eq("teacher_id", teacherId);
    }

    if (section !== "all") {
      profQuery = profQuery.eq("section", section);
    }

    const { data: profiles } = await profQuery;
    const totalStudents = profiles?.length || 0;
    if (totalStudents === 0) {
      return { starCount: 0, starPct: 0, ribbonCount: 0, ribbonPct: 0, medalCount: 0, medalPct: 0, totalStudents: 0 };
    }

    const studentIds = profiles!.map((p) => p.id);
    const { data: badges } = await supabase.from("badges").select("badge_id, badge_type");
    const badgeTypeMap = new Map((badges || []).map((b) => [b.badge_id, b.badge_type]));

    const { data: progress } = await supabase
      .from("student_badge_progress")
      .select("student_id, badge_id, status")
      .in("student_id", studentIds);

    let starCount = 0;
    let ribbonCount = 0;
    let medalCount = 0;

    for (const p of profiles!) {
      const studentProg = (progress || []).filter((pr) => pr.student_id === p.id);
      const hasMedal = studentProg.some((pr) => badgeTypeMap.get(pr.badge_id) === "medal");
      const hasRibbon = studentProg.some((pr) => badgeTypeMap.get(pr.badge_id) === "ribbon");

      if (hasMedal) {
        medalCount++;
      } else if (hasRibbon) {
        ribbonCount++;
      } else {
        starCount++;
      }
    }

    return {
      starCount,
      starPct: Math.round((starCount / totalStudents) * 100),
      ribbonCount,
      ribbonPct: Math.round((ribbonCount / totalStudents) * 100),
      medalCount,
      medalPct: Math.round((medalCount / totalStudents) * 100),
      totalStudents,
    };
  } catch (err) {
    console.error("fetchMasteryStageDistribution error:", err);
    return { starCount: 0, starPct: 0, ribbonCount: 0, ribbonPct: 0, medalCount: 0, medalPct: 0, totalStudents: 0 };
  }
}

// ============================================================================
// 12. CLASSROOM LEADERBOARD & RANKING ENGINE
// ============================================================================

/**
 * Fetch live classroom leaderboard for a section or teacher's cohort.
 * Computes rank, total XP, accuracy rate, quizzes passed, streaks, and rank tiers.
 */
export async function fetchClassroomLeaderboard(
  section?: string,
  teacherId?: string
): Promise<LeaderboardEntry[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("profiles")
      .select("id, full_name, avatar, section, created_at, teacher_id")
      .eq("role", "student");

    if (teacherId) {
      query = query.eq("teacher_id", teacherId);
    }

    if (section && section !== "all") {
      query = query.eq("section", section);
    }

    const { data: profiles, error } = await query;
    if (error || !profiles || profiles.length === 0) {
      return [];
    }

    const studentIds = profiles.map((p) => p.id);

    const [
      { data: badges },
      { data: badgeProg },
      { data: quizAttempts },
    ] = await Promise.all([
      supabase.from("badges").select("badge_id, badge_name, xp_reward"),
      supabase
        .from("student_badge_progress")
        .select("student_id, badge_id, status")
        .in("student_id", studentIds),
      supabase
        .from("quiz_attempts")
        .select("student_id, score, percentage, status, completed_at")
        .in("student_id", studentIds),
    ]);

    const badgeXpMap = new Map((badges || []).map((b) => [b.badge_id, b.xp_reward || 100]));
    const badgeNameMap = new Map((badges || []).map((b) => [b.badge_id, b.badge_name]));

    const entries: Array<Omit<LeaderboardEntry, "rank"> & { rankScore: number }> = profiles.map((p) => {
      // 1. Badge XP
      const studentBadges = (badgeProg || []).filter((bp) => bp.student_id === p.id);
      let earnedBadgeXp = 0;
      let latestBadgeName = "Stage 1: Reading Star";

      for (const bp of studentBadges) {
        if (bp.status === "completed") {
          earnedBadgeXp += badgeXpMap.get(bp.badge_id) || 100;
          const name = badgeNameMap.get(bp.badge_id);
          if (name) latestBadgeName = name;
        }
      }

      // 2. Quiz Metrics
      const studentAttempts = (quizAttempts || []).filter((qa) => qa.student_id === p.id);
      let earnedQuizXp = 0;
      let totalScorePct = 0;
      let passedQuizzes = 0;

      for (const qa of studentAttempts) {
        if (qa.status === "passed" || qa.percentage >= 70) {
          passedQuizzes++;
          earnedQuizXp += (qa.score || 10) * 10;
        }
        totalScorePct += qa.percentage || 0;
      }

      const comprehensionPct =
        studentAttempts.length > 0
          ? Math.round(totalScorePct / studentAttempts.length)
          : earnedBadgeXp > 0
          ? 100
          : 0;

      const totalXp = Math.max(earnedBadgeXp + earnedQuizXp, earnedBadgeXp > 0 ? 100 : 0);
      const streakDays = Math.max(1, Math.min(30, studentBadges.length * 2 + passedQuizzes));

      // Rank Tier mapping
      let rankTier: RankTier = "story_starter";
      let rankTierLabel = "📖 Story Starter";

      if (totalXp >= 1000) {
        rankTier = "grand_scholar";
        rankTierLabel = "💎 Grand Scholar";
      } else if (totalXp >= 600) {
        rankTier = "star_explorer";
        rankTierLabel = "🌟 Star Explorer";
      } else if (totalXp >= 300) {
        rankTier = "rising_reader";
        rankTierLabel = "🎗️ Rising Reader";
      }

      // Composite Rank Scoring formula
      const rankScore = totalXp * 2 + comprehensionPct * 5 + passedQuizzes * 25 + streakDays * 10;

      return {
        studentId: p.id,
        studentName: p.full_name || "Pupil",
        avatar: p.avatar || "👧",
        section: p.section || "Grade 3-A",
        totalXp,
        comprehensionPct,
        quizzesPassed: passedQuizzes,
        streakDays,
        rankTier,
        rankTierLabel,
        currentBadgeName: latestBadgeName,
        rankScore,
      };
    });

    // Sort by rankScore descending, then totalXp descending
    entries.sort((a, b) => b.rankScore - a.rankScore || b.totalXp - a.totalXp);

    return entries.map((entry, idx) => ({
      rank: idx + 1,
      studentId: entry.studentId,
      studentName: entry.studentName,
      avatar: entry.avatar,
      section: entry.section,
      totalXp: entry.totalXp,
      comprehensionPct: entry.comprehensionPct,
      quizzesPassed: entry.quizzesPassed,
      streakDays: entry.streakDays,
      rankTier: entry.rankTier,
      rankTierLabel: entry.rankTierLabel,
      currentBadgeName: entry.currentBadgeName,
    }));
  } catch (err) {
    console.error("fetchClassroomLeaderboard error:", err);
    return [];
  }
}

// ============================================================================
// 13. TEACHER EARLY-INTERVENTION & STRUGGLING STUDENT RADAR
// ============================================================================

/**
 * Evaluates risk factors for enrolled pupils under a teacher.
 * Detects failing scores, repeated failed quiz attempts, and stalled inactivity.
 */
export async function fetchTeacherInterventionRadar(
  teacherId: string,
  section?: string
): Promise<InterventionRadarSummary> {
  try {
    const supabase = createClient();

    let profQuery = supabase
      .from("profiles")
      .select("id, full_name, avatar, section, created_at, updated_at, teacher_id")
      .eq("role", "student");

    if (teacherId) {
      profQuery = profQuery.eq("teacher_id", teacherId);
    }

    if (section && section !== "all") {
      profQuery = profQuery.eq("section", section);
    }

    const { data: profiles, error } = await profQuery;
    if (error || !profiles || profiles.length === 0) {
      return { criticalCount: 0, watchlistCount: 0, masteringCount: 0, totalEnrolled: 0, pupils: [] };
    }

    const studentIds = profiles.map((p) => p.id);
    const [{ data: attempts }, { data: badgeProg }] = await Promise.all([
      supabase
        .from("quiz_attempts")
        .select("student_id, quiz_id, score, percentage, status, started_at, completed_at")
        .in("student_id", studentIds)
        .order("completed_at", { ascending: false }),
      supabase
        .from("student_badge_progress")
        .select("student_id, badge_id, status, completion_percentage")
        .in("student_id", studentIds),
    ]);

    const pupils: InterventionPupil[] = [];
    let criticalCount = 0;
    let watchlistCount = 0;
    let masteringCount = 0;

    const now = new Date();

    for (const p of profiles) {
      const studentAttempts = (attempts || []).filter((a) => a.student_id === p.id);
      const studentBadges = (badgeProg || []).filter((b) => b.student_id === p.id);
      const hasCompletedBadges = studentBadges.some((b) => b.status === "completed" || (b.completion_percentage || 0) >= 100);
      const hasInProgressBadges = studentBadges.some((b) => (b.completion_percentage || 0) > 0);

      let totalPct = 0;
      let passedCount = 0;
      let failedAttempts = 0;

      for (const a of studentAttempts) {
        if (a.status === "passed" || a.percentage >= 70) {
          passedCount++;
        } else {
          failedAttempts++;
        }
        totalPct += a.percentage || 0;
      }

      const comprehensionPct =
        studentAttempts.length > 0
          ? Math.round(totalPct / studentAttempts.length)
          : hasCompletedBadges
          ? 100
          : 0;

      const lastAttempt = studentAttempts[0];
      const lastActiveDate = lastAttempt?.completed_at || p.created_at || now.toISOString();
      const diffMs = now.getTime() - new Date(lastActiveDate).getTime();
      const daysInactive = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      // Pedagogical Risk Evaluation
      let riskLevel: "critical" | "watchlist" | "mastering" = "mastering";
      let struggleReason = "Excelling at comprehension benchmark with consistent participation.";
      let recommendedAction = "Challenge with Higher Stage Story Passages & Bonus Accolades.";

      if (hasCompletedBadges || comprehensionPct >= 80) {
        riskLevel = "mastering";
        const completedBadgesNum = studentBadges.filter((b) => b.status === "completed").length || 1;
        struggleReason = `Stage Mastered (${completedBadgesNum} Magical Seal Earned) with strong reading recall!`;
        recommendedAction = "Challenge with Next Stage Stories & Living Storybook Exploration.";
      } else if (studentAttempts.length === 0 && !hasInProgressBadges) {
        if (daysInactive >= 3) {
          riskLevel = "critical";
          struggleReason = `No quiz attempts recorded since enrollment (${daysInactive} days inactive).`;
          recommendedAction = "Assign Starter Stage 1 Chapter 1 Story & Guide Onboarding.";
        } else {
          riskLevel = "watchlist";
          struggleReason = "Newly enrolled pupil. Has not yet started the first reading chapter.";
          recommendedAction = "Welcome pupil and introduce the Living Storybook Reader.";
        }
      } else if (comprehensionPct < 70 || failedAttempts >= 2) {
        riskLevel = "critical";
        struggleReason = `Low average comprehension (${comprehensionPct}%) with ${failedAttempts} failed quiz attempt(s).`;
        recommendedAction = "Assign Guided Starter Passage with Hint Narration & Vocabulary Review.";
      } else {
        riskLevel = "watchlist";
        struggleReason = `Borderline score (${comprehensionPct}%). Needs reading consistency support.`;
        recommendedAction = "Encourage Stage Final Review & Story Reading Rhythm.";
      }

      if (riskLevel === "critical") criticalCount++;
      else if (riskLevel === "watchlist") watchlistCount++;
      else masteringCount++;

      pupils.push({
        studentId: p.id,
        studentName: p.full_name || "Pupil",
        avatar: p.avatar || "👧",
        section: p.section || "Grade 3-A",
        comprehensionPct,
        quizzesPassed: passedCount,
        failedAttemptsCount: failedAttempts,
        lastActiveDate,
        daysInactive,
        riskLevel,
        struggleReason,
        recommendedAction,
      });
    }

    // Sort: critical first, then watchlist, then mastering
    const riskWeights = { critical: 1, watchlist: 2, mastering: 3 };
    pupils.sort((a, b) => riskWeights[a.riskLevel] - riskWeights[b.riskLevel] || a.comprehensionPct - b.comprehensionPct);

    return {
      criticalCount,
      watchlistCount,
      masteringCount,
      totalEnrolled: profiles.length,
      pupils,
    };
  } catch (err) {
    console.error("fetchTeacherInterventionRadar error:", err);
    return { criticalCount: 0, watchlistCount: 0, masteringCount: 0, totalEnrolled: 0, pupils: [] };
  }
}

