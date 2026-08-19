"use client";

import Link from "next/link";
import {
  Plus,
  Edit,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockQuizQuestions, mockQuestionChoices } from "@/lib/mock-data";

export default function TeacherQuizzesPage() {
  const questions = mockQuizQuestions;

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
            <span className="text-slate-900 font-bold">Quiz & Questions</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Comprehension Question Bank
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure multiple-choice questions, correct answer keys, and adaptive hints.
          </p>
        </div>

        <Button
          size="sm"
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Question Item</span>
        </Button>
      </div>

      {/* 2. Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const choices = mockQuestionChoices[q.question_id] || [];

          return (
            <div key={q.question_id} className="dashboard-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200">
                    Q{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {q.question_text}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Associated with Lesson 3 · {q.points} Points Weight
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Edit question"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {choices.map((c) => (
                  <div
                    key={c.choice_id}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      c.is_correct
                        ? "bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold"
                        : "bg-slate-50/70 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span>{c.choice_text}</span>
                    {c.is_correct && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        Correct Key
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Hint & Explanation */}
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div>
                  <span className="font-bold text-slate-700">Explanation: </span>
                  {q.explanation}
                </div>
                <div>
                  <span className="font-bold text-blue-700">Student Hint: </span>
                  {q.hint}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
