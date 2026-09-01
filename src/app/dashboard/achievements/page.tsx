"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  Star,
  Ribbon,
  Medal,
  Award,
  Trophy,
  Flame,
  Sparkles,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BadgeGraphic, getBadgeCategoryLabel } from "@/components/badge-graphic";
import { CertificateModal } from "@/components/certificate-modal";
import {
  fetchBadgesFromSupabase,
  fetchStudentBadgeProgress,
  fetchStudentStats,
  type LiveStudentStats,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import type { Badge, StudentBadgeProgress } from "@/lib/types";

export default function AchievementsPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<StudentBadgeProgress[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LiveStudentStats>({
    full_name: "Pupil",
    section: "Grade 3-A",
    avatar: "🦊",
    totalXp: 0,
    lessonsCompleted: 0,
    quizzesPassed: 0,
    streakDays: 0,
    accuracyRate: 0,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      const liveBadges = await fetchBadgesFromSupabase(user?.section || "Grade 3-A");
      setBadges(liveBadges);

      if (user?.id) {
        const [liveProg, liveStats] = await Promise.all([
          fetchStudentBadgeProgress(user.id),
          fetchStudentStats(user.id, user.fullName, user.section, user.avatar),
        ]);
        setBadgeProgress(liveProg);
        setStats(liveStats);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const completedBadges = useMemo(() => {
    return badges.filter((b) => {
      const p = badgeProgress.find((prog) => prog.badge_id === b.badge_id);
      return p?.status === "completed";
    });
  }, [badges, badgeProgress]);

  const nextMilestoneXp = stats.totalXp < 500 ? 500 : stats.totalXp < 1000 ? 1000 : 2000;
  const progressToNext = Math.min(100, Math.round((stats.totalXp / nextMilestoneXp) * 100));

  const isStage5Passed = badgeProgress.some(
    (p) => Number(p.badge_id) === 5 && p.status === "completed"
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── 1. Clean Minimal Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Achievements</span>
          </h1>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {completedBadges.length} / {badges.length} Unlocked
          </span>
        </div>

        {isStage5Passed ? (
          <Button
            onClick={() => setShowCertificate(true)}
            size="sm"
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer anim-pop-bounce"
          >
            <Trophy className="w-4 h-4 fill-slate-950" />
            <span>Star Reader Certificate 📜</span>
          </Button>
        ) : (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold"
            title="Complete Stage 5 final quiz to unlock your official Star Reader Certificate"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Certificate Locked (Pass Stage 5)</span>
          </div>
        )}
      </div>

      {/* ── 2. Mastery Rank & XP Overview Card ──────────────────────── */}
      <div className="dashboard-card p-5 sm:p-6 border-2 border-amber-200/80 bg-gradient-to-r from-amber-50/40 via-white to-indigo-50/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Badge Graphic + Current Rank */}
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-2xl bg-white shadow-sm border border-amber-100 flex-shrink-0">
              <BadgeGraphic
                type={completedBadges.length >= 6 ? "medal" : completedBadges.length >= 3 ? "ribbon" : "star"}
                medalType={completedBadges.length >= 6 ? "gold" : undefined}
                size="md"
                status="completed"
              />
            </div>
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">
                Reading Mastery Tier
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {completedBadges.length >= 6
                  ? "Master Reader (Medal Tier)"
                  : completedBadges.length >= 3
                  ? "Ribbon Scholar (Tier 2)"
                  : "Star Scholar (Tier 1)"}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-500">
                <span className="text-blue-600 font-black">+{stats.totalXp} XP</span>
                <span>•</span>
                <span>{stats.quizzesPassed} Quizzes Passed</span>
                {stats.streakDays > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {stats.streakDays}d Streak
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Milestone Progress Bar */}
          <div className="w-full md:w-64 p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-slate-600">Next Rank Goal</span>
              <span className="text-blue-600">{stats.totalXp} / {nextMilestoneXp} XP</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 block text-right">
              {progressToNext}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Unified Clean Badge Cards Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const progress = badgeProgress.find((p) => p.badge_id === badge.badge_id);
          const isCompleted = progress?.status === "completed";
          const isInProgress = progress?.status === "in_progress";
          const isLocked = progress?.status === "locked" || (!progress && badge.badge_id !== 1);
          const categoryLabel = getBadgeCategoryLabel(badge.badge_type, badge.medal_type);

          return (
            <div
              key={badge.badge_id}
              className={`dashboard-card p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 relative overflow-hidden group ${
                isCompleted
                  ? "bg-white border-2 border-emerald-300/80 shadow-sm hover:shadow-md"
                  : isInProgress
                  ? "bg-white border-2 border-blue-300/80 shadow-sm hover:shadow-md"
                  : "bg-slate-50/70 border border-slate-200/80 opacity-75 hover:opacity-100"
              }`}
            >
              <div>
                {/* Top Row: Badge Graphic + Status Chip */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-center">
                    <BadgeGraphic
                      type={badge.badge_type}
                      medalType={badge.medal_type}
                      badgeIconUrl={badge.badge_icon_url}
                      size="sm"
                      status={isCompleted ? "completed" : isInProgress ? "in_progress" : "locked"}
                      showStatusBadge
                    />
                  </div>

                  {isCompleted ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : isInProgress ? (
                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      In Progress ({progress?.completion_percentage || 0}%)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                {/* Badge Details */}
                <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  {badge.badge_name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {badge.description}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-black text-amber-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  +{badge.xp_reward} XP
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Pass ≥{badge.required_passing_score}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {badges.length === 0 && (
        <div className="dashboard-card p-12 text-center space-y-3">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No badges found</p>
          <p className="text-xs text-slate-400">Complete reading chapters to unlock your achievements!</p>
        </div>
      )}

      {/* Star Reader Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        studentName={stats.full_name || "Pupil"}
        section={stats.section || "Grade 3-A"}
        autoPlayAudio={true}
      />
    </div>
  );
}
