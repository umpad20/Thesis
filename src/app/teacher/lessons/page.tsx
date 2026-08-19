"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Volume2,
  ChevronRight,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockLessons } from "@/lib/mock-data";

export default function TeacherLessonsPage() {
  const [lessons, setLessons] = useState(mockLessons);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [stage, setStage] = useState(2);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const newLesson = {
      lesson_id: lessons.length + 1,
      badge_id: stage,
      teacher_id: 1,
      lesson_title: title,
      lesson_description: desc || "Grade 3 supplementary reading material.",
      lesson_order: lessons.length + 1,
      difficulty_level: "easy" as const,
      passing_score: 70,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLessons([...lessons, newLesson]);
    setShowModal(false);
    setTitle("");
    setDesc("");
  };

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
            <span className="text-slate-900 font-bold">Curriculum Manager</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Reading Passages & Stories
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage Grade 3 reading stories, multimedia voiceover narrations, and vocabulary lists.
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          size="sm"
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Story</span>
        </Button>
      </div>

      {/* 2. Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((lesson) => (
          <div key={lesson.lesson_id} className="dashboard-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {lesson.lesson_order.toString().padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {lesson.lesson_title}
                  </h3>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Badge Stage {lesson.badge_id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Edit story"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2">
              {lesson.lesson_description}
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> 3 Pages
              </span>
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" /> Audio Narration Configured
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> 4 Mins
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Modal / Dialog for New Story */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Create New Reading Story
            </h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Story Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Brave Little Bird"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Associated Badge Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none"
                >
                  <option value={1}>Stage 1: Cold Badge</option>
                  <option value={2}>Stage 2: Fire Badge</option>
                  <option value={3}>Stage 3: Water Badge</option>
                  <option value={4}>Stage 4: Nature Badge</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Story Synopsis / Context
                </label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Brief synopsis of the moral and comprehension target..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Save Story Passage
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
