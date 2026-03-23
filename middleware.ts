import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Only these routes can be accessed without logging in
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/auth",
  "/logout",
  "/writing-101",
  "/courses",
  "/practice",
  "/quiz",
  "/tutor",
  "/experience",
  "/api",
  // Note: /placement (intro only) is handled via EXACT_PUBLIC_ROUTES below
];

// Exact-match public routes (only the specific path, not sub-paths)
const EXACT_PUBLIC_ROUTES = ["/placement"];

// Routes exempt from the profile-completion redirect (new users may take placement test first)
const PROFILE_EXEMPT = [
  "/personal-details",
  "/login",
  "/register",
  "/auth",
  "/logout",
  "/placement",
  "/quiz",
  "/tutor",
  "/experience",
  // Allow new users to access the full placement flow before completing profile
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/" ||
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    EXACT_PUBLIC_ROUTES.includes(pathname);

  // 1. Protect all non-public routes — redirect unauthenticated users to /login
  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }
    const redirectRes = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value, c));
    return redirectRes;
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
      const url = request.nextUrl.clone();
      url.pathname = "/";
      const redirectRes = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value, c));
      return redirectRes;
    }

    // new users must complete personal-details
    const isExempt = PROFILE_EXEMPT.some((r) => pathname.startsWith(r));
    if (!profileCompleted && !isExempt) {
      const url = request.nextUrl.clone();
      url.pathname = "/personal-details";
      const redirectRes = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value, c));
      return redirectRes;
    }

    // if access login or register but already logged in, send them to home
    if (profileCompleted && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      const redirectRes = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value, c));
      return redirectRes;
    }
    // 3. Admin route guard — role must be 'admin'
    //    We already have the profile query above; re-query only if hitting /admin/*
    if (pathname.startsWith("/admin")) {
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

      if (!adminProfile || adminProfile.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        const redirectRes = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value, c));
        return redirectRes;
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
