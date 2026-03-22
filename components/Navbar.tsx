"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (!isMounted) return;
          setUserEmail(null);
          setUserName(null);
          setLoadingUser(false);
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Failed to load user:", userError.message);
          if (!isMounted) return;
          setUserEmail(null);
          setUserName(null);
          setLoadingUser(false);
          return;
        }

        if (!isMounted) return;

        if (!user) {
          setUserEmail(null);
          setUserName(null);
          setLoadingUser(false);
          return;
        }

        setUserEmail(user.email ?? null);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (profileError) {
          console.error("Failed to load profile:", profileError.message);
          setUserName(null);
        } else {
          setUserName(profile?.full_name ?? null);
        }

        setLoadingUser(false);
      } catch (error: any) {
        if (error?.message?.includes("Auth session missing")) {
          if (!isMounted) return;
          setUserEmail(null);
          setUserName(null);
          setLoadingUser(false);
          return;
        }

        console.error("Failed to load user:", error);
        if (!isMounted) return;
        setUserEmail(null);
        setUserName(null);
        setLoadingUser(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout failed:", error.message);
        return;
      }

      setUserEmail(null);
      setUserName(null);
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Unexpected logout error:", error);
    }
  }

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const linkStyle = (path: string) =>
    `inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
    }`;

  const displayName = userName?.trim() || userEmail || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-2xl px-1 py-1 text-lg font-semibold tracking-tight text-slate-950 transition hover:text-slate-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm transition group-hover:scale-105">
                CM
              </span>
              <span className="leading-none">College Marketplace</span>
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-2 md:justify-end">
            <Link href="/" className={linkStyle("/")}>
              Home
            </Link>

            <Link href="/sell" className={linkStyle("/sell")}>
              Sell
            </Link>

            {!loadingUser && userEmail ? (
              <>
                <Link href="/my-listings" className={linkStyle("/my-listings")}>
                  My Listings
                </Link>

                <Link href="/messages" className={linkStyle("/messages")}>
                  Messages
                </Link>

                <div className="hidden h-8 w-px bg-slate-200 md:block" />

                <div className="flex max-w-full items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {initial}
                  </span>
                  <span className="max-w-[180px] truncate text-sm font-medium text-slate-700">
                    {userName ? `Hi, ${userName}` : userEmail}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.98]"
                >
                  Logout
                </button>
              </>
            ) : !loadingUser ? (
              <>
                <Link href="/login" className={linkStyle("/login")}>
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.98]"
                >
                  Sign Up
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
