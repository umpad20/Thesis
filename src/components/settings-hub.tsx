"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

type SettingSection = "menu" | "voice" | "account" | "privacy" | "help" | "about";

export function SettingsHub({ portal }: SettingsHubProps) {
  const [activeSection, setActiveSection] = useState<SettingSection>("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);

  // Voice Preferences State
  const [voicePrefs, setVoicePrefs] = useState<VoicePreferences>(() => getVoicePreferences());
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [testSpeechText, setTestSpeechText] = useState("Hello! I am your ReadSmart reading companion. Let's read wonderful stories together!");

  // Mascot Selector
  const [selectedAvatar, setSelectedAvatar] = useState<string>("🦊");
  const [avatarSaved, setAvatarSaved] = useState(false);

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

  // Filter items based on search query
  const menuItems = [
    {
      id: "account" as SettingSection,
      title: "Account",
      subtitle: user?.fullName ? `${user.fullName} · ${user.section || "Grade 3-A"}` : "Profile, Grade Section & Mascot",
      icon: User,
      badge: user?.role === "teacher" ? "Faculty" : "Pupil",
    },
    {
      id: "voice" as SettingSection,
      title: "AI Voice & Speech Narrator",
      subtitle: `Active Voice: ${voicePrefs.gender === "female" ? "👩 Girl Voice" : "👨 Boy Voice"} (${voicePrefs.rate}x)`,
      icon: Volume2,
      badge: "Voice Engine",
      highlight: true,
    },
    {
      id: "privacy" as SettingSection,
      title: "Privacy & Security",
      subtitle: "Pedro Victorina Calo ES · Database integrity",
      icon: Lock,
    },
    {
      id: "help" as SettingSection,
      title: "Help and Support",
      subtitle: "Grade 3 Reading Guidelines & Phonics FAQ",
      icon: Headphones,
    },
    {
      id: "about" as SettingSection,
      title: "About",
      subtitle: "ReadSmart v1.0 · DepEd Curriculum Alignment",
      icon: HelpCircle,
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Main Phone-style Settings Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Card Top Navigation Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {activeSection !== "menu" ? (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsPlayingPreview(false);
                  setActiveSection("menu");
                }}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href={portal === "teacher" ? "/teacher" : "/dashboard"}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}

            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {activeSection === "menu"
                  ? "Settings"
                  : activeSection === "voice"
                  ? "AI Voice & Speech"
                  : activeSection === "account"
                  ? "Account Profile"
                  : activeSection === "privacy"
                  ? "Privacy & Security"
                  : activeSection === "help"
                  ? "Help and Support"
                  : "About ReadSmart"}
              </h1>
              <span className="text-[11px] text-slate-400 font-semibold block">
                {portal === "teacher" ? "Teacher & Faculty Preferences" : "Pupil Reading Preferences"}
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg">
            {selectedAvatar}
          </div>
        </div>

        {/* ── SECTION: Root Menu List (Matching Screenshot) ── */}
        {activeSection === "menu" && (
          <div className="p-4 sm:p-6 space-y-5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a setting..."
                className="w-full pl-10 pr-4 py-3 bg-slate-100/80 border-none rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Category Rows */}
            <div className="divide-y divide-slate-100">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className="w-full py-4 px-3 flex items-center justify-between hover:bg-slate-50/80 rounded-2xl transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                          item.highlight
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{item.title}</span>
                          {item.badge && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{item.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECTION: AI Voice & Speech Narrator ── */}
        {activeSection === "voice" && (
          <div className="p-6 space-y-6 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-start gap-3.5">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-blue-950">AI Dual-Coding Voice Narrator</h3>
                <p className="text-[11px] text-blue-800 leading-relaxed mt-0.5">
                  Select your preferred AI voice character. This voice will read all Grade 3 story sentences aloud and speak phonics vocabulary tooltips.
                </p>
              </div>
            </div>

            {/* Voice Gender Selection (Girl / Boy) */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                Choose Narrator Voice Character
              </label>

              <div className="grid grid-cols-2 gap-4">
                {/* Female / Girl Voice */}
                <button
                  type="button"
                  onClick={() => handleUpdateGender("female")}
                  className={`p-5 rounded-2xl border-2 text-center transition-all cursor-pointer relative ${
                    voicePrefs.gender === "female"
                      ? "border-blue-600 bg-blue-50/40 shadow-md shadow-blue-500/15"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {voicePrefs.gender === "female" && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center text-2xl mx-auto mb-2 shadow-inner">
                    👧
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Girl Voice</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Warm, friendly, clear phonics</p>
                </button>

                {/* Male / Boy Voice */}
                <button
                  type="button"
                  onClick={() => handleUpdateGender("male")}
                  className={`p-5 rounded-2xl border-2 text-center transition-all cursor-pointer relative ${
                    voicePrefs.gender === "male"
                      ? "border-blue-600 bg-blue-50/40 shadow-md shadow-blue-500/15"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {voicePrefs.gender === "male" && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl mx-auto mb-2 shadow-inner">
                    👦
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Boy / Man Voice</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Deep, articulate, steady pace</p>
                </button>
              </div>
            </div>

            {/* Reading Pace Slider */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Reading Speed: <span className="text-blue-600">{voicePrefs.rate}x</span>
                </label>
                <span className="text-[10px] font-bold text-slate-400">
                  {voicePrefs.rate <= 0.8 ? "Slow (Phonics Learning)" : voicePrefs.rate >= 1.1 ? "Fast Reading" : "Standard Grade 3 Pace"}
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.2"
                step="0.05"
                value={voicePrefs.rate}
                onChange={(e) => handleUpdateRate(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>0.7x (Slow)</span>
                <span>0.85x (Recommended)</span>
                <span>1.2x (Fast)</span>
              </div>
            </div>

            {/* Pitch Adjustment Slider */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Voice Pitch: <span className="text-blue-600">{voicePrefs.pitch}</span>
                </label>
                <span className="text-[10px] font-bold text-slate-400">
                  {voicePrefs.pitch >= 1.1 ? "High Tone" : voicePrefs.pitch <= 0.9 ? "Deep Tone" : "Natural Tone"}
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={voicePrefs.pitch}
                onChange={(e) => handleUpdatePitch(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Test Voice Audio Preview Box */}
            <div className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Interactive Audio Preview</span>
                </span>
                <span className="text-[10px] font-bold text-amber-700">
                  {voicePrefs.gender === "female" ? "Testing Girl Voice" : "Testing Boy Voice"}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-serif italic bg-white p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                &ldquo;{testSpeechText}&rdquo;
              </p>

              <Button
                onClick={handleTestVoice}
                className={`w-full h-11 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isPlayingPreview
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25"
                }`}
              >
                {isPlayingPreview ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop Speech Preview</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>🔊 Test {voicePrefs.gender === "female" ? "Girl" : "Boy"} Voice Now</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── SECTION: Account & Mascot Profile ── */}
        {activeSection === "account" && (
          <div className="p-6 space-y-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Full Name
                  </span>
                  <span className="text-base font-black text-slate-900">{user?.fullName || "Pupil Account"}</span>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 capitalize">
                  {user?.role || "Student"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Assigned Section</span>
                  <span className="font-bold text-slate-800">{user?.section || "Grade 3-A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">School</span>
                  <span className="font-bold text-slate-800">Pedro Victorina Calo ES</span>
                </div>
              </div>
            </div>

            {/* Mascot Avatar Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Select Your Mascot Avatar
                </label>
                {avatarSaved && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-bounce">
                    Saved!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-6 gap-2.5">
                {PUPIL_MASCOTS.map((mascot) => (
                  <button
                    key={mascot}
                    type="button"
                    onClick={() => handleSelectAvatar(mascot)}
                    className={`h-12 rounded-2xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                      selectedAvatar === mascot
                        ? "bg-blue-600 text-white scale-110 shadow-md shadow-blue-500/30 ring-2 ring-blue-400"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    {mascot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION: Privacy & Security ── */}
        {activeSection === "privacy" && (
          <div className="p-6 space-y-5 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900">Protected School Environment</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                ReadSmart is secured for Pedro Victorina Calo Elementary School Grade 3 students. Student progress, quiz scores, and badge milestones are safeguarded using Row-Level Security on Supabase.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between">
                <span className="text-slate-500 font-medium">Session Status:</span>
                <span className="font-bold text-emerald-600">Active &amp; Authenticated</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex justify-between">
                <span className="text-slate-500 font-medium">Data Storage:</span>
                <span className="font-bold text-slate-800">Supabase Cloud Database</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={async () => {
                  await signOutUser();
                  window.location.replace("/api/auth/signout");
                }}
                className="w-full h-11 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </Button>
            </div>
          </div>
        )}

        {/* ── SECTION: Help & Support ── */}
        {activeSection === "help" && (
          <div className="p-6 space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>How to Read Stories</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Read each sentence page by page. Tap any underlined vocabulary word to see phonics hints, and click the blue speaker button to hear the sentence spoken aloud.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>How to Unlock Badges</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete all 3 chapter story lessons in your active stage, then take the Stage Final Quiz with at least a 75% score to earn your next badge milestone.
              </p>
            </div>
          </div>
        )}

        {/* ── SECTION: About ReadSmart ── */}
        {activeSection === "about" && (
          <div className="p-6 space-y-4 animate-in fade-in duration-200 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
              🦉
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">ReadSmart</h3>
              <span className="text-xs text-blue-600 font-bold">Version 1.0.0 (Thesis Edition)</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              An interactive Dual-Coding reading companion for Grade 3 pupils at Pedro Victorina Calo Elementary School.
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
              Aligned with DepEd Grade 3 English &amp; Reading Literacy Standards.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
