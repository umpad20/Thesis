"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  Volume2,
  Lock,
  Headphones,
  HelpCircle,
  ChevronRight,
  Search,
  Check,
  Sparkles,
  ArrowLeft,
  VolumeX,
  Play,
  Square,
  ShieldCheck,
  GraduationCap,
  Award,
  BookOpen,
  Info,
  LogOut,
  Sliders,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getVoicePreferences,
  saveVoicePreferences,
  speakSentenceWithVoice,
  VoicePreferences,
} from "@/utils/voice-settings";
import { getCurrentUser, signOutUser, updateUserAvatar, UserProfile } from "@/utils/auth-helpers";

const PUPIL_MASCOTS = ["🦊", "🐼", "🦁", "🐨", "🦉", "🐰", "🐯", "🐶", "🐱", "🦄", "🚀", "🌟"];

interface SettingsHubProps {
  portal: "student" | "teacher";
}

type SettingSection = "voice" | "account" | "privacy" | "help" | "about";

export function SettingsHub({ portal }: SettingsHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as SettingSection) || "voice";
  const [activeSection, setActiveSection] = useState<SettingSection>(
    ["voice", "account", "privacy", "help", "about"].includes(initialTab) ? initialTab : "voice"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);

  // Voice Preferences State
  const [voicePrefs, setVoicePrefs] = useState<VoicePreferences>(() => getVoicePreferences());
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [testSpeechText, setTestSpeechText] = useState(
    "Hello! I am your ReadSmart reading companion. Let's read wonderful stories together!"
  );

  // Mascot Selector
  const [selectedAvatar, setSelectedAvatar] = useState<string>("🦊");
  const [avatarSaved, setAvatarSaved] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab") as SettingSection | null;
    if (tab && ["voice", "account", "privacy", "help", "about"].includes(tab)) {
      setActiveSection(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser?.avatar) {
      setSelectedAvatar(currentUser.avatar);
    }
    setVoicePrefs(getVoicePreferences());
  }, []);

  const handleUpdateGender = (gender: "female" | "male") => {
    const updated = saveVoicePreferences({
      gender,
      pitch: gender === "female" ? 1.05 : 0.9,
    });
    setVoicePrefs(updated);
  };

  const handleUpdateRate = (rate: number) => {
    const updated = saveVoicePreferences({ rate });
    setVoicePrefs(updated);
  };

  const handleUpdatePitch = (pitch: number) => {
    const updated = saveVoicePreferences({ pitch });
    setVoicePrefs(updated);
  };

  const handleTestVoice = () => {
    if (typeof window === "undefined") return;
    if (isPlayingPreview) {
      window.speechSynthesis.cancel();
      setIsPlayingPreview(false);
      return;
    }

    setIsPlayingPreview(true);
    speakSentenceWithVoice(
      testSpeechText,
      () => setIsPlayingPreview(false),
      () => setIsPlayingPreview(false)
    );
  };

  const handleSelectAvatar = async (avatar: string) => {
    setSelectedAvatar(avatar);
    updateUserAvatar(avatar);
    setAvatarSaved(true);
    setTimeout(() => setAvatarSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOutUser();
    window.location.replace("/api/auth/signout");
  };

  // Setting navigation items
  const menuItems = [
    {
      id: "voice" as SettingSection,
      title: "AI Voice & Speech Narrator",
      subtitle: `Active: ${voicePrefs.gender === "female" ? "👧 Girl Voice" : "👦 Boy Voice"} (${voicePrefs.rate}x)`,
      icon: Volume2,
      badge: "Voice Engine",
      color: "bg-blue-600 text-white",
    },
    {
      id: "account" as SettingSection,
      title: "Account & Mascot",
      subtitle: user?.fullName ? `${user.fullName} · ${user.section || "Grade 3-A"}` : "Profile & Mascot Avatar",
      icon: User,
      badge: user?.role === "teacher" ? "Faculty" : "Pupil",
      color: "bg-indigo-600 text-white",
    },
    {
      id: "privacy" as SettingSection,
      title: "Privacy & Security",
      subtitle: "Pedro Victorina Calo ES · Database integrity",
      icon: Lock,
      color: "bg-emerald-600 text-white",
    },
    {
      id: "help" as SettingSection,
      title: "Help and Support",
      subtitle: "Grade 3 Reading Guidelines & Phonics FAQ",
      icon: Headphones,
      color: "bg-purple-600 text-white",
    },
    {
      id: "about" as SettingSection,
      title: "About ReadSmart",
      subtitle: "ReadSmart v1.0 · DepEd Curriculum Alignment",
      icon: HelpCircle,
      color: "bg-slate-700 text-white",
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const backUrl = portal === "teacher" ? "/teacher" : "/dashboard";

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* ── Top Standalone Application Header Bar ─────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={backUrl}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {portal === "teacher" ? "Teacher Hub" : "My Learning"}</span>
          </Link>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Settings &amp; Preferences</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {portal === "teacher" ? "Faculty" : "Pupil"}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage your AI narrator voice, reading preferences, and account profile.
            </p>
          </div>
        </div>

        {/* User Card on Right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-2xl">{selectedAvatar}</span>
            <div className="text-left hidden md:block">
              <span className="text-xs font-black text-slate-900 block leading-tight truncate max-w-[120px]">
                {user?.fullName || "Student"}
              </span>
              <span className="text-[10px] font-bold text-blue-600 block">
                {user?.section || "Grade 3-A"}
              </span>
            </div>
          </div>

          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* ── Main 2-Column Expansive Desktop Layout ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Sidebar Navigation Rail ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search Box */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border-none rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Category Navigation Buttons */}
            <div className="space-y-1.5">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                      }
                      setIsPlayingPreview(false);
                      setActiveSection(item.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.01]"
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold block truncate ${
                              isActive ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                isActive
                                  ? "bg-white/25 text-white"
                                  : "bg-blue-50 text-blue-700 border border-blue-100"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] block truncate font-medium ${
                            isActive ? "text-blue-100" : "text-slate-400"
                          }`}
                        >
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? "text-white" : "text-slate-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-slate-50 border border-blue-100/80 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-black text-xs">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>ReadSmart Dual-Coding Engine</span>
            </div>
            <p className="text-[11px] text-blue-800/80 leading-relaxed">
              Preferences are automatically synchronized with your classroom dashboard and Living Storybook reader.
            </p>
          </div>
        </div>

        {/* ── Right Detail Content Canvas ── */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            {/* ── 1. AI VOICE & SPEECH NARRATOR ── */}
            {activeSection === "voice" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-blue-600" />
                      <span>AI Voice &amp; Speech Narrator</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Configure your personalized AI reading assistant character for story narration.
                    </p>
                  </div>
                  <span className="text-xs font-black px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    Dual-Coding Audio
                  </span>
                </div>

                {/* Narrator Character Gender Cards */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Choose Narrator Voice Gender
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Girl / Female Voice Card */}
                    <button
                      type="button"
                      onClick={() => handleUpdateGender("female")}
                      className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex items-center gap-4 ${
                        voicePrefs.gender === "female"
                          ? "border-blue-600 bg-blue-50/40 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center text-3xl shadow-xs flex-shrink-0">
                        👧
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">Girl Voice (Female)</span>
                          {voicePrefs.gender === "female" && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Warm, encouraging, and clear storyteller voice for Grade 3 pupils.
                        </p>
                      </div>
                    </button>

                    {/* Boy / Male Voice Card */}
                    <button
                      type="button"
                      onClick={() => handleUpdateGender("male")}
                      className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex items-center gap-4 ${
                        voicePrefs.gender === "male"
                          ? "border-blue-600 bg-blue-50/40 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-3xl shadow-xs flex-shrink-0">
                        👦
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">Boy Voice (Male)</span>
                          {voicePrefs.gender === "male" && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Friendly, energetic, and articulate companion voice for story reading.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Speed & Pitch Controls */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Narration Pace &amp; Pitch Controls</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Rate Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">Reading Speed</span>
                        <span className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-md">
                          {voicePrefs.rate}x {voicePrefs.rate < 1 ? "(Gentle / Slow)" : voicePrefs.rate > 1 ? "(Brisk)" : "(Standard)"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.2"
                        step="0.05"
                        value={voicePrefs.rate}
                        onChange={(e) => handleUpdateRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>0.7x (Slow)</span>
                        <span>1.0x (Normal)</span>
                        <span>1.2x (Fast)</span>
                      </div>
                    </div>

                    {/* Pitch Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">Voice Pitch</span>
                        <span className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-md">
                          {voicePrefs.pitch.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.3"
                        step="0.05"
                        value={voicePrefs.pitch}
                        onChange={(e) => handleUpdatePitch(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>Deeper</span>
                        <span>Natural</span>
                        <span>Higher</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Speech Tester */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-slate-50 border border-blue-200/80 space-y-3">
                  <label className="text-xs font-black text-slate-900 block">
                    🔊 Live Voice Test Preview
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={testSpeechText}
                      onChange={(e) => setTestSpeechText(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Button
                      onClick={handleTestVoice}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isPlayingPreview ? (
                        <>
                          <Square className="w-4 h-4 fill-white" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Test Voice</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. ACCOUNT & MASCOT ── */}
            {activeSection === "account" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      <span>Account &amp; Mascot Profile</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Personalize your reading mascot and view your student record.
                    </p>
                  </div>
                  {avatarSaved && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      ✓ Mascot Saved!
                    </span>
                  )}
                </div>

                {/* Profile Overview Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-4xl shadow-xs">
                    {selectedAvatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{user?.fullName || "Learner"}</h3>
                    <p className="text-xs text-slate-500">{user?.email || "student@pvces.edu.ph"}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-blue-600">
                      <span>🏫 {user?.section || "Grade 3-A"}</span>
                      <span>·</span>
                      <span>Role: {user?.role === "teacher" ? "Faculty" : "Pupil"}</span>
                    </div>
                  </div>
                </div>

                {/* Mascot Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Choose Your Mascot Avatar
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {PUPIL_MASCOTS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleSelectAvatar(emoji)}
                        className={`h-14 rounded-2xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                          selectedAvatar === emoji
                            ? "bg-blue-600 text-white ring-4 ring-blue-200 scale-105 shadow-sm"
                            : "bg-slate-50 hover:bg-white border border-slate-200 hover:scale-105"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 3. PRIVACY & SECURITY ── */}
            {activeSection === "privacy" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    <span>Privacy &amp; Security</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Secure educational data protection for Pedro Victorina Calo Elementary School.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">Student Data Privacy Compliant</h4>
                      <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                        Reading scores, phonics audio, and assessment progress are strictly encrypted in the DepEd Pedro Victorina Calo Elementary School database.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">User Role &amp; Permissions</h4>
                    <p className="text-xs text-slate-500">
                      Logged in as <strong>{user?.fullName || "Student"}</strong> with <strong>{user?.role?.toUpperCase()}</strong> permissions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 4. HELP & SUPPORT ── */}
            {activeSection === "help" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-purple-600" />
                    <span>Help &amp; Support Guide</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Frequently asked questions and guides for Grade 3 reading.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">How do I hear word pronunciations?</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Click the 🔊 Read Aloud button in any story or tap highlighted vocabulary words in the text to hear the AI Narrator speak clearly.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">How do I unlock Stage Badges?</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Complete all 3 stories and pass their comprehension quizzes in a stage to unlock the Stage Mastery Badge on your Living Storybook pathway.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 5. ABOUT READSMART ── */}
            {activeSection === "about" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-slate-700" />
                    <span>About ReadSmart</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Platform information and DepEd curriculum alignment.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Platform Version</span>
                    <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      ReadSmart v1.0.0 (Production)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Curriculum Framework</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      DepEd Grade 3 English &amp; Phonics
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Pilot School</span>
                    <span className="text-xs font-bold text-slate-800">
                      Pedro Victorina Calo Elementary School
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
