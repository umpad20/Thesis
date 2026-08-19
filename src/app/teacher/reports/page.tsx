"use client";

import Link from "next/link";
import {
  Download,
  ChevronRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockStudentsReport = [
  { id: "STU-001", name: "Maria Santos", gender: "F", stage: "Stage 2 (Fire)", comprehension: 92.4, velocity: "115 WPM", quizzes: "3/3", status: "Mastering" },
  { id: "STU-002", name: "Juan Dela Cruz", gender: "M", stage: "Stage 1 (Cold)", comprehension: 78.0, velocity: "95 WPM", quizzes: "2/2", status: "On Track" },
  { id: "STU-003", name: "Angela Garcia", gender: "F", stage: "Stage 2 (Fire)", comprehension: 95.2, velocity: "128 WPM", quizzes: "4/4", status: "Mastering" },
  { id: "STU-004", name: "Mark Villanueva", gender: "M", stage: "Stage 1 (Cold)", comprehension: 65.5, velocity: "78 WPM", quizzes: "1/2", status: "Needs Review" },
  { id: "STU-005", name: "Chloe Alcantara", gender: "F", stage: "Stage 2 (Fire)", comprehension: 88.0, velocity: "105 WPM", quizzes: "3/3", status: "Mastering" },
  { id: "STU-006", name: "Ethan Ramos", gender: "M", stage: "Stage 3 (Water)", comprehension: 96.5, velocity: "135 WPM", quizzes: "5/5", status: "Mastering" },
];

export default function TeacherReportsPage() {
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
            <span className="text-slate-900 font-bold">Thesis Reports</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Reading Comprehension Analytics & Thesis Data
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Research evaluation suite for Pedro Victorina Calo Elementary School · Grade 3-A Cohort
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Export Pre-Test Data
          </Button>
          <Button
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
            <span className="text-xl font-black text-slate-900">86.8%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+4.8%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">DepEd benchmark ≥70%</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Mastery Rate (≥85%)
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">75%</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">24 / 32</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Students marked &quot;Mastering&quot;</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Quiz Pass Rate
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">92%</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">96 Attempts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Avg 3.4 min per quiz</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Avg Reading Velocity
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">109 WPM</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Grade 3 Norm</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Target: 80–120 WPM</p>
        </div>
      </div>

      {/* 3. Comprehension Gain Visualization */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Pre-Test vs. Post-Test Comprehension Gains
            </h3>
            <p className="text-xs text-slate-500">
              Simulated improvement delta per reading stage — thesis experimental data.
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="space-y-4">
          {[
            { stage: "Stage 1 — Cold Badge (Lessons 1–2)", pre: 62, post: 88 },
            { stage: "Stage 2 — Fire Badge (Lessons 3–4)", pre: 65, post: 91 },
            { stage: "Stage 3 — Water Badge (Lessons 5–6)", pre: 70, post: 95 },
          ].map((row) => (
            <div key={row.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{row.stage}</span>
                <span className="text-emerald-600 font-bold">+{row.post - row.pre}% gain</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 w-14">Pre: {row.pre}%</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${row.post}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-600 w-16">Post: {row.post}%</span>
              </div>
            </div>
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
              Thesis respondent data with mastery level, fluency, and quiz performance.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            6 of 32 Shown · <span className="text-blue-600">Export for full dataset</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Sex</th>
                <th className="pb-3">Active Stage</th>
                <th className="pb-3">Comprehension %</th>
                <th className="pb-3">Fluency (WPM)</th>
                <th className="pb-3">Quizzes</th>
                <th className="pb-3 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mockStudentsReport.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 text-slate-500">{s.gender}</td>
                  <td className="py-3 text-slate-700">{s.stage}</td>
                  <td className="py-3 font-bold text-slate-900">{s.comprehension}%</td>
                  <td className="py-3 text-slate-600">{s.velocity}</td>
                  <td className="py-3 text-slate-600">{s.quizzes}</td>
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
      </div>
    </div>
  );
}
