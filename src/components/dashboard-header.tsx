"use client";

import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Flame,
  Award,
  ChevronDown,
  User,
  ShieldCheck,
  CheckCircle2,
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

export function DashboardHeader() {
  const router = useRouter();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stories, vocabulary, quizzes..."
            className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl pl-9 pr-12 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 bg-white border border-slate-200">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right: Stats, Quick Badges & Profile */}
      <div className="flex items-center gap-3">
        {/* Streak & XP Badge Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold">
          <div className="flex items-center gap-1 text-blue-600">
            <Flame className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
            <span>5 Day Streak</span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1 text-amber-600">
            <Award className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>250 XP</span>
          </div>
        </div>

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
            <Avatar className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs rounded-lg">
                MS
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                Maria Santos
              </span>
              <span className="text-[10px] font-semibold text-blue-600 block">
                Grade 3-A · Student
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-slate-400 font-medium">
              Active Session
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard")}
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer bg-blue-50/50 text-blue-900"
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Student Mode</span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/teacher")}
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer text-slate-700 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Switch to Teacher Portal</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={() => router.push("/login")}
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
