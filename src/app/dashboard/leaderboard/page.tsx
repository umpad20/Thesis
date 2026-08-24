"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Flame,
  ChevronRight,
  Sparkles,
  Users,
  Target,
  FileCheck2,
  Medal,
  Award,
  Globe2,
  GraduationCap,
} from "lucide-react";
import {
  fetchClassroomLeaderboard,
  fetchBadgesFromSupabase,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import { createClient } from "@/utils/supabase/client";
import type { LeaderboardEntry } from "@/lib/types";

export default function StudentLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [scopeMode, setScopeMode] = useState<"class" | "section" | "world">("class");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [availableSections, setAvailableSections] = useState<string[]>(["Grade 3-A", "Grade 3-B"]);
  const [teacherName, setTeacherName] = useState<string>("Grade 3 Faculty");
  const [myTeacherId, setMyTeacherId] = useState<string>("");
  const [mySection, setMySection] = useState<string>("Grade 3-A");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      let teacherId = user?.teacherId || "";
      let sectionName = user?.section || "Grade 3-A";

      if (user?.id) {
        setCurrentUserId(user.id);
        const supabase = createClient();
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("teacher_id, section, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (myProfile?.teacher_id) {
          teacherId = myProfile.teacher_id;
          setMyTeacherId(teacherId);

          const { data: teacherProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", teacherId)
            .maybeSingle();

          if (teacherProfile?.full_name) {
            setTeacherName(teacherProfile.full_name);
          }
        }
        if (myProfile?.section) {
          sectionName = myProfile.section;
          setMySection(sectionName);
          setSelectedSection(sectionName);
        }
      }

      // Default to My Class Cohort
      const entries = teacherId
        ? await fetchClassroomLeaderboard(undefined, teacherId)
        : await fetchClassroomLeaderboard(sectionName);

      setLeaderboard(entries);

      // Fetch all available sections for section tab
      const allWorldEntries = await fetchClassroomLeaderboard("all");
      const sections = Array.from(new Set(allWorldEntries.map((e) => e.section).filter(Boolean)));
      if (sections.length > 0) {
        setAvailableSections(sections);
      }
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
      // world / global
      entries = await fetchClassroomLeaderboard("all");
    }

    setLeaderboard(entries);
    setLoading(false);
  };

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const restLeaderboard = leaderboard.slice(3);

  const myRankEntry = leaderboard.find((e) => e.studentId === currentUserId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── 1. Header & Navigation Trail ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-slate-600">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">Leaderboard Standings</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500 fill-amber-400" />
            <span>
              {scopeMode === "class"
                ? `${mySection} Classroom Champions`
                : "World School Leaderboard"}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {scopeMode === "class"
              ? `Real classmates enrolled in Teacher ${teacherName}'s ${mySection} class`
              : "Pedro Victorina Calo ES · Grand school-wide reading standings"}
          </p>
        </div>

        {/* Dual Leaderboard Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleScopeChange("class")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              scopeMode === "class"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>👥 My Classroom ({teacherName.split(" ")[0]})</span>
          </button>

          <button
            type="button"
            onClick={() => handleScopeChange("world")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              scopeMode === "world"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>🌍 School World (All)</span>
          </button>
        </div>
      </div>

      {/* ── 2. My Rank Spotlight Banner ───────────────────────────────── */}
      {myRankEntry && (
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl text-white shadow-xl shadow-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-400/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              {myRankEntry.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-100">Your Current Standing</span>
                <span className="text-[10px] font-black uppercase bg-white/20 text-white px-2 py-0.5 rounded-md">
                  {myRankEntry.rankTierLabel}
                </span>
              </div>
              <h3 className="text-base font-black tracking-tight">
                {myRankEntry.rank === 1
                  ? "🥇 1st Place Champion!"
                  : myRankEntry.rank === 2
                  ? "🥈 2nd Place Medalist!"
                  : myRankEntry.rank === 3
                  ? "🥉 3rd Place Medalist!"
                  : `Rank #${myRankEntry.rank} in ${myRankEntry.section}`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-white/20 pt-3 sm:pt-0 sm:pl-6 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-blue-200 block">Total XP</span>
              <span className="text-lg font-black">{myRankEntry.totalXp} XP</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-blue-200 block">Accuracy</span>
              <span className="text-lg font-black">{myRankEntry.comprehensionPct}%</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-blue-200 block">Streak</span>
              <span className="text-lg font-black flex items-center gap-0.5 text-amber-300">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                {myRankEntry.streakDays}d
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. 3D Top-3 Reading Champions Podium ─────────────────────── */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Computing classroom standings from live quizzes...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="dashboard-card p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">No Student Records Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once pupils complete story lessons and comprehension quizzes, live rankings will appear here!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="dashboard-card p-6 md:p-8 bg-gradient-to-b from-slate-50/90 to-white border-2 border-slate-100">
            <div className="text-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                🏆 Top Reading Masters
              </span>
              <h2 className="text-lg md:text-xl font-black text-slate-900 mt-1">
                {scopeMode === "class"
                  ? `Teacher ${teacherName.split(" ")[0]}'s Class Champions Podium`
                  : "Pedro Victorina Calo ES School-Wide Champions Podium"}
              </h2>
            </div>

            <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-2xl mx-auto pt-6 pb-2">
              {/* 🥈 2nd Place (Silver) */}
              {top2 && (
                <div className="flex-1 text-center flex flex-col items-center">
                  <div className="relative mb-2">
                    <span className="text-3xl sm:text-4xl block transform hover:scale-110 transition-transform">
                      {top2.avatar}
                    </span>
                    <span className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                      2
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 truncate max-w-[100px] sm:max-w-[130px]">
                    {top2.studentName}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">
                    {top2.totalXp} XP
                  </span>

                  {/* Podium Column */}
                  <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-slate-300 via-slate-200 to-slate-100 rounded-t-2xl mt-3 flex flex-col items-center justify-center shadow-inner border border-slate-300/60 p-2">
                    <Medal className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-xs font-black text-slate-700">2nd Place</span>
                    <span className="text-[10px] font-bold text-slate-500">{top2.comprehensionPct}% Acc</span>
                  </div>
                </div>
              )}

              {/* 🥇 1st Place (Gold Champion) */}
              {top1 && (
                <div className="flex-1 text-center flex flex-col items-center z-10">
                  <div className="relative mb-2">
                    <Crown className="w-7 h-7 text-amber-500 fill-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                    <span className="text-4xl sm:text-5xl block transform hover:scale-110 transition-transform ring-4 ring-amber-300/80 rounded-full p-1 bg-amber-50">
                      {top1.avatar}
                    </span>
                    <span className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-md">
                      1
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 truncate max-w-[120px] sm:max-w-[160px]">
                    {top1.studentName}
                  </h4>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md mt-0.5 font-mono">
                    {top1.totalXp} XP
                  </span>

                  {/* Podium Column (Tallest) */}
                  <div className="w-full h-36 sm:h-48 bg-gradient-to-t from-amber-400 via-amber-300 to-amber-100 rounded-t-2xl mt-3 flex flex-col items-center justify-center shadow-lg border-2 border-amber-400 p-2">
                    <Trophy className="w-8 h-8 text-amber-600 fill-amber-500 mb-1 drop-shadow-xs" />
                    <span className="text-xs sm:text-sm font-black text-amber-900">Grand Champion</span>
                    <span className="text-[10px] font-bold text-amber-800">{top1.comprehensionPct}% Accuracy</span>
                    <span className="text-[9px] font-black text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded-full mt-1">
                      🔥 {top1.streakDays} Day Streak
                    </span>
                  </div>
                </div>
              )}

              {/* 🥉 3rd Place (Bronze) */}
              {top3 && (
                <div className="flex-1 text-center flex flex-col items-center">
                  <div className="relative mb-2">
                    <span className="text-3xl sm:text-4xl block transform hover:scale-110 transition-transform">
                      {top3.avatar}
                    </span>
                    <span className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                      3
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 truncate max-w-[100px] sm:max-w-[130px]">
                    {top3.studentName}
                  </h4>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md mt-0.5">
                    {top3.totalXp} XP
                  </span>

                  {/* Podium Column */}
                  <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-amber-700/40 via-amber-600/30 to-amber-100 rounded-t-2xl mt-3 flex flex-col items-center justify-center shadow-inner border border-amber-700/30 p-2">
                    <Medal className="w-5 h-5 text-amber-700 mb-1" />
                    <span className="text-xs font-black text-amber-900">3rd Place</span>
                    <span className="text-[10px] font-bold text-amber-800">{top3.comprehensionPct}% Acc</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 4. Full Classroom Leaderboard Table (Ranks 4+) ───────── */}
          <div className="dashboard-card p-6 space-y-4 border-2 border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Classroom Standings Roster ({leaderboard.length} Pupils)</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                Ranked by Total XP &amp; Comprehension
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {leaderboard.map((entry) => {
                const isMe = entry.studentId === currentUserId;
                return (
                  <div
                    key={entry.studentId}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      isMe
                        ? "bg-blue-50/90 border border-blue-300/80 shadow-xs"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Rank Number Pill */}
                      <span
                        className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                          entry.rank === 1
                            ? "bg-amber-400 text-amber-950 shadow-xs"
                            : entry.rank === 2
                            ? "bg-slate-300 text-slate-900"
                            : entry.rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        #{entry.rank}
                      </span>

                      {/* Avatar & Name */}
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{entry.avatar}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">
                              {entry.studentName}
                            </span>
                            {isMe && (
                              <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                            <span>{entry.section}</span>
                            <span>·</span>
                            <span className="text-slate-600 font-bold">{entry.currentBadgeName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics: Rank Tier, Accuracy, Streak, XP */}
                    <div className="flex items-center gap-3 sm:gap-6 text-right">
                      <span className="hidden md:inline-block text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {entry.rankTierLabel}
                      </span>

                      <div className="hidden sm:block">
                        <span className="text-[10px] text-slate-400 block">Comprehension</span>
                        <span className="text-xs font-black text-emerald-600">
                          {entry.comprehensionPct}%
                        </span>
                      </div>

                      <div className="hidden sm:block">
                        <span className="text-[10px] text-slate-400 block">Streak</span>
                        <span className="text-xs font-black text-amber-600 flex items-center justify-end gap-0.5">
                          <Flame className="w-3 h-3 fill-amber-500" />
                          {entry.streakDays}d
                        </span>
                      </div>

                      <div className="min-w-[60px]">
                        <span className="text-[10px] text-slate-400 block">XP</span>
                        <span className="text-xs font-black text-blue-600 font-mono">
                          {entry.totalXp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
