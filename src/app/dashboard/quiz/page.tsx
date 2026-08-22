"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  RotateCcw,
  ChevronRight,
  BookOpen,
  Map,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { fetchQuizForLesson, type QuizWithQuestions, submitQuizAttempt } from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";

function QuizContent() {
  const searchParams = useSearchParams();
  const rawLessonId = searchParams.get("lessonId");
  const lessonId = rawLessonId ? Number(rawLessonId) : 1;

  const [quizData, setQuizData] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState<
    Array<{ questionId: number; choiceId: number; isCorrect: boolean }>
  >([]);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      const data = await fetchQuizForLesson(lessonId);
      setQuizData(data);
      setLoading(false);
    }
    loadQuiz();
  }, [lessonId]);

  const questions = quizData?.questions || [];
  const currentQuestion = questions[currentIndex];
  const choices = currentQuestion?.choices || [];
  const totalQuestions = questions.length;
  const maxScore = Math.max(totalQuestions * 10, 10);

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
      setScore((prev) => prev + (currentQuestion.points || 10));
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
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoiceId(null);
      setIsSubmitted(false);
      setShowHint(false);
    } else {
      // Quiz completed - submit directly to Supabase
      const finalPercentage = Math.round((score / maxScore) * 100);
      const isPassed = finalPercentage >= (quizData?.passing_score || 70);
      const user = getCurrentUser();

      if (user?.id && quizData?.quiz_id) {
        await submitQuizAttempt({
          studentId: user.id,
          quizId: quizData.quiz_id,
          lessonId,
          badgeId: quizData.badge_id ?? undefined,
          score,
          totalPoints: maxScore,
          percentage: finalPercentage,
          passed: isPassed,
          answers: recordedAnswers,
        });
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
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Opening comprehension quiz...</p>
      </div>
    );
  }

  if (!quizData || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center dashboard-card p-8 space-y-4">
        <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">No Assessment Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          There are no quiz questions assigned to this lesson yet. Please select an active lesson from your Badge Pathway.
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
  const isPassed = percentage >= (quizData.passing_score || 70);

  // Render Completion Screen
  if (quizFinished) {
    const nextLessonId = lessonId < 15 ? lessonId + 1 : null;

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <div className="dashboard-card p-8 text-center space-y-6">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl shadow-sm border ${
              isPassed
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-amber-50 text-amber-600 border-amber-200"
            }`}
          >
            {isPassed ? <Award className="w-8 h-8" /> : <RotateCcw className="w-8 h-8" />}
          </div>

          <div>
            <span
              className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                isPassed ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {isPassed ? "Comprehension Mastered! 🎉" : "Keep Practicing!"}
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              {isPassed ? "Stage Progress Saved!" : "Almost There!"}
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {isPassed
                ? `You passed with an accuracy of ${percentage}%! Your progress has been updated on your Badge Pathway.`
                : `You scored ${percentage}%. You need at least ${quizData.passing_score}% to unlock the next story. Review the passage and try again!`}
            </p>
          </div>

          {/* Stats Breakdown Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Total Score</span>
              <span className="text-lg font-black text-slate-900">{score} / {maxScore}</span>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 block">Accuracy</span>
              <span className={`text-lg font-black ${isPassed ? "text-emerald-600" : "text-amber-600"}`}>
                {percentage}%
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">XP Earned</span>
              <span className="text-lg font-black text-amber-600">+{isPassed ? 50 : 15} XP</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isPassed && nextLessonId ? (
              <Link href={`/dashboard/lessons?lessonId=${nextLessonId}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-200 flex items-center justify-center gap-1.5">
                  <span>Continue to Next Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : null}

            <Link href="/dashboard/badges" className="w-full sm:w-auto">
              <Button
                variant={isPassed && nextLessonId ? "outline" : "default"}
                className={`w-full sm:w-auto h-10 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                  isPassed && nextLessonId
                    ? "border-slate-200 text-slate-700"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Return to Badge Pathway</span>
              </Button>
            </Link>

            {!isPassed && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  className="w-full sm:w-auto h-10 px-5 rounded-xl border-slate-200 text-xs font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Retry Quiz
                </Button>
                <Link href={`/dashboard/lessons?lessonId=${lessonId}`} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-10 px-5 rounded-xl border-slate-200 text-xs font-bold"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    Re-read Story
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. Header & Navigation Trail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-slate-600">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard/badges" className="hover:text-slate-600 flex items-center gap-1 text-blue-600 font-bold">
              <Map className="w-3 h-3" />
              <span>Badge Pathway</span>
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/dashboard/lessons?lessonId=${lessonId}`} className="hover:text-slate-600 text-slate-700 font-bold">
              Story Passage
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-500 font-medium">Comprehension Quiz</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {quizData.quiz_title}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Passing Threshold: ≥{quizData.passing_score}% · {currentQuestion?.points || 10} Points per question
          </p>
        </div>

        {/* Story Passage Back Link */}
        <Link href={`/dashboard/lessons?lessonId=${lessonId}`}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Re-read Story Passage
          </Button>
        </Link>
      </div>

      {/* 2. Step Progress Bar */}
      <div className="dashboard-card p-4">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-slate-500">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-blue-600">
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}% Answered
          </span>
        </div>
        <Progress
          value={((currentIndex + 1) / totalQuestions) * 100}
          className="h-2 bg-slate-100 rounded-full"
        />
      </div>

      {/* 3. Question & Choice Cards */}
      <div className="dashboard-card p-6 md:p-8 space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Comprehension Evaluation
            </span>
            <h2 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
              {currentQuestion.question_text}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 whitespace-nowrap">
            {currentQuestion.points || 10} Points
          </span>
        </div>

        {/* Answer Choice Grid */}
        <div className="space-y-3">
          {choices.map((choice, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedChoiceId === choice.choice_id;

            let cardStyles = "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50";
            let indicatorStyles = "bg-slate-100 text-slate-600 border-slate-200";

            if (isSelected && !isSubmitted) {
              cardStyles = "border-blue-600 bg-blue-50/40 ring-1 ring-blue-200";
              indicatorStyles = "bg-blue-600 text-white border-blue-600 font-bold";
            } else if (isSubmitted) {
              if (choice.is_correct) {
                cardStyles = "border-emerald-500 bg-emerald-50/40";
                indicatorStyles = "bg-emerald-500 text-white border-emerald-500 font-bold";
              } else if (isSelected && !choice.is_correct) {
                cardStyles = "border-rose-400 bg-rose-50/40";
                indicatorStyles = "bg-rose-500 text-white border-rose-500 font-bold";
              } else {
                cardStyles = "opacity-40 border-slate-200 bg-slate-50";
              }
            }

            return (
              <div
                key={choice.choice_id}
                onClick={() => handleSelect(choice.choice_id)}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${cardStyles}`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${indicatorStyles}`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    {choice.choice_text}
                  </span>
                </div>

                {isSubmitted && choice.is_correct && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                )}
                {isSubmitted && isSelected && !choice.is_correct && (
                  <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback / Explanation Box */}
        {isSubmitted && (
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${
              isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-rose-50 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct Answer!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Not quite right</span>
                </>
              )}
            </div>
            {currentQuestion.explanation && (
              <p className="text-[11px] opacity-90">{currentQuestion.explanation}</p>
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
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
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
          <div className="text-xs text-slate-400">
            {currentIndex + 1} of {totalQuestions}
          </div>

          {!isSubmitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedChoiceId === null}
              className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 disabled:opacity-50"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
            >
              <span>{currentIndex === totalQuestions - 1 ? "Complete Evaluation" : "Next Question"}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
