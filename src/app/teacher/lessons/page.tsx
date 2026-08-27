"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Map, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeacherLessonsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher/badges");
  }, [router]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
          <Map className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Moving to Curriculum &amp; Stage Badges</h2>
        <p className="text-xs text-slate-500">
          All reading passages, story lessons, and quizzes are now consolidated into your Stage Badges Hub.
        </p>
        <Link href="/teacher/badges">
          <Button className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-2">
            <span>Open Stage Badges &amp; Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
