import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route-protection middleware.
 *
 * Rules:
 *  - /dashboard/*  → logged-in STUDENTS only
 *  - /teacher/*    → logged-in TEACHERS only
 *  - /login, /signup → redirect to home dashboard if already authenticated
 *
 * Any mismatch or missing session → redirect appropriately.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a response we can mutate (for cookie forwarding)
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: do NOT remove this call
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Helper: build absolute redirect URL ────────────────────────────────────
  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    return NextResponse.redirect(url);
  };

  // ── 1. Protect /dashboard/* (students only) ────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      // Not logged in → send to login
      return redirectTo("/login");
    }

    // Fetch role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? user.user_metadata?.role ?? "student";

    if (role !== "student") {
      // Logged-in teacher trying to access student area → send to teacher dashboard
      return redirectTo("/teacher");
    }
  }

  // ── 2. Protect /teacher/* (teachers only) ─────────────────────────────────
  if (pathname.startsWith("/teacher")) {
    if (!user) {
      // Not logged in → send to login
      return redirectTo("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? user.user_metadata?.role ?? "student";

    if (role !== "teacher") {
      // Logged-in student trying to access teacher area → send to student dashboard
      return redirectTo("/dashboard");
    }
  }

  // ── 3. Redirect already-authenticated users away from /login & /signup ─────
  if (pathname === "/login" || pathname === "/signup") {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = profile?.role ?? user.user_metadata?.role ?? "student";
      return redirectTo(role === "teacher" ? "/teacher" : "/dashboard");
    }
  }

  return supabaseResponse;
}

// Only run middleware on these paths — keeps it fast for static assets
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher/:path*",
    "/login",
    "/signup",
  ],
};
