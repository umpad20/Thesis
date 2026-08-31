import { createClient } from "@/utils/supabase/client";
import type { EnrolledStudent, StudentEnrollmentInput } from "@/lib/types";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "teacher";
  section?: string;
  teacherId?: string;
  avatar?: string;
  availableSections?: string[];
}

const CURRENT_SESSION_KEY = "readsmart_current_user";
const TEACHER_SECTIONS_KEY = "readsmart_teacher_sections";
const ENROLLED_STUDENTS_KEY = "readsmart_enrolled_students";

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export function setCurrentUserSession(user: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
}

export async function signOutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}

/**
 * Fetch sections from Supabase directly via API route.
 */
export async function fetchTeacherSectionsFromSupabase(teacherId?: string): Promise<string[]> {
  try {
    const url = teacherId
      ? `/api/teacher/sections?teacherId=${encodeURIComponent(teacherId)}`
      : "/api/teacher/sections";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.sections) && data.sections.length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem(TEACHER_SECTIONS_KEY, JSON.stringify(data.sections));
        }
        return data.sections;
      }
    }
  } catch {
    // fallback to local
  }
  return getTeacherSections();
}

/**
 * Get active sections managed by the teacher (cached or default).
 */
export function getTeacherSections(defaultSection = "Grade 3-A"): string[] {
  if (typeof window === "undefined") return [defaultSection];
  try {
    const raw = localStorage.getItem(TEACHER_SECTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [defaultSection];
}

/**
 * Add a new section directly into Supabase and local cache.
 */
export async function addTeacherSection(newSection: string, teacherId?: string): Promise<string[]> {
  const clean = newSection.trim();
  if (!clean) return getTeacherSections();

  try {
    const res = await fetch("/api/teacher/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionName: clean, teacherId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.sections)) {
        if (typeof window !== "undefined") {
          localStorage.setItem(TEACHER_SECTIONS_KEY, JSON.stringify(data.sections));
        }
        return data.sections;
      }
    }
  } catch {
    // fallback
  }

  const current = getTeacherSections();
  if (!current.includes(clean)) {
    const updated = [...current, clean];
    if (typeof window !== "undefined") {
      localStorage.setItem(TEACHER_SECTIONS_KEY, JSON.stringify(updated));
    }
    return updated;
  }
  return current;
}

/**
 * Retrieve students directly from Supabase scoped to teacher.
 */
export async function fetchStudentsFromSupabase(
  section?: string,
  teacherId?: string
): Promise<EnrolledStudent[]> {
  try {
    const params = new URLSearchParams();
    if (section && section !== "all") params.set("section", section);
    if (teacherId) params.set("teacherId", teacherId);

    const queryString = params.toString();
    const url = queryString ? `/api/teacher/students?${queryString}` : "/api/teacher/students";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.students)) {
        return data.students;
      }
    }
  } catch {
    // fallback
  }
  return getEnrolledStudents();
}

/**
 * Retrieve cached enrolled students.
 */
export function getEnrolledStudents(): EnrolledStudent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ENROLLED_STUDENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

/**
 * Enroll a new student account directly into Supabase (Auth + Profiles + Badge Progress).
 */
export async function enrollStudentAccount(
  input: StudentEnrollmentInput
): Promise<{ success: boolean; student?: EnrolledStudent; message?: string }> {
  const cleanName = input.fullName.trim();
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanSection = input.section?.trim() || "Grade 3-A";
  const password = input.password || "Student2026!";

  if (!cleanName || !cleanEmail) {
    return { success: false, message: "Please provide both student full name and email." };
  }

  try {
    // Call server endpoint that uses Supabase Admin API to create pre-confirmed user & profile
    const res = await fetch("/api/teacher/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: cleanName,
        email: cleanEmail,
        password: password,
        gender: input.gender || "Female",
        section: cleanSection,
        teacherId: input.teacherId,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return { success: false, message: data.error || "Failed to create student in Supabase." };
    }

    const newStudent: EnrolledStudent = data.student || {
      id: `STU-${Math.floor(100 + Math.random() * 900)}`,
      name: cleanName,
      email: cleanEmail,
      gender: input.gender || "Female",
      section: cleanSection,
      currentBadge: "Reading Star (Star Badge 1)",
      comprehension: "0.0%",
      accuracyRaw: 0,
      quizzesPassed: "0 / 0",
      status: "On Track",
      readingSpeed: "—",
      lastActive: "Just Enrolled",
      avatar: input.gender === "Female" ? "👧" : "👦",
    };

    // Save in local cache for instant UI response
    if (typeof window !== "undefined") {
      const existing = getEnrolledStudents();
      const updated = [newStudent, ...existing.filter((s) => s.email !== cleanEmail)];
      localStorage.setItem(ENROLLED_STUDENTS_KEY, JSON.stringify(updated));
    }

    return { success: true, student: newStudent };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error enrolling student into Supabase.";
    return { success: false, message: errorMsg };
  }
}

/**
 * Strict Real Supabase Sign-In:
 */
export async function authenticateSignIn(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: "Please enter your registered email address." };
  }
  if (!password) {
    return { success: false, message: "Please enter your password." };
  }

  const supabase = createClient();

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (authError || !authData?.user) {
      return {
        success: false,
        message: "Invalid email or password. Please check your credentials or create an account.",
      };
    }

    // Fetch user profile from Supabase public.profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    const userProfile: UserProfile = {
      id: authData.user.id,
      email: cleanEmail,
      fullName: profile?.full_name || authData.user.user_metadata?.full_name || cleanEmail.split("@")[0],
      role: (profile?.role || authData.user.user_metadata?.role || "student") as "student" | "teacher",
      section: profile?.section || authData.user.user_metadata?.section || (profile?.role === "teacher" ? "Grade 3 Faculty" : "Unassigned"),
      teacherId: profile?.teacher_id || authData.user.user_metadata?.teacher_id,
      avatar: profile?.avatar || authData.user.user_metadata?.avatar || (profile?.role === "teacher" ? "👩‍🏫" : "🦊"),
    };

    setCurrentUserSession(userProfile);
    return { success: true, user: userProfile };
  } catch {
    return {
      success: false,
      message: "Connection error. Please check your network and try again.",
    };
  }
}

/**
 * Strict Real Supabase Sign-Up:
 */
export async function authenticateSignUp(params: {
  fullName: string;
  email: string;
  password?: string;
  role: "student" | "teacher";
  section?: string;
}): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  if (!cleanEmail || !params.fullName.trim()) {
    return { success: false, message: "Please provide both your full name and email." };
  }
  if (!params.password || params.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters." };
  }

  const supabase = createClient();

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName.trim(),
          role: params.role,
          section: params.section || (params.role === "teacher" ? "Grade 3 Faculty" : "Unassigned"),
          avatar: params.role === "teacher" ? "👩‍🏫" : "🦊",
        },
      },
    });

    if (authError) {
      if (
        authError.message.toLowerCase().includes("already registered") ||
        authError.message.toLowerCase().includes("user already exists")
      ) {
        return {
          success: false,
          message: "An account with this email is already registered. Please sign in.",
        };
      }
      return { success: false, message: authError.message };
    }

    if (!authData?.user) {
      return { success: false, message: "Failed to create account in Supabase. Please try again." };
    }

    // Ensure profile row exists in public.profiles table
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      email: cleanEmail,
      full_name: params.fullName.trim(),
      role: params.role,
      section: params.section || (params.role === "teacher" ? "Grade 3 Faculty" : "Unassigned"),
      avatar: params.role === "teacher" ? "👩‍🏫" : "🦊",
    });

    // Explicitly sign out so the user is directed to /login to sign in with their password
    try {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        localStorage.removeItem(CURRENT_SESSION_KEY);
      }
    } catch {
      // ignore
    }

    const newUser: UserProfile = {
      id: authData.user.id,
      email: cleanEmail,
      fullName: params.fullName.trim(),
      role: params.role,
      section: params.section || (params.role === "teacher" ? "Grade 3 Faculty" : "Grade 3-A"),
      avatar: params.role === "teacher" ? "👩‍🏫" : "🦊",
    };

    return { success: true, user: newUser };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred while connecting to Supabase.",
    };
  }
}

export async function updateUserAvatar(newAvatar: string): Promise<UserProfile | null> {
  const current = getCurrentUser();
  if (!current) return null;

  const updated: UserProfile = { ...current, avatar: newAvatar };
  setCurrentUserSession(updated);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }

  try {
    const supabase = createClient();
    await supabase.from("profiles").update({ avatar: newAvatar }).eq("id", current.id);
  } catch {
    // ignore
  }

  return updated;
}

// Backward-compatibility aliases
export const nonStrictSignIn = authenticateSignIn;
export const nonStrictSignUp = authenticateSignUp;
