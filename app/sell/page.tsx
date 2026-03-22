"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
};

const shell =
  "min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_30%),linear-gradient(to_bottom_right,_#f8fafc,_#eef2ff_45%,_#f8fafc)] px-4 py-8 sm:px-6 lg:px-8";

const panel =
  "overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur";

const inputBase =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

const labelBase = "block text-sm font-medium text-slate-700";

const buttonBase =
  "inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSizeInBytes = 5 * 1024 * 1024;

export default function SellPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkUserAndFetchCategories() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        setMessage(`Failed to load categories: ${error.message}`);
      } else {
        setCategories(data || []);
      }

      setLoading(false);
    }

    checkUserAndFetchCategories();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submitting) return;

    setMessage("");
    setSubmitting(true);

    try {
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

      if (!image) {
        setMessage("Image is required.");
        return;
      }

      if (!allowedImageTypes.includes(image.type)) {
        setMessage("Only JPG, PNG, and WebP images are allowed.");
        return;
      }

      if (image.size > maxImageSizeInBytes) {
        setMessage("Image size must be 5 MB or less.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You must be logged in.");
        router.replace("/login");
        return;
      }

      const safeExtension = image.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setMessage(`Failed to upload image: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const { error } = await supabase.from("listings").insert([
        {
          seller_id: user.id,
          category_id: categoryId,
          title: trimmedTitle,
          description: trimmedDescription,
          price: numericPrice,
          image_url: imageUrl,
          status: "active",
        },
      ]);

      if (error) {
        setMessage(`Failed to post item: ${error.message}`);
        return;
      }

      setTitle("");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      router.push("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to post item.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className={shell}>
        <div className="mx-auto flex max-w-6xl items-center justify-center py-24">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-sm">
            Checking authentication...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={shell}>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <aside className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_30%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />

          <div className="relative flex h-full flex-col">
            <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 shadow-sm">
              Seller dashboard
            </div>

            <h1 className="mt-5 max-w-md text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Post an item in minutes.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Add a clear title, upload a good image, choose the right category,
              and set a fair price. Clean listings convert faster.
            </p>

            <div className="mt-8 grid gap-4 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="font-semibold text-white">Use a strong image</p>
                <p className="mt-1 leading-6 text-slate-300">
                  Bright, clear photos make your listing look trustworthy.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="font-semibold text-white">Price it realistically</p>
                <p className="mt-1 leading-6 text-slate-300">
                  Fair pricing gets more replies and fewer stale listings.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="font-semibold text-white">Pick the right category</p>
                <p className="mt-1 leading-6 text-slate-300">
                  Accurate categorization helps buyers find your item quickly.
                </p>
              </div>
            </div>

            <div className="mt-auto hidden pt-10 lg:block">
              <div className="rounded-3xl border border-white/10 bg-white/8 px-5 py-4 text-sm text-slate-200 backdrop-blur">
                Keep the listing simple, honest, and visually clear.
              </div>
            </div>
          </div>
        </aside>

        <div className={panel}>
          <div className="border-b border-slate-200/80 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Create listing
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Sell an Item
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Fill in the details below to publish a new listing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8">
            <div>
              <label className={labelBase}>Item Title</label>
              <input
                type="text"
                placeholder="e.g. Scientific Calculator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputBase}
                required
              />
            </div>

            <div>
              <label className={labelBase}>Description</label>
              <textarea
                placeholder="Describe the condition, brand, and useful details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputBase} min-h-40 resize-y`}
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelBase}>Price</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="e.g. 500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputBase}
                  required
                />
              </div>

              <div>
                <label className={labelBase}>Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`${inputBase} appearance-none`}
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
            </div>

            <div>
              <label className={labelBase}>Item Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={`${inputBase} cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800`}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImage(e.target.files[0]);
                  } else {
                    setImage(null);
                  }
                }}
                required
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Required. JPG, PNG, or WebP. Maximum size: 5 MB.
              </p>
            </div>

            <button type="submit" className={buttonBase} disabled={submitting}>
              {submitting ? "Posting item..." : "Post Item"}
            </button>
          </form>

          {message && (
            <div className="mx-6 mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm sm:mx-8">
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}