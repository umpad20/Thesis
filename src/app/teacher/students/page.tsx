"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  UserPlus,
  Layers,
  Plus,
  ChevronDown,
  Filter,
  Trophy,
  Users,
  Lock,
  FileText,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificateModal } from "@/components/certificate-modal";
import { StudentRecordModal } from "@/components/student-record-modal";
import { StudentAvatar } from "@/components/student-avatar";
import {
  addTeacherSection,
  fetchTeacherSectionsFromSupabase,
  fetchStudentsFromSupabase,
  getCurrentUser,
} from "@/utils/auth-helpers";
import {
  fetchTeacherInterventionRadar,
  sendTeacherGuidanceNote,
  type TeacherReportRow,
} from "@/utils/supabase-queries";
import { TableRosterSkeleton } from "@/components/page-skeletons";
import type { EnrolledStudent, InterventionPupil } from "@/lib/types";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [sections, setSections] = useState<string[]>(["Grade 3-A"]);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedCertificateStudent, setSelectedCertificateStudent] = useState<EnrolledStudent | null>(null);

  // Individual Student Record & Guidance Note States
  const [radarPupils, setRadarPupils] = useState<InterventionPupil[]>([]);
  const [selectedPupilForRecord, setSelectedPupilForRecord] = useState<InterventionPupil | null>(null);
  const [selectedReportForRecord, setSelectedReportForRecord] = useState<TeacherReportRow | null>(null);
  const [selectedPupilForNote, setSelectedPupilForNote] = useState<InterventionPupil | null>(null);
  const [noteMessage, setNoteMessage] = useState("");
  const [isSendingNote, setIsSendingNote] = useState(false);
  const [noteSentSuccess, setNoteSentSuccess] = useState(false);

  // Load dynamically enrolled students and sections from Supabase on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      const teacherId = user?.id;

      try {
        const liveSections = await fetchTeacherSectionsFromSupabase(teacherId);
        if (Array.isArray(liveSections) && liveSections.length > 0) {
          setSections(liveSections);
        }
      } catch {
        setSections(["Grade 3-A"]);
      }

      try {
        // Fetch all students and radar data for this teacher so section tab counts remain accurate
        const [liveStudents, radarData] = await Promise.all([
          fetchStudentsFromSupabase(undefined, teacherId),
          fetchTeacherInterventionRadar(teacherId || "", undefined),
        ]);
        setStudents(liveStudents || []);
        if (radarData?.pupils) {
          setRadarPupils(radarData.pupils);
        }
      } catch {
        setStudents([]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const [liveOnlineIds, setLiveOnlineIds] = useState<Set<string>>(new Set());
  const [recentBroadcasts, setRecentBroadcasts] = useState<Record<string, number>>({});

  // Real-time student presence tracking via Supabase Channel and BroadcastChannel
  useEffect(() => {
    let presenceChannel: any = null;
    let bc: BroadcastChannel | null = null;

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("readsmart_student_presence");
        bc.onmessage = (event) => {
          const data = event.data;
          if (!data || !data.studentId) return;
          if (data.online === false || data.type === "offline") {
            setLiveOnlineIds((prev) => {
              const next = new Set(prev);
              next.delete(data.studentId);
              return next;
            });
            setRecentBroadcasts((prev) => {
              const next = { ...prev };
              delete next[data.studentId];
              return next;
            });
          } else {
            setLiveOnlineIds((prev) => new Set(prev).add(data.studentId));
            setRecentBroadcasts((prev) => ({ ...prev, [data.studentId]: Date.now() }));
          }
        };
      }
    } catch {
      // ignore
    }

    // Connect to Supabase Realtime Presence Channel
    import("@/utils/supabase/client")
      .then(({ createClient }) => {
        const supabase = createClient();
        presenceChannel = supabase.channel("readsmart_online_presence");
        presenceChannel
          .on("presence", { event: "sync" }, () => {
            const state = presenceChannel.presenceState();
            const onlineSet = new Set<string>();
            Object.values(state).forEach((presences: any) => {
              if (Array.isArray(presences)) {
                presences.forEach((p: any) => {
                  if (p?.studentId) onlineSet.add(p.studentId);
                });
              }
            });
            setLiveOnlineIds((prev) => {
              const combined = new Set(onlineSet);
              Object.keys(recentBroadcasts).forEach((id) => combined.add(id));
              return combined;
            });
          })
          .on("presence", { event: "join" }, ({ newPresences }: any) => {
            if (Array.isArray(newPresences)) {
              setLiveOnlineIds((prev) => {
                const next = new Set(prev);
                newPresences.forEach((p: any) => {
                  if (p?.studentId) next.add(p.studentId);
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
                });
                return next;
              });
            }
          })
          .subscribe();
      })
      .catch(() => {});

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
    }, 15000);

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
    };
  }, []);

  const safeSections = Array.isArray(sections) && sections.length > 0 ? sections : ["Grade 3-A"];

  const sectionStudents = students.filter(
    (s) =>
      selectedSection === "all" ||
      s.section?.trim().toLowerCase() === selectedSection.trim().toLowerCase()
  );

  const getStudentCategory = (s: EnrolledStudent): "mastering" | "on track" | "needs review" => {
    const compVal = parseFloat(s.comprehension.replace("%", "")) || s.accuracyRaw || 0;
    const statusLower = s.status.toLowerCase();
    if (
      statusLower.includes("review") ||
      statusLower.includes("critical") ||
      statusLower.includes("practice") ||
      compVal < 70
    ) {
      return "needs review";
    }
    if (statusLower.includes("track") || (compVal >= 70 && compVal < 85)) {
      return "on track";
    }
    return "mastering";
  };

  const masteringCount = sectionStudents.filter((s) => getStudentCategory(s) === "mastering").length;
  const onTrackCount = sectionStudents.filter((s) => getStudentCategory(s) === "on track").length;
  const needsReviewCount = sectionStudents.filter((s) => getStudentCategory(s) === "needs review").length;

  // Filter students based on section tab, status, and search term
  const filteredStudents = students.filter((s) => {
    const matchesSection =
      selectedSection === "all" ||
      s.section?.trim().toLowerCase() === selectedSection.trim().toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const category = getStudentCategory(s);
    const matchesFilter =
      filterStatus === "all" ||
      filterStatus === category ||
      s.status.toLowerCase().includes(filterStatus);

    return matchesSection && matchesSearch && matchesFilter;
  });

  const checkStudentOnline = (st: EnrolledStudent) => {
    const sid = st.supabaseUserId || st.id;
    const cleanName = (st.name || "").toLowerCase().trim();
    const cleanEmail = (st.email || "").toLowerCase().trim();

    if (sid && liveOnlineIds.has(sid)) return true;
    if (cleanName && liveOnlineIds.has(cleanName)) return true;
    if (cleanEmail && liveOnlineIds.has(cleanEmail)) return true;

    const checkBroadcast = (k?: string) => Boolean(k && recentBroadcasts[k] && Date.now() - recentBroadcasts[k] < 45000);
    if (checkBroadcast(sid) || checkBroadcast(cleanName) || checkBroadcast(cleanEmail)) return true;

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("readsmart_online_students");
        if (raw) {
          const map = JSON.parse(raw);
          const now = Date.now();
          if ((sid && map[sid] && now - map[sid] < 45000) ||
              (cleanName && map[cleanName] && now - map[cleanName] < 45000) ||
              (cleanEmail && map[cleanEmail] && now - map[cleanEmail] < 45000)) {
            return true;
          }
        }
        const userRaw = localStorage.getItem("readsmart_current_user");
        if (userRaw) {
          const u = JSON.parse(userRaw);
          if (u?.role === "student") {
            if ((sid && u.id === sid) || (cleanName && u.fullName?.toLowerCase().trim() === cleanName) || (cleanEmail && u.email?.toLowerCase().trim() === cleanEmail)) {
              return true;
            }
          }
        }
      } catch {}
    }

    if (st.isOnline) return true;
    if (st.lastActiveIso) {
      const diffMs = Date.now() - new Date(st.lastActiveIso).getTime();
      if (diffMs >= 0 && diffMs < 15 * 60 * 1000) return true;
    }
    const la = (st.lastActive || "").toLowerCase();
    return (
      la.includes("just now") ||
      la.includes("online") ||
      /^[1-9]\d?m ago/.test(la)
    );
  };

  const exportCSV = () => {
    if (filteredStudents.length === 0) return;
    const headers = "Student ID,Name,Gender,Email,Section,Current Badge,Comprehension %,Quizzes Cleared,Status\n";
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.id}","${s.name}","${s.gender}","${s.email || ""}","${s.section}","${s.currentBadge}","${s.comprehension}","${s.quizzesPassed}","${s.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Students_Roster_${selectedSection}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const enrolledStudentToInterventionPupil = (s: EnrolledStudent): InterventionPupil => {
    const compVal = parseFloat(s.comprehension.replace("%", "")) || s.accuracyRaw || 0;
    const passedCount = parseInt(s.quizzesPassed.split("/")[0]) || 0;
    const totalCount = parseInt(s.quizzesPassed.split("/")[1]) || 16;
    const statusLower = s.status.toLowerCase();

    let riskLevel: "critical" | "watchlist" | "mastering" = "mastering";
    let struggleReason = "Excelling at comprehension benchmark with consistent participation.";
    let recommendedAction = "Challenge with Higher Stage Story Passages & Bonus Accolades.";

    if (s.isAllStagesCompleted || compVal >= 85) {
      riskLevel = "mastering";
      struggleReason = s.isAllStagesCompleted
        ? "Stage 5 Completed! All reading stages mastered with stellar comprehension."
        : `High comprehension (${compVal}%) with consistent quiz mastery.`;
      recommendedAction = "Challenge with Advanced Vocabulary & Story Exploration.";
    } else if (
      statusLower.includes("review") ||
      statusLower.includes("critical") ||
      statusLower.includes("practice") ||
      compVal < 70
    ) {
      riskLevel = "critical";
      struggleReason = `Low average comprehension (${compVal}%). Needs reading consistency support.`;
      recommendedAction = "Assign Guided Starter Passage with Hint Narration & Review.";
    } else {
      riskLevel = "watchlist";
      struggleReason = `Borderline score (${compVal}%). Needs reading consistency support.`;
      recommendedAction = "Encourage Stage Final Review & Story Reading Rhythm.";
    }

    const resolvedId = s.supabaseUserId || s.id;
    return {
      studentId: resolvedId,
      studentName: s.name,
      avatar: s.avatar || (s.gender === "Female" ? "👧" : "👦"),
      section: s.section,
      comprehensionPct: Math.round(compVal),
      quizzesPassed: passedCount,
      failedAttemptsCount: Math.max(0, (s.accuracyRaw && s.accuracyRaw < 70) ? 1 : 0),
      lastActiveDate: s.lastActiveIso || s.lastActive || new Date().toISOString(),
      daysInactive: s.lastActive?.toLowerCase().includes("today") ? 0 : 1,
      riskLevel,
      struggleReason,
      recommendedAction,
    };
  };

  const handleOpenRecord = (s: EnrolledStudent) => {
    const rawPrefix = s.id.replace(/^STU-/i, "").toLowerCase().trim();
    const existingPupil = radarPupils.find((p) => {
      const matchId =
        (s.supabaseUserId && p.studentId === s.supabaseUserId) ||
        p.studentId === s.id ||
        (rawPrefix && p.studentId.toLowerCase().startsWith(rawPrefix));
      const matchName = p.studentName.toLowerCase().trim() === s.name.toLowerCase().trim();
      return matchId || matchName;
    });

    const pupilData: InterventionPupil = existingPupil
      ? { ...existingPupil }
      : enrolledStudentToInterventionPupil(s);

    if (s.supabaseUserId) {
      pupilData.studentId = s.supabaseUserId;
    }

    setSelectedPupilForRecord(pupilData);
    setSelectedReportForRecord({
      studentId: s.supabaseUserId || pupilData.studentId || s.id,
      name: s.name,
      email: s.email,
      section: s.section,
      gender: s.gender,
      currentBadge: s.currentBadge,
      comprehensionPct: s.comprehension,
      readingSpeed: s.readingSpeed,
      quizzesPassed: s.quizzesPassed,
      status: s.status as any,
      lastActive: s.lastActive,
      avatar: s.avatar,
      totalXp: s.totalXp,
      isAllStagesCompleted: s.isAllStagesCompleted,
    });
  };

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
    setNoteSentSuccess(true);
    setTimeout(() => {
      setSelectedPupilForNote(null);
      setNoteSentSuccess(false);
      setNoteMessage("");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header (Matching Sidebar "Student Records") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Student Records
          </h1>
        </div>
      </div>

      {/* 2. Section Selector Tabs Bar with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Sections:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedSection("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSection === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            All Sections ({students.length})
          </button>

          {safeSections.map((sec) => {
            const count = students.filter(
              (s) => s.section?.trim().toLowerCase() === sec.trim().toLowerCase()
            ).length;
            const isSelected = selectedSection.trim().toLowerCase() === sec.trim().toLowerCase();

            return (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <span>{sec}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? "bg-blue-700 text-white" : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section Actions: Add Section */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          <button
            type="button"
            onClick={async () => {
              const newSecName = prompt("Enter new section name (e.g. Grade 3-C):");
              if (newSecName && newSecName.trim()) {
                const teacher = getCurrentUser();
                const updated = await addTeacherSection(newSecName.trim(), teacher?.id);
                setSections(updated);
                setSelectedSection(newSecName.trim());
              }
            }}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add New Section</span>
          </button>
        </div>
      </div>

      {/* 3. Search & Status Filter Controls */}
      <div className="dashboard-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Status Filter Segmented Control (with DepEd passing criteria) */}
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl text-xs flex-wrap self-start sm:self-auto border border-slate-200/60">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              filterStatus === "all"
                ? "bg-white text-slate-900 shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({sectionStudents.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("mastering")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterStatus === "mastering"
                ? "bg-emerald-600 text-white shadow-2xs font-black"
                : "text-emerald-700 hover:bg-emerald-50 font-semibold"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                filterStatus === "mastering" ? "bg-white" : "bg-emerald-500"
              }`}
            />
            <span>{masteringCount} Mastering (≥85%)</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("on track")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterStatus === "on track"
                ? "bg-blue-600 text-white shadow-2xs font-black"
                : "text-blue-700 hover:bg-blue-50 font-semibold"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                filterStatus === "on track" ? "bg-white" : "bg-blue-500"
              }`}
            />
            <span>{onTrackCount} On Track (70–84%)</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("needs review")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filterStatus === "needs review"
                ? "bg-rose-600 text-white shadow-2xs font-black"
                : "text-rose-700 hover:bg-rose-50 font-semibold"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                filterStatus === "needs review" ? "bg-white" : "bg-rose-500"
              }`}
            />
            <span>{needsReviewCount} Needs Review (&lt;70%)</span>
          </button>
        </div>
      </div>

      {/* 4. Enrolled Students Roster Table */}
      <div className="dashboard-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {selectedSection === "all" ? "All Enrolled Students" : `Students in ${selectedSection}`}
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
              Showing {filteredStudents.length} of {students.length} Students
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href={
                selectedSection && selectedSection !== "all"
                  ? `/teacher/students/enroll?section=${encodeURIComponent(selectedSection)}`
                  : "/teacher/students/enroll"
              }
              className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{selectedSection !== "all" ? `Add Student to ${selectedSection}` : "Add Student"}</span>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              className="h-8 px-3 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Roster (CSV)</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <TableRosterSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student Name &amp; ID</th>
                  <th className="py-3 px-3">Student Email</th>
                  <th className="py-3 px-3">Enrolled Section</th>
                  <th className="py-3 px-3">Active Badge Milestone</th>
                  <th className="py-3 px-3">Comprehension %</th>
                  <th className="py-3 px-3">Quizzes Cleared</th>
                  <th className="py-3 px-3">Intervention Status</th>
                  <th className="py-3 px-3 text-center">Individual Record</th>
                  <th className="py-3 px-3 text-center">Star Reader Award</th>
                  <th className="py-3 px-4 text-right">Last Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No students found in this section. Click <strong>&quot;Add Student&quot;</strong> to add one.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const isCompletedAllStages = Boolean(s.isAllStagesCompleted);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenRecord(s)}
                            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
                            title={`View individual record for ${s.name}`}
                          >
                            <div className="relative flex-shrink-0">
                              <StudentAvatar
                                avatar={s.avatar || (s.gender === "Female" ? "👧" : "👦")}
                                name={s.name}
                                size="xs"
                                className="flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-400 transition-all"
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                  checkStudentOnline(s) ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                                }`}
                                title={checkStudentOnline(s) ? "Online Now" : "Offline"}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors">
                                  {s.name}
                                </span>
                                {checkStudentOnline(s) && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Online</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {s.id} · {s.gender}
                              </span>
                            </div>
                          </button>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {s.email ? (
                            <span
                              className="font-mono text-[11px] text-blue-700 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded-md inline-block max-w-[200px] truncate"
                              title={s.email}
                            >
                              {s.email}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal text-[11px]">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-slate-700 font-semibold whitespace-nowrap">
                          {s.section}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {isCompletedAllStages ? (
                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                              <span>Stage 5 Completed</span>
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-800">
                              {s.currentBadge}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {s.comprehension}
                        </td>

                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                          {s.quizzesPassed}
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                          {s.status}
                        </td>

                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRecord(s)}
                            className="h-8 px-3 rounded-lg border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                            title={`View individual evaluation record and quiz attempts for ${s.name}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Record</span>
                          </Button>
                        </td>

                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {isCompletedAllStages ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCertificateStudent(s)}
                              className="h-8 px-3 rounded-lg border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                              title="View and Print Official Star Reader Certificate"
                            >
                              <Trophy className="w-3.5 h-3.5 fill-amber-500 text-amber-700" />
                              <span>View Award</span>
                            </Button>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">
                              In Progress
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right text-slate-400 whitespace-nowrap">
                          {s.lastActive}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Student Individual Evaluation Record Modal ─────────────────── */}
      <StudentRecordModal
        isOpen={Boolean(selectedPupilForRecord)}
        onClose={() => {
          setSelectedPupilForRecord(null);
          setSelectedReportForRecord(null);
        }}
        pupil={selectedPupilForRecord}
        report={selectedReportForRecord}
        onOpenGuidanceNote={(pupil) => {
          setSelectedPupilForRecord(null);
          setSelectedPupilForNote(pupil);
        }}
      />

      {/* ── Teacher Guidance & Praise Dispatch Modal ──────────────────── */}
      {selectedPupilForNote && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPupilForNote(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedPupilForNote.riskLevel === "mastering"
                    ? `Dispatch Praise to ${selectedPupilForNote.studentName}`
                    : `Dispatch Guidance Note to ${selectedPupilForNote.studentName}`}
                </h3>
                <p className="text-xs text-slate-400">{selectedPupilForNote.section}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPupilForNote(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {noteSentSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-slate-900">Guidance Note Dispatched!</h4>
                <p className="text-xs text-slate-500">The encouragement advice has been sent to the student.</p>
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
                    placeholder="e.g., Great job! Keep up the momentum or review challenging words."
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

      {/* Star Reader Certificate Modal for Teachers */}
      <CertificateModal
        isOpen={!!selectedCertificateStudent}
        onClose={() => setSelectedCertificateStudent(null)}
        studentName={selectedCertificateStudent?.name || "Student"}
        section={selectedCertificateStudent?.section || "Grade 3-A"}
        autoPlayAudio={false}
      />


    </div>
  );
}
