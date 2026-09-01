"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Flame,
  GraduationCap,
  Crown,
  Sparkles,
  Award,
  Star,
  CheckCircle2,
  Search,
} from "lucide-react";
import { fetchClassroomLeaderboard } from "@/utils/supabase-queries";
import type { LeaderboardEntry } from "@/lib/types";
import { getCurrentUser } from "@/utils/auth-helpers";
import { LeaderboardSkeleton } from "@/components/page-skeletons";

const TIER_CONFIG: Record<
  string,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  grand_scholar: {
    label: "Grand Scholar",
    icon: "👑",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
  },
  star_explorer: {
    label: "Star Explorer",
    icon: "⭐",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  rising_reader: {
    label: "Rising Reader",
    icon: "🚀",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  story_starter: {
    label: "Story Starter",
    icon: "📖",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

export default function LeaderboardPage() {
  const [scopeMode, setScopeMode] = useState<"class" | "world">("class");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mySection, setMySection] = useState("Grade 3-A");
  const [myTeacherId, setMyTeacherId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState("Teacher");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      const studentSection = user?.section || "Grade 3-A";
      const teacherId = user?.teacherId || null;
      setMySection(studentSection);
      setMyTeacherId(teacherId);
      setCurrentUserId(user?.id || null);

      if (user?.id) {
        try {
          const { createClient } = await import("@/utils/supabase/client");
          const supabase = createClient();
          const { data: prof } = await supabase
            .from("profiles")
            .select("section, teacher_id, teacher:teacher_id(full_name)")
            .eq("id", user.id)
            .maybeSingle();

          if (prof) {
            if (prof.section) setMySection(prof.section);
            if (prof.teacher_id) setMyTeacherId(prof.teacher_id);
            // @ts-expect-error join type
            if (prof.teacher?.full_name) setTeacherName(prof.teacher.full_name);
          }
        } catch {
          // ignore
        }
      }

      const entries = teacherId
        ? await fetchClassroomLeaderboard(undefined, teacherId)
        : await fetchClassroomLeaderboard(studentSection);

      setLeaderboard(entries);
      setLoading(false);
    }

    loadData();
  }, []);

  const handleScopeChange = async (mode: "class" | "world") => {
    setScopeMode(mode);
    setLoading(true);
    let entries: LeaderboardEntry[] = [];

    if (mode === "class") {
      entries = myTeacherId
        ? await fetchClassroomLeaderboard(undefined, myTeacherId)
        : await fetchClassroomLeaderboard(mySection);
    } else {
      entries = await fetchClassroomLeaderboard("all");
    }

    setLeaderboard(entries);
    setLoading(false);
  };

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const maxXp = Math.max(...leaderboard.map((e) => e.totalXp), 1);

  const myRankEntry = useMemo(() => {
    return leaderboard.find((e) => e.studentId === currentUserId);
  }, [leaderboard, currentUserId]);

  const xpToOvertake = useMemo(() => {
    if (!myRankEntry || myRankEntry.rank === 1) return 0;
    const playerAhead = leaderboard.find((e) => e.rank === myRankEntry.rank - 1);
    if (!playerAhead) return 0;
    return Math.max(1, playerAhead.totalXp - myRankEntry.totalXp + 1);
  }, [myRankEntry, leaderboard]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return leaderboard;
    const q = searchQuery.toLowerCase();
    return leaderboard.filter(
      (e) =>
        e.studentName.toLowerCase().includes(q) ||
        e.section.toLowerCase().includes(q) ||
        (e.rankTierLabel && e.rankTierLabel.toLowerCase().includes(q))
    );
  }, [leaderboard, searchQuery]);

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full">
      {/* ── 1. Header & Switcher Tabs ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Leaderboard</span>
          </h1>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {scopeMode === "class" ? mySection : "School-wide"}
          </span>
        </div>

        {/* Segmented Scope Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl self-start sm:self-auto border border-slate-200/60 shadow-2xs">
          <button
            type="button"
            onClick={() => handleScopeChange("class")}
            className={'px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ' + (scopeMode === 'class' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900')}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Classroom ({mySection})</span>
          </button>
          <button
            type="button"
            onClick={() => handleScopeChange("world")}
            className={'px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ' + (scopeMode === 'world' ? 'bg-white text-indigo-700 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900')}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>School-wide</span>
          </button>
        </div>
      </div>

      {/* ── 2. Your Highlighted Rank Banner (Sleek Gradient) ─────────── */}
      {myRankEntry && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white font-black text-lg flex items-center justify-center border border-white/30 shadow-inner">
              #{myRankEntry.rank}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-200 block">
                Your Current Standing
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-black text-white">{myRankEntry.studentName}</span>
                <span className="text-xl">{myRankEntry.avatar}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                  {myRankEntry.rankTierLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 relative border-t md:border-t-0 pt-2.5 md:pt-0 border-white/20 text-xs">
            <div>
              <span className="text-[10px] font-bold text-blue-200 uppercase block">Total Points</span>
              <span className="text-base font-black text-white">+{myRankEntry.totalXp} XP</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-200 uppercase block">Streak</span>
              <span className="text-base font-black text-amber-300 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                {myRankEntry.streakDays}d
              </span>
            </div>
            {myRankEntry.rank > 1 && xpToOvertake > 0 && (
              <div className="hidden lg:block text-right">
                <span className="text-[10px] font-bold text-blue-200 uppercase block">Next Goal</span>
                <span className="text-xs font-bold text-amber-300 bg-black/25 px-2.5 py-0.5 rounded-lg border border-amber-300/30 inline-block">
                  +{xpToOvertake} XP to Rank #{myRankEntry.rank - 1}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. Sleek Colorful Champions Podium ───────────────────────── */}
      {leaderboard.length >= 1 && (
        <div className="dashboard-card p-5 sm:p-7 bg-gradient-to-b from-slate-50/70 via-white to-amber-50/30 border border-amber-200/70 relative overflow-hidden">
          <div className="flex items-end justify-center gap-3 sm:gap-6 lg:gap-8 pt-2 pb-1 max-w-3xl mx-auto">
            {/* #2 Silver Podium */}
            {top2 ? (
              <div className="flex-1 max-w-[200px] flex flex-col items-center group transition-transform hover:-translate-y-1 duration-200">
                <div className="relative mb-2.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-1 ring-3 ring-slate-300 shadow-sm flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl">{top2.avatar}</span>
                  </div>
                  <div className="absolute -bottom-1.5 -right-1 w-5 h-5 rounded-full bg-slate-700 text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                    2
                  </div>
                </div>

                <div className="w-full bg-gradient-to-t from-slate-200/90 via-slate-100 to-white rounded-t-2xl p-3 text-center border border-slate-200 border-b-0 min-h-[90px] flex flex-col justify-end shadow-2xs">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">{top2.studentName}</h3>
                  <span className="text-xs font-black text-blue-600 mt-0.5">+{top2.totalXp} XP</span>
                  <span className="text-[10px] font-bold text-slate-500 mt-0.5 block truncate">
                    {top2.rankTierLabel}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[200px]" />
            )}

            {/* #1 Gold Podium (Elevated) */}
            {top1 && (
              <div className="flex-1 max-w-[230px] flex flex-col items-center -mt-5 group transition-transform hover:-translate-y-1.5 duration-200 z-10">
                <div className="relative mb-2.5">
                  <Crown className="w-6 h-6 text-amber-500 fill-amber-400 mx-auto mb-0.5 animate-bounce" />
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 p-1.5 ring-3 ring-amber-400 ring-offset-2 ring-offset-white shadow-lg shadow-amber-400/30 flex items-center justify-center relative">
                    <span className="text-4xl sm:text-5xl">{top1.avatar}</span>
                  </div>
                  <div className="absolute -bottom-1.5 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                    1
                  </div>
                </div>

                <div className="w-full bg-gradient-to-t from-amber-200/90 via-amber-100/60 to-white rounded-t-2xl p-3.5 text-center border-2 border-amber-300 border-b-0 min-h-[115px] flex flex-col justify-end shadow-md shadow-amber-200/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2)_0%,_transparent_70%)] pointer-events-none" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate relative">{top1.studentName}</h3>
                  <span className="text-xs sm:text-sm font-black text-amber-700 mt-0.5 relative">+{top1.totalXp} XP</span>
                  <span className="text-[10px] font-black text-amber-800/90 mt-0.5 block relative truncate">
                    🏆 {top1.rankTierLabel}
                  </span>
                </div>
              </div>
            )}

            {/* #3 Bronze Podium */}
            {top3 ? (
              <div className="flex-1 max-w-[200px] flex flex-col items-center group transition-transform hover:-translate-y-1 duration-200">
                <div className="relative mb-2.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 p-1 ring-3 ring-amber-300 shadow-sm flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl">{top3.avatar}</span>
                  </div>
                  <div className="absolute -bottom-1.5 -right-1 w-5 h-5 rounded-full bg-amber-800 text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                    3
                  </div>
                </div>

                <div className="w-full bg-gradient-to-t from-amber-100/70 via-amber-50/40 to-white rounded-t-2xl p-3 text-center border border-amber-200 border-b-0 min-h-[80px] flex flex-col justify-end shadow-2xs">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">{top3.studentName}</h3>
                  <span className="text-xs font-black text-blue-600 mt-0.5">+{top3.totalXp} XP</span>
                  <span className="text-[10px] font-bold text-slate-500 mt-0.5 block truncate">
                    {top3.rankTierLabel}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[200px]" />
            )}
          </div>
        </div>
      )}

      {/* ── 4. Full-Width Standings Roster Table ──────────────────────── */}
      <div className="dashboard-card overflow-hidden border border-slate-200/80">
        {/* Table Header Bar with Search */}
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {scopeMode === "class" ? mySection + " Standings" : "School-wide Rankings"}
            </span>
            <span className="text-[11px] font-bold text-slate-400">({leaderboard.length} Readers)</span>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reader..."
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEntries.map((entry) => {
            const isMe = entry.studentId === currentUserId;
            const xpPct = Math.round((entry.totalXp / maxXp) * 100);
            const tierConfig = TIER_CONFIG[entry.rankTier] || TIER_CONFIG.story_starter;

            return (
              <div
                key={entry.studentId}
                className={'px-5 py-3.5 flex items-center gap-4 transition-all duration-150 ' + (isMe ? 'bg-blue-50/70 border-l-4 border-l-blue-600 shadow-2xs' : 'hover:bg-slate-50/80 border-l-4 border-l-transparent')}
              >
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-8 text-center">
                  {entry.rank === 1 ? (
                    <span className="inline-flex w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 text-xs font-black items-center justify-center shadow-xs">
                      1
                    </span>
                  ) : entry.rank === 2 ? (
                    <span className="inline-flex w-7 h-7 rounded-xl bg-slate-200 text-slate-700 text-xs font-black items-center justify-center">
                      2
                    </span>
                  ) : entry.rank === 3 ? (
                    <span className="inline-flex w-7 h-7 rounded-xl bg-amber-100 text-amber-800 text-xs font-black items-center justify-center">
                      3
                    </span>
                  ) : (
                    <span className="text-xs font-black text-slate-400">#{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <span className="text-2xl sm:text-3xl flex-shrink-0">{entry.avatar}</span>

                {/* Name, Tier Pill & Relative XP Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {entry.studentName}
                    </span>
                    {isMe && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-blue-600 text-white uppercase tracking-wider">
                        YOU
                      </span>
                    )}
                    <span
                      className={'text-[9px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-flex items-center gap-1 ' + tierConfig.bg + ' ' + tierConfig.text + ' ' + tierConfig.border}
                    >
                      <span>{tierConfig.icon}</span>
                      <span>{tierConfig.label}</span>
                    </span>
                  </div>

                  {/* Relative XP Progress Bar */}
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={'h-full rounded-full transition-all duration-500 ' + (entry.rank === 1 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : entry.rank <= 3 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-blue-500')}
                        style={{ width: xpPct + '%' }}
                      />
                    </div>
                    <span className="text-xs font-black text-blue-600 flex-shrink-0 min-w-[60px] text-right font-mono">
                      {entry.totalXp} XP
                    </span>
                  </div>
                </div>

                {/* Stats Pill Badges (Right side) */}
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 text-xs">
                  {entry.streakDays > 0 && (
                    <span className="font-black text-amber-600 flex items-center gap-1 hidden sm:inline-flex bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{entry.streakDays}d</span>
                    </span>
                  )}
                  <span className="font-bold text-slate-600 hidden md:inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{entry.quizzesPassed} Passed</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEntries.length === 0 && (
          <div className="py-14 text-center space-y-2">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">No readers found</p>
            <p className="text-xs text-slate-400">Complete reading chapters to appear on the rankings!</p>
          </div>
        )}
      </div>
    </div>
  );
}
