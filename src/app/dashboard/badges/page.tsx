"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  FileCheck2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  mockBadges,
  mockBadgeProgress,
  badgeEmojis,
} from "@/lib/mock-data";

export default function BadgesPage() {
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
            <span className="text-slate-800 font-bold">Badge Pathway</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Mastery-Based Badge Progression
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Stage-by-stage learning path: Complete lessons and pass cumulative exams to unlock the next milestone.
          </p>
        </div>

        {/* Milestone stats */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold">
            <span className="text-slate-400">Total Unlocked: </span>
            <span className="text-blue-600 font-bold">1 of 5 Badges</span>
          </div>
        </div>
      </div>

      {/* 2. Educational Rule Alert Banner */}
      <div className="dashboard-card p-4 bg-blue-50/50 border-blue-200 text-xs text-blue-950 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-900 block mb-0.5">
            Mastery Learning Progression Rule
          </span>
          <p className="text-blue-800/90 text-[11px] leading-relaxed">
            Students cannot jump ahead to higher level stages. Each badge requires passing all individual lesson quizzes (≥70%) plus a final cumulative badge exam before the next stage is unlocked.
          </p>
        </div>
      </div>

      {/* 3. Badge Stages List */}
      <div className="space-y-4">
        {mockBadges.map((badge) => {
          const progress = mockBadgeProgress.find(
            (p) => p.badge_id === badge.badge_id
          );
          const isCompleted = progress?.status === "completed";
          const isInProgress = progress?.status === "in_progress";
          const isLocked = progress?.status === "locked";

          return (
            <div
              key={badge.badge_id}
              className={`dashboard-card p-6 transition-all ${
                isInProgress
                  ? "border-blue-600 ring-2 ring-blue-600/10 shadow-sm"
                  : isCompleted
                  ? "border-emerald-200 bg-emerald-50/20"
                  : "bg-slate-50/70 border-slate-200/70 opacity-70"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left: Badge Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0 border ${
                      isCompleted
                        ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                        : isInProgress
                        ? "bg-blue-100 border-blue-300 text-blue-700 ring-4 ring-blue-50"
                        : "bg-slate-100 border-slate-200 text-slate-400"
                    }`}
                  >
                    {isLocked ? <Lock className="w-6 h-6" /> : badgeEmojis[badge.badge_id]}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-slate-900">
                        Stage {badge.badge_order}: {badge.badge_name}
                      </h3>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Mastered (Score: 90%)
                        </span>
                      )}
                      {isInProgress && (
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                          Active Stage ({progress?.completion_percentage}%)
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                          Locked Milestone
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mb-3">
                      {badge.description}
                    </p>

                    {/* Stage Requirements Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lessons: {badge.badge_id * 2 - 1} & {badge.badge_id * 2}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Passing Score: ≥{badge.required_passing_score}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-amber-600">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Reward: +{badge.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Progress & Action */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 min-w-[180px]">
                  {isInProgress && progress && (
                    <div className="w-full space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-blue-600">
                          {progress.completion_percentage}%
                        </span>
                      </div>
                      <Progress
                        value={progress.completion_percentage}
                        className="h-2 bg-slate-100 rounded-full"
                      />
                    </div>
                  )}

                  {isInProgress ? (
                    <Link href="/dashboard/lessons" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200">
                        <span>Continue Stage</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  ) : isCompleted ? (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-9 px-4 rounded-xl border-slate-200 text-slate-700 text-xs font-semibold bg-white"
                    >
                      Review Material
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full sm:w-auto h-9 px-4 rounded-xl border-slate-200 text-slate-400 text-xs font-medium bg-slate-100/50"
                    >
                      <Lock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      Locked Stage
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
