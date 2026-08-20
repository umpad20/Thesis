import { createClient } from "@/utils/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "teacher";
  section?: string;
  avatar?: string;
}

const CURRENT_SESSION_KEY = "readsmart_current_user";

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
 * Strict Real Supabase Sign-In:
 * Validates credentials strictly against Supabase Auth.
 * Rejects invalid emails or wrong passwords with an explicit error.
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
      section: profile?.section || authData.user.user_metadata?.section || (profile?.role === "teacher" ? "Grade 3 Faculty" : "Grade 3-A"),
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
 * Registers the real account in Supabase auth.users & public.profiles.
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
          section: params.section || (params.role === "teacher" ? "Grade 3 Faculty" : "Grade 3-A"),
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
      section: params.section || (params.role === "teacher" ? "Grade 3 Faculty" : "Grade 3-A"),
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

// Backward-compatibility aliases
export const nonStrictSignIn = authenticateSignIn;
export const nonStrictSignUp = authenticateSignUp;
