"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
};

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
};

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const listingId = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!listingId) {
        router.replace("/my-listings");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("id, title, description, price, category_id")
        .eq("id", listingId)
        .eq("seller_id", user.id)
        .maybeSingle<Listing>();

      if (listingError || !listing) {
        setMessage("Listing not found or you do not have permission to edit it.");
        setLoading(false);
        return;
      }

      setTitle(listing.title);
      setDescription(listing.description);
      setPrice(String(listing.price));
      setCategoryId(listing.category_id);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (categoriesError) {
        setMessage(categoriesError.message);
      } else {
        setCategories(categoriesData || []);
      }

      setLoading(false);
    }

    loadData();
  }, [listingId, router]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      if (!listingId) {
        setMessage("Invalid listing ID.");
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      const numericPrice = Number(price);

      if (!trimmedTitle) {
        setMessage("Title is required.");
        return;
      }

      if (!trimmedDescription) {
        setMessage("Description is required.");
        return;
      }

      if (!categoryId) {
        setMessage("Category is required.");
        return;
      }

      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        setMessage("Price must be a number greater than 0.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .update({
          title: trimmedTitle,
          description: trimmedDescription,
          price: numericPrice,
          category_id: categoryId,
        })
        .eq("id", listingId)
        .eq("seller_id", user.id)
        .select("id")
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data) {
        setMessage("Listing not found or you do not have permission to edit it.");
        return;
      }

      router.push("/my-listings");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update listing."
      );
    } finally {
      setSaving(false); // ✅ ALWAYS runs
    }
  }

  if (loading) {
    return <p className="p-6">Loading listing...</p>;
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Listing</h1>
        <p className="mt-2 text-gray-600">Update your item details.</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Item Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Price</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}