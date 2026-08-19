"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockStudents = [
  {
    id: "STU-001",
    name: "Maria Santos",
    gender: "Female",
    section: "Grade 3-A",
    currentBadge: "Fire Badge (Stage 2)",
    comprehension: "92.4%",
    accuracyRaw: 92.4,
    quizzesPassed: "3 / 3",
    status: "Mastering",
    readingSpeed: "115 WPM",
    lastActive: "Today, 10:14 AM",
  },
  {
    id: "STU-002",
    name: "Juan Dela Cruz",
    gender: "Male",
    section: "Grade 3-A",
    currentBadge: "Cold Badge (Stage 1)",
    comprehension: "78.0%",
    accuracyRaw: 78.0,
    quizzesPassed: "2 / 2",
    status: "On Track",
    readingSpeed: "95 WPM",
    lastActive: "Yesterday",
  },
  {
    id: "STU-003",
    name: "Angela Garcia",
    gender: "Female",
    section: "Grade 3-A",
    currentBadge: "Fire Badge (Stage 2)",
    comprehension: "95.2%",
    accuracyRaw: 95.2,
    quizzesPassed: "4 / 4",
    status: "Mastering",
    readingSpeed: "128 WPM",
    lastActive: "Today, 08:30 AM",
  },
  {
    id: "STU-004",
    name: "Mark Villanueva",
    gender: "Male",
    section: "Grade 3-A",
    currentBadge: "Cold Badge (Stage 1)",
    comprehension: "65.5%",
    accuracyRaw: 65.5,
    quizzesPassed: "1 / 2",
    status: "Needs Review",
    readingSpeed: "78 WPM",
    lastActive: "2 days ago",
  },
  {
    id: "STU-005",
    name: "Chloe Alcantara",
    gender: "Female",
    section: "Grade 3-A",
    currentBadge: "Fire Badge (Stage 2)",
    comprehension: "88.0%",
    accuracyRaw: 88.0,
    quizzesPassed: "3 / 3",
    status: "Mastering",
    readingSpeed: "105 WPM",
    lastActive: "Today, 09:12 AM",
  },
  {
    id: "STU-006",
    name: "Ethan Ramos",
    gender: "Male",
    section: "Grade 3-A",
    currentBadge: "Water Badge (Stage 3)",
    comprehension: "96.5%",
    accuracyRaw: 96.5,
    quizzesPassed: "5 / 5",
    status: "Mastering",
    readingSpeed: "135 WPM",
    lastActive: "Today, 11:00 AM",
  },
];

export default function TeacherStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredStudents = mockStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || s.status.toLowerCase().includes(filterStatus);
    return matchesSearch && matchesFilter;
  });

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
            <span className="text-slate-900 font-bold">Student Records</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Grade 3 Pupil Reading Records
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Evaluator log for Pedro Victorina Calo Elementary School · Grade 3-A Cohort
          </p>
        </div>

        <Button
          size="sm"
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export Pupil Record (CSV)
        </Button>
      </div>

      {/* 2. Filters & Search */}
      <div className="dashboard-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Status Filter:
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="mastering">Mastering (≥85%)</option>
            <option value="on track">On Track (70-84%)</option>
            <option value="needs review">Needs Review (&lt;70%)</option>
          </select>
        </div>
      </div>

      {/* 3. Students Table */}
      <div className="dashboard-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="pb-3">Student Name & ID</th>
                <th className="pb-3">Section</th>
                <th className="pb-3">Active Milestone</th>
                <th className="pb-3">Comprehension %</th>
                <th className="pb-3">Fluency Speed</th>
                <th className="pb-3">Quizzes Passed</th>
                <th className="pb-3">Intervention Status</th>
                <th className="pb-3 text-right">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 font-bold text-slate-900">
                    <div>{s.name}</div>
                    <span className="text-[10px] text-slate-400 font-normal">{s.id} · {s.gender}</span>
                  </td>
                  <td className="py-3 text-slate-600">{s.section}</td>
                  <td className="py-3 font-semibold text-slate-800">{s.currentBadge}</td>
                  <td className="py-3 font-bold text-slate-900">{s.comprehension}</td>
                  <td className="py-3 text-slate-600">{s.readingSpeed}</td>
                  <td className="py-3 text-slate-600">{s.quizzesPassed}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
