"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  ChevronRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  mockBadges,
  mockBadgeProgress,
  badgeEmojis,
} from "@/lib/mock-data";

export default function AchievementsPage() {
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
            <span className="text-slate-800 font-bold">Achievements</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Reading Credentials & Achievements
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Official reading mastery badges earned at Pedro Victorina Calo Elementary School.
          </p>
        </div>

        <Button
          size="sm"
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download Certificate
        </Button>
      </div>

      {/* 2. XP & Rank Widget */}
      <div className="dashboard-card p-6 border-l-4 border-l-blue-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl text-blue-600 shadow-sm">
              ⭐
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Reading Mastery Tier
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gold Scholar Level</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total 250 XP earned across 4 completed reading modules
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block">Next Milestone</span>
            <span className="text-sm font-black text-slate-900">Platinum Reader (500 XP)</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Progress to Next Rank</span>
            <span className="text-blue-600">250 / 500 XP (50%)</span>
          </div>
          <Progress value={50} className="h-2 bg-slate-100 rounded-full" />
        </div>
      </div>

      {/* 3. Official Badge Showcase */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          Earned Badge Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className={`dashboard-card p-5 flex flex-col justify-between space-y-4 ${
                  isLocked ? "opacity-50" : "bg-white"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                        isCompleted
                          ? "bg-emerald-50 border-emerald-200"
                          : isInProgress
                          ? "bg-blue-50 border-blue-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      {isLocked ? <Lock className="w-5 h-5 text-slate-400" /> : badgeEmojis[badge.badge_id]}
                    </div>
                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Mastered
                      </span>
                    )}
                    {isInProgress && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {badge.badge_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-600">+{badge.xp_reward} XP Reward</span>
                  <span className="font-semibold text-slate-400">Score Req: ≥{badge.required_passing_score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
