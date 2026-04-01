import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, PhotoIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/format";

type ListingCardProps = {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl: string | null;
  category?: string | null;
  status?: string | null;
  createdAt?: string | null;
  compact?: boolean;
  actions?: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function ListingCard({
  id,
  title,
  description,
  price,
  imageUrl,
  category,
  status,
  createdAt,
  compact = false,
  actions,
  ctaLabel = "View details",
  ctaHref,
}: ListingCardProps) {
  const statusTone = status === "sold" ? "warning" : "success";

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_16px_48px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className={cn("relative bg-slate-100", compact ? "h-52" : "h-60")}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes={compact ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 1280px) 50vw, 33vw"}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                <PhotoIcon className="h-6 w-6" />
              </span>
              <span className="text-sm font-medium">No image added</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {category ? <Badge tone="brand">{category}</Badge> : null}
          {status ? <Badge tone={statusTone}>{status}</Badge> : null}
          {createdAt ? <span className="text-xs font-medium text-slate-500">{formatRelativeTime(createdAt)}</span> : null}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-950 sm:text-xl">{title}</h3>
            {description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
          <p className="whitespace-nowrap text-lg font-semibold text-slate-950 sm:text-xl">{formatCurrency(price)}</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {actions ?? (
            <Link
              href={ctaHref ?? `/listings/${id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-indigo-600"
            >
              {ctaLabel}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
