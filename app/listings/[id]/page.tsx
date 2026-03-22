"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
  if (!categories) {
    return null;
  }

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
        categories (
          name
        )
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
      setMessage(
        error instanceof Error ? error.message : "Failed to contact seller.",
      );
    } finally {
      setStartingConversation(false);
    }
  }

  if (loading) {
    return (
      <section className="p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm">
          Loading listing...
        </div>
      </section>
    );
  }

  if (!listing) {
    return (
      <section className="p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm">
          Listing not found.
        </div>
      </section>
    );
  }

  return (
    <section className="p-6">
      <div className="mx-auto grid max-w-5xl gap-8 rounded-3xl border bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          {listing.image_url ? (
            <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={listing.image_url}
                alt={listing.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-96 w-full items-center justify-center rounded-2xl bg-slate-200 text-slate-600">
              No image available
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm text-slate-500">
            {listing.category_name || "Unknown category"}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">{listing.title}</h1>

          <p className="mt-4 text-2xl font-semibold text-slate-900">₹{listing.price}</p>

          <p className="mt-3 inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            Status: {listing.status}
          </p>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Description</h2>
            <p className="mt-2 whitespace-pre-line leading-7 text-slate-600">
              {listing.description}
            </p>
          </div>

          <button
            type="button"
            onClick={handleContactSeller}
            disabled={startingConversation || listing.status !== "active"}
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {startingConversation ? "Opening chat..." : "Contact Seller"}
          </button>

          {listing.status !== "active" && (
            <p className="mt-3 text-sm text-red-600">
              This listing is not currently available for new conversations.
            </p>
          )}

          {message && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
