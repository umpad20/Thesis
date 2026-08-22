"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getCurrentUser, signOutUser, UserProfile } from "@/utils/auth-helpers";

const DEFAULT_TEACHER: UserProfile = {
  id: "00000000-0000-0000-0000-000000000002",
  email: "teacher.reyes@pvces.edu.ph",
  fullName: "Teacher Reyes",
  role: "teacher",
  section: "Grade 3 Faculty",
  avatar: "👩‍🏫",
};

export function TeacherHeader() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_TEACHER);

  useEffect(() => {
    const handleStorageChange = () => {
      const user = getCurrentUser();
      if (user) setCurrentUser(user);
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    window.location.replace("/api/auth/signout");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students, stories, evaluations, questions..."
            className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl pl-9 pr-12 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 bg-white border border-slate-200">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right: Quick Action Buttons, Notifications & Faculty Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <Button
          size="sm"
          onClick={() => router.push("/teacher/lessons")}
          className="hidden sm:flex h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Story Passage</span>
        </Button>

        {/* Export Data Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/teacher/reports")}
          className="hidden md:flex h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Reports</span>
        </Button>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="View Notifications"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left outline-none">
            <Avatar className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800">
              <AvatarFallback className="bg-slate-900 text-white font-bold text-xs rounded-lg">
                {getInitials(currentUser.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block">
                {currentUser.section || "Grade 3 Faculty"} · Faculty
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-slate-400 font-medium">
              Active Mode
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push("/teacher")}
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer bg-slate-100 text-slate-900"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
                <span>Teacher & Evaluator Portal</span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="px-2.5 py-2 text-xs text-rose-600 font-semibold cursor-pointer"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
