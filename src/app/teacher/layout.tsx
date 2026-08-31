"use client";

import { usePathname } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { TeacherHeader } from "@/components/teacher-header";
import { TeacherMobileNav } from "@/components/mobile-nav";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStandaloneStudio = pathname?.startsWith("/teacher/badges/create");

  // Standalone Full-Screen View: No Sidebar, No Header, 100% edge-to-edge screen usage
  if (isStandaloneStudio) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col antialiased w-full">
        <main className="flex-1 w-full p-3 sm:p-5 pb-20 md:pb-8">
          {children}
        </main>
        <TeacherMobileNav />
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-50/50 flex flex-col md:flex-row antialiased">
      {/* Dedicated Teacher Sidebar (Desktop/Tablet) — 100% full screen height */}
      <TeacherSidebar />

      {/* Main Educator Content Area with inner scrollable pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-slate-50/50">
        <TeacherHeader />
        <main className="flex-1 p-3 sm:p-6 md:p-8 w-full pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation (Phone Viewports) */}
      <TeacherMobileNav />
    </div>
  );
}

