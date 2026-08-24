"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  ChevronRight,
  CheckCircle2,
  Trash2,
  X,
  FileCheck2,
  Lock,
  Sparkles,
  Layers,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic } from "@/components/badge-graphic";
import { fetchAllLessons, fetchBadgesFromSupabase } from "@/utils/supabase-queries";
import { createClient } from "@/utils/supabase/client";
import type { Lesson, Badge, QuizQuestion, QuestionChoice } from "@/lib/types";

interface QuestionWithChoices extends QuizQuestion {
  choices: QuestionChoice[];
}

export default function TeacherQuizzesPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState<number>(1);
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [viewScope, setViewScope] = useState<"custom_stories" | "custom_finals" | "core_reference">("custom_stories");
  const [questions, setQuestions] = useState<QuestionWithChoices[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Custom Questions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formText, setFormText] = useState("");
  const [formPoints, setFormPoints] = useState(10);
  const [formHint, setFormHint] = useState("");
  const [formExplanation, setFormExplanation] = useState("");
  const [formChoices, setFormChoices] = useState<Array<{ text: string; is_correct: boolean }>>([
    { text: "Option A", is_correct: true },
    { text: "Option B", is_correct: false },
    { text: "Option C", is_correct: false },
    { text: "Option D", is_correct: false },
  ]);

  const loadQuestionsForLesson = async (lessonId: number) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: quiz } = await supabase
        .from("quizzes")
        .select("quiz_id")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (quiz) {
        const { data: qData } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quiz.quiz_id)
          .order("question_id", { ascending: true });

        const qIds = (qData || []).map((q) => q.question_id);
        const { data: cData } = await supabase
          .from("question_choices")
          .select("*")
          .in("question_id", qIds);

        const merged: QuestionWithChoices[] = (qData || []).map((q) => ({
          ...q,
          choices: (cData || []).filter((c) => c.question_id === q.question_id),
        }));

        setQuestions(merged);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      setQuestions([]);
    }
    setLoading(false);
  };

  const loadStageFinalQuestions = async (badgeId: number) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: quiz } = await supabase
        .from("quizzes")
        .select("quiz_id")
        .eq("badge_id", badgeId)
        .eq("quiz_type", "badge_final")
        .maybeSingle();

      if (quiz) {
        const { data: qData } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quiz.quiz_id)
          .order("question_id", { ascending: true });

        const qIds = (qData || []).map((q) => q.question_id);
        const { data: cData } = await supabase
          .from("question_choices")
          .select("*")
          .in("question_id", qIds);

        const merged: QuestionWithChoices[] = (qData || []).map((q) => ({
          ...q,
          choices: (cData || []).filter((c) => c.question_id === q.question_id),
        }));

        setQuestions(merged);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error("Error loading final questions:", err);
      setQuestions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [allLessons, allBadges] = await Promise.all([
        fetchAllLessons(),
        fetchBadgesFromSupabase(),
      ]);
      setLessons(allLessons);
      setBadges(allBadges);

      const customList = allLessons.filter((l) => l.lesson_id > 15);
      if (customList.length > 0) {
        setViewScope("custom_stories");
        setSelectedLessonId(customList[0].lesson_id);
        setSelectedBadgeId(customList[0].badge_id);
        await loadQuestionsForLesson(customList[0].lesson_id);
      } else {
        setViewScope("core_reference");
        if (allLessons.length > 0) {
          setSelectedLessonId(allLessons[0].lesson_id);
          setSelectedBadgeId(allLessons[0].badge_id);
          await loadQuestionsForLesson(allLessons[0].lesson_id);
        }
      }
    }
    init();
  }, []);

  const customLessons = lessons.filter((l) => l.lesson_id > 15);
  const coreLessons = lessons.filter((l) => l.lesson_id <= 15);
  const customBadges = badges.filter((b) => b.badge_id > 5);
  const coreBadges = badges.filter((b) => b.badge_id <= 5);

  const isCoreSelected =
    viewScope === "core_reference" ||
    (viewScope === "custom_finals" && selectedBadgeId <= 5) ||
    (viewScope === "custom_stories" && selectedLessonId <= 15);

  // Group lessons for active badge
  const displayedLessons =
    viewScope === "custom_stories"
      ? customLessons.filter((l) => l.badge_id === selectedBadgeId)
      : coreLessons.filter((l) => l.badge_id === selectedBadgeId);

  const handleSelectBadge = (badgeId: number) => {
    setSelectedBadgeId(badgeId);
    if (viewScope === "custom_finals") {
      loadStageFinalQuestions(badgeId);
      return;
    }

    const stageLessons = (viewScope === "custom_stories" ? customLessons : coreLessons).filter(
      (l) => l.badge_id === badgeId
    );
    if (stageLessons.length > 0) {
      setSelectedLessonId(stageLessons[0].lesson_id);
      loadQuestionsForLesson(stageLessons[0].lesson_id);
    } else {
      setQuestions([]);
    }
  };

  const handleSelectLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId);
    loadQuestionsForLesson(lessonId);
  };

  const handleOpenCreate = () => {
    if (isCoreSelected) {
      alert("Protected Core Curriculum (Default Badges 1-5 and Stories 1-15) cannot be modified.");
      return;
    }
    setEditingQuestionId(null);
    setFormText("");
    setFormPoints(10);
    setFormHint("");
    setFormExplanation("");
    setFormChoices([
      { text: "", is_correct: true },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: QuestionWithChoices) => {
    if (isCoreSelected) {
      alert("Protected Core Curriculum (Default Badges 1-5 and Stories 1-15) cannot be modified.");
      return;
    }
    setEditingQuestionId(q.question_id);
    setFormText(q.question_text);
    setFormPoints(q.points || 10);
    setFormHint(q.hint || "");
    setFormExplanation(q.explanation || "");

    if (q.choices && q.choices.length > 0) {
      setFormChoices(
        q.choices.map((c) => ({
          text: c.choice_text,
          is_correct: c.is_correct,
        }))
      );
    } else {
      setFormChoices([
        { text: "Option A", is_correct: true },
        { text: "Option B", is_correct: false },
      ]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (questionId: number) => {
    if (isCoreSelected) {
      alert("Protected Core Curriculum (Default Badges 1-5 and Stories 1-15) cannot be deleted.");
      return;
    }
    if (confirm("Delete this question item?")) {
      try {
        const supabase = createClient();
        await supabase.from("quiz_questions").delete().eq("question_id", questionId);
        setQuestions((prev) => prev.filter((q) => q.question_id !== questionId));
      } catch (err) {
        console.error("Error deleting question:", err);
      }
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) return;

    setIsSaving(true);
    try {
      const supabase = createClient();

      if (viewScope === "custom_finals") {
        // Saving question to Stage Final Quiz
        let { data: quiz } = await supabase
          .from("quizzes")
          .select("*")
          .eq("badge_id", selectedBadgeId)
          .eq("quiz_type", "badge_final")
          .maybeSingle();

        if (!quiz) {
          const { data: newQuiz } = await supabase
            .from("quizzes")
            .insert({
              badge_id: selectedBadgeId,
              quiz_type: "badge_final",
              quiz_title: `${selectedBadge?.badge_name || "Stage"} - Final Mastery Quiz`,
              passing_score: selectedBadge?.required_passing_score || 75,
            })
            .select()
            .single();
          quiz = newQuiz;
        }

        if (quiz) {
          if (editingQuestionId) {
            await supabase
              .from("quiz_questions")
              .update({
                question_text: formText.trim(),
                points: Number(formPoints),
                hint: formHint.trim(),
                explanation: formExplanation.trim(),
              })
              .eq("question_id", editingQuestionId);

            await supabase.from("question_choices").delete().eq("question_id", editingQuestionId);
            const choiceRows = formChoices
              .filter((c) => c.text.trim().length > 0)
              .map((c, idx) => ({
                question_id: editingQuestionId,
                choice_letter: String.fromCharCode(65 + idx),
                choice_text: c.text.trim(),
                is_correct: c.is_correct,
              }));
            if (choiceRows.length > 0) {
              await supabase.from("question_choices").insert(choiceRows);
            }
          } else {
            const nextQNum = questions.length + 1;
            const { data: newQ } = await supabase
              .from("quiz_questions")
              .insert({
                quiz_id: quiz.quiz_id,
                question_number: nextQNum,
                question_text: formText.trim(),
                question_type: "multiple_choice",
                points: Number(formPoints),
                hint: formHint.trim(),
                explanation: formExplanation.trim(),
              })
              .select()
              .single();

            if (newQ) {
              const choiceRows = formChoices
                .filter((c) => c.text.trim().length > 0)
                .map((c, idx) => ({
                  question_id: newQ.question_id,
                  choice_letter: String.fromCharCode(65 + idx),
                  choice_text: c.text.trim(),
                  is_correct: c.is_correct,
                }));
              if (choiceRows.length > 0) {
                await supabase.from("question_choices").insert(choiceRows);
              }
            }
          }
          await loadStageFinalQuestions(selectedBadgeId);
        }
      } else {
        // Saving question to Story Quiz
        let { data: quiz } = await supabase
          .from("quizzes")
          .select("*")
          .eq("lesson_id", selectedLessonId)
          .maybeSingle();

        if (!quiz) {
          const targetLesson = lessons.find((l) => l.lesson_id === selectedLessonId);
          const { data: newQuiz } = await supabase
            .from("quizzes")
            .insert({
              lesson_id: selectedLessonId,
              badge_id: targetLesson?.badge_id || 1,
              quiz_type: "lesson",
              quiz_title: `Comprehension: ${targetLesson?.lesson_title || "Lesson"}`,
              passing_score: 70,
            })
            .select()
            .single();
          quiz = newQuiz;
        }

        if (quiz) {
          if (editingQuestionId) {
            await supabase
              .from("quiz_questions")
              .update({
                question_text: formText.trim(),
                points: Number(formPoints),
                hint: formHint.trim(),
                explanation: formExplanation.trim(),
              })
              .eq("question_id", editingQuestionId);

            await supabase.from("question_choices").delete().eq("question_id", editingQuestionId);
            const choiceRows = formChoices
              .filter((c) => c.text.trim().length > 0)
              .map((c, idx) => ({
                question_id: editingQuestionId,
                choice_letter: String.fromCharCode(65 + idx),
                choice_text: c.text.trim(),
                is_correct: c.is_correct,
              }));
            if (choiceRows.length > 0) {
              await supabase.from("question_choices").insert(choiceRows);
            }
          } else {
            const nextQNum = questions.length + 1;
            const { data: newQ } = await supabase
              .from("quiz_questions")
              .insert({
                quiz_id: quiz.quiz_id,
                question_number: nextQNum,
                question_text: formText.trim(),
                question_type: "multiple_choice",
                points: Number(formPoints),
                hint: formHint.trim(),
                explanation: formExplanation.trim(),
              })
              .select()
              .single();

            if (newQ) {
              const choiceRows = formChoices
                .filter((c) => c.text.trim().length > 0)
                .map((c, idx) => ({
                  question_id: newQ.question_id,
                  choice_letter: String.fromCharCode(65 + idx),
                  choice_text: c.text.trim(),
                  is_correct: c.is_correct,
                }));
              if (choiceRows.length > 0) {
                await supabase.from("question_choices").insert(choiceRows);
              }
            }
          }
          await loadQuestionsForLesson(selectedLessonId);
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving question:", err);
    }
    setIsSaving(false);
  };

  const selectedBadge = badges.find((b) => b.badge_id === selectedBadgeId);
  const activeLesson = lessons.find((l) => l.lesson_id === selectedLessonId);

  // Determine if adding a question is valid right now
  const canAddQuestion =
    (viewScope === "custom_stories" && customLessons.length > 0 && selectedLessonId > 15) ||
    (viewScope === "custom_finals" && customBadges.length > 0 && selectedBadgeId > 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── 1. Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/teacher" className="hover:text-slate-600">
              Teacher Hub
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">Quiz &amp; Question Bank</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Comprehension Question Bank &amp; Assessments
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Protected core developer curriculum (Stages 1–5 locked) + custom teacher question banks.
          </p>
        </div>

        {canAddQuestion && (
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>
              {viewScope === "custom_finals"
                ? `Add Question to ${selectedBadge?.badge_name}`
                : `Add Question to ${activeLesson?.lesson_title}`}
            </span>
          </Button>
        )}
      </div>

      {/* ── 2. Clean Category Scope Tabs ──────────────────────────────── */}
      <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl w-full sm:w-auto overflow-x-auto gap-1">
        <button
          type="button"
          onClick={() => {
            setViewScope("custom_stories");
            if (customLessons.length > 0) {
              setSelectedLessonId(customLessons[0].lesson_id);
              setSelectedBadgeId(customLessons[0].badge_id);
              loadQuestionsForLesson(customLessons[0].lesson_id);
            } else {
              setQuestions([]);
            }
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            viewScope === "custom_stories"
              ? "bg-white text-blue-600 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>✨ Custom Stories ({customLessons.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setViewScope("custom_finals");
            if (customBadges.length > 0) {
              setSelectedBadgeId(customBadges[0].badge_id);
              loadStageFinalQuestions(customBadges[0].badge_id);
            } else {
              setQuestions([]);
            }
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            viewScope === "custom_finals"
              ? "bg-white text-purple-600 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-purple-600" />
          <span>⭐ Custom Stage Final Quizzes ({customBadges.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setViewScope("core_reference");
            if (coreLessons.length > 0) {
              setSelectedLessonId(coreLessons[0].lesson_id);
              setSelectedBadgeId(coreLessons[0].badge_id);
              loadQuestionsForLesson(coreLessons[0].lesson_id);
            }
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            viewScope === "core_reference"
              ? "bg-white text-amber-800 shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>🔒 Protected Core Reference (Stages 1–5)</span>
        </button>
      </div>

      {/* ── 3. Clean Stage & Chapter Selector Card ────────────────────── */}
      <div className="dashboard-card p-5 space-y-4 bg-white border-2 border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Select Stage Badge:</span>
            </span>
            <select
              value={selectedBadgeId}
              onChange={(e) => handleSelectBadge(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none cursor-pointer"
            >
              {(viewScope === "custom_finals"
                ? customBadges
                : viewScope === "custom_stories"
                ? customBadges.length > 0
                  ? customBadges
                  : badges
                : coreBadges
              ).map((b) => (
                <option key={b.badge_id} value={b.badge_id}>
                  Stage {b.badge_order}: {b.badge_name} {b.badge_id <= 5 ? "(🔒 Core)" : "(✨ Custom)"}
                </option>
              ))}
            </select>
          </div>

          {selectedBadge && (
            <div className="flex items-center gap-2">
              <BadgeGraphic
                type={selectedBadge.badge_type}
                medalType={selectedBadge.badge_type === "medal" ? selectedBadge.medal_type : undefined}
                size="xs"
                status="completed"
              />
              <span className="text-xs font-black text-slate-800">{selectedBadge.badge_name}</span>
            </div>
          )}
        </div>

        {/* 3 Chapter Story Tabs */}
        {viewScope !== "custom_finals" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Chapter Stories:</span>
            {displayedLessons.length === 0 ? (
              <span className="text-xs font-medium text-slate-400 italic">
                No stories assigned to this stage yet in this view.
              </span>
            ) : (
              displayedLessons.map((l, idx) => {
                const isSelected = l.lesson_id === selectedLessonId;
                return (
                  <button
                    key={l.lesson_id}
                    type="button"
                    onClick={() => handleSelectLesson(l.lesson_id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-black"
                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                    }`}
                  >
                    <span className="opacity-80">Chapter {idx + 1}:</span>
                    <span>{l.lesson_title}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── 4. Questions Display Area ─────────────────────────────────── */}
      {viewScope === "custom_stories" && customLessons.length === 0 ? (
        <div className="dashboard-card p-12 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-blue-400 mx-auto" />
          <div>
            <h3 className="text-base font-black text-slate-800">No Custom Stories Created Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Comprehension questions belong to stories. You must first create a custom story passage in the Curriculum Manager to author questions for it.
            </p>
          </div>
          <Link href="/teacher/lessons">
            <Button size="sm" className="h-9 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Go to Curriculum Manager</span>
            </Button>
          </Link>
        </div>
      ) : viewScope === "custom_finals" && customBadges.length === 0 ? (
        <div className="dashboard-card p-12 text-center space-y-4">
          <Award className="w-10 h-10 text-purple-400 mx-auto" />
          <div>
            <h3 className="text-base font-black text-slate-800">No Custom Stage Badges Created Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Stage final mastery quizzes belong to stage badges. Default Stages 1–5 are protected developer standards. To author a custom final quiz, create a custom stage badge first.
            </p>
          </div>
          <Link href="/teacher/badges">
            <Button size="sm" className="h-9 px-4 rounded-xl bg-purple-600 text-white font-bold text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Go to Badge Mastery Rules</span>
            </Button>
          </Link>
        </div>
      ) : loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading questions from Supabase...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="dashboard-card p-10 text-center space-y-3">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Questions Found</h3>
          <p className="text-xs text-slate-400">
            {canAddQuestion
              ? "Click the button at the top right to add a question to this module."
              : "No questions recorded for this module."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header Banner for Core Mode */}
          {isCoreSelected && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>Protected Core Developer Assessment:</strong> Default curriculum questions and final mastery evaluations cannot be edited or deleted by teachers.
              </span>
            </div>
          )}

          {questions.map((q, idx) => (
            <div key={q.question_id} className="dashboard-card p-6 space-y-4 border-2 border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center border border-blue-200 flex-shrink-0">
                    Q{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                      {q.question_text}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="font-bold text-blue-600">
                        {viewScope === "custom_finals"
                          ? `${selectedBadge?.badge_name} · Stage Final Assessment`
                          : activeLesson?.lesson_title || "Lesson"}
                      </span>
                      <span>·</span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {q.points || 10} Points Weight
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isCoreSelected ? (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                      🔒 Core Protected (Developer Default)
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(q)}
                        aria-label="Edit question"
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(q.question_id)}
                        aria-label="Delete question"
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Choices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {q.choices.map((c, cIdx) => (
                  <div
                    key={c.choice_id || cIdx}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      c.is_correct
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 font-black text-[10px] flex items-center justify-center">
                        {String.fromCharCode(65 + cIdx)}
                      </span>
                      <span>{c.choice_text}</span>
                    </div>
                    {c.is_correct && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Correct Key
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation & Hint */}
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                {q.explanation && (
                  <div>
                    <span className="font-bold text-slate-700">Teacher Explanation: </span>
                    {q.explanation}
                  </div>
                )}
                {q.hint && (
                  <div>
                    <span className="font-bold text-blue-700">Student Hint: </span>
                    {q.hint}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. Question Create / Edit Modal ───────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 anim-pop-bounce my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {editingQuestionId ? "Modify Question Item" : "New Question Item"}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {editingQuestionId
                    ? "Edit Question"
                    : viewScope === "custom_finals"
                    ? `Add Question to ${selectedBadge?.badge_name}`
                    : `Add Question to ${activeLesson?.lesson_title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Question Prompt *</label>
                <textarea
                  rows={2}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="What was the main challenge in the story?"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Choices A, B, C, D */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Choices (Select radio for correct answer key):
                </label>
                <div className="space-y-2">
                  {formChoices.map((c, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        c.is_correct ? "bg-emerald-50/80 border-emerald-300" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="correct_choice"
                        checked={c.is_correct}
                        onChange={() => {
                          setFormChoices((prev) =>
                            prev.map((item, i) => ({ ...item, is_correct: i === idx }))
                          );
                        }}
                      />
                      <span className="text-xs font-black text-slate-700 w-4">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        value={c.text}
                        onChange={(e) => {
                          const updated = [...formChoices];
                          updated[idx].text = e.target.value;
                          setFormChoices(updated);
                        }}
                        placeholder={`Choice ${String.fromCharCode(65 + idx)}`}
                        required
                        className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Teacher Explanation</label>
                  <input
                    type="text"
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Feedback shown after completion..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Student Hint</label>
                  <input
                    type="text"
                    value={formHint}
                    onChange={(e) => setFormHint(e.target.value)}
                    placeholder="Helpful clue for pupils..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  size="sm"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {isSaving ? "Saving..." : "Save Question Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
