"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileCheck2,
  Map,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Layers,
  PlusCircle,
} from "lucide-react";
import { signOutUser } from "@/utils/auth-helpers";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const teacherNavItems: NavItem[] = [
  { name: "Teacher Hub", href: "/teacher", icon: LayoutDashboard },
  { name: "Student Records", href: "/teacher/students", icon: Users, badge: "32 Pupils" },
  { name: "Curriculum Manager", href: "/teacher/lessons", icon: BookOpen, badge: "8 Stories" },
  { name: "Quiz & Questions", href: "/teacher/quizzes", icon: FileCheck2 },
  { name: "Badge Mastery Rules", href: "/teacher/badges", icon: Map },
  { name: "Thesis Reports", href: "/teacher/reports", icon: BarChart3, badge: "Export" },
];

export function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
        <Link href="/teacher" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base tracking-tight block">
              ReadSmart
            </span>
            <span className="text-[10px] text-blue-600 font-bold tracking-wider uppercase block">
              Faculty & Admin
            </span>
          </div>
        </Link>
        <button
          type="button"
          aria-label="Toggle Navigation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Faculty Control
          </div>
          <nav className="space-y-1">
            {teacherNavItems.map((item) => {
              const isActive =
                item.href === "/teacher"
                  ? pathname === "/teacher"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-blue-400" : "text-slate-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-slate-800 text-blue-300"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content Authoring Info */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900">
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>Content Authoring</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed mb-3">
            Add new reading passages or customize quiz question banks for Grade 3.
          </p>
          <Link
            href="/teacher/lessons"
            className="block text-center py-2 px-3 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            + Create New Story Passage
          </Link>
        </div>
      </div>

      {/* Footer / Account Exit */}
      <div className="p-3 border-t border-slate-100">
        <button
          type="button"
          onClick={async () => {
            await signOutUser();
            window.location.replace("/api/auth/signout");
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>
    </aside>
  );
}
