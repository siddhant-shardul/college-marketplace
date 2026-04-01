export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diff = date.getTime() - Date.now();
  const seconds = Math.round(diff / 1000);
  const absSeconds = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 60) return formatter.format(seconds, "second");
  if (absSeconds < 3600) return formatter.format(Math.round(seconds / 60), "minute");
  if (absSeconds < 86400) return formatter.format(Math.round(seconds / 3600), "hour");
  if (absSeconds < 604800) return formatter.format(Math.round(seconds / 86400), "day");

  return formatShortDate(value);
}

export function getInitials(input: string | null | undefined) {
  if (!input) return "CM";

  const parts = input.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "CM";

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "CM";
}
