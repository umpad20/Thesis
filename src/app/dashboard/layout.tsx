"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { StudentMobileNav } from "@/components/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isImmersiveMode =
    pathname?.startsWith("/dashboard/lessons") ||
    pathname?.startsWith("/dashboard/quiz");

  // In Lesson Reading and Quiz modes, strip away the sidebar and header
  // for a strict, distraction-free, full-screen reading and evaluation environment.
  if (isImmersiveMode) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col antialiased overflow-y-auto">
        <main className="flex-1 p-2 sm:p-4 md:p-6 max-w-5xl w-full mx-auto flex flex-col justify-start">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-white flex flex-col md:flex-row antialiased">
      {/* Persistent Left Sidebar (Desktop/Tablet) — 100% full screen height */}
      <DashboardSidebar />

      {/* Main Content Area with inner scrollable pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-white">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto bg-white pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation (Phone Viewports) */}
      <StudentMobileNav />
    </div>
  );
}
