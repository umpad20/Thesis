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
  Sparkles,
  Star,
  PartyPopper,
  Volume2,
  Award,
  Unlock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BadgeGraphic } from "@/components/badge-graphic";
import {
  fetchQuizForLesson,
  fetchStageFinalQuiz,
  fetchBadgesFromSupabase,
  type QuizWithQuestions,
  submitQuizAttempt,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import { soundEffects } from "@/utils/sound-effects";
import type { Badge, BadgeType, MedalType } from "@/lib/types";

function QuizContent() {
  const searchParams = useSearchParams();
  const rawLessonId = searchParams.get("lessonId");
  const rawBadgeId = searchParams.get("badgeId");
  const isStageFinal = searchParams.get("type") === "final";

  const lessonId = rawLessonId ? Number(rawLessonId) : null;
  const badgeId = rawBadgeId ? Number(rawBadgeId) : 1;

  const [quizData, setQuizData] = useState<QuizWithQuestions | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"correct" | "wrong" | null>(null);
  const [recordedAnswers, setRecordedAnswers] = useState<
    Array<{ questionId: number; choiceId: number; isCorrect: boolean }>
  >([]);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      const user = getCurrentUser();
      const studentSection = user?.section || "Grade 3-A";

      const [liveBadges, loadedQuiz] = await Promise.all([
        fetchBadgesFromSupabase(studentSection),
        isStageFinal && badgeId
          ? fetchStageFinalQuiz(badgeId)
          : lessonId
          ? fetchQuizForLesson(lessonId)
          : fetchQuizForLesson(1),
      ]);

      setBadges(liveBadges);
      setQuizData(loadedQuiz);
      setLoading(false);
    }
    loadQuiz();
  }, [lessonId, badgeId, isStageFinal]);

  const questions = quizData?.questions || [];
  const currentQuestion = questions[currentIndex];
  const choices = currentQuestion?.choices || [];
  const totalQuestions = questions.length;
  const maxScore = Math.max(totalQuestions * (currentQuestion?.points || 10), 10);

  const currentBadge = badges.find((b) => b.badge_id === badgeId) || {
    badge_id: badgeId,
    badge_name: `Stage ${badgeId} Badge`,
    badge_type: "star" as const,
    medal_type: undefined,
    badge_order: badgeId,
  };

  const nextBadgeId = badgeId < 5 ? badgeId + 1 : null;
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

  const handleSelect = (choiceId: number) => {
    if (isSubmitted) return;
    setSelectedChoiceId(choiceId);
  };

  const handleSubmitAnswer = () => {
    if (selectedChoiceId === null || !currentQuestion) return;
    setIsSubmitted(true);

    const chosen = choices.find((c) => c.choice_id === selectedChoiceId);
    const isCorrectChoice = Boolean(chosen?.is_correct);

    if (isCorrectChoice) {
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
        choiceId: selectedChoiceId,
        isCorrect: isCorrectChoice,
      },
    ]);
  };

  const handleNext = async () => {
    setFeedbackType(null);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoiceId(null);
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
        soundEffects.playVictory();
      }

      setQuizFinished(true);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedChoiceId(null);
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
      <div className="max-w-3xl mx-auto space-y-6 py-6 anim-pop-bounce">
        <div className="dashboard-card p-8 sm:p-10 text-center space-y-7 relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 border-2 border-amber-300 shadow-2xl">
          {/* Glowing Aura Background */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-amber-300/40 via-yellow-200/30 to-blue-300/30 blur-3xl pointer-events-none" />

          {/* Top Congratulations Banner */}
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-widest mb-2 shadow-xs">
              <PartyPopper className="w-4 h-4 text-amber-600" />
              <span>STAGE {badgeId} MASTERY ASSESSMENT PASSED!</span>
              <Sparkles className="w-4 h-4 text-amber-600" />
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

              <div className="mt-3 pt-2 border-t border-amber-200/80 w-full flex items-center justify-center gap-1 text-xs font-black text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>+250 XP Awarded</span>
              </div>
            </div>

            {/* 2. Newly Unlocked Next Badge Card */}
            {nextBadge && (
              <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50/60 border-2 border-blue-400 ring-4 ring-blue-400/20 shadow-lg flex flex-col items-center justify-between text-center relative overflow-hidden group anim-pop-bounce">
                <div className="absolute top-2 right-2">
                  <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                    <Unlock className="w-3 h-3" />
                    <span>UNLOCKED!</span>
                  </span>
                </div>

                <div className="my-2 group-hover:scale-110 transition-transform duration-300">
                  <BadgeGraphic
                    type={nextBadge.badge_type}
                    medalType={nextBadge.medal_type}
                    size="lg"
                    status="completed"
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

                <div className="mt-3 pt-2 border-t border-blue-200/80 w-full text-[11px] font-bold text-blue-600">
                  Ready to Read Story {nextFirstLessonId}
                </div>
              </div>
            )}
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-amber-200/60">
            {nextBadge && (
              <Link
                href={`/dashboard/lessons?lessonId=${nextFirstLessonId}`}
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2.5 transition-all">
                  <BookOpen className="w-5 h-5" />
                  <span>Continue Reading Next Chapter 📖</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}

            <Link href="/dashboard/badges" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 px-6 rounded-2xl border-amber-300 text-slate-800 bg-white hover:bg-amber-50/60 font-bold text-xs shadow-xs"
              >
                <Map className="w-4 h-4 mr-2 text-amber-600" />
                <span>View Living Storybook</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // B. REGULAR STORY QUIZ OR RETENTION SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (quizFinished) {
    const nextLessonId = lessonId && lessonId < 15 ? lessonId + 1 : null;

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 anim-pop-bounce">
        <div className="dashboard-card p-8 sm:p-10 text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-white via-amber-50/20 to-white border-2 border-amber-200/80 shadow-xl">
          {isPassed && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-amber-300/30 blur-2xl pointer-events-none" />
          )}

          <div
            className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center font-bold text-3xl shadow-md border-2 transition-transform duration-500 animate-bounce ${
              isPassed
                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-300 shadow-emerald-500/30"
                : "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-300 shadow-amber-500/30"
            }`}
          >
            {isPassed ? <PartyPopper className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
          </div>

          <div>
            <span
              className={`text-xs font-black uppercase tracking-widest block mb-1.5 ${
                isPassed ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {isPassed ? "✨ STORY COMPREHENSION PASSED! ✨" : "KEEP PRACTICING (RETAINED)"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isPassed ? "Story Progress & XP Saved!" : "Target Score Not Reached"}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              {isPassed
                ? "Great job! You passed the reading comprehension assessment and unlocked the next story in this chapter!"
                : `You scored ${percentage}%. You need ≥${passingScore}% to pass and advance. Review the story passage and retry!`}
            </p>
          </div>

          {/* Score & XP Earned Metrics */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Score
              </span>
              <span className="text-xl font-black text-slate-900">
                {score} / {maxScore}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
                Accuracy
              </span>
              <span className="text-xl font-black text-blue-900">{percentage}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-0.5">
                Reward
              </span>
              <span className="text-xl font-black text-amber-900 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>+{isPassed ? 50 : 10} XP</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
            {isPassed ? (
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
    <div className="max-w-3xl mx-auto space-y-6 relative">
      {/* ── 1. Floating Top Celebratory Popup on Answer ─────────────────── */}
      {feedbackType === "correct" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none anim-pop-bounce">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white px-7 py-4 rounded-3xl shadow-2xl border-2 border-white flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center font-black text-lg shadow-sm animate-bounce">
              ⭐
            </div>
            <div>
              <span className="text-xs font-black tracking-wider block uppercase text-emerald-100">
                Awesome! That&apos;s Right! ✨
              </span>
              <span className="text-base font-black text-white">
                +{currentQuestion?.points || 10} XP Earned!
              </span>
            </div>
          </div>
        </div>
      )}

      {feedbackType === "wrong" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none anim-shake-wiggle">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-7 py-4 rounded-3xl shadow-2xl border-2 border-white flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white text-amber-600 flex items-center justify-center font-black text-lg shadow-sm">
              💪
            </div>
            <div>
              <span className="text-xs font-black tracking-wider block uppercase text-amber-100">
                Nice try! Keep it up! 💡
              </span>
              <span className="text-sm font-black text-white">
                Let&apos;s review the clue below
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
                className="flex-1 h-11 rounded-xl text-xs font-bold border-slate-200"
              >
                Stay in Quiz
              </Button>

              <Link href="/dashboard/badges" className="flex-1">
                <Button
                  className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Exit to Storybook
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Header & Navigation Trail ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span className="text-blue-600 font-bold flex items-center gap-1">
              <Map className="w-3.5 h-3.5" />
              <span>Living Storybook Evaluation</span>
            </span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-bold">{currentBadge.badge_name}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-500 font-medium">
              {isStageFinal ? "Stage Final Assessment" : "Story Quiz"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {quizData.quiz_title}
            </h1>
            {isStageFinal && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                FINAL ASSESSMENT
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Passing Threshold: ≥{passingScore}% · {currentQuestion?.points || 10} Points per question
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => soundEffects.speakText("Audio and voice encouragement are active!", 1.1, 1.0)}
            className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
            title="Test Voice Audio"
          >
            <Volume2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            <span>Sound & Voice Active</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
          >
            <Map className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            <span>Exit to Storybook</span>
          </Button>
        </div>
      </div>

      {/* ── 3. Step Progress Bar ───────────────────────────────────────── */}
      <div className="dashboard-card p-4">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-slate-500">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-blue-600 font-black">
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}% Answered
          </span>
        </div>
        <Progress
          value={((currentIndex + 1) / totalQuestions) * 100}
          className="h-2.5 bg-slate-100 rounded-full"
        />
      </div>

      {/* ── 4. Question & Choice Cards ─────────────────────────────────── */}
      <div
        className={`dashboard-card p-6 md:p-8 space-y-6 border-2 border-amber-100 bg-[#fffdfa] transition-all duration-300 ${
          feedbackType === "correct"
            ? "ring-2 ring-emerald-400/50"
            : feedbackType === "wrong"
            ? "ring-2 ring-amber-400/50 anim-shake-wiggle"
            : ""
        }`}
      >
        <div className="pb-4 border-b border-amber-200/60 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest block">
              {isStageFinal ? "Stage Mastery Question" : "Comprehension Question"} {currentIndex + 1}
            </span>
            <h2 className="text-base md:text-lg font-black text-slate-900 leading-snug">
              {currentQuestion.question_text}
            </h2>
          </div>
          <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 whitespace-nowrap flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>+{currentQuestion.points || 10} XP</span>
          </span>
        </div>

        {/* Answer Choice Grid */}
        <div className="space-y-3">
          {choices.map((choice, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedChoiceId === choice.choice_id;

            let cardStyles = "border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/20";
            let indicatorStyles = "bg-slate-100 text-slate-700 border-slate-200";

            if (isSelected && !isSubmitted) {
              cardStyles = "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs";
              indicatorStyles = "bg-blue-600 text-white border-blue-600 font-bold";
            } else if (isSubmitted) {
              if (choice.is_correct) {
                cardStyles = "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/30 anim-pop-bounce";
                indicatorStyles = "bg-emerald-500 text-white border-emerald-500 font-bold";
              } else if (isSelected && !choice.is_correct) {
                cardStyles = "border-rose-400 bg-rose-50/70";
                indicatorStyles = "bg-rose-500 text-white border-rose-500 font-bold";
              } else {
                cardStyles = "opacity-40 border-slate-200 bg-slate-50";
              }
            }

            return (
              <div
                key={choice.choice_id}
                onClick={() => handleSelect(choice.choice_id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${cardStyles}`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center border transition-all ${indicatorStyles}`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {choice.choice_text}
                  </span>
                </div>

                {isSubmitted && choice.is_correct && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 animate-bounce" />
                )}
                {isSubmitted && isSelected && !choice.is_correct && (
                  <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback / Explanation Box */}
        {isSubmitted && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border text-xs leading-relaxed space-y-1.5 transition-all duration-300 ${
              isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-950 anim-pop-bounce"
                : "bg-amber-50 border-amber-200 text-amber-950 anim-shake-wiggle"
            }`}
          >
            <div className="flex items-center gap-2 font-black text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Correct! +{currentQuestion.points || 10} XP Earned ✨</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span>Good try! Let&apos;s check the clue below:</span>
                </>
              )}
            </div>
            {currentQuestion.explanation && (
              <p className="text-xs opacity-90 leading-relaxed font-medium">
                {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}

        {/* Hint Section */}
        {currentQuestion.hint && (
          <div className="pt-2">
            {!showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need a reading hint?</span>
              </button>
            ) : (
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Hint:</span>
                  <span className="text-[11px]">{currentQuestion.hint}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-bold">
            Question {currentIndex + 1} of {totalQuestions}
          </div>

          {!isSubmitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedChoiceId === null}
              className="h-11 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 disabled:opacity-50 transition-all"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="h-11 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all"
            >
              <span>{currentIndex === totalQuestions - 1 ? "Complete Assessment" : "Next Question"}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Button>
          )}
        </div>
      </div>
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
      <QuizContent />
    </Suspense>
  );
}
