"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  SpellCheck,
  Trophy,
  GraduationCap,
  ChevronRight,
  LogOut,
  Award,
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
  { name: "Badge Pathway", href: "/dashboard/badges", icon: Map, badge: "Mastery Map" },
  { name: "Vocabulary Vault", href: "/dashboard/vocabulary", icon: SpellCheck },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, badge: "Top XP" },
  { name: "My Achievements", href: "/dashboard/achievements", icon: Award },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-w-64 max-w-64 bg-white border-r border-slate-200/80 hidden md:flex flex-col flex-shrink-0 h-full overflow-hidden z-40 select-none justify-between">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-blue-200 flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-900 text-base tracking-tight block truncate">
              ReadSmart
            </span>
            <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase block truncate">
              Student Portal
            </span>
          </div>
        </Link>
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
                  title={item.name}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
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
      </div>

      {/* Footer / Account Exit — Anchored strictly at bottom */}
      <div className="mt-auto p-3 border-t border-slate-100 flex-shrink-0 bg-white">
        <button
          type="button"
          onClick={async () => {
            await signOutUser();
            window.location.replace("/api/auth/signout");
          }}
          title="Sign Out"
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>
    </aside>
  );
}
