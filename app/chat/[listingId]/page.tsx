"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Alert, Button, PageHeader, PageShell, Surface } from "@/components/ui";
import { ChatBubbleIcon } from "@/components/icons";

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
      <PageShell>
        <Surface className="mx-auto max-w-3xl p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <ChatBubbleIcon className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-slate-950">Opening conversation</h1>
          <p className="mt-2 text-sm text-slate-500">Setting up the chat and redirecting you into the message thread.</p>
        </Surface>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Chat unavailable"
          title="The conversation could not be opened"
          description="This fallback state now reads like a real product error screen instead of a plain box with two links."
        />
        <Surface className="mx-auto max-w-3xl p-8">
          <Alert tone="danger">{errorMessage || "The conversation could not be opened."}</Alert>
          {listing ? <p className="mt-4 text-sm text-slate-500">Listing: <span className="font-semibold text-slate-900">{listing.title}</span></p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={listing ? `/listings/${listing.id}` : "/"}>
              <Button>Back to listing</Button>
            </Link>
            <Link href="/messages">
              <Button variant="secondary">Go to messages</Button>
            </Link>
          </div>
        </Surface>
      </div>
    </PageShell>
  );
}
