"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Map,
  Sparkles,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic } from "@/components/badge-graphic";
import { VocabularyHighlightedText } from "@/components/vocabulary-tooltip";
import {
  fetchLessonsForStudent,
  fetchLessonDetails,
  fetchBadgesFromSupabase,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import { soundEffects } from "@/utils/sound-effects";
import type { Lesson, LessonPage, VocabularyWord, Badge } from "@/lib/types";

function LessonReaderContent() {
  const searchParams = useSearchParams();
  const requestedLessonId = searchParams.get("lessonId")
    ? Number(searchParams.get("lessonId"))
    : null;

  const [publishedLessons, setPublishedLessons] = useState<Lesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number>(requestedLessonId || 1);
  const [pages, setPages] = useState<LessonPage[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);
  const [isPlayingFullAudio, setIsPlayingFullAudio] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [pageFlipDirection, setPageFlipDirection] = useState<"forward" | "backward" | null>(null);

  useEffect(() => {
    const user = getCurrentUser();

    async function loadLessons() {
      setLoading(true);
      const studentSection = user?.section || "Grade 3-A";
      const [liveBadges, lessons] = await Promise.all([
        fetchBadgesFromSupabase(studentSection),
        fetchLessonsForStudent(studentSection),
      ]);

      setBadges(liveBadges);
      setPublishedLessons(lessons);

      const targetId = requestedLessonId || (lessons.length > 0 ? lessons[0].lesson_id : 1);
      setSelectedLessonId(targetId);

      const details = await fetchLessonDetails(targetId);
      setPages(details.pages);
      setVocabulary(details.vocabulary);
      setLoading(false);
    }
    loadLessons();
  }, [requestedLessonId]);

  const activeLesson =
    publishedLessons.find((l) => l.lesson_id === selectedLessonId) ||
    publishedLessons[0] || {
      lesson_id: 1,
      badge_id: 1,
      lesson_title: "Loading Story...",
      lesson_description: "Reading module loading from database.",
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

  const currentPage = displayPages[currentPageIndex] || displayPages[0];
  const totalPages = displayPages.length;
  const isLastPage = currentPageIndex === totalPages - 1;

  // Split content into clean paragraphs and sentences
  const paragraphs = useMemo(() => {
    if (!currentPage.content) return [];
    return currentPage.content.split(/\n\n+/).filter((p) => p.trim().length > 0);
  }, [currentPage.content]);

  // Extract all sentences for linear text-to-speech tracking
  const allSentences = useMemo(() => {
    if (!currentPage.content) return [];
    const lines: string[] = [];
    const rawParagraphs = currentPage.content.split(/\n+/);
    for (const p of rawParagraphs) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      const splitSentences = trimmed.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g);
      if (splitSentences) {
        for (const s of splitSentences) {
          const sTrim = s.trim();
          if (sTrim) lines.push(sTrim);
        }
      } else {
        lines.push(trimmed);
      }
    }
    return lines;
  }, [currentPage.content]);

  // Read single sentence aloud
  const speakSentence = (sentenceText: string, index: number) => {
    setActiveSentenceIndex(index);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentenceText);
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      utterance.onend = () => {
        // preserve sentence focus
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  // Read entire page aloud sentence by sentence
  const toggleFullAudio = () => {
    if (isPlayingFullAudio) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingFullAudio(false);
      setActiveSentenceIndex(null);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsPlayingFullAudio(true);

        let sIdx = 0;
        const playNext = () => {
          if (sIdx >= allSentences.length) {
            setIsPlayingFullAudio(false);
            setActiveSentenceIndex(null);
            return;
          }
          setActiveSentenceIndex(sIdx);
          const utterance = new SpeechSynthesisUtterance(allSentences[sIdx]);
          utterance.rate = 0.85;
          utterance.pitch = 1.05;
          utterance.onend = () => {
            sIdx++;
            playNext();
          };
          window.speechSynthesis.speak(utterance);
        };
        playNext();
      }
    }
  };

  // Navigate Page with 3D Page Turn Animation and Sound
  const handlePageChange = (newIndex: number, direction: "forward" | "backward") => {
    if (newIndex < 0 || newIndex >= totalPages) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingFullAudio(false);
    setActiveSentenceIndex(null);

    soundEffects.playPageTurn();
    setPageFlipDirection(direction);
    setTimeout(() => {
      setCurrentPageIndex(newIndex);
    }, 280);
    setTimeout(() => {
      setPageFlipDirection(null);
    }, 600);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Opening Story Passage...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* ── 1. Top Navigation Bar (Non-clickable trail + Back to Storybook button) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span className="text-blue-600 font-bold flex items-center gap-1">
              <Map className="w-3.5 h-3.5" />
              <span>Living Storybook</span>
            </span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-bold">{assignedBadge?.badge_name || "Stage"}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-500 font-medium">{activeLesson.lesson_title}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
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
          <p className="text-xs text-slate-500 mt-0.5">{activeLesson.lesson_description}</p>
        </div>

        {/* Exit Button */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard/badges">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
            >
              <Map className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              <span>Back to Storybook</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. Authentic 2-Page Open Storybook / Notebook Spread ────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-2.5 sm:p-5 rounded-3xl shadow-2xl border-4 border-amber-300/40 relative overflow-hidden book-perspective">
        {/* Subtle Outer Cover Texture & Edge Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-300/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-300/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-300/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-300/60 rounded-br-sm pointer-events-none" />

        {/* 2-Page Paper Spread Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden bg-[#fffefb] border border-amber-200/90 shadow-inner relative">
          {/* Central Book Spine Crease Shadow (Desktop) */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-amber-900/10 via-amber-950/20 to-amber-900/10 pointer-events-none z-20 hidden lg:block shadow-inner" />

          {/* ══════════════════════════════════════════════════════════════════
              LEFT PAGE: Story Illustration & Chapter Art Plate
              ══════════════════════════════════════════════════════════════════ */}
          <div
            className={`p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-amber-200/70 bg-[#fffdfa] relative transition-all ${
              pageFlipDirection === "backward" ? "leaf-flip-backward" : ""
            }`}
          >
            {/* Left Page Header: Stage Seal & Story Title */}
            <div>
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
                  Story Passage
                </span>
              </div>

              {/* Framed Story Illustration Photo */}
              {currentPage.image_url ? (
                <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden bg-slate-100 border-2 border-amber-200/80 shadow-md group">
                  <img
                    src={currentPage.image_url}
                    alt={currentPage.page_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-xs font-bold drop-shadow-sm">
                      {currentPage.page_title}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-56 sm:h-72 rounded-2xl bg-amber-50/60 border-2 border-dashed border-amber-200 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <BookOpen className="w-10 h-10 text-amber-300" />
                  <span className="text-xs font-medium">Reading Illustration</span>
                </div>
              )}
            </div>

            {/* Left Page Footer: Voice Audio Narration Controller */}
            <div className="mt-4 pt-4 border-t border-amber-200/60 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullAudio}
                className={`h-9 px-3.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                  isPlayingFullAudio
                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 animate-pulse"
                    : "bg-white text-slate-700 border-amber-200/90 hover:bg-amber-50"
                }`}
              >
                {isPlayingFullAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                    <span>Stop Reading</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    <span>Read Aloud (Voice)</span>
                  </>
                )}
              </Button>

              <span className="text-[11px] font-bold text-slate-400">
                Page {currentPageIndex + 1}
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT PAGE: Story Prose & Progress Action
              ══════════════════════════════════════════════════════════════════ */}
          <div
            className={`p-6 sm:p-8 flex flex-col justify-between bg-[#fffefb] relative transition-all ${
              pageFlipDirection === "forward" ? "leaf-flip-forward" : ""
            }`}
          >
            {/* Right Page Header: Title & Instructions */}
            <div>
              <div className="pb-3 border-b border-amber-200/60 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    {currentPage.page_title}
                  </h2>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    Page {currentPageIndex + 1} of {totalPages}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Tap highlighted words for definitions · Tap paragraphs to listen
                </span>
              </div>

              {/* Continuous Flowing Story Paragraphs */}
              <div className="space-y-4 pt-1 pb-4">
                {paragraphs.map((paraText, pIdx) => {
                  const isDialogue = paraText.trim().startsWith('"');
                  const isSpeakingThis = activeSentenceIndex === pIdx;

                  return (
                    <div
                      key={pIdx}
                      onClick={() => speakSentence(paraText, pIdx)}
                      className={`relative transition-all duration-300 rounded-xl cursor-pointer p-2 -mx-2 hover:bg-blue-50/40 ${
                        isSpeakingThis
                          ? "bg-blue-50/90 ring-2 ring-blue-400/30 shadow-xs"
                          : ""
                      } ${
                        isDialogue
                          ? "pl-3.5 border-l-3 border-l-blue-500 bg-blue-50/20 py-1.5 rounded-r-xl"
                          : ""
                      }`}
                      title="Tap paragraph to read aloud"
                    >
                      <p className="text-sm sm:text-base leading-relaxed sm:leading-loose text-slate-800 font-normal tracking-normal text-justify sm:text-left">
                        <VocabularyHighlightedText
                          text={paraText}
                          vocabularyList={vocabulary}
                        />
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Page Footer: Page Turn / Quiz Handoff Action Buttons */}
            <div className="mt-4 pt-4 border-t border-amber-200/60 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPageIndex - 1, "backward")}
                disabled={currentPageIndex === 0}
                className="h-10 px-4 rounded-xl text-xs font-bold border-amber-200/80 bg-white hover:bg-amber-50/50 shadow-2xs transition-all disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Prev Page</span>
              </Button>

              {!isLastPage ? (
                <Button
                  onClick={() => handlePageChange(currentPageIndex + 1, "forward")}
                  className="h-10 px-5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all"
                >
                  <span>Turn Page</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              ) : (
                <Link href={`/dashboard/quiz?lessonId=${activeLesson.lesson_id}`}>
                  <Button className="h-10 px-5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 flex items-center gap-1.5 transition-all animate-bounce">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Take Comprehension Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Opening Story Module...</p>
        </div>
      }
    >
      <LessonReaderContent />
    </Suspense>
  );
}
