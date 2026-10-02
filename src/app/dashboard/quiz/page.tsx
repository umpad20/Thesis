"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  ChevronRight,
  BookOpen,
  Map,
  Star,
  PartyPopper,
  Volume2,
  Award,
  Unlock,
  ShieldCheck,
  X,
  Trophy,
  CheckSquare,
  Square,
  Puzzle,
  Maximize2,
  Link2,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BadgeGraphic } from "@/components/badge-graphic";
import { CertificateModal } from "@/components/certificate-modal";
import { StarRatingRow, getStarCountFromScore } from "@/components/quiz-stars";
import {
  fetchQuizForLesson,
  fetchStageFinalQuiz,
  fetchBadgesFromSupabase,
  fetchLessonsForStudent,
  fetchStudentLessonProgress,
  type QuizWithQuestions,
  submitQuizAttempt,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import { soundEffects } from "@/utils/sound-effects";
import { shuffleArray } from "@/utils/quiz-helpers";
import type { Badge, BadgeType, MedalType, QuestionChoice, Lesson } from "@/lib/types";

function QuizContent() {
  const searchParams = useSearchParams();
  const rawLessonId = searchParams.get("lessonId");
  const rawBadgeId = searchParams.get("badgeId");
  const isStageFinal = searchParams.get("type") === "final";

  const lessonId = rawLessonId ? Number(rawLessonId) : null;
  const badgeId = rawBadgeId ? Number(rawBadgeId) : 1;

  const [quizData, setQuizData] = useState<QuizWithQuestions | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<
    Record<number, { status: "completed" | "in_progress" | "locked"; highest_score: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [stageLockedReason, setStageLockedReason] = useState<string | null>(null);
  const [firstUnfinishedLessonId, setFirstUnfinishedLessonId] = useState<number | null>(null);
  const [isAlreadyPassed, setIsAlreadyPassed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Record<number, string>>({});
  const [selectedLeftChoiceId, setSelectedLeftChoiceId] = useState<number | null>(null);
  const [shuffledTargets, setShuffledTargets] = useState<string[]>([]);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentFullName, setStudentFullName] = useState("Student");
  const [studentSection, setStudentSection] = useState("Grade 3-A");
  const [feedbackType, setFeedbackType] = useState<"correct" | "wrong" | null>(null);
  const [recordedAnswers, setRecordedAnswers] = useState<
    Array<{ questionId: number; choiceId?: number | null; isCorrect: boolean }>
  >([]);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);

      // Reset all quiz interaction state for a fresh start
      setCurrentIndex(0);
      setSelectedChoiceId(null);
      setSelectedChoiceIds([]);
      setMatchedPairs({});
      setSelectedLeftChoiceId(null);
      setIsSubmitted(false);
      setScore(0);
      setShowHint(false);
      setQuizFinished(false);
      setShowExitConfirm(false);
      setFeedbackType(null);
      setRecordedAnswers([]);
      setStageLockedReason(null);
      setFirstUnfinishedLessonId(null);
      setIsAlreadyPassed(false);

      const user = getCurrentUser();

      // Sync fresh profile from Supabase to ensure teacherId is available
      if (user?.id) {
        try {
          const { createClient } = await import("@/utils/supabase/client");
          const supabase = createClient();
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          if (prof) {
            user.section = prof.section || user.section || "Unassigned";
            user.teacherId = prof.teacher_id;
            user.fullName = prof.full_name || user.fullName;
            const { setCurrentUserSession } = await import("@/utils/auth-helpers");
            setCurrentUserSession(user);
          }
        } catch {
          // ignore sync errors
        }
      }

      const studentSec = user?.section || "Grade 3-A";
      const teacherId = user?.teacherId || null;
      setStudentFullName(user?.fullName || "Student");
      setStudentSection(studentSec);

      const [liveBadges, loadedQuiz, liveLessons, liveLessonProg] = await Promise.all([
        fetchBadgesFromSupabase(studentSec, teacherId),
        isStageFinal && badgeId
          ? fetchStageFinalQuiz(badgeId)
          : lessonId
            ? fetchQuizForLesson(lessonId)
            : fetchQuizForLesson(1),
        fetchLessonsForStudent(studentSec, teacherId),
        user?.id
          ? fetchStudentLessonProgress(user.id)
          : Promise.resolve(
            {} as Record<
              number,
              { status: "completed" | "in_progress" | "locked"; highest_score: number }
            >
          ),
      ]);

      setAllLessons(liveLessons);
      setLessonProgress(liveLessonProg);

      // Determine if student has already passed this quiz prior to this session
      if (isStageFinal && badgeId && user?.id) {
        try {
          const { createClient } = await import("@/utils/supabase/client");
          const supabase = createClient();
          const { data: bProg } = await supabase
            .from("student_badge_progress")
            .select("status")
            .eq("student_id", user.id)
            .eq("badge_id", badgeId)
            .maybeSingle();
          setIsAlreadyPassed(bProg?.status === "completed");
        } catch {
          setIsAlreadyPassed(false);
        }
      } else if (lessonId) {
        setIsAlreadyPassed(liveLessonProg[lessonId]?.status === "completed");
      }

      // If this is a Stage Final Quiz, verify that all stories in this badge/chapter are completed
      if (isStageFinal && badgeId) {
        const chapterLessons = liveLessons.filter((l) => l.badge_id === badgeId);
        if (chapterLessons.length === 0) {
          setStageLockedReason("No story lessons have been published for this quest yet.");
        } else {
          const unfinished = chapterLessons.find(
            (l) => liveLessonProg[l.lesson_id]?.status !== "completed"
          );
          if (unfinished) {
            setStageLockedReason(
              `Please complete all chapter stories first! You still need to finish "${unfinished.lesson_title}".`
            );
            setFirstUnfinishedLessonId(unfinished.lesson_id);
          }
        }
      }

      setBadges(liveBadges);
      setQuizData(loadedQuiz);
      setLoading(false);
    }
    loadQuiz();
  }, [lessonId, badgeId, isStageFinal]);

  const questions = quizData?.questions || [];
  const currentQuestion = questions[currentIndex];
  const qType = currentQuestion?.question_type || "multiple_choice";
  const choices: QuestionChoice[] = (currentQuestion?.choices || []) as QuestionChoice[];
  const totalQuestions = questions.length;
  const maxScore = Math.max(totalQuestions * (currentQuestion?.points || 10), 10);

  // Sync shuffled right items when matching type changes or moves to next question
  useEffect(() => {
    setSelectedChoiceId(null);
    setSelectedChoiceIds([]);
    setMatchedPairs({});
    setSelectedLeftChoiceId(null);
    if (currentQuestion && qType === "matching") {
      const targets = choices
        .map((c) => (c.match_target || "").trim())
        .filter((t) => t.length > 0);
      setShuffledTargets(shuffleArray(targets));
    } else {
      setShuffledTargets([]);
    }
  }, [currentIndex, currentQuestion, qType]);

  const effectiveBadgeId = rawBadgeId
    ? Number(rawBadgeId)
    : quizData?.badge_id || 1;

  const currentBadge: Badge = badges.find((b) => b.badge_id === effectiveBadgeId) || {
    badge_id: effectiveBadgeId,
    badge_name: quizData?.quiz_title?.includes("Comprehension Check")
      ? quizData.quiz_title.replace(" Comprehension Check", "")
      : `Stage ${effectiveBadgeId} Badge`,
    badge_type: "star" as const,
    medal_type: null,
    badge_icon_url: null,
    badge_order: effectiveBadgeId,
    description: "Reading Milestone Badge",
    required_passing_score: 70,
    xp_reward: 250,
  };

  const nextBadgeId = effectiveBadgeId < 5 ? effectiveBadgeId + 1 : null;
  const nextBadge: Badge | null = nextBadgeId
    ? badges.find((b) => b.badge_id === nextBadgeId) || {
      badge_id: nextBadgeId,
      badge_name: `Stage ${nextBadgeId} Badge`,
      badge_type: (nextBadgeId === 2
        ? "ribbon"
        : "medal") as BadgeType,
      medal_type: (nextBadgeId === 3
        ? "bronze"
        : nextBadgeId === 4
          ? "silver"
          : nextBadgeId === 5
            ? "gold"
            : null) as MedalType,
      description: "Next reading milestone",
      required_passing_score: 75,
      xp_reward: 200,
      badge_order: nextBadgeId,
      target_section: "all",
    }
    : null;

  const nextFirstLessonId = badgeId ? badgeId * 3 + 1 : 4;

  const handleSelectRadio = (choiceId: number) => {
    if (isSubmitted) return;
    setSelectedChoiceId(choiceId);
  };

  const handleToggleCheckbox = (choiceId: number) => {
    if (isSubmitted) return;
    setSelectedChoiceIds((prev) =>
      prev.includes(choiceId) ? prev.filter((id) => id !== choiceId) : [...prev, choiceId]
    );
  };

  const handleSelectLeftItem = (choiceId: number) => {
    if (isSubmitted) return;
    setSelectedLeftChoiceId((prev) => (prev === choiceId ? null : choiceId));
  };

  const handleSelectRightTarget = (targetText: string) => {
    if (isSubmitted) return;
    if (selectedLeftChoiceId !== null) {
      setMatchedPairs((prev) => ({
        ...prev,
        [selectedLeftChoiceId]: targetText,
      }));
      // Auto move focus to next unmatched left item
      const nextUnmatched = choices.find(
        (c) => c.choice_id !== selectedLeftChoiceId && !matchedPairs[c.choice_id]
      );
      setSelectedLeftChoiceId(nextUnmatched ? nextUnmatched.choice_id : null);
    }
  };

  const handleDirectMatchSelect = (choiceId: number, targetText: string) => {
    if (isSubmitted) return;
    if (!targetText) {
      setMatchedPairs((prev) => {
        const next = { ...prev };
        delete next[choiceId];
        return next;
      });
    } else {
      setMatchedPairs((prev) => ({
        ...prev,
        [choiceId]: targetText,
      }));
    }
  };

  const handleClearMatch = (choiceId: number) => {
    if (isSubmitted) return;
    setMatchedPairs((prev) => {
      const next = { ...prev };
      delete next[choiceId];
      return next;
    });
  };

  const isSubmitDisabled = (() => {
    if (isSubmitted || !currentQuestion) return true;
    if (qType === "checkboxes") {
      return selectedChoiceIds.length === 0;
    }
    if (qType === "matching") {
      return choices.length === 0 || choices.some((c) => !matchedPairs[c.choice_id]);
    }
    return selectedChoiceId === null;
  })();

  const handleSubmitAnswer = () => {
    if (isSubmitDisabled || !currentQuestion) return;
    setIsSubmitted(true);

    let isCorrectAnswer = false;

    if (qType === "checkboxes") {
      const correctChoiceIds = choices
        .filter((c) => c.is_correct)
        .map((c) => c.choice_id);
      const isMatch =
        correctChoiceIds.length === selectedChoiceIds.length &&
        correctChoiceIds.every((id) => selectedChoiceIds.includes(id));
      isCorrectAnswer = isMatch;
    } else if (qType === "matching") {
      const allMatchedCorrectly = choices.every((c) => {
        const studentMatch = (matchedPairs[c.choice_id] || "").trim();
        const expectedMatch = (c.match_target || "").trim();
        return studentMatch === expectedMatch;
      });
      isCorrectAnswer = allMatchedCorrectly;
    } else {
      const chosen = choices.find((c) => c.choice_id === selectedChoiceId);
      isCorrectAnswer = Boolean(chosen?.is_correct);
    }

    if (isCorrectAnswer) {
      setFeedbackType("correct");
      soundEffects.playCorrect(true);
      setScore((prev) => prev + (currentQuestion.points || 10));
    } else {
      setFeedbackType("wrong");
      soundEffects.playWrong(true);
    }

    setRecordedAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.question_id,
        choiceId: selectedChoiceId || (selectedChoiceIds[0] ?? null),
        isCorrect: isCorrectAnswer,
      },
    ]);
  };

  const handleNext = async () => {
    setFeedbackType(null);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoiceId(null);
      setSelectedChoiceIds([]);
      setMatchedPairs({});
      setSelectedLeftChoiceId(null);
      setIsSubmitted(false);
      setShowHint(false);
    } else {
      // Quiz completed - submit directly to Supabase
      const finalPercentage = Math.round((score / maxScore) * 100);
      const passingScore = quizData?.passing_score || (isStageFinal ? 75 : 70);
      const isPassed = finalPercentage >= passingScore;
      const user = getCurrentUser();

      if (user?.id && quizData?.quiz_id) {
        await submitQuizAttempt({
          studentId: user.id,
          quizId: quizData.quiz_id,
          lessonId: isStageFinal ? null : lessonId,
          badgeId: isStageFinal ? badgeId : quizData.badge_id ?? undefined,
          isStageFinal,
          score,
          totalPoints: maxScore,
          percentage: finalPercentage,
          passed: isPassed,
          answers: recordedAnswers,
        });
      }

      if (isPassed) {
        if (isStageFinal && (badgeId === 5 || currentBadge?.badge_order === 5)) {
          soundEffects.playGrandGraduationFanfare();
          setShowCertificate(true);
        } else {
          soundEffects.playVictory();
        }
      }

      setQuizFinished(true);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setSelectedChoiceIds([]);
    setMatchedPairs({});
    setSelectedLeftChoiceId(null);
    setIsSubmitted(false);
    setShowHint(false);
    setScore(0);
    setRecordedAnswers([]);
    setQuizFinished(false);
    setFeedbackType(null);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Opening comprehension assessment...</p>
      </div>
    );
  }

  if (isStageFinal && stageLockedReason) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center dashboard-card p-8 sm:p-10 space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Award className="w-7 h-7" />
        </div>
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
            Assessment Locked
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">
            {currentBadge.badge_name} Final Quiz Locked
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
            {stageLockedReason}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {firstUnfinishedLessonId ? (
            <Link href={`/dashboard/lessons?lessonId=${firstUnfinishedLessonId}`}>
              <Button className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer">
                <BookOpen className="w-4 h-4 mr-1.5" />
                Read Story Chapter
              </Button>
            </Link>
          ) : null}
          <Link href="/dashboard/badges">
            <Button variant="outline" className="h-10 px-5 rounded-xl border-slate-200 font-bold text-xs cursor-pointer">
              <Map className="w-4 h-4 mr-1.5" />
              Go to Story Realm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!quizData || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center dashboard-card p-8 space-y-4">
        <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">No Assessment Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          There are no quiz questions assigned to this evaluation yet. Please select an active story from your Badge Pathway.
        </p>
        <Link href="/dashboard/badges">
          <Button className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
            <Map className="w-3.5 h-3.5 mr-1.5" />
            Go to Badge Pathway
          </Button>
        </Link>
      </div>
    );
  }

  const selectedChoice = choices.find((c) => c.choice_id === selectedChoiceId);
  const isCorrect = selectedChoice?.is_correct;
  const percentage = Math.round((score / maxScore) * 100);
  const passingScore = quizData.passing_score || (isStageFinal ? 75 : 70);
  const isPassed = percentage >= passingScore;

  // ══════════════════════════════════════════════════════════════════════════
  // A. STAGE FINAL MASTERY COMPLETION SCREEN WITH NEXT BADGE UNLOCK REVEAL
  // ══════════════════════════════════════════════════════════════════════════
  if (quizFinished && isStageFinal && isPassed) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 py-3 sm:py-6 anim-pop-bounce">
        <div className="dashboard-card p-5 sm:p-8 md:p-10 text-center space-y-5 sm:space-y-7 relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 border-2 border-amber-300 shadow-2xl">
          {/* Glowing Aura Background */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-amber-300/40 via-yellow-200/30 to-blue-300/30 blur-3xl pointer-events-none" />

          {/* Top Congratulations Banner */}
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-widest mb-2 shadow-xs">
              <PartyPopper className="w-4 h-4 text-amber-600" />
              <span>STAGE {badgeId} MASTERY ASSESSMENT PASSED!</span>
              <Star className="w-4 h-4 text-amber-600" />
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Magical Achievement Seal Mastered!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
              Incredible reading comprehension! You scored <strong className="text-slate-900 font-black">{percentage}%</strong> on the Chapter Final Evaluation and unlocked the next Stage in your Living Storybook!
            </p>
          </div>

          {/* Dual Badge Reveal Cards: Mastered Seal + Newly Unlocked Next Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {/* 1. Mastered Seal Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-100/50 border-2 border-amber-300 shadow-md flex flex-col items-center justify-between text-center relative overflow-hidden group">
              <div className="absolute top-2 right-2">
                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>MASTERED</span>
                </span>
              </div>

              <div className="my-2 group-hover:scale-110 transition-transform duration-300">
                <BadgeGraphic
                  type={currentBadge.badge_type}
                  medalType={currentBadge.medal_type}
                  badgeIconUrl={currentBadge.badge_icon_url}
                  size="lg"
                  status="completed"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Stage {badgeId} Mastered
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  {currentBadge.badge_name}
                </h3>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 w-full flex items-center justify-center gap-1 text-xs font-black text-slate-700">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>
                  +{isAlreadyPassed ? 10 : (currentBadge.xp_reward || 250)} XP{" "}
                  {isAlreadyPassed ? "(Practice Review)" : "Awarded"}
                </span>
              </div>
            </div>

            {/* 2. Newly Unlocked Next Badge Card OR Grand Star Reader Graduation Card */}
            {nextBadge ? (
              <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden group">
                <div className="absolute top-2 right-2">
                  <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Unlock className="w-3 h-3" />
                    <span>UNLOCKED</span>
                  </span>
                </div>

                <div className="my-2 group-hover:scale-105 transition-transform duration-200">
                  <BadgeGraphic
                    type={nextBadge.badge_type}
                    medalType={nextBadge.medal_type}
                    badgeIconUrl={nextBadge.badge_icon_url}
                    size="lg"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                    Next Stage Unlocked: Stage {nextBadgeId}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    {nextBadge.badge_name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-blue-100 w-full text-[11px] font-bold text-blue-600">
                  Ready to Read Story {nextFirstLessonId}
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden group">
                <div className="absolute top-2 right-2">
                  <span className="bg-amber-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Trophy className="w-3 h-3" />
                    <span>STAR READER</span>
                  </span>
                </div>

                <div className="my-2 group-hover:scale-105 transition-transform duration-200">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 p-1 shadow-xs flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <Trophy className="w-8 h-8 fill-amber-400 text-amber-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                    Curriculum Completed
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Star Reader Certified
                  </h3>
                </div>

                <Button
                  onClick={() => setShowCertificate(true)}
                  className="mt-3 w-full h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View Certificate</span>
                </Button>
              </div>
            )}
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
            {nextBadge && (
              <Link
                href={`/dashboard/lessons?lessonId=${nextFirstLessonId}`}
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <BookOpen className="w-4 h-4" />
                  <span>Continue to Next Chapter</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}

            {!nextBadge && (
              <Button
                onClick={() => setShowCertificate(true)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Open Star Reader Certificate</span>
              </Button>
            )}

            <Link href="/dashboard/badges" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 px-6 rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs shadow-xs cursor-pointer"
              >
                <Map className="w-4 h-4 mr-2 text-amber-600" />
                <span>View Living Storybook</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Certificate Modal */}
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          studentName={studentFullName}
          section={studentSection}
          autoPlayAudio={false}
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // B. REGULAR STORY QUIZ OR RETENTION SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (quizFinished) {
    const currentLesson = allLessons.find((l) => l.lesson_id === lessonId);
    const currentStageBadgeId =
      currentLesson?.badge_id ||
      quizData?.badge_id ||
      (rawBadgeId
        ? Number(rawBadgeId)
        : lessonId && lessonId <= 15
          ? Math.ceil(lessonId / 3)
          : badgeId);
    const currentStageBadge =
      badges.find((b) => b.badge_id === currentStageBadgeId) || currentBadge;

    const chapterLessons = allLessons.filter(
      (l) => l.badge_id === currentStageBadgeId
    );
    const currentLessonIdx = chapterLessons.findIndex(
      (l) => l.lesson_id === lessonId
    );
    const nextChapterLesson =
      currentLessonIdx >= 0 && currentLessonIdx < chapterLessons.length - 1
        ? chapterLessons[currentLessonIdx + 1]
        : null;

    const isLastLessonOfStage =
      chapterLessons.length > 0
        ? currentLessonIdx === chapterLessons.length - 1 ||
        chapterLessons.every(
          (l) =>
            l.lesson_id === lessonId ||
            lessonProgress[l.lesson_id]?.status === "completed"
        )
        : lessonId
          ? lessonId % 3 === 0
          : true;

    const nextLessonId =
      nextChapterLesson?.lesson_id ||
      (lessonId && !isLastLessonOfStage ? lessonId + 1 : null);

    return (
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 py-3 sm:py-6 anim-pop-bounce">
        <div className="dashboard-card p-5 sm:p-8 md:p-10 text-center space-y-5 sm:space-y-6 relative overflow-hidden bg-gradient-to-b from-white via-amber-50/20 to-white border-2 border-amber-200/80 shadow-xl">
          {isPassed && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-amber-300/30 blur-2xl pointer-events-none" />
          )}

          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl mx-auto flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md border-2 transition-transform duration-500 animate-bounce ${isPassed
                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-300 shadow-emerald-500/30"
                : "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-300 shadow-amber-500/30"
              }`}
          >
            {isPassed ? <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10" /> : <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10" />}
          </div>

          <div>
            <span
              className={`text-[10px] sm:text-xs font-black uppercase tracking-widest block mb-1.5 ${isPassed
                  ? isLastLessonOfStage
                    ? "text-purple-600"
                    : "text-emerald-600"
                  : "text-amber-600"
                }`}
            >
              {isPassed
                ? isLastLessonOfStage
                  ? "All Chapter Stories Completed — Final Quiz Unlocked"
                  : "Story Comprehension Passed"
                : "Keep Practicing · Retained"}
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isPassed
                ? isLastLessonOfStage
                  ? "Ready for Stage Final Assessment!"
                  : "Story Progress & XP Saved!"
                : "Target Score Not Reached"}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              {isPassed
                ? isLastLessonOfStage
                  ? `Incredible achievement! You have mastered all stories in ${currentStageBadge.badge_name}. You must now pass the Stage Final Mastery Assessment to earn your seal and complete this chapter!`
                  : "Great job! You passed the reading comprehension assessment and unlocked the next story in this chapter!"
                : `You scored ${percentage}%. You need ≥${passingScore}% to pass and advance. Review the story passage and retry!`}
            </p>
          </div>

          {/* 3-Star Rating Display */}
          <div className="flex flex-col items-center justify-center gap-1.5 py-1">
            <StarRatingRow score={percentage} size="w-7 h-7 sm:w-8 sm:h-8" />
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 font-bold text-xs sm:text-sm">
              <span>
                {percentage >= 100
                  ? "⭐⭐⭐ Perfect Score · 3/3 Stars!"
                  : `${getStarCountFromScore(percentage)} of 3 Stars Earned`}
              </span>
            </div>
          </div>

          {/* Score & XP Earned Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto">
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Score
              </span>
              <span className="text-base sm:text-xl font-black text-slate-900">
                {score} / {maxScore}
              </span>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80">
              <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
                Accuracy
              </span>
              <span className="text-base sm:text-xl font-black text-blue-900">{percentage}%</span>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-0.5">
                Reward
              </span>
              <span className="text-xl font-black text-amber-900 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>+{isPassed ? (isAlreadyPassed ? 5 : 50) : 0} XP</span>
              </span>
              <span className="text-[9px] text-amber-700 font-semibold block mt-0.5">
                {isPassed
                  ? isAlreadyPassed
                    ? "Practice Review"
                    : "Milestone Pass"
                  : "Target Not Reached"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
            {isPassed ? (
              isLastLessonOfStage ? (
                <>
                  <Link
                    href={`/dashboard/quiz?badgeId=${currentStageBadgeId}&type=final`}
                    className="w-full sm:w-auto"
                  >
                    <Button className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 animate-bounce">
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>Take Stage Final Mastery Quiz ⭐</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Link href="/dashboard/badges" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-12 px-5 rounded-2xl border-slate-200 text-slate-700 font-bold text-xs bg-white hover:bg-slate-50"
                    >
                      <Map className="w-4 h-4 mr-2 text-blue-600" />
                      <span>View Storybook Map</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard/badges" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2">
                      <Map className="w-4 h-4" />
                      <span>View Living Storybook</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  {nextLessonId && (
                    <Link href={`/dashboard/lessons?lessonId=${nextLessonId}`} className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto h-11 px-5 rounded-xl border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs shadow-2xs"
                      >
                        <BookOpen className="w-4 h-4 mr-2 text-emerald-600" />
                        <span>Start Next Story</span>
                      </Button>
                    </Link>
                  )}
                </>
              )
            ) : (
              <>
                <Button
                  onClick={handleRetake}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Assessment</span>
                </Button>

                {lessonId ? (
                  <Link href={`/dashboard/lessons?lessonId=${lessonId}`} className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 text-slate-700 font-bold text-xs bg-white hover:bg-slate-50"
                    >
                      <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Re-read Story</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard/badges" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 text-slate-700 font-bold text-xs bg-white hover:bg-slate-50"
                    >
                      <Map className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Back to Storybook</span>
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // C. ACTIVE QUESTION EVALUATION VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-between sm:justify-start space-y-3 sm:space-y-4 relative pb-2 sm:pb-16 min-h-[calc(100dvh-1rem)] sm:min-h-0">
      {/* ── 1. Floating Top Feedback Toast on Answer ─────────────────── */}
      {feedbackType === "correct" && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200 w-[90vw] max-w-sm">
          <div className="bg-emerald-700 text-white px-4 py-2.5 sm:px-5 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold shadow-xs flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider block uppercase text-emerald-200">
                Correct Selection
              </span>
              <span className="text-sm font-bold text-white">
                +{currentQuestion?.points || 10} XP Earned
              </span>
            </div>
          </div>
        </div>
      )}

      {feedbackType === "wrong" && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200 w-[90vw] max-w-sm">
          <div className="bg-amber-700 text-white px-4 py-2.5 sm:px-5 rounded-xl shadow-xl border border-amber-500/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-800 text-amber-100 flex items-center justify-center font-bold shadow-xs flex-shrink-0">
              <HelpCircle className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider block uppercase text-amber-200">
                Incorrect Selection
              </span>
              <span className="text-sm font-bold text-white">
                Review the explanation below
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Exit Safeguard Confirmation Modal ───────────────────────── */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-slate-100 text-center space-y-5 anim-pop-bounce">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Leave Assessment?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are currently taking this comprehension evaluation. If you exit now, your current score will not be saved.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 h-11 rounded-xl text-xs font-bold border-slate-200 cursor-pointer"
              >
                Stay in Quiz
              </Button>

              <Link href="/dashboard/badges" className="flex-1">
                <Button
                  className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Exit to Storybook
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Clean, Compact Top Header ── */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl border border-slate-200/80 shadow-xs flex-shrink-0">
        {/* Left: Title + Final Stage Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <h1
            className="text-xs sm:text-base md:text-lg font-black text-slate-900 tracking-tight truncate"
            title={quizData.quiz_title}
          >
            {quizData.quiz_title}
          </h1>
          {isStageFinal && (
            <span className="bg-amber-100 text-amber-800 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-300 flex-shrink-0">
              FINAL
            </span>
          )}
        </div>

        {/* Right: Question Progress + Clean Exit Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex flex-col items-end gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-700">
              <span className="hidden sm:inline text-slate-400">Question</span>
              <span>
                {currentIndex + 1}/{totalQuestions}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-14 sm:w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="rounded-xl border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold text-slate-700 bg-white shadow-2xs h-8 sm:h-9 px-2 sm:px-3 cursor-pointer flex items-center gap-1 transition-all"
            title="Exit Assessment"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Exit</span>
          </Button>
        </div>
      </div>

      {/* ── 4. Question & Choice Cards ─────────────────────────────────── */}
      <div
        className={`dashboard-card p-4 sm:p-7 flex-1 sm:flex-initial flex flex-col justify-between space-y-3 sm:space-y-5 border-2 border-amber-100 bg-[#fffdfa] shadow-md transition-all duration-300 ${feedbackType === "correct"
            ? "ring-2 ring-emerald-400/50"
            : feedbackType === "wrong"
              ? "ring-2 ring-amber-400/50 anim-shake-wiggle"
              : ""
          }`}
      >
        {/* Top: Question Header */}
        <div className="pb-3 border-b border-amber-200/60 space-y-2 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-black text-blue-600 uppercase tracking-widest block">
                {isStageFinal ? "Stage Mastery Question" : "Comprehension Question"} {currentIndex + 1}
              </span>

              {/* Question Type Pill Badge */}
              {qType === "checkboxes" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                  <CheckSquare className="w-3 h-3 text-emerald-600" />
                  <span>Checkboxes · Select All That Apply</span>
                </span>
              ) : qType === "matching" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black border border-purple-300">
                  <Puzzle className="w-3 h-3 text-purple-600" />
                  <span>Matching Type · Connect Each Pair</span>
                </span>
              ) : null}
            </div>

            <span className="text-[10px] sm:text-[11px] font-black text-amber-700 bg-amber-50 px-2.5 sm:px-3 py-1 rounded-xl border border-amber-200 whitespace-nowrap flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>+{currentQuestion.points || 10} XP</span>
            </span>
          </div>

          {/* Question Prompt Image (if present) */}
          {currentQuestion.question_image_url && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-200/80 bg-amber-50/40 shadow-xs max-h-64 sm:max-h-80 flex items-center justify-center group my-1">
              <img
                src={currentQuestion.question_image_url}
                alt="Question Visual"
                className="w-full max-h-64 sm:max-h-80 object-contain rounded-2xl cursor-pointer hover:scale-[1.01] transition-transform duration-300"
                onClick={() => setExpandedImageUrl(currentQuestion.question_image_url || null)}
              />
              <button
                type="button"
                onClick={() => setExpandedImageUrl(currentQuestion.question_image_url || null)}
                className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-slate-900/75 hover:bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-xs transition-colors shadow-xs cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Enlarge Picture</span>
              </button>
            </div>
          )}

          <h2 className="text-sm sm:text-lg font-black text-slate-900 leading-snug">
            {currentQuestion.question_text}
          </h2>
        </div>

        {/* Middle: Answer Choices + Feedback + Hint */}
        <div className="flex-1 flex flex-col justify-center py-1 sm:py-2 space-y-3 min-h-0">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* A. MATCHING TYPE BOARD */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {qType === "matching" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1">
                <span>
                  {isSubmitted
                    ? "Evaluation of Matched Pairs"
                    : "Tap a Left Item, then tap its Matching Target on the right:"}
                </span>
                <span className="text-[11px] text-purple-700 font-black">
                  {Object.keys(matchedPairs).length} of {choices.length} paired
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Column 1: Left Items / Premises */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    Story Clues / Items:
                  </span>
                  {choices.map((choice, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = selectedLeftChoiceId === choice.choice_id;
                    const matchedTarget = matchedPairs[choice.choice_id];
                    const isPairCorrect =
                      isSubmitted &&
                      (matchedTarget || "").trim() === (choice.match_target || "").trim();

                    let cardBorder = "border-slate-200 bg-white hover:border-purple-300";
                    if (isSelected && !isSubmitted) {
                      cardBorder = "border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/30";
                    } else if (isSubmitted) {
                      cardBorder = isPairCorrect
                        ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500"
                        : "border-rose-400 bg-rose-50/60 ring-1 ring-rose-400";
                    }

                    return (
                      <div
                        key={choice.choice_id}
                        onClick={() => handleSelectLeftItem(choice.choice_id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 shadow-2xs select-none ${cardBorder}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 text-xs font-black flex items-center justify-center flex-shrink-0">
                              {letter}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                              {choice.choice_text}
                            </span>
                          </div>

                          {choice.choice_image_url && (
                            <img
                              src={choice.choice_image_url}
                              alt={choice.choice_text}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedImageUrl(choice.choice_image_url || null);
                              }}
                            />
                          )}
                        </div>

                        {/* Matched target badge or unassigned tag */}
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          {matchedTarget ? (
                            <div className="flex items-center justify-between w-full bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                              <span className="font-bold text-purple-900 truncate">
                                ⇄ {matchedTarget}
                              </span>
                              {!isSubmitted && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearMatch(choice.choice_id);
                                  }}
                                  className="text-purple-400 hover:text-rose-600 p-0.5 rounded cursor-pointer ml-1"
                                  title="Unlink match"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span
                              className={`text-[11px] font-semibold italic ${
                                isSelected ? "text-purple-600 font-bold" : "text-slate-400"
                              }`}
                            >
                              {isSelected
                                ? "👉 Now tap matching answer on the right!"
                                : "Tap to connect match..."}
                            </span>
                          )}

                          {isSubmitted && (
                            <div className="flex-shrink-0">
                              {isPairCorrect ? (
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Matched</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Correct: {choice.match_target}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Touch Dropdown Fallback */}
                        {!isSubmitted && (
                          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={matchedTarget || ""}
                              onChange={(e) =>
                                handleDirectMatchSelect(choice.choice_id, e.target.value)
                              }
                              className="w-full text-xs font-semibold px-2 py-1 rounded-lg border border-purple-200 bg-white text-slate-800 outline-none cursor-pointer"
                            >
                              <option value="">Select match from list...</option>
                              {shuffledTargets.map((tgt, tIdx) => (
                                <option key={tIdx} value={tgt}>
                                  {tgt}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Column 2: Right Targets / Available Matches */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    Matching Targets:
                  </span>
                  <div className="space-y-2">
                    {shuffledTargets.map((targetText, tIdx) => {
                      const isAssigned = Object.values(matchedPairs).includes(targetText);

                      return (
                        <div
                          key={tIdx}
                          onClick={() => handleSelectRightTarget(targetText)}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer shadow-2xs select-none ${
                            isAssigned
                              ? "border-purple-300 bg-purple-50/50 text-purple-950 font-bold"
                              : selectedLeftChoiceId !== null
                              ? "border-purple-400 bg-white hover:bg-purple-50/80 hover:border-purple-500 animate-pulse"
                              : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center flex-shrink-0">
                              {tIdx + 1}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold leading-snug">
                              {targetText}
                            </span>
                          </div>

                          {isAssigned && (
                            <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex-shrink-0">
                              Linked
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : qType === "checkboxes" ? (
            /* ═══════════════════════════════════════════════════════════════ */
            /* B. CHECKBOXES (SELECT ALL THAT APPLY) */
            /* ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1">
                <span className="text-emerald-700 font-black flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Check all correct answers that apply:</span>
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {selectedChoiceIds.length} option(s) selected
                </span>
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                {choices.map((choice, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isChecked = selectedChoiceIds.includes(choice.choice_id);

                  let cardStyles =
                    "border-slate-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/20";
                  let checkIcon = isChecked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  );

                  if (isChecked && !isSubmitted) {
                    cardStyles =
                      "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs";
                  } else if (isSubmitted) {
                    if (choice.is_correct && isChecked) {
                      cardStyles =
                        "border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 anim-pop-bounce";
                      checkIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
                    } else if (!choice.is_correct && isChecked) {
                      cardStyles = "border-rose-400 bg-rose-50/70";
                      checkIcon = <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
                    } else if (choice.is_correct && !isChecked) {
                      cardStyles =
                        "border-amber-400 bg-amber-50/50 border-dashed ring-1 ring-amber-300";
                      checkIcon = <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />;
                    } else {
                      cardStyles = "opacity-40 border-slate-200 bg-slate-50";
                    }
                  }

                  return (
                    <div
                      key={choice.choice_id}
                      onClick={() => handleToggleCheckbox(choice.choice_id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer min-h-[52px] sm:min-h-[56px] select-none ${cardStyles}`}
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-2">
                        {checkIcon}

                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-700 flex-shrink-0">
                          {letter}
                        </span>

                        {choice.choice_image_url && (
                          <img
                            src={choice.choice_image_url}
                            alt={choice.choice_text}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedImageUrl(choice.choice_image_url || null);
                            }}
                          />
                        )}

                        <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                          {choice.choice_text}
                        </span>
                      </div>

                      {isSubmitted && (
                        <div className="flex-shrink-0">
                          {choice.is_correct && isChecked && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Correct!
                            </span>
                          )}
                          {!choice.is_correct && isChecked && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                              Incorrect
                            </span>
                          )}
                          {choice.is_correct && !isChecked && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              Correct (Missed)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════════ */
            /* C. MULTIPLE CHOICE (WITH SUPPORT FOR IMAGE CHOICES) */
            /* ═══════════════════════════════════════════════════════════════ */
            <div
              className={
                choices.some((c) => Boolean(c.choice_image_url))
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
                  : "space-y-2 sm:space-y-2.5"
              }
            >
              {choices.map((choice, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedChoiceId === choice.choice_id;
                const hasImage = Boolean(choice.choice_image_url);

                let cardStyles =
                  "border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/20";
                let indicatorStyles = "bg-slate-100 text-slate-700 border-slate-200";

                if (isSelected && !isSubmitted) {
                  cardStyles = "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs";
                  indicatorStyles = "bg-blue-600 text-white border-blue-600 font-bold";
                } else if (isSubmitted) {
                  if (choice.is_correct) {
                    cardStyles =
                      "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/30 anim-pop-bounce";
                    indicatorStyles = "bg-emerald-500 text-white border-emerald-500 font-bold";
                  } else if (isSelected && !choice.is_correct) {
                    cardStyles = "border-rose-400 bg-rose-50/70";
                    indicatorStyles = "bg-rose-500 text-white border-rose-500 font-bold";
                  } else {
                    cardStyles = "opacity-40 border-slate-200 bg-slate-50";
                  }
                }

                if (hasImage) {
                  return (
                    <div
                      key={choice.choice_id}
                      onClick={() => handleSelectRadio(choice.choice_id)}
                      className={`rounded-2xl border transition-all flex flex-col justify-between cursor-pointer select-none p-3.5 shadow-2xs ${cardStyles}`}
                    >
                      {/* Top bar with Letter Badge & Indicator */}
                      <div className="flex items-center justify-between gap-2 pb-2">
                        <span
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black flex items-center justify-center border flex-shrink-0 transition-all ${indicatorStyles}`}
                        >
                          {letter}
                        </span>

                        {isSubmitted && choice.is_correct && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-bounce" />
                        )}
                        {isSubmitted && isSelected && !choice.is_correct && (
                          <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Choice Image */}
                      <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden border border-slate-200 mb-2 bg-slate-100 flex items-center justify-center">
                        <img
                          src={choice.choice_image_url || ""}
                          alt={choice.choice_text}
                          className="w-full h-full object-cover rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedImageUrl(choice.choice_image_url || null);
                          }}
                        />
                      </div>

                      {/* Choice text */}
                      {choice.choice_text && (
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                          {choice.choice_text}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={choice.choice_id}
                    onClick={() => handleSelectRadio(choice.choice_id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer min-h-[52px] sm:min-h-[56px] select-none ${cardStyles}`}
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-2">
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black flex items-center justify-center border flex-shrink-0 transition-all ${indicatorStyles}`}
                      >
                        {letter}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                        {choice.choice_text}
                      </span>
                    </div>

                    {isSubmitted && choice.is_correct && (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0 animate-bounce" />
                    )}
                    {isSubmitted && isSelected && !choice.is_correct && (
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedback / Explanation Box */}
          {isSubmitted && (
            <div
              className={`p-3.5 sm:p-4 rounded-xl border text-xs leading-relaxed space-y-1 transition-all duration-200 ${
                feedbackType === "correct"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : "bg-amber-50 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                {feedbackType === "correct" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Correct! +{currentQuestion.points || 10} XP Earned</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Review Explanation:</span>
                  </>
                )}
              </div>
              {currentQuestion.explanation && (
                <p className="text-[11px] sm:text-xs opacity-90 leading-relaxed font-medium">
                  {currentQuestion.explanation}
                </p>
              )}
            </div>
          )}

          {/* Hint Section */}
          {currentQuestion.hint && (
            <div className="pt-0.5">
              {!showHint ? (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline py-0.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Need a reading hint?</span>
                </button>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Hint:</span>
                    <span className="text-[11px]">{currentQuestion.hint}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom: Action Controls */}
        <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
          {!isSubmitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={isSubmitDisabled}
              className="h-11 px-6 sm:px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="h-11 px-6 sm:px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{currentIndex === totalQuestions - 1 ? "Complete Assessment" : "Next Question"}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Lightbox Image Zoom Modal ── */}
      {expandedImageUrl && (
        <div
          onClick={() => setExpandedImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer anim-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 shadow-2xl border border-slate-700 flex flex-col items-center"
          >
            <button
              type="button"
              onClick={() => setExpandedImageUrl(null)}
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={expandedImageUrl}
              alt="Enlarged Visual"
              className="max-h-[82vh] max-w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading Quiz Evaluation...</p>
        </div>
      }
    >
      <QuizContentKeyWrapper />
    </Suspense>
  );
}

/** Wrapper that reads searchParams and passes a key to force full remount */
function QuizContentKeyWrapper() {
  const searchParams = useSearchParams();
  const quizKey = `${searchParams.get("lessonId") || "none"}-${searchParams.get("badgeId") || "none"}-${searchParams.get("type") || "lesson"}`;
  return <QuizContent key={quizKey} />;
}
