"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Copy,
  Printer,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  enrollStudentAccount,
  fetchTeacherSectionsFromSupabase,
  getCurrentUser,
} from "@/utils/auth-helpers";
import type { StudentEnrollmentInput } from "@/lib/types";

interface PupilEnrollmentRow {
  id: string;
  fullName: string;
  email: string;
  password: string;
  gender: "Female" | "Male";
  showPassword?: boolean;
}

function EnrollPupilsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySection = searchParams.get("section");

  const [sections, setSections] = useState<string[]>(["Grade 3-A"]);
  const [selectedSection, setSelectedSection] = useState<string>(querySection || "Grade 3-A");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");
  const [copied, setCopied] = useState(false);

  const createEmptyPupilRow = (index: number = 1): PupilEnrollmentRow => ({
    id: `pupil-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fullName: "",
    email: "",
    password: "Student2026!",
    gender: index % 2 === 0 ? "Male" : "Female",
    showPassword: false,
  });

  const [pupilRows, setPupilRows] = useState<PupilEnrollmentRow[]>([
    createEmptyPupilRow(1),
    createEmptyPupilRow(2),
    createEmptyPupilRow(3),
  ]);

  const [createdCredentials, setCreatedCredentials] = useState<
    Array<{
      name: string;
      email: string;
      password: string;
      section: string;
      gender: string;
    }> | null
  >(null);

  // Load teacher sections on mount
  useEffect(() => {
    async function loadSections() {
      const user = getCurrentUser();
      try {
        const liveSections = await fetchTeacherSectionsFromSupabase(user?.id);
        if (Array.isArray(liveSections) && liveSections.length > 0) {
          setSections(liveSections);
          if (querySection && liveSections.includes(querySection)) {
            setSelectedSection(querySection);
          } else if (!querySection) {
            setSelectedSection(liveSections[0]);
          }
        }
      } catch {
        setSections(["Grade 3-A"]);
      }
    }
    loadSections();
  }, [querySection]);

  const safeSections = Array.isArray(sections) && sections.length > 0 ? sections : ["Grade 3-A"];

  const handleSectionChange = (sec: string) => {
    setSelectedSection(sec);
    const cleanSec = sec.toLowerCase().replace(/[^a-z0-9]/g, "");
    setPupilRows((prev) =>
      prev.map((row) => {
        const cleanName = row.fullName.toLowerCase().replace(/[^a-z]/g, ".");
        return {
          ...row,
          email: cleanName ? `${cleanName}.${cleanSec}@readsmart.edu` : row.email,
        };
      })
    );
  };

  const handleRowFieldChange = <K extends keyof PupilEnrollmentRow>(
    id: string,
    field: K,
    value: PupilEnrollmentRow[K]
  ) => {
    setPupilRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };
        if (field === "fullName") {
          const cleanName = String(value).toLowerCase().replace(/[^a-z]/g, ".");
          const cleanSec = selectedSection.toLowerCase().replace(/[^a-z0-9]/g, "");
          updated.email = cleanName ? `${cleanName}.${cleanSec}@readsmart.edu` : "";
        }
        return updated;
      })
    );
  };

  const handleAddPupilRow = () => {
    setPupilRows((prev) => [...prev, createEmptyPupilRow(prev.length + 1)]);
  };

  const handleAddMultiplePupilRows = (count: number) => {
    const newRows: PupilEnrollmentRow[] = [];
    for (let i = 0; i < count; i++) {
      newRows.push(createEmptyPupilRow(pupilRows.length + i + 1));
    }
    setPupilRows((prev) => [...prev, ...newRows]);
  };

  const handleClearEmptyRows = () => {
    setPupilRows((prev) => {
      const filtered = prev.filter((r) => r.fullName.trim() !== "");
      return filtered.length > 0 ? filtered : [createEmptyPupilRow(1)];
    });
  };

  const handleRemovePupilRow = (id: string) => {
    if (pupilRows.length <= 1) return;
    setPupilRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEnrollBatchStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = pupilRows.filter((r) => r.fullName.trim() && r.email.trim());
    if (validRows.length === 0) {
      alert("Please fill in at least one pupil's name and email.");
      return;
    }

    setIsSubmitting(true);
    const teacher = getCurrentUser();
    const newlyCreated: Array<{
      name: string;
      email: string;
      password: string;
      section: string;
      gender: string;
    }> = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setSubmitProgress(`Enrolling pupil ${i + 1} of ${validRows.length}: ${row.fullName.trim()}...`);

      const payload: StudentEnrollmentInput = {
        fullName: row.fullName.trim(),
        email: row.email.trim(),
        password: row.password || "Student2026!",
        gender: row.gender,
        section: selectedSection,
        teacherId: teacher?.id,
      };

      const res = await enrollStudentAccount(payload);
      if (res.success && res.student) {
        newlyCreated.push({
          name: res.student.name,
          email: res.student.email || row.email.trim(),
          password: row.password || "Student2026!",
          section: selectedSection,
          gender: row.gender,
        });
      }
    }

    if (newlyCreated.length > 0) {
      setCreatedCredentials(newlyCreated);
    } else {
      alert("Failed to enroll pupils. Please verify student details and try again.");
    }

    setIsSubmitting(false);
    setSubmitProgress("");
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials || createdCredentials.length === 0) return;
    const header = `ReadSmart Pupil Credentials — ${createdCredentials[0]?.section || "Class"}\n=======================================================\n`;
    const rows = createdCredentials
      .map(
        (c, i) =>
          `[#${i + 1}] ${c.name} (${c.gender})\nEmail: ${c.email}\nPassword: ${c.password}\nSection: ${c.section}`
      )
      .join("\n-------------------------------------------------------\n");
    navigator.clipboard.writeText(`${header}\n${rows}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const validCount = pupilRows.filter((r) => r.fullName.trim()).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb Navigation */}
      <div>
        <Link
          href="/teacher/students"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Records</span>
        </Link>
      </div>

      {createdCredentials ? (
        /* Batch Success Credentials Page */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 font-bold text-lg text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <span>
                  {createdCredentials.length} {createdCredentials.length === 1 ? "Pupil" : "Pupils"} Successfully Enrolled in {createdCredentials[0]?.section}!
                </span>
              </div>
              <p className="text-sm text-emerald-800/90">
                Student accounts are active and ready for pupils to sign in.
              </p>
            </div>

            <span className="text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
              {createdCredentials[0]?.section}
            </span>
          </div>

          {/* Roster Table of Generated Credentials */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 text-center w-14">#</th>
                  <th className="py-3 px-4">Student Full Name</th>
                  <th className="py-3 px-4 w-32">Gender</th>
                  <th className="py-3 px-4">Student Email / Login ID</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4 text-right">Classroom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {createdCredentials.map((cred, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {cred.name}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {cred.gender === "Female" ? "👧 Female" : "👦 Male"}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      <span className="bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {cred.email}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {cred.password}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-600">
                      {cred.section}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreatedCredentials(null);
                setPupilRows([createEmptyPupilRow(1), createEmptyPupilRow(2), createEmptyPupilRow(3)]);
              }}
              className="h-11 px-5 rounded-xl font-bold text-sm text-slate-700 cursor-pointer"
            >
              + Enroll More Students
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyCredentials}
                className="flex-1 sm:flex-initial h-11 px-6 rounded-xl font-bold text-sm border-slate-200 flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy All Login Credentials"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                className="h-11 px-4 rounded-xl font-bold text-sm border-slate-200 hidden sm:flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </Button>

              <Button
                type="button"
                onClick={() => router.push("/teacher/students")}
                className="flex-1 sm:flex-initial h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm cursor-pointer"
              >
                Done &amp; View Records
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Enrollment Form Screen */
        <form onSubmit={handleEnrollBatchStudents} className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs flex-shrink-0">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Enroll Students
                  </h1>
                </div>
              </div>

              {/* Target Section Selector */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Section:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {safeSections.map((sec) => (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => handleSectionChange(sec)}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedSection === sec
                          ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pupils Spreadsheet Roster Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Class Roster Entries
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddPupilRow}
                  className="px-3 py-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Row</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMultiplePupilRows(5)}
                  className="px-3 py-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add 5 Rows</span>
                </button>
                {pupilRows.length > 1 && (
                  <button
                    type="button"
                    onClick={handleClearEmptyRows}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Clear Empty
                  </button>
                )}
              </div>
            </div>

            {/* Rows Container */}
            <div className="p-6 space-y-3">
              {/* Header labels on desktop */}
              <div className="hidden lg:flex items-center gap-3 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-500">
                <div className="w-8 text-center flex-shrink-0">#</div>
                <div className="flex-[3] min-w-[200px]">
                  Student Full Name <span className="text-blue-600">*</span>
                </div>
                <div className="w-40 flex-shrink-0">Gender</div>
                <div className="flex-[3] min-w-[220px]">
                  Student Email / Login ID <span className="text-blue-600">*</span>
                </div>
                <div className="w-48 flex-shrink-0">
                  Password <span className="text-blue-600">*</span>
                </div>
                <div className="w-8 text-center flex-shrink-0" />
              </div>

              {pupilRows.map((row, idx) => (
                <div
                  key={row.id}
                  className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-white transition-all shadow-2xs"
                >
                  {/* Desktop Row */}
                  <div className="hidden lg:flex items-center gap-3">
                    <div className="w-8 text-center flex-shrink-0">
                      <span className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold text-xs flex items-center justify-center mx-auto border border-slate-200">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex-[3] min-w-[200px]">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Juanito Santos"
                        value={row.fullName}
                        onChange={(e) => handleRowFieldChange(row.id, "fullName", e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                    </div>

                    <div className="w-40 flex-shrink-0">
                      <select
                        value={row.gender}
                        onChange={(e) =>
                          handleRowFieldChange(row.id, "gender", e.target.value as "Female" | "Male")
                        }
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                      >
                        <option value="Female">Female 👧</option>
                        <option value="Male">Male 👦</option>
                      </select>
                    </div>

                    <div className="flex-[3] min-w-[220px]">
                      <input
                        type="email"
                        required
                        placeholder="e.g. juanito.santos.3a@readsmart.edu"
                        value={row.email}
                        onChange={(e) => handleRowFieldChange(row.id, "email", e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3.5 text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                    </div>

                    <div className="w-48 flex-shrink-0">
                      <div className="relative">
                        <input
                          type={row.showPassword ? "text" : "password"}
                          required
                          value={row.password}
                          onChange={(e) => handleRowFieldChange(row.id, "password", e.target.value)}
                          className="w-full h-10 bg-white border border-slate-200 rounded-lg pl-3 pr-9 text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleRowFieldChange(row.id, "showPassword", !row.showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          {row.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="w-8 text-center flex-shrink-0">
                      {pupilRows.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemovePupilRow(row.id)}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer mx-auto"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="w-8 h-8" />
                      )}
                    </div>
                  </div>

                  {/* Mobile Row */}
                  <div className="lg:hidden space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Pupil #{idx + 1}
                      </span>
                      {pupilRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePupilRow(row.id)}
                          className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Juanito Santos"
                          value={row.fullName}
                          onChange={(e) => handleRowFieldChange(row.id, "fullName", e.target.value)}
                          className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">Gender</label>
                        <select
                          value={row.gender}
                          onChange={(e) =>
                            handleRowFieldChange(row.id, "gender", e.target.value as "Female" | "Male")
                          }
                          className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2.5 text-xs"
                        >
                          <option value="Female">Female 👧</option>
                          <option value="Male">Male 👦</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">Email *</label>
                        <input
                          type="email"
                          required
                          value={row.email}
                          onChange={(e) => handleRowFieldChange(row.id, "email", e.target.value)}
                          className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">Password *</label>
                        <input
                          type="text"
                          required
                          value={row.password}
                          onChange={(e) => handleRowFieldChange(row.id, "password", e.target.value)}
                          className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddPupilRow}
                className="w-full py-3 border border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50/40 text-blue-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <span>+ Add Another Student Row</span>
              </button>
            </div>

            {/* Bottom Actions Bar */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-medium text-slate-600">
                {isSubmitting ? (
                  <div className="flex items-center gap-2 text-blue-600 font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{submitProgress || "Enrolling in Supabase..."}</span>
                  </div>
                ) : (
                  <span>
                    Ready to enroll <strong>{validCount}</strong> {validCount === 1 ? "student" : "students"} in <strong>{selectedSection}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/teacher/students")}
                  className="flex-1 sm:flex-initial h-11 px-6 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || validCount === 0}
                  className="flex-1 sm:flex-initial h-11 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Enrolling..." : `Enroll ${validCount} ${validCount === 1 ? "Student" : "Students"}`}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function TeacherEnrollPupilsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <EnrollPupilsForm />
    </Suspense>
  );
}
