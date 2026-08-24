"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  ChevronRight,
  UserPlus,
  Layers,
  CheckCircle2,
  Copy,
  Sparkles,
  Plus,
  Users,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  addTeacherSection,
  enrollStudentAccount,
  fetchTeacherSectionsFromSupabase,
  fetchStudentsFromSupabase,
  getCurrentUser,
} from "@/utils/auth-helpers";
import type { EnrolledStudent, StudentEnrollmentInput } from "@/lib/types";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [sections, setSections] = useState<string[]>(["Grade 3-A"]);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  // Enrollment Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("Student2026!");
  const [newGender, setNewGender] = useState<"Female" | "Male">("Female");
  const [newSection, setNewSection] = useState("Grade 3-A");
  const [customSectionInput, setCustomSectionInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Success Slip State
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    section: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Load dynamically enrolled students and sections from Supabase on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      const teacherId = user?.id;

      try {
        const liveSections = await fetchTeacherSectionsFromSupabase(teacherId);
        if (Array.isArray(liveSections) && liveSections.length > 0) {
          setSections(liveSections);
          setNewSection(liveSections[0]);
        }
      } catch {
        setSections(["Grade 3-A"]);
      }

      try {
        const liveStudents = await fetchStudentsFromSupabase(selectedSection, teacherId);
        setStudents(liveStudents || []);
      } catch {
        setStudents([]);
      }
      setLoading(false);
    }
    loadData();
  }, [selectedSection]);

  const safeSections = Array.isArray(sections) && sections.length > 0 ? sections : ["Grade 3-A"];

  const handleGeneratePassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setNewPassword(`ReadSmart${randomNum}!`);
  };

  const handleAutoSuggestEmail = (name: string, section: string) => {
    const cleanName = name.toLowerCase().replace(/[^a-z]/g, ".");
    const cleanSec = section.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanName) {
      setNewEmail(`${cleanName}.${cleanSec}@readsmart.edu`);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    setIsSubmitting(true);
    const targetSection = customSectionInput.trim() ? customSectionInput.trim() : newSection;

    const teacher = getCurrentUser();

    // Persist section directly to Supabase if new
    if (customSectionInput.trim()) {
      const updatedSections = await addTeacherSection(customSectionInput.trim(), teacher?.id);
      setSections(updatedSections);
    }

    const payload: StudentEnrollmentInput = {
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      password: newPassword,
      gender: newGender,
      section: targetSection,
      teacherId: teacher?.id,
    };

    const res = await enrollStudentAccount(payload);

    if (res.success && res.student) {
      setStudents((prev) => [res.student!, ...prev.filter((s) => s.email !== res.student!.email)]);
      setCreatedCredentials({
        name: res.student.name,
        email: res.student.email || newEmail,
        password: newPassword,
        section: targetSection,
      });

      // Reset form fields
      setNewFullName("");
      setNewEmail("");
      setCustomSectionInput("");
      handleGeneratePassword();
    } else {
      alert(res.message || "Failed to enroll student.");
    }
    setIsSubmitting(false);
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `ReadSmart Pupil Credentials\nName: ${createdCredentials.name}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nSection: ${createdCredentials.section}\nURL: http://localhost:3000/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Filter students based on section tab, status, and search term
  const filteredStudents = students.filter((s) => {
    const matchesSection = selectedSection === "all" || s.section === selectedSection;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterStatus === "all" || s.status.toLowerCase().includes(filterStatus);

    return matchesSection && matchesSearch && matchesFilter;
  });

  const exportCSV = () => {
    if (filteredStudents.length === 0) return;
    const headers = "Student ID,Name,Gender,Email,Section,Current Badge,Comprehension %,Reading Speed,Quizzes Cleared,Status\n";
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.id}","${s.name}","${s.gender}","${s.email || ""}","${s.section}","${s.currentBadge}","${s.comprehension}","${s.readingSpeed}","${s.quizzesPassed}","${s.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Students_Roster_${selectedSection}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Enrollment Action */}
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
            Pupil Enrollment &amp; Section Roster
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Create pupil accounts, assign them to specific class sections, and track reading mastery milestones in Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => {
              setCreatedCredentials(null);
              setIsEnrollModalOpen(true);
            }}
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll New Student</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="h-9 px-3.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Roster (CSV)</span>
          </Button>
        </div>
      </div>

      {/* 2. Section Selector Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Sections:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedSection("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedSection === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            All Sections ({students.length})
          </button>

          {safeSections.map((sec) => {
            const count = students.filter((s) => s.section === sec).length;
            const isSelected = selectedSection === sec;

            return (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <span>{sec}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? "bg-blue-700 text-white" : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={async () => {
            const newSecName = prompt("Enter new section name (e.g. Grade 3-C):");
            if (newSecName && newSecName.trim()) {
              const teacher = getCurrentUser();
              const updated = await addTeacherSection(newSecName.trim(), teacher?.id);
              setSections(updated);
              setSelectedSection(newSecName.trim());
            }
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Section</span>
        </button>
      </div>

      {/* 3. Search & Status Filter Controls */}
      <div className="dashboard-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Mastery Status:
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="all">All Mastery Statuses</option>
            <option value="mastering">Mastering (≥85%)</option>
            <option value="on track">On Track (70-84%)</option>
            <option value="needs review">Needs Review (&lt;70%)</option>
          </select>
        </div>
      </div>

      {/* 4. Enrolled Students Roster Table */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {selectedSection === "all" ? "All Enrolled Students" : `Students in ${selectedSection}`}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredStudents.length} of {students.length} Pupils
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading student roster...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3">Pupil Name &amp; ID</th>
                  <th className="pb-3">Enrolled Section</th>
                  <th className="pb-3">Active Badge Milestone</th>
                  <th className="pb-3">Comprehension %</th>
                  <th className="pb-3">Reading Speed</th>
                  <th className="pb-3">Quizzes Cleared</th>
                  <th className="pb-3">Intervention Status</th>
                  <th className="pb-3 text-right">Last Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No students found in this section. Click <strong>&quot;Enroll New Student&quot;</strong> to add one.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{s.avatar || (s.gender === "Female" ? "👧" : "👦")}</span>
                          <div>
                            <div className="text-slate-900">{s.name}</div>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {s.id} · {s.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {s.section}
                        </span>
                      </td>

                      <td className="py-3.5 font-semibold text-slate-800">
                        {s.currentBadge}
                      </td>

                      <td className="py-3.5 font-bold text-slate-900">
                        {s.comprehension}
                      </td>

                      <td className="py-3.5 text-slate-600">
                        {s.readingSpeed}
                      </td>

                      <td className="py-3.5 text-slate-600">
                        {s.quizzesPassed}
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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

                      <td className="py-3.5 text-right text-slate-400">
                        {s.lastActive}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Enroll Student Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Enroll New Pupil Account</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create a new pupil account directly in Supabase and assign them to your designated classroom section.
            </DialogDescription>
          </DialogHeader>

          {createdCredentials ? (
            /* Success Credentials Slip */
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pupil Successfully Enrolled!</span>
                </div>
                <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                  The account has been created in <strong>{createdCredentials.section}</strong> and initialized with <strong>Star Badge 1 (Reading Star)</strong>.
                </p>
              </div>

              {/* Printable Slip Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-700 uppercase text-[10px]">Pupil Login Card</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {createdCredentials.section}
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name:</span>
                    <span className="font-bold">{createdCredentials.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-mono text-[11px] font-bold text-blue-700">{createdCredentials.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Password:</span>
                    <span className="font-mono text-[11px] font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {createdCredentials.password}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyCredentials}
                  className="flex-1 h-9 rounded-xl text-xs font-bold border-slate-200 flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied to Clipboard!" : "Copy Login Info"}</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setCreatedCredentials(null);
                    setIsEnrollModalOpen(false);
                  }}
                  className="flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Enrollment Form */
            <form onSubmit={handleEnrollStudent} className="space-y-4 py-2">
              {/* Pupil Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pupil Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juanito Santos"
                  value={newFullName}
                  onChange={(e) => {
                    setNewFullName(e.target.value);
                    handleAutoSuggestEmail(e.target.value, customSectionInput || newSection);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Target Section Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Assign to Specific Section *</label>
                <div className="grid grid-cols-2 gap-2">
                  {safeSections.map((sec) => (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => {
                        setNewSection(sec);
                        setCustomSectionInput("");
                        handleAutoSuggestEmail(newFullName, sec);
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold text-center transition-all ${
                        newSection === sec && !customSectionInput
                          ? "bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Or type a new section (e.g. Grade 3-C)..."
                    value={customSectionInput}
                    onChange={(e) => {
                      setCustomSectionInput(e.target.value);
                      handleAutoSuggestEmail(newFullName, e.target.value || newSection);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Student Email / Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Student Email / Login ID *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. juanito.santos.3a@readsmart.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-[11px]"
                />
              </div>

              {/* Password & Gender Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Password *</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as "Female" | "Male")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none"
                  >
                    <option value="Female">Female 👧</option>
                    <option value="Male">Male 👦</option>
                  </select>
                </div>
              </div>

              {/* Automatic Badge Initialization Notice */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  This pupil will be enrolled in <strong>{customSectionInput || newSection}</strong> and automatically initialized on <strong>Star Badge 1 (Reading Star)</strong>.
                </span>
              </div>

              <DialogFooter className="pt-2 gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="h-9 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200"
                >
                  {isSubmitting ? "Enrolling in Supabase..." : "Enroll Pupil"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
