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
  CheckCircle2,
  Layers,
  Award,
  HelpCircle,
  Eye,
  ShieldCheck,
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

interface QuestionFormItem {
  question_text: string;
  explanation: string;
  hint: string;
  points: number;
  choices: Array<{ choice_letter: string; choice_text: string; is_correct: boolean }>;
}

interface StoryLessonFormItem {
  lesson_title: string;
  difficulty_level: "easy" | "medium" | "hard";
  story_content: string;
  questions: QuestionFormItem[];
}

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

function createDefaultQuestions(): QuestionFormItem[] {
  return [
    {
      question_text: "What was the main topic or lesson of this story?",
      explanation: "Understanding the main idea is essential for Grade 3 reading mastery.",
      hint: "Think about what happened to the main characters.",
      points: 20,
      choices: [
        { choice_letter: "A", choice_text: "Helping others and showing kindness", is_correct: true },
        { choice_letter: "B", choice_text: "Ignoring instructions", is_correct: false },
        { choice_letter: "C", choice_text: "Giving up when tasks get hard", is_correct: false },
        { choice_letter: "D", choice_text: "Working without a team", is_correct: false },
      ],
    },
    {
      question_text: "How did the characters solve the problem they encountered?",
      explanation: "Problem solving through patience and communication brings positive results.",
      hint: "Recall what steps the characters took together.",
      points: 20,
      choices: [
        { choice_letter: "A", choice_text: "They talked peacefully and worked as a team.", is_correct: true },
        { choice_letter: "B", choice_text: "They walked away and didn't finish.", is_correct: false },
        { choice_letter: "C", choice_text: "They argued about who was at fault.", is_correct: false },
        { choice_letter: "D", choice_text: "They waited for someone else to do it.", is_correct: false },
      ],
    },
    {
      question_text: "Which character action demonstrated responsibility?",
      explanation: "Taking care of your duties shows maturity and dependability.",
      hint: "Look at the choices made by the story character.",
      points: 20,
      choices: [
        { choice_letter: "A", choice_text: "Admitting a mistake and correcting it promptly.", is_correct: true },
        { choice_letter: "B", choice_text: "Blaming a classmate for the mistake.", is_correct: false },
        { choice_letter: "C", choice_text: "Hiding under the table.", is_correct: false },
        { choice_letter: "D", choice_text: "Pretending nothing happened.", is_correct: false },
      ],
    },
    {
      question_text: "What positive value does this story teach students?",
      explanation: "Good moral values guide students in everyday school life.",
      hint: "Think about how friends treat each other.",
      points: 20,
      choices: [
        { choice_letter: "A", choice_text: "Honesty, empathy, and persistent effort.", is_correct: true },
        { choice_letter: "B", choice_text: "Selfishness and arrogance.", is_correct: false },
        { choice_letter: "C", choice_text: "Skipping school assignments.", is_correct: false },
        { choice_letter: "D", choice_text: "Talking when the teacher is speaking.", is_correct: false },
      ],
    },
    {
      question_text: "How can you apply this story's lesson in your own classroom?",
      explanation: "Applying reading lessons in daily life strengthens character.",
      hint: "Consider how you interact with your peers.",
      points: 20,
      choices: [
        { choice_letter: "A", choice_text: "By listening respectfully and supporting my classmates.", is_correct: true },
        { choice_letter: "B", choice_text: "By keeping all learning tools to myself.", is_correct: false },
        { choice_letter: "C", choice_text: "By ignoring new students.", is_correct: false },
        { choice_letter: "D", choice_text: "By rushing through reading tasks.", is_correct: false },
      ],
    },
  ];
}

export default function TeacherBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<number, number>>({});
  const [teacherSections, setTeacherSections] = useState<string[]>(["Grade 3-A"]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "star" | "ribbon" | "medal">("all");
  const [loading, setLoading] = useState(true);

  // Inspector Modal for Core Protected Badges
  const [inspectBadge, setInspectBadge] = useState<Badge | null>(null);
  const [inspectLessons, setInspectLessons] = useState<StageLessonWithQuiz[]>([]);
  const [inspectFinalQuiz, setInspectFinalQuiz] = useState<QuizWithQuestions | null>(null);
  const [inspectTab, setInspectTab] = useState<"stories" | "finalQuiz">("stories");
  const [inspectLoading, setInspectLoading] = useState(false);

  // Unified Studio Modal for Creating / Editing Custom Teacher Badges
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioStep, setStudioStep] = useState<1 | 2 | 3>(1);
  const [editingBadgeId, setEditingBadgeId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeLessonTab, setActiveLessonTab] = useState<number>(0);

  // Studio Step 1: Badge Milestone Fields
  const [formBadgeName, setFormBadgeName] = useState("");
  const [formBadgeType, setFormBadgeType] = useState<BadgeType>("star");
  const [formMedalType, setFormMedalType] = useState<"bronze" | "silver" | "gold">("bronze");
  const [formSection, setFormSection] = useState("all");
  const [formPassingScore, setFormPassingScore] = useState(75);
  const [formXpReward, setFormXpReward] = useState(250);
  const [formDescription, setFormDescription] = useState("");

  // Studio Step 2: 1 to 3 Story Lessons & Quizzes
  const [formLessons, setFormLessons] = useState<StoryLessonFormItem[]>([
    {
      lesson_title: "Chapter 1: The New Adventure",
      difficulty_level: "easy",
      story_content:
        "One sunny morning, Maya discovered a mysterious book in the school library.\nThe golden pages glowed softly as she turned to the first chapter.\nHer best friend Sam joined her at the reading table.\nTogether, they explored the exciting journey of reading.",
      questions: createDefaultQuestions(),
    },
  ]);

  // Studio Step 3: Stage Final Mastery Quiz
  const [formFinalQuestions, setFormFinalQuestions] = useState<QuestionFormItem[]>(createDefaultQuestions());

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

  // Open Studio for Creating New Custom Stage Badge
  const handleOpenCreate = () => {
    setEditingBadgeId(null);
    setStudioStep(1);
    setActiveLessonTab(0);
    setFormBadgeName("");
    setFormBadgeType("star");
    setFormMedalType("bronze");
    setFormSection("all");
    setFormPassingScore(75);
    setFormXpReward(350);
    setFormDescription("");
    setFormLessons([
      {
        lesson_title: "Chapter 1: The New Adventure",
        difficulty_level: "easy",
        story_content:
          "One sunny morning, Maya discovered a mysterious book in the school library.\nThe golden pages glowed softly as she turned to the first chapter.\nHer best friend Sam joined her at the reading table.\nTogether, they explored the exciting journey of reading.",
        questions: createDefaultQuestions(),
      },
    ]);
    setFormFinalQuestions(createDefaultQuestions());
    setIsStudioOpen(true);
  };

  // Open Studio for Editing Custom Teacher Badge (Stage 6+)
  const handleOpenEdit = async (badge: Badge) => {
    if (badge.badge_id <= 5) {
      handleOpenInspector(badge);
      return;
    }

    setEditingBadgeId(badge.badge_id);
    setStudioStep(1);
    setActiveLessonTab(0);
    setFormBadgeName(badge.badge_name);
    setFormBadgeType(badge.badge_type);
    setFormMedalType(badge.medal_type || "bronze");
    setFormSection(badge.target_section || "all");
    setFormPassingScore(badge.required_passing_score || 75);
    setFormXpReward(badge.xp_reward || 350);
    setFormDescription(badge.description || "");

    try {
      const { lessons, finalQuiz } = await fetchStageCurriculumDetails(badge.badge_id);

      if (finalQuiz?.questions && finalQuiz.questions.length > 0) {
        setFormFinalQuestions(
          finalQuiz.questions.map((q: any) => ({
            question_text: q.question_text,
            explanation: q.explanation || "",
            hint: q.hint || "",
            points: q.points || 20,
            choices: (q.choices || []).map((c: any, idx: number) => ({
              choice_letter: String.fromCharCode(65 + idx),
              choice_text: c.choice_text,
              is_correct: !!c.is_correct,
            })),
          }))
        );
      } else {
        setFormFinalQuestions(createDefaultQuestions());
      }

      if (lessons && lessons.length > 0) {
        const loadedLessons: StoryLessonFormItem[] = lessons.map((l) => {
          const content = (l.pages || []).map((p) => p.content).join("\n");
          let questions: QuestionFormItem[] = createDefaultQuestions();

          if (l.quiz?.questions && l.quiz.questions.length > 0) {
            questions = l.quiz.questions.map((q) => ({
              question_text: q.question_text,
              points: q.points || 20,
              hint: q.hint || "",
              explanation: q.explanation || "",
              choices: (q.choices || []).map((c, idx) => ({
                choice_letter: String.fromCharCode(65 + idx),
                choice_text: c.choice_text,
                is_correct: !!c.is_correct,
              })),
            }));
          }

          return {
            lesson_title: l.lesson_title,
            difficulty_level: (l.difficulty_level as any) || "easy",
            story_content: content || "Maya and Leo began a great reading quest.",
            questions: questions.length > 0 ? questions : createDefaultQuestions(),
          };
        });
        setFormLessons(loadedLessons);
      } else {
        setFormLessons([
          {
            lesson_title: "Chapter 1: Story Adventure",
            difficulty_level: "easy",
            story_content: "Maya and Leo began a great reading quest.",
            questions: createDefaultQuestions(),
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading custom badge data:", err);
    }

    setIsStudioOpen(true);
  };

  // Add Lesson to Form (Max 3)
  const handleAddLessonSlot = () => {
    if (formLessons.length >= 3) {
      alert("Each stage badge supports a maximum of 3 story lessons.");
      return;
    }
    const nextIdx = formLessons.length + 1;
    setFormLessons((prev) => [
      ...prev,
      {
        lesson_title: `Chapter ${nextIdx}: New Story Chapter`,
        difficulty_level: "easy",
        story_content: "Write the story sentences here. Each line becomes a sentence page in the student reader.",
        questions: createDefaultQuestions(),
      },
    ]);
    setActiveLessonTab(formLessons.length);
  };

  // Remove Lesson Slot
  const handleRemoveLessonSlot = (idx: number) => {
    if (formLessons.length <= 1) {
      alert("A stage badge requires at least 1 story lesson.");
      return;
    }
    setFormLessons((prev) => prev.filter((_, i) => i !== idx));
    setActiveLessonTab(Math.max(0, idx - 1));
  };

  // Atomic Save to Supabase
  const handleSaveStageCurriculum = async () => {
    if (!formBadgeName.trim()) {
      alert("Please provide a name for this Stage Badge.");
      setStudioStep(1);
      return;
    }

    setSaving(true);
    try {
      const user = getCurrentUser();
      const supabase = createClient();

      let targetBadgeId = editingBadgeId;

      if (!targetBadgeId) {
        // Find next badge_id and badge_order
        const maxId = badges.reduce((max, b) => Math.max(max, b.badge_id), 5);
        targetBadgeId = maxId + 1;

        const { error: bErr } = await supabase.from("badges").insert({
          badge_id: targetBadgeId,
          badge_name: formBadgeName.trim(),
          badge_type: formBadgeType,
          medal_type: formBadgeType === "medal" ? formMedalType : null,
          badge_order: targetBadgeId,
          required_passing_score: Number(formPassingScore),
          xp_reward: Number(formXpReward),
          target_section: formSection,
          description: formDescription.trim() || `Master Stage ${targetBadgeId} story lessons and final exam.`,
          created_by: user?.id || null,
        });

        if (bErr) {
          alert(`Failed to create badge: ${bErr.message}`);
          setSaving(false);
          return;
        }
      } else {
        // Update existing badge
        await supabase
          .from("badges")
          .update({
            badge_name: formBadgeName.trim(),
            badge_type: formBadgeType,
            medal_type: formBadgeType === "medal" ? formMedalType : null,
            required_passing_score: Number(formPassingScore),
            xp_reward: Number(formXpReward),
            target_section: formSection,
            description: formDescription.trim(),
          })
          .eq("badge_id", targetBadgeId);
      }

      // ── Process Lessons & Quizzes ──
      // 1. Delete existing lessons for this custom badge if editing
      if (editingBadgeId) {
        const { data: oldLessons } = await supabase
          .from("lessons")
          .select("lesson_id")
          .eq("badge_id", targetBadgeId);

        if (oldLessons && oldLessons.length > 0) {
          const oldLessonIds = oldLessons.map((l) => l.lesson_id);
          await supabase.from("lesson_pages").delete().in("lesson_id", oldLessonIds);
          await supabase.from("quizzes").delete().in("lesson_id", oldLessonIds);
          await supabase.from("lessons").delete().in("lesson_id", oldLessonIds);
        }
      }

      // 2. Insert new lessons, pages, and lesson quizzes
      for (let lIdx = 0; lIdx < formLessons.length; lIdx++) {
        const l = formLessons[lIdx];
        const { data: newLesson } = await supabase
          .from("lessons")
          .insert({
            badge_id: targetBadgeId,
            lesson_title: l.lesson_title.trim() || `Chapter ${lIdx + 1}`,
            difficulty_level: l.difficulty_level,
            lesson_description: `Story lesson for ${formBadgeName}`,
            target_section: formSection,
            created_by: user?.id || null,
            status: "published",
            lesson_order: lIdx + 1,
          })
          .select()
          .single();

        if (newLesson) {
          // Split story sentences by line break
          const sentences = l.story_content
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

          const pageRows = sentences.map((sentence, sIdx) => ({
            lesson_id: newLesson.lesson_id,
            page_number: sIdx + 1,
            page_title: `Page ${sIdx + 1}`,
            content: sentence,
            image_url: "/images/story1.png",
          }));

          if (pageRows.length > 0) {
            await supabase.from("lesson_pages").insert(pageRows);
          }

          // Insert Lesson Quiz
          const { data: lessonQuiz } = await supabase
            .from("quizzes")
            .insert({
              lesson_id: newLesson.lesson_id,
              badge_id: targetBadgeId,
              quiz_title: `Comprehension: ${newLesson.lesson_title}`,
              quiz_type: "practice",
              passing_score: formPassingScore,
            })
            .select()
            .single();

          if (lessonQuiz && Array.isArray(l.questions)) {
            for (let qIdx = 0; qIdx < l.questions.length; qIdx++) {
              const q = l.questions[qIdx];
              const { data: createdQ } = await supabase
                .from("quiz_questions")
                .insert({
                  quiz_id: lessonQuiz.quiz_id,
                  question_text: q.question_text,
                  question_type: "multiple_choice",
                  points: q.points || 20,
                  hint: q.hint || "",
                  explanation: q.explanation || "",
                })
                .select()
                .single();

              if (createdQ && Array.isArray(q.choices)) {
                const choiceRows = q.choices.map((c) => ({
                  question_id: createdQ.question_id,
                  choice_text: c.choice_text,
                  is_correct: !!c.is_correct,
                }));
                await supabase.from("question_choices").insert(choiceRows);
              }
            }
          }
        }
      }

      // ── Process Stage Final Quiz ──
      // Delete old Stage Final quiz for this badge
      await supabase
        .from("quizzes")
        .delete()
        .eq("badge_id", targetBadgeId)
        .is("lesson_id", null);

      const { data: createdFinalQuiz } = await supabase
        .from("quizzes")
        .insert({
          badge_id: targetBadgeId,
          lesson_id: null,
          quiz_title: `Stage ${targetBadgeId} Final Mastery: ${formBadgeName} Comprehensive Quiz`,
          quiz_type: "badge_final",
          passing_score: formPassingScore,
        })
        .select()
        .single();

      if (createdFinalQuiz && Array.isArray(formFinalQuestions)) {
        for (let qIdx = 0; qIdx < formFinalQuestions.length; qIdx++) {
          const q = formFinalQuestions[qIdx];
          const { data: createdQ } = await supabase
            .from("quiz_questions")
            .insert({
              quiz_id: createdFinalQuiz.quiz_id,
              question_text: q.question_text,
              question_type: "multiple_choice",
              points: q.points || 20,
              hint: q.hint || "",
              explanation: q.explanation || "",
            })
            .select()
            .single();

          if (createdQ && Array.isArray(q.choices)) {
            const choiceRows = q.choices.map((c) => ({
              question_id: createdQ.question_id,
              choice_text: c.choice_text,
              is_correct: !!c.is_correct,
            }));
            await supabase.from("question_choices").insert(choiceRows);
          }
        }
      }

      // Refresh Badges & counts
      const [refreshedBadges, refreshedCounts] = await Promise.all([
        fetchBadgesFromSupabase(),
        fetchBadgeLessonCounts(),
      ]);
      setBadges(refreshedBadges);
      setLessonCounts(refreshedCounts);
      setIsStudioOpen(false);
    } catch (err: any) {
      alert(`An error occurred: ${err.message || "Failed to save stage curriculum."}`);
    }
    setSaving(false);
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

  const filteredBadges = badges.filter((b) => {
    const matchesTab = activeTab === "all" || b.badge_type === activeTab;
    const matchesSection =
      selectedSectionFilter === "all" ||
      !b.target_section ||
      b.target_section === "all" ||
      b.target_section === selectedSectionFilter;
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
            Protected core stages (1–5) + custom teacher stages. Each stage includes up to 3 story lessons and its comprehensive final quiz.
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

      {/* ── 2. Filter Controls ────────────────────────────────────────── */}
      <div className="dashboard-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl w-full md:w-auto overflow-x-auto">
          {(["all", "star", "ribbon", "medal"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-blue-600 shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "all" ? `All Stages (${badges.length})` : tab}
            </button>
          ))}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => {
          const isCore = badge.badge_id <= 5;
          const storyCount = lessonCounts[badge.badge_id] || (isCore ? 3 : 0);

          return (
            <div
              key={badge.badge_id}
              className={`dashboard-card p-6 flex flex-col justify-between transition-all relative overflow-hidden group ${
                isCore ? "border-slate-200 bg-white" : "border-2 border-blue-200 bg-blue-50/20 shadow-md"
              }`}
            >
              <div className="space-y-4">
                {/* Header: Badge Art + Category Tag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <BadgeGraphic
                      type={badge.badge_type}
                      medalType={badge.badge_type === "medal" ? badge.medal_type : undefined}
                      size="md"
                      status="completed"
                    />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        STAGE {badge.badge_order || badge.badge_id} · {getBadgeCategoryLabel(badge.badge_type, badge.medal_type)}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                        {badge.badge_name}
                      </h3>
                    </div>
                  </div>

                  {isCore ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                      <Lock className="w-2.5 h-2.5" />
                      <span>CORE</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex-shrink-0">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>TEACHER</span>
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
                      Final Quiz Pass
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
                      className="flex-1 h-9 rounded-xl border-blue-200 text-xs font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Stage &amp; Stories</span>
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

      {/* ── 4. Stage Curriculum Inspector Modal (For Core Badges 1-5) ──── */}
      {inspectBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-slate-200 overflow-hidden anim-pop-bounce">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <BadgeGraphic
                  type={inspectBadge.badge_type}
                  medalType={inspectBadge.badge_type === "medal" ? inspectBadge.medal_type : undefined}
                  size="sm"
                  status="completed"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{inspectBadge.badge_name}</h2>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Developer Protected</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{inspectBadge.description}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectBadge(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 px-6 bg-white">
              <button
                onClick={() => setInspectTab("stories")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  inspectTab === "stories"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>3 Assigned Story Lessons ({inspectLessons.length})</span>
              </button>
              <button
                onClick={() => setInspectTab("finalQuiz")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  inspectTab === "finalQuiz"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Stage Final Mastery Quiz (5 Questions)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {inspectLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading stage curriculum details...</div>
              ) : inspectTab === "stories" ? (
                <div className="space-y-4">
                  {inspectLessons.map((lesson, idx) => (
                    <div key={lesson.lesson_id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{lesson.lesson_title}</h4>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {lesson.difficulty_level} · {lesson.pages?.length || 0} Sentences
                        </span>
                      </div>

                      {/* Preview of Story Sentences */}
                      <div className="p-3 rounded-xl bg-white border border-slate-100 text-xs text-slate-600 leading-relaxed font-serif">
                        {lesson.pages?.map((p) => p.content).join(" ") || "No sentence pages recorded."}
                      </div>

                      {/* Lesson Quiz Questions Preview */}
                      {lesson.quiz?.questions && lesson.quiz.questions.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                            Lesson Comprehension Quiz ({lesson.quiz.questions.length} Questions)
                          </span>
                          <div className="space-y-2">
                            {lesson.quiz.questions.map((q, qIdx) => (
                              <div key={q.question_id} className="p-2.5 rounded-lg bg-white border border-slate-100 text-xs">
                                <p className="font-bold text-slate-800">
                                  {qIdx + 1}. {q.question_text}
                                </p>
                                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                                  {q.choices?.map((c, cIdx) => (
                                    <span
                                      key={c.choice_id}
                                      className={`text-[11px] px-2 py-1 rounded-md ${
                                        c.is_correct
                                          ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                                          : "text-slate-500 bg-slate-50"
                                      }`}
                                    >
                                      {String.fromCharCode(65 + cIdx)}. {c.choice_text}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
                    🏆 Passing Requirement: <strong>≥{inspectBadge.required_passing_score}%</strong> · Reward: <strong>+{inspectBadge.xp_reward} XP</strong>
                  </div>

                  {inspectFinalQuiz?.questions && inspectFinalQuiz.questions.length > 0 ? (
                    inspectFinalQuiz.questions.map((q: any, qIdx: number) => (
                      <div key={q.question_id || qIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                        <p className="font-bold text-slate-900">
                          {qIdx + 1}. {q.question_text}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {(q.choices || []).map((c: any, cIdx: number) => (
                            <span
                              key={c.choice_id || cIdx}
                              className={`p-2 rounded-xl text-xs ${
                                c.is_correct
                                  ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                                  : "bg-white text-slate-600 border border-slate-100"
                              }`}
                            >
                              {String.fromCharCode(65 + cIdx)}. {c.choice_text}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">No questions loaded for this final quiz.</div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button onClick={() => setInspectBadge(null)} className="h-9 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs">
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Unified Stage Curriculum Studio (3-Step Creator/Editor) ──── */}
      {isStudioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-blue-200 overflow-hidden anim-pop-bounce">
            {/* Studio Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {editingBadgeId ? `Edit Stage ${editingBadgeId} Curriculum` : "Create New Stage Badge & Curriculum"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Step {studioStep} of 3:{" "}
                    {studioStep === 1
                      ? "Stage Badge Milestone Rules"
                      : studioStep === 2
                      ? "Story Lessons (Max 3) & Quizzes"
                      : "Stage Final Mastery Quiz"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStudioOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Studio Progress Stepper */}
            <div className="grid grid-cols-3 border-b border-slate-100 bg-white text-xs font-bold text-center">
              <button
                onClick={() => setStudioStep(1)}
                className={`py-2.5 border-b-2 transition-all cursor-pointer ${
                  studioStep === 1 ? "border-blue-600 text-blue-600 bg-blue-50/20" : "border-transparent text-slate-400"
                }`}
              >
                1. Badge Identity
              </button>
              <button
                onClick={() => setStudioStep(2)}
                className={`py-2.5 border-b-2 transition-all cursor-pointer ${
                  studioStep === 2 ? "border-blue-600 text-blue-600 bg-blue-50/20" : "border-transparent text-slate-400"
                }`}
              >
                2. Story Lessons &amp; Quizzes ({formLessons.length}/3)
              </button>
              <button
                onClick={() => setStudioStep(3)}
                className={`py-2.5 border-b-2 transition-all cursor-pointer ${
                  studioStep === 3 ? "border-blue-600 text-blue-600 bg-blue-50/20" : "border-transparent text-slate-400"
                }`}
              >
                3. Stage Final Quiz
              </button>
            </div>

            {/* Studio Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* ── STEP 1: Badge Milestone ── */}
              {studioStep === 1 && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Stage Badge Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formBadgeName}
                      onChange={(e) => setFormBadgeName(e.target.value)}
                      placeholder="e.g., Adventure Explorer Badge"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Badge Art Type</label>
                      <select
                        value={formBadgeType}
                        onChange={(e) => setFormBadgeType(e.target.value as BadgeType)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="star">⭐ Star Badge</option>
                        <option value="ribbon">🎗️ Ribbon Badge</option>
                        <option value="medal">🏅 Medal Accolade</option>
                      </select>
                    </div>

                    {formBadgeType === "medal" && (
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Medal Tier</label>
                        <select
                          value={formMedalType}
                          onChange={(e) => setFormMedalType(e.target.value as "bronze" | "silver" | "gold")}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                        >
                          <option value="bronze">🥉 Bronze Medal</option>
                          <option value="silver">🥈 Silver Medal</option>
                          <option value="gold">🥇 Gold Medal</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Target Section Access</label>
                      <select
                        value={formSection}
                        onChange={(e) => setFormSection(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="all">School-Wide (All Sections)</option>
                        {teacherSections.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Passing Score (%): {formPassingScore}%
                      </label>
                      <input
                        type="range"
                        min="60"
                        max="100"
                        step="5"
                        value={formPassingScore}
                        onChange={(e) => setFormPassingScore(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">XP Reward</label>
                      <input
                        type="number"
                        value={formXpReward}
                        onChange={(e) => setFormXpReward(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Stage Description</label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Brief summary of what pupils will learn in this stage..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* ── STEP 2: Story Lessons & Quizzes (Max 3) ── */}
              {studioStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {formLessons.map((l, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveLessonTab(idx)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeLessonTab === idx
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Story {idx + 1}
                        </button>
                      ))}
                    </div>

                    {formLessons.length < 3 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddLessonSlot}
                        className="h-8 px-3 rounded-xl border-dashed border-blue-300 text-blue-600 text-xs font-bold hover:bg-blue-50"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>Add Story {formLessons.length + 1}</span>
                      </Button>
                    )}
                  </div>

                  {formLessons[activeLessonTab] && (
                    <div className="space-y-5 p-5 rounded-2xl border border-slate-200 bg-slate-50/40">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900">
                          Story #{activeLessonTab + 1} Configuration
                        </h3>
                        {formLessons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLessonSlot(activeLessonTab)}
                            className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            Remove This Story
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Story Title</label>
                          <input
                            type="text"
                            value={formLessons[activeLessonTab].lesson_title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormLessons((prev) =>
                                prev.map((item, i) => (i === activeLessonTab ? { ...item, lesson_title: val } : item))
                              );
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Reading Difficulty</label>
                          <select
                            value={formLessons[activeLessonTab].difficulty_level}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setFormLessons((prev) =>
                                prev.map((item, i) => (i === activeLessonTab ? { ...item, difficulty_level: val } : item))
                              );
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none"
                          >
                            <option value="easy">Easy (Grade 3 Starter)</option>
                            <option value="medium">Medium (Standard)</option>
                            <option value="hard">Hard (Advanced)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Story Passage Sentences (1 sentence per line)
                        </label>
                        <textarea
                          rows={4}
                          value={formLessons[activeLessonTab].story_content}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormLessons((prev) =>
                              prev.map((item, i) => (i === activeLessonTab ? { ...item, story_content: val } : item))
                            );
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white outline-none font-serif leading-relaxed"
                        />
                      </div>

                      {/* 5 Lesson Quiz Questions */}
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                          Story #{activeLessonTab + 1} Comprehension Quiz Questions (5 Questions)
                        </span>

                        {formLessons[activeLessonTab].questions.map((q, qIdx) => (
                          <div key={qIdx} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                            <label className="font-bold text-slate-800 block">
                              Question {qIdx + 1} Text
                            </label>
                            <input
                              type="text"
                              value={q.question_text}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormLessons((prev) =>
                                  prev.map((item, i) =>
                                    i === activeLessonTab
                                      ? {
                                          ...item,
                                          questions: item.questions.map((quest, qi) =>
                                            qi === qIdx ? { ...quest, question_text: val } : quest
                                          ),
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 outline-none"
                            />

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              {q.choices.map((c, cIdx) => (
                                <div key={cIdx} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                  <input
                                    type="radio"
                                    name={`lesson-${activeLessonTab}-q-${qIdx}`}
                                    checked={c.is_correct}
                                    onChange={() => {
                                      setFormLessons((prev) =>
                                        prev.map((item, i) =>
                                          i === activeLessonTab
                                            ? {
                                                ...item,
                                                questions: item.questions.map((quest, qi) =>
                                                  qi === qIdx
                                                    ? {
                                                        ...quest,
                                                        choices: quest.choices.map((ch, ci) => ({
                                                          ...ch,
                                                          is_correct: ci === cIdx,
                                                        })),
                                                      }
                                                    : quest
                                                ),
                                              }
                                            : item
                                        )
                                      );
                                    }}
                                  />
                                  <span className="font-bold text-slate-500">{c.choice_letter}:</span>
                                  <input
                                    type="text"
                                    value={c.choice_text}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormLessons((prev) =>
                                        prev.map((item, i) =>
                                          i === activeLessonTab
                                            ? {
                                                ...item,
                                                questions: item.questions.map((quest, qi) =>
                                                  qi === qIdx
                                                    ? {
                                                        ...quest,
                                                        choices: quest.choices.map((ch, ci) =>
                                                          ci === cIdx ? { ...ch, choice_text: val } : ch
                                                        ),
                                                      }
                                                    : quest
                                                ),
                                              }
                                            : item
                                        )
                                      );
                                    }}
                                    className="w-full bg-transparent border-b border-slate-200 text-[11px] text-slate-800 outline-none"
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
              )}

              {/* ── STEP 3: Stage Final Milestone Quiz ── */}
              {studioStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-semibold">
                    🎓 This comprehensive exam tests pupils across all 3 stories to award the official stage badge!
                  </div>

                  {formFinalQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                      <label className="font-bold text-slate-900 block">
                        Final Mastery Question {qIdx + 1}
                      </label>
                      <input
                        type="text"
                        value={q.question_text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormFinalQuestions((prev) =>
                            prev.map((item, i) => (i === qIdx ? { ...item, question_text: val } : item))
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.choices.map((c, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100">
                            <input
                              type="radio"
                              name={`final-q-${qIdx}`}
                              checked={c.is_correct}
                              onChange={() => {
                                setFormFinalQuestions((prev) =>
                                  prev.map((item, i) =>
                                    i === qIdx
                                      ? {
                                          ...item,
                                          choices: item.choices.map((ch, ci) => ({
                                            ...ch,
                                            is_correct: ci === cIdx,
                                          })),
                                        }
                                      : item
                                  )
                                );
                              }}
                            />
                            <span className="font-bold text-slate-600">{c.choice_letter}:</span>
                            <input
                              type="text"
                              value={c.choice_text}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormFinalQuestions((prev) =>
                                  prev.map((item, i) =>
                                    i === qIdx
                                      ? {
                                          ...item,
                                          choices: item.choices.map((ch, ci) =>
                                            ci === cIdx ? { ...ch, choice_text: val } : ch
                                          ),
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="w-full border-b border-slate-200 text-xs text-slate-800 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Studio Footer Navigation */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              {studioStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setStudioStep((prev) => (prev - 1) as any)}
                  className="h-10 px-4 rounded-xl text-xs font-bold gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Button>
              ) : (
                <div />
              )}

              {studioStep < 3 ? (
                <Button
                  onClick={() => setStudioStep((prev) => (prev + 1) as any)}
                  className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-md"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSaveStageCurriculum}
                  disabled={saving}
                  className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  {saving ? "Saving All Curriculum..." : "Save Stage Badge & Curriculum 🎉"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
