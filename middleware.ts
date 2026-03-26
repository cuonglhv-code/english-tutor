import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const locales = ["en", "vi"];
const defaultLocale = "en";

function getLocale(request: NextRequest) {
  // 1. Check cookies
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale;
  
  // 2. Fallback to default
  return defaultLocale;
}

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
  "/vocabulary-challenge",
  "/vocabulary-game.html",
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
  "/vocabulary-challenge",
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

  // 0. i18n Locale Check & Redirect
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale && !pathname.startsWith('/api') && !pathname.includes('.')) {
    const locale = getLocale(request);
    const url = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url);
    const redirectRes = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value, c));
    return redirectRes;
  }

  // Normalize pathname for routing checks (remove locale prefix)
  let normalizedPathname = pathname;
  if (pathnameHasLocale) {
    const segments = pathname.split('/');
    normalizedPathname = '/' + segments.slice(2).join('/');
    if (normalizedPathname === '') normalizedPathname = '/';
  }

  const isPublic =
    normalizedPathname === "/" ||
    PUBLIC_ROUTES.some((r) => normalizedPathname.startsWith(r)) ||
    EXACT_PUBLIC_ROUTES.includes(normalizedPathname);

  // 1. Protect all non-public routes — redirect unauthenticated users to /login
  if (!user && !isPublic) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : 'en';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    if (normalizedPathname !== "/") {
      loginUrl.searchParams.set("next", normalizedPathname);
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
    if (profileCompleted && normalizedPathname.startsWith("/personal-details")) {
      const locale = pathnameHasLocale ? pathname.split('/')[1] : 'en';
      const url = new URL(`/${locale}`, request.url);
      const redirectRes = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value, c));
      return redirectRes;
    }

    // new users must complete personal-details
    const isExempt = PROFILE_EXEMPT.some((r) => normalizedPathname.startsWith(r));
    if (!profileCompleted && !isExempt) {
      const locale = pathnameHasLocale ? pathname.split('/')[1] : 'en';
      const url = new URL(`/${locale}/personal-details`, request.url);
      const redirectRes = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value, c));
      return redirectRes;
    }

    // if access login or register but already logged in, send them to home
    if (profileCompleted && (normalizedPathname.startsWith("/login") || normalizedPathname.startsWith("/register"))) {
      const locale = pathnameHasLocale ? pathname.split('/')[1] : 'en';
      const url = new URL(`/${locale}`, request.url);
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
