"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

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

    if (
      typedConversation.buyer_id !== user.id &&
      typedConversation.seller_id !== user.id
    ) {
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

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

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

  if (loading) {
    return (
      <section className="p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
          Loading conversation...
        </div>
      </section>
    );
  }

  return (
    <section className="p-6">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
            <p className="mt-1 text-sm text-slate-500">
              Continue your conversation here.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/messages")}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {messages.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No messages yet. Start the conversation.
            </div>
          ) : (
            messages.map((item) => {
              const isOwnMessage = item.sender_id === currentUserId;

              return (
                <div
                  key={item.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    isOwnMessage
                      ? "ml-auto bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {item.content}
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </section>
  );
}
