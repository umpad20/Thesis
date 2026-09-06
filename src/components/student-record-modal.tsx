"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Printer,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  Calendar,
  Send,
  Trophy,
  History,
  Target,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentAvatar } from "@/components/student-avatar";
import { Progress } from "@/components/ui/progress";
import {
  fetchStudentDetailedQuizAttempts,
  type StudentDetailedQuizAttempt,
  type TeacherReportRow,
} from "@/utils/supabase-queries";
import type { InterventionPupil } from "@/lib/types";

interface StudentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  pupil: InterventionPupil | null;
  report?: TeacherReportRow | null;
  onOpenGuidanceNote?: (pupil: InterventionPupil) => void;
}

export function StudentRecordModal({
  isOpen,
  onClose,
  pupil,
  report,
  onOpenGuidanceNote,
}: StudentRecordModalProps) {
  const [attempts, setAttempts] = useState<StudentDetailedQuizAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  useEffect(() => {
    if (!isOpen || !pupil?.studentId) {
      setAttempts([]);
      return;
    }

    let isMounted = true;
    setLoadingAttempts(true);

    fetchStudentDetailedQuizAttempts(pupil.studentId)
      .then((data) => {
        if (isMounted) {
          setAttempts(data);
          setLoadingAttempts(false);
        }
      })
      .catch((err) => {
        console.error("Error loading student quiz records:", err);
        if (isMounted) {
          setAttempts([]);
          setLoadingAttempts(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, pupil?.studentId]);

  if (!isOpen || !pupil) return null;

  const isCritical = pupil.riskLevel === "critical";
  const isWatchlist = pupil.riskLevel === "watchlist";
  const isMastering = pupil.riskLevel === "mastering";

  const totalAttempts = pupil.quizzesPassed + pupil.failedAttemptsCount;
  const passRate =
    totalAttempts > 0 ? Math.round((pupil.quizzesPassed / totalAttempts) * 100) : 0;

  const readingSpeed = report?.readingSpeed || "85 WPM";
  const currentBadge = report?.currentBadge || "Stage 1 - Star of Wonder";
  const isStarReader = Boolean(report?.isAllStagesCompleted);
  const totalXp = report?.totalXp ?? pupil.quizzesPassed * 100;

  const formattedLastActive = pupil.lastActiveDate
    ? new Date(pupil.lastActiveDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Top Header ────────────────────────────────────────────── */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center gap-3.5">
            <StudentAvatar
              avatar={pupil.avatar}
              name={pupil.studentName}
              size="lg"
              className="flex-shrink-0 shadow-sm border-2 border-white ring-2 ring-slate-100"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {pupil.studentName}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    isCritical
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : isWatchlist
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <span>{isCritical ? "🔴" : isWatchlist ? "🟡" : "🟢"}</span>
                  <span>
                    {isCritical
                      ? "Needs Attention"
                      : isWatchlist
                      ? "Watchlist"
                      : "Mastering / On Track"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-medium flex-wrap">
                <span>Section: <strong className="text-slate-700 font-bold">{pupil.section}</strong></span>
                <span>•</span>
                <span>ID: <code className="text-slate-600 font-mono text-[11px]">{pupil.studentId}</code></span>
                {report?.gender && (
                  <>
                    <span>•</span>
                    <span>Sex: <span className="text-slate-700 font-bold">{report.gender}</span></span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              title="Print Student Record"
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Key Metrics Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Comprehension Card */}
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-blue-500" />
              <span>Comprehension</span>
            </span>
            <div className="text-xl font-black text-slate-900">
              {pupil.comprehensionPct}%
            </div>
            <div className="text-[10px] font-semibold text-slate-500">
              {pupil.comprehensionPct >= 70 ? (
                <span className="text-emerald-600 font-bold">Passing (≥70% DepEd)</span>
              ) : (
                <span className="text-rose-600 font-bold">Below Benchmark</span>
              )}
            </div>
            <Progress
              value={pupil.comprehensionPct}
              className={`h-1.5 mt-1 ${
                pupil.comprehensionPct >= 80
                  ? "[&>div]:bg-emerald-500"
                  : pupil.comprehensionPct >= 70
                  ? "[&>div]:bg-amber-500"
                  : "[&>div]:bg-rose-500"
              }`}
            />
          </div>

          {/* Reading Fluency / Speed */}
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-indigo-500" />
              <span>Reading Speed</span>
            </span>
            <div className="text-xl font-black text-slate-900">{readingSpeed}</div>
            <div className="text-[10px] font-semibold text-slate-500">
              Target: 60-90 WPM
            </div>
            <div className="text-[9px] text-slate-400">DepEd Oral Fluency</div>
          </div>

          {/* Quizzes Cleared & Retries */}
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Quizzes Passed</span>
            </span>
            <div className="text-xl font-black text-slate-900">
              {pupil.quizzesPassed}
            </div>
            <div className="text-[10px] font-semibold text-slate-500">
              {pupil.failedAttemptsCount} retries ({passRate}% pass rate)
            </div>
            <div className="text-[9px] text-slate-400">Quiz clearance ratio</div>
          </div>

          {/* Activity / Days Inactive */}
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Recent Activity</span>
            </span>
            <div className="text-xl font-black text-slate-900">
              {pupil.daysInactive === 0 ? "Active Today" : `${pupil.daysInactive}d Inactive`}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 truncate">
              {formattedLastActive}
            </div>
            <div className="text-[9px] text-slate-400">Last assessment logged</div>
          </div>
        </div>

        {/* ── Current Accolade / Stage Goal ───────────────────────────────── */}
        <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 rounded-2xl border border-blue-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-xs border border-blue-100 shrink-0">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                Active Accolade Stage
              </span>
              <div className="text-xs sm:text-sm font-black text-slate-900">
                {currentBadge}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isStarReader && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                <Trophy className="w-3 h-3 text-amber-600 fill-amber-500" />
                <span>Star Reader</span>
              </span>
            )}
            <span className="text-xs font-black text-slate-700 bg-white/80 px-2.5 py-1 rounded-xl border border-slate-200">
              {totalXp} XP
            </span>
          </div>
        </div>

        {/* ── Algorithmic Insight & Pedagogical Guidance ─────────────────── */}
        <div
          className={`p-4 rounded-2xl border space-y-2 ${
            isCritical
              ? "bg-rose-50/70 border-rose-200 text-rose-950"
              : isWatchlist
              ? "bg-amber-50/70 border-amber-200 text-amber-950"
              : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Learning Evaluation &amp; Algorithmic Diagnosis</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="leading-snug">
              <strong className="font-bold">Challenge Identified: </strong>
              <span className="font-normal">{pupil.struggleReason}</span>
            </div>
            <div className="leading-snug">
              <strong className="font-bold">Intervention Advice: </strong>
              <span className="font-normal">{pupil.recommendedAction}</span>
            </div>
          </div>
        </div>

        {/* ── Quiz Evaluation History Table ──────────────────────────────── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Quiz Attempt History &amp; Score Records</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">
              {attempts.length} Attempt{attempts.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="border border-slate-200/80 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            {loadingAttempts ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading quiz attempt history...
              </div>
            ) : attempts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <FileText className="w-5 h-5 text-slate-300 mx-auto" />
                <p>No quiz attempts recorded yet for this pupil.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider z-10">
                  <tr>
                    <th className="py-2 px-3">Assessment / Quiz</th>
                    <th className="py-2 px-3 text-center">Score</th>
                    <th className="py-2 px-3 text-center">Result</th>
                    <th className="py-2 px-3 text-right">Date Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {attempts.map((att) => {
                    const isPassed = att.status === "passed" || att.percentage >= 70;
                    return (
                      <tr key={att.attempt_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {att.quiz_title}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-900">
                          {att.percentage}%
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              isPassed
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {isPassed ? "Passed" : "Needs Review"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-[11px] text-slate-400">
                          {new Date(att.completed_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Footer Actions ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Student Slip</span>
          </Button>

          <div className="flex items-center gap-2">
            {onOpenGuidanceNote && (
              <Button
                type="button"
                size="sm"
                onClick={() => onOpenGuidanceNote(pupil)}
                className={`rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer ${
                  isCritical
                    ? "bg-rose-600 hover:bg-rose-700"
                    : isWatchlist
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Guidance Note</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs font-bold"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
