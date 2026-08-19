"use client";

import Link from "next/link";
import {
  BookOpen,
  Trophy,
  FileCheck2,
  Flame,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Lock,
  PlayCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { mockStudentStats, mockBadges, mockBadgeProgress, badgeEmojis } from "@/lib/mock-data";

export default function StudentDashboard() {
  const currentBadgeProgress = mockBadgeProgress.find((p) => p.status === "in_progress");
  const currentBadge = mockBadges.find((b) => b.badge_id === currentBadgeProgress?.badge_id);

  return (
    <div className="space-y-6">
      {/* 1. Personalized Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>ReadSmart</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">My Learning Hub</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, {mockStudentStats.full_name.split(" ")[0]}! 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            You&apos;re currently on <span className="text-blue-700 font-bold">{currentBadge?.badge_name}</span> — keep reading to earn your next milestone!
          </p>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2">
          <Flame className="w-5 h-5 fill-blue-500 text-blue-500" />
          <div>
            <span className="text-sm font-black text-slate-900">{mockStudentStats.streakDays} Days</span>
            <span className="text-[10px] text-slate-400 font-semibold block leading-none">Reading Streak</span>
          </div>
        </div>
      </div>

      {/* 2. Personal Learning Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            My XP Points
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{mockStudentStats.totalXp}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">⭐ XP</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">250 to go for Platinum</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Lessons Read
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{mockStudentStats.lessonsCompleted}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">📖 Stories</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Out of 10 total stories</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Quizzes Passed
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{mockStudentStats.quizzesPassed}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">✅ Clear</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Last score: 90%</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Current Badge
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">Stage 2</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">🔥 Fire</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">60% badge progress</p>
        </div>
      </div>

      {/* 3. Active Badge Progress Widget */}
      {currentBadge && currentBadgeProgress && (
        <div className="dashboard-card p-6 border-l-4 border-l-blue-600">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-3xl flex items-center justify-center">
                {badgeEmojis[currentBadge.badge_id]}
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Currently Earning
                </span>
                <h3 className="text-base font-bold text-slate-900">{currentBadge.badge_name}</h3>
                <p className="text-xs text-slate-500">{currentBadge.description}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                +{currentBadge.xp_reward} XP Reward
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Badge Completion</span>
              <span className="text-blue-600">{currentBadgeProgress.completion_percentage}% Done</span>
            </div>
            <Progress value={currentBadgeProgress.completion_percentage} className="h-2.5 bg-slate-100 rounded-full" />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/lessons"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Continue Reading: &quot;The Kind Farmer&quot;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 4. My Reading Path — Badge Stages Overview */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          My Reading Path
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {mockBadges.map((badge) => {
            const progress = mockBadgeProgress.find((p) => p.badge_id === badge.badge_id);
            const isCompleted = progress?.status === "completed";
            const isActive = progress?.status === "in_progress";
            const isLocked = progress?.status === "locked";

            return (
              <div
                key={badge.badge_id}
                className={`dashboard-card p-4 text-center flex flex-col items-center gap-2 ${
                  isLocked ? "opacity-40" : ""
                } ${isActive ? "border-blue-300 bg-blue-50/30" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    isCompleted
                      ? "bg-emerald-50 border border-emerald-200"
                      : isActive
                      ? "bg-blue-50 border border-blue-300"
                      : "bg-slate-50 border border-slate-200"
                  }`}
                >
                  {isLocked ? <Lock className="w-4 h-4 text-slate-400" /> : badgeEmojis[badge.badge_id]}
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {badge.badge_name}
                </span>
                {isCompleted && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                )}
                {isActive && (
                  <span className="text-[10px] font-bold text-blue-600">
                    {progress?.completion_percentage}% Done
                  </span>
                )}
                {isLocked && (
                  <span className="text-[10px] font-semibold text-slate-400">Locked</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Quick Access Cards (Student-Only Actions) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/lessons" className="dashboard-card p-5 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Read a Story</h4>
          <p className="text-xs text-slate-500">Open your reading lesson and follow along with the audio narration.</p>
        </Link>

        <Link href="/dashboard/quiz" className="dashboard-card p-5 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Take the Quiz</h4>
          <p className="text-xs text-slate-500">Answer questions about the story and earn XP points for your badge!</p>
        </Link>

        <Link href="/dashboard/achievements" className="dashboard-card p-5 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">My Achievements</h4>
          <p className="text-xs text-slate-500">View all earned badges and your reading mastery certificate.</p>
        </Link>
      </div>
    </div>
  );
}
