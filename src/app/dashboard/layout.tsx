"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

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
      <div className="min-h-screen bg-[#faf8f5] flex flex-col antialiased">
        <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex antialiased">
      {/* Persistent Left Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <DashboardHeader />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
