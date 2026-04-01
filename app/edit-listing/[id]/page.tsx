"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ListingForm from "@/components/ListingForm";
import { Alert, PageHeader, PageShell, Skeleton } from "@/components/ui";
import { CheckCircleIcon } from "@/components/icons";
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

      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("id, name").order("name", { ascending: true });

      if (categoriesError) {
        setMessage(categoriesError.message);
      } else {
        setCategories(categoriesData || []);
      }

      setLoading(false);
    }

    if (listingId) {
      void loadData();
    }
  }, [listingId, router]);

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

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
      setMessage(error instanceof Error ? error.message : "Failed to update listing.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader eyebrow="Edit listing" title="Update your listing" description="Loading the listing and category options..." />
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <Skeleton className="h-[520px]" />
            <Skeleton className="h-[520px]" />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Edit listing"
          title="Refine the details without touching ownership rules"
          description="The edit flow now matches the seller workspace visually while keeping the existing permission checks intact."
          actions={
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircleIcon className="h-4 w-4" />
              Owner-only edits remain enforced
            </div>
          }
        />

        {message && categories.length === 0 ? <Alert tone="danger">{message}</Alert> : null}

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
          onSubmit={handleUpdate}
          submitLabel="Save changes"
          submittingLabel="Saving..."
          saving={saving}
          message={categories.length > 0 ? message : ""}
          asideTitle="Clean up the listing without starting over."
          asideDescription="The editing surface uses the same visual system as creation so sellers don’t relearn the UI every time they update a post."
          asidePoints={[
            "The form keeps the same spacing and hierarchy as the sell flow",
            "Errors stay visible near the action instead of getting lost in plain text",
            "No client-side ownership leak remains in the data fetch path",
          ]}
          footerNote="The UI is new. The ownership filters and backend enforcement stay the same."
        />
      </div>
    </PageShell>
  );
}
