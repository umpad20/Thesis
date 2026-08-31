"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Volume2,
  ChevronRight,
  Bookmark,
  Lock,
  Sparkles,
  BookOpen,
  Info,
  Layers,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchAllVocabularyWords,
  fetchLessonsForStudent,
  fetchStudentLessonProgress,
  fetchStudentBadgeProgress,
  fetchBadgesFromSupabase,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import { soundEffects } from "@/utils/sound-effects";
import { getEnrichedVocab, type EnrichedVocabularyData } from "@/utils/vocabulary-data";
import type { VocabularyWord, Lesson, StudentBadgeProgress, Badge } from "@/lib/types";

export default function VocabularyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"unlocked" | "all">("unlocked");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [lessonProgress, setLessonProgress] = useState<
    Record<number, { status: "completed" | "in_progress" | "locked"; highest_score: number }>
  >({});
  const [badgeProgress, setBadgeProgress] = useState<StudentBadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWord, setExpandedWord] = useState<{
    word: VocabularyWord;
    meta: EnrichedVocabularyData;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      const studentSection = user?.section || "Grade 3-A";
      const teacherId = user?.teacherId || null;

      const [allWords, allLessons, allBadges] = await Promise.all([
        fetchAllVocabularyWords(),
        fetchLessonsForStudent(studentSection, teacherId),
        fetchBadgesFromSupabase(studentSection, teacherId),
      ]);

      setWords(allWords);
      setLessons(allLessons);
      setBadges(allBadges);

      if (user?.id) {
        const [progLessons, progBadges] = await Promise.all([
          fetchStudentLessonProgress(user.id),
          fetchStudentBadgeProgress(user.id),
        ]);
        setLessonProgress(progLessons);
        setBadgeProgress(progBadges);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  // Helper to determine if a lesson is unlocked for the student
  const isLessonUnlocked = (lessonId: number): boolean => {
    // Lesson 1 is always unlocked
    if (lessonId === 1) return true;

    // If completed or in_progress in DB
    const prog = lessonProgress[lessonId];
    if (prog?.status === "completed" || prog?.status === "in_progress") {
      return true;
    }

    const currentLesson = lessons.find((l) => l.lesson_id === lessonId);
    const relatedBadge = badges.find((b) => b.badge_id === currentLesson?.badge_id);

    // Custom teacher quests are ALWAYS unlocked for students
    if (currentLesson?.teacher_id || relatedBadge?.teacher_id) {
      return true;
    }

    // Check if previous lesson was completed
    const prevProg = lessonProgress[lessonId - 1];
    if (prevProg?.status === "completed") {
      return true;
    }

    // First story of a chapter is unlocked if the prior stage badge is completed
    if (currentLesson && currentLesson.lesson_order === 1) {
      const priorBadge = badges.find((b) => !b.teacher_id && b.badge_order === (relatedBadge?.badge_order || 2) - 1);
      if (!priorBadge) return true;
      const priorBadgeProg = badgeProgress.find((p) => p.badge_id === priorBadge.badge_id);
      if (priorBadgeProg?.status === "completed" || (priorBadgeProg?.completion_percentage || 0) >= 100) {
        return true;
      }
    }

    return false;
  };

  // Tag words with unlock status and enriched details
  const enrichedWordsList = words.map((w) => {
    const unlocked = isLessonUnlocked(w.lesson_id);
    const meta = getEnrichedVocab(w.word, w.lesson_id);
    const relatedLesson = lessons.find((l) => l.lesson_id === w.lesson_id);
    const relatedBadge = badges.find((b) => b.badge_id === relatedLesson?.badge_id);

    return {
      ...w,
      isUnlocked: unlocked,
      meta: {
        ...meta,
        storyTitle: relatedLesson?.lesson_title || meta.storyTitle,
        chapterName: relatedBadge?.badge_name || meta.chapterName,
        chapterNumber: relatedBadge?.badge_order || meta.chapterNumber,
      },
    };
  });

  const unlockedCount = enrichedWordsList.filter((w) => w.isUnlocked).length;
  const totalCount = enrichedWordsList.length;

  // Filter words by tab, search term, and category
  const filteredWords = enrichedWordsList.filter((item) => {
    if (activeTab === "unlocked" && !item.isUnlocked) return false;

    if (selectedCategory !== "all") {
      if (item.meta.chapterNumber.toString() !== selectedCategory) return false;
    }

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      item.word.toLowerCase().includes(term) ||
      item.definition.toLowerCase().includes(term) ||
      item.meta.storyTitle.toLowerCase().includes(term) ||
      item.meta.synonyms.some((s) => s.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── 1. Header & Reading Discovery Metrics ──────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-slate-600">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 font-bold">Vocabulary Vault</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Magical Vocabulary Vault
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-lg">
            Discover and master key storybook terms. Each unlocked story expands your glossary with phonetics, definitions, and realistic voice pronunciation!
          </p>
        </div>

        {/* Discovery Counter Badge */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 border-2 border-blue-200/80 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Discovered in Stories
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">
                {unlockedCount} / {totalCount}
              </span>
              <span className="text-[11px] font-bold text-blue-600">
                ({Math.round((unlockedCount / (totalCount || 1)) * 100)}% Unlocked)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Discovery Tabs & Filter Controls ────────────────────────── */}
      <div className="dashboard-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Toggle Tabs: Unlocked Only vs. All Mystery Words */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("unlocked")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "unlocked"
                ? "bg-white text-blue-600 shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>My Discovered Words ({unlockedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "all"
                ? "bg-white text-blue-600 shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>All Storybook Words ({totalCount})</span>
          </button>
        </div>

        {/* Search Input & Stage Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search word, meaning, synonym..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Chapters</option>
              <option value="1">Chapter 1 (Stage 1)</option>
              <option value="2">Chapter 2 (Stage 2)</option>
              <option value="3">Chapter 3 (Stage 3)</option>
              <option value="4">Chapter 4 (Stage 4)</option>
              <option value="5">Chapter 5 (Stage 5)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Vocabulary Cards Grid ───────────────────────────────────── */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Opening Vocabulary Vault...</p>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="dashboard-card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Bookmark className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              {activeTab === "unlocked" && unlockedCount === 0
                ? "No Words Discovered Yet"
                : "No Vocabulary Terms Found"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {activeTab === "unlocked"
                ? "Read chapter stories in your Living Storybook to discover and unlock new vocabulary words!"
                : "No glossary words matched your current search or chapter filter."}
            </p>
          </div>
          <Link href="/dashboard/badges">
            <Button className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              <span>Explore Living Storybook</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((item) => {
            if (!item.isUnlocked) {
              // Locked Mystery Word Card
              return (
                <div
                  key={item.word_id}
                  className="dashboard-card p-5 border-dashed border-2 border-slate-200/80 bg-slate-50/60 flex flex-col justify-between space-y-4 opacity-75 relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Mystery Word</span>
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                        Stage {item.meta.chapterNumber}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-400 tracking-wide blur-[2px] select-none">
                      {item.word.replace(/./g, "•")}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      🔒 Read <strong className="text-slate-500">{item.meta.storyTitle}</strong> in {item.meta.chapterName} to discover this vocabulary term and hear its pronunciation!
                    </p>
                  </div>

                  <Link href={`/dashboard/lessons?lessonId=${item.lesson_id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-[11px] font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-white"
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      <span>Read Story to Unlock</span>
                    </Button>
                  </Link>
                </div>
              );
            }

            // Unlocked Rich Vocabulary Card
            const partOfSpeechColors: Record<string, string> = {
              noun: "bg-blue-50 text-blue-700 border-blue-200",
              verb: "bg-emerald-50 text-emerald-700 border-emerald-200",
              adjective: "bg-purple-50 text-purple-700 border-purple-200",
              adverb: "bg-amber-50 text-amber-700 border-amber-200",
            };

            return (
              <div
                key={item.word_id}
                className="dashboard-card p-5 dashboard-card-hover flex flex-col justify-between space-y-4 border-2 border-amber-100/80 bg-[#fffdfa] relative group shadow-xs"
              >
                <div>
                  {/* Top Tags: Part of Speech + Story Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          partOfSpeechColors[item.meta.partOfSpeech] || partOfSpeechColors.noun
                        }`}
                      >
                        {item.meta.partOfSpeech}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-medium">
                        {item.meta.phonetic}
                      </span>
                    </div>

                    {/* Realistic Voice Speaker Button */}
                    <button
                      type="button"
                      onClick={() => soundEffects.speakWord(item.word, item.example_sentence)}
                      aria-label="Listen to realistic voice pronunciation"
                      className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-2xs group/btn"
                      title="Listen with realistic voice"
                    >
                      <Volume2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Word Name & Chapter Source */}
                  <div className="mb-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.word}
                    </h3>
                    <span className="text-[10px] font-bold text-amber-700 block">
                      {item.meta.chapterName} · {item.meta.storyTitle}
                    </span>
                  </div>

                  {/* Definition */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">
                    {item.definition}
                  </p>

                  {/* Synonyms Badges */}
                  {item.meta.synonyms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Synonyms:</span>
                      {item.meta.synonyms.slice(0, 3).map((syn, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Example Sentence Footer */}
                {item.example_sentence && (
                  <div className="pt-3 border-t border-amber-200/60 bg-amber-50/40 -mx-5 -mb-5 p-3.5 rounded-b-2xl flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-bold text-amber-900/70 uppercase tracking-wider block mb-0.5">
                        Story Passage Context:
                      </span>
                      <p className="text-[11px] text-slate-700 italic leading-snug">
                        &ldquo;{item.example_sentence}&rdquo;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedWord({ word: item, meta: item.meta })}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0"
                      title="View expanded meaning"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Interactive Expanded Meaning Modal ─────────────────────── */}
      {expandedWord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-amber-200 text-left space-y-5 anim-pop-bounce relative overflow-hidden">
            {/* Top Close Button */}
            <div className="flex items-start justify-between border-b border-amber-200/80 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                    {expandedWord.meta.partOfSpeech}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    {expandedWord.meta.phonetic}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  {expandedWord.word.word}
                </h2>
                <span className="text-xs font-bold text-amber-700">
                  {expandedWord.meta.chapterName} · {expandedWord.meta.storyTitle}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => soundEffects.speakWord(expandedWord.word.word, expandedWord.word.example_sentence)}
                className="h-10 px-3.5 rounded-xl border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen</span>
              </Button>
            </div>

            {/* Deep Meaning Details */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Expanded Definition
                </span>
                <p className="text-sm text-slate-800 font-medium leading-relaxed bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60">
                  {expandedWord.meta.expandedMeaning || expandedWord.word.definition}
                </p>
              </div>

              {expandedWord.word.example_sentence && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Story Context Sentence
                  </span>
                  <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                    &ldquo;{expandedWord.word.example_sentence}&rdquo;
                  </p>
                </div>
              )}

              {/* Synonyms & Antonyms Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1.5">
                    Synonyms
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {expandedWord.meta.synonyms.map((syn, idx) => (
                      <span
                        key={idx}
                        className="bg-white text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block mb-1.5">
                    Antonyms
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {expandedWord.meta.antonyms.length > 0 ? (
                      expandedWord.meta.antonyms.map((ant, idx) => (
                        <span
                          key={idx}
                          className="bg-white text-rose-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-200"
                        >
                          {ant}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <Button
                onClick={() => setExpandedWord(null)}
                className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs"
              >
                Close Word Card
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
