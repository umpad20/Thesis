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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  fetchClassRosterReports,
  fetchAllLessons,
  fetchBadgesFromSupabase,
  fetchMasteryStageDistribution,
  type TeacherReportRow,
  type MasteryStageDistribution,
} from "@/utils/supabase-queries";
import { fetchTeacherSectionsFromSupabase } from "@/utils/auth-helpers";

export default function TeacherDashboard() {
  const [reports, setReports] = useState<TeacherReportRow[]>([]);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [badgesCount, setBadgesCount] = useState(5);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const [roster, lessons, liveSections, badges, dist] = await Promise.all([
        fetchClassRosterReports(selectedSection),
        fetchAllLessons(),
        fetchTeacherSectionsFromSupabase(),
        fetchBadgesFromSupabase(),
        fetchMasteryStageDistribution(selectedSection),
      ]);

      setReports(roster);
      setLessonsCount(lessons.length);
      setBadgesCount(badges.length);
      if (Array.isArray(liveSections) && liveSections.length > 0) {
        setSections(liveSections);
      }
      setDistribution(dist);
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
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
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

      {/* 2. Top Cohort KPI Cards (100% Dynamic from Supabase) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Enrolled Pupils
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{studentCount}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {sections.length} {sections.length === 1 ? "Section" : "Sections"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Active database accounts</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Class Comprehension
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">
              {avgScore > 0 ? `${avgScore}%` : "No attempts"}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Target ≥70%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">DepEd Grade 3 benchmark</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Curriculum Stories
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{lessonsCount}</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Passages
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Max 3 stories per badge</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active Accolades
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{badgesCount}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              Badges
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">5 Default + Custom Badges</p>
        </div>
      </div>

      {/* 3. Section Filter Strip */}
      <div className="flex items-center justify-between p-2.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Class Section:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedSection("all")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedSection === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            All Sections ({distribution.totalStudents})
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

      {/* 4. Live Class Mastery Stage Distribution (Computed Dynamically) */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Live Pupil Mastery Progression Distribution</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live tracking of students along the 5-Stage Pathway: Star → Ribbon → Bronze → Silver → Gold
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Cohort: {studentCount} Pupils
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Computing live distribution...</div>
        ) : distribution.totalStudents === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 font-medium">
            No enrolled pupils in this section yet. Click <strong>Enroll Student</strong> to get started.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">⭐ 1st: Star Badges (Lesson Mastery Stage)</span>
                <span className="text-slate-900">
                  {distribution.starCount} Pupils ({distribution.starPct}%)
                </span>
              </div>
              <Progress value={distribution.starPct} className="h-2 bg-slate-100" />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-blue-700">🎗️ 2nd: Ribbon Badges (Cumulative Checkpoint)</span>
                <span className="text-blue-700 font-bold">
                  {distribution.ribbonCount} Pupils ({distribution.ribbonPct}%)
                </span>
              </div>
              <Progress value={distribution.ribbonPct} className="h-2 bg-slate-100" />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-emerald-700">🏅 3rd–5th: Medal Badges (Bronze, Silver &amp; Gold)</span>
                <span className="text-emerald-700 font-bold">
                  {distribution.medalCount} Pupils ({distribution.medalPct}%)
                </span>
              </div>
              <Progress value={distribution.medalPct} className="h-2 bg-slate-100" />
            </div>
          </div>
        )}
      </div>

      {/* 5. Live Student Performance Log Preview */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Pupil Roster Snapshot ({selectedSection === "all" ? "All Sections" : selectedSection})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Direct student accounts with their active badge milestone, comprehension, and status.
            </p>
          </div>
          <Link href="/teacher/students" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            Open Full Roster →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading student records...</div>
        ) : reports.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No pupils registered in this section yet.
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

      {/* 6. Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/teacher/students" className="dashboard-card p-4 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 mb-0.5">Pupil Management</h4>
          <p className="text-[11px] text-slate-500">Enroll students &amp; manage sections</p>
        </Link>

        <Link href="/teacher/lessons" className="dashboard-card p-4 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 mb-0.5">Curriculum Stories</h4>
          <p className="text-[11px] text-slate-500">Add &amp; edit section passages (max 3/badge)</p>
        </Link>

        <Link href="/teacher/badges" className="dashboard-card p-4 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 mb-0.5">Badge Accolades</h4>
          <p className="text-[11px] text-slate-500">5 Default stages + custom badges</p>
        </Link>

        <Link href="/teacher/quizzes" className="dashboard-card p-4 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 mb-0.5">Quiz Bank</h4>
          <p className="text-[11px] text-slate-500">Questions, point weights &amp; hints</p>
        </Link>
      </div>
    </div>
  );
}
