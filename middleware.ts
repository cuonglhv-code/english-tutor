import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require the user to be logged in
const AUTH_REQUIRED = ["/dashboard"];
// Routes exempt from the profile-completion redirect
const PROFILE_EXEMPT = ["/onboarding", "/login", "/register", "/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Protect /dashboard — redirect unauthenticated users to /login
  if (AUTH_REQUIRED.some((r) => pathname.startsWith(r)) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Profile-completion gate — query the profiles table directly.
  //    Using the DB (not user_metadata) avoids depending on a token refresh
  //    after onboarding, which can hang in some browser environments.
  if (user && !PROFILE_EXEMPT.some((r) => pathname.startsWith(r))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_completed")
      .eq("id", user.id)
      .single();

    const profileCompleted = profile?.profile_completed === true;
    if (!profileCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return response;
}

export const config = {
  // Run on all routes except Next.js internals (static, image) and API routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)" ],
};
