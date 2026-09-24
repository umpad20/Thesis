"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Volume2, Sparkles, X } from "lucide-react";
import type { VocabularyWord } from "@/lib/types";

interface VocabularyPopoverProps {
  wordData: VocabularyWord;
  displayText: string;
}

interface PopoverCoords {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  arrowLeft: number;
  placement: "top" | "bottom";
}

export function VocabularyPopover({ wordData, displayText }: VocabularyPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

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

  // Calculate viewport-aware fixed coordinates
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const popoverWidth = Math.min(320, windowWidth - 32);
    const triggerCenter = rect.left + rect.width / 2;

    // Center popover horizontally on trigger, clamped inside screen padding
    let left = triggerCenter - popoverWidth / 2;
    left = Math.max(16, Math.min(windowWidth - popoverWidth - 16, left));

    // Arrow points toward the center of the trigger
    const arrowLeft = Math.max(16, Math.min(popoverWidth - 16, triggerCenter - left));

    // If top clearance is low (< 230px) or space below is greater, place below
    const spaceAbove = rect.top;
    const spaceBelow = windowHeight - rect.bottom;
    const placement: "top" | "bottom" =
      spaceAbove < 230 || spaceBelow >= spaceAbove ? "bottom" : "top";

    if (placement === "bottom") {
      setCoords({
        top: rect.bottom + 8,
        left,
        width: popoverWidth,
        arrowLeft,
        placement,
      });
    } else {
      setCoords({
        bottom: windowHeight - rect.top + 8,
        left,
        width: popoverWidth,
        arrowLeft,
        placement,
      });
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <span className="relative inline-block mx-0.5">
      {/* Interactive Highlighted Keyword Badge */}
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100/90 text-amber-950 font-bold border-b-2 border-amber-400 cursor-pointer hover:bg-amber-200 transition-all duration-150 shadow-2xs group select-none"
      >
        <span>{displayText}</span>
        <Sparkles className="w-3 h-3 text-amber-600 inline-block opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all" />
      </span>

      {/* Floating Meaning Tooltip Popover (Rendered in Portal to prevent clipping) */}
      {mounted && isOpen && coords && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popoverRef}
              onMouseEnter={() => {
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = null;
                }
              }}
              onMouseLeave={handleMouseLeave}
              style={{
                position: "fixed",
                top: coords.top !== undefined ? `${coords.top}px` : undefined,
                bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                zIndex: 9999,
              }}
              className="p-4 bg-white rounded-2xl shadow-2xl border border-amber-200 text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Arrow Pointer */}
              <div
                className={`absolute w-3 h-3 bg-white border-amber-200 rotate-45 ${
                  coords.placement === "top"
                    ? "bottom-[-7px] border-r border-b"
                    : "top-[-7px] border-l border-t"
                }`}
                style={{
                  left: `${coords.arrowLeft}px`,
                  transform: "translateX(-50%) rotate(45deg)",
                }}
              />

              <div className="relative space-y-2.5">
                {/* Header: Word + Pronounce Button + Close */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight capitalize">
                      {wordData.word}
                    </h4>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Key Vocabulary
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={speakWord}
                      title="Listen to pronunciation"
                      aria-label={`Listen to pronunciation of ${wordData.word}`}
                      className="p-1.5 px-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Close"
                      aria-label="Close"
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
            </div>,
            document.body
          )
        : null}
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
