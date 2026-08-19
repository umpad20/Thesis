import { TeacherSidebar } from "@/components/teacher-sidebar";
import { TeacherHeader } from "@/components/teacher-header";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Dedicated Teacher Sidebar */}
      <TeacherSidebar />

      {/* Main Educator Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <TeacherHeader />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
