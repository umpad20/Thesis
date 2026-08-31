"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Trophy,
  Printer,
  X,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
  BookmarkCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { soundEffects } from "@/utils/sound-effects";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  section?: string;
  dateStr?: string;
  teacherName?: string;
  schoolName?: string;
  programTitle?: string;
  autoPlayAudio?: boolean;
}

export function CertificateModal({
  isOpen,
  onClose,
  studentName,
  section = "Grade 3-A",
  dateStr,
  teacherName = "Faculty Advisory",
  schoolName = "Pedro Victorina Calo Elementary School",
  programTitle = "ReadSmart Gamified Reading Comprehension Program",
  autoPlayAudio = true,
}: CertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isApplausePlaying, setIsApplausePlaying] = useState(false);

  const formattedDate =
    dateStr ||
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Auto-play Victory Fanfare & Crowd Cheers on mount
  useEffect(() => {
    if (isOpen && autoPlayAudio) {
      soundEffects.playGrandGraduationFanfare();
      setIsApplausePlaying(true);
      const timer = setTimeout(() => {
        setIsApplausePlaying(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPlayAudio]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handlePlayApplause = () => {
    soundEffects.playApplause(4.0);
    setIsApplausePlaying(true);
    setTimeout(() => {
      setIsApplausePlaying(false);
    }, 4000);
  };

  // Use Portal to render at document.body level — escapes any ancestor
  // CSS transform (e.g. anim-pop-bounce) that would break position:fixed
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300 overflow-hidden select-none print:p-0 print:bg-white print:static">
      <style jsx global>{`
        @page {
          size: landscape;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-certificate-container,
          #print-certificate-container * {
            visibility: visible !important;
          }
          #print-certificate-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 32px !important;
            box-shadow: none !important;
            border: 6px solid #f59e0b !important;
            background: white !important;
            z-index: 999999 !important;
            aspect-ratio: 16 / 9 !important;
            max-height: 100vh !important;
          }
          .no-print {
            display: none !important;
          }
        }

        @keyframes rayRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .anim-spin-rays {
          animation: rayRotate 40s linear infinite;
        }

        @keyframes soundWaveBar {
          0%, 100% {
            height: 4px;
          }
          50% {
            height: 16px;
          }
        }
        .wave-bar-1 {
          animation: soundWaveBar 0.6s ease-in-out infinite;
        }
        .wave-bar-2 {
          animation: soundWaveBar 0.5s ease-in-out infinite 0.15s;
        }
        .wave-bar-3 {
          animation: soundWaveBar 0.7s ease-in-out infinite 0.3s;
        }
        .wave-bar-4 {
          animation: soundWaveBar 0.55s ease-in-out infinite 0.1s;
        }
      `}</style>

      {/* ── 1. Animated Radial Light Beams Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center no-print">
        <div
          className="w-[120vw] h-[120vw] max-w-[1400px] max-h-[1400px] rounded-full opacity-20 anim-spin-rays"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(245, 158, 11, 0.4) 0deg 20deg, transparent 20deg 40deg, rgba(245, 158, 11, 0.4) 40deg 60deg, transparent 60deg 80deg, rgba(245, 158, 11, 0.4) 80deg 100deg, transparent 100deg 120deg, rgba(245, 158, 11, 0.4) 120deg 140deg, transparent 140deg 160deg, rgba(245, 158, 11, 0.4) 160deg 180deg, transparent 180deg 200deg, rgba(245, 158, 11, 0.4) 200deg 220deg, transparent 220deg 240deg, rgba(245, 158, 11, 0.4) 240deg 260deg, transparent 260deg 280deg, rgba(245, 158, 11, 0.4) 280deg 300deg, transparent 300deg 320deg, rgba(245, 158, 11, 0.4) 320deg 340deg, transparent 340deg 360deg)",
          }}
        />
      </div>

      {/* ── 2. Celebratory Floating Confetti & Sparkling Stars ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden no-print">
        <div className="absolute top-8 left-12 text-4xl animate-bounce delay-100">🎉</div>
        <div className="absolute top-14 right-16 text-3xl animate-pulse">⭐</div>
        <div className="absolute bottom-12 left-16 text-3xl animate-bounce delay-300">🌟</div>
        <div className="absolute bottom-10 right-20 text-4xl animate-pulse delay-200">🎊</div>
        <div className="absolute top-1/2 left-8 text-2xl animate-spin delay-500">✨</div>
        <div className="absolute top-1/3 right-10 text-2xl animate-spin delay-700">💫</div>
        <div className="absolute top-20 left-1/4 text-3xl animate-pulse delay-300">🏆</div>
        <div className="absolute bottom-20 right-1/3 text-3xl animate-bounce delay-500">🎈</div>
      </div>

      {/* ── 3. Modal Shell Container (16:9 Landscape, 100% Viewport Contained) ── */}
      <div className="relative w-full max-w-6xl max-h-[96vh] flex flex-col items-center gap-2 sm:gap-3 z-10">
        {/* ── Persistent Dark Top Bar Controls ── */}
        <div className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-white shadow-xl no-print flex-shrink-0">
          {/* Left: Trophy Badge */}
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-400/40 text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xs">
              <Trophy className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>GRAND MASTER STAR READER</span>
            </span>
          </div>

          {/* Right: Audio, Print & Close */}
          <div className="flex items-center gap-2">
            {/* Play Applause Button with Audio Wave Equalizer */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayApplause}
              className={`h-9 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm ${
                isApplausePlaying
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20"
              }`}
              title="Play Crowd Applause & Cheers"
            >
              {isApplausePlaying ? (
                <div className="flex items-center gap-0.5 h-4 px-0.5">
                  <span className="w-1 bg-amber-400 rounded-full wave-bar-1" />
                  <span className="w-1 bg-amber-400 rounded-full wave-bar-2" />
                  <span className="w-1 bg-amber-400 rounded-full wave-bar-3" />
                  <span className="w-1 bg-amber-400 rounded-full wave-bar-4" />
                </div>
              ) : (
                <span className="text-base">👏</span>
              )}
              <span>{isApplausePlaying ? "Applause Playing..." : "Play Applause"}</span>
            </Button>

            {/* Print Award Primary CTA */}
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Award</span>
            </Button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            4. HORIZONTAL LANDSCAPE CERTIFICATE FRAME (Single Column, Bottom Footer)
            ══════════════════════════════════════════════════════════════════════ */}
        <div
          id="print-certificate-container"
          ref={certificateRef}
          className="w-full flex-1 max-h-[calc(96vh-64px)] bg-gradient-to-br from-[#fffefb] via-[#fffdf7] to-[#fef8e7] rounded-3xl p-4 sm:p-6 lg:p-8 border-4 sm:border-6 md:border-8 border-amber-400 ring-4 sm:ring-8 ring-amber-200/80 shadow-2xl relative overflow-hidden flex flex-col justify-between select-none anim-pop-bounce"
          style={{
            backgroundImage:
              "radial-gradient(#fde68a 1px, transparent 1px), radial-gradient(#fde68a 1px, #fffdf7 1px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
          }}
        >
          {/* Inner Filigree Corner Accents */}
          <div className="absolute top-2.5 left-2.5 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-2.5 right-2.5 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-lg pointer-events-none" />

          {/* ── TOP: School & Department Header ── */}
          <div className="text-center space-y-0.5">
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-amber-800 block">
              Department of Education · Region XIII · Caraga
            </span>
            <h4 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
              {schoolName}
            </h4>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 block">
              {programTitle}
            </span>
          </div>

          {/* ── CENTER: Main Content Block ── */}
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 sm:gap-2 py-1">
            {/* Bold Gold CONGRATULATIONS */}
            <h2
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-b from-amber-500 via-amber-400 to-yellow-600 bg-clip-text text-transparent tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(180,83,9,0.3)]"
              style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
            >
              CONGRATULATIONS!
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="h-0.5 w-10 sm:w-16 bg-amber-400 rounded-full" />
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="h-0.5 w-10 sm:w-16 bg-amber-400 rounded-full" />
            </div>

            {/* Emblem Badge & Subtitle Row */}
            <div className="flex flex-col items-center justify-center gap-1.5 my-0.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-200 p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full rounded-2xl bg-white border border-amber-400 flex flex-col items-center justify-center text-amber-600">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-600" />
                  <span className="text-[7px] font-black uppercase tracking-tighter text-amber-900 -mt-0.5">
                    5/5 STAGES
                  </span>
                </div>
              </div>
              <h3 className="text-base sm:text-xl font-black text-slate-950 tracking-tight uppercase">
                STAR READER AWARD
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium max-w-sm leading-tight text-center">
                Awarded for superior comprehension and conquering all 5 Stages of the Story Realm.
              </p>
            </div>

            {/* Recipient Presentation Name */}
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-xs text-slate-500 font-semibold italic block">
                this certificate is proudly presented to:
              </span>
              <div className="inline-block px-6 py-0.5 border-b-2 border-slate-900">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight font-serif capitalize">
                  {studentName}
                </span>
              </div>
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                  <BookmarkCheck className="w-3 h-3" />
                  <span>Class Section: {section}</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── BOTTOM: Meta Info Footer Row (Seal, Date, Signature, System) ── */}
          <div className="border-t-2 border-amber-300/70 pt-2 sm:pt-3 mt-1">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto w-full">
              {/* Col 1: Date of Award */}
              <div className="text-center space-y-0.5">
                <div className="border-b border-slate-700 pb-0.5 flex items-center justify-center gap-1 text-slate-800 font-mono text-xs sm:text-sm font-bold">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                  <span>{formattedDate}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  DATE OF AWARD
                </span>
              </div>

              {/* Col 2: Official Seal (Center) */}
              <div className="flex flex-col items-center text-center space-y-0.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-dashed border-amber-600 bg-amber-100/70 p-0.5 flex flex-col items-center justify-center text-amber-900 shadow-inner">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                  <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest text-amber-950">
                    OFFICIAL
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-amber-900/90">
                  ReadSmart Validated
                </span>
              </div>

              {/* Col 3: Instructor Signature */}
              <div className="text-center space-y-0.5">
                <div className="border-b border-slate-700 pb-0.5">
                  <span className="text-xs sm:text-sm font-black text-slate-800 italic font-serif block truncate">
                    {teacherName}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  FACULTY ADVISOR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
