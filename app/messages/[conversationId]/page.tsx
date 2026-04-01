"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MessageBubble from "@/components/MessageBubble";
import { Alert, Button, EmptyState, Field, PageHeader, PageShell, Skeleton, Surface } from "@/components/ui";
import { ArrowRightIcon, ChatBubbleIcon } from "@/components/icons";
import { supabase } from "@/lib/supabase";
import { formatShortDate } from "@/lib/format";

type MessageRow = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ConversationRow = {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
};

export default function MessagesPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const conversationId = params.conversationId;
  const endRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationRow | null>(null);

  const loadConversation = useCallback(async () => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

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

    const { data: conversationData, error: conversationError } = await supabase
      .from("conversations")
      .select("id, buyer_id, seller_id, listing_id")
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError || !conversationData) {
      setMessage("Conversation not found.");
      setLoading(false);
      return;
    }

    const typedConversation = conversationData as ConversationRow;
    setConversation(typedConversation);

    if (typedConversation.buyer_id !== user.id && typedConversation.seller_id !== user.id) {
      setMessage("You are not allowed to view this conversation.");
      setLoading(false);
      return;
    }

    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("id, sender_id, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      setMessage(`Failed to load messages: ${messagesError.message}`);
      setLoading(false);
      return;
    }

    setMessages((messagesData as MessageRow[] | null) ?? []);
    setLoading(false);
  }, [conversationId, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setMessage("Message cannot be empty.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    setSending(true);
    setMessage("");

    const { error } = await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender_id: user.id,
        content: trimmedContent,
      },
    ]);

    if (error) {
      setMessage(`Failed to send message: ${error.message}`);
      setSending(false);
      return;
    }

    setContent("");
    await loadConversation();
    setSending(false);
  }

  const groupedDate = useMemo(() => {
    if (messages.length === 0) return "";
    return formatShortDate(messages[messages.length - 1]?.created_at);
  }, [messages]);

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader eyebrow="Conversation" title="Messages" description="Loading thread..." />
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Skeleton className="hidden h-[620px] lg:block" />
            <Skeleton className="h-[620px]" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!conversation) {
    return (
      <PageShell>
        <EmptyState title="Conversation unavailable" description={message || "This thread could not be loaded."} action={<Button onClick={() => router.push("/messages")}>Back to inbox</Button>} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <Surface className="hidden p-6 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">Messaging UI</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">A real chat layout, finally</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            The thread now has proper alignment, readable bubbles, timestamps, and clearer action placement instead of a plain stack of boxes.
          </p>

          <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
            <p className="text-sm font-semibold text-slate-950">Conversation tips</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              <li>Keep replies short and specific when closing a deal.</li>
              <li>Use the detail page to re-check price and condition before sending an offer.</li>
              <li>The backend still controls who can see and send messages in this thread.</li>
            </ul>
          </div>
        </Surface>

        <Surface className="flex min-h-[70vh] flex-col overflow-hidden">
          <div className="border-b border-slate-200/80 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">Conversation</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Direct messages</h2>
                <p className="mt-2 text-sm text-slate-500">{groupedDate ? `Latest activity ${groupedDate}` : "Start the conversation."}</p>
              </div>
              <Button variant="secondary" onClick={() => router.push("/messages")}>
                Inbox
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
            {message ? <Alert tone="danger" className="mt-4">{message}</Alert> : null}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-5 sm:px-6 sm:py-6">
            {messages.length === 0 ? (
              <EmptyState
                title="No messages yet"
                description="The first message sets the tone. Keep it short, direct, and useful."
                icon={<ChatBubbleIcon className="h-6 w-6" />}
              />
            ) : (
              messages.map((item) => (
                <MessageBubble key={item.id} content={item.content} createdAt={item.created_at} isOwn={item.sender_id === currentUserId} />
              ))
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-slate-200/80 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Field
                label="New message"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Type your message..."
                className="sm:flex-1"
              />
              <div className="sm:pt-[1.85rem]">
                <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                  {sending ? "Sending..." : "Send message"}
                </Button>
              </div>
            </div>
          </form>
        </Surface>
      </div>
    </PageShell>
  );
}
