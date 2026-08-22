"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  BookOpen,
  Map,
  HelpCircle,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic } from "@/components/badge-graphic";
import { VocabularyHighlightedText } from "@/components/vocabulary-tooltip";
import {
  fetchLessonsForStudent,
  fetchLessonDetails,
  fetchBadgesFromSupabase,
} from "@/utils/supabase-queries";
import { getCurrentUser, UserProfile } from "@/utils/auth-helpers";
import type { Lesson, LessonPage, VocabularyWord, Badge } from "@/lib/types";

function LessonReaderContent() {
  const searchParams = useSearchParams();
  const requestedLessonId = searchParams.get("lessonId")
    ? Number(searchParams.get("lessonId"))
    : null;

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [publishedLessons, setPublishedLessons] = useState<Lesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number>(requestedLessonId || 1);
  const [pages, setPages] = useState<LessonPage[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);
  const [isPlayingFullAudio, setIsPlayingFullAudio] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("large");
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user);

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

  // Split content into clean, distinct sentence lines
  const sentences = useMemo(() => {
    if (!currentPage.content) return [];
    
    // Split by newlines first to preserve dialogue structure, then split long paragraphs by sentence ending (. ! ?)
    const lines: string[] = [];
    const paragraphs = currentPage.content.split(/\n+/);
    
    for (const p of paragraphs) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      
      // If it's a quote or short sentence, keep as is
      if (trimmed.startsWith('"') || trimmed.length < 80) {
        lines.push(trimmed);
      } else {
        // Split on sentence boundaries followed by space
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
        // keep highlight
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
          if (sIdx >= sentences.length) {
            setIsPlayingFullAudio(false);
            setActiveSentenceIndex(null);
            return;
          }
          setActiveSentenceIndex(sIdx);
          const utterance = new SpeechSynthesisUtterance(sentences[sIdx]);
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

  const fontClasses = {
    normal: "text-base sm:text-lg leading-relaxed",
    large: "text-lg sm:text-xl leading-loose",
    xlarge: "text-xl sm:text-2xl leading-loose",
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
    <div className={`space-y-6 ${isZenMode ? "max-w-4xl mx-auto" : ""}`}>
      {/* 1. Header & Navigation Trail directly connected to Badge Pathway */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-slate-600">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link
              href="/dashboard/badges"
              className="hover:text-slate-600 flex items-center gap-1 text-blue-600 font-bold"
            >
              <Map className="w-3 h-3" />
              <span>Badge Pathway</span>
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">{assignedBadge?.badge_name || "Stage"}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-500 font-medium">{activeLesson.lesson_title}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsZenMode((prev) => !prev)}
            className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
            title={isZenMode ? "Exit Focus View" : "Enter Focus Reading Mode"}
          >
            {isZenMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>Focus Mode</span>
              </>
            )}
          </Button>

          <Link href="/dashboard/badges">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Pathway
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Reader Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>
              Page {currentPageIndex + 1} of {totalPages}
            </span>
          </div>

          <div className="w-px h-4 bg-slate-200" />

          {/* Text Size Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setFontSize("normal")}
              className={`px-2 py-1 rounded-lg ${
                fontSize === "normal"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "hover:text-slate-900"
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize("large")}
              className={`px-2 py-1 rounded-lg ${
                fontSize === "large"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "hover:text-slate-900"
              }`}
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSize("xlarge")}
              className={`px-2 py-1 rounded-lg ${
                fontSize === "xlarge"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "hover:text-slate-900"
              }`}
            >
              A++
            </button>
          </div>
        </div>

        {/* Audio Narration Toggle */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullAudio}
            className={`h-8 px-3 rounded-xl text-xs font-bold border-slate-200 ${
              isPlayingFullAudio
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "text-slate-700 bg-white"
            }`}
          >
            {isPlayingFullAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                <span>Stop Narration</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>Read Aloud (Voice)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 3. Main Reading Card (Clean Sentence-by-Sentence View) */}
      <div className={`grid grid-cols-1 ${isZenMode ? "gap-6" : "lg:grid-cols-3 gap-6"}`}>
        {/* Story Book Reader */}
        <div className={`dashboard-card p-6 md:p-8 space-y-6 ${isZenMode ? "w-full" : "lg:col-span-2"}`}>
          {/* Card Header with Stage Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200">
                {currentPageIndex + 1}
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {currentPage.page_title}
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">
                  {sentences.length} Sentence Lines · Tap any line or highlighted word
                </span>
              </div>
            </div>
            {assignedBadge && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <BadgeGraphic
                  type={assignedBadge.badge_type}
                  medalType={assignedBadge.medal_type}
                  size="xs"
                  status="completed"
                />
                <span>{assignedBadge.badge_name}</span>
              </div>
            )}
          </div>

          {/* Story Illustration Image Banner */}
          {currentPage.image_url && (
            <div className="relative w-full h-56 sm:h-80 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-2xs group">
              <img
                src={currentPage.image_url}
                alt={currentPage.page_title}
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
              />
            </div>
          )}

          {/* Sentence-by-Sentence Clean Reading Passage */}
          <div className="space-y-3.5 pt-2">
            {sentences.map((sentence, index) => {
              const isActive = activeSentenceIndex === index;
              const isDialogue = sentence.startsWith('"');

              return (
                <div
                  key={index}
                  onClick={() => setActiveSentenceIndex(index)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 group cursor-pointer ${
                    isActive
                      ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20 shadow-xs"
                      : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70 hover:border-slate-300"
                  } ${isDialogue ? "border-l-4 border-l-blue-500 pl-5" : ""}`}
                >
                  <div className="flex-1">
                    <p className={`${fontClasses[fontSize]} text-slate-900 font-medium tracking-normal`}>
                      <VocabularyHighlightedText
                        text={sentence}
                        vocabularyList={vocabulary}
                      />
                    </p>
                  </div>

                  {/* Read Line Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakSentence(sentence, index);
                    }}
                    title="Read this sentence aloud"
                    className={`p-2 rounded-xl border transition-all flex-shrink-0 mt-0.5 ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-slate-400 border-slate-200 opacity-60 group-hover:opacity-100 group-hover:text-blue-600 hover:border-blue-300"
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination & Next Action */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentPageIndex((prev) => Math.max(0, prev - 1));
                setActiveSentenceIndex(null);
              }}
              disabled={currentPageIndex === 0}
              className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Previous Page
            </Button>

            {isLastPage ? (
              <Link href={`/dashboard/quiz?lessonId=${activeLesson.lesson_id}`}>
                <Button className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proceed to Comprehension Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => {
                  setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
                  setActiveSentenceIndex(null);
                }}
                className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
              >
                <span>Next Page</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Right 1 Col: Key Vocabulary Quick Summary (Collapsible in Zen Mode) */}
        {!isZenMode && (
          <div className="space-y-4">
            <div className="dashboard-card p-5">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Story Key Words
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {vocabulary.length} Words
                </span>
              </div>

              <div className="space-y-2.5">
                {vocabulary.map((item) => (
                  <div
                    key={item.word_id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs capitalize flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {item.word}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined" && "speechSynthesis" in window) {
                            const u = new SpeechSynthesisUtterance(item.word);
                            u.rate = 0.85;
                            window.speechSynthesis.speak(u);
                          }
                        }}
                        title="Pronounce word"
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Reading Hint Box */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Reading Guidance</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Hover over any <span className="px-1 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">highlighted word</span> in the story to view its definition, or tap the speaker icon on any sentence to hear it read aloud!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LessonsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading Reading Module...</p>
        </div>
      }
    >
      <LessonReaderContent />
    </Suspense>
  );
}
