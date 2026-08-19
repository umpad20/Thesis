"use client";

import Link from "next/link";
import {
  Users,
  BookOpen,
  FileCheck2,
  Download,
  Plus,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
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
            Pedro Victorina Calo Elementary School · Section 3-A Cohort Monitoring
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/teacher/reports">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Thesis Export (CSV)
            </Button>
          </Link>
          <Link href="/teacher/lessons">
            <Button
              size="sm"
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Story Passage
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Cohort KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Enrolled Pupils
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">32</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Grade 3-A
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">100% active this week</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Class Comprehension
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">86.8%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              +4.8% Gain
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Benchmark: ≥70% DepEd</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Quizzes Evaluated
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">96</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              92% Pass Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Avg time: 3.4 mins</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active Stories
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">8</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              5 Badge Stages
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">All with audio narration</p>
        </div>
      </div>

      {/* 3. Class Mastery Stage Distribution */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Class Mastery Progression Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Where students currently stand along the 5-stage mastery curriculum.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Cohort Size: 32 Students
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">Stage 1: Cold Badge (Lesson 1-2)</span>
              <span className="text-slate-900">32 / 32 Students (100% Cleared)</span>
            </div>
            <Progress value={100} className="h-2 bg-slate-100" />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-blue-700">Stage 2: Fire Badge (Lesson 3-4) — Currently Active</span>
              <span className="text-blue-600 font-bold">24 / 32 Students (75% In Progress)</span>
            </div>
            <Progress value={75} className="h-2 bg-slate-100" />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-500">Stage 3: Water Badge (Lesson 5-6)</span>
              <span className="text-slate-400">8 / 32 Students (25% Unlocked)</span>
            </div>
            <Progress value={25} className="h-2 bg-slate-100" />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-500">Stage 4 & 5: Nature & Master Reader</span>
              <span className="text-slate-400">0 / 32 Students (Locked for next week)</span>
            </div>
            <Progress value={0} className="h-2 bg-slate-100" />
          </div>
        </div>
      </div>

      {/* 4. Quick Action Grid for Teachers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/teacher/students" className="dashboard-card p-5 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Student Performance Log
          </h4>
          <p className="text-xs text-slate-500">
            View individual student scores, quiz velocity, and mastery milestones.
          </p>
        </Link>

        <Link href="/teacher/lessons" className="dashboard-card p-5 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Reading Curriculum Manager
          </h4>
          <p className="text-xs text-slate-500">
            Edit reading stories, upload voice narrations, and configure page texts.
          </p>
        </Link>

        <Link href="/teacher/quizzes" className="dashboard-card p-5 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Quiz Question Bank
          </h4>
          <p className="text-xs text-slate-500">
            Create multiple-choice questions, set point weights, and write hints.
          </p>
        </Link>
      </div>
    </div>
  );
}
