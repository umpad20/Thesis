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

  const navItems = [
    { name: "Learn", href: "/dashboard", icon: LayoutDashboard },
    { name: "Storybook", href: "/dashboard/badges", icon: Map },
    { name: "Vocab", href: "/dashboard/vocabulary", icon: SpellCheck },
    { name: "Ranks", href: "/dashboard/leaderboard", icon: Trophy },
    { name: "Badges", href: "/dashboard/achievements", icon: Award },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
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
