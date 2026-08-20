"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  User,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authenticateSignUp } from "@/utils/auth-helpers";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMessage("Please enter both your full name and email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please retype your password correctly.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await authenticateSignUp({
        fullName,
        email,
        password,
        role,
      });

      if (!result.success || !result.user) {
        setErrorMessage(result.message || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      // Success: Redirect to Login page with confirmation banner
      setIsSuccess(true);
      setTimeout(() => {
        window.location.replace(`/login?registered=true&email=${encodeURIComponent(email)}`);
      }, 1000);
    } catch {
      setErrorMessage("An unexpected error occurred while creating your account.");
      setIsLoading(false);
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
          Create Your ReadSmart Account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-medium">
          Pedro Victorina Calo Elementary School · Reading Comprehension
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] rounded-2xl border border-slate-200 sm:px-10">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Account Created Successfully!
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                Redirecting you to the sign-in page to log into your new ReadSmart account...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Account Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Account Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Student Option */}
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                      role === "student"
                        ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          role === "student"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          Student
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Grade 3 Learner
                        </span>
                      </div>
                    </div>
                    {role === "student" && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                    )}
                  </button>

                  {/* Teacher Option */}
                  <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                      role === "teacher"
                        ? "border-slate-900 bg-slate-50 shadow-xs ring-1 ring-slate-900"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          role === "teacher"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          Teacher / Admin
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Faculty & Evaluator
                        </span>
                      </div>
                    </div>
                    {role === "teacher" && (
                      <CheckCircle2 className="w-4 h-4 text-slate-900 mt-0.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 2. Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={
                      role === "student" ? "e.g. Maria Santos" : "e.g. Teacher Jane Reyes"
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* 3. Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === "student"
                        ? "e.g. maria@pvces.edu.ph"
                        : "e.g. jreyes@pvces.edu.ph"
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* 4. Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Show
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min. 6 characters)"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* 5. Confirm Password Field (Type password two times) */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retype your password to confirm"
                    className={`w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                      passwordsMismatch
                        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                        : passwordsMatch
                        ? "border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
                    }`}
                  />
                </div>

                {/* Password Match Status Indicator */}
                {passwordsMatch && (
                  <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match perfectly
                  </p>
                )}
                {passwordsMismatch && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm shadow-blue-200 text-sm h-11 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Registering Account in Supabase...</span>
                ) : (
                  <>
                    <span>
                      {role === "teacher"
                        ? "Create Faculty Account"
                        : "Create Student Account"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Link back to login */}
          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500">Already have an account? </span>
            <Link
              href="/login"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
