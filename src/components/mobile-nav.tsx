"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  SpellCheck,
  Trophy,
  Award,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

export function StudentMobileNav() {
  const pathname = usePathname();

  const isMapActive =
    pathname === "/dashboard" ||
    pathname?.startsWith("/dashboard/badges") ||
    pathname?.startsWith("/dashboard/lessons") ||
    pathname?.startsWith("/dashboard/quiz");

  const leftNavItems = [
    { name: "Vocab", href: "/dashboard/vocabulary", icon: SpellCheck },
    { name: "Ranks", href: "/dashboard/leaderboard", icon: Trophy },
  ];

  const rightNavItems = [
    { name: "Badges", href: "/dashboard/achievements", icon: Award },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-safe"
    >
      <div className="flex h-16 items-center justify-around px-2 relative">
        {/* Left Nav Items */}
        {leftNavItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.name}</span>
            </Link>
          );
        })}

        {/* Center Elevated Hero Action: Adventure Map (Bank App QR-style) */}
        <div className="relative flex-1 flex flex-col items-center justify-center">
          <Link
            href="/dashboard/badges"
            className="group -top-5 absolute flex flex-col items-center cursor-pointer select-none"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white transition-all duration-300 ${
                isMapActive
                  ? "bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-[0_8px_20px_rgba(37,99,235,0.45)] scale-105 ring-2 ring-blue-500/30"
                  : "bg-slate-900 text-white hover:bg-blue-600 shadow-[0_6px_16px_rgba(15,23,42,0.3)] hover:scale-105"
              }`}
            >
              <Map className="w-6 h-6 stroke-[2.3] transition-transform group-hover:scale-110 group-active:scale-95" />
            </div>
            <span
              className={`text-[10px] font-bold tracking-tight mt-0.5 transition-colors ${
                isMapActive ? "text-blue-600" : "text-slate-500"
              }`}
            >
              Map
            </span>
          </Link>
        </div>

        {/* Right Nav Items */}
        {rightNavItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TeacherMobileNav() {
  const pathname = usePathname();

  const teacherNavItems = [
    { name: "Hub", href: "/teacher", icon: LayoutDashboard },
    { name: "Students", href: "/teacher/students", icon: Users },
    { name: "Badges", href: "/teacher/badges", icon: Map },
    { name: "Reports", href: "/teacher/reports", icon: BarChart3 },
    { name: "Settings", href: "/teacher/settings", icon: Settings },
  ];

  return (
    <nav
      aria-label="Teacher Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {teacherNavItems.map((item) => {
          const isActive =
            item.href === "/teacher"
              ? pathname === "/teacher"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
