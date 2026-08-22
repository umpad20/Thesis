"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Volume2,
  ChevronRight,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  X,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic } from "@/components/badge-graphic";
import {
  fetchAllLessons,
  fetchBadgesFromSupabase,
  fetchLessonDetails,
} from "@/utils/supabase-queries";
import {
  fetchTeacherSectionsFromSupabase,
  getCurrentUser,
} from "@/utils/auth-helpers";
import type { Lesson, Badge, LessonPage, VocabularyWord } from "@/lib/types";

export default function TeacherLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [filterBadgeId, setFilterBadgeId] = useState<string>("all");
  const [filterSection, setFilterSection] = useState<string>("all");
  const [sections, setSections] = useState<string[]>(["Grade 3-A"]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formBadgeId, setFormBadgeId] = useState<number>(1);
  const [formDifficulty, setFormDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [formPassingScore, setFormPassingScore] = useState<number>(70);
  const [formStatus, setFormStatus] = useState<"published" | "draft">("published");
  const [formTargetSection, setFormTargetSection] = useState<string>("all");

  // Pages & Vocabulary in current editing session
  const [formPages, setFormPages] = useState<
    Array<{ page_number: number; page_title: string; content: string; image_url: string; audio_url: string }>
  >([
    {
      page_number: 1,
      page_title: "Page 1: Introduction",
      content: "Once upon a time in a peaceful village near the green mountains...",
      image_url: "/images/story1.png",
      audio_url: "",
    },
  ]);

  const [formVocab, setFormVocab] = useState<
    Array<{ word: string; definition: string; example_sentence: string }>
  >([
    {
      word: "Harvest",
      definition: "The time when crops are gathered.",
      example_sentence: "The farmers celebrate the golden harvest.",
    },
  ]);

  // Preview Modal State
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [previewPages, setPreviewPages] = useState<LessonPage[]>([]);
  const [previewVocab, setPreviewVocab] = useState<VocabularyWord[]>([]);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [liveLessons, liveBadges, liveSections] = await Promise.all([
        fetchAllLessons(),
        fetchBadgesFromSupabase(),
        fetchTeacherSectionsFromSupabase(),
      ]);

      setLessons(liveLessons);
      setBadges(liveBadges);
      if (Array.isArray(liveSections) && liveSections.length > 0) {
        setSections(liveSections);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const safeSections = Array.isArray(sections) && sections.length > 0 ? sections : ["Grade 3-A"];

  // Lesson counts per badge (max 3 allowed)
  const lessonCounts: Record<number, number> = {};
  for (const l of lessons) {
    if (l.badge_id) {
      lessonCounts[l.badge_id] = (lessonCounts[l.badge_id] || 0) + 1;
    }
  }

  // Grouped Badges for selector
  const starBadges = badges.filter((b) => b.badge_type === "star");
  const ribbonBadges = badges.filter((b) => b.badge_type === "ribbon");
  const medalBadges = badges.filter((b) => b.badge_type === "medal");

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    const matchesStatus = filterStatus === "all" || lesson.status === filterStatus;
    const matchesBadge = filterBadgeId === "all" || lesson.badge_id === Number(filterBadgeId);
    const matchesSection =
      filterSection === "all" ||
      lesson.target_section === "all" ||
      lesson.target_section === filterSection;
    return matchesStatus && matchesBadge && matchesSection;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingLessonId(null);
    setFormTitle("");
    setFormDesc("");
    // Find first badge with capacity (< 3 lessons)
    const availableBadge = badges.find((b) => (lessonCounts[b.badge_id] || 0) < 3);
    setFormBadgeId(availableBadge?.badge_id || 1);
    setFormDifficulty("easy");
    setFormPassingScore(70);
    setFormStatus("published");
    setFormTargetSection("all");
    setFormPages([
      {
        page_number: 1,
        page_title: "Page 1: Introduction",
        content: "Once upon a time...",
        image_url: "/images/story1.png",
        audio_url: "",
      },
    ]);
    setFormVocab([
      {
        word: "Harvest",
        definition: "The time when crops are gathered.",
        example_sentence: "The farmers celebrate the golden harvest.",
      },
    ]);
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (lesson: Lesson) => {
    setEditingLessonId(lesson.lesson_id);
    setFormTitle(lesson.lesson_title);
    setFormDesc(lesson.lesson_description);
    setFormBadgeId(lesson.badge_id);
    setFormDifficulty(lesson.difficulty_level as "easy" | "medium" | "hard");
    setFormPassingScore(lesson.passing_score);
    setFormStatus(lesson.status);
    setFormTargetSection(lesson.target_section || "all");

    const details = await fetchLessonDetails(lesson.lesson_id);
    if (details.pages.length > 0) {
      setFormPages(
        details.pages.map((p) => ({
          page_number: p.page_number,
          page_title: p.page_title,
          content: p.content,
          image_url: p.image_url || "",
          audio_url: p.audio_url || "",
        }))
      );
    } else {
      setFormPages([
        {
          page_number: 1,
          page_title: "Page 1: Introduction",
          content: "Once upon a time in a peaceful village near the green mountains...",
          image_url: "/images/story1.png",
          audio_url: "",
        },
      ]);
    }

    if (details.vocabulary.length > 0) {
      setFormVocab(
        details.vocabulary.map((v) => ({
          word: v.word,
          definition: v.definition,
          example_sentence: v.example_sentence,
        }))
      );
    } else {
      setFormVocab([]);
    }

    setIsEditModalOpen(true);
  };

  // Toggle Publish / Unpublish directly in Supabase
  const handleTogglePublish = async (lesson: Lesson) => {
    const nextStatus = lesson.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/lessons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: lesson.lesson_id,
          lesson_title: lesson.lesson_title,
          lesson_description: lesson.lesson_description,
          badge_id: lesson.badge_id,
          difficulty_level: lesson.difficulty_level,
          passing_score: lesson.passing_score,
          status: nextStatus,
          target_section: lesson.target_section,
        }),
      });

      if (res.ok) {
        setLessons((prev) =>
          prev.map((l) =>
            l.lesson_id === lesson.lesson_id ? { ...l, status: nextStatus } : l
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
    }
  };

  // Delete Lesson in Supabase
  const handleDeleteLesson = async (lessonId: number) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      try {
        const res = await fetch(`/api/lessons?lessonId=${lessonId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setLessons((prev) => prev.filter((l) => l.lesson_id !== lessonId));
        }
      } catch (err) {
        console.error("Failed to delete lesson:", err);
      }
    }
  };

  // Save (Create or Update) in Supabase
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    // Enforce max 3 lessons per badge
    const currentAssignedCount = lessons.filter(
      (l) => l.badge_id === formBadgeId && (!editingLessonId || l.lesson_id !== editingLessonId)
    ).length;

    if (currentAssignedCount >= 3) {
      alert(
        "This badge already has the maximum of 3 lessons assigned. Please choose another badge or create a new badge."
      );
      return;
    }

    setIsSubmitting(true);
    const teacher = getCurrentUser();

    try {
      if (editingLessonId) {
        // Update
        const res = await fetch("/api/lessons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_id: editingLessonId,
            lesson_title: formTitle.trim(),
            lesson_description: formDesc.trim() || "Grade 3 supplementary reading story.",
            badge_id: formBadgeId,
            difficulty_level: formDifficulty,
            passing_score: formPassingScore,
            status: formStatus,
            target_section: formTargetSection,
          }),
        });

        if (res.ok) {
          const fresh = await fetchAllLessons();
          setLessons(fresh);
          setIsEditModalOpen(false);
        } else {
          const data = await res.json();
          alert(data.error || "Failed to update lesson.");
        }
      } else {
        // Create new
        const res = await fetch("/api/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_title: formTitle.trim(),
            lesson_description: formDesc.trim() || "Grade 3 supplementary reading story.",
            badge_id: formBadgeId,
            difficulty_level: formDifficulty,
            passing_score: formPassingScore,
            status: formStatus,
            target_section: formTargetSection,
            teacher_id: teacher?.id || null,
            pages: formPages,
            vocabulary: formVocab,
          }),
        });

        if (res.ok) {
          const fresh = await fetchAllLessons();
          setLessons(fresh);
          setIsEditModalOpen(false);
        } else {
          const data = await res.json();
          alert(data.error || "Failed to create lesson.");
        }
      }
    } catch (err) {
      console.error("Save lesson failed:", err);
    }

    setIsSubmitting(false);
    setIsEditModalOpen(false);
  };

  // Open Preview Modal
  const handleOpenPreview = async (lesson: Lesson) => {
    setPreviewLesson(lesson);
    setPreviewPageIndex(0);
    setIsPlayingAudio(false);

    const details = await fetchLessonDetails(lesson.lesson_id);
    setPreviewPages(details.pages);
    setPreviewVocab(details.vocabulary);
  };

  // Page management in form
  const handleAddPage = () => {
    setFormPages([
      ...formPages,
      {
        page_number: formPages.length + 1,
        page_title: `Page ${formPages.length + 1}`,
        content: "",
        image_url: "/images/story1.png",
        audio_url: "",
      },
    ]);
  };

  const handleRemovePage = (index: number) => {
    if (formPages.length <= 1) return;
    setFormPages(
      formPages
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, page_number: i + 1 }))
    );
  };

  // Vocabulary management in form
  const handleAddVocab = () => {
    setFormVocab([
      ...formVocab,
      { word: "", definition: "", example_sentence: "" },
    ]);
  };

  const handleRemoveVocab = (index: number) => {
    setFormVocab(formVocab.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
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
            Reading Passages &amp; Story Curriculum
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Author reading passages, assign to specific class sections, and manage live database visibility.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Story</span>
        </Button>
      </div>

      {/* 2. Filters & Status Controls */}
      <div className="dashboard-card p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-bold w-fit">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All Lessons ({lessons.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("published")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === "published"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Published ({lessons.filter((l) => l.status === "published").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("draft")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === "draft"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Drafts ({lessons.filter((l) => l.status === "draft").length})
          </button>
        </div>

        {/* Section & Badge Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Section:
            </span>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="all">All Sections (Core + Custom)</option>
              {safeSections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Badge Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Badge:
            </span>
            <select
              value={filterBadgeId}
              onChange={(e) => setFilterBadgeId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="all">All Badges</option>
              <optgroup label="Star Badges">
                {starBadges.map((b) => (
                  <option key={b.badge_id} value={b.badge_id}>
                    ⭐ {b.badge_name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Ribbon Badges">
                {ribbonBadges.map((b) => (
                  <option key={b.badge_id} value={b.badge_id}>
                    🎗️ {b.badge_name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Medal Badges">
                {medalBadges.map((b) => (
                  <option key={b.badge_id} value={b.badge_id}>
                    🏅 {b.badge_name} ({b.medal_type})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Story Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading curriculum lessons...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson) => {
            const badge = badges.find((b) => b.badge_id === lesson.badge_id);
            const isPublished = lesson.status === "published";
            const isCore = !lesson.target_section || lesson.target_section === "all";

            return (
              <div
                key={lesson.lesson_id}
                className={`dashboard-card p-5 space-y-4 transition-all ${
                  !isPublished ? "border-dashed border-amber-300 bg-amber-50/10" : ""
                }`}
              >
                {/* Top Row: Badge Header & Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {badge && (
                      <BadgeGraphic
                        type={badge.badge_type}
                        medalType={badge.medal_type}
                        size="sm"
                        status="completed"
                      />
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {lesson.lesson_title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            badge?.badge_type === "star"
                              ? "bg-amber-100 text-amber-800"
                              : badge?.badge_type === "ribbon"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {badge?.badge_name || `Badge #${lesson.badge_id}`}
                        </span>

                        {/* Target Section Scope Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCore
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {isCore ? "🌐 Core (All Sections)" : `🏫 ${lesson.target_section} Only`}
                        </span>

                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertCircle className="w-3 h-3" /> Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit & Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(lesson)}
                      aria-label="Preview story"
                      title="Student View Preview"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(lesson)}
                      aria-label="Edit story"
                      title="Edit Lesson"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(lesson.lesson_id)}
                      aria-label="Delete story"
                      title="Delete Lesson"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {lesson.lesson_description}
                </p>

                {/* Metadata & Quick Publish Toggle */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pages Enabled</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Audio Narration</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      Pass: ≥{lesson.passing_score}%
                    </span>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant={isPublished ? "outline" : "default"}
                    onClick={() => handleTogglePublish(lesson)}
                    className={`h-7 px-2.5 text-[10px] font-bold rounded-lg ${
                      isPublished
                        ? "border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    }`}
                  >
                    {isPublished ? "Unpublish" : "Publish Now"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Create / Edit Lesson Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingLessonId ? "Edit Reading Passage & Content" : "Create New Reading Story"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure story pages, target sections, multimedia voiceovers, and badge assignments in Supabase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
              {/* General Information */}
              <div className="space-y-3">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  1. Story Metadata &amp; Target Section
                </span>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Story Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. The Kind Farmer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Target Section Selector */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Target Class Section *
                    </label>
                    <select
                      value={formTargetSection}
                      onChange={(e) => setFormTargetSection(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="all">🌐 All Sections (Core Developer Curriculum)</option>
                      {safeSections.map((sec) => (
                        <option key={sec} value={sec}>
                          🏫 {sec} only (Section-exclusive)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assigned Badge */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Assigned Badge Mastery *
                    </label>
                    <select
                      value={formBadgeId}
                      onChange={(e) => setFormBadgeId(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                    >
                      <optgroup label="Star Badges (1st Tier)">
                        {starBadges.map((b) => {
                          const currentAssigned =
                            (lessonCounts[b.badge_id] || 0) -
                            (editingLessonId && lessons.find((l) => l.lesson_id === editingLessonId)?.badge_id === b.badge_id ? 1 : 0);
                          const isFull = currentAssigned >= 3;
                          return (
                            <option key={b.badge_id} value={b.badge_id} disabled={isFull}>
                              ⭐ {b.badge_name} ({currentAssigned}/3 Lessons{isFull ? " - FULL" : ""})
                            </option>
                          );
                        })}
                      </optgroup>
                      <optgroup label="Ribbon Badges (2nd Tier)">
                        {ribbonBadges.map((b) => {
                          const currentAssigned =
                            (lessonCounts[b.badge_id] || 0) -
                            (editingLessonId && lessons.find((l) => l.lesson_id === editingLessonId)?.badge_id === b.badge_id ? 1 : 0);
                          const isFull = currentAssigned >= 3;
                          return (
                            <option key={b.badge_id} value={b.badge_id} disabled={isFull}>
                              🎗️ {b.badge_name} ({currentAssigned}/3 Lessons{isFull ? " - FULL" : ""})
                            </option>
                          );
                        })}
                      </optgroup>
                      <optgroup label="Medal Badges (3rd Bronze, 4th Silver, 5th Gold)">
                        {medalBadges.map((b) => {
                          const currentAssigned =
                            (lessonCounts[b.badge_id] || 0) -
                            (editingLessonId && lessons.find((l) => l.lesson_id === editingLessonId)?.badge_id === b.badge_id ? 1 : 0);
                          const isFull = currentAssigned >= 3;
                          return (
                            <option key={b.badge_id} value={b.badge_id} disabled={isFull}>
                              🏅 {b.badge_name} ({b.medal_type}) ({currentAssigned}/3 Lessons{isFull ? " - FULL" : ""})
                            </option>
                          );
                        })}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as "easy" | "medium" | "hard")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                    >
                      <option value="easy">Easy (Grade 3 Early)</option>
                      <option value="medium">Medium (Grade 3 Standard)</option>
                      <option value="hard">Hard (Advanced Reader)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={100}
                      required
                      value={formPassingScore}
                      onChange={(e) => setFormPassingScore(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Story Synopsis</label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Brief synopsis of story and learning objective..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Publishing Status</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="radio"
                        name="status"
                        checked={formStatus === "published"}
                        onChange={() => setFormStatus("published")}
                        className="text-blue-600"
                      />
                      <span>Published (Visible to Enrolled Students)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-700">
                      <input
                        type="radio"
                        name="status"
                        checked={formStatus === "draft"}
                        onChange={() => setFormStatus("draft")}
                        className="text-amber-600"
                      />
                      <span>Draft (Hidden from Students)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Story Pages Manager */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    2. Story Pages &amp; Content ({formPages.length} Pages)
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddPage}
                    className="h-7 px-2.5 text-xs text-blue-600 font-bold border-blue-200 bg-blue-50/50"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Page
                  </Button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {formPages.map((page, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">
                          Page {page.page_number}
                        </span>
                        {formPages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePage(idx)}
                            className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={page.page_title}
                        onChange={(e) => {
                          const updated = [...formPages];
                          updated[idx].page_title = e.target.value;
                          setFormPages(updated);
                        }}
                        placeholder="Page subtitle..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none"
                      />

                      <textarea
                        rows={3}
                        value={page.content}
                        onChange={(e) => {
                          const updated = [...formPages];
                          updated[idx].content = e.target.value;
                          setFormPages(updated);
                        }}
                        placeholder="Enter story text for this page..."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Vocabulary Words Manager */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    3. Key Vocabulary Glossary ({formVocab.length} Words)
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddVocab}
                    className="h-7 px-2.5 text-xs text-blue-600 font-bold border-blue-200 bg-blue-50/50"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Word
                  </Button>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {formVocab.map((vocab, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="Vocabulary word"
                          value={vocab.word}
                          onChange={(e) => {
                            const updated = [...formVocab];
                            updated[idx].word = e.target.value;
                            setFormVocab(updated);
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold outline-none flex-1 mr-2"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVocab(idx)}
                          className="text-slate-400 hover:text-rose-600 text-[11px]"
                        >
                          Remove
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Contextual definition..."
                        value={vocab.definition}
                        onChange={(e) => {
                          const updated = [...formVocab];
                          updated[idx].definition = e.target.value;
                          setFormVocab(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {isSubmitting ? "Saving to Supabase..." : editingLessonId ? "Save Changes" : "Create Story Passage"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Interactive Lesson Preview Modal (Student View) */}
      {previewLesson && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded">
                  Teacher Preview Mode
                </span>
                <h3 className="text-sm font-bold text-white">
                  {previewLesson.lesson_title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Story Viewer Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Page {previewPageIndex + 1} of {Math.max(previewPages.length, 1)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {previewPages[previewPageIndex]?.page_title || "Passage View"}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={`h-8 px-3 rounded-lg text-xs font-bold ${
                    isPlayingAudio ? "bg-blue-50 text-blue-600 border-blue-200" : ""
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 mr-1.5 text-blue-600 animate-pulse" /> Stop Narration
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 mr-1.5 text-slate-600" /> Test Audio
                    </>
                  )}
                </Button>
              </div>

              {/* Story Illustration Image Banner */}
              {previewPages[previewPageIndex]?.image_url && (
                <div className="relative w-full h-44 sm:h-56 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                  <img
                    src={previewPages[previewPageIndex]?.image_url}
                    alt="Story Illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Story Content */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 leading-relaxed text-sm text-slate-800 font-medium whitespace-pre-line">
                {previewPages[previewPageIndex]?.content || previewLesson.lesson_description}
              </div>

              {/* Vocabulary Preview */}
              {previewVocab.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                    <span>Vocabulary for this Lesson:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {previewVocab.map((w) => (
                      <div key={w.word_id} className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block">{w.word}</span>
                        <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                          {w.definition}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={previewPageIndex === 0}
                onClick={() => setPreviewPageIndex((p) => Math.max(0, p - 1))}
                className="text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Previous
              </Button>
              <Button
                size="sm"
                disabled={previewPageIndex >= previewPages.length - 1}
                onClick={() => setPreviewPageIndex((p) => Math.min(previewPages.length - 1, p + 1))}
                className="bg-blue-600 text-white text-xs font-bold"
              >
                Next <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
