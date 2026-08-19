"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Award,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  mockQuizQuestions,
  mockQuestionChoices,
} from "@/lib/mock-data";

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const questions = mockQuizQuestions;
  const currentQuestion = questions[currentIndex];
  const choices = mockQuestionChoices[currentQuestion.question_id] || [];
  const totalQuestions = questions.length;
  const maxScore = totalQuestions * 10;

  const handleSelect = (choiceId: number) => {
    if (isSubmitted) return;
    setSelectedChoiceId(choiceId);
  };

  const handleSubmitAnswer = () => {
    if (selectedChoiceId === null) return;
    setIsSubmitted(true);

    const chosen = choices.find((c) => c.choice_id === selectedChoiceId);
    if (chosen?.is_correct) {
      setScore((prev) => prev + currentQuestion.points);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoiceId(null);
      setIsSubmitted(false);
      setShowHint(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setIsSubmitted(false);
    setShowHint(false);
    setScore(0);
    setQuizFinished(false);
  };

  const selectedChoice = choices.find((c) => c.choice_id === selectedChoiceId);
  const isCorrect = selectedChoice?.is_correct;
  const percentage = Math.round((score / maxScore) * 100);
  const isPassed = percentage >= 70;

  // Render Completion Screen
  if (quizFinished) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <div className="dashboard-card p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center font-bold text-2xl shadow-sm">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              Assessment Completed
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              {isPassed ? "Comprehension Mastered! 🎉" : "Assessment Review Required"}
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {isPassed
                ? "You have successfully passed the evaluation quiz for Lesson 3 with flying colors!"
                : "You need at least 70% to clear this module. Review the story passage and try again."}
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
              <span className="text-lg font-black text-emerald-600">{percentage}%</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">XP Earned</span>
              <span className="text-lg font-black text-amber-600">+{score * 5} XP</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleRetake}
              className="w-full sm:w-auto h-10 px-5 rounded-xl border-slate-200 text-xs font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Retake Assessment
            </Button>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200">
                Return to Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
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
            <Link href="/dashboard/lessons" className="hover:text-slate-600">
              Lesson 3
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">Comprehension Quiz</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Comprehension Assessment: The Kind Farmer
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Passing Threshold: ≥70% · 10 Points per question
          </p>
        </div>

        {/* Live Score Ticker */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-slate-500">Current Score: </span>
          <span className="text-blue-600 font-bold">{score} pts</span>
        </div>
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
              Multiple Choice Evaluation
            </span>
            <h2 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
              {currentQuestion.question_text}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 whitespace-nowrap">
            {currentQuestion.points} Points
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
              <button
                type="button"
                key={choice.choice_id}
                onClick={() => handleSelect(choice.choice_id)}
                disabled={isSubmitted}
                className={`w-full p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all text-xs font-semibold text-slate-800 ${cardStyles}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs flex-shrink-0 transition-colors ${indicatorStyles}`}
                >
                  {letter}
                </div>
                <span className="flex-1">{choice.choice_text}</span>
                {isSubmitted && choice.is_correct && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                )}
                {isSubmitted && isSelected && !choice.is_correct && (
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert Drawer after submission */}
        {isSubmitted && (
          <div
            className={`p-4 rounded-xl border text-xs ${
              isCorrect
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                : "bg-amber-50/70 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct! +{currentQuestion.points} Points Earned</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>Learning Note</span>
                </>
              )}
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-slate-400 hover:text-slate-700"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1" />
            {showHint ? "Hide Story Clue" : "Need a Hint?"}
          </Button>

          {!isSubmitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedChoiceId === null}
              className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
            >
              <span>{currentIndex === totalQuestions - 1 ? "View Results" : "Next Question"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Hint Block */}
        {showHint && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <span className="font-bold text-slate-800 mr-1">Clue:</span>
            {currentQuestion.hint}
          </div>
        )}
      </div>
    </div>
  );
}
