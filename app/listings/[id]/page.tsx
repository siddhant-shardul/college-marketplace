"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Alert, Badge, Button, EmptyState, PageHeader, PageShell, Skeleton, Surface } from "@/components/ui";
import { ChatBubbleIcon, CheckCircleIcon, PhotoIcon } from "@/components/icons";
import { formatCurrency, formatShortDate } from "@/lib/format";

type ListingQueryRow = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  status: string;
  created_at: string;
  categories: { name: string } | { name: string }[] | null;
};

type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  status: string;
  created_at: string;
  category_name: string | null;
};

function getCategoryName(categories: ListingQueryRow["categories"]) {
  if (!categories) return null;
  return Array.isArray(categories) ? categories[0]?.name ?? null : categories.name;
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const listingId = params.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [startingConversation, setStartingConversation] = useState(false);

  const fetchListing = useCallback(async () => {
    if (!listingId) {
      setListing(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("listings")
      .select(
        `
          id,
          seller_id,
          title,
          description,
          price,
          image_url,
          status,
          created_at,
          categories ( name )
        `,
      )
      .eq("id", listingId)
      .maybeSingle();

    if (error || !data) {
      setMessage("Failed to load listing.");
      setListing(null);
      setLoading(false);
      return;
    }

    const row = data as ListingQueryRow;
    setListing({
      id: row.id,
      seller_id: row.seller_id,
      title: row.title,
      description: row.description,
      price: row.price,
      image_url: row.image_url,
      status: row.status,
      created_at: row.created_at,
      category_name: getCategoryName(row.categories),
    });
    setLoading(false);
  }, [listingId]);

  useEffect(() => {
    void fetchListing();
  }, [fetchListing]);

  async function handleContactSeller() {
    if (!listing) return;

    setMessage("");
    setStartingConversation(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (user.id === listing.seller_id) {
        setMessage("You cannot start a conversation on your own listing.");
        return;
      }

      const { data: existingConversation, error: existingError } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listing.id)
        .eq("buyer_id", user.id)
        .maybeSingle();

      if (existingError) {
        setMessage("Failed to check existing conversation.");
        return;
      }

      if (existingConversation) {
        router.push(`/messages/${existingConversation.id}`);
        return;
      }

      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert([
          {
            listing_id: listing.id,
            buyer_id: user.id,
            seller_id: listing.seller_id,
          },
        ])
        .select("id")
        .single();

      if (createError) {
        setMessage(`Failed to start conversation: ${createError.message}`);
        return;
      }

      router.push(`/messages/${newConversation.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to contact seller.");
    } finally {
      setStartingConversation(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-[420px]" />
          <Skeleton className="h-[420px]" />
        </div>
      </PageShell>
    );
  }

  if (!listing) {
    return (
      <PageShell>
        <EmptyState
          title="Listing not found"
          description={message || "The item could not be loaded."}
          action={<Button onClick={() => router.push("/")}>Back to marketplace</Button>}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow={listing.category_name ?? "Listing"}
          title={listing.title}
          description="The detail page now uses clearer product hierarchy, stronger image treatment, and a cleaner action panel for messaging."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Surface className="overflow-hidden p-3">
            {listing.image_url ? (
              <div className="relative h-[320px] overflow-hidden rounded-[24px] bg-slate-100 sm:h-[520px]">
                <Image
                  src={listing.image_url}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-[320px] items-center justify-center rounded-[24px] bg-slate-100 text-slate-500 sm:h-[520px]">
                <div className="flex flex-col items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
                    <PhotoIcon className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-medium">No image available</p>
                </div>
              </div>
            )}
          </Surface>

          <Surface className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {listing.category_name ? <Badge tone="brand">{listing.category_name}</Badge> : null}
              <Badge tone={listing.status === "active" ? "success" : "warning"}>{listing.status}</Badge>
              <span className="text-sm text-slate-500">Posted {formatShortDate(listing.created_at)}</span>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">{formatCurrency(listing.price)}</p>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">{listing.description}</p>

            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <ChatBubbleIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-950">Contact the seller</p>
                  <p className="text-sm text-slate-500">Start a conversation without leaving the marketplace.</p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleContactSeller}
                disabled={startingConversation || listing.status !== "active"}
                size="lg"
                className="mt-5 w-full"
              >
                {startingConversation ? "Opening chat..." : "Message seller"}
              </Button>

              {listing.status !== "active" ? (
                <p className="mt-3 text-sm text-rose-600">This listing is not currently available for new conversations.</p>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                  Messaging is kept inside the app.
                </div>
              )}
            </div>

            {message ? <Alert tone="danger" className="mt-5">{message}</Alert> : null}
          </Surface>
        </div>
      </div>
    </PageShell>
  );
}
