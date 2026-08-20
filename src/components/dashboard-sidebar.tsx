"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  SpellCheck,
  FileCheck2,
  Trophy,
  Sparkles,
  GraduationCap,
  ChevronRight,
  LogOut,
  Layers,
} from "lucide-react";
import { signOutUser } from "@/utils/auth-helpers";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const studentNavItems: NavItem[] = [
  { name: "My Learning", href: "/dashboard", icon: LayoutDashboard },
  { name: "Badge Pathway", href: "/dashboard/badges", icon: Map, badge: "Mastery" },
  { name: "Reading Modules", href: "/dashboard/lessons", icon: BookOpen },
  { name: "Vocabulary Vault", href: "/dashboard/vocabulary", icon: SpellCheck, badge: "12 Words" },
  { name: "Assessments", href: "/dashboard/quiz", icon: FileCheck2 },
  { name: "My Achievements", href: "/dashboard/achievements", icon: Trophy },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-blue-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base tracking-tight block">
              ReadSmart
            </span>
            <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase block">
              Student Portal
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
            Student Menu
          </div>
          <nav className="space-y-1">
            {studentNavItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-blue-700/60 text-white"
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

        {/* School Info Widget */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
          <div className="flex items-center gap-2 mb-1 font-bold text-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Pedro Victorina Calo ES</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Grade 3 reading comprehension mastery program.
          </p>
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
