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
  BookOpen,
  Map,
  Sparkles,
  Award,
  Lock,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic } from "@/components/badge-graphic";
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
  sentenceText: string;
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
    const user = getCurrentUser();

    async function loadLessons() {
      setLoading(true);
      const studentSection = user?.section || "Grade 3-A";
      const [liveBadges, lessons, liveProgress] = await Promise.all([
        fetchBadgesFromSupabase(studentSection),
        fetchLessonsForStudent(studentSection),
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

  // Flatten all pages into clean 1-sentence-per-page slides
  const allSlides: StorySlide[] = useMemo(() => {
    const slides: StorySlide[] = [];
    let globalIndex = 0;

    for (const page of displayPages) {
      const cues = getSentenceVisualCues(
        selectedLessonId,
        page.page_number,
        page.content,
        page.image_url || undefined
      );

      for (const cue of cues) {
        slides.push({
          slideId: cue.sentence_id,
          slideIndex: globalIndex,
          pageNumber: page.page_number,
          sentenceText: cue.sentence_text,
          speaker: cue.speaker,
          speakerAvatar: cue.speaker_avatar,
          actionTag: cue.action_tag,
          sceneTitle: cue.scene_title,
          sceneImageUrl: cue.scene_image_url || page.image_url || "/images/stories/lesson1_new_classmate.jpg",
        });
        globalIndex++;
      }
    }

    // Graceful fallback if no cues generated
    if (slides.length === 0) {
      slides.push({
        slideId: "default-1",
        slideIndex: 0,
        pageNumber: 1,
        sentenceText: displayPages[0]?.content || "Enjoy reading this story.",
        speaker: "Narrator",
        speakerAvatar: "📖",
        actionTag: "Story Reading",
        sceneTitle: "Reading Time",
        sceneImageUrl: displayPages[0]?.image_url || "/images/stories/lesson1_new_classmate.jpg",
      });
    }

    return slides;
  }, [displayPages, selectedLessonId]);

  const totalSlides = allSlides.length;
  const currentSlide = allSlides[currentSlideIndex] || allSlides[0];
  const isLastSlide = currentSlideIndex === totalSlides - 1;
  const progressPercent = Math.round(((currentSlideIndex + 1) / totalSlides) * 100);

  // Speak single active sentence aloud
  const speakCurrentSentence = () => {
    setIsPlayingAudio(true);
    speakSentenceWithVoice(
      currentSlide.sentenceText,
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

  // Check stage milestone locking
  const isLessonLocked = useMemo(() => {
    if (!activeLesson.badge_id || activeLesson.badge_id === 1) return false;
    const prevBadgeId = activeLesson.badge_id - 1;
    const prevProg = badgeProgress.find((p) => p.badge_id === prevBadgeId);
    if (!prevProg) return true;
    return prevProg.status !== "completed" && (prevProg.completion_percentage || 0) < 100;
  }, [activeLesson.badge_id, badgeProgress]);

  if (loading) {
    return <LessonReaderSkeleton />;
  }

  if (isLessonLocked) {
    const reqBadgeId = (activeLesson.badge_id || 2) - 1;
    const reqBadge = badges.find((b) => b.badge_id === reqBadgeId);

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
              Complete Stage {reqBadgeId} Mastery First!
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              To read <strong>{activeLesson.lesson_title}</strong>, you must first pass the Stage Final Assessment for{" "}
              <strong>{reqBadge?.badge_name || `Stage ${reqBadgeId} Badge`}</strong>.
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

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* ── 1. Top Navigation & Story Progress Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-0.5">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors group cursor-pointer"
            >
              <Map className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-amber-600" />
              <span className="underline decoration-blue-200 underline-offset-2">Storybook Map</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer"
            >
              {assignedBadge?.badge_name || "Stage"}
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-500 font-medium">{activeLesson.lesson_title}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {activeLesson.lesson_title}
            </h1>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                activeLesson.difficulty_level === "easy"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : activeLesson.difficulty_level === "medium"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              }`}
            >
              {activeLesson.difficulty_level.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Progress Pill + Exit Map Button */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Sentence {currentSlideIndex + 1} of {totalSlides}
              </span>
              <span className="text-slate-400 font-medium">({progressPercent}%)</span>
            </div>
            {/* Progress Bar */}
            <div className="w-32 sm:w-40 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
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
            className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs h-9 px-3 cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 mr-1 text-amber-600" />
            <span>Map</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Authentic 2-Page Open Storybook Spread (Clean 1-Sentence Per Page) ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-2.5 sm:p-5 rounded-3xl shadow-2xl border-4 border-amber-300/40 relative overflow-hidden book-perspective">
        {/* Book Corner Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-300/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-300/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-300/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-300/60 rounded-br-sm pointer-events-none" />

        {/* 2-Page Paper Spread Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden bg-[#fffefb] border border-amber-200/90 shadow-inner relative min-h-[460px] sm:min-h-[520px]">
          {/* Central Book Spine Crease Shadow */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-amber-900/10 via-amber-950/20 to-amber-900/10 pointer-events-none z-20 hidden lg:block shadow-inner" />

          {/* ══════════════════════════════════════════════════════════════════
              LEFT PAGE: Sentence Scene Illustration Plate
              ══════════════════════════════════════════════════════════════════ */}
          <div
            className={`p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-amber-200/70 bg-[#fffdfa] relative transition-all ${
              pageFlipDirection === "backward" ? "leaf-flip-backward" : ""
            }`}
          >
            <div>
              {/* Left Page Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-4">
                {assignedBadge ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/80">
                    <BadgeGraphic
                      type={assignedBadge.badge_type}
                      medalType={assignedBadge.badge_type === "medal" ? assignedBadge.medal_type : undefined}
                      size="xs"
                      status="completed"
                    />
                    <span className="text-[11px]">{assignedBadge.badge_name}</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-amber-800">Chapter Story</span>
                )}

                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Page {currentSlide.pageNumber}
                </span>
              </div>

              {/* Clean Framed Story Illustration Photo (No Overlaid Badges) */}
              <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden bg-slate-100 border-2 border-amber-200/90 shadow-md group">
                <img
                  src={currentSlide.sceneImageUrl}
                  alt={currentSlide.sceneTitle}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Left Page Footer: Voice Audio Narration Controller */}
            <div className="mt-4 pt-4 border-t border-amber-200/60 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={speakCurrentSentence}
                className={`h-9 px-4 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                  isPlayingAudio
                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 animate-pulse"
                    : "bg-white text-slate-700 border-amber-200/90 hover:bg-amber-50"
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                    <span>Speaking...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    <span>Read Aloud</span>
                  </>
                )}
              </Button>

              <span className="text-[11px] font-bold text-slate-400">
                Scene {currentSlideIndex + 1}
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT PAGE: Single Clean Sentence Reading & Page Stepper
              ══════════════════════════════════════════════════════════════════ */}
          <div
            className={`p-6 sm:p-8 flex flex-col justify-between bg-[#fffefb] relative transition-all ${
              pageFlipDirection === "forward" ? "leaf-flip-forward" : ""
            }`}
          >
            {/* Right Page Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-6">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reading Story</span>
                </span>

                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  Sentence {currentSlideIndex + 1} of {totalSlides}
                </span>
              </div>

              {/* Single Elegant Sentence Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/40 border-2 border-amber-200/70 shadow-xs space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  📖 Tap underlined words for phonics & definitions:
                </span>

                <p className="text-lg sm:text-xl md:text-2xl font-serif text-slate-900 leading-relaxed sm:leading-loose font-medium">
                  <VocabularyHighlightedText
                    text={currentSlide.sentenceText}
                    vocabularyList={vocabulary}
                  />
                </p>
              </div>
            </div>

            {/* Right Page Footer: Previous & Next Page Turn Actions */}
            <div className="mt-6 pt-4 border-t border-amber-200/60 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSlideChange(currentSlideIndex - 1, "backward")}
                disabled={currentSlideIndex === 0}
                className="h-11 px-4 rounded-xl text-xs font-bold border-amber-200/80 bg-white hover:bg-amber-50/50 shadow-2xs transition-all disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Prev Sentence</span>
              </Button>

              {!isLastSlide ? (
                <Button
                  onClick={() => handleSlideChange(currentSlideIndex + 1, "forward")}
                  className="h-11 px-6 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all"
                >
                  <span>Next Sentence</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              ) : (
                <Link href={`/dashboard/quiz?lessonId=${activeLesson.lesson_id}`}>
                  <Button className="h-11 px-6 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 flex items-center gap-1.5 transition-all animate-bounce">
                    <Sparkles className="w-4 h-4" />
                    <span>Finish & Take Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-200 space-y-5 text-center relative anim-pop-bounce">
            <button
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Map className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                Leaving Story
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Exit to Storybook Map?
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                You are currently reading <strong>Sentence {currentSlideIndex + 1} of {totalSlides}</strong> in <em>{activeLesson.lesson_title}</em>. Would you like to keep reading or exit to the map?
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
                className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer"
              >
                <span>Yes, Exit to Map</span>
              </Button>
              <Button
                onClick={() => setShowExitModal(false)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Keep Reading 📖</span>
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
