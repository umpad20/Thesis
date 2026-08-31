"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Download,
  BookOpen,
  Users,
  Award,
  FileCheck2,
  X,
  Sparkles,
  ArrowRight,
  Smile,
  Settings,
  Volume2,
  User,
  Lock,
  HelpCircle,
  Info,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BadgeGraphic } from "@/components/badge-graphic";
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
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_TEACHER);

  // Live Database Data for Global Typeahead Search
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notification State
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

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

  // Keyboard shortcut: Ctrl+K or Cmd+K
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
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
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

  // Search Results Matching across live database items
  const cleanQuery = searchQuery.trim().toLowerCase();
  const matchingStudents = cleanQuery
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(cleanQuery) ||
          s.id.toLowerCase().includes(cleanQuery) ||
          (s.email && s.email.toLowerCase().includes(cleanQuery)) ||
          s.section.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingLessons = cleanQuery
    ? lessons.filter(
        (l) =>
          l.lesson_title.toLowerCase().includes(cleanQuery) ||
          l.lesson_description.toLowerCase().includes(cleanQuery)
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
    matchingStudents.length > 0 || matchingLessons.length > 0 || matchingBadges.length > 0;

  // Live Notifications List
  const notificationsList = [
    {
      id: 1,
      title: "Classroom Cohort Active",
      message:
        students.length > 0
          ? `${students.length} pupil(s) enrolled and monitored in your live faculty dashboard.`
          : "Your classroom cohort is ready. Enroll student accounts to track reading metrics.",
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
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* ── Left: Global Instant Live Search Bar (⌘K) ────────────────── */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search students, stories, evaluations, questions..."
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

        {/* Live Search Dropdown Modal */}
        {isSearchOpen && cleanQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 overflow-hidden z-50 max-h-96 overflow-y-auto anim-pop-bounce">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Live Search Results ({cleanQuery})
              </span>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {!hasSearchResults ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <Search className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="font-bold text-slate-600">No records found</p>
                <p className="text-[11px]">Try searching by student name, story title, or badge.</p>
              </div>
            ) : (
              <div className="p-2 space-y-3 divide-y divide-slate-100">
                {/* Students Matches */}
                {matchingStudents.length > 0 && (
                  <div className="pt-2 first:pt-0">
                    <span className="text-[10px] font-bold text-blue-600 px-2 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Enrolled Pupils ({matchingStudents.length})</span>
                    </span>
                    {matchingStudents.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push("/teacher/students");
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{s.avatar || (s.gender === "Female" ? "👧" : "👦")}</span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">{s.name}</p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {s.section} · {s.currentBadge}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {s.comprehension}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stories Matches */}
                {matchingLessons.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-emerald-600 px-2 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Story Curriculum ({matchingLessons.length})</span>
                    </span>
                    {matchingLessons.slice(0, 4).map((l) => (
                      <div
                        key={l.lesson_id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push("/teacher/lessons");
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">{l.lesson_title}</p>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{l.lesson_description}</span>
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            l.lesson_id <= 15
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {l.lesson_id <= 15 ? "Core" : "Custom"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stage Badges Matches */}
                {matchingBadges.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-amber-600 px-2 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>Stage Badges ({matchingBadges.length})</span>
                    </span>
                    {matchingBadges.slice(0, 3).map((b) => (
                      <div
                        key={b.badge_id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push("/teacher/badges");
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BadgeGraphic
                            type={b.badge_type}
                            medalType={b.badge_type === "medal" ? b.medal_type : undefined}
                            size="xs"
                            status="completed"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{b.badge_name}</p>
                            <span className="text-[10px] text-slate-400">Pass: ≥{b.required_passing_score}%</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right: Notification Center & Faculty Profile ── */}
      <div className="flex items-center gap-2.5 sm:gap-3">

        {/* Reports Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/teacher/reports")}
          className="hidden md:flex h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Reports</span>
        </Button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifsOpen(!isNotifsOpen);
              setHasUnread(false);
            }}
            aria-label="View Notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotifsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 overflow-hidden z-50 anim-pop-bounce">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  <span>Faculty Activity Center</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsNotifsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
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

        <div className="w-px h-6 bg-slate-200 mx-0.5" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left outline-none">
            <Avatar className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800">
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
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl shadow-xl border border-slate-100">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-slate-400 font-medium">
              Signed in as <strong>{currentUser.fullName}</strong>
            </DropdownMenuLabel>

            {/* ── Settings Sub-Navigation Suite ─────────────────────────── */}
            <DropdownMenuItem
              onClick={() => router.push("/teacher/settings")}
              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-blue-600" />
                <span>All Faculty Settings</span>
              </div>
              <span className="text-[9px] font-black text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                Open
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/teacher/settings?tab=voice")}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Voice Narrator Engine</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/teacher/settings?tab=account")}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Faculty Account Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/teacher/settings?tab=privacy")}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Privacy &amp; Security</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/teacher/settings?tab=help")}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
              <span>Help &amp; Support Guide</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/teacher/settings?tab=about")}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>About ReadSmart</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 px-2.5 py-2 text-xs text-rose-600 font-bold cursor-pointer hover:bg-rose-50 rounded-xl"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
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
                  className={`text-2xl p-3 rounded-2xl border-2 transition-all hover:scale-110 ${
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
