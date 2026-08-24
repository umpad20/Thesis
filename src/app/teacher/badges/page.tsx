"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic, getBadgeCategoryLabel } from "@/components/badge-graphic";
import {
  fetchBadgesFromSupabase,
  fetchBadgeLessonCounts,
  fetchStageFinalQuiz,
  type QuizWithQuestions,
} from "@/utils/supabase-queries";
import { fetchTeacherSectionsFromSupabase, getCurrentUser } from "@/utils/auth-helpers";
import { createClient } from "@/utils/supabase/client";
import type { Badge, BadgeType, MedalType, QuestionChoice } from "@/lib/types";

interface FinalQuizQuestionForm {
  question_text: string;
  explanation: string;
  hint: string;
  points: number;
  choices: Array<{ choice_letter: string; choice_text: string; is_correct: boolean }>;
}

export default function TeacherBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<number, number>>({});
  const [teacherSections, setTeacherSections] = useState<string[]>(["Grade 3-A"]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "star" | "ribbon" | "medal">("all");
  const [loading, setLoading] = useState(true);

  // Read-Only Preview Modal for Core Badges
  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);
  const [previewFinalQuiz, setPreviewFinalQuiz] = useState<QuizWithQuestions | null>(null);

  // Create / Edit Custom Badge Studio Modal
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioStep, setStudioStep] = useState<1 | 2>(1);
  const [editingBadgeId, setEditingBadgeId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Badge Form Fields (Step 1)
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<BadgeType>("star");
  const [formMedalType, setFormMedalType] = useState<MedalType>("bronze");
  const [formSection, setFormSection] = useState("all");
  const [formPassingScore, setFormPassingScore] = useState(75);
  const [formXpReward, setFormXpReward] = useState(250);
  const [formDescription, setFormDescription] = useState("");

  // Stage Final Quiz Form Fields (Step 2)
  const [formQuestions, setFormQuestions] = useState<FinalQuizQuestionForm[]>([
    {
      question_text: "What key lesson or value was shared across the 3 chapter stories of this stage?",
      explanation: "Students demonstrated character growth, cooperation, and reading comprehension.",
      hint: "Recall the main decisions made by the story characters.",
      points: 25,
      choices: [
        { choice_letter: "A", choice_text: "Kindness, cooperation, and perseverance", is_correct: true },
        { choice_letter: "B", choice_text: "Giving up when tasks are hard", is_correct: false },
        { choice_letter: "C", choice_text: "Working alone without asking for help", is_correct: false },
        { choice_letter: "D", choice_text: "Ignoring classmates", is_correct: false },
      ],
    },
  ]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const user = getCurrentUser();
      const teacherId = user?.id;

      const [badgeList, counts, sections] = await Promise.all([
        fetchBadgesFromSupabase(),
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

  const filteredBadges = badges.filter((b) => {
    const matchesSection =
      selectedSectionFilter === "all" ||
      b.target_section === "all" ||
      b.target_section === selectedSectionFilter;
    const matchesType = activeTab === "all" || b.badge_type === activeTab;
    return matchesSection && matchesType;
  });

  // Open Read-Only Preview for Core / Custom Badges
  const handleOpenPreview = async (badge: Badge) => {
    setPreviewBadge(badge);
    const quiz = await fetchStageFinalQuiz(badge.badge_id);
    setPreviewFinalQuiz(quiz);
  };

  // Open Create Studio
  const handleOpenCreate = () => {
    setEditingBadgeId(null);
    setStudioStep(1);
    setFormName("");
    setFormType("star");
    setFormMedalType("bronze");
    setFormSection("all");
    setFormPassingScore(75);
    setFormXpReward(250);
    setFormDescription("");

    setFormQuestions([
      {
        question_text: "What key lesson was shared across the 3 chapter stories of this stage?",
        explanation: "Students demonstrated character growth and comprehension.",
        hint: "Recall the main decisions made by the characters.",
        points: 25,
        choices: [
          { choice_letter: "A", choice_text: "Kindness, cooperation, and perseverance", is_correct: true },
          { choice_letter: "B", choice_text: "Giving up when tasks are hard", is_correct: false },
          { choice_letter: "C", choice_text: "Working alone without asking for help", is_correct: false },
          { choice_letter: "D", choice_text: "Ignoring classmates", is_correct: false },
        ],
      },
    ]);

    setIsStudioOpen(true);
  };

  // Open Edit for Custom Badges
  const handleOpenEdit = async (badge: Badge) => {
    if (badge.badge_id <= 5) {
      alert("Protected Core Stage Badges (Stages 1-5) cannot be modified.");
      return;
    }

    setEditingBadgeId(badge.badge_id);
    setStudioStep(1);
    setFormName(badge.badge_name);
    setFormType(badge.badge_type);
    setFormMedalType(badge.medal_type || "bronze");
    setFormSection(badge.target_section || "all");
    setFormPassingScore(badge.required_passing_score);
    setFormXpReward(badge.xp_reward);
    setFormDescription(badge.description);

    const quiz = await fetchStageFinalQuiz(badge.badge_id);
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      setFormQuestions(
        quiz.questions.map((q) => ({
          question_text: q.question_text,
          explanation: q.explanation || "",
          hint: q.hint || "",
          points: q.points,
          choices: q.choices.map((c: QuestionChoice, cIdx: number) => ({
            choice_letter: c.choice_letter || String.fromCharCode(65 + cIdx),
            choice_text: c.choice_text,
            is_correct: c.is_correct,
          })),
        }))
      );
    }

    setIsStudioOpen(true);
  };

  // Save Custom Badge + Stage Final Quiz
  const handleSaveBadgeStudio = async () => {
    if (!formName.trim()) {
      alert("Please enter a badge name.");
      setStudioStep(1);
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const user = getCurrentUser();

      if (editingBadgeId) {
        // Update Custom Badge
        await supabase
          .from("badges")
          .update({
            badge_name: formName.trim(),
            badge_type: formType,
            medal_type: formType === "medal" ? formMedalType : null,
            target_section: formSection,
            required_passing_score: formPassingScore,
            xp_reward: formXpReward,
            description: formDescription.trim(),
          })
          .eq("badge_id", editingBadgeId);
      } else {
        // Create New Badge
        const nextOrder = badges.length + 1;
        const { data: newBadge, error: badgeErr } = await supabase
          .from("badges")
          .insert({
            badge_name: formName.trim(),
            badge_type: formType,
            medal_type: formType === "medal" ? formMedalType : null,
            target_section: formSection,
            required_passing_score: formPassingScore,
            xp_reward: formXpReward,
            description: formDescription.trim() || `Mastery accolade for Stage ${nextOrder}.`,
            badge_order: nextOrder,
          })
          .select()
          .single();

        if (badgeErr || !newBadge) {
          alert("Failed to create badge: " + (badgeErr?.message || ""));
          setSaving(false);
          return;
        }

        // Create Stage Final Quiz
        if (formQuestions.length > 0) {
          const { data: createdQuiz } = await supabase
            .from("quizzes")
            .insert({
              badge_id: newBadge.badge_id,
              quiz_title: `${newBadge.badge_name} - Stage Final Mastery Quiz`,
              quiz_type: "badge_final",
              passing_score: formPassingScore,
              total_questions: formQuestions.length,
              time_limit_minutes: 15,
            })
            .select()
            .single();

          if (createdQuiz) {
            for (let qIdx = 0; qIdx < formQuestions.length; qIdx++) {
              const q = formQuestions[qIdx];
              const { data: createdQ } = await supabase
                .from("quiz_questions")
                .insert({
                  quiz_id: createdQuiz.quiz_id,
                  question_number: qIdx + 1,
                  question_text: q.question_text || `Stage Question ${qIdx + 1}`,
                  question_type: "multiple_choice",
                  points: q.points || 25,
                  explanation: q.explanation || "Stage comprehension mastered!",
                  hint: q.hint || "",
                })
                .select()
                .single();

              if (createdQ && Array.isArray(q.choices)) {
                const choiceRows = q.choices.map((c) => ({
                  question_id: createdQ.question_id,
                  choice_letter: c.choice_letter,
                  choice_text: c.choice_text,
                  is_correct: !!c.is_correct,
                }));
                await supabase.from("question_choices").insert(choiceRows);
              }
            }
          }
        }
      }

      // Refresh Badges list
      const refreshedBadges = await fetchBadgesFromSupabase();
      const refreshedCounts = await fetchBadgeLessonCounts();
      setBadges(refreshedBadges);
      setLessonCounts(refreshedCounts);
      setIsStudioOpen(false);
    } catch {
      alert("An unexpected error occurred while saving the stage badge.");
    }
    setSaving(false);
  };

  // Delete Custom Badge
  const handleDeleteBadge = async (badgeId: number) => {
    if (badgeId <= 5) {
      alert("Protected Core Stage Badges (Stages 1-5) cannot be deleted.");
      return;
    }

    if (confirm("Are you sure you want to delete this custom stage badge and its final quiz?")) {
      try {
        const supabase = createClient();
        await supabase.from("badges").delete().eq("badge_id", badgeId);
        setBadges((prev) => prev.filter((b) => b.badge_id !== badgeId));
      } catch {
        alert("Failed to delete badge.");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── 1. Header & Create Stage Badge Action ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/teacher" className="hover:text-slate-600">
              Teacher Hub
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">Badge Mastery Rules</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Stage Badges &amp; Final Mastery Quizzes
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Protected core stage badges (Stages 1–5) + custom teacher badges (max 3 stories per badge + 1 Stage Final Quiz).
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Stage Badge</span>
        </Button>
      </div>

      {/* ── 2. Filter Controls ────────────────────────────────────────── */}
      <div className="dashboard-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl w-full md:w-auto overflow-x-auto">
          {(["all", "star", "ribbon", "medal"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-blue-600 shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "all" ? `All Stages (${badges.length})` : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="text-[11px] font-bold text-slate-400">Section:</span>
          <select
            value={selectedSectionFilter}
            onChange={(e) => setSelectedSectionFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Sections</option>
            {teacherSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 3. Badges Grid ────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading Stage Badges...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBadges.map((badge) => {
            const isCore = badge.badge_id <= 5;
            const currentStoriesCount = lessonCounts[badge.badge_id] || 0;
            const isFull = currentStoriesCount >= 3;

            return (
              <div
                key={badge.badge_id}
                className="dashboard-card p-5 dashboard-card-hover flex flex-col justify-between space-y-4 border-2 border-slate-100 relative"
              >
                <div>
                  {/* Top Header: Badge Graphic & Core Protection Flag */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <BadgeGraphic
                        type={badge.badge_type}
                        medalType={badge.badge_type === "medal" ? badge.medal_type : undefined}
                        size="md"
                        status="completed"
                      />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                          Stage {badge.badge_order} · {getBadgeCategoryLabel(badge.badge_type, badge.medal_type)}
                        </span>
                        <h3 className="text-base font-black text-slate-900 leading-tight">
                          {badge.badge_name}
                        </h3>
                      </div>
                    </div>

                    {isCore ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>Core (Protected)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Custom Badge</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium mb-3">
                    {badge.description}
                  </p>

                  {/* Capacity & Mastery Rule Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Story Capacity
                      </span>
                      <span className={`text-xs font-black ${isFull ? "text-amber-700" : "text-slate-800"}`}>
                        {currentStoriesCount} / 3 Stories {isFull ? "(Full)" : ""}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Final Quiz Pass
                      </span>
                      <span className="text-xs font-black text-blue-600">
                        ≥{badge.required_passing_score}% (+{badge.xp_reward} XP)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPreview(badge)}
                    className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Rules &amp; Final Quiz</span>
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
                          onClick={() => handleOpenEdit(badge)}
                          className="h-8 w-8 p-0 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Edit Custom Badge"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBadge(badge.badge_id)}
                          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Custom Badge"
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

      {/* ── 4. CREATE / EDIT STAGE BADGE & FINAL QUIZ STUDIO MODAL ─────── */}
      {isStudioOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-slate-100 anim-pop-bounce my-auto flex flex-col max-h-[92vh]">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {editingBadgeId ? "Modify Custom Badge" : "Stage Badge Studio"}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {editingBadgeId ? "Edit Custom Stage Badge & Final Quiz" : "Create New Stage Badge & Final Quiz"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsStudioOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStudioStep(1)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  studioStep === 1
                    ? "bg-blue-600 text-white shadow-xs font-black"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                1. Badge Details &amp; Reward
              </button>
              <button
                type="button"
                onClick={() => setStudioStep(2)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  studioStep === 2
                    ? "bg-blue-600 text-white shadow-xs font-black"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                2. Stage Final Mastery Quiz ({formQuestions.length} Questions)
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {studioStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Badge Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Nature Explorer Badge"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Badge Graphic Type</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as BadgeType)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="star">Star Badge ⭐</option>
                        <option value="ribbon">Ribbon Badge 🎗️</option>
                        <option value="medal">Medal Badge 🥇</option>
                      </select>
                    </div>

                    {formType === "medal" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Medal Tier</label>
                        <select
                          value={formMedalType || "bronze"}
                          onChange={(e) => setFormMedalType(e.target.value as MedalType)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                        >
                          <option value="bronze">Bronze Medal 🥉</option>
                          <option value="silver">Silver Medal 🥈</option>
                          <option value="gold">Gold Medal 🥇</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Stage Final Pass Score (%)</label>
                      <input
                        type="number"
                        min={60}
                        max={100}
                        value={formPassingScore}
                        onChange={(e) => setFormPassingScore(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Mastery XP Reward</label>
                      <input
                        type="number"
                        min={50}
                        max={500}
                        value={formXpReward}
                        onChange={(e) => setFormXpReward(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Description</label>
                      <textarea
                        rows={2}
                        placeholder="Criteria and milestone description for students earning this badge..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {studioStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">
                        Cumulative Stage Final Questions ({formQuestions.length})
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Required for students to pass (≥{formPassingScore}%) to earn this badge seal and unlock the next stage!
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
                            points: 25,
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
                      <span>Add Final Question</span>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800">
                            Final Assessment Question {qIdx + 1}
                          </span>
                          {formQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormQuestions(formQuestions.filter((_, i) => i !== qIdx))}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Question Prompt *</label>
                          <input
                            type="text"
                            placeholder="Cumulative question prompt evaluating comprehension across the 3 stories..."
                            value={q.question_text}
                            onChange={(e) => {
                              const updated = [...formQuestions];
                              updated[qIdx].question_text = e.target.value;
                              setFormQuestions(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none"
                          />
                        </div>

                        {/* Choices */}
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
                                name={`badge_question_${qIdx}_correct`}
                                checked={c.is_correct}
                                onChange={() => {
                                  const updated = [...formQuestions];
                                  updated[qIdx].choices.forEach((choice, idx) => {
                                    choice.is_correct = idx === cIdx;
                                  });
                                  setFormQuestions(updated);
                                }}
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
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Studio Bottom Controls */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-3xl">
              {studioStep === 2 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStudioStep(1)}
                  className="rounded-xl border-slate-200 text-xs font-bold text-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </Button>
              ) : (
                <div />
              )}

              {studioStep === 1 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setStudioStep(2)}
                  className="rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  <span>Next: Stage Final Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveBadgeStudio}
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 shadow-md shadow-emerald-200"
                >
                  {saving ? "Saving Badge & Final Quiz..." : "Save Stage Badge ✨"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. READ-ONLY PREVIEW MODAL FOR CORE / CUSTOM BADGES ───────── */}
      {previewBadge && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-slate-100 p-6 space-y-4 anim-pop-bounce relative">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <BadgeGraphic
                  type={previewBadge.badge_type}
                  medalType={previewBadge.badge_type === "medal" ? previewBadge.medal_type : undefined}
                  size="md"
                  status="completed"
                />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {previewBadge.badge_id <= 5 ? "🔒 Protected Core Stage" : "✨ Teacher Custom Badge"}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">{previewBadge.badge_name}</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewBadge(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">{previewBadge.description}</p>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Passing Threshold</span>
                <span className="font-black text-slate-900">≥{previewBadge.required_passing_score}% Score</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mastery Reward</span>
                <span className="font-black text-blue-600">+{previewBadge.xp_reward} XP</span>
              </div>
            </div>

            {/* Stage Final Quiz Summary */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>Stage Final Mastery Quiz ({previewFinalQuiz?.questions?.length || 0} Questions)</span>
              </h4>

              {previewFinalQuiz && previewFinalQuiz.questions && previewFinalQuiz.questions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {previewFinalQuiz.questions.map((q, idx) => (
                    <div key={q.question_id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-800">Q{idx + 1}: {q.question_text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No final questions loaded for this badge.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setPreviewBadge(null)} className="h-9 px-5 rounded-xl bg-blue-600 text-white font-bold text-xs">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
