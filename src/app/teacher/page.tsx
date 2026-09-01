"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  FileCheck2,
  Plus,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  UserPlus,
  AlertTriangle,
  Trophy,
  Flame,
  CheckCircle2,
  HelpCircle,
  Send,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BadgeGraphic } from "@/components/badge-graphic";
import {
  fetchClassRosterReports,
  fetchAllLessons,
  fetchBadgesFromSupabase,
  fetchMasteryStageDistribution,
  fetchTeacherInterventionRadar,
  fetchClassroomLeaderboard,
  type TeacherReportRow,
  type MasteryStageDistribution,
} from "@/utils/supabase-queries";
import { fetchTeacherSectionsFromSupabase, getCurrentUser } from "@/utils/auth-helpers";
import { TeacherDashboardSkeleton } from "@/components/page-skeletons";
import type { InterventionRadarSummary, InterventionPupil, LeaderboardEntry, Badge } from "@/lib/types";

export default function TeacherDashboard() {
  const [reports, setReports] = useState<TeacherReportRow[]>([]);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [badgesCount, setBadgesCount] = useState(5);
  const [badgesList, setBadgesList] = useState<Badge[]>([]);
  const [sections, setSections] = useState<string[]>(["Grade 3-A"]);
  const [selectedSection, setSelectedSection] = useState("all");
  const [distribution, setDistribution] = useState<MasteryStageDistribution>({
    starCount: 0,
    starPct: 0,
    ribbonCount: 0,
    ribbonPct: 0,
    medalCount: 0,
    medalPct: 0,
    totalStudents: 0,
  });
  const [radar, setRadar] = useState<InterventionRadarSummary>({
    criticalCount: 0,
    watchlistCount: 0,
    masteringCount: 0,
    totalEnrolled: 0,
    pupils: [],
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Guidance Note Modal State
  const [selectedPupilForNote, setSelectedPupilForNote] = useState<InterventionPupil | null>(null);
  const [noteMessage, setNoteMessage] = useState("");
  const [noteSent, setNoteSent] = useState(false);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const user = getCurrentUser();
      const teacherId = user?.id || "";

      const [roster, lessons, liveSections, badges, dist, radarData, topLeaderboard] = await Promise.all([
        fetchClassRosterReports(selectedSection, teacherId),
        fetchAllLessons(),
        fetchTeacherSectionsFromSupabase(teacherId),
        fetchBadgesFromSupabase(),
        fetchMasteryStageDistribution(selectedSection, teacherId),
        fetchTeacherInterventionRadar(teacherId, selectedSection),
        fetchClassroomLeaderboard(selectedSection, teacherId),
      ]);

      setReports(roster);
      setLessonsCount(lessons.length);
      setBadgesCount(badges.length);
      setBadgesList(badges);
      if (Array.isArray(liveSections) && liveSections.length > 0) {
        setSections(liveSections);
      }
      setDistribution(dist);
      setRadar(radarData);
      setLeaderboard(topLeaderboard.slice(0, 5));
      setLoading(false);
    }
    loadStats();
  }, [selectedSection]);

  const studentCount = reports.length;

  const validScores = reports
    .map((r) => Number.parseFloat(r.comprehensionPct))
    .filter((n) => !Number.isNaN(n) && n > 0);

  const avgScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length)
      : 0;

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteMessage.trim()) return;
    setNoteSent(true);
    setTimeout(() => {
      setNoteSent(false);
      setSelectedPupilForNote(null);
      setNoteMessage("");
    }, 1500);
  };

  const [radarFilter, setRadarFilter] = useState<"all" | "critical" | "watchlist" | "mastering">("all");

  const displayedRadarPupils = radar.pupils.filter((p) => {
    if (radarFilter === "all") return true;
    return p.riskLevel === radarFilter;
  });

  // Effective champions list strictly driven by live database leaderboard
  const displayChampions: LeaderboardEntry[] = leaderboard;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>ReadSmart</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">Faculty Portal</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Grade 3 Classroom Reading Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Pedro Victorina Calo Elementary School · Live Database Cohort Monitoring
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/teacher/students">
            <Button
              size="sm"
              className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </Button>
          </Link>
          <Link href="/teacher/lessons">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Add Story</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Enrolled Pupils
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{studentCount}</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {sections.length} Section{sections.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Active database accounts</p>
        </div>

        <div className="dashboard-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Class Comprehension
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{avgScore}%</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                avgScore >= 70
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              Target ≥70%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">DepEd Grade 3 benchmark</p>
        </div>

        <div className="dashboard-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Curriculum Stories
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{lessonsCount}</span>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Passages
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Max 3 stories per badge</p>
        </div>

        <div className="dashboard-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Accolades
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{badgesCount}</span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Badges
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">5 Default + Custom Badges</p>
        </div>
      </div>

      {/* 3. Section Filter Chips */}
      <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Class Section:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedSection("all")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedSection === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            All Sections ({studentCount})
          </button>
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedSection === sec
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <Link
          href="/teacher/students"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded-xl hover:bg-blue-50"
        >
          <span>Manage Sections →</span>
        </Link>
      </div>

      {/* ── 4. 🚨 Early Intervention & Struggling Pupils Radar ──────────── */}
      <div className="dashboard-card p-6 border-2 border-rose-100/80 bg-gradient-to-b from-rose-50/20 to-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Pupil Early-Intervention &amp; Attention Radar</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live algorithmic monitoring of enrolled pupils requiring reading assistance, phonics support, or score recovery.
            </p>
          </div>

          {/* Interactive Radar Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
            <button
              type="button"
              onClick={() => setRadarFilter("all")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                radarFilter === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
            >
              All ({radar.pupils.length})
            </button>
            <button
              type="button"
              onClick={() => setRadarFilter("critical")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                radarFilter === "critical"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200"
              }`}
            >
              🔴 {radar.criticalCount} Critical
            </button>
            <button
              type="button"
              onClick={() => setRadarFilter("watchlist")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                radarFilter === "watchlist"
                  ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                  : "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
              }`}
            >
              🟡 {radar.watchlistCount} Watchlist
            </button>
            <button
              type="button"
              onClick={() => setRadarFilter("mastering")}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                radarFilter === "mastering"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
              }`}
            >
              🟢 {radar.masteringCount} Mastering
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Evaluating classroom risk factors...</div>
        ) : displayedRadarPupils.length === 0 ? (
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-900 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-xs">
              <strong>All enrolled pupils are on track!</strong> No pupils in this filter view.
            </div>
          </div>
        ) : (
          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5 min-w-[160px]">Pupil</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-center">Score</th>
                    <th className="py-2.5 px-3.5 hidden md:table-cell min-w-[220px]">Algorithmic Insight &amp; Advice</th>
                    <th className="py-2.5 px-3.5 text-right min-w-[140px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {displayedRadarPupils.map((p) => {
                    const isCritical = p.riskLevel === "critical";
                    const isWatchlist = p.riskLevel === "watchlist";

                    return (
                      <tr
                        key={p.studentId}
                        className={`transition-colors ${
                          isCritical
                            ? "bg-rose-50/30 hover:bg-rose-50/50"
                            : isWatchlist
                            ? "bg-amber-50/30 hover:bg-amber-50/50"
                            : "hover:bg-slate-50/70"
                        }`}
                      >
                        {/* Pupil Avatar & Name */}
                        <td className="py-2.5 px-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-lg flex-shrink-0">{p.avatar}</span>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 truncate block text-xs">
                                {p.studentName}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {p.section}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status Chip */}
                        <td className="py-2.5 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                              isCritical
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : isWatchlist
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <span>{isCritical ? "🔴" : isWatchlist ? "🟡" : "🟢"}</span>
                            <span>{isCritical ? "Needs Attention" : isWatchlist ? "Watchlist" : "On Track"}</span>
                          </span>
                        </td>

                        {/* Score & Quizzes */}
                        <td className="py-2.5 px-3.5 text-center">
                          <span className="font-bold text-slate-900 block text-xs">
                            {p.comprehensionPct}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {p.quizzesPassed} Passed
                          </span>
                        </td>

                        {/* Insight & Recommended Action */}
                        <td className="py-2.5 px-3.5 hidden md:table-cell">
                          <div className="text-[11px] leading-snug">
                            <span className={`font-semibold ${isCritical ? "text-rose-900" : isWatchlist ? "text-amber-900" : "text-emerald-900"}`}>
                              {p.struggleReason}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              💡 {p.recommendedAction}
                            </span>
                          </div>
                        </td>

                        {/* Quick Actions */}
                        <td className="py-2.5 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => setSelectedPupilForNote(p)}
                              className={`h-6 px-2 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer ${
                                isCritical
                                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                                  : isWatchlist
                                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>{p.riskLevel === "mastering" ? "Praise" : "Guidance"}</span>
                            </Button>
                            <Link href="/teacher/students">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 rounded-lg text-slate-700 font-bold text-[10px]"
                              >
                                Record
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. 🏆 Classroom Champions & Live Mastery Progression ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Champions Leaderboard Snapshot */}
        <div className="dashboard-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Classroom Reading Champions</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Top XP Ranks</span>
          </div>

          {displayChampions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No pupil quiz attempts recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {displayChampions.map((entry) => (
                <div
                  key={entry.studentId}
                  className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100 rounded-xl transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg font-black text-[11px] flex items-center justify-center ${
                        entry.rank === 1
                          ? "bg-amber-400 text-amber-950 font-bold"
                          : entry.rank === 2
                          ? "bg-slate-300 text-slate-900"
                          : entry.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      #{entry.rank}
                    </span>
                    <span className="text-lg">{entry.avatar}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">{entry.studentName}</h4>
                      <span className="text-[10px] text-slate-400">{entry.section} · {entry.rankTierLabel}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-blue-600 font-mono block">{entry.totalXp} XP</span>
                    <span className="text-[10px] font-bold text-emerald-600">{entry.comprehensionPct}% Acc</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Mastery Stage Distribution */}
        <div className="dashboard-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Mastery Pathway Distribution</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">5-Stage Model</span>
          </div>

          {distribution.totalStudents === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Enroll pupils to see distribution.</div>
          ) : (
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">⭐ Star Badges (Lesson Mastery Stage)</span>
                  <span className="text-slate-900">
                    {distribution.starCount} Pupils ({distribution.starPct}%)
                  </span>
                </div>
                <Progress value={distribution.starPct} className="h-2 bg-slate-100" />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-blue-700">🎗️ Ribbon Badges (Cumulative Checkpoint)</span>
                  <span className="text-blue-700 font-bold">
                    {distribution.ribbonCount} Pupils ({distribution.ribbonPct}%)
                  </span>
                </div>
                <Progress value={distribution.ribbonPct} className="h-2 bg-slate-100" />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-700">🏅 Medal Badges (Bronze, Silver &amp; Gold)</span>
                  <span className="text-emerald-700 font-bold">
                    {distribution.medalCount} Pupils ({distribution.medalPct}%)
                  </span>
                </div>
                <Progress value={distribution.medalPct} className="h-2 bg-slate-100" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 6. Active Curriculum & Stage Badges Showcase ──────────────── */}
      <div className="dashboard-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Active Curriculum Stages &amp; Classroom Quests ({badgesList.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              5 Protected Core DepEd Stages + Teacher-Created Classroom Quests.
            </p>
          </div>
          <Link
            href="/teacher/badges"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Manage All Badges →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {badgesList.map((b) => {
            const isCore = b.badge_id <= 5;
            return (
              <Link
                key={b.badge_id}
                href={isCore ? "/teacher/badges" : `/teacher/badges/create?editBadgeId=${b.badge_id}`}
                className={`p-3 rounded-2xl border transition-all hover:scale-102 flex flex-col items-center text-center justify-between gap-2 cursor-pointer ${
                  isCore
                    ? "bg-slate-50/70 border-slate-200 hover:bg-slate-100/80"
                    : "bg-indigo-50/40 border-indigo-200 hover:bg-indigo-50 shadow-xs"
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    isCore ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"
                  }`}>
                    {isCore ? `Core ${b.badge_order || b.badge_id}` : "Teacher"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    +{b.xp_reward} XP
                  </span>
                </div>

                <BadgeGraphic
                  badgeIconUrl={b.badge_icon_url}
                  type={b.badge_type}
                  medalType={b.badge_type === "medal" ? b.medal_type : undefined}
                  size="sm"
                  status="completed"
                />

                <div className="w-full">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    {b.badge_name}
                  </h4>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Pass ≥{b.required_passing_score}%
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 7. Live Pupil Performance Snapshot Table ──────────────────── */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Pupil Roster Snapshot ({selectedSection === "all" ? "All Sections" : selectedSection})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Direct student accounts with active badge milestones, comprehension, and status.
            </p>
          </div>
          <Link href="/teacher/students" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            Open Full Roster →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading student records...</div>
        ) : reports.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">No pupils registered in your classroom yet</p>
              <p className="text-[11px] text-slate-400">Enroll your students to start tracking their live reading comprehension and badge milestones.</p>
            </div>
            <Link href="/teacher/students">
              <Button size="sm" className="h-8 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs">
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                <span>Enroll Student</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3">Pupil Name / ID</th>
                  <th className="pb-3">Section</th>
                  <th className="pb-3">Active Badge Goal</th>
                  <th className="pb-3">Comprehension</th>
                  <th className="pb-3">Quizzes Passed</th>
                  <th className="pb-3 text-right">Mastery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reports.slice(0, 5).map((s) => (
                  <tr key={s.studentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{s.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{s.studentId}</span>
                    </td>
                    <td className="py-3">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px] border border-blue-200">
                        {s.section}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700 font-semibold">{s.currentBadge}</td>
                    <td className="py-3 font-bold text-slate-900">{s.comprehensionPct}</td>
                    <td className="py-3 text-slate-600">{s.quizzesPassed}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === "Mastering"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : s.status === "On Track"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 7. Send Guidance Note Modal ───────────────────────────────── */}
      {selectedPupilForNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 anim-pop-bounce">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedPupilForNote.avatar}</span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Guidance Note for {selectedPupilForNote.studentName}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">{selectedPupilForNote.section}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPupilForNote(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {noteSent ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-slate-900">Guidance Note Dispatched!</h4>
                <p className="text-xs text-slate-500">The encouragement advice has been sent to the pupil.</p>
              </div>
            ) : (
              <form onSubmit={handleSendNote} className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <strong>Intervention Recommendation:</strong> {selectedPupilForNote.recommendedAction}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Teacher Encouragement &amp; Hint Message</label>
                  <textarea
                    rows={3}
                    value={noteMessage}
                    onChange={(e) => setNoteMessage(e.target.value)}
                    placeholder="e.g., Don't worry! Try re-reading the clues on Page 2 and test your understanding with Chapter 1 again."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPupilForNote(null)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Note to Student</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
