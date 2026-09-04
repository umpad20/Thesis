"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Map,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { signOutUser } from "@/utils/auth-helpers";

export function TeacherSidebar() {
  const pathname = usePathname();

  const teacherNavItems = [
    { name: "Teacher Hub", href: "/teacher", icon: LayoutDashboard },
    { name: "Student Records", href: "/teacher/students", icon: Users },
    { name: "Curriculum & Badges", href: "/teacher/badges", icon: Map },
    { name: "Reports", href: "/teacher/reports", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 min-w-64 max-w-64 bg-white border-r border-slate-200/80 hidden md:flex flex-col flex-shrink-0 h-full overflow-hidden z-40 select-none justify-between">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 flex-shrink-0">
        <Link href="/teacher" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-blue-200">
            <ShieldCheck className="w-5 h-5 text-white" />
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
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Faculty Menu
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-blue-400" : "text-slate-400"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Account Exit — Anchored strictly at bottom */}
      <div className="mt-auto p-3 border-t border-slate-100 flex-shrink-0 bg-white">
        <button
          type="button"
          onClick={async () => {
            await signOutUser();
            window.location.replace("/api/auth/signout");
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
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
