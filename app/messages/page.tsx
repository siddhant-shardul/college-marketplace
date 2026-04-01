"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Alert, Badge, Button, EmptyState, PageHeader, PageShell, Skeleton, Surface } from "@/components/ui";
import { ArrowRightIcon, ChatBubbleIcon } from "@/components/icons";
import { formatRelativeTime, getInitials } from "@/lib/format";

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
  created_at: string;
};

function getListingSummary(listing: ConversationRow["listings"]) {
  if (!listing) return { title: "Listing", image_url: null };
  return Array.isArray(listing) ? listing[0] ?? { title: "Listing", image_url: null } : listing;
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
        created_at: conversation.created_at,
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
      <PageShell>
        <div className="space-y-6">
          <PageHeader eyebrow="Messages" title="Your inbox" description="Loading conversations..." />
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Messages"
          title="A cleaner conversation inbox"
          description="The messaging list now behaves like an actual inbox: stronger previews, better spacing, and clear context about your role in each conversation."
        />

        {message ? <Alert tone="danger">{message}</Alert> : null}

        {conversations.length === 0 ? (
          <EmptyState
            title="No conversations yet"
            description="Once you contact a seller or a buyer replies, the thread will show up here with stronger visual context than before."
            action={
              <Link href="/">
                <Button>
                  <ChatBubbleIcon className="h-4 w-4" />
                  Browse listings
                </Button>
              </Link>
            }
            icon={<ChatBubbleIcon className="h-6 w-6" />}
          />
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const isBuyer = currentUserId === conversation.buyer_id;
              const titleInitials = getInitials(conversation.title);

              return (
                <Link key={conversation.id} href={`/messages/${conversation.id}`} className="block">
                  <Surface className="p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)] sm:p-5">
                    <div className="flex items-center gap-4">
                      {conversation.image_url ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
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
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600">
                          {titleInitials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg">{conversation.title}</h2>
                          <Badge tone={isBuyer ? "brand" : "neutral"}>{isBuyer ? "You are buying" : "You are selling"}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">Opened {formatRelativeTime(conversation.created_at)}</p>
                      </div>

                      <div className="hidden items-center gap-2 text-sm font-semibold text-slate-700 sm:flex">
                        Open thread
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </Surface>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
