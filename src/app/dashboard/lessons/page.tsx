"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  mockLessonPages,
  mockVocabularyWords,
} from "@/lib/mock-data";

export default function LessonsPage() {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("large");
  const [selectedWord, setSelectedWord] = useState<number | null>(null);

  const pages = mockLessonPages;
  const currentPage = pages[currentPageIndex];
  const totalPages = pages.length;
  const isLastPage = currentPageIndex === totalPages - 1;

  const fontClasses = {
    normal: "text-base leading-relaxed",
    large: "text-lg leading-loose",
    xlarge: "text-xl leading-loose",
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Trail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-slate-600">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard/badges" className="hover:text-slate-600">
              Fire Badge
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">
              Lesson 3: The Kind Farmer
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Reading Module: The Kind Farmer (Mang Juan)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Page {currentPageIndex + 1} of {totalPages} · Multimedia Audio & Vocabulary Enabled
          </p>
        </div>

        {/* Action controls: Text size & Audio */}
        <div className="flex items-center gap-2">
          {/* Font Size Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setFontSize("normal")}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                fontSize === "normal"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize("large")}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                fontSize === "large"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize("xlarge")}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                fontSize === "xlarge"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              A+
            </button>
          </div>

          {/* Audio narration button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className={`h-9 px-3.5 rounded-xl border-slate-200 text-xs font-semibold ${
              isPlayingAudio
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 mr-1.5 text-blue-600 animate-pulse" />
                Stop Audio
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Listen Story
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Step Progress Bar */}
      <div className="dashboard-card p-4">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-slate-500">
            Reading Progress: Page {currentPageIndex + 1} of {totalPages}
          </span>
          <span className="text-blue-600">
            {Math.round(((currentPageIndex + 1) / totalPages) * 100)}% Completed
          </span>
        </div>
        <Progress
          value={((currentPageIndex + 1) / totalPages) * 100}
          className="h-2 bg-slate-100 rounded-full"
        />
      </div>

      {/* 3. Main Reading Card & Vocabulary Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Story Viewer */}
        <div className="dashboard-card p-6 md:p-8 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200">
                {currentPageIndex + 1}
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {currentPage.page_title}
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              Grade 3 Reading Material
            </span>
          </div>

          {/* Story Content Block */}
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-6 md:p-8">
            <p className={`${fontClasses[fontSize]} text-slate-800 font-medium`}>
              {currentPage.content}
            </p>
          </div>

          {/* Multimedia Audio Bar if active */}
          {isPlayingAudio && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600 animate-bounce" />
                <span className="font-bold">Playing Audio Narration (0:45)</span>
              </div>
              <span className="text-[11px] font-semibold text-blue-600">
                Auto-scrolling text
              </span>
            </div>
          )}

          {/* Pagination Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Previous Page
            </Button>

            {isLastPage ? (
              <Link href="/dashboard/quiz">
                <Button className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Proceed to Comprehension Quiz
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() =>
                  setCurrentPageIndex((prev) =>
                    Math.min(totalPages - 1, prev + 1)
                  )
                }
                className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
              >
                Next Page
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Right 1 Col: Key Vocabulary for this Lesson */}
        <div className="space-y-4">
          <div className="dashboard-card p-5">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Lesson Vocabulary
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                3 Key Terms
              </span>
            </div>

            <div className="space-y-2.5">
              {mockVocabularyWords.map((item) => (
                <div
                  key={item.word_id}
                  onClick={() =>
                    setSelectedWord(
                      selectedWord === item.word_id ? null : item.word_id
                    )
                  }
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedWord === item.word_id
                      ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-200"
                      : "bg-slate-50/80 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      {item.word}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      Definition
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.definition}
                  </p>
                  {selectedWord === item.word_id && (
                    <div className="mt-2.5 pt-2 border-t border-blue-200/60 text-[11px] text-slate-700 italic">
                      &quot;{item.example_sentence}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <Link
                href="/dashboard/vocabulary"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
              >
                <span>Open Full Vocabulary Vault</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Learning Tip */}
          <div className="dashboard-card p-4 bg-blue-50/40 border-blue-200/60 text-xs">
            <div className="flex items-center gap-2 font-bold text-blue-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Comprehension Strategy</span>
            </div>
            <p className="text-blue-950/80 text-[11px] leading-relaxed">
              Pay close attention to who Mang Juan helped during the rainy floods. This will appear on the upcoming comprehension quiz!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
