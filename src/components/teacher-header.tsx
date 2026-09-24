"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Download,
  X,
  Smile,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getCurrentUser,
  signOutUser,
  updateUserAvatar,
  fetchStudentsFromSupabase,
  UserProfile,
} from "@/utils/auth-helpers";
import {
  fetchAllLessons,
  fetchBadgesFromSupabase,
} from "@/utils/supabase-queries";
import type { Lesson, Badge, EnrolledStudent } from "@/lib/types";

const TEACHER_AVATARS = ["👩‍🏫", "👨‍🏫", "🦉", "📚", "🎓", "🌟", "🏆", "🚀", "🦊", "🐼", "🦁", "🐨"];

const DEFAULT_TEACHER: UserProfile = {
  id: "00000000-0000-0000-0000-000000000002",
  email: "teacher@pvces.edu.ph",
  fullName: "Teacher",
  role: "teacher",
  section: "Grade 3 Faculty",
  avatar: "👩‍🏫",
};

export function TeacherHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_TEACHER);

  // Live Database Data for Global Typeahead Search
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  // Notification State
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const notifsContainerRef = useRef<HTMLDivElement>(null);

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  // Mascot Picker Modal
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    async function loadData() {
      const user = getCurrentUser() || DEFAULT_TEACHER;
      setCurrentUser(user);

      const [liveStudents, liveLessons, liveBadges] = await Promise.all([
        fetchStudentsFromSupabase(undefined, user.id),
        fetchAllLessons(),
        fetchBadgesFromSupabase(),
      ]);

      setStudents(liveStudents || []);
      setLessons(liveLessons || []);
      setBadges(liveBadges || []);
    }

    loadData();

    const handleStorageChange = () => {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
        fetchStudentsFromSupabase(undefined, user.id).then((st) => setStudents(st || []));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // Keyboard shortcut & click outside listener for dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNotifsOpen(false);
        setIsProfileOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
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

  // Live Notifications List
  const notificationsList = [
    {
      id: 1,
      title: "Classroom Active",
      message:
        students.length > 0
          ? `${students.length} pupil(s) enrolled and monitored in your live faculty dashboard.`
          : "Your classroom is ready. Enroll student accounts to track reading metrics.",
      time: "Live",
      type: "roster",
    },
    {
      id: 2,
      title: "Curriculum Repository",
      message: `${lessons.length} reading story passages available across ${badges.length} stage badges.`,
      time: "Synced",
      type: "curriculum",
    },
    {
      id: 3,
      title: "Protected Core Standards",
      message: "Stages 1–5 and Stories 1–15 are secured as developer default standards.",
      time: "System",
      type: "security",
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* ── Left: Faculty Workspace Identity ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
            Teacher Workspace
          </span>
          <span className="hidden sm:inline-block text-xs font-bold text-slate-500">
            · {currentUser.section || "Grade 3 Faculty"}
          </span>
        </div>
      </div>

      {/* ── Right: Notification Center & Faculty Profile ── */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Reports Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/teacher/reports")}
          className="hidden md:flex h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Reports</span>
        </Button>

        {/* Notification Bell Dropdown */}
        <div ref={notifsContainerRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifsOpen(!isNotifsOpen);
              setHasUnread(false);
            }}
            aria-label="View Notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotifsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 overflow-hidden z-50 anim-pop-bounce">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  <span>Faculty Activity Center</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsNotifsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2 divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notificationsList.map((n) => (
                  <div key={n.id} className="p-2.5 hover:bg-slate-50/80 rounded-xl transition-colors space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 border-t border-slate-100 bg-slate-50/60 text-center">
                <Link
                  href="/teacher/reports"
                  onClick={() => setIsNotifsOpen(false)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View Performance Analytics →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Functional Faculty Profile Dropdown ───────────────────────── */}
        <div ref={profileContainerRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all text-left outline-none cursor-pointer select-none"
          >
            <Avatar className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
              <AvatarFallback className="bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center justify-center">
                {currentUser.avatar ? currentUser.avatar : getInitials(currentUser.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block">
                {currentUser.section || "Grade 3 Faculty"} · Faculty
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
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50 p-2 space-y-1 anim-pop-bounce">
              {/* Header Info */}
              <div className="p-3 bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-amber-50/30 rounded-xl border border-blue-100/80 flex items-center gap-3 mb-1">
                <span className="text-2xl p-1 bg-white rounded-xl shadow-2xs">
                  {currentUser.avatar || "👩‍🏫"}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-slate-900 block truncate" title={currentUser.fullName}>
                    {currentUser.fullName}
                  </span>
                  <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-md mt-1">
                    {currentUser.section || "Grade 3 Faculty"} · Faculty
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              {/* All Faculty Settings Hub */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push("/teacher/settings");
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-blue-600 transition-transform group-hover:rotate-45" />
                  <span>Faculty Settings</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600">
                  Preferences
                </span>
              </button>

              {/* Change Mascot / Avatar */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setShowAvatarPicker(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-800 transition-colors cursor-pointer text-left group"
              >
                <Smile className="w-4 h-4 text-pink-500 transition-transform group-hover:scale-110" />
                <span>Change Faculty Mascot</span>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              {/* Sign Out */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mascot / Avatar Picker Modal ──────────────────────────────── */}
      {showAvatarPicker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 anim-pop-bounce text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Choose Faculty Mascot</h3>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Select an emoji avatar for your faculty profile:
            </p>

            <div className="grid grid-cols-4 gap-3 py-2">
              {TEACHER_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelectAvatar(emoji)}
                  className={`text-2xl p-3 rounded-2xl border-2 transition-all hover:scale-110 cursor-pointer ${
                    currentUser.avatar === emoji
                      ? "border-blue-600 bg-blue-50/80 shadow-md shadow-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/60"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
