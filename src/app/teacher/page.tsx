"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  FileCheck2,
  ArrowRight,
  ChevronRight,
  Award,
  Layers,
  Trophy,
  Flame,
  CheckCircle2,
  HelpCircle,
  Send,
  X,
  MessageSquare,
  Crown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BadgeGraphic } from "@/components/badge-graphic";
import { StudentAvatar } from "@/components/student-avatar";
import { StudentRecordModal } from "@/components/student-record-modal";
import {
  fetchClassRosterReports,
  fetchAllLessons,
  fetchBadgesFromSupabase,
  fetchMasteryStageDistribution,
  fetchClassroomActivityFeed,
  fetchClassroomLeaderboard,
  sendTeacherGuidanceNote,
  type TeacherReportRow,
  type MasteryStageDistribution,
  type ClassroomActivityItem,
} from "@/utils/supabase-queries";
import { fetchTeacherSectionsFromSupabase, getCurrentUser } from "@/utils/auth-helpers";
import { TeacherDashboardSkeleton } from "@/components/page-skeletons";
import type { InterventionPupil, LeaderboardEntry, Badge } from "@/lib/types";

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

function formatTimeAgo(timestamp: string): string {
  try {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch {
    return "Recent";
  }
}

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
  const [activityFeed, setActivityFeed] = useState<ClassroomActivityItem[]>([]);
  const [feedFilter, setFeedFilter] = useState<"all" | "quiz" | "badge">("all");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [totalAllCount, setTotalAllCount] = useState<number | null>(null);

  // Guidance Note Modal State
  const [selectedPupilForNote, setSelectedPupilForNote] = useState<InterventionPupil | null>(null);
  const [noteMessage, setNoteMessage] = useState("");
  const [noteSent, setNoteSent] = useState(false);
  const [isSendingNote, setIsSendingNote] = useState(false);

  // Student Record Modal State
  const [selectedPupilForRecord, setSelectedPupilForRecord] = useState<InterventionPupil | null>(null);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const user = getCurrentUser();
      const teacherId = user?.id || "";

      const [allRoster, roster, lessons, liveSections, badges, dist, feed, topLeaderboard] = await Promise.all([
        selectedSection === "all" ? Promise.resolve([]) : fetchClassRosterReports("all", teacherId),
        fetchClassRosterReports(selectedSection, teacherId),
        fetchAllLessons(),
        fetchTeacherSectionsFromSupabase(teacherId),
        fetchBadgesFromSupabase(),
        fetchMasteryStageDistribution(selectedSection, teacherId),
        fetchClassroomActivityFeed(selectedSection, teacherId),
        fetchClassroomLeaderboard(selectedSection, teacherId),
      ]);

      setReports(roster);
      if (selectedSection === "all") {
        setTotalAllCount(roster.length);
      } else if (allRoster.length > 0) {
        setTotalAllCount(allRoster.length);
      }
      setLessonsCount(lessons.length);
      setBadgesCount(badges.length);
      setBadgesList(badges);
      if (Array.isArray(liveSections) && liveSections.length > 0) {
        setSections(liveSections);
      }
      setDistribution(dist);
      setActivityFeed(feed);
      setLeaderboard(topLeaderboard);
      setLoading(false);
    }
    loadStats();
  }, [selectedSection]);

  const studentCount = reports.length;

  // Active Readers: pupils who have logged activity in the curriculum
  const activeReadersCount = reports.filter((r) => {
    const passed = Number.parseInt(r.quizzesPassed?.split("/")[0] || "0", 10);
    const total = Number.parseInt(r.quizzesPassed?.split("/")[1] || "0", 10);
    return (r.totalXp || 0) > 0 || total > 0 || passed > 0;
  }).length;

  const activeReadersPct =
    studentCount > 0 ? Math.round((activeReadersCount / studentCount) * 100) : 0;

  // Target stories in curriculum
  const targetStoriesPerPupil = lessonsCount > 0 ? lessonsCount : 16;

  // Pupils who completed the curriculum stories goal
  const pupilsCompletedGoal = reports.filter((r) => {
    const passed = Number.parseInt(r.quizzesPassed?.split("/")[0] || "0", 10);
    return r.isAllStagesCompleted || (!Number.isNaN(passed) && passed >= targetStoriesPerPupil);
  }).length;

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteMessage.trim() || !selectedPupilForNote) return;

    setIsSendingNote(true);
    const user = getCurrentUser();
    const teacherName = user?.fullName || "Your Teacher";
    const teacherId = user?.id || undefined;
    const isPraise = selectedPupilForNote.riskLevel === "mastering";

    await sendTeacherGuidanceNote({
      studentId: selectedPupilForNote.studentId,
      teacherId,
      teacherName,
      title: isPraise ? `Teacher Praise from ${teacherName} ⭐` : `Teacher Guidance Note from ${teacherName} 📝`,
      message: noteMessage.trim(),
      recommendation: selectedPupilForNote.recommendedAction,
      type: isPraise ? "praise" : "guidance_note",
    });

    setIsSendingNote(false);
    setNoteSent(true);
    setTimeout(() => {
      setNoteSent(false);
      setSelectedPupilForNote(null);
      setNoteMessage("");
    }, 1500);
  };

  const displayedActivities = activityFeed.filter((act) => {
    if (feedFilter === "all") return true;
    if (feedFilter === "quiz") return act.type === "quiz_pass" || act.type === "quiz_attempt";
    if (feedFilter === "badge") return act.type === "badge_earned";
    return true;
  });

  // Effective champions list strictly driven by live database leaderboard
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const maxLeaderboardXp = Math.max(...leaderboard.map((e) => e.totalXp || 0), 1);

  const filteredLeaderboard = leaderboard.filter((entry) => {
    if (!leaderboardSearch.trim()) return true;
    const q = leaderboardSearch.toLowerCase();
    return (
      entry.studentName.toLowerCase().includes(q) ||
      (entry.section && entry.section.toLowerCase().includes(q)) ||
      (entry.rankTierLabel && entry.rankTierLabel.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Classroom Reading Hub
          </h1>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Readers
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {activeReadersCount} / {studentCount}
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              {activeReadersPct}% Active
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Pupils logged in & reading</p>
        </div>

        <div className="dashboard-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Goal Completed
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-800">
              {pupilsCompletedGoal} / {studentCount}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Pupils on Track
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Cleared all {targetStoriesPerPupil} stories
          </p>
        </div>

        <div className="dashboard-card p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Curriculum Stories
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{lessonsCount}</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
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
            <span className="text-2xl font-black text-purple-900">{badgesCount}</span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              Badges
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">5 Default + Custom Badges</p>
        </div>
      </div>

      {/* 3. Section Filter Chips */}
      <div className="dashboard-card p-3 bg-slate-50/90 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Class Section:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedSection("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSection === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            All Sections ({totalAllCount ?? studentCount})
          </button>
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSection(sec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSection === sec
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <Link
          href="/teacher/students"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded-xl hover:bg-blue-50 transition-colors"
        >
          <span>Manage Sections →</span>
        </Link>
      </div>

      {/* ── 4. 🏆 Student Champions Podium & Standings Leaderboard (Matching Photo 2) ── */}
      <div className="space-y-4">
        {/* Champions Podium */}
        {leaderboard.length >= 1 && (
          <div className="dashboard-card px-2.5 py-4 sm:p-6 lg:p-7 bg-gradient-to-b from-slate-50/80 via-white to-amber-50/40 border-2 border-amber-200/80 relative overflow-hidden shadow-xs">
            <div className="flex items-end justify-center gap-2 sm:gap-4 lg:gap-6 pt-1 pb-1 max-w-2xl mx-auto w-full">
              {/* #2 Silver Podium */}
              {top2 ? (
                <div className="flex-1 max-w-[190px] min-w-0 flex flex-col items-center group transition-transform hover:-translate-y-1 duration-200">
                  <div className="relative mb-2">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-1 ring-3 ring-slate-300 shadow-sm flex items-center justify-center">
                      <StudentAvatar
                        avatar={top2.avatar}
                        name={top2.studentName}
                        size="lg"
                        className="w-11 h-11 sm:w-14 sm:h-14 shadow-sm"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                      2
                    </div>
                  </div>

                  <div className="w-full bg-gradient-to-t from-slate-200/90 via-slate-100/80 to-white rounded-2xl p-2.5 sm:p-3 text-center border-2 border-slate-300/80 min-h-[85px] sm:min-h-[95px] flex flex-col justify-end shadow-xs">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate" title={top2.studentName}>
                      {top2.studentName}
                    </h3>
                    <span className="text-[11px] sm:text-xs font-black text-blue-600 mt-0.5">
                      +{top2.totalXp} XP
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 mt-0.5 block truncate">
                      🥈 {top2.rankTierLabel}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 max-w-[190px]" />
              )}

              {/* #1 Gold Podium (Elevated) */}
              {top1 && (
                <div className="flex-1 max-w-[210px] min-w-0 flex flex-col items-center -mt-4 sm:-mt-5 group transition-transform hover:-translate-y-1.5 duration-200 z-10">
                  <div className="relative mb-2">
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-400 mx-auto mb-0.5 animate-bounce" />
                    <div className="w-15 h-15 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 p-1.5 ring-3 ring-amber-400 ring-offset-2 ring-offset-white shadow-lg shadow-amber-400/30 flex items-center justify-center relative">
                      <StudentAvatar
                        avatar={top1.avatar}
                        name={top1.studentName}
                        size="xl"
                        className="w-12 h-12 sm:w-16 sm:h-16 shadow-md"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                      1
                    </div>
                  </div>

                  <div className="w-full bg-gradient-to-t from-amber-200/90 via-amber-100/70 to-white rounded-2xl p-2.5 sm:p-3.5 text-center border-2 border-amber-400 min-h-[105px] sm:min-h-[120px] flex flex-col justify-end shadow-md shadow-amber-300/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2)_0%,_transparent_70%)] pointer-events-none" />
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate relative" title={top1.studentName}>
                      {top1.studentName}
                    </h3>
                    <span className="text-xs sm:text-sm font-black text-amber-700 mt-0.5 relative">
                      +{top1.totalXp} XP
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-black text-amber-800/90 mt-0.5 block relative truncate">
                      🏆 {top1.rankTierLabel}
                    </span>
                  </div>
                </div>
              )}

              {/* #3 Bronze Podium */}
              {top3 ? (
                <div className="flex-1 max-w-[190px] min-w-0 flex flex-col items-center group transition-transform hover:-translate-y-1 duration-200">
                  <div className="relative mb-2">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 p-1 ring-3 ring-amber-400/80 shadow-sm flex items-center justify-center">
                      <StudentAvatar
                        avatar={top3.avatar}
                        name={top3.studentName}
                        size="lg"
                        className="w-11 h-11 sm:w-14 sm:h-14 shadow-sm"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                      3
                    </div>
                  </div>

                  <div className="w-full bg-gradient-to-t from-amber-100/90 via-orange-50/60 to-white rounded-2xl p-2.5 sm:p-3 text-center border-2 border-amber-300/80 min-h-[75px] sm:min-h-[85px] flex flex-col justify-end shadow-xs">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate" title={top3.studentName}>
                      {top3.studentName}
                    </h3>
                    <span className="text-[11px] sm:text-xs font-black text-blue-600 mt-0.5">
                      +{top3.totalXp} XP
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 mt-0.5 block truncate">
                      🥉 {top3.rankTierLabel}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 max-w-[190px]" />
              )}
            </div>

            {/* Unified Champion Stage Base */}
            <div className="w-full max-w-2xl mx-auto h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-slate-200 via-amber-300 to-slate-200 shadow-inner mt-1.5 opacity-90" />
          </div>
        )}

        {/* Full-Width Standings Roster Table with Search */}
        <div className="dashboard-card overflow-hidden border border-slate-200/80 bg-white">
          {/* Table Header Bar with Search */}
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                {selectedSection === "all" ? "School-wide Rankings" : `${selectedSection} Standings`}
              </span>
              <span className="text-[11px] font-bold text-slate-400">({leaderboard.length} Readers)</span>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={leaderboardSearch}
                onChange={(e) => setLeaderboardSearch(e.target.value)}
                placeholder="Search reader..."
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredLeaderboard.map((entry) => {
              const xpPct = Math.round((entry.totalXp / maxLeaderboardXp) * 100);
              const tierConfig = TIER_CONFIG[entry.rankTier] || TIER_CONFIG.story_starter;

              return (
                <div
                  key={entry.studentId}
                  onClick={() => {
                    const pupil = reports.find((r) => r.studentId === entry.studentId);
                    if (pupil) {
                      const numScore =
                        Number.parseInt(pupil.comprehensionPct?.replace("%", "") || "0", 10) ||
                        entry.comprehensionPct ||
                        100;
                      setSelectedPupilForRecord({
                        studentId: pupil.studentId,
                        studentName: pupil.name,
                        avatar: pupil.avatar || entry.avatar || "👧",
                        section: pupil.section || entry.section || "Grade 3-A",
                        comprehensionPct: numScore,
                        quizzesPassed:
                          Number.parseInt(pupil.quizzesPassed?.split("/")[0] || "0", 10) ||
                          entry.quizzesPassed,
                        failedAttemptsCount: 0,
                        lastActiveDate: pupil.lastActive,
                        daysInactive: 0,
                        riskLevel: pupil.status === "Needs Review" ? "critical" : "mastering",
                        struggleReason:
                          pupil.status === "Needs Review"
                            ? "Needs review on comprehension passages"
                            : "Consistent high reading performance",
                        recommendedAction:
                          pupil.status === "Needs Review"
                            ? "Review chapter passages"
                            : "Keep up the excellent work",
                      });
                    }
                  }}
                  className="px-5 py-3.5 flex items-center gap-4 transition-all duration-150 hover:bg-slate-50/80 border-l-4 border-l-transparent cursor-pointer"
                  title={`View student record for ${entry.studentName}`}
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
                  <StudentAvatar
                    avatar={entry.avatar}
                    name={entry.studentName}
                    size="md"
                    className="flex-shrink-0"
                  />

                  {/* Name, Tier Pill & Relative XP Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {entry.studentName}
                      </span>
                      {entry.section && entry.section !== "Unassigned" && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hidden xs:inline-flex">
                          {entry.section}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-flex items-center gap-1 ${tierConfig.bg} ${tierConfig.text} ${tierConfig.border}`}
                      >
                        <span>{tierConfig.icon}</span>
                        <span>{tierConfig.label}</span>
                      </span>
                    </div>

                    {/* Relative XP Progress Bar */}
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            entry.rank === 1
                              ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                              : entry.rank <= 3
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${xpPct}%` }}
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

          {filteredLeaderboard.length === 0 && (
            <div className="py-14 text-center space-y-2">
              <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No readers found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Recent Classroom Activity & Live Mastery Progression ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Classroom Activity */}
        <div className="dashboard-card p-5 border border-slate-200 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Recent Classroom Activity
              </h3>
            </div>

            {/* Minimal Neutral Filter */}
            <div className="inline-flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setFeedFilter("all")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  feedFilter === "all"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({activityFeed.length})
              </button>
              <button
                type="button"
                onClick={() => setFeedFilter("quiz")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  feedFilter === "quiz"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Quizzes ({activityFeed.filter((a) => a.type === "quiz_pass" || a.type === "quiz_attempt").length})
              </button>
              <button
                type="button"
                onClick={() => setFeedFilter("badge")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  feedFilter === "badge"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Badges ({activityFeed.filter((a) => a.type === "badge_earned").length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading activity...</div>
          ) : displayedActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent activity recorded for this section.
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
              {displayedActivities.map((act) => (
                <div
                  key={act.id}
                  className="py-2.5 px-1 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">
                        {act.studentName}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded">
                        {act.section}
                      </span>
                    </div>
                    <p className="text-slate-600 truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{act.title}</span>
                      {act.percentage !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border font-mono ${
                            act.percentage >= 80
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200/70"
                              : act.percentage >= 70
                              ? "bg-blue-50 text-blue-800 border-blue-200/70"
                              : "bg-rose-50 text-rose-800 border-rose-200/70"
                          }`}
                        >
                          {act.percentage}%
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatTimeAgo(act.timestamp)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPupilForNote({
                          studentId: act.studentId,
                          studentName: act.studentName,
                          avatar: act.avatar,
                          section: act.section,
                          comprehensionPct: act.percentage || 100,
                          quizzesPassed: 1,
                          failedAttemptsCount: 0,
                          lastActiveDate: act.timestamp,
                          daysInactive: 0,
                          riskLevel: "mastering",
                          struggleReason: act.title,
                          recommendedAction: "Great reading achievement! Keep up the momentum.",
                        })
                      }
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Note
                    </button>
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
              <Layers className="w-4 h-4 text-blue-600" />
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
                  <span className="text-slate-900 font-mono">
                    {distribution.starCount} Pupils ({distribution.starPct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${distribution.starPct}%` }}
                    className="h-full bg-sky-400 rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-blue-700">🎗️ Ribbon Badges (Cumulative Checkpoint)</span>
                  <span className="text-blue-700 font-bold font-mono">
                    {distribution.ribbonCount} Pupils ({distribution.ribbonPct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${distribution.ribbonPct}%` }}
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-amber-800">🏅 Medal Badges (Bronze, Silver &amp; Gold)</span>
                  <span className="text-amber-800 font-bold font-mono">
                    {distribution.medalCount} Pupils ({distribution.medalPct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${distribution.medalPct}%` }}
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  />
                </div>
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



      {/* ── 7. Send Guidance Note Modal ───────────────────────────────── */}
      {selectedPupilForNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 anim-pop-bounce">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <StudentAvatar avatar={selectedPupilForNote.avatar} name={selectedPupilForNote.studentName} size="md" className="flex-shrink-0" />
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
                    disabled={isSendingNote}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSendingNote ? "Sending..." : "Send Note to Student"}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── 8. Individual Student Evaluation Record Modal ─────────────── */}
      <StudentRecordModal
        isOpen={Boolean(selectedPupilForRecord)}
        onClose={() => setSelectedPupilForRecord(null)}
        pupil={selectedPupilForRecord}
        report={
          selectedPupilForRecord
            ? reports.find((r) => r.studentId === selectedPupilForRecord.studentId) || null
            : null
        }
        onOpenGuidanceNote={(pupil) => {
          setSelectedPupilForRecord(null);
          setSelectedPupilForNote(pupil);
        }}
      />
    </div>
  );
}
