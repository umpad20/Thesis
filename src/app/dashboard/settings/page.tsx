import { Suspense } from "react";
import { SettingsHub } from "@/components/settings-hub";

export const metadata = {
  title: "Settings · ReadSmart Student",
  description: "Configure AI voice narrator, profile, and preferences.",
};

export default function StudentSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-bold animate-pulse">Loading settings...</div>}>
      <SettingsHub portal="student" />
    </Suspense>
  );
}

