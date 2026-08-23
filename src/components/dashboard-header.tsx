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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getCurrentUser,
  signOutUser,
  updateUserAvatar,
  type UserProfile,
} from "@/utils/auth-helpers";
import {
  fetchStudentStats,
  fetchLessonsForStudent,
  fetchAllVocabularyWords,
  fetchBadgesFromSupabase,
  type LiveStudentStats,
} from "@/utils/supabase-queries";
import type { Lesson, VocabularyWord, Badge } from "@/lib/types";

const AVATAR_OPTIONS = ["🦊", "🦁", "🐼", "🐨", "🦉", "🚀", "⭐", "🏆", "🐯", "🐬"];

const DEFAULT_STUDENT: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "student.maria@pvces.edu.ph",
  fullName: "Student",
  role: "student",
  section: "Grade 3-A",
  avatar: "🦊",
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

  // Avatar Customizer Modal State
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Notification State
  const [unreadNotifs, setUnreadNotifs] = useState(true);

  // Load User & Live Stats
  useEffect(() => {
    async function loadUserData() {
      const user = getCurrentUser() || DEFAULT_STUDENT;
      setCurrentUser(user);

      const section = user.section || "Grade 3-A";
      const [liveStats, liveLessons, liveVocab, liveBadges] = await Promise.all([
        fetchStudentStats(user.id, user.fullName, section, user.avatar || "🦊"),
        fetchLessonsForStudent(section),
        fetchAllVocabularyWords(),
        fetchBadgesFromSupabase(section),
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

  // Search Results Matching
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

  // Real-time computed XP and Streak
  const liveXp = stats?.totalXp ?? 250;
  const liveStreak = stats?.streakDays ?? 1;

  // Dynamically constructed notifications based on live user progress
  const notificationsList = [
    {
      id: 1,
      title: "Stage 1 Star Milestone",
      message: "You have unlocked the Chapter 1 final assessment seal!",
      time: "Recent",
      type: "achievement",
    },
    {
      id: 2,
      title: "Vocabulary Discovery",
      message: `${vocabulary.length > 0 ? vocabulary.length : 16} words are available in your Vocabulary Vault.`,
      time: "Active",
      type: "info",
    },
    {
      id: 3,
      title: "Daily Reading Streak",
      message: `You're on a ${liveStreak}-day learning streak! Keep reading to earn streak badges.`,
      time: "Today",
      type: "streak",
    },
  ];

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 antialiased">
        {/* ── 1. Global Live Search Bar ───────────────────────────────── */}
        <div className="flex items-center gap-4 flex-1 max-w-md relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search stories, vocabulary, quizzes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl pl-9 pr-12 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 bg-white border border-slate-200 pointer-events-none hidden sm:block">
                ⌘K
              </div>
            )}
          </div>

          {/* Search Results Dropdown Overlay */}
          {isSearchOpen && cleanQuery && (
            <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 p-3 z-50 max-h-96 overflow-y-auto space-y-3 anim-pop-bounce">
              {!hasSearchResults ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  No matching stories or vocabulary words for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <>
                  {/* Matching Stories */}
                  {matchingLessons.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                        📖 Chapter Stories
                      </span>
                      <div className="space-y-1">
                        {matchingLessons.slice(0, 3).map((lesson) => (
                          <div
                            key={lesson.lesson_id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                              router.push(`/dashboard/lessons?lessonId=${lesson.lesson_id}`);
                            }}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 block">
                                  {lesson.lesson_title}
                                </span>
                                <span className="text-[10px] text-slate-400 line-clamp-1">
                                  {lesson.lesson_description}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              Read
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Vocabulary */}
                  {matchingVocab.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                        🔤 Vocabulary Terms
                      </span>
                      <div className="space-y-1">
                        {matchingVocab.slice(0, 4).map((vocab) => (
                          <div
                            key={vocab.word_id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                              router.push("/dashboard/vocabulary");
                            }}
                            className="p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <Bookmark className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700 block">
                                  {vocab.word}
                                </span>
                                <span className="text-[10px] text-slate-500 line-clamp-1">
                                  {vocab.definition}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              Vault
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Badges */}
                  {matchingBadges.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                        🏆 Chapters & Stages
                      </span>
                      <div className="space-y-1">
                        {matchingBadges.map((badge) => (
                          <div
                            key={badge.badge_id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                              router.push("/dashboard/badges");
                            }}
                            className="p-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 block">
                                  {badge.badge_name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Stage {badge.badge_order} · {badge.xp_reward} XP Reward
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Storybook
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── 2. Right: Live Stats, Notification Popover & Profile Dropdown ── */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live Streak & XP Badge Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50/90 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-2xs">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
              title="Daily Reading Streak"
            >
              <Flame className="w-3.5 h-3.5 fill-blue-500 text-blue-500 animate-pulse" />
              <span>{liveStreak} Day Streak</span>
            </Link>
            <div className="w-px h-3 bg-slate-200" />
            <Link
              href="/dashboard/badges"
              className="flex items-center gap-1 text-amber-600 hover:text-amber-700 transition-colors"
              title="Total XP Earned from Lessons & Quizzes"
            >
              <Award className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{liveXp} XP</span>
            </Link>
          </div>

          {/* Interactive Notification Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={() => setUnreadNotifs(false)}
              aria-label="View Notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors outline-none cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-3 rounded-2xl shadow-xl border-2 border-slate-100 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900">Notifications & Updates</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  ReadSmart Live
                </span>
              </div>
              <div className="space-y-1.5">
                {notificationsList.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 transition-colors text-left space-y-0.5 cursor-pointer block"
                    onClick={() => router.push("/dashboard/badges")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{notif.message}</p>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-slate-200 mx-0.5" />

          {/* ── 3. Interactive Profile & Avatar Customizer Dropdown ─────── */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left outline-none">
              <Avatar className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-blue-200">
                <AvatarFallback className="bg-transparent text-white font-black text-sm">
                  {currentUser.avatar || getInitials(currentUser.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight max-w-[140px] truncate">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] font-semibold text-blue-600 block">
                  {currentUser.section || "Grade 3-A"} · Student
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-2 border-slate-100 space-y-1">
              {/* Profile Card Header */}
              <div className="p-3 bg-gradient-to-br from-blue-50 via-indigo-50 to-amber-50/50 rounded-xl border border-blue-100 flex items-center gap-3 mb-1">
                <span className="text-2xl p-1 bg-white rounded-xl shadow-2xs">
                  {currentUser.avatar || "🦊"}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-slate-900 block truncate">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 block">
                    {currentUser.section || "Grade 3-A"} · Student
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-500">
                    <span>🔥 {liveStreak}d Streak</span>
                    <span>·</span>
                    <span>🎖️ {liveXp} XP</span>
                  </div>
                </div>
              </div>

              {/* Avatar Selector Trigger */}
              <DropdownMenuItem
                onClick={() => setShowAvatarPicker(true)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Smile className="w-4 h-4 text-amber-500" />
                <span>Change Mascot / Avatar</span>
              </DropdownMenuItem>

              {/* Quick Navigation Items */}
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/badges")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Map className="w-4 h-4 text-blue-600" />
                <span>Living Storybook Pathway</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/dashboard/vocabulary")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-emerald-600" />
                <span>Vocabulary Vault</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              {/* Sign Out Action */}
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── 4. Mascot / Avatar Customizer Modal ───────────────────────── */}
      {showAvatarPicker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-amber-200 text-center space-y-4 anim-pop-bounce">
            <div className="space-y-1">
              <span className="text-3xl block mb-1">🦊</span>
              <h3 className="text-lg font-black text-slate-900">Choose Your Mascot Avatar</h3>
              <p className="text-xs text-slate-500">
                Personalize your reading companion across the Living Storybook!
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelectAvatar(emoji)}
                  className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                    currentUser.avatar === emoji
                      ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-110 shadow-sm"
                      : "bg-white hover:bg-blue-50 border border-slate-200 hover:scale-105"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowAvatarPicker(false)}
              className="w-full h-10 rounded-xl text-xs font-bold border-slate-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
