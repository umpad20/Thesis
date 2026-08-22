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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAllLessons } from "@/utils/supabase-queries";
import { createClient } from "@/utils/supabase/client";
import type { Lesson, QuizQuestion, QuestionChoice } from "@/lib/types";

interface QuestionWithChoices extends QuizQuestion {
  choices: QuestionChoice[];
}

export default function TeacherQuizzesPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [questions, setQuestions] = useState<QuestionWithChoices[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formText, setFormText] = useState("");
  const [formPoints, setFormPoints] = useState(10);
  const [formHint, setFormHint] = useState("");
  const [formExplanation, setFormExplanation] = useState("");
  const [formLessonId, setFormLessonId] = useState<number>(1);
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
      // 1. Get quiz for lesson
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

  useEffect(() => {
    async function init() {
      const allLessons = await fetchAllLessons();
      setLessons(allLessons);
      if (allLessons.length > 0) {
        setSelectedLessonId(allLessons[0].lesson_id);
        setFormLessonId(allLessons[0].lesson_id);
        await loadQuestionsForLesson(allLessons[0].lesson_id);
      }
    }
    init();
  }, []);

  const handleSelectLessonTab = (lessonId: number) => {
    setSelectedLessonId(lessonId);
    setFormLessonId(lessonId);
    loadQuestionsForLesson(lessonId);
  };

  const handleOpenCreate = () => {
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
    if (confirm("Delete this question item from Supabase?")) {
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

      // Ensure quiz exists for lesson
      let { data: quiz } = await supabase
        .from("quizzes")
        .select("*")
        .eq("lesson_id", formLessonId)
        .maybeSingle();

      if (!quiz) {
        const targetLesson = lessons.find((l) => l.lesson_id === formLessonId);
        const { data: newQuiz } = await supabase
          .from("quizzes")
          .insert({
            lesson_id: formLessonId,
            badge_id: targetLesson?.badge_id || 1,
            quiz_type: "lesson_evaluation",
            quiz_title: `Comprehension: ${targetLesson?.lesson_title || "Lesson"}`,
            passing_score: 70,
          })
          .select()
          .single();
        quiz = newQuiz;
      }

      if (!quiz) {
        alert("Failed to find or create quiz for this lesson.");
        setIsSaving(false);
        return;
      }

      if (editingQuestionId) {
        // Update question in Supabase
        await supabase
          .from("quiz_questions")
          .update({
            question_text: formText.trim(),
            points: Number(formPoints),
            hint: formHint.trim(),
            explanation: formExplanation.trim(),
          })
          .eq("question_id", editingQuestionId);

        // Delete old choices and insert new
        await supabase.from("question_choices").delete().eq("question_id", editingQuestionId);

        const choiceRows = formChoices
          .filter((c) => c.text.trim())
          .map((c) => ({
            question_id: editingQuestionId,
            choice_text: c.text.trim(),
            is_correct: c.is_correct,
          }));

        if (choiceRows.length > 0) {
          await supabase.from("question_choices").insert(choiceRows);
        }
      } else {
        // Insert new question in Supabase
        const { data: newQ, error: qErr } = await supabase
          .from("quiz_questions")
          .insert({
            quiz_id: quiz.quiz_id,
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
            .filter((c) => c.text.trim())
            .map((c) => ({
              question_id: newQ.question_id,
              choice_text: c.text.trim(),
              is_correct: c.is_correct,
            }));

          if (choiceRows.length > 0) {
            await supabase.from("question_choices").insert(choiceRows);
          }
        }
      }

      await loadQuestionsForLesson(formLessonId);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving question:", err);
    }
    setIsSaving(false);
  };

  const handleSetCorrectChoice = (index: number) => {
    setFormChoices((prev) =>
      prev.map((c, i) => ({
        ...c,
        is_correct: i === index,
      }))
    );
  };

  const activeLesson = lessons.find((l) => l.lesson_id === selectedLessonId);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/teacher" className="hover:text-slate-600">
              Teacher Hub
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">Quiz &amp; Questions</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Comprehension Question Bank &amp; Assessments
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure multiple-choice questions, answer keys, point weights, and student hints stored directly in Supabase.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Question Item</span>
        </Button>
      </div>

      {/* 2. Lesson Selection Filter Bar */}
      <div className="dashboard-card p-3.5 bg-slate-50 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <FileCheck2 className="w-4 h-4 text-blue-600" />
          <span>Select Story Lesson:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lessons.map((l) => {
            const isCurrent = l.lesson_id === selectedLessonId;
            return (
              <button
                key={l.lesson_id}
                type="button"
                onClick={() => handleSelectLessonTab(l.lesson_id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {l.lesson_title}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Questions List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading questions from Supabase...</div>
      ) : questions.length === 0 ? (
        <div className="dashboard-card p-8 text-center space-y-3">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Questions Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            This lesson has no questions in Supabase yet. Click &quot;New Question Item&quot; to author one!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.question_id} className="dashboard-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200 flex-shrink-0">
                    Q{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {q.question_text}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-blue-600">
                        {activeLesson?.lesson_title || "Lesson"}
                      </span>
                      <span>·</span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {q.points || 10} Points Weight
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(q)}
                    aria-label="Edit question"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.question_id)}
                    aria-label="Delete question"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Choices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.choices.map((c, cIdx) => (
                  <div
                    key={c.choice_id || cIdx}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      c.is_correct
                        ? "bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold"
                        : "bg-slate-50/70 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                        {String.fromCharCode(65 + cIdx)}
                      </span>
                      <span>{c.choice_text}</span>
                    </div>
                    {c.is_correct && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
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
                    <span className="font-bold text-slate-700">Explanation: </span>
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

      {/* 4. Question Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingQuestionId ? "Edit Quiz Question" : "Add New Question Item"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Associated Story Lesson
                </label>
                <select
                  value={formLessonId}
                  onChange={(e) => setFormLessonId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                >
                  {lessons.map((l) => (
                    <option key={l.lesson_id} value={l.lesson_id}>
                      {l.lesson_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Question Prompt Text *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="e.g. Where does Maya perch before taking her morning flight?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Point Weight
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={formPoints}
                  onChange={(e) => setFormPoints(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none"
                />
              </div>

              {/* Choices Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 text-xs block">
                  Multiple Choice Options (Select radio for correct answer key)
                </span>
                {formChoices.map((choice, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={choice.is_correct}
                      onChange={() => handleSetCorrectChoice(cIdx)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="w-5 text-center font-bold text-slate-500">
                      {String.fromCharCode(65 + cIdx)}.
                    </span>
                    <input
                      type="text"
                      required
                      value={choice.text}
                      onChange={(e) => {
                        const updated = [...formChoices];
                        updated[cIdx].text = e.target.value;
                        setFormChoices(updated);
                      }}
                      placeholder={`Choice text for ${String.fromCharCode(65 + cIdx)}`}
                      className={`flex-1 bg-white border rounded-xl px-3 py-1.5 text-xs outline-none ${
                        choice.is_correct
                          ? "border-emerald-400 bg-emerald-50/30 font-semibold"
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hint for Students
                </label>
                <input
                  type="text"
                  value={formHint}
                  onChange={(e) => setFormHint(e.target.value)}
                  placeholder="e.g. Look at page 1 of the story!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Answer Explanation
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Explanation shown after student submits answer..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {isSaving ? "Saving to Supabase..." : "Save Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
