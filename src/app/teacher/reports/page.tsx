"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Printer,
  Users,
  Award,
  Layers,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeacherDashboardSkeleton } from "@/components/page-skeletons";
import { fetchClassRosterReports, type TeacherReportRow } from "@/utils/supabase-queries";
import { fetchTeacherSectionsFromSupabase, getCurrentUser } from "@/utils/auth-helpers";

interface ProcessedReportItem extends TeacherReportRow {
  compScore: number;
  speedNum: number;
  readingProfile: "Independent" | "Instructional" | "Frustration";
  remark: string;
}

export default function TeacherReportsPage() {
  const [reports, setReports] = useState<TeacherReportRow[]>([]);
  const [selectedSection, setSelectedSection] = useState("all");
  const [sections, setSections] = useState<string[]>(["Grade 3-A"]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("Grade 3 Faculty");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      if (user?.fullName) {
        setTeacherName(user.fullName);
      }
      const teacherId = user?.id;

      const [roster, liveSections] = await Promise.all([
        fetchClassRosterReports(selectedSection, teacherId),
        fetchTeacherSectionsFromSupabase(teacherId),
      ]);
      setReports(roster);
      if (Array.isArray(liveSections) && liveSections.length > 0) {
        setSections(liveSections);
      }
      setLoading(false);
    }
    loadData();
  }, [selectedSection]);

  if (loading) {
    return <TeacherDashboardSkeleton />;
  }

  // ── 1. Process Individual Student Phil-IRI Data ───────────────────────────
  const processedData: ProcessedReportItem[] = reports.map((s) => {
    const compScore = parseFloat(s.comprehensionPct.replace("%", "")) || 0;
    const speedNum = parseInt(s.readingSpeed.replace(/\D/g, ""), 10) || 0;

    let readingProfile: "Independent" | "Instructional" | "Frustration" = "Instructional";
    if (compScore >= 80) {
      readingProfile = "Independent";
    } else if (compScore >= 59) {
      readingProfile = "Instructional";
    } else {
      readingProfile = "Frustration";
    }

    let remark = "Instructional Support";
    if (readingProfile === "Independent") {
      remark = s.isAllStagesCompleted ? "Mastered · Ready for Advancement" : "On Track · Independent";
    } else if (readingProfile === "Frustration") {
      remark = "Priority Guided Remediation";
    }

    return {
      ...s,
      compScore,
      speedNum,
      readingProfile,
      remark,
    };
  });

  // ── 2. Aggregations & DepEd Metrics ───────────────────────────────────────
  const totalPupils = processedData.length;

  const avgComp =
    totalPupils > 0
      ? Math.round(processedData.reduce((acc, curr) => acc + curr.compScore, 0) / totalPupils)
      : 0;

  const validSpeeds = processedData.filter((r) => r.speedNum > 0);
  const avgSpeed =
    validSpeeds.length > 0
      ? Math.round(validSpeeds.reduce((acc, curr) => acc + curr.speedNum, 0) / validSpeeds.length)
      : 0;

  const independentList = processedData.filter((r) => r.readingProfile === "Independent");
  const instructionalList = processedData.filter((r) => r.readingProfile === "Instructional");
  const frustrationList = processedData.filter((r) => r.readingProfile === "Frustration");

  const independentPct = totalPupils > 0 ? Math.round((independentList.length / totalPupils) * 100) : 0;
  const instructionalPct = totalPupils > 0 ? Math.round((instructionalList.length / totalPupils) * 100) : 0;
  const frustrationPct = totalPupils > 0 ? Math.round((frustrationList.length / totalPupils) * 100) : 0;

  // Gender Disaggregation
  const boys = processedData.filter((r) => r.gender === "Male");
  const girls = processedData.filter((r) => r.gender === "Female");

  const boyAvgComp = boys.length > 0 ? Math.round(boys.reduce((a, b) => a + b.compScore, 0) / boys.length) : 0;
  const girlAvgComp = girls.length > 0 ? Math.round(girls.reduce((a, b) => a + b.compScore, 0) / girls.length) : 0;

  const boyAvgSpeed = boys.length > 0 ? Math.round(boys.reduce((a, b) => a + b.speedNum, 0) / boys.length) : 0;
  const girlAvgSpeed = girls.length > 0 ? Math.round(girls.reduce((a, b) => a + b.speedNum, 0) / girls.length) : 0;

  const boyIndependent = boys.filter((b) => b.readingProfile === "Independent").length;
  const girlIndependent = girls.filter((g) => g.readingProfile === "Independent").length;

  // Stage Mastery Matrix
  const stageStats = [
    {
      order: 1,
      name: "Stage 1: Reading Star Badge",
      count: processedData.filter((r) => r.quizzesPassed !== "0/0" && r.quizzesPassed !== "0/4").length,
    },
    {
      order: 2,
      name: "Stage 2: Reading Ribbon Badge",
      count: processedData.filter((r) => {
        const stageNum = r.currentBadge.match(/Stage (\d+)/i);
        return r.isAllStagesCompleted || (stageNum && parseInt(stageNum[1]) >= 2);
      }).length,
    },
    {
      order: 3,
      name: "Stage 3: Bronze Medal Badge",
      count: processedData.filter((r) => {
        const stageNum = r.currentBadge.match(/Stage (\d+)/i);
        return r.isAllStagesCompleted || (stageNum && parseInt(stageNum[1]) >= 3);
      }).length,
    },
    {
      order: 4,
      name: "Stage 4: Silver Medal Badge",
      count: processedData.filter((r) => {
        const stageNum = r.currentBadge.match(/Stage (\d+)/i);
        return r.isAllStagesCompleted || (stageNum && parseInt(stageNum[1]) >= 4);
      }).length,
    },
    {
      order: 5,
      name: "Stage 5: Gold Medal Badge (Mastered)",
      count: processedData.filter((r) => r.isAllStagesCompleted).length,
    },
  ];

  // ── 3. Export CSV (Official DepEd Report Format) ───────────────────────────
  const exportCSV = () => {
    if (processedData.length === 0) return;
    const headers = "No.,Learner Name,Sex,Section,Phil-IRI Profile,Comprehension %,Reading Speed (WPM),Current Stage Milestone,Remarks\n";
    const rows = processedData
      .map(
        (s, idx) =>
          `"${idx + 1}","${s.name}","${s.gender}","${s.section}","${s.readingProfile}","${s.compScore}%","${s.speedNum > 0 ? s.speedNum : '—'}","${s.currentBadge}","${s.remark}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `DepEd_PhilIRI_Reading_Report_${selectedSection}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ── Official DepEd Print Header (Visible ONLY when printing) ── */}
      <div className="hidden print:block text-center space-y-1 mb-6 border-b-2 border-slate-900 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-700">Republic of the Philippines</p>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-800">Department of Education · Caraga Administrative Region</p>
        <p className="text-xs font-semibold text-slate-700">Division of Butuan City · District III</p>
        <h2 className="text-base font-black text-slate-950 uppercase tracking-tight pt-1">
          Pedro Victorina Calo Elementary School
        </h2>
        <h3 className="text-sm font-bold text-slate-900 underline mt-0.5">
          Consolidated Phil-IRI Reading Comprehension Assessment Report
        </h3>
        <div className="flex justify-between items-center text-[10px] text-slate-600 pt-2 px-2 font-mono">
          <span>Section: {selectedSection === "all" ? "All Enrolled Sections" : selectedSection}</span>
          <span>Adviser / Teacher: {teacherName}</span>
          <span>Date Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      {/* ── 1. Page Header & Actions (Hidden on Print) ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Reading Comprehension Analytics &amp; Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated Phil-IRI profile, curriculum progression, and official DepEd reading assessment register.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="h-9 px-3.5 rounded-xl border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Official Sheet</span>
          </Button>

          <Button
            onClick={exportCSV}
            size="sm"
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export DepEd CSV</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Section Selector Filter Bar (Hidden on Print) ───────────────── */}
      <div className="dashboard-card p-3 bg-slate-50/90 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Curriculum Scope:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedSection("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSection === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            All Sections ({reports.length})
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
      </div>

      {/* ── 3. Phil-IRI Reading Profile Classification Cards ──────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Phil-IRI Reading Profile Classification
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            DepEd Benchmark Standard (Grade 3)
          </span>
        </div>

        {/* Multi-Segment Distribution Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${independentPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Independent: ${independentPct}%`}
          />
          <div
            style={{ width: `${instructionalPct}%` }}
            className="bg-amber-400 transition-all duration-500"
            title={`Instructional: ${instructionalPct}%`}
          />
          <div
            style={{ width: `${frustrationPct}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Frustration: ${frustrationPct}%`}
          />
        </div>

        {/* Level Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Independent Readers */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Independent Reader</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                {independentPct}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-950 font-mono">
                {independentList.length}
              </span>
              <span className="text-xs font-bold text-emerald-700">Learners</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 mt-1">
              Score ≥ 80% &amp; Speed ≥ 90 WPM. Capable of independent comprehension.
            </p>
          </div>

          {/* Instructional Readers */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>Instructional Reader</span>
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                {instructionalPct}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-950 font-mono">
                {instructionalList.length}
              </span>
              <span className="text-xs font-bold text-amber-700">Learners</span>
            </div>
            <p className="text-[11px] text-amber-800/80 mt-1">
              Score 59%–79%. Benefits from teacher guidance &amp; vocabulary review.
            </p>
          </div>

          {/* Frustration Readers */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Frustration Reader</span>
              </span>
              <span className="text-xs font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                {frustrationPct}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-950 font-mono">
                {frustrationList.length}
              </span>
              <span className="text-xs font-bold text-rose-700">Learners</span>
            </div>
            <p className="text-[11px] text-rose-800/80 mt-1">
              Score &lt; 59%. Priority candidates for targeted phonics &amp; remediation.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Disaggregated Analysis: Gender & Stage Mastery Matrix ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gender Disaggregated Performance (DepEd Form 1 standard) */}
        <div className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Gender Disaggregated Summary</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">DepEd Standard</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                <th className="py-2">Sex</th>
                <th className="py-2 text-center">Enrolled</th>
                <th className="py-2 text-center">Avg Comp</th>
                <th className="py-2 text-center">Avg WPM</th>
                <th className="py-2 text-right">Independent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
              <tr>
                <td className="py-2.5 flex items-center gap-1.5 text-blue-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Male (Boys)</span>
                </td>
                <td className="py-2.5 text-center font-mono">{boys.length}</td>
                <td className="py-2.5 text-center text-emerald-700 font-mono">{boyAvgComp}%</td>
                <td className="py-2.5 text-center text-slate-600 font-mono">{boyAvgSpeed > 0 ? `${boyAvgSpeed} WPM` : "—"}</td>
                <td className="py-2.5 text-right font-mono text-emerald-700">{boyIndependent} ({boys.length > 0 ? Math.round((boyIndependent / boys.length) * 100) : 0}%)</td>
              </tr>
              <tr>
                <td className="py-2.5 flex items-center gap-1.5 text-pink-700">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  <span>Female (Girls)</span>
                </td>
                <td className="py-2.5 text-center font-mono">{girls.length}</td>
                <td className="py-2.5 text-center text-emerald-700 font-mono">{girlAvgComp}%</td>
                <td className="py-2.5 text-center text-slate-600 font-mono">{girlAvgSpeed > 0 ? `${girlAvgSpeed} WPM` : "—"}</td>
                <td className="py-2.5 text-right font-mono text-emerald-700">{girlIndependent} ({girls.length > 0 ? Math.round((girlIndependent / girls.length) * 100) : 0}%)</td>
              </tr>
              <tr className="bg-slate-50/70 font-black text-slate-900">
                <td className="py-2.5 pl-2">Total Class</td>
                <td className="py-2.5 text-center font-mono">{totalPupils}</td>
                <td className="py-2.5 text-center text-emerald-800 font-mono">{avgComp}%</td>
                <td className="py-2.5 text-center text-slate-700 font-mono">{avgSpeed > 0 ? `${avgSpeed} WPM` : "—"}</td>
                <td className="py-2.5 text-right pr-2 font-mono text-emerald-800">{independentList.length} ({independentPct}%)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Curriculum Progression & Stage Mastery Matrix */}
        <div className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>5-Stage Curriculum Progression</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Mastery Matrix</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {stageStats.map((stg) => {
              const pct = totalPupils > 0 ? Math.round((stg.count / totalPupils) * 100) : 0;
              return (
                <div key={stg.order} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 text-[11px] truncate max-w-[240px]">
                      {stg.name}
                    </span>
                    <span className="text-slate-900 font-mono text-[11px]">
                      {stg.count} / {totalPupils} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        stg.order === 5
                          ? "bg-amber-500"
                          : stg.order >= 3
                          ? "bg-blue-600"
                          : "bg-sky-400"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5. Consolidated Reading Assessment Sheet (Clean Official Table) ─ */}
      <div className="dashboard-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Consolidated Reading Assessment Sheet</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official school assessment register with Phil-IRI reading profile, oral rate, and promotion remarks.
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 self-start sm:self-center font-mono">
            {totalPupils} Learners Registered
          </span>
        </div>

        {totalPupils === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No student assessment records found for this section.
          </div>
        ) : (
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-10">No.</th>
                    <th className="py-3 px-3.5 min-w-[170px]">Learner Full Name</th>
                    <th className="py-3 px-2 text-center w-12">Sex</th>
                    <th className="py-3 px-3">Section</th>
                    <th className="py-3 px-3 text-center">Phil-IRI Profile</th>
                    <th className="py-3 px-3 text-center">Comp %</th>
                    <th className="py-3 px-3 text-center">Fluency</th>
                    <th className="py-3 px-3 min-w-[150px]">Current Stage Milestone</th>
                    <th className="py-3 px-3.5 text-right min-w-[160px]">Remarks / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {processedData.map((s, idx) => (
                    <tr key={s.studentId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Row No. */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Learner Name & ID */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 text-xs">
                          {s.name}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          STU-{s.studentId.slice(0, 5).toUpperCase()}
                        </span>
                      </td>

                      {/* Sex (M / F) */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-black ${
                            s.gender === "Male"
                              ? "bg-blue-50 text-blue-700 border border-blue-200/70"
                              : "bg-pink-50 text-pink-700 border border-pink-200/70"
                          }`}
                        >
                          {s.gender === "Male" ? "M" : "F"}
                        </span>
                      </td>

                      {/* Section */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-semibold">
                        {s.section}
                      </td>

                      {/* Phil-IRI Reading Profile */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            s.readingProfile === "Independent"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : s.readingProfile === "Instructional"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {s.readingProfile}
                        </span>
                      </td>

                      {/* Comprehension Score */}
                      <td className="py-3 px-3 text-center font-black text-slate-900 font-mono">
                        {s.compScore}%
                      </td>

                      {/* Fluency */}
                      <td className="py-3 px-3 text-center text-slate-700 font-mono whitespace-nowrap">
                        {s.speedNum > 0 ? `${s.speedNum} WPM` : "—"}
                      </td>

                      {/* Milestone */}
                      <td className="py-3 px-3 text-slate-800 font-semibold">
                        {s.isAllStagesCompleted ? (
                          <span className="text-amber-900 font-bold inline-flex items-center gap-1">
                            <span>Stage 5 Completed</span>
                          </span>
                        ) : (
                          <span>{s.currentBadge}</span>
                        )}
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <span
                          className={`inline-block text-[11px] font-bold ${
                            s.readingProfile === "Independent"
                              ? "text-emerald-700"
                              : s.readingProfile === "Instructional"
                              ? "text-amber-700"
                              : "text-rose-700"
                          }`}
                        >
                          {s.remark}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Official Signatures Block (Visible in Print & Bottom of Sheet) ── */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700">
          <div>
            <p className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-8">Prepared By:</p>
            <div className="border-b border-slate-400 w-48 mb-1" />
            <p className="font-black text-slate-900">{teacherName}</p>
            <p className="text-[10px] text-slate-500">Reading Teacher / Class Adviser</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-8">Noted &amp; Verified By:</p>
            <div className="border-b border-slate-400 w-48 mb-1" />
            <p className="font-black text-slate-900">School Principal / Academic Head</p>
            <p className="text-[10px] text-slate-500">Pedro Victorina Calo Elementary School</p>
          </div>
        </div>
      </div>
    </div>
  );
}
