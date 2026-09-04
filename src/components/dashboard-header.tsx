"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  Flame,
  Award,
  ChevronDown,
  BookOpen,
  Map,
  Bookmark,
  X,
  LogOut,
  Smile,
  Settings,
  Volume2,
  User,
  Lock,
  HelpCircle,
  Info,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getCurrentUser,
  signOutUser,
  updateUserAvatar,
  type UserProfile,
} from "@/utils/auth-helpers";
import {
  StudentAvatar,
  AVAILABLE_KID_AVATARS,
} from "@/components/student-avatar";
import {
  fetchStudentStats,
  fetchLessonsForStudent,
  fetchAllVocabularyWords,
  fetchBadgesFromSupabase,
  type LiveStudentStats,
} from "@/utils/supabase-queries";
import type { Lesson, VocabularyWord, Badge } from "@/lib/types";

const AVATAR_OPTIONS = AVAILABLE_KID_AVATARS;

const DEFAULT_STUDENT: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "student@pvces.edu.ph",
  fullName: "Student",
  role: "student",
  section: "Unassigned",
  avatar: "/images/avatars/avatar-1.png",
};

export function DashboardHeader() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_STUDENT);
  const [stats, setStats] = useState<LiveStudentStats | null>(null);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Avatar Customizer Modal State
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Notification State
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(true);
  const notifsContainerRef = useRef<HTMLDivElement>(null);

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  // Load User & Live Stats
  useEffect(() => {
    async function loadUserData() {
      const user = getCurrentUser() || DEFAULT_STUDENT;

      // Sync fresh profile directly from Supabase if logged in
      if (user.id && user.id !== DEFAULT_STUDENT.id) {
        try {
          const { createClient } = await import("@/utils/supabase/client");
          const supabase = createClient();
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          if (prof) {
            user.section = prof.section || "Unassigned";
            user.teacherId = prof.teacher_id;
            user.avatar = prof.avatar || user.avatar;
            user.fullName = prof.full_name || user.fullName;
            const { setCurrentUserSession } = await import("@/utils/auth-helpers");
            setCurrentUserSession(user);
          }
        } catch {
          // ignore
        }
      }

      setCurrentUser({ ...user });

      const section = user.section || "Unassigned";
      const teacherId = user.teacherId || null;
      const [liveStats, liveLessons, liveVocab, liveBadges] = await Promise.all([
        fetchStudentStats(user.id, user.fullName, section, user.avatar || "🦊"),
        fetchLessonsForStudent(section, teacherId),
        fetchAllVocabularyWords(),
        fetchBadgesFromSupabase(section, teacherId),
      ]);

      setStats(liveStats);
      setLessons(liveLessons);
      setVocabulary(liveVocab);
      setBadges(liveBadges);
    }

    loadUserData();

    const handleStorageChange = () => {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
        fetchStudentStats(user.id, user.fullName, user.section, user.avatar || "🦊").then(
          (s) => setStats(s)
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsNotifsOpen(false);
        setIsProfileOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        notifsContainerRef.current &&
        !notifsContainerRef.current.contains(e.target as Node)
      ) {
        setIsNotifsOpen(false);
      }
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    window.location.replace("/api/auth/signout");
  };

  const handleSelectAvatar = async (emoji: string) => {
    const updated = await updateUserAvatar(emoji);
    if (updated) {
      setCurrentUser(updated);
    }
    setShowAvatarPicker(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const liveStreak = stats?.streakDays ?? 0;
  const liveXp = stats?.totalXp ?? 0;

  // Filter Search Results
  const cleanQuery = searchQuery.trim().toLowerCase();
  const matchingLessons = cleanQuery
    ? lessons.filter(
        (l) =>
          l.lesson_title.toLowerCase().includes(cleanQuery) ||
          l.lesson_description.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingVocab = cleanQuery
    ? vocabulary.filter(
        (v) =>
          v.word.toLowerCase().includes(cleanQuery) ||
          v.definition.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingBadges = cleanQuery
    ? badges.filter(
        (b) =>
          b.badge_name.toLowerCase().includes(cleanQuery) ||
          b.description.toLowerCase().includes(cleanQuery)
      )
    : [];

  const hasSearchResults =
    matchingLessons.length > 0 || matchingVocab.length > 0 || matchingBadges.length > 0;

  const notifications = [
    {
      id: 1,
      title: "New Chapter Unlocked! 🌟",
      message: "Stage 1: Friendship in Bloom is ready for reading.",
      time: "Just now",
      type: "lesson",
    },
    {
      id: 2,
      title: "Streak Maintained! 🔥",
      message: `You're on a ${liveStreak}-day learning adventure.`,
      time: "Today",
      type: "streak",
    },
    {
      id: 3,
      title: "Badge Showcase Open 🏆",
      message: "Check your Living Storybook achievements map.",
      time: "Yesterday",
      type: "badge",
    },
  ];

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* ── 1. Global Instant Live Search Bar (⌘K) ────────────────── */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search stories, vocabulary words, badges..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-9 pr-12 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 bg-white border border-slate-200 pointer-events-none">
              ⌘K
            </div>
          </div>

          {/* Live Search Results Dropdown */}
          {isSearchOpen && cleanQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 overflow-hidden z-50 max-h-96 overflow-y-auto anim-pop-bounce">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Search Results ({cleanQuery})
                </span>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {!hasSearchResults ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                  <Search className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <p className="font-bold text-slate-600">No matching items found</p>
                  <p className="text-[11px]">Try typing story keywords, vocabulary terms, or stage names.</p>
                </div>
              ) : (
                <div className="p-2 space-y-3 divide-y divide-slate-100">
                  {/* Lessons Matches */}
                  {matchingLessons.length > 0 && (
                    <div className="pt-2 first:pt-0">
                      <span className="text-[10px] font-bold text-blue-600 px-2 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Stories &amp; Lessons ({matchingLessons.length})</span>
                      </span>
                      {matchingLessons.slice(0, 4).map((l) => (
                        <div
                          key={l.lesson_id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            router.push(`/dashboard/lessons?id=${l.lesson_id}`);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">{l.lesson_title}</p>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{l.lesson_description}</span>
                          </div>
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            Read →
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vocabulary Matches */}
                  {matchingVocab.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-purple-600 px-2 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Bookmark className="w-3 h-3" />
                        <span>Vocabulary Words ({matchingVocab.length})</span>
                      </span>
                      {matchingVocab.slice(0, 4).map((v) => (
                        <div
                          key={v.word_id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            router.push("/dashboard/vocabulary");
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{v.word}</p>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{v.definition}</span>
                          </div>
                          <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                            Vocab →
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Badges Matches */}
                  {matchingBadges.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-amber-600 px-2 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>Badges &amp; Accolades ({matchingBadges.length})</span>
                      </span>
                      {matchingBadges.slice(0, 3).map((b) => (
                        <div
                          key={b.badge_id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            router.push("/dashboard/badges");
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{b.badge_name}</p>
                            <span className="text-[10px] text-slate-400">{b.description}</span>
                          </div>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            +{b.xp_reward} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 2. Live Stats & Avatar Profile Actions ───────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Flame Reading Streak Pill */}
          <div
            title="Your daily active reading streak"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-700 shadow-2xs transition-all hover:scale-102"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="text-xs font-black tracking-tight">{liveStreak}d Streak</span>
          </div>

          {/* XP Reward Points Pill */}
          <div
            title="Total reading experience points earned"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-700 shadow-2xs transition-all hover:scale-102"
          >
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black tracking-tight">{liveXp} XP</span>
          </div>

          {/* Notification Bell Dropdown */}
          <div ref={notifsContainerRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotifsOpen(!isNotifsOpen);
                setUnreadNotifs(false);
              }}
              aria-label="View notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {isNotifsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 overflow-hidden z-50 anim-pop-bounce">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span>Storybook Activity Center</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsNotifsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setIsNotifsOpen(false);
                        router.push("/dashboard/badges");
                      }}
                      className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 transition-colors text-left space-y-0.5 cursor-pointer block"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 mx-0.5" />

          {/* ── 3. Functional Profile & Avatar Customizer Dropdown ─────── */}
          <div ref={profileContainerRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all text-left outline-none cursor-pointer select-none"
            >
              <StudentAvatar
                avatar={currentUser.avatar}
                name={currentUser.fullName}
                size="sm"
                className="shadow-xs ring-2 ring-blue-500/20"
              />
              <div className="hidden md:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight max-w-[140px] truncate">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] font-semibold text-blue-600 block">
                  {currentUser.section || "Unassigned"} · Student
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 ml-0.5 transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Popup Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 overflow-hidden z-50 p-2 space-y-1 anim-pop-bounce">
                {/* Profile Card Header */}
                <div className="p-3 bg-gradient-to-br from-blue-50 via-indigo-50 to-amber-50/50 rounded-xl border border-blue-100 flex items-center gap-3 mb-1">
                  <StudentAvatar
                    avatar={currentUser.avatar}
                    name={currentUser.fullName}
                    size="md"
                    className="shadow-xs ring-2 ring-white"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 block">
                      {currentUser.section || "Unassigned"} · Student
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-500">
                      <span>🔥 {liveStreak}d Streak</span>
                      <span>·</span>
                      <span>🎖️ {liveXp} XP</span>
                    </div>
                  </div>
                </div>

                {/* All Settings Hub */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span>All Settings Hub</span>
                  </div>
                  <span className="text-[9px] font-black text-blue-600 bg-white px-1.5 py-0.5 rounded-md border border-blue-200">
                    Open
                  </span>
                </button>

                {/* Change Avatar Mascot */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setShowAvatarPicker(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <Smile className="w-4 h-4 text-amber-500" />
                  <span>Change Mascot Avatar</span>
                </button>

                {/* AI Voice & Narrator */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/dashboard/settings?tab=voice");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <Volume2 className="w-4 h-4 text-purple-500" />
                  <span>AI Voice &amp; Narrator</span>
                </button>

                {/* Account & Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/dashboard/settings?tab=account");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <User className="w-4 h-4 text-indigo-500" />
                  <span>Account &amp; Mascot Profile</span>
                </button>

                {/* Privacy & Security */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/dashboard/settings?tab=privacy");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span>Privacy &amp; Security</span>
                </button>

                {/* Help & Support Guide */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/dashboard/settings?tab=help");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <HelpCircle className="w-4 h-4 text-purple-500" />
                  <span>Help &amp; Support Guide</span>
                </button>

                <div className="h-px bg-slate-100 my-1" />

                {/* Sign Out Action */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── 4. Mascot / Avatar Customizer Modal ───────────────────────── */}
      {showAvatarPicker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-amber-200 text-center space-y-4 anim-pop-bounce">
            <div className="space-y-1">
              <div className="flex justify-center mb-1">
                <StudentAvatar
                  avatar={currentUser.avatar}
                  name={currentUser.fullName}
                  size="xl"
                  className="ring-4 ring-amber-300 shadow-md"
                />
              </div>
              <h3 className="text-lg font-black text-slate-900">Choose Your Character Avatar</h3>
              <p className="text-xs text-slate-500">
                Personalize your reading companion across the Living Storybook!
              </p>
            </div>

            <div className="grid grid-cols-6 gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 max-h-64 overflow-y-auto">
              {AVATAR_OPTIONS.map((avatarSrc, idx) => (
                <button
                  key={avatarSrc}
                  type="button"
                  onClick={() => handleSelectAvatar(avatarSrc)}
                  className={`p-1 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                    currentUser.avatar === avatarSrc
                      ? "bg-blue-600 ring-2 ring-blue-500 scale-105 shadow-sm"
                      : "bg-white hover:bg-blue-50 border border-slate-200 hover:scale-105"
                  }`}
                  title={`Avatar ${idx + 1}`}
                >
                  <StudentAvatar
                    avatar={avatarSrc}
                    size="sm"
                    className="border-0 shadow-none pointer-events-none"
                  />
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowAvatarPicker(false)}
              className="w-full h-10 rounded-xl text-xs font-bold border-slate-200 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
