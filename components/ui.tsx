import * as React from "react";
import { cn } from "@/lib/format";
import { AlertIcon, ChevronDownIcon } from "@/components/icons";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function PageShell({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section className={cn("min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_32%),linear-gradient(to_bottom_right,_#f8fafc,_#eef2ff_45%,_#f8fafc)] px-4 py-8 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function Surface({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("rounded-[28px] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 backdrop-blur", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 backdrop-blur sm:p-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function Button({ className, variant = "primary", size = "md", type = "button", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-slate-950 text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800 focus-visible:ring-slate-900/20",
    secondary: "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-slate-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200",
    danger: "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 focus-visible:ring-rose-500/30",
  } as const;

  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-5 text-sm sm:px-6",
  } as const;

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function Badge({ children, tone = "neutral", className }: React.PropsWithChildren<{ tone?: "neutral" | "success" | "warning" | "brand"; className?: string }>) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700 ring-slate-200",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warning: "bg-amber-50 text-amber-700 ring-amber-200",
    brand: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  } as const;

  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1", tones[tone], className)}>{children}</span>;
}

export function Alert({ children, tone = "neutral", className }: React.PropsWithChildren<{ tone?: "neutral" | "danger" | "success"; className?: string }>) {
  const tones = {
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  } as const;

  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm", tones[tone], className)}>
      <AlertIcon className="mt-0.5 h-4 w-4" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-sm">
      {icon ? <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">{icon}</div> : null}
      <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200/70", className)} />;
}

export const Field = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}>(({ className, label, hint, error, id, ...props }, ref) => {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4",
          error ? "border-rose-300 focus:border-rose-300 focus:ring-rose-500/10" : "border-slate-200 focus:border-indigo-300 focus:ring-indigo-500/10",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-sm text-rose-600">{error}</span> : hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
});
Field.displayName = "Field";

export function TextAreaField({ label, hint, error, className, id, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) {
  const textareaId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="block space-y-2" htmlFor={textareaId}>
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <textarea
        id={textareaId}
        className={cn(
          "min-h-36 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4",
          error ? "border-rose-300 focus:border-rose-300 focus:ring-rose-500/10" : "border-slate-200 focus:border-indigo-300 focus:ring-indigo-500/10",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-sm text-rose-600">{error}</span> : hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function SelectField({ label, hint, error, className, id, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  const selectId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="block space-y-2" htmlFor={selectId}>
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full appearance-none rounded-2xl border bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-950 shadow-sm outline-none transition focus:bg-white focus:ring-4",
            error ? "border-rose-300 focus:border-rose-300 focus:ring-rose-500/10" : "border-slate-200 focus:border-indigo-300 focus:ring-indigo-500/10",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
      {error ? <span className="text-sm text-rose-600">{error}</span> : hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </div>
  );
}
