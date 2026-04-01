"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui";
import { ChatBubbleIcon, CloseIcon, MenuIcon, PlusCircleIcon, StorefrontIcon } from "@/components/icons";
import { cn, getInitials } from "@/lib/format";

const navigation = [
  { href: "/", label: "Browse", icon: StorefrontIcon },
  { href: "/sell", label: "Sell", icon: PlusCircleIcon },
  { href: "/messages", label: "Messages", icon: ChatBubbleIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    async function syncUser(user: User | null) {
      const currentRequest = ++requestId;
      if (!active) return;

      if (!user) {
        setUserEmail(null);
        setUserName(null);
        setLoadingUser(false);
        return;
      }

      setUserEmail(user.email ?? null);
      setUserName(null);
      setLoadingUser(false);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!active || currentRequest !== requestId) return;
      setUserName(profile?.full_name ?? null);
    }

    void supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        void syncUser(null);
        return;
      }

      void syncUser(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
    });

    return () => {
      active = false;
      requestId += 1;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) return;

    setUserEmail(null);
    setUserName(null);
    router.replace("/");
    router.refresh();
  }

  const displayName = userName?.trim() || userEmail || "Campus user";
  const initials = getInitials(displayName);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-3 rounded-2xl px-2 py-2 text-slate-950 transition hover:bg-slate-100">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15">
                <StorefrontIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-950">College Marketplace</p>
                <p className="text-xs text-slate-500">Buy, sell, and chat on campus</p>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 lg:flex">
            {navigation.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;

              if (item.href === "/messages" && !userEmail && !loadingUser) {
                return null;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {loadingUser ? (
              <div className="h-11 w-40 animate-pulse rounded-2xl bg-slate-200/80" />
            ) : userEmail ? (
              <>
                <Link href="/my-listings" className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-xs font-semibold text-white">{initials}</span>
                  <span className="max-w-[180px] truncate">{userName ? `Hi, ${userName}` : userEmail}</span>
                </Link>
                <Button variant="secondary" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-700 transition hover:text-slate-950">Log in</Link>
                <Link href="/signup"><Button>Get started</Button></Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-200/80 py-4 lg:hidden">
            <div className="grid gap-2">
              {navigation.map((item) => {
                if (item.href === "/messages" && !userEmail && !loadingUser) {
                  return null;
                }

                const Icon = item.icon;
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium",
                      active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3">
              {loadingUser ? (
                <div className="h-11 animate-pulse rounded-2xl bg-slate-200/80" />
              ) : userEmail ? (
                <>
                  <Link href="/my-listings" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                    {userName ? `Manage listings as ${userName}` : userEmail}
                  </Link>
                  <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <>
                  <Link href="/login"><Button variant="secondary" className="w-full">Log in</Button></Link>
                  <Link href="/signup"><Button className="w-full">Create account</Button></Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
