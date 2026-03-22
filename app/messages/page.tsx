"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  listings: { title: string; image_url: string | null } | { title: string; image_url: string | null }[] | null;
};

type ConversationCard = {
  id: string;
  buyer_id: string;
  seller_id: string;
  title: string;
  image_url: string | null;
};

function getListingSummary(listing: ConversationRow["listings"]) {
  if (!listing) {
    return { title: "Listing", image_url: null };
  }

  return Array.isArray(listing) ? (listing[0] ?? { title: "Listing", image_url: null }) : listing;
}

export default function MessagesInboxPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState<ConversationCard[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
          id,
          listing_id,
          buyer_id,
          seller_id,
          created_at,
          listings (
            title,
            image_url
          )
        `,
      )
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Failed to load conversations: ${error.message}`);
      setConversations([]);
      setLoading(false);
      return;
    }

    const normalized = ((data as ConversationRow[] | null) ?? []).map((conversation) => {
      const listingSummary = getListingSummary(conversation.listings);

      return {
        id: conversation.id,
        buyer_id: conversation.buyer_id,
        seller_id: conversation.seller_id,
        title: listingSummary.title,
        image_url: listingSummary.image_url,
      };
    });

    setConversations(normalized);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConversations();
  }, [loadConversations]);

  if (loading) {
    return (
      <section className="p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm">
          Loading conversations...
        </div>
      </section>
    );
  }

  return (
    <section className="p-6">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Your Messages</h1>
        <p className="mt-2 text-sm text-slate-500">
          Open a conversation to continue chatting with a buyer or seller.
        </p>

        {message && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {conversations.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No conversations yet.
            </div>
          ) : (
            conversations.map((conversation) => {
              const isBuyer = currentUserId === conversation.buyer_id;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 rounded-2xl border p-4 transition hover:shadow">
                    {conversation.image_url ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={conversation.image_url}
                          alt={conversation.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-200 text-xs text-slate-600">
                        No Image
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {conversation.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {isBuyer ? "You are the buyer" : "You are the seller"}
                      </p>
                    </div>

                    <span className="text-sm text-slate-400">→</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
