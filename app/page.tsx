"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import ListingCard from "@/components/ListingCard";
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  PageShell,
  Skeleton,
  StatCard,
} from "@/components/ui";
import {
  ArrowRightIcon,
  ChatBubbleIcon,
  PlusCircleIcon,
  SearchIcon,
  StorefrontIcon,
} from "@/components/icons";

type ListingRow = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  status: string;
  created_at: string;
  categories: { name: string } | { name: string }[] | null;
};

type ListingCardData = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  category: string | null;
};

function getCategoryName(categories: ListingRow["categories"]) {
  if (!categories) return null;
  return Array.isArray(categories) ? (categories[0]?.name ?? null) : categories.name;
}

export default function HomePage() {
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          description,
          price,
          image_url,
          status,
          created_at,
          categories ( name )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(12);

      if (!isMounted) return;

      if (queryError) {
        setError("Failed to load listings: " + queryError.message);
        setListings([]);
        setLoading(false);
        return;
      }

      const normalized = ((data as ListingRow[] | null) ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        imageUrl: item.image_url,
        status: item.status,
        createdAt: item.created_at,
        category: getCategoryName(item.categories),
      }));

      setListings(normalized);
      setLoading(false);
    }

    void loadListings();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Active listings",
        value: loading ? "..." : String(listings.length),
        helper: "Fresh items from students right now",
      },
      {
        label: "Fast replies",
        value: "Chat built in",
        helper: "Message buyers and sellers without leaving the app",
      },
      {
        label: "Campus-first",
        value: "Student friendly",
        helper: "Designed for quick local deals and low-friction trust",
      },
    ],
    [listings.length, loading]
  );

  return (
    <PageShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Campus commerce"
          title="A cleaner way to buy and sell on campus"
          description="Discover active listings, post your own items in minutes, and keep the whole transaction inside one tidy student-first product."
          actions={
            <>
              <Link href="/sell">
                <Button size="lg">
                  <PlusCircleIcon className="h-4 w-4" />
                  Sell an item
                </Button>
              </Link>
              <Link href="/messages">
                <Button size="lg" variant="secondary">
                  <ChatBubbleIcon className="h-4 w-4" />
                  Open messages
                </Button>
              </Link>
            </>
          }
        />

        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              helper={stat.helper}
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(160deg,#0f172a_0%,#111827_45%,#312e81_100%)] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
            <Badge
              tone="brand"
              className="bg-white/10 text-indigo-100 ring-white/15"
            >
              Built for daily campus use
            </Badge>

            <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Post faster, browse smarter, and keep the conversation moving.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              The home feed now surfaces real listings, clear prices, better card
              hierarchy, and direct navigation into details and chat.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Browse",
                  copy: "Cards with stronger image treatment, price emphasis, and category hierarchy.",
                  icon: <StorefrontIcon />,
                },
                {
                  title: "Compare",
                  copy: "Cleaner spacing and readable descriptions make quick decisions easier.",
                  icon: <SearchIcon />,
                },
                {
                  title: "Act",
                  copy: "Every listing leads directly to details and messaging without dead ends.",
                  icon: <ArrowRightIcon />,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-indigo-100">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 backdrop-blur sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
              What changed
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Production-grade marketplace surface
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Real listings now drive the first impression instead of static demo-only
                cards.
              </p>
              <p>
                Cards, forms, empty states, and buttons all follow a consistent visual
                system.
              </p>
              <p>
                Mobile layout keeps actions reachable without turning the desktop view
                into a cramped list.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Live feed
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Latest active listings
              </h2>
            </div>
          </div>

          {error ? (
            <EmptyState
              title="Listings could not be loaded"
              description={error}
              action={
                <Link href="/sell">
                  <Button>
                    <PlusCircleIcon className="h-4 w-4" />
                    Post the first item
                  </Button>
                </Link>
              }
              icon={<StorefrontIcon className="h-6 w-6" />}
            />
          ) : loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/70"
                >
                  <Skeleton className="h-56 w-full" />
                  <Skeleton className="mt-5 h-5 w-24" />
                  <Skeleton className="mt-4 h-6 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyState
              title="No active listings yet"
              description="The feed is empty right now. Post the first item and give the marketplace something worth opening."
              action={
                <Link href="/sell">
                  <Button>
                    <PlusCircleIcon className="h-4 w-4" />
                    Sell an item
                  </Button>
                </Link>
              }
              icon={<StorefrontIcon className="h-6 w-6" />}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  description={listing.description}
                  price={listing.price}
                  imageUrl={listing.imageUrl}
                  category={listing.category}
                  status={listing.status}
                  createdAt={listing.createdAt}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}