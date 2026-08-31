import { Suspense } from "react";
import { BadgeCreationStudio } from "@/components/badge-creation-studio";

export const metadata = {
  title: "Stage Badge & Curriculum Studio · ReadSmart Faculty",
  description: "Author Grade 3 story lessons, interactive vocabulary terms, and comprehension quizzes.",
};

export default function CreateBadgePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Opening Curriculum Studio...</p>
          </div>
        </div>
      }
    >
      <BadgeCreationStudio />
    </Suspense>
  );
}
