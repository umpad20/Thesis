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
  const [presenceFilter, setPresenceFilter] = useState<"all" | "online">("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [liveOnlineIds, setLiveOnlineIds] = useState<Set<string>>(new Set());
  const [recentBroadcasts, setRecentBroadcasts] = useState<Record<string, number>>({});

  // Real-time student presence tracking via Supabase Channel, BroadcastChannel, and Postgres changes
  useEffect(() => {
    let presenceChannel: any = null;
    let postgresChannel: any = null;
    let bc: BroadcastChannel | null = null;

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("readsmart_student_presence");
        bc.onmessage = (event) => {
          const data = event.data;
          if (!data) return;
          const id = data.studentId;
          const name = data.cleanName || (data.name || "").toLowerCase().trim();
          const email = data.cleanEmail || (data.email || "").toLowerCase().trim();

          if (data.online === false || data.type === "offline") {
            setLiveOnlineIds((prev) => {
              const next = new Set(prev);
              if (id) next.delete(id);
              if (name) next.delete(name);
              if (email) next.delete(email);
              return next;
            });
            setRecentBroadcasts((prev) => {
              const next = { ...prev };
              if (id) delete next[id];
              if (name) delete next[name];
              if (email) delete next[email];
              return next;
            });
          } else {
            setLiveOnlineIds((prev) => {
              const next = new Set(prev);
              if (id) next.add(id);
              if (name) next.add(name);
              if (email) next.add(email);
              return next;
            });
            setRecentBroadcasts((prev) => {
              const next = { ...prev };
              const now = Date.now();
              if (id) next[id] = now;
              if (name) next[name] = now;
              if (email) next[email] = now;
              return next;
            });
          }
        };
      }
    } catch {
      // ignore
    }

    // Connect to Supabase Realtime Presence Channel and Postgres Changes
    import("@/utils/supabase/client")
      .then(({ createClient }) => {
        const supabase = createClient();

        // 1. Presence Channel
        presenceChannel = supabase.channel("readsmart_online_presence");
        presenceChannel
          .on("presence", { event: "sync" }, () => {
            const state = presenceChannel.presenceState();
            const onlineSet = new Set<string>();
            Object.values(state).forEach((presences: any) => {
              if (Array.isArray(presences)) {
                presences.forEach((p: any) => {
                  if (p?.studentId) onlineSet.add(p.studentId);
                  if (p?.cleanName) onlineSet.add(p.cleanName);
                  if (p?.name) onlineSet.add(p.name.toLowerCase().trim());
                  if (p?.cleanEmail) onlineSet.add(p.cleanEmail);
                  if (p?.email) onlineSet.add(p.email.toLowerCase().trim());
                });
              }
            });
            setLiveOnlineIds((prev) => {
              const combined = new Set(onlineSet);
              Object.keys(recentBroadcasts).forEach((k) => combined.add(k));
              return combined;
            });
          })
          .on("presence", { event: "join" }, ({ newPresences }: any) => {
            if (Array.isArray(newPresences)) {
              setLiveOnlineIds((prev) => {
                const next = new Set(prev);
                newPresences.forEach((p: any) => {
                  if (p?.studentId) next.add(p.studentId);
                  if (p?.cleanName) next.add(p.cleanName);
                  if (p?.name) next.add(p.name.toLowerCase().trim());
                  if (p?.cleanEmail) next.add(p.cleanEmail);
                });
                return next;
              });
            }
          })
          .on("presence", { event: "leave" }, ({ leftPresences }: any) => {
            if (Array.isArray(leftPresences)) {
              setLiveOnlineIds((prev) => {
                const next = new Set(prev);
                leftPresences.forEach((p: any) => {
                  if (p?.studentId) next.delete(p.studentId);
                  if (p?.cleanName) next.delete(p.cleanName);
                  if (p?.cleanEmail) next.delete(p.cleanEmail);
                });
                return next;
              });
            }
          })
          .subscribe();

        // 2. Postgres Live Updates on Profiles
        postgresChannel = supabase
          .channel("teacher_profiles_changes")
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "profiles" },
            (payload) => {
              const updated = payload.new as any;
              if (updated?.id && updated?.updated_at) {
                setReports((prev) =>
                  prev.map((r) =>
                    r.studentId === updated.id
                      ? {
                          ...r,
                          lastActiveIso: updated.updated_at,
                          lastActive: "Just now",
                          isOnline: true,
                        }
                      : r
                  )
                );
              }
            }
          )
          .subscribe();
      })
      .catch(() => {});

    // Periodic sweep for stale broadcasts (after 45s of no heartbeat)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setRecentBroadcasts((prev) => {
        const next: Record<string, number> = {};
        let changed = false;
        Object.entries(prev).forEach(([id, ts]) => {
          if (now - ts < 45000) {
            next[id] = ts;
          } else {
            changed = true;
          }
        });
        if (changed) {
          setLiveOnlineIds((prevOnline) => {
            const updated = new Set(prevOnline);
            Object.keys(prev).forEach((id) => {
              if (!next[id] && !presenceChannel?.presenceState()?.[id]) {
                updated.delete(id);
              }
            });
            return updated;
          });
        }
        return next;
      });
    }, 10000);

    return () => {
      clearInterval(cleanupInterval);
      if (bc) bc.close();
      if (presenceChannel) {
        try {
          import("@/utils/supabase/client").then(({ createClient }) => {
            createClient().removeChannel(presenceChannel);
          });
        } catch {}
      }
      if (postgresChannel) {
        try {
          import("@/utils/supabase/client").then(({ createClient }) => {
            createClient().removeChannel(postgresChannel);
          });
        } catch {}
      }
    };
  }, []);

  const checkStudentOnline = (
    pupil: { lastActive?: string; lastActiveIso?: string; isOnline?: boolean; studentId?: string; name?: string; email?: string } | undefined
  ): boolean => {
    if (!pupil) return false;
    const id = pupil.studentId;
    const cleanName = (pupil.name || "").toLowerCase().trim();
    const cleanEmail = (pupil.email || "").toLowerCase().trim();

    // 1. Direct real-time presence (ID, Name, Email)
    if (id && liveOnlineIds.has(id)) return true;
    if (cleanName && liveOnlineIds.has(cleanName)) return true;
    if (cleanEmail && liveOnlineIds.has(cleanEmail)) return true;

    // 2. Cross-tab BroadcastChannel heartbeats within 45s
    const checkBroadcast = (k?: string) => Boolean(k && recentBroadcasts[k] && Date.now() - recentBroadcasts[k] < 45000);
    if (checkBroadcast(id) || checkBroadcast(cleanName) || checkBroadcast(cleanEmail)) return true;

    // 3. LocalStorage cross-tab presence map
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("readsmart_online_students");
        if (raw) {
          const map = JSON.parse(raw);
          const now = Date.now();
          if ((id && map[id] && now - map[id] < 45000) ||
              (cleanName && map[cleanName] && now - map[cleanName] < 45000) ||
              (cleanEmail && map[cleanEmail] && now - map[cleanEmail] < 45000)) {
            return true;
          }
        }
        // Active student session in this browser
        const userRaw = localStorage.getItem("readsmart_current_user");
        if (userRaw) {
          const u = JSON.parse(userRaw);
          if (u?.role === "student") {
            if ((id && u.id === id) || (cleanName && u.fullName?.toLowerCase().trim() === cleanName) || (cleanEmail && u.email?.toLowerCase().trim() === cleanEmail)) {
              return true;
            }
          }
        }
      } catch {}
    }

    // 4. Precomputed isOnline from recent activity
    if (pupil.isOnline) return true;

    // 5. Fresh ISO timestamp within 15 minutes
    if (pupil.lastActiveIso) {
      const diffMs = Date.now() - new Date(pupil.lastActiveIso).getTime();
      if (diffMs >= 0 && diffMs < 15 * 60 * 1000) return true;
    }

    // 6. Text indicators
    const la = (pupil.lastActive || "").toLowerCase();
    if (la.includes("just now") || la.includes("online") || /^[1-9]\d?m ago/.test(la)) {
      return true;
    }

    return false;
  };

  const onlineStudentsCount = reports.filter((r) => checkStudentOnline(r)).length;

  const filteredStudentsList = reports.filter((r) => {
    const isOnline = checkStudentOnline(r);
    if (presenceFilter === "online" && !isOnline) return false;
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.section && r.section.toLowerCase().includes(q)) ||
      (r.currentBadge && r.currentBadge.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Teacher Dashboard
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
          <p className="text-[10px] text-slate-400 mt-1">Students logged in & reading</p>
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
              Students on Track
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

      {/* ── 4. 🏆 Student Champions Podium & Classroom Live Presence ── */}
      <div className="space-y-4">
        {/* Champions Podium */}
        {leaderboard.length >= 1 && (
          <div className="dashboard-card px-2.5 py-4 sm:p-6 lg:p-7 bg-gradient-to-b from-slate-50/80 via-white to-amber-50/40 border-2 border-amber-200/80 relative overflow-hidden shadow-xs">
            <div className="flex items-end justify-center gap-2 sm:gap-4 lg:gap-6 pt-1 pb-1 max-w-2xl mx-auto w-full">
              {/* #2 Silver Podium */}
              {top2 ? (
                (() => {
                  const p2 = reports.find((r) => r.studentId === top2.studentId) || { studentId: top2.studentId, name: top2.studentName, lastActive: "Active recently" };
                  const isOnline2 = checkStudentOnline(p2);
                  return (
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
                        {/* Avatar Online/Offline Presence Dot */}
                        <span
                          className={`absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm z-20 ${
                            isOnline2 ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                          title={isOnline2 ? `${top2.studentName} is Online Now` : `${top2.studentName} is Offline`}
                        />
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
                  );
                })()
              ) : (
                <div className="flex-1 max-w-[190px]" />
              )}

              {/* #1 Gold Podium (Elevated) */}
              {top1 && (
                (() => {
                  const p1 = reports.find((r) => r.studentId === top1.studentId) || { studentId: top1.studentId, name: top1.studentName, lastActive: "Active recently" };
                  const isOnline1 = checkStudentOnline(p1);
                  return (
                    <div className="flex-1 max-w-[210px] min-w-0 flex flex-col items-center -mt-4 sm:-mt-5 group transition-transform hover:-translate-y-1.5 duration-200 z-10">
                      <div className="mb-2 flex flex-col items-center">
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-400 mb-0.5 animate-bounce" />
                        <div className="relative">
                          <div className="w-15 h-15 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 p-1.5 ring-3 ring-amber-400 ring-offset-2 ring-offset-white shadow-lg shadow-amber-400/30 flex items-center justify-center">
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
                          {/* Avatar Online/Offline Presence Dot - pinned directly to avatar box, same as others */}
                          <span
                            className={`absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm z-20 ${
                              isOnline1 ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                            title={isOnline1 ? `${top1.studentName} is Online Now` : `${top1.studentName} is Offline`}
                          />
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
                  );
                })()
              )}

              {/* #3 Bronze Podium */}
              {top3 ? (
                (() => {
                  const p3 = reports.find((r) => r.studentId === top3.studentId) || { studentId: top3.studentId, name: top3.studentName, lastActive: "Active recently" };
                  const isOnline3 = checkStudentOnline(p3);
                  return (
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
                        {/* Avatar Online/Offline Presence Dot */}
                        <span
                          className={`absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm z-20 ${
                            isOnline3 ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                          title={isOnline3 ? `${top3.studentName} is Online Now` : `${top3.studentName} is Offline`}
                        />
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
                  );
                })()
              ) : (
                <div className="flex-1 max-w-[190px]" />
              )}
            </div>

            {/* Unified Champion Stage Base */}
            <div className="w-full max-w-2xl mx-auto h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-slate-200 via-amber-300 to-slate-200 shadow-inner mt-1.5 opacity-90" />
          </div>
        )}

        {/* ── Classroom Students Live Status (Who is Online & Reading) ── */}
        <div className="dashboard-card overflow-hidden border border-slate-200/80 bg-white">
          {/* Header Bar with Search & Online Filter */}
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Student Live Status &amp; Reading Activity
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {onlineStudentsCount} Online Now
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Filter Tabs: All / Online Only */}
              <div className="inline-flex items-center gap-1 text-xs bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setPresenceFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                    presenceFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All ({reports.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPresenceFilter("online")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
                    presenceFilter === "online"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-emerald-700"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span>Online ({onlineStudentsCount})</span>
                </button>
              </div>

              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student..."
                  className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredStudentsList.map((pupil) => {
              const isOnline = checkStudentOnline(pupil);
              return (
                <div
                  key={pupil.studentId}
                  onClick={() => {
                    const numScore =
                      Number.parseInt(pupil.comprehensionPct?.replace("%", "") || "0", 10) || 100;
                    setSelectedPupilForRecord({
                      studentId: pupil.studentId,
                      studentName: pupil.name,
                      avatar: pupil.avatar || "👧",
                      section: pupil.section || "Grade 3-A",
                      comprehensionPct: numScore,
                      quizzesPassed:
                        Number.parseInt(pupil.quizzesPassed?.split("/")[0] || "0", 10) || 0,
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
                  }}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 transition-all duration-150 hover:bg-slate-50/80 cursor-pointer"
                  title={`View student record for ${pupil.name}`}
                >
                  {/* Left: Avatar with Online Indicator & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <StudentAvatar
                        avatar={pupil.avatar}
                        name={pupil.name}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center transition-all ${
                          isOnline ? "bg-emerald-500 ring-2 ring-emerald-300 animate-pulse" : "bg-slate-300"
                        }`}
                        title={isOnline ? "Online Now" : `Offline (Last active: ${pupil.lastActive || "Inactive"})`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {pupil.name}
                        </span>
                        {pupil.section && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {pupil.section}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-flex items-center gap-1 ${
                            pupil.status === "Mastering"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : pupil.status === "On Track"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {pupil.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{pupil.currentBadge || "Reading Star"}</span>
                        <span>·</span>
                        <span>{pupil.quizzesPassed} Stories Cleared</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Presence Pill Badge & Last Active */}
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span>Online</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Offline · {pupil.lastActive || "Inactive"}</span>
                      </span>
                    )}

                    <span className="text-xs font-bold text-blue-600 hover:text-blue-700 hidden sm:inline-block">
                      View Record →
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredStudentsList.length === 0 && (
              <div className="py-12 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">
                  {presenceFilter === "online" ? "No students currently online" : "No students found"}
                </p>
              </div>
            )}
          </div>
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
            <div className="py-8 text-center text-xs text-slate-400">Enroll students to see distribution.</div>
          ) : (
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">⭐ Star Badges (Lesson Mastery Stage)</span>
                  <span className="text-slate-900 font-mono">
                    {distribution.starCount} {distribution.starCount === 1 ? "Student" : "Students"} ({distribution.starPct}%)
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
                    {distribution.ribbonCount} {distribution.ribbonCount === 1 ? "Student" : "Students"} ({distribution.ribbonPct}%)
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
                    {distribution.medalCount} {distribution.medalCount === 1 ? "Student" : "Students"} ({distribution.medalPct}%)
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
