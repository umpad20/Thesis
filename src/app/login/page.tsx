"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [identifier, setIdentifier] = useState("student.maria@pvces.edu.ph");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (role === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/dashboard");
      }
    }, 400);
  };

  const handleRoleSelect = (selectedRole: "student" | "teacher") => {
    setRole(selectedRole);
    if (selectedRole === "student") {
      setIdentifier("student.maria@pvces.edu.ph");
    } else {
      setIdentifier("teacher.reyes@pvces.edu.ph");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 border-t-2 border-blue-600">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-sm shadow-blue-200">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          ReadSmart Learning Platform
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-medium">
          Pedro Victorina Calo Elementary School · Multimedia Reading Tool
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] rounded-2xl border border-slate-200 sm:px-10">
          {/* Role Toggle Tab */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 rounded-xl mb-6 text-xs font-bold border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleRoleSelect("student")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                role === "student"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect("teacher")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                role === "teacher"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Teacher / Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                {role === "student" ? "Student ID / DepEd Email" : "Faculty Email"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  placeholder={
                    role === "student" ? "e.g. 10928374 or maria@pvces.edu.ph" : "name@pvces.edu.ph"
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span>Remember this device</span>
              </label>
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                Need assistance?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm shadow-blue-200 text-sm h-11 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <span>Accessing Learning Hub...</span>
              ) : (
                <>
                  <span>
                    {role === "teacher"
                      ? "Sign In to Teacher Portal"
                      : "Sign In to Student Portal"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Access Note */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-200 text-[11px] font-semibold text-blue-700 shadow-sm">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>
                {role === "teacher"
                  ? "Signing in as Teacher Reyes (Grade 3 Faculty)"
                  : "Signing in as Maria Santos (Student)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
