"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ListingContact = {
  id: string;
  title: string;
  status: string;
  seller_id: string | null;
};

export default function ChatPage() {
  const params = useParams<{ listingId: string }>();
  const router = useRouter();
  const listingId = params.listingId;

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [listing, setListing] = useState<ListingContact | null>(null);

  useEffect(() => {
    async function startOrResumeConversation() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("id, title, status, seller_id")
        .eq("id", listingId)
        .maybeSingle();

      if (listingError || !listingData) {
        setErrorMessage("Listing not found.");
        setLoading(false);
        return;
      }

      const typedListing = listingData as ListingContact;
      setListing(typedListing);

      if (!typedListing.seller_id) {
        setErrorMessage("Seller information is missing for this listing.");
        setLoading(false);
        return;
      }

      if (typedListing.status !== "active") {
        setErrorMessage("This listing is no longer active.");
        setLoading(false);
        return;
      }

      if (typedListing.seller_id === user.id) {
        setErrorMessage("You cannot start a chat for your own listing.");
        setLoading(false);
        return;
      }

      const { data: existingConversation, error: existingError } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", typedListing.id)
        .eq("buyer_id", user.id)
        .maybeSingle();

      if (existingError) {
        setErrorMessage(`Failed to load chat: ${existingError.message}`);
        setLoading(false);
        return;
      }

      if (existingConversation) {
        router.replace(`/messages/${existingConversation.id}`);
        return;
      }

      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert([
          {
            listing_id: typedListing.id,
            buyer_id: user.id,
            seller_id: typedListing.seller_id,
          },
        ])
        .select("id")
        .single();

      if (createError) {
        setErrorMessage(`Failed to start chat: ${createError.message}`);
        setLoading(false);
        return;
      }

      router.replace(`/messages/${newConversation.id}`);
    }

    if (listingId) {
      void startOrResumeConversation();
    }
  }, [listingId, router]);

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          Opening chat...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Chat unavailable</h1>
        <p className="mt-3 text-slate-600">
          {errorMessage || "The conversation could not be opened."}
        </p>
        {listing && (
          <p className="mt-2 text-sm text-slate-500">
            Listing: <strong>{listing.title}</strong>
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={listing ? `/listings/${listing.id}` : "/"}
            className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to listing
          </Link>
          <Link
            href="/messages"
            className="inline-flex rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Go to messages
          </Link>
        </div>
      </div>
    </section>
  );
}
