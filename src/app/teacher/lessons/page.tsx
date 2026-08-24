"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Volume2,
  ChevronRight,
  Eye,
  Trash2,
  ArrowLeft,
  ArrowRight,
  X,
  Lock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic } from "@/components/badge-graphic";
import {
  fetchAllLessons,
  fetchBadgesFromSupabase,
  fetchLessonDetails,
  fetchBadgeLessonCounts,
} from "@/utils/supabase-queries";
import {
  fetchTeacherSectionsFromSupabase,
  getCurrentUser,
} from "@/utils/auth-helpers";
import { soundEffects } from "@/utils/sound-effects";
import type { Lesson, Badge, LessonPage, VocabularyWord } from "@/lib/types";

const PRESET_STORY_IMAGES = [
  { label: "Classroom Kindness", url: "/images/story1.png" },
  { label: "Sharing Lunch", url: "/images/story2.png" },
  { label: "Library Friendship", url: "/images/story3.png" },
  { label: "Morning Routine", url: "/images/story4.png" },
  { label: "Nature & Garden", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80" },
  { label: "Cozy Books", url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80" },
  { label: "Starry Night", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80" },
  { label: "School Pathway", url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80" },
];

interface FormPageItem {
  page_number: number;
  page_title: string;
  content: string;
  image_url: string;
  audio_url: string;
}

interface FormVocabItem {
  word: string;
  part_of_speech: "noun" | "verb" | "adjective" | "adverb";
  phonetic: string;
  definition: string;
  example_sentence: string;
  synonyms: string;
  antonyms: string;
}

interface FormQuizQuestion {
  question_text: string;
  explanation: string;
  hint: string;
  points: number;
  choices: Array<{ choice_letter: string; choice_text: string; is_correct: boolean }>;
}

export default function TeacherLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeLessonCounts, setBadgeLessonCounts] = useState<Record<number, number>>({});
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [filterBadgeId, setFilterBadgeId] = useState<string>("all");
  const [filterSection, setFilterSection] = useState<string>("all");
  const [sections, setSections] = useState<string[]>(["Grade 3-A"]);
  const [loading, setLoading] = useState(true);

  // Authoring Studio Modal State
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields - Step 1: Story Details
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formBadgeId, setFormBadgeId] = useState<number>(1);
  const [formDifficulty, setFormDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [formPassingScore, setFormPassingScore] = useState<number>(70);
  const [formXpReward, setFormXpReward] = useState<number>(100);
  const [formStatus, setFormStatus] = useState<"published" | "draft">("published");
  const [formTargetSection, setFormTargetSection] = useState<string>("all");

  // Form Fields - Step 2: Storybook Spreads
  const [formPages, setFormPages] = useState<FormPageItem[]>([
    {
      page_number: 1,
      page_title: "Chapter 1: The Beginning",
      content: "Once upon a time in a peaceful garden, the little plants began to sprout with curiosity...",
      image_url: "/images/story1.png",
      audio_url: "",
    },
  ]);
  const [activePageSpreadIndex, setActivePageSpreadIndex] = useState(0);

  // Form Fields - Step 3: Highlighted Vocabulary
  const [formVocab, setFormVocab] = useState<FormVocabItem[]>([
    {
      word: "curiosity",
      part_of_speech: "noun",
      phonetic: "/ˌkjʊr.iˈɑː.sə.t̬i/",
      definition: "A strong desire to know or learn something new.",
      example_sentence: "The little plants grew with curiosity every morning.",
      synonyms: "interest, wonder",
      antonyms: "indifference",
    },
  ]);

  // Form Fields - Step 4: Comprehension Quiz Questions
  const [formQuestions, setFormQuestions] = useState<FormQuizQuestion[]>([
    {
      question_text: "What did the little plants show when growing in the garden?",
      explanation: "The story states that the plants grew with curiosity.",
      hint: "Look closely at the second sentence of Page 1.",
      points: 10,
      choices: [
        { choice_letter: "A", choice_text: "Curiosity and wonder", is_correct: true },
        { choice_letter: "B", choice_text: "Sadness and fear", is_correct: false },
        { choice_letter: "C", choice_text: "Anger", is_correct: false },
        { choice_letter: "D", choice_text: "Sleepiness", is_correct: false },
      ],
    },
  ]);

  // Read-Only Preview Modal State
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [previewPages, setPreviewPages] = useState<LessonPage[]>([]);
  const [previewVocab, setPreviewVocab] = useState<VocabularyWord[]>([]);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      const teacherId = user?.id;

      const [liveLessons, liveBadges, liveCounts, liveSections] = await Promise.all([
        fetchAllLessons(),
        fetchBadgesFromSupabase(),
        fetchBadgeLessonCounts(),
        fetchTeacherSectionsFromSupabase(teacherId),
      ]);

      setLessons(liveLessons);
      setBadges(liveBadges);
      setBadgeLessonCounts(liveCounts);
      if (Array.isArray(liveSections) && liveSections.length > 0) {
        setSections(liveSections);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Open Studio for New Story
  const handleOpenCreate = () => {
    setEditingLessonId(null);
    setCurrentStep(1);
    setFormTitle("");
    setFormDesc("");

    // Pick first available badge that has < 3 lessons
    const availableBadge = badges.find((b) => (badgeLessonCounts[b.badge_id] || 0) < 3);
    setFormBadgeId(availableBadge?.badge_id || 1);

    setFormDifficulty("easy");
    setFormPassingScore(70);
    setFormXpReward(100);
    setFormStatus("published");
    setFormTargetSection("all");

    setFormPages([
      {
        page_number: 1,
        page_title: "Chapter 1: The Beginning",
        content: "Once upon a time in a peaceful garden, the little plants began to sprout with curiosity...",
        image_url: "/images/story1.png",
        audio_url: "",
      },
    ]);
    setActivePageSpreadIndex(0);

    setFormVocab([
      {
        word: "curiosity",
        part_of_speech: "noun",
        phonetic: "/ˌkjʊr.iˈɑː.sə.t̬i/",
        definition: "A strong desire to know or learn something new.",
        example_sentence: "The little plants grew with curiosity every morning.",
        synonyms: "interest, wonder",
        antonyms: "indifference",
      },
    ]);

    setFormQuestions([
      {
        question_text: "What did the little plants show when growing in the garden?",
        explanation: "The story states that the plants grew with curiosity.",
        hint: "Look closely at the second sentence of Page 1.",
        points: 10,
        choices: [
          { choice_letter: "A", choice_text: "Curiosity and wonder", is_correct: true },
          { choice_letter: "B", choice_text: "Sadness and fear", is_correct: false },
          { choice_letter: "C", choice_text: "Anger", is_correct: false },
          { choice_letter: "D", choice_text: "Sleepiness", is_correct: false },
        ],
      },
    ]);

    setIsStudioOpen(true);
  };

  // Open Studio for Custom Lesson Edit
  const handleOpenEdit = async (lesson: Lesson) => {
    if (lesson.lesson_id <= 15) {
      alert("Protected Core Curriculum stories (Lessons 1-15) cannot be modified.");
      return;
    }

    setEditingLessonId(lesson.lesson_id);
    setCurrentStep(1);
    setFormTitle(lesson.lesson_title);
    setFormDesc(lesson.lesson_description);
    setFormBadgeId(lesson.badge_id);
    setFormDifficulty(lesson.difficulty_level as "easy" | "medium" | "hard");
    setFormPassingScore(lesson.passing_score);
    setFormXpReward(100);
    setFormStatus(lesson.status);
    setFormTargetSection(lesson.target_section || "all");

    const details = await fetchLessonDetails(lesson.lesson_id);
    if (details.pages.length > 0) {
      setFormPages(
        details.pages.map((p) => ({
          page_number: p.page_number,
          page_title: p.page_title,
          content: p.content,
          image_url: p.image_url || "/images/story1.png",
          audio_url: p.audio_url || "",
        }))
      );
    } else {
      setFormPages([
        {
          page_number: 1,
          page_title: "Chapter 1",
          content: "Story content...",
          image_url: "/images/story1.png",
          audio_url: "",
        },
      ]);
    }
    setActivePageSpreadIndex(0);

    if (details.vocabulary.length > 0) {
      setFormVocab(
        details.vocabulary.map((v) => ({
          word: v.word,
          part_of_speech: "noun",
          phonetic: `/${v.word}/`,
          definition: v.definition,
          example_sentence: v.example_sentence,
          synonyms: "",
          antonyms: "",
        }))
      );
    }

    setIsStudioOpen(true);
  };

  // Read-Only Preview for Core / Custom Lessons
  const handleOpenPreview = async (lesson: Lesson) => {
    setPreviewLesson(lesson);
    setPreviewPageIndex(0);
    const details = await fetchLessonDetails(lesson.lesson_id);
    setPreviewPages(details.pages);
    setPreviewVocab(details.vocabulary);
  };

  // Submit Studio Data
  const handleSubmitStudio = async () => {
    if (!formTitle.trim()) {
      alert("Please enter a story title.");
      setCurrentStep(1);
      return;
    }

    const currentBadgeLessons = badgeLessonCounts[formBadgeId] || 0;
    if (!editingLessonId && currentBadgeLessons >= 3) {
      alert("This Stage Badge already has the maximum 3 story chapters. Please choose another badge or create a new custom badge.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    const user = getCurrentUser();

    try {
      const payload = {
        lesson_id: editingLessonId || undefined,
        lesson_title: formTitle.trim(),
        lesson_description: formDesc.trim() || "Grade 3 reading comprehension passage.",
        badge_id: formBadgeId,
        difficulty_level: formDifficulty,
        passing_score: formPassingScore,
        status: formStatus,
        target_section: formTargetSection,
        teacher_id: user?.id,
        pages: formPages,
        vocabulary: formVocab,
        quiz_questions: formQuestions,
      };

      const method = editingLessonId ? "PUT" : "POST";
      const res = await fetch("/api/lessons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || "Failed to save story.");
        setIsSubmitting(false);
        return;
      }

      // Refresh list
      const refreshedLessons = await fetchAllLessons();
      const refreshedCounts = await fetchBadgeLessonCounts();
      setLessons(refreshedLessons);
      setBadgeLessonCounts(refreshedCounts);
      setIsStudioOpen(false);
    } catch {
      alert("An unexpected error occurred while saving.");
    }
    setIsSubmitting(false);
  };

  // Delete Custom Lesson
  const handleDeleteCustomLesson = async (lessonId: number) => {
    if (lessonId <= 15) {
      alert("Protected Core Curriculum stories (Lessons 1-15) cannot be deleted.");
      return;
    }

    if (confirm("Are you sure you want to delete this custom story passage?")) {
      try {
        const res = await fetch(`/api/lessons?lessonId=${lessonId}`, { method: "DELETE" });
        if (res.ok) {
          setLessons((prev) => prev.filter((l) => l.lesson_id !== lessonId));
          const refreshedCounts = await fetchBadgeLessonCounts();
          setBadgeLessonCounts(refreshedCounts);
        }
      } catch {
        alert("Failed to delete lesson.");
      }
    }
  };

  // Filter lessons
  const filteredLessons = lessons.filter((l) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (filterBadgeId !== "all" && l.badge_id.toString() !== filterBadgeId) return false;
    if (filterSection !== "all") {
      if (l.target_section && l.target_section !== "all" && l.target_section !== filterSection) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── 1. Header & Add Story Action ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/teacher" className="hover:text-slate-600">
              Teacher Hub
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">Curriculum Manager</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Reading Passages &amp; Story Curriculum
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Protected core developer curriculum (Stages 1–5) + custom teacher stories (max 3 stories per badge).
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Story Passage</span>
        </Button>
      </div>

      {/* ── 2. Filters & Section Selectors ────────────────────────────── */}
      <div className="dashboard-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl w-full md:w-auto overflow-x-auto">
          {(["all", "published", "draft"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                filterStatus === st
                  ? "bg-white text-blue-600 shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st === "all" ? `All Stories (${lessons.length})` : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-400">Section:</span>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Sections</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Badge Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-400">Badge:</span>
            <select
              value={filterBadgeId}
              onChange={(e) => setFilterBadgeId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Badges</option>
              {badges.map((b) => (
                <option key={b.badge_id} value={b.badge_id.toString()}>
                  {b.badge_name} ({badgeLessonCounts[b.badge_id] || 0}/3)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Stories Grid (Protected vs Custom Cards) ───────────────── */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading Curriculum Stories...</p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="dashboard-card p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No stories match your filter</h3>
          <p className="text-xs text-slate-400">Try adjusting your filters or click Add New Story.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => {
            const isCore = lesson.lesson_id <= 15;
            const assignedBadge = badges.find((b) => b.badge_id === lesson.badge_id);

            return (
              <div
                key={lesson.lesson_id}
                className="dashboard-card p-5 dashboard-card-hover flex flex-col justify-between space-y-4 relative border-2 border-slate-100"
              >
                <div>
                  {/* Top Header: Badge Graphic & Protected Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      {assignedBadge && (
                        <BadgeGraphic
                          type={assignedBadge.badge_type}
                          medalType={assignedBadge.badge_type === "medal" ? assignedBadge.medal_type : undefined}
                          size="xs"
                          status="completed"
                        />
                      )}
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 block">
                          {assignedBadge?.badge_name || `Stage ${lesson.badge_id}`}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {lesson.target_section === "all" || !lesson.target_section
                            ? "All Sections"
                            : lesson.target_section}
                        </span>
                      </div>
                    </div>

                    {isCore ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/90 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>Core (Protected)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Custom Story</span>
                      </span>
                    )}
                  </div>

                  {/* Story Title & Description */}
                  <h3 className="text-base font-black text-slate-900 mb-1 leading-snug">
                    {lesson.lesson_title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {lesson.lesson_description}
                  </p>

                  {/* Story Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Pass: ≥{lesson.passing_score}%
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        lesson.difficulty_level === "easy"
                          ? "bg-emerald-50 text-emerald-700"
                          : lesson.difficulty_level === "medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {lesson.difficulty_level}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        lesson.status === "published"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {lesson.status}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPreview(lesson)}
                    className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Preview</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {isCore ? (
                      <span className="text-[10px] font-bold text-slate-400 italic px-2">
                        Developer Locked
                      </span>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(lesson)}
                          className="h-8 w-8 p-0 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Edit Custom Story"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomLesson(lesson.lesson_id)}
                          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Custom Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. ULTRA-DETAILED 4-STEP STORY & VOCABULARY AUTHORING STUDIO ── */}
      {isStudioOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border-2 border-slate-100 anim-pop-bounce my-auto flex flex-col max-h-[92vh]">
            {/* Studio Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {editingLessonId ? "Editing Custom Story" : "Storybook Authoring Studio"}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {editingLessonId ? "Modify Storybook Chapter" : "Author New Story & Vocabulary"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsStudioOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Navigation Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold">
              {[
                { step: 1, label: "1. Story Basics & Rules" },
                { step: 2, label: "2. Storybook Spreads" },
                { step: 3, label: "3. Highlighted Vocabulary" },
                { step: 4, label: "4. Comprehension Quiz" },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step as 1 | 2 | 3 | 4)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    currentStep === s.step
                      ? "bg-blue-600 text-white shadow-xs font-black"
                      : "text-slate-600 hover:bg-white/80"
                  }`}
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Studio Body Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* ── STEP 1: STORY BASICS & SCORING RULES ── */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Story Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. The Brave Little Firefly"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Story Description / Moral</label>
                      <textarea
                        rows={2}
                        placeholder="A brief 1-2 sentence overview of what the story teaches..."
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Badge Assignment (Strict Max 3 rule indicator) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Assigned Stage Badge *</span>
                        <span className="text-[10px] text-blue-600 font-semibold">Max 3 Stories / Badge</span>
                      </label>
                      <select
                        value={formBadgeId}
                        onChange={(e) => setFormBadgeId(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      >
                        {badges.map((b) => {
                          const count = badgeLessonCounts[b.badge_id] || 0;
                          const isFull = count >= 3 && formBadgeId !== b.badge_id;
                          return (
                            <option key={b.badge_id} value={b.badge_id} disabled={isFull}>
                              {b.badge_name} ({count}/3 Stories {isFull ? "- FULL" : ""})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Target Section */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Target Classroom Section</label>
                      <select
                        value={formTargetSection}
                        onChange={(e) => setFormTargetSection(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="all">All Sections (Public)</option>
                        {sections.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Difficulty & Passing Score */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Difficulty Level</label>
                      <select
                        value={formDifficulty}
                        onChange={(e) => setFormDifficulty(e.target.value as "easy" | "medium" | "hard")}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="easy">Easy (Grade 3 Starter)</option>
                        <option value="medium">Medium (Standard)</option>
                        <option value="hard">Hard (Advanced)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Passing Score Threshold (%)</label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={formPassingScore}
                        onChange={(e) => setFormPassingScore(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: 2-PAGE STORYBOOK SPREADS ── */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {formPages.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePageSpreadIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            activePageSpreadIndex === idx
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Spread {idx + 1}
                        </button>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPageNum = formPages.length + 1;
                        setFormPages([
                          ...formPages,
                          {
                            page_number: newPageNum,
                            page_title: `Chapter ${newPageNum}`,
                            content: "Write the next story passage here...",
                            image_url: "/images/story2.png",
                            audio_url: "",
                          },
                        ]);
                        setActivePageSpreadIndex(formPages.length);
                      }}
                      className="h-8 px-3 rounded-xl border-blue-200 text-blue-600 text-xs font-bold hover:bg-blue-50"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>Add Next Page</span>
                    </Button>
                  </div>

                  {/* 2-Page Visual Layout Editor */}
                  {formPages[activePageSpreadIndex] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80">
                      {/* Left Page (Art & Illustration) */}
                      <div className="bg-white p-4 rounded-xl border border-amber-200/60 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          📜 Left Page: Story Illustration Art
                        </span>

                        {/* Image Preview */}
                        <div className="h-44 w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                          <img
                            src={formPages[activePageSpreadIndex].image_url}
                            alt="Story Illustration Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/story1.png";
                            }}
                          />
                        </div>

                        {/* Preset Image Gallery Picker */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Choose from Preset Gallery:
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {PRESET_STORY_IMAGES.map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const updated = [...formPages];
                                  updated[activePageSpreadIndex].image_url = img.url;
                                  setFormPages(updated);
                                }}
                                className="h-10 rounded-lg border border-slate-200 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all relative"
                              >
                                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Or Custom Image URL:
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={formPages[activePageSpreadIndex].image_url}
                            onChange={(e) => {
                              const updated = [...formPages];
                              updated[activePageSpreadIndex].image_url = e.target.value;
                              setFormPages(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                          />
                        </div>
                      </div>

                      {/* Right Page (Story Prose Paragraphs) */}
                      <div className="bg-white p-4 rounded-xl border border-amber-200/60 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            📜 Right Page: Story Prose Content
                          </span>

                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Page Subtitle
                            </label>
                            <input
                              type="text"
                              value={formPages[activePageSpreadIndex].page_title}
                              onChange={(e) => {
                                const updated = [...formPages];
                                updated[activePageSpreadIndex].page_title = e.target.value;
                                setFormPages(updated);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Story Paragraphs
                            </label>
                            <textarea
                              rows={7}
                              value={formPages[activePageSpreadIndex].content}
                              onChange={(e) => {
                                const updated = [...formPages];
                                updated[activePageSpreadIndex].content = e.target.value;
                                setFormPages(updated);
                              }}
                              className="w-full bg-[#fffdfa] border border-amber-200 rounded-xl p-3 text-xs leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>

                        {formPages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formPages.filter((_, i) => i !== activePageSpreadIndex);
                              setFormPages(updated);
                              setActivePageSpreadIndex(Math.max(0, activePageSpreadIndex - 1));
                            }}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 self-end"
                          >
                            Delete this page spread
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3: HIGHLIGHTED VOCABULARY BUILDER ── */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">
                        Interactive Highlighted Vocabulary ({formVocab.length} Words)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        These words will be highlighted in the story prose and automatically unlock in the student&apos;s Vocabulary Vault!
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setFormVocab([
                          ...formVocab,
                          {
                            word: "",
                            part_of_speech: "noun",
                            phonetic: "",
                            definition: "",
                            example_sentence: "",
                            synonyms: "",
                            antonyms: "",
                          },
                        ]);
                      }}
                      className="h-8 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>Add Word</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formVocab.map((v, idx) => (
                      <div key={idx} className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Target Word *</label>
                            <input
                              type="text"
                              placeholder="e.g. harvest"
                              value={v.word}
                              onChange={(e) => {
                                const updated = [...formVocab];
                                updated[idx].word = e.target.value;
                                setFormVocab(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Part of Speech</label>
                            <select
                              value={v.part_of_speech}
                              onChange={(e) => {
                                const updated = [...formVocab];
                                updated[idx].part_of_speech = e.target.value as "noun" | "verb" | "adjective" | "adverb";
                                setFormVocab(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                            >
                              <option value="noun">Noun</option>
                              <option value="verb">Verb</option>
                              <option value="adjective">Adjective</option>
                              <option value="adverb">Adverb</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Phonetic Guide</label>
                            <input
                              type="text"
                              placeholder="/ˈhɑːr.vɪst/"
                              value={v.phonetic}
                              onChange={(e) => {
                                const updated = [...formVocab];
                                updated[idx].phonetic = e.target.value;
                                setFormVocab(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Child-Friendly Definition *</label>
                          <input
                            type="text"
                            placeholder="The time or season when crops are gathered from fields."
                            value={v.definition}
                            onChange={(e) => {
                              const updated = [...formVocab];
                              updated[idx].definition = e.target.value;
                              setFormVocab(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => soundEffects.speakWord(v.word, v.definition)}
                            className="h-7 px-2.5 rounded-lg border-blue-200 text-blue-600 text-[11px] font-bold"
                          >
                            <Volume2 className="w-3 h-3 mr-1" />
                            <span>Test Natural Voice</span>
                          </Button>

                          {formVocab.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormVocab(formVocab.filter((_, i) => i !== idx))}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
                            >
                              Remove Word
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 4: COMPREHENSION QUIZ BUILDER ── */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">
                        Story Comprehension Quiz Questions ({formQuestions.length})
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Evaluated right after the student finishes reading the story spreads.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setFormQuestions([
                          ...formQuestions,
                          {
                            question_text: "",
                            explanation: "",
                            hint: "",
                            points: 10,
                            choices: [
                              { choice_letter: "A", choice_text: "", is_correct: true },
                              { choice_letter: "B", choice_text: "", is_correct: false },
                              { choice_letter: "C", choice_text: "", is_correct: false },
                              { choice_letter: "D", choice_text: "", is_correct: false },
                            ],
                          },
                        ]);
                      }}
                      className="h-8 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>Add Question</span>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800">
                            Question {qIdx + 1}
                          </span>
                          {formQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormQuestions(formQuestions.filter((_, i) => i !== qIdx))}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
                            >
                              Remove Question
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Question Prompt *</label>
                          <input
                            type="text"
                            placeholder="What happened at the beginning of the story?"
                            value={q.question_text}
                            onChange={(e) => {
                              const updated = [...formQuestions];
                              updated[qIdx].question_text = e.target.value;
                              setFormQuestions(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none"
                          />
                        </div>

                        {/* Choices A, B, C, D */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-600 block">
                            Choices (Select the radio button for the correct answer):
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.choices.map((c, cIdx) => (
                              <div
                                key={cIdx}
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                  c.is_correct ? "bg-emerald-50/80 border-emerald-300" : "bg-white border-slate-200"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question_${qIdx}_correct`}
                                  checked={c.is_correct}
                                  onChange={() => {
                                    const updated = [...formQuestions];
                                    updated[qIdx].choices.forEach((choice, idx) => {
                                      choice.is_correct = idx === cIdx;
                                    });
                                    setFormQuestions(updated);
                                  }}
                                  className="text-emerald-600"
                                />
                                <span className="text-xs font-black text-slate-700">{c.choice_letter}.</span>
                                <input
                                  type="text"
                                  placeholder={`Choice ${c.choice_letter}`}
                                  value={c.choice_text}
                                  onChange={(e) => {
                                    const updated = [...formQuestions];
                                    updated[qIdx].choices[cIdx].choice_text = e.target.value;
                                    setFormQuestions(updated);
                                  }}
                                  className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Teacher Feedback</label>
                            <input
                              type="text"
                              placeholder="Explanation shown after quiz..."
                              value={q.explanation}
                              onChange={(e) => {
                                const updated = [...formQuestions];
                                updated[qIdx].explanation = e.target.value;
                                setFormQuestions(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Student Hint</label>
                            <input
                              type="text"
                              placeholder="Clue for struggling pupils..."
                              value={q.hint}
                              onChange={(e) => {
                                const updated = [...formQuestions];
                                updated[qIdx].hint = e.target.value;
                                setFormQuestions(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Studio Bottom Stepper Controls */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-3xl">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4)}
                  className="rounded-xl border-slate-200 text-xs font-bold text-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4)}
                  className="rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmitStudio}
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 shadow-md shadow-emerald-200"
                >
                  {isSubmitting ? "Saving Storybook..." : "Save & Publish Story ✨"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. READ-ONLY STORYBOOK INSPECTION PREVIEW MODAL ───────────── */}
      {previewLesson && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-amber-200 p-6 space-y-4 anim-pop-bounce relative">
            <div className="flex items-start justify-between border-b border-amber-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {previewLesson.lesson_id <= 15 ? "🔒 Protected Core Curriculum" : "✨ Teacher Custom Story"}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{previewLesson.lesson_title}</h2>
                <p className="text-xs text-slate-500">{previewLesson.lesson_description}</p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2-Page Storybook Spread Preview */}
            {previewPages[previewPageIndex] ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-200">
                <div className="h-48 rounded-xl overflow-hidden border border-amber-200 bg-white">
                  <img
                    src={previewPages[previewPageIndex].image_url || "/images/story1.png"}
                    alt="Story Art"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900">
                    {previewPages[previewPageIndex].page_title}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{previewPages[previewPageIndex].content}&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">Loading pages...</div>
            )}

            {/* Vocabulary Preview */}
            {previewVocab.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Highlighted Vocabulary Terms:
                </span>
                <div className="flex flex-wrap gap-2">
                  {previewVocab.map((v) => (
                    <span
                      key={v.word_id}
                      className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-xl border border-blue-200"
                    >
                      {v.word}: <span className="font-normal text-[11px] text-slate-600">{v.definition}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Page {previewPageIndex + 1} of {previewPages.length || 1}
              </span>
              <div className="flex items-center gap-2">
                {previewPageIndex > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewPageIndex(previewPageIndex - 1)}
                    className="h-8 rounded-xl text-xs font-bold"
                  >
                    Prev Page
                  </Button>
                )}
                {previewPageIndex < previewPages.length - 1 && (
                  <Button
                    size="sm"
                    onClick={() => setPreviewPageIndex(previewPageIndex + 1)}
                    className="h-8 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    Next Page
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
