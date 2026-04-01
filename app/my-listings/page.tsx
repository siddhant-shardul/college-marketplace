"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import ListingCard from "@/components/ListingCard";
import { Alert, Badge, Button, EmptyState, PageHeader, PageShell, Skeleton, StatCard } from "@/components/ui";
import { CheckCircleIcon, EditIcon, PlusCircleIcon, StorefrontIcon, TrashIcon } from "@/components/icons";
import { supabase } from "@/lib/supabase";

type Listing = {
  id: string;
  title: string;
  price: number;
  status: string;
  image_url: string | null;
};

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [busyListingId, setBusyListingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyListings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, status, image_url")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setListings(data || []);
      }

      setLoading(false);
    }

    void loadMyListings();
  }, [router]);

  const stats = useMemo(() => {
    const activeCount = listings.filter((item) => item.status === "active").length;
    const soldCount = listings.filter((item) => item.status === "sold").length;

    return [
      {
        label: "Total listings",
        value: String(listings.length),
        helper: "Everything you have posted so far",
      },
      {
        label: "Active now",
        value: String(activeCount),
        helper: "Live listings buyers can still contact",
      },
      {
        label: "Marked sold",
        value: String(soldCount),
        helper: "Closed deals still visible in your dashboard",
      },
    ];
  }, [listings]);

  async function markAsSold(listingId: string) {
    setMessage("");
    setBusyListingId(listingId);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .update({ status: "sold" })
      .eq("id", listingId)
      .eq("seller_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setBusyListingId(null);
      return;
    }

    if (!data) {
      setMessage("Listing not found or you do not have permission to update it.");
      setBusyListingId(null);
      return;
    }

    setListings((prev) => prev.map((item) => (item.id === listingId ? { ...item, status: "sold" } : item)));
    setBusyListingId(null);
  }

  async function deleteListing() {
    if (!deleteTarget) return;

    setMessage("");
    setBusyListingId(deleteTarget.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .delete()
      .eq("id", deleteTarget.id)
      .eq("seller_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setBusyListingId(null);
      return;
    }

    if (!data) {
      setMessage("Listing not found or you do not have permission to delete it.");
      setBusyListingId(null);
      return;
    }

    setListings((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
    setBusyListingId(null);
  }

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader eyebrow="Seller dashboard" title="Your listings" description="Loading your seller dashboard..." />
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[360px]" />
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
          eyebrow="Seller dashboard"
          title="Manage your listings like a real product dashboard"
          description="This page now reads like a control panel instead of a plain list: stronger stats, cleaner cards, and safer destructive actions."
          actions={
            <Link href="/sell">
              <Button size="lg">
                <PlusCircleIcon className="h-4 w-4" />
                Add new listing
              </Button>
            </Link>
          }
        />

        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} helper={stat.helper} />
          ))}
        </div>

        {message ? <Alert tone="danger">{message}</Alert> : null}

        {listings.length === 0 ? (
          <EmptyState
            title="You haven’t posted anything yet"
            description="A good seller dashboard should not feel dead when it is empty. This one guides the next step clearly."
            action={
              <Link href="/sell">
                <Button>
                  <PlusCircleIcon className="h-4 w-4" />
                  Post your first item
                </Button>
              </Link>
            }
            icon={<StorefrontIcon className="h-6 w-6" />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                imageUrl={item.image_url}
                status={item.status}
                compact
                actions={
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/edit-listing/${item.id}`}>
                      <Button variant="secondary" size="sm">
                        <EditIcon className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/listings/${item.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                    {item.status === "active" ? (
                      <Button
                        size="sm"
                        onClick={() => void markAsSold(item.id)}
                        disabled={busyListingId === item.id}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        {busyListingId === item.id ? "Updating..." : "Mark sold"}
                      </Button>
                    ) : (
                      <Badge tone="warning" className="px-3 py-2 text-sm">Sold</Badge>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteTarget(item)}
                      disabled={busyListingId === item.id}
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this listing?"
        description={`This removes ${deleteTarget?.title ?? "this item"} from your dashboard. Backend ownership checks still apply.`}
        confirmLabel={busyListingId === deleteTarget?.id ? "Deleting..." : "Delete listing"}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteListing()}
      />
    </PageShell>
  );
}
