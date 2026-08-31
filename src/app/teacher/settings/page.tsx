import { Suspense } from "react";
import { SettingsHub } from "@/components/settings-hub";

export const metadata = {
  title: "Settings · ReadSmart Faculty",
  description: "Configure educator AI voice narrator, profile, and system preferences.",
};

export default function TeacherSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-bold animate-pulse">Loading settings...</div>}>
      <SettingsHub portal="teacher" />
    </Suspense>
  );
}

