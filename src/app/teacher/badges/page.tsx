"use client";

import Link from "next/link";
import {
  ChevronRight,
  Edit,
  Lock,
  CheckCircle2,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { mockBadges, badgeEmojis } from "@/lib/mock-data";

export default function TeacherBadgesPage() {
  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/teacher" className="hover:text-slate-600">
              Teacher Hub
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">Badge Mastery Rules</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Mastery Badge Thresholds & Configuration
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure passing score requirements, XP rewards, and advancement criteria for each badge stage.
          </p>
        </div>
      </div>

      {/* 2. Info Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs">
        <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-900 block mb-0.5">
            Mastery Path Design Note
          </span>
          <span className="text-blue-800">
            Students must meet the passing score threshold before advancing to the next badge stage. Stage 3, 4, and 5 require higher accuracy to reflect growing reading complexity.
          </span>
        </div>
      </div>

      {/* 3. Badge Configuration Cards */}
      <div className="space-y-4">
        {mockBadges.map((badge, idx) => {
          const stageColors = [
            "border-l-sky-400",
            "border-l-orange-400",
            "border-l-blue-400",
            "border-l-emerald-400",
            "border-l-amber-400",
          ];

          return (
            <div
              key={badge.badge_id}
              className={`dashboard-card p-6 border-l-4 ${stageColors[idx]}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Badge Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl">
                    {badgeEmojis[badge.badge_id]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Stage {badge.badge_order}: {badge.badge_name}
                    </h3>
                    <p className="text-xs text-slate-500">{badge.description}</p>
                  </div>
                </div>

                {/* Configuration Stats */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider mb-0.5">
                      Passing Threshold
                    </span>
                    <span className="text-slate-900 font-bold text-sm">
                      ≥{badge.required_passing_score}%
                    </span>
                  </div>

                  <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-amber-600 block font-semibold text-[10px] uppercase tracking-wider mb-0.5">
                      XP Reward
                    </span>
                    <span className="text-amber-700 font-bold text-sm">
                      +{badge.xp_reward} XP
                    </span>
                  </div>

                  <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-blue-600 block font-semibold text-[10px] uppercase tracking-wider mb-0.5">
                      Stories / Stage
                    </span>
                    <span className="text-blue-700 font-bold text-sm">
                      2 Passages
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label={`Edit ${badge.badge_name} thresholds`}
                    className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Rules
                  </button>
                </div>
              </div>

              {/* Progress: How many students in this stage */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>
                    {badge.badge_id === 1 && "32 / 32 students cleared this stage (100%)"}
                    {badge.badge_id === 2 && "24 / 32 students currently in this stage (75%)"}
                    {badge.badge_id === 3 && "8 / 32 students have unlocked this stage (25%)"}
                    {badge.badge_id === 4 && "0 / 32 students — not yet reached"}
                    {badge.badge_id === 5 && "0 / 32 students — final mastery stage"}
                  </span>
                  {badge.badge_id === 1 && (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All Students Passed
                    </span>
                  )}
                  {badge.badge_id === 2 && (
                    <span className="text-blue-600 font-bold">Active Cohort Stage</span>
                  )}
                  {badge.badge_id >= 3 && badge.badge_id < 5 && (
                    <span className="flex items-center gap-1 text-slate-400 font-bold">
                      <Lock className="w-3.5 h-3.5" /> Partially Unlocked
                    </span>
                  )}
                  {badge.badge_id === 5 && (
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Trophy className="w-3.5 h-3.5" /> Final Mastery Stage
                    </span>
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
