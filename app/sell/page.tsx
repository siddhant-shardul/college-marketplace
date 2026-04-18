"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ListingForm from "@/components/ListingForm";
import { Alert, PageHeader, PageShell, Skeleton } from "@/components/ui";
import { CheckCircleIcon, PlusCircleIcon } from "@/components/icons";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
};

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
    async function init() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
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

    void init();
  }, [router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setMessage("");
    setSubmitting(true);

    try {
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      const numericPrice = Number(price);

      if (!trimmedTitle) return setMessage("Title is required.");
      if (!trimmedDescription) return setMessage("Description is required.");
      if (!categoryId) return setMessage("Category is required.");
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return setMessage("Price must be greater than 0.");
      }
      if (!image) return setMessage("Image is required.");
      if (!allowedImageTypes.includes(image.type)) {
        return setMessage("Only JPG, PNG, WebP allowed.");
      }
      if (image.size > maxImageSizeInBytes) {
        return setMessage("Image must be ≤ 5MB.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const ext = image.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, image, { upsert: false });

      if (uploadError) {
        setMessage(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("listings")
        .insert([
          {
            seller_id: user.id,
            category_id: categoryId,
            title: trimmedTitle,
            description: trimmedDescription,
            price: numericPrice,
            image_url: publicUrlData.publicUrl,
            status: "active",
          },
        ])
        .select("id")
        .maybeSingle();

      if (error) {
        setMessage(`Failed to post item: ${error.message}`);
        return;
      }

      if (!data) {
        setMessage("Insert failed due to permission or validation.");
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
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Create listing"
            title="Sell something useful on campus"
            description="Loading..."
          />
          <Skeleton className="h-[500px]" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Create listing"
          title="Post an item that looks worth buying"
          description="Clean UI + strict backend validation."
          actions={
            <div className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm">
              <CheckCircleIcon className="h-4 w-4" />
              Secure + validated
            </div>
          }
        />

        {categories.length === 0 && (
          <Alert tone="danger">
            No categories found. You cannot post items.
          </Alert>
        )}

        <ListingForm
          title={title}
          description={description}
          price={price}
          categoryId={categoryId}
          categories={categories}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onPriceChange={setPrice}
          onCategoryChange={setCategoryId}
          onSubmit={handleSubmit}
          submitLabel="Publish listing"
          submittingLabel="Publishing..."
          saving={submitting}
          message={message}
          asideTitle="Listing tips"
          asideDescription="Clear photos, honest details, and a fair price help your item sell faster."
          footerNote="Images must be JPG, PNG, or WebP and 5MB or smaller."
          imageInput={
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                required
              />
              {image && <p>{image.name}</p>}
            </div>
          }
        />
      </div>
    </PageShell>
  );
}