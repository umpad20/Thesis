import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/auth/signout
 *
 * Server-side sign-out that properly clears all Supabase auth cookies.
 * We build a custom Supabase SSR client wired to the redirect response
 * so cookie deletions are included in the response sent to the browser.
 */
export async function GET(request: NextRequest) {
  const redirectUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.signOut();

  // Explicitly delete any Supabase cookies to guarantee clean logout
  const allCookies = request.cookies.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith("sb-") || cookie.name.includes("auth-token") || cookie.name.includes("supabase")) {
      response.cookies.set({
        name: cookie.name,
        value: "",
        maxAge: 0,
        path: "/",
      });
    }
  }

  return response;
}
