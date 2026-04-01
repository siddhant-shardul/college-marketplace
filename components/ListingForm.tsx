"use client";

import {
  Field,
  SelectField,
  TextAreaField,
  Button,
  Surface,
  Alert,
} from "@/components/ui";
import { CheckCircleIcon, PhotoIcon } from "@/components/icons";

type Category = {
  id: string;
  name: string;
};

type ListingFormProps = {
  title: string;
  description: string;
  price: string;
  categoryId: string;
  categories?: Category[]; // ✅ FIX: make optional (defensive)
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  submitLabel: string;
  submittingLabel: string;
  saving: boolean;
  message?: string;
  imageInput?: React.ReactNode;
  asideTitle: string;
  asideDescription: string;
  asidePoints?: string[]; // ✅ FIX: make optional
  footerNote: string;
};

export default function ListingForm({
  title,
  description,
  price,
  categoryId,
  categories,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onCategoryChange,
  onSubmit,
  submitLabel,
  submittingLabel,
  saving,
  message,
  imageInput,
  asideTitle,
  asideDescription,
  asidePoints,
  footerNote,
}: ListingFormProps) {
  const safeCategories = categories ?? []; // ✅ FIX
  const safeAsidePoints = asidePoints ?? []; // ✅ FIX

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
      {/* LEFT SIDE */}
      <aside className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(160deg,#0f172a_0%,#111827_42%,#312e81_100%)] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_36%)]" />
        <div className="absolute -bottom-14 -left-6 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex h-full flex-col">
          <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
            Seller workspace
          </span>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {asideTitle}
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            {asideDescription}
          </p>

          <div className="mt-8 grid gap-3">
            {safeAsidePoints.length > 0 ? (
              safeAsidePoints.map((point, index) => (
                <div
                  key={`${point}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm backdrop-blur"
                >
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-indigo-100">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="leading-6 text-slate-100">{point}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No tips available.
              </p>
            )}
          </div>

          <div className="mt-auto pt-10 text-sm text-slate-300">
            {footerNote}
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE */}
      <Surface>
        <div className="border-b border-slate-200/80 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
            Listing details
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Create a polished listing
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Clear titles, honest descriptions, and strong photos get faster replies.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
          <Field
            label="Item title"
            placeholder="e.g. Casio scientific calculator"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            maxLength={80}
            hint="Keep it short and specific."
            required
          />

          <TextAreaField
            label="Description"
            placeholder="Describe condition, price, brand, etc."
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            maxLength={600}
            hint="Be direct. Buyers care about condition."
            required
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Price"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 1200"
              value={price}
              onChange={(event) => onPriceChange(event.target.value)}
              required
            />

            <SelectField
              label="Category"
              value={categoryId}
              onChange={(event) => onCategoryChange(event.target.value)}
              required
            >
              <option value="">Select category</option>

              {safeCategories.length > 0 ? (
                safeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </SelectField>
          </div>

          {imageInput && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <PhotoIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Listing image
                  </p>
                  <p className="text-sm text-slate-500">
                    JPG, PNG, or WebP up to 5 MB.
                  </p>
                </div>
              </div>
              {imageInput}
            </div>
          )}

          {message && <Alert tone="danger">{message}</Alert>}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Backend ownership checks are enforced.
            </p>

            <Button
              type="submit"
              disabled={saving}
              size="lg"
              className="w-full sm:w-auto"
            >
              {saving ? submittingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </Surface>
    </div>
  );
}