"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Flame,
  Award,
  ChevronDown,
  Map,
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
  MessageSquare,
  CheckCircle2,
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
  fetchStudentNotifications,
  markNotificationAsRead,
  type LiveStudentStats,
  type StudentNotificationItem,
} from "@/utils/supabase-queries";

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

  // Avatar Customizer Modal State
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Notification State
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(false);
  const [liveNotifs, setLiveNotifs] = useState<StudentNotificationItem[]>([]);
  const [selectedTeacherMessage, setSelectedTeacherMessage] = useState<StudentNotificationItem | null>(null);
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
      const liveStats = await fetchStudentStats(user.id, user.fullName, section, user.avatar || "🦊");
      setStats(liveStats);

      // Fetch live notifications addressed to this student
      try {
        const notifs = await fetchStudentNotifications(user.id);
        setLiveNotifs(notifs);
        if (notifs.some((n) => !n.is_read)) {
          setUnreadNotifs(true);
        }
      } catch {}
    }

    loadUserData();

    const handleStorageChange = () => {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
        fetchStudentStats(user.id, user.fullName, user.section, user.avatar || "🦊").then(
          (s) => setStats(s)
        );
        fetchStudentNotifications(user.id).then((notifs) => {
          setLiveNotifs(notifs);
          if (notifs.some((n) => !n.is_read)) {
            setUnreadNotifs(true);
          }
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // Handle escape and click outside for dropdowns
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

  const liveStreak = stats?.streakDays ?? 0;
  const liveXp = stats?.totalXp ?? 0;

  function formatTime(isoStr?: string) {
    if (!isoStr) return "Just now";
    try {
      const diffMs = Date.now() - new Date(isoStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  }

  const teacherNotifications = liveNotifs.map((n) => ({
    id: n.id,
    rawItem: n,
    title: n.title,
    message: n.message,
    time: formatTime(n.created_at),
    type: n.type,
    is_read: n.is_read,
    isTeacherNote: true,
  }));

  const defaultMilestones = [
    {
      id: -1,
      rawItem: null,
      title: "New Chapter Unlocked! 🌟",
      message: "Stage 1: Friendship in Bloom is ready for reading.",
      time: "Just now",
      type: "lesson",
      is_read: true,
      isTeacherNote: false,
    },
    {
      id: -2,
      rawItem: null,
      title: "Streak Maintained! 🔥",
      message: `You're on a ${liveStreak}-day learning adventure.`,
      time: "Today",
      type: "streak",
      is_read: true,
      isTeacherNote: false,
    },
    {
      id: -3,
      rawItem: null,
      title: "Badge Showcase Open 🏆",
      message: "Check your Living Storybook achievements map.",
      time: "Yesterday",
      type: "badge",
      is_read: true,
      isTeacherNote: false,
    },
  ];

  const notifications = [...teacherNotifications, ...defaultMilestones];

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left Spacer */}
        <div />

        {/* ── 2. Live Stats & Avatar Profile Actions ───────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Flame Reading Streak Pill */}
          <div
            title="Your daily active reading streak"
            className="h-9 flex items-center gap-1.5 px-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-800 shadow-2xs transition-all hover:scale-102 select-none"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="text-xs font-black tracking-tight">{liveStreak}d Streak</span>
          </div>

          {/* XP Reward Points Pill */}
          <div
            title="Total reading experience points earned"
            className="hidden sm:flex h-9 items-center gap-1.5 px-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-800 shadow-2xs transition-all hover:scale-102 select-none"
          >
            <Award className="w-4 h-4 text-amber-600" />
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
              className="h-9 w-9 relative rounded-xl text-amber-800 hover:text-amber-900 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 transition-colors cursor-pointer flex items-center justify-center"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
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

                <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setIsNotifsOpen(false);
                        if (notif.isTeacherNote && notif.rawItem) {
                          setSelectedTeacherMessage(notif.rawItem);
                        } else {
                          router.push("/dashboard/badges");
                        }
                      }}
                      className={`p-2.5 rounded-xl transition-all text-left space-y-1 cursor-pointer block ${
                        notif.isTeacherNote
                          ? notif.is_read
                            ? "bg-blue-50/40 hover:bg-blue-50/80 border border-blue-100"
                            : "bg-blue-50 hover:bg-blue-100/70 border-2 border-blue-300 shadow-xs"
                          : "bg-slate-50/80 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {notif.isTeacherNote && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white shrink-0">
                              Teacher
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {notif.title}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                        {notif.message}
                      </p>
                      {notif.isTeacherNote && (
                        <div className="text-[10px] text-blue-600 font-bold flex items-center gap-1 pt-0.5">
                          <span>Click to read full message →</span>
                        </div>
                      )}
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
              className="h-9 flex items-center gap-2 px-2 rounded-xl hover:bg-amber-50/60 border border-transparent hover:border-amber-200/60 transition-all text-left outline-none cursor-pointer select-none"
            >
              <StudentAvatar
                avatar={currentUser.avatar}
                name={currentUser.fullName}
                size="sm"
                className="shadow-xs ring-2 ring-amber-500/20"
              />
              <div className="hidden md:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight max-w-[150px] truncate" title={currentUser.fullName}>
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

      {/* ── 5. Teacher Guidance Message Modal ─────────────────────────── */}
      {selectedTeacherMessage && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTeacherMessage(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-blue-200 text-left space-y-4 anim-pop-bounce relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  {selectedTeacherMessage.type === "praise" ? (
                    <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {selectedTeacherMessage.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    From {selectedTeacherMessage.teacher_name || "Teacher"} · {formatTime(selectedTeacherMessage.created_at)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTeacherMessage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Teacher's Message Speech Bubble */}
            <div className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-2xl border border-blue-100 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                Teacher Encouragement Note
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed italic">
                "{selectedTeacherMessage.message}"
              </p>
            </div>

            {/* Intervention / Hint Recommendation if present */}
            {selectedTeacherMessage.recommendation && (
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-amber-900 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Teacher's Learning Advice:</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed pl-5">
                  {selectedTeacherMessage.recommendation}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-2">
              <Button
                type="button"
                onClick={async () => {
                  if (selectedTeacherMessage) {
                    await markNotificationAsRead(selectedTeacherMessage.id, currentUser.id);
                    setLiveNotifs((prev) =>
                      prev.map((n) =>
                        n.id === selectedTeacherMessage.id ? { ...n, is_read: true } : n
                      )
                    );
                    setUnreadNotifs(
                      liveNotifs.some(
                        (n) => n.id !== selectedTeacherMessage.id && !n.is_read
                      )
                    );
                  }
                  setSelectedTeacherMessage(null);
                }}
                className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-blue-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Got it! Thanks Teacher!</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
