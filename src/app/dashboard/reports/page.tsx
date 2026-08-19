"use client";

import Link from "next/link";
import {
  Download,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockStudentsData = [
  {
    id: "STU-001",
    name: "Maria Santos",
    section: "Grade 3-A",
    currentBadge: "Fire Badge (Stage 2)",
    comprehension: "92.4%",
    quizzesPassed: "3 / 3",
    status: "Mastering",
    lastActive: "Today, 10:14 AM",
  },
  {
    id: "STU-002",
    name: "Juan Dela Cruz",
    section: "Grade 3-A",
    currentBadge: "Cold Badge (Stage 1)",
    comprehension: "78.0%",
    quizzesPassed: "2 / 2",
    status: "On Track",
    lastActive: "Yesterday",
  },
  {
    id: "STU-003",
    name: "Angela Garcia",
    section: "Grade 3-A",
    currentBadge: "Fire Badge (Stage 2)",
    comprehension: "95.2%",
    quizzesPassed: "4 / 4",
    status: "Mastering",
    lastActive: "Today, 08:30 AM",
  },
  {
    id: "STU-004",
    name: "Mark Villanueva",
    section: "Grade 3-A",
    currentBadge: "Cold Badge (Stage 1)",
    comprehension: "65.5%",
    quizzesPassed: "1 / 2",
    status: "Needs Review",
    lastActive: "2 days ago",
  },
];

export default function ReportsPage() {
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
            Reading Performance & Evaluation Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Teacher & Researcher Monitoring Portal · Pedro Victorina Calo Elementary School
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Filter Section: Grade 3-A
          </Button>
          <Button
            size="sm"
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Thesis Data (CSV)
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
            <span className="text-xl font-black text-slate-900">86.8%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              +4.8% YoY
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Target ≥70% DepEd benchmark</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active Respondents
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">32 Students</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Grade 3 Cohort
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">100% active this week</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Badges Conferred
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">48 Badges</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              Mastery Path
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Cold & Fire stages leading</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Avg Quiz Velocity
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">3.4 Mins</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Fast Fluency
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Per 3-question evaluation</p>
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
            Showing 4 of 32 Students
          </span>
        </div>

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
                <th className="pb-3 text-right">Last Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mockStudentsData.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 font-bold text-slate-900">
                    <div>{s.name}</div>
                    <span className="text-[10px] text-slate-400 font-normal">{s.id}</span>
                  </td>
                  <td className="py-3 text-slate-600">{s.section}</td>
                  <td className="py-3 font-semibold text-slate-800">{s.currentBadge}</td>
                  <td className="py-3 font-bold text-slate-900">{s.comprehension}</td>
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
      </div>
    </div>
  );
}
