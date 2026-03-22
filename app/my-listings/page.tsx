"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  async function markAsSold(listingId: string) {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase
      .from("listings")
      .update({ status: "sold" })
      .eq("id", listingId)
      .eq("seller_id", user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId ? { ...item, status: "sold" } : item,
      ),
    );
  }

  async function deleteListing(listingId: string) {
    const confirmDelete = confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId)
      .eq("seller_id", user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setListings((prev) => prev.filter((item) => item.id !== listingId));
  }

  if (loading) {
    return <p className="p-6">Loading your listings...</p>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="mt-2 text-gray-600">Manage the items you posted for sale.</p>
        </div>

        <Link
          href="/sell"
          className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Add New Item
        </Link>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold">No listings yet</h2>
          <p className="mt-2 text-gray-600">You haven’t posted anything yet.</p>
          <Link
            href="/sell"
            className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Post your first item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              {item.image_url ? (
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                  No image
                </div>
              )}

              <div className="p-4">
                <h2 className="line-clamp-1 text-lg font-semibold">{item.title}</h2>

                <p className="mt-2 text-2xl font-bold text-green-600">₹{item.price}</p>

                <p className="mt-2 text-sm text-gray-500">Status: {item.status}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/edit-listing/${item.id}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Edit
                  </Link>

                  <Link
                    href={`/listings/${item.id}`}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    View
                  </Link>

                  {item.status === "active" && (
                    <button
                      type="button"
                      onClick={() => markAsSold(item.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                    >
                      Sold
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteListing(item.id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
