"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Map,
  Sparkles,
  Award,
  Lock,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VocabularyHighlightedText } from "@/components/vocabulary-tooltip";
import {
  fetchLessonsForStudent,
  fetchLessonDetails,
  fetchBadgesFromSupabase,
  fetchStudentBadgeProgress,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import { soundEffects } from "@/utils/sound-effects";
import { speakSentenceWithVoice } from "@/utils/voice-settings";
import { getSentenceVisualCues } from "@/utils/lesson-visual-data";
import { LessonReaderSkeleton } from "@/components/page-skeletons";
import type { Lesson, LessonPage, VocabularyWord, Badge, StudentBadgeProgress, SentenceVisualCue } from "@/lib/types";

interface StorySlide {
  slideId: string;
  slideIndex: number;
  pageNumber: number;
  sentences: string[];
  paragraphText: string;
  speaker: string;
  speakerAvatar: string;
  actionTag: string;
  sceneTitle: string;
  sceneImageUrl: string;
}

function LessonReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedLessonId = searchParams.get("lessonId")
    ? Number(searchParams.get("lessonId"))
    : null;

  const [publishedLessons, setPublishedLessons] = useState<Lesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<StudentBadgeProgress[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number>(requestedLessonId || 1);
  const [pages, setPages] = useState<LessonPage[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [pageFlipDirection, setPageFlipDirection] = useState<"forward" | "backward" | null>(null);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  useEffect(() => {
    async function loadLessons() {
      setLoading(true);
      const user = getCurrentUser();

      // Sync fresh profile from Supabase to ensure teacherId is available
      if (user?.id) {
        try {
          const { createClient } = await import("@/utils/supabase/client");
          const supabase = createClient();
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          if (prof) {
            user.section = prof.section || user.section || "Unassigned";
            user.teacherId = prof.teacher_id;
            user.fullName = prof.full_name || user.fullName;
            const { setCurrentUserSession } = await import("@/utils/auth-helpers");
            setCurrentUserSession(user);
          }
        } catch {
          // ignore sync errors
        }
      }

      const studentSection = user?.section || "Grade 3-A";
      const teacherId = user?.teacherId || null;
      const [liveBadges, lessons, liveProgress] = await Promise.all([
        fetchBadgesFromSupabase(studentSection, teacherId),
        fetchLessonsForStudent(studentSection, teacherId),
        user?.id ? fetchStudentBadgeProgress(user.id) : Promise.resolve([]),
      ]);

      setBadges(liveBadges);
      setPublishedLessons(lessons);
      setBadgeProgress(liveProgress);

      const targetId = requestedLessonId || (lessons.length > 0 ? lessons[0].lesson_id : 1);
      setSelectedLessonId(targetId);

      const details = await fetchLessonDetails(targetId);
      setPages(details.pages);
      setVocabulary(details.vocabulary);
      setCurrentSlideIndex(0);
      setLoading(false);
    }
    loadLessons();
  }, [requestedLessonId]);

  const activeLesson =
    publishedLessons.find((l) => l.lesson_id === selectedLessonId) ||
    publishedLessons[0] || {
      lesson_id: 1,
      badge_id: 1,
      lesson_title: "The New Classmate",
      lesson_description: "A heartwarming story about welcoming a new friend.",
      lesson_order: 1,
      difficulty_level: "easy" as const,
      passing_score: 70,
      status: "published" as const,
      target_section: "all",
    };

  const assignedBadge = badges.find((b) => b.badge_id === activeLesson.badge_id);

  const displayPages = pages.length > 0 ? pages : [
    {
      page_id: 1,
      lesson_id: activeLesson.lesson_id,
      page_number: 1,
      page_title: "Story Passage",
      content: "Opening reading passage from classroom library...",
      image_url: "/images/stories/lesson1_new_classmate.jpg",
      audio_url: "",
    },
  ];

  // Group story sentences into 3-sentence chunks per page for Grade 3 reading flow
  const allSlides: StorySlide[] = useMemo(() => {
    const allCues: SentenceVisualCue[] = [];

    for (const page of displayPages) {
      const cues = getSentenceVisualCues(
        selectedLessonId,
        page.page_number,
        page.content,
        page.image_url || undefined
      );

      if (cues && cues.length > 0) {
        allCues.push(...cues);
      } else if (page.content) {
        // Defensive fallback: split raw text into clean sentences if cues unavailable
        const rawSentences = page.content
          .split(/(?<=[.?!])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 3);

        rawSentences.forEach((sentence, sIdx) => {
          allCues.push({
            sentence_id: `${selectedLessonId}-${page.page_number}-${sIdx + 1}`,
            lesson_id: selectedLessonId,
            page_number: page.page_number,
            sentence_text: sentence,
            speaker: "Story Narrator",
            speaker_avatar: "📖",
            scene_title: `Story Part ${sIdx + 1}`,
            scene_image_url: page.image_url || "/images/stories/lesson1_new_classmate.jpg",
            action_tag: "📖 Reading",
            cue_color: "blue",
          });
        });
      }
    }

    const CHUNK_SIZE = 3;
    const slides: StorySlide[] = [];
    let slideCount = 0;

    for (let i = 0; i < allCues.length; i += CHUNK_SIZE) {
      const chunk = allCues.slice(i, i + CHUNK_SIZE);
      const sentences = chunk.map((c) => c.sentence_text);
      const paragraphText = sentences.join(" ");
      const leadCue = chunk[0];

      slides.push({
        slideId: `page-${slideCount + 1}`,
        slideIndex: slideCount,
        pageNumber: slideCount + 1,
        sentences,
        paragraphText,
        speaker: leadCue.speaker || "Story Narrator",
        speakerAvatar: leadCue.speaker_avatar || "📖",
        actionTag: leadCue.action_tag || "📖 Story Reading",
        sceneTitle: leadCue.scene_title || `Story Page ${slideCount + 1}`,
        sceneImageUrl: leadCue.scene_image_url || displayPages[0]?.image_url || "/images/stories/lesson1_new_classmate.jpg",
      });
      slideCount++;
    }

    // Graceful fallback if no cues or sentences generated
    if (slides.length === 0) {
      const fallbackContent = displayPages[0]?.content || "Enjoy reading this story.";
      slides.push({
        slideId: "page-1",
        slideIndex: 0,
        pageNumber: 1,
        sentences: [fallbackContent],
        paragraphText: fallbackContent,
        speaker: "Story Narrator",
        speakerAvatar: "📖",
        actionTag: "📖 Reading",
        sceneTitle: "Story Reading",
        sceneImageUrl: displayPages[0]?.image_url || "/images/stories/lesson1_new_classmate.jpg",
      });
    }

    return slides;
  }, [displayPages, selectedLessonId]);

  const totalSlides = allSlides.length;
  const safeSlideIndex = Math.min(currentSlideIndex, Math.max(0, totalSlides - 1));
  const currentSlide = allSlides[safeSlideIndex] || allSlides[0];
  const isLastSlide = safeSlideIndex === totalSlides - 1;
  const progressPercent = Math.round(((safeSlideIndex + 1) / totalSlides) * 100);

  // Split paragraph into distinct sentences for clean, spaced sentence-by-sentence reading
  const sentencesToDisplay = useMemo(() => {
    if (currentSlide.sentences && currentSlide.sentences.length > 1) {
      return currentSlide.sentences;
    }
    if (currentSlide.sentences && currentSlide.sentences.length === 1) {
      const matched = currentSlide.sentences[0].match(/[^.!?]+[.!?]+(\s|$)/g);
      if (matched && matched.length > 1) {
        return matched.map((s) => s.trim());
      }
      return currentSlide.sentences;
    }
    const matched = (currentSlide.paragraphText || "").match(/[^.!?]+[.!?]+(\s|$)/g);
    if (matched && matched.length > 1) {
      return matched.map((s) => s.trim());
    }
    return [currentSlide.paragraphText];
  }, [currentSlide]);

  // Speak active paragraph/page aloud (toggles pause/cancel if already playing)
  const speakCurrentParagraph = () => {
    if (isPlayingAudio) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    speakSentenceWithVoice(
      currentSlide.paragraphText,
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const handleSlideChange = (newIndex: number, direction: "forward" | "backward") => {
    if (newIndex < 0 || newIndex >= totalSlides) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setPageFlipDirection(direction);
    soundEffects.play("pageFlip");

    setTimeout(() => {
      setCurrentSlideIndex(newIndex);
      setPageFlipDirection(null);
    }, 180);
  };

  // Check stage milestone locking (Custom teacher quests are ALWAYS unlocked)
  const isLessonLocked = useMemo(() => {
    if (!activeLesson.badge_id) return false;

    // Find the badge associated with this lesson
    const currentBadge = badges.find(
      (b) => Number(b.badge_id) === Number(activeLesson.badge_id)
    );

    // Custom teacher quests are NEVER locked behind default DepEd curriculum stages!
    if (currentBadge?.teacher_id || activeLesson.teacher_id) {
      return false;
    }

    // Default DepEd Stage 1 is always unlocked
    if (currentBadge?.badge_order === 1 || Number(activeLesson.badge_id) === 1) {
      return false;
    }

    // If this lesson's badge is already in_progress or completed or earned, it is NOT locked!
    const curProg = badgeProgress.find(
      (p) => Number(p.badge_id) === Number(currentBadge?.badge_id || activeLesson.badge_id)
    );
    if (
      curProg?.status === "completed" ||
      curProg?.status === "in_progress" ||
      Boolean(curProg?.earned_date) ||
      (curProg?.completion_percentage || 0) > 0
    ) {
      return false;
    }

    // For default DepEd badges 2..5, check previous DepEd stage (order - 1)
    const prevBadge = badges.find(
      (b) => !b.teacher_id && b.badge_order === (currentBadge?.badge_order || 2) - 1
    );
    if (!prevBadge) return false;

    const prevProg = badgeProgress.find(
      (p) => Number(p.badge_id) === Number(prevBadge.badge_id)
    );
    if (!prevProg) return true;
    const isPrevDone =
      prevProg.status === "completed" ||
      Boolean(prevProg.earned_date) ||
      (prevProg.completion_percentage || 0) >= 100;
    return !isPrevDone;
  }, [activeLesson.badge_id, activeLesson.teacher_id, badges, badgeProgress]);

  if (loading) {
    return <LessonReaderSkeleton />;
  }

  if (isLessonLocked) {
    const currentBadge = badges.find(
      (b) => Number(b.badge_id) === Number(activeLesson.badge_id)
    );
    const reqBadge = badges.find(
      (b) => !b.teacher_id && b.badge_order === (currentBadge?.badge_order || 2) - 1
    );
    const reqStageNum = reqBadge?.badge_order || (currentBadge?.badge_order ? currentBadge.badge_order - 1 : 1);

    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="dashboard-card p-8 text-center space-y-5 border-2 border-amber-200 bg-gradient-to-b from-amber-50/40 to-white shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto text-amber-700 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
              Stage Milestone Locked
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Complete Stage {reqStageNum} Mastery First!
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              To read <strong>{activeLesson.lesson_title}</strong>, you must first pass the Stage Final Assessment for{" "}
              <strong>{reqBadge?.badge_name || `Stage ${reqStageNum} Badge`}</strong>.
            </p>
          </div>

          <Link href="/dashboard/badges">
            <Button className="h-10 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md">
              <Map className="w-4 h-4 mr-2" />
              <span>Go to Storybook Pathway</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Page flip animation classes (Mobile: both flip together; Desktop: open-book individual flip)
  const leftPageFlipClass =
    pageFlipDirection === "forward"
      ? "mobile-leaf-flip-forward"
      : pageFlipDirection === "backward"
      ? "mobile-leaf-flip-backward desktop-leaf-flip-backward"
      : "";

  const rightPageFlipClass =
    pageFlipDirection === "forward"
      ? "mobile-leaf-flip-forward desktop-leaf-flip-forward"
      : pageFlipDirection === "backward"
      ? "mobile-leaf-flip-backward"
      : "";

  return (
    <div className="h-full min-h-0 flex flex-col justify-between w-full max-w-full mx-auto gap-2 sm:gap-3 py-0.5 sm:py-1">
      {/* ── 1. Clean, Organized Top Header ── */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-3 py-2 sm:px-6 sm:py-2.5 rounded-2xl border border-slate-200/80 shadow-xs shrink-0">
        {/* Left: Story Title + Difficulty Tag */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 mr-1">
          <h1
            className="text-xs sm:text-base md:text-xl font-black text-slate-900 tracking-tight truncate"
            title={activeLesson.lesson_title}
          >
            {activeLesson.lesson_title}
          </h1>
          <span
            className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wider ${
              activeLesson.difficulty_level === "easy"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : activeLesson.difficulty_level === "medium"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-purple-50 text-purple-700 border-purple-200"
            }`}
          >
            {activeLesson.difficulty_level || "EASY"}
          </span>
        </div>

        {/* Right: Story Page Progress + Clean Exit Button */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-700">
              <span className="hidden sm:inline text-slate-400">Page</span>
              <span className="font-extrabold text-slate-900">
                {currentSlideIndex + 1}/{totalSlides}
              </span>
              <span className="text-blue-600 font-bold hidden xs:inline sm:inline">
                ({progressPercent}%)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-14 sm:w-28 md:w-36 h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExitModal(true)}
            className="rounded-xl border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold text-slate-700 bg-white shadow-2xs h-7 sm:h-8 w-7 sm:w-auto px-0 sm:px-3 cursor-pointer flex items-center justify-center gap-1 transition-all shrink-0"
            title="Exit to Storybook Map"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Authentic 2-Page Open Storybook Spread (Immersive Viewport-Fitted Experience) ── */}
      <div className="flex-1 min-h-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-2 sm:p-3.5 lg:p-4 rounded-3xl shadow-2xl border-4 border-amber-300/40 relative overflow-hidden flex flex-col">
        {/* Book Corner Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-300/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-300/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-300/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-300/60 rounded-br-sm pointer-events-none" />

        {/* 2-Page Paper Spread Container (Unified flow on mobile, 2-page spread on desktop) */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 rounded-2xl overflow-hidden bg-[#fffefb] border border-amber-200/90 shadow-inner relative flex-1 min-h-0">
          {/* Central Book Spine Crease Shadow (Desktop only) */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-amber-900/10 via-amber-950/20 to-amber-900/10 pointer-events-none z-20 hidden lg:block shadow-inner" />

          {/* ══════════════════════════════════════════════════════════════════
              LEFT PAGE / TOP (Mobile): Scene Illustration Plate
              ══════════════════════════════════════════════════════════════════ */}
          <div
            className={`p-2.5 sm:p-3.5 lg:p-6 flex flex-col items-center justify-center lg:border-b-0 lg:border-r border-amber-200/70 bg-[#fffdfa] relative transition-all flex-1 min-h-0 ${leftPageFlipClass}`}
          >
            {/* Story Illustration Photo (Size matches the Sentence Box below) */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-100 border-2 border-amber-200/80 shadow-sm flex items-center justify-center group">
              <img
                src={currentSlide.sceneImageUrl}
                alt={currentSlide.sceneTitle}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT PAGE / BOTTOM (Mobile): 3-Sentence Reading Flow & Bottom Stepper
              ══════════════════════════════════════════════════════════════════ */}
          <div
            className={`p-2.5 sm:p-3.5 lg:p-6 flex flex-col justify-between bg-[#fffefb] relative transition-all flex-1 min-h-0 ${rightPageFlipClass}`}
          >
            {/* 3-Sentence Reading Box (Organized sentence-by-sentence with clean spacing) */}
            <div className="flex-1 min-h-0 mb-2 sm:mb-3 p-3.5 sm:p-5 lg:p-7 rounded-2xl bg-amber-50/50 border-2 border-amber-200/80 shadow-sm flex flex-col justify-center overflow-y-auto">
              <div className="space-y-2.5 sm:space-y-3.5 lg:space-y-4">
                {sentencesToDisplay.map((sentence, sIdx) => (
                  <p
                    key={sIdx}
                    className="text-sm sm:text-base md:text-lg lg:text-xl font-serif text-slate-900 leading-relaxed sm:leading-[1.7] font-medium text-left"
                  >
                    <VocabularyHighlightedText
                      text={sentence}
                      vocabularyList={vocabulary}
                    />
                  </p>
                ))}
              </div>
            </div>

            {/* Bottom Story Controls: Prev Page | Elevated Center Hero Speaker (Bank QR-style) | Next Page */}
            <div className="pt-2 sm:pt-3 pb-1 border-t border-amber-200/60 flex items-center justify-between gap-2 shrink-0 relative px-1 sm:px-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSlideChange(currentSlideIndex - 1, "backward")}
                disabled={currentSlideIndex === 0}
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold border-amber-200/80 bg-white hover:bg-amber-50/50 shadow-2xs transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 z-10"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Prev Page</span>
              </Button>

              {/* Central Elevated QR-style Speaker Action (Right under finger/thumb in the middle) */}
              <div className="relative flex items-center justify-center w-14 h-10">
                <button
                  type="button"
                  onClick={speakCurrentParagraph}
                  title={isPlayingAudio ? "Stop reading" : "Read aloud"}
                  aria-label={isPlayingAudio ? "Stop reading aloud" : "Read aloud"}
                  className={`-top-5 sm:-top-6 absolute left-1/2 -translate-x-1/2 w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-4 border-[#fffefb] cursor-pointer select-none transition-all duration-300 active:scale-90 z-20 ${
                    isPlayingAudio
                      ? "bg-gradient-to-tr from-rose-500 via-rose-600 to-pink-500 text-white shadow-[0_8px_20px_rgba(244,63,94,0.45)] ring-4 ring-rose-200/70 animate-pulse scale-105"
                      : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white shadow-[0_8px_20px_rgba(37,99,235,0.4)] hover:scale-105"
                  }`}
                >
                  {isPlayingAudio ? (
                    <VolumeX className="w-6 h-6 stroke-[2.4]" />
                  ) : (
                    <Volume2 className="w-6 h-6 stroke-[2.4]" />
                  )}
                </button>
              </div>

              {!isLastSlide ? (
                <Button
                  onClick={() => handleSlideChange(currentSlideIndex + 1, "forward")}
                  className="h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer z-10"
                >
                  <span>Next Page</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              ) : (
                <Link href={`/dashboard/quiz?lessonId=${activeLesson.lesson_id}&badgeId=${activeLesson.badge_id}`}>
                  <Button className="h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 flex items-center gap-1.5 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer z-10">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Take Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Friendly Exit Confirmation Warning Modal ── */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200/80 space-y-5 text-center relative">
            <button
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Map className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Leaving Story
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Exit to Storybook Map?
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                You are currently reading <strong>Page {currentSlideIndex + 1} of {totalSlides}</strong> in <em>{activeLesson.lesson_title}</em>. Would you like to keep reading or exit to the map?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setShowExitModal(false);
                  router.push("/dashboard/badges");
                }}
                className="w-full sm:w-auto h-10 px-5 rounded-xl border-slate-200 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer"
              >
                <span>Yes, Exit to Map</span>
              </Button>
              <Button
                onClick={() => setShowExitModal(false)}
                className="w-full sm:w-auto h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Keep Reading</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={<LessonReaderSkeleton />}>
      <LessonReaderContent />
    </Suspense>
  );
}
