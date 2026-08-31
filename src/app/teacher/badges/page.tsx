"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Edit,
  Plus,
  Sparkles,
  Lock,
  Trash2,
  X,
  BookOpen,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Award,
  HelpCircle,
  Eye,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic, getBadgeCategoryLabel } from "@/components/badge-graphic";
import {
  fetchBadgesFromSupabase,
  fetchBadgeLessonCounts,
  fetchStageFinalQuiz,
  fetchStageCurriculumDetails,
  type QuizWithQuestions,
} from "@/utils/supabase-queries";
import { fetchTeacherSectionsFromSupabase, getCurrentUser } from "@/utils/auth-helpers";
import { createClient } from "@/utils/supabase/client";
import { StorybookMapSkeleton } from "@/components/page-skeletons";
import type { Badge, BadgeType, MedalType, Lesson, LessonPage } from "@/lib/types";

interface StageLessonWithQuiz {
  lesson_id: number;
  lesson_title: string;
  badge_id: number;
  difficulty_level: string;
  lesson_description?: string;
  description?: string;
  pages: LessonPage[];
  quiz?: {
    quiz_id: number;
    quiz_title: string;
    questions?: Array<{
      question_id: number;
      question_text: string;
      points: number;
      hint: string;
      explanation: string;
      choices: Array<{ choice_id: number; choice_text: string; is_correct: boolean }>;
    }>;
  };
}

export default function TeacherBadgesPage() {
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<number, number>>({});
  const [teacherSections, setTeacherSections] = useState<string[]>(["Grade 3-A"]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("all");
  const [curriculumTab, setCurriculumTab] = useState<"core" | "teacher" | "all">("all");
  const [loading, setLoading] = useState(true);

  // Inspector Modal for Core Protected Badges
  const [inspectBadge, setInspectBadge] = useState<Badge | null>(null);
  const [inspectLessons, setInspectLessons] = useState<StageLessonWithQuiz[]>([]);
  const [inspectFinalQuiz, setInspectFinalQuiz] = useState<QuizWithQuestions | null>(null);
  const [inspectTab, setInspectTab] = useState<"stories" | "finalQuiz">("stories");
  const [inspectLoading, setInspectLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const user = getCurrentUser();
      const teacherId = user?.id;

      const [badgeList, counts, sections] = await Promise.all([
        fetchBadgesFromSupabase(undefined, teacherId, { isTeacher: true }),
        fetchBadgeLessonCounts(),
        fetchTeacherSectionsFromSupabase(teacherId),
      ]);
      setBadges(badgeList);
      setLessonCounts(counts);
      if (sections.length > 0) {
        setTeacherSections(sections);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Open Inspector for Core Badge (Stages 1-5)
  const handleOpenInspector = async (badge: Badge) => {
    setInspectBadge(badge);
    setInspectTab("stories");
    setInspectLoading(true);

    try {
      const { lessons, finalQuiz } = await fetchStageCurriculumDetails(badge.badge_id);
      setInspectLessons(lessons);
      setInspectFinalQuiz(finalQuiz);
    } catch (err) {
      console.error("Inspector fetch error:", err);
    }
    setInspectLoading(false);
  };

  // Open Studio for Creating New Custom Stage Badge (Dedicated Full-Page Route)
  const handleOpenCreate = () => {
    router.push("/teacher/badges/create");
  };

  // Open Studio for Editing Custom Teacher Badge (Stage 6+)
  const handleOpenEdit = (badge: Badge) => {
    if (badge.badge_id <= 5) {
      handleOpenInspector(badge);
    } else {
      router.push(`/teacher/badges/create?editBadgeId=${badge.badge_id}`);
    }
  };

  // Delete Custom Badge
  const handleDeleteBadge = async (badgeId: number) => {
    if (badgeId <= 5) {
      alert("Protected Core Stage Badges (Stages 1-5) cannot be deleted.");
      return;
    }

    if (confirm("Are you sure you want to delete this custom stage badge, its story lessons, and quizzes?")) {
      try {
        const supabase = createClient();
        const { data: oldLessons } = await supabase
          .from("lessons")
          .select("lesson_id")
          .eq("badge_id", badgeId);

        if (oldLessons && oldLessons.length > 0) {
          const lessonIds = oldLessons.map((l) => l.lesson_id);
          await supabase.from("vocabulary_words").delete().in("lesson_id", lessonIds);
          await supabase.from("lesson_pages").delete().in("lesson_id", lessonIds);
          await supabase.from("quizzes").delete().in("lesson_id", lessonIds);
          await supabase.from("lessons").delete().in("lesson_id", lessonIds);
        }

        await supabase.from("quizzes").delete().eq("badge_id", badgeId);
        await supabase.from("badges").delete().eq("badge_id", badgeId);

        setBadges((prev) => prev.filter((b) => b.badge_id !== badgeId));
      } catch {
        alert("Failed to delete badge.");
      }
    }
  };

  const coreBadgesCount = badges.filter((b) => b.badge_id <= 5 && !b.teacher_id).length;
  const teacherQuestsCount = badges.filter((b) => b.badge_id > 5 || b.teacher_id != null).length;

  const filteredBadges = badges.filter((b) => {
    const isCore = b.badge_id <= 5 && !b.teacher_id;
    const matchesTab =
      curriculumTab === "all" ||
      (curriculumTab === "core" && isCore) ||
      (curriculumTab === "teacher" && !isCore);

    const matchesSection =
      selectedSectionFilter === "all" ||
      !b.target_section ||
      b.target_section === "all" ||
      b.target_section === "all_my_sections" ||
      b.target_section === selectedSectionFilter ||
      (b.target_section &&
        b.target_section
          .split(",")
          .map((s: string) => s.trim())
          .includes(selectedSectionFilter));

    return matchesTab && matchesSection;
  });

  if (loading) {
    return <StorybookMapSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── 1. Unified Header & Create Stage Button ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/teacher" className="hover:text-slate-600">
              Teacher Hub
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">Curriculum &amp; Stage Badges</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Reading Curriculum &amp; Stage Badges Studio
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Protected core stages (1–5) and teacher-created custom quests. Each stage contains story lessons and comprehensive evaluations.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Stage Badge</span>
        </Button>
      </div>

      {/* ── 2. Primary 1-Click Tab Switcher: Core vs Teacher Quests ────── */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl w-full md:w-auto overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setCurriculumTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              curriculumTab === "all"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Stages ({badges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurriculumTab("core")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              curriculumTab === "core"
                ? "bg-white text-amber-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>🌟 Core DepEd Stages ({coreBadgesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurriculumTab("teacher")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              curriculumTab === "teacher"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>🏫 Teacher Quests ({teacherQuestsCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Section:</span>
          <select
            value={selectedSectionFilter}
            onChange={(e) => setSelectedSectionFilter(e.target.value)}
            className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">All Sections (School-Wide)</option>
            {teacherSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 3. Stage Badges Grid ──────────────────────────────────────── */}
      {filteredBadges.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900">No Stage Badges Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {curriculumTab === "teacher"
              ? "You haven't created any custom classroom quests yet. Click below to author your first custom stage badge!"
              : "No badges match the selected filter criteria."}
          </p>
          {curriculumTab === "teacher" && (
            <Button
              onClick={handleOpenCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 mt-2"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create First Teacher Quest</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => {
            const isCore = badge.badge_id <= 5;
            const storyCount = lessonCounts[badge.badge_id] || (isCore ? 3 : 0);

            return (
              <div
                key={badge.badge_id}
                className={`dashboard-card p-6 flex flex-col justify-between transition-all relative overflow-hidden group ${
                  isCore
                    ? "border-slate-200 bg-white"
                    : "border-2 border-indigo-200 bg-indigo-50/15 shadow-sm"
                }`}
              >
                <div className="space-y-4">
                  {/* Header: Badge Art + Category Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <BadgeGraphic
                        badgeIconUrl={badge.badge_icon_url}
                        type={badge.badge_type}
                        medalType={badge.badge_type === "medal" ? badge.medal_type : undefined}
                        size="md"
                        status="completed"
                      />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          {isCore
                            ? `CORE STAGE ${badge.badge_order || badge.badge_id} · ${getBadgeCategoryLabel(badge.badge_type, badge.medal_type)}`
                            : `TEACHER QUEST · ${badge.target_section === "all" ? "SCHOOL-WIDE" : badge.target_section || "CLASSROOM"}`}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                          {badge.badge_name}
                        </h3>
                      </div>
                    </div>

                    {isCore ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        <span>CORE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex-shrink-0">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>TEACHER QUEST</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>

                  {/* Stage Story Capacity & Final Passing Score */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Stories
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        {storyCount} / 3 Stories {storyCount >= 3 && "(Full)"}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Passing Score
                      </span>
                      <span className="text-xs font-black text-emerald-700">
                        ≥{badge.required_passing_score}% (+{badge.xp_reward} XP)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isCore ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInspector(badge)}
                      className="w-full h-9 rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Inspect Stage Curriculum</span>
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(badge)}
                        className="flex-1 h-9 rounded-xl border-indigo-200 text-xs font-bold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Quest &amp; Stories</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBadge(badge.badge_id)}
                        className="h-9 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Stage Curriculum Inspector Modal (For Core Badges 1-5) ──── */}
      {inspectBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-slate-200 overflow-hidden anim-pop-bounce">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <BadgeGraphic
                  badgeIconUrl={inspectBadge.badge_icon_url}
                  type={inspectBadge.badge_type}
                  medalType={inspectBadge.badge_type === "medal" ? inspectBadge.medal_type : undefined}
                  size="sm"
                  status="completed"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{inspectBadge.badge_name}</h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Core Stage {inspectBadge.badge_order || inspectBadge.badge_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{inspectBadge.description}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectBadge(null)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex items-center px-6 border-b border-slate-100 bg-white">
              <button
                onClick={() => setInspectTab("stories")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  inspectTab === "stories"
                    ? "border-blue-600 text-blue-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Story Lessons ({inspectLessons.length})</span>
                </span>
              </button>
              <button
                onClick={() => setInspectTab("finalQuiz")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  inspectTab === "finalQuiz"
                    ? "border-blue-600 text-blue-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Stage Final Quiz ({inspectFinalQuiz?.questions?.length || 0} Qs)</span>
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {inspectLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs">Loading curriculum details...</div>
              ) : inspectTab === "stories" ? (
                <div className="space-y-4">
                  {inspectLessons.map((l, idx) => (
                    <div key={l.lesson_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">
                          Story {idx + 1}: {l.lesson_title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 capitalize">
                          {l.difficulty_level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{l.lesson_description || l.description}</p>

                      <div className="pt-2 flex items-center gap-3 text-[11px] font-bold text-slate-600">
                        <span>📖 {l.pages.length} Pages</span>
                        <span>·</span>
                        <span>❓ {l.quiz?.questions?.length || 0} Comprehension Questions</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {inspectFinalQuiz ? (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900">{inspectFinalQuiz.quiz_title}</h4>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Pass: {inspectFinalQuiz.passing_score}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        {inspectFinalQuiz.questions?.map((q, qIdx) => (
                          <div key={q.question_id} className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                            <span className="text-xs font-bold text-slate-800">
                              {qIdx + 1}. {q.question_text}
                            </span>
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              {q.choices.map((c) => (
                                <span
                                  key={c.choice_id}
                                  className={`text-[10px] px-2 py-1 rounded ${
                                    c.is_correct
                                      ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                                      : "bg-slate-50 text-slate-600"
                                  }`}
                                >
                                  {c.is_correct && "✓ "}
                                  {c.choice_text}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs">No stage final quiz found.</div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectBadge(null)}
                className="rounded-xl text-xs font-bold"
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
