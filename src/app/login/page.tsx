"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authenticateSignIn } from "@/utils/auth-helpers";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered");
  const prefilledEmail = searchParams.get("email");

  const [identifier, setIdentifier] = useState(prefilledEmail || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const successBanner = isRegistered
    ? "Account created successfully! Please sign in with your credentials."
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage("Please enter your registered email address or username.");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await authenticateSignIn(identifier, password);
      if (!result.success || !result.user) {
        setErrorMessage(result.message || "Invalid account credentials. Please sign up first.");
        setIsLoading(false);
        return;
      }

      if (result.user.role === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setErrorMessage("Unable to sign in. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] rounded-2xl border border-slate-200 sm:px-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        {successBanner && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successBanner}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Email or Username
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
              placeholder="name@pvces.edu.ph or username"
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
              placeholder="••••••••"
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
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm shadow-blue-200 text-sm h-11 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading ? (
            <span>Verifying Account...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {/* Direct Sign-Up Link */}
      <div className="mt-6 text-center text-xs">
        <span className="text-slate-500">Don&apos;t have an account? </span>
        <Link
          href="/signup"
          className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
          Pedro Victorina Calo Elementary School · Reading Comprehension
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading login form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
