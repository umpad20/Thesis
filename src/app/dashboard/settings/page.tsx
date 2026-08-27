import { SettingsHub } from "@/components/settings-hub";

export const metadata = {
  title: "Settings · ReadSmart Student",
  description: "Configure AI voice narrator, profile, and preferences.",
};

export default function StudentSettingsPage() {
  return <SettingsHub portal="student" />;
}
