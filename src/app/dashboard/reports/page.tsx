"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  ChevronRight,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchClassRosterReports, type TeacherReportRow } from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";

export default function ReportsPage() {
  const [reports, setReports] = useState<TeacherReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState("all");

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      const user = getCurrentUser();
      const userSection = user?.section || "all";
      const data = await fetchClassRosterReports(sectionFilter === "all" ? userSection : sectionFilter);
      setReports(data);
      setLoading(false);
    }
    loadReports();
  }, [sectionFilter]);

  const avgComp =
    reports.length > 0
      ? Math.round(
          reports.reduce((acc, curr) => acc + Number.parseFloat(curr.comprehensionPct), 0) /
            reports.length
        )
      : 85;

  const exportCSV = () => {
    if (reports.length === 0) return;
    const headers = "Student ID,Name,Section,Gender,Current Badge,Comprehension %,Reading Speed,Quizzes Cleared,Status\n";
    const rows = reports
      .map(
        (r) =>
          `"${r.studentId}","${r.name}","${r.section}","${r.gender}","${r.currentBadge}","${r.comprehensionPct}","${r.readingSpeed}","${r.quizzesPassed}","${r.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ReadSmart_Reports_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Trail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-slate-600">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">Progress Analytics</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Reading Performance &amp; Evaluation Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Pedro Victorina Calo Elementary School · Live Database Cohort Reports
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={exportCSV}
            size="sm"
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Reports (CSV)
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Avg Comprehension
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{avgComp}%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Target ≥70%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">DepEd Grade 3 Reading Threshold</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Enrolled Students
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{reports.length} Pupils</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Active Roster
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Database registered students</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Mastery Threshold
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">8 Badges</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              Progression
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Star → Ribbon → Medal Badges</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Reading Velocity
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">95 WPM</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Fluency
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Grade 3 benchmark level</p>
        </div>
      </div>

      {/* 3. Student Progress & Thesis Data Table */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Student Reading Performance Log
            </h3>
            <p className="text-xs text-slate-500">
              Evaluator record showing comprehension accuracy and current badge milestones.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing {reports.length} Students
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading student reports...</div>
        ) : reports.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No students registered in this section yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3">Student Name / ID</th>
                  <th className="pb-3">Section</th>
                  <th className="pb-3">Current Milestone</th>
                  <th className="pb-3">Comprehension %</th>
                  <th className="pb-3">Quizzes Cleared</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reports.map((s) => (
                  <tr key={s.studentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{s.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{s.studentId}</span>
                    </td>
                    <td className="py-3 text-slate-600">{s.section}</td>
                    <td className="py-3 font-semibold text-slate-800">{s.currentBadge}</td>
                    <td className="py-3 font-bold text-slate-900">{s.comprehensionPct}</td>
                    <td className="py-3 text-slate-600">{s.quizzesPassed}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === "Mastering"
                            ? "bg-emerald-50 text-emerald-700"
                            : s.status === "On Track"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400">{s.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
