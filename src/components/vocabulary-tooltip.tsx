"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, Bookmark, Sparkles, X } from "lucide-react";
import type { VocabularyWord } from "@/lib/types";

interface VocabularyPopoverProps {
  wordData: VocabularyWord;
  displayText: string;
}

export function VocabularyPopover({ wordData, displayText }: VocabularyPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Pronounce word using Web Speech API
  const speakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordData.word);
      utterance.rate = 0.85; // Slightly slower, clear for Grade 3 pupils
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Adjust top vs bottom position based on viewport
  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (rect.top < 180) {
        setPopoverPos("bottom");
      } else {
        setPopoverPos("top");
      }
    }
    setIsOpen(true);
  };

  return (
    <span className="relative inline-block mx-0.5">
      {/* Interactive Highlighted Keyword Badge */}
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100/90 text-amber-950 font-bold border-b-2 border-amber-400 cursor-pointer hover:bg-amber-200 transition-all duration-150 shadow-2xs group select-none"
      >
        <span>{displayText}</span>
        <Sparkles className="w-3 h-3 text-amber-600 inline-block opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all" />
      </span>

      {/* Floating Meaning Tooltip Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`absolute z-50 w-72 sm:w-80 p-4 bg-white rounded-2xl shadow-xl border border-amber-200 text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 ${
            popoverPos === "top"
              ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
              : "top-full mt-2 left-1/2 -translate-x-1/2"
          }`}
        >
          {/* Arrow Pointer */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-amber-200 rotate-45 ${
              popoverPos === "top"
                ? "bottom-[-7px] border-r border-b"
                : "top-[-7px] border-l border-t"
            }`}
          />

          <div className="relative space-y-2.5">
            {/* Header: Word + Pronounce Button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight capitalize">
                    {wordData.word}
                  </h4>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    Key Vocabulary
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={speakWord}
                  title="Listen to pronunciation"
                  aria-label={`Listen to pronunciation of ${wordData.word}`}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1 text-[11px] font-bold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Hear</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 sm:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Meaning Definition */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Meaning:
              </span>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {wordData.definition}
              </p>
            </div>

            {/* Example in Sentence */}
            {wordData.example_sentence && (
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-[11px] text-amber-950">
                <span className="font-bold block text-amber-800 text-[10px] uppercase tracking-wider mb-0.5">
                  Example:
                </span>
                <p className="italic leading-snug">
                  &quot;{wordData.example_sentence}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
}

interface VocabularyHighlightedTextProps {
  text: string;
  vocabularyList: VocabularyWord[];
}

export function VocabularyHighlightedText({
  text,
  vocabularyList,
}: VocabularyHighlightedTextProps) {
  if (!vocabularyList || vocabularyList.length === 0 || !text) {
    return <span>{text}</span>;
  }

  // Create a regex matching any word in the vocabulary list
  // Escapes regex chars and uses word boundaries \b
  const escapedWords = vocabularyList
    .map((v) => v.word.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length); // match longest first

  if (escapedWords.length === 0) {
    return <span>{text}</span>;
  }

  const regexPattern = new RegExp(`\\b(${escapedWords.join("|")})\\b`, "gi");

  const parts = text.split(regexPattern);

  return (
    <>
      {parts.map((part, index) => {
        const lower = part.toLowerCase();
        const matchedVocab = vocabularyList.find(
          (v) => v.word.toLowerCase() === lower
        );

        if (matchedVocab) {
          return (
            <VocabularyPopover
              key={`${matchedVocab.word_id}-${index}`}
              wordData={matchedVocab}
              displayText={part}
            />
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}
