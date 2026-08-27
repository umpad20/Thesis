import { SettingsHub } from "@/components/settings-hub";

export const metadata = {
  title: "Settings · ReadSmart Faculty",
  description: "Configure educator AI voice narrator, profile, and system preferences.",
};

export default function TeacherSettingsPage() {
  return <SettingsHub portal="teacher" />;
}
