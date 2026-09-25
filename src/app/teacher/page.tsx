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
  const [loading, setLoading] = useState(true);

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

      const [roster, lessons, liveSections, badges, dist, feed, topLeaderboard] = await Promise.all([
        fetchClassRosterReports(selectedSection, teacherId),
        fetchAllLessons(),
        fetchTeacherSectionsFromSupabase(teacherId),
        fetchBadgesFromSupabase(),
        fetchMasteryStageDistribution(selectedSection, teacherId),
        fetchClassroomActivityFeed(selectedSection, teacherId),
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
      setActivityFeed(feed);
      setLeaderboard(topLeaderboard.slice(0, 5));
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
  const displayChampions: LeaderboardEntry[] = leaderboard;

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
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
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
            <span className="text-2xl font-black text-slate-900">
              {pupilsCompletedGoal} / {studentCount}
            </span>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
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
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
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
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
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

      {/* ── 4. Recent Classroom Activity (Scrollable, Minimal) ─────────── */}
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
          <div className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
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
                    <span className="text-[11px] text-slate-400">
                      {act.section}
                    </span>
                  </div>
                  <p className="text-slate-600 truncate mt-0.5">
                    {act.title}
                    {act.percentage !== undefined && (
                      <span className="text-slate-500 font-mono ml-1">
                        · {act.percentage}%
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
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    Note
                  </button>
                </div>
              </div>
            ))}
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
                    <StudentAvatar avatar={entry.avatar} name={entry.studentName} size="xs" className="flex-shrink-0" />
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
