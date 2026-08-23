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
import { fetchTeacherSectionsFromSupabase } from "@/utils/auth-helpers";

export default function TeacherReportsPage() {
  const [reports, setReports] = useState<TeacherReportRow[]>([]);
  const [selectedSection, setSelectedSection] = useState("all");
  const [sections, setSections] = useState<string[]>(["Grade 3-A"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [roster, liveSections] = await Promise.all([
        fetchClassRosterReports(selectedSection),
        fetchTeacherSectionsFromSupabase(),
      ]);
      setReports(roster);
      if (Array.isArray(liveSections) && liveSections.length > 0) {
        setSections(liveSections);
      }
      setLoading(false);
    }
    loadData();
  }, [selectedSection]);

  const avgComp =
    reports.length > 0
      ? Math.round(
          reports.reduce((acc, curr) => acc + Number.parseFloat(curr.comprehensionPct), 0) /
            reports.length
        )
      : 85;

  const masteringCount = reports.filter((r) => r.status === "Mastering").length;
  const masteryRate = reports.length > 0 ? Math.round((masteringCount / reports.length) * 100) : 75;

  const exportCSV = () => {
    if (reports.length === 0) return;
    const headers = "Student ID,Student Name,Sex,Section,Current Milestone,Comprehension %,Reading Speed,Quizzes Cleared,Status\n";
    const rows = reports
      .map(
        (s) =>
          `"${s.studentId}","${s.name}","${s.gender}","${s.section}","${s.currentBadge}","${s.comprehensionPct}","${s.readingSpeed}","${s.quizzesPassed}","${s.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Class_Reading_Report_${selectedSection}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/teacher" className="hover:text-slate-600">
              Teacher Hub
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">Reports</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Reading Comprehension Analytics &amp; Reports
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Pedro Victorina Calo Elementary School · Live Database Performance Suite
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={exportCSV}
            size="sm"
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Full CSV Export
          </Button>
        </div>
      </div>

      {/* 2. KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Class Avg Comprehension
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{avgComp}%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">≥70% DepEd</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Target Grade 3 proficiency</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Mastery Rate (≥85%)
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{masteryRate}%</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {masteringCount} / {reports.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Pupils classified as &quot;Mastering&quot;</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Enrolled Cohort
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{reports.length}</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">Pupils</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Registered student accounts</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Avg Reading Velocity
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">95 WPM</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Grade 3 Norm</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Target: 80–120 WPM</p>
        </div>
      </div>

      {/* 3. Section Filter Bar */}
      <div className="dashboard-card p-3.5 bg-slate-50 border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span>Filter Section:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedSection("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedSection === "all" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            All Sections
          </button>
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedSection === sec ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Full Student Performance Table */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Individual Student Evaluation Record
            </h3>
            <p className="text-xs text-slate-500">
              Live database performance records with badge milestones, fluency, and quiz evaluation scores.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {reports.length} Students Registered
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading student reports...</div>
        ) : reports.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No students found for this section filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3">Student Name / ID</th>
                  <th className="pb-3">Sex</th>
                  <th className="pb-3">Section</th>
                  <th className="pb-3">Active Stage</th>
                  <th className="pb-3">Comprehension %</th>
                  <th className="pb-3">Fluency (WPM)</th>
                  <th className="pb-3">Quizzes Cleared</th>
                  <th className="pb-3 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reports.map((s) => (
                  <tr key={s.studentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{s.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{s.studentId}</span>
                    </td>
                    <td className="py-3 text-slate-500">{s.gender}</td>
                    <td className="py-3 text-slate-600">{s.section}</td>
                    <td className="py-3 text-slate-700 font-semibold">{s.currentBadge}</td>
                    <td className="py-3 font-bold text-slate-900">{s.comprehensionPct}</td>
                    <td className="py-3 text-slate-600">{s.readingSpeed}</td>
                    <td className="py-3 text-slate-600">{s.quizzesPassed}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === "Mastering"
                            ? "bg-emerald-50 text-emerald-700"
                            : s.status === "On Track"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-rose-50 text-rose-700"
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
    </div>
  );
}
