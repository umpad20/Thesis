"use client";

import { useState, useEffect } from "react";
import {
  Printer,
  Users,
  Award,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeacherDashboardSkeleton } from "@/components/page-skeletons";
import { fetchClassRosterReports, type TeacherReportRow } from "@/utils/supabase-queries";
import { fetchTeacherSectionsFromSupabase, getCurrentUser } from "@/utils/auth-helpers";

interface ProcessedReportItem extends TeacherReportRow {
  compScore: number;
  speedNum: number;
  performanceTier: "Mastering" | "On Track" | "Needs Support";
  actionRemark: string;
}

export default function TeacherReportsPage() {
  const [reports, setReports] = useState<TeacherReportRow[]>([]);
  const [allTeacherReports, setAllTeacherReports] = useState<TeacherReportRow[]>([]);
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

      const [roster, liveSections, fullRoster] = await Promise.all([
        fetchClassRosterReports(selectedSection, teacherId),
        fetchTeacherSectionsFromSupabase(teacherId),
        selectedSection === "all" ? null : fetchClassRosterReports("all", teacherId),
      ]);
      setReports(roster);
      if (selectedSection === "all") {
        setAllTeacherReports(roster);
      } else if (fullRoster) {
        setAllTeacherReports(fullRoster);
      }
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

  // ── 1. Process Individual Student Grade 3 Reading Data ────────────────────
  const processedData: ProcessedReportItem[] = reports.map((s) => {
    const compScore = parseFloat(s.comprehensionPct.replace("%", "")) || 0;
    const speedNum = parseInt(s.readingSpeed.replace(/\D/g, ""), 10) || 0;

    let performanceTier: "Mastering" | "On Track" | "Needs Support" = "On Track";
    if (compScore >= 85) {
      performanceTier = "Mastering";
    } else if (compScore >= 70) {
      performanceTier = "On Track";
    } else {
      performanceTier = "Needs Support";
    }

    let actionRemark = "Continue Guided Practice";
    if (performanceTier === "Mastering") {
      actionRemark = s.isAllStagesCompleted ? "Mastered · Ready for Advancement" : "On Track · Independent Practice";
    } else if (performanceTier === "Needs Support") {
      actionRemark = "Priority Guided Remediation";
    }

    return {
      ...s,
      compScore,
      speedNum,
      performanceTier,
      actionRemark,
    };
  });

  // ── 2. Aggregations & Performance Metrics ────────────────────────────────
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

  const masteringList = processedData.filter((r) => r.performanceTier === "Mastering");
  const onTrackList = processedData.filter((r) => r.performanceTier === "On Track");
  const needsSupportList = processedData.filter((r) => r.performanceTier === "Needs Support");

  const masteringPct = totalPupils > 0 ? Math.round((masteringList.length / totalPupils) * 100) : 0;
  const onTrackPct = totalPupils > 0 ? Math.round((onTrackList.length / totalPupils) * 100) : 0;
  const needsSupportPct = totalPupils > 0 ? Math.round((needsSupportList.length / totalPupils) * 100) : 0;

  const passingCount = processedData.filter((r) => r.compScore >= 70).length;
  const passRate = totalPupils > 0 ? Math.round((passingCount / totalPupils) * 100) : 0;

  // Gender Disaggregation
  const boys = processedData.filter((r) => r.gender === "Male");
  const girls = processedData.filter((r) => r.gender === "Female");

  const boyAvgComp = boys.length > 0 ? Math.round(boys.reduce((a, b) => a + b.compScore, 0) / boys.length) : 0;
  const girlAvgComp = girls.length > 0 ? Math.round(girls.reduce((a, b) => a + b.compScore, 0) / girls.length) : 0;

  const boyAvgSpeed = boys.length > 0 ? Math.round(boys.reduce((a, b) => a + b.speedNum, 0) / boys.length) : 0;
  const girlAvgSpeed = girls.length > 0 ? Math.round(girls.reduce((a, b) => a + b.speedNum, 0) / girls.length) : 0;

  const boyMastering = boys.filter((b) => b.performanceTier === "Mastering").length;
  const girlMastering = girls.filter((g) => g.performanceTier === "Mastering").length;

  // 5-Stage Curriculum Progression
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

  // ── 3. Section-by-Section Comparative Analytics ─────────────────────────
  const sectionDataSource = allTeacherReports.length > 0 ? allTeacherReports : reports;

  const sectionComparisons = sections.map((secName) => {
    const secPupils = sectionDataSource.filter((r) => r.section === secName);
    const count = secPupils.length;
    const comps = secPupils.map((p) => parseFloat(p.comprehensionPct.replace("%", "")) || 0);
    const speeds = secPupils
      .map((p) => parseInt(p.readingSpeed.replace(/\D/g, ""), 10) || 0)
      .filter((s) => s > 0);

    const avgComp = count > 0 ? Math.round(comps.reduce((a, b) => a + b, 0) / count) : 0;
    const avgSpeed = speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;

    const passingCount = comps.filter((c) => c >= 70).length;
    const passRate = count > 0 ? Math.round((passingCount / count) * 100) : 0;

    const masteredCount = secPupils.filter((p) => {
      const stageNum = p.currentBadge.match(/Stage (\d+)/i);
      return p.isAllStagesCompleted || (stageNum && parseInt(stageNum[1]) >= 5);
    }).length;
    const masteryPct = count > 0 ? Math.round((masteredCount / count) * 100) : 0;

    const priorityNeedsCount = comps.filter((c) => c < 70).length;

    let statusLabel = "On Track";
    let statusColor = "bg-blue-50 text-blue-700 border-blue-200";
    if (avgComp >= 80 && passRate >= 80) {
      statusLabel = "Meeting Benchmark";
      statusColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
    } else if (passRate < 60 || avgComp < 70) {
      statusLabel = "Needs Guidance";
      statusColor = "bg-amber-50 text-amber-800 border-amber-200";
    }

    return {
      name: secName,
      enrolled: count,
      avgComp,
      avgSpeed,
      passRate,
      masteredCount,
      masteryPct,
      priorityNeedsCount,
      statusLabel,
      statusColor,
    };
  });

  // ── 3. Export CSV ─────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (processedData.length === 0) return;
    const headers = "No.,Learner Name,Sex,Section,Comprehension %,Reading Speed (WPM),Quizzes Cleared,Stage Milestone,Performance Status,Remarks\n";
    const rows = processedData
      .map(
        (s, idx) =>
          `"${idx + 1}","${s.name}","${s.gender}","${s.section}","${s.compScore}%","${s.speedNum > 0 ? s.speedNum : '—'}","${s.quizzesPassed}","${s.currentBadge}","${s.performanceTier}","${s.actionRemark}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Grade_3_Reading_Evaluation_Report_${selectedSection}_${new Date().toISOString().split("T")[0]}.csv`
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
      {/* ── Official Print Header (Visible ONLY when printing) ── */}
      <div className="hidden print:block text-center space-y-1 mb-6 border-b-2 border-slate-900 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-700">Republic of the Philippines</p>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-800">Department of Education · Caraga Administrative Region</p>
        <p className="text-xs font-semibold text-slate-700">Division of Butuan City · District III</p>
        <h2 className="text-base font-black text-slate-950 uppercase tracking-tight pt-1">
          Pedro Victorina Calo Elementary School
        </h2>
        <h3 className="text-sm font-bold text-slate-900 underline mt-0.5">
          Consolidated Grade 3 English Reading Evaluation Sheet
        </h3>
        <div className="flex justify-between items-center text-[10px] text-slate-600 pt-2 px-2 font-mono">
          <span>Section: {selectedSection === "all" ? "All Enrolled Sections" : selectedSection}</span>
          <span>Adviser: {teacherName}</span>
          <span>Date Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      {/* ── 1. Page Header & Actions (Hidden on Print) ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Grade 3 Reading Evaluation Reports
          </h1>
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
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Top Summary KPI Cards (Hidden on Print) ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 print:hidden">
        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Enrolled Students
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{totalPupils}</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">Grade 3</span>
          </div>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Avg Comprehension
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-800">{avgComp}%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Target ≥ 75%</span>
          </div>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Passing Rate
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-purple-900">{passRate}%</span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">{passingCount}/{totalPupils} Students</span>
          </div>
        </div>
      </div>

      {/* ── 3. Section Selector Filter Bar (Hidden on Print) ───────────────── */}
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



      {/* ── 5. Disaggregated Analysis: Gender & Stage Progression ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gender Disaggregated Summary */}
        <div className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Gender Performance Summary</span>
            </h3>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                <th className="py-2">Sex</th>
                <th className="py-2 text-center">Enrolled</th>
                <th className="py-2 text-center">Avg Comp</th>
                <th className="py-2 text-center">Avg WPM</th>
                <th className="py-2 text-right">Mastering</th>
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
                <td className="py-2.5 text-right font-mono text-emerald-700">{boyMastering} ({boys.length > 0 ? Math.round((boyMastering / boys.length) * 100) : 0}%)</td>
              </tr>
              <tr>
                <td className="py-2.5 flex items-center gap-1.5 text-pink-700">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  <span>Female (Girls)</span>
                </td>
                <td className="py-2.5 text-center font-mono">{girls.length}</td>
                <td className="py-2.5 text-center text-emerald-700 font-mono">{girlAvgComp}%</td>
                <td className="py-2.5 text-center text-slate-600 font-mono">{girlAvgSpeed > 0 ? `${girlAvgSpeed} WPM` : "—"}</td>
                <td className="py-2.5 text-right font-mono text-emerald-700">{girlMastering} ({girls.length > 0 ? Math.round((girlMastering / girls.length) * 100) : 0}%)</td>
              </tr>
              <tr className="bg-slate-50/70 font-black text-slate-900">
                <td className="py-2.5 pl-2">Total Class</td>
                <td className="py-2.5 text-center font-mono">{totalPupils}</td>
                <td className="py-2.5 text-center text-emerald-800 font-mono">{avgComp}%</td>
                <td className="py-2.5 text-center text-slate-700 font-mono">{avgSpeed > 0 ? `${avgSpeed} WPM` : "—"}</td>
                <td className="py-2.5 text-right pr-2 font-mono text-emerald-800">{masteringList.length} ({masteringPct}%)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Curriculum Progression & 5-Stage Mastery Matrix */}
        <div className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>5-Stage Curriculum Progression</span>
            </h3>
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

      {/* ── 6. Section Comparative Performance Breakdown (Visible on Screen) ── */}
      <div className="dashboard-card p-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Section Comparative Breakdown</span>
            </h3>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 self-start sm:self-center font-mono">
            {sections.length} Section{sections.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Section Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionComparisons.map((sec) => (
            <div
              key={sec.name}
              className={`p-5 rounded-2xl border transition-all ${
                selectedSection === sec.name
                  ? "bg-blue-50/40 border-blue-300 ring-2 ring-blue-100"
                  : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    {sec.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{sec.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {sec.enrolled} Enrolled Student{sec.enrolled !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${sec.statusColor}`}
                >
                  {sec.statusLabel}
                </span>
              </div>

              {/* 3 Metric Summary Boxes */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-200/60 my-3 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Comprehension
                  </span>
                  <span className="text-base font-black text-emerald-800 font-mono">
                    {sec.avgComp}%
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Fluency
                  </span>
                  <span className="text-base font-black text-slate-800 font-mono">
                    {sec.avgSpeed > 0 ? `${sec.avgSpeed}` : "—"}{" "}
                    <span className="text-[10px] font-normal text-slate-400">WPM</span>
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Pass Rate
                  </span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {sec.passRate}%
                  </span>
                </div>
              </div>

              {/* Progress Detail Rows */}
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span className="text-[11px]">Curriculum Mastered:</span>
                  <span className="font-bold text-slate-900 font-mono text-[11px]">
                    {sec.masteredCount} of {sec.enrolled} ({sec.masteryPct}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span className="text-[11px]">Priority Support / Needs Review:</span>
                  <span
                    className={`font-bold font-mono text-[11px] ${
                      sec.priorityNeedsCount > 0 ? "text-rose-700" : "text-slate-500"
                    }`}
                  >
                    {sec.priorityNeedsCount} Student{sec.priorityNeedsCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Official Print Evaluation Sheet (Visible ONLY When Printing) ── */}
      <div className="hidden print:block space-y-6">
        <div className="border border-slate-900 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-[10px] font-black text-slate-900 uppercase tracking-wider">
                <th className="py-2.5 px-2 text-center w-10">No.</th>
                <th className="py-2.5 px-3 min-w-[150px]">Learner Name</th>
                <th className="py-2.5 px-2 text-center w-12">Sex</th>
                <th className="py-2.5 px-3">Section</th>
                <th className="py-2.5 px-3 text-center">Comp %</th>
                <th className="py-2.5 px-3 text-center">Fluency</th>
                <th className="py-2.5 px-3 text-center">Quizzes Cleared</th>
                <th className="py-2.5 px-3 min-w-[120px]">Milestone</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right min-w-[140px]">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-900">
              {processedData.map((s, idx) => (
                <tr key={s.studentId}>
                  <td className="py-2 px-2 text-center font-mono font-bold text-[10px]">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 font-bold text-xs">{s.name}</td>
                  <td className="py-2 px-2 text-center font-mono text-[10px]">{s.gender === "Male" ? "M" : "F"}</td>
                  <td className="py-2 px-3 font-medium">{s.section}</td>
                  <td className="py-2 px-3 text-center font-mono font-bold">{s.compScore}%</td>
                  <td className="py-2 px-3 text-center font-mono">{s.speedNum > 0 ? `${s.speedNum} WPM` : "—"}</td>
                  <td className="py-2 px-3 text-center font-mono">{s.quizzesPassed}</td>
                  <td className="py-2 px-3 font-medium">
                    {s.isAllStagesCompleted ? "Stage 5 Completed" : s.currentBadge}
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-[10px]">{s.performanceTier}</td>
                  <td className="py-2 px-3 text-right text-[10px] font-medium">{s.actionRemark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Block in Print */}
        <div className="pt-6 border-t border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-900">
          <div>
            <p className="font-semibold text-slate-600 text-[10px] uppercase tracking-wider mb-8">Prepared By:</p>
            <div className="border-b border-slate-900 w-48 mb-1" />
            <p className="font-black text-slate-950">{teacherName}</p>
            <p className="text-[10px] text-slate-600">Reading Teacher / Class Adviser</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="font-semibold text-slate-600 text-[10px] uppercase tracking-wider mb-8">Noted &amp; Verified By:</p>
            <div className="border-b border-slate-900 w-48 mb-1" />
            <p className="font-black text-slate-950">School Principal / Academic Head</p>
            <p className="text-[10px] text-slate-600">Pedro Victorina Calo Elementary School</p>
          </div>
        </div>
      </div>
    </div>
  );
}
