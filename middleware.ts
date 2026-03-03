import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Only these routes can be accessed without logging in
const PUBLIC_ROUTES = ["/login", "/register", "/auth", "/logout"];
// Routes exempt from the profile-completion redirect
const PROFILE_EXEMPT = ["/personal-details", "/login", "/register", "/auth", "/logout"];

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

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // 1. Protect all non-public routes — redirect unauthenticated users to /login
  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Profile-completion gate
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_completed")
      .eq("id", user.id)
      .single();

    const profileCompleted = profile?.profile_completed === true;

    // returning users shouldn't access personal-details
    if (profileCompleted && pathname.startsWith("/personal-details")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // new users must complete personal-details
    const isExempt = PROFILE_EXEMPT.some((r) => pathname.startsWith(r));
    if (!profileCompleted && !isExempt) {
      return NextResponse.redirect(new URL("/personal-details", request.url));
    }

    // if access login or register but already logged in, send them to home
    if (profileCompleted && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  // Run on all routes except Next.js internals (static, image) and API routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
