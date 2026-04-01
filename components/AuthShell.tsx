import { CheckIcon } from "@/components/icons";
import { PageShell, Surface } from "@/components/ui";

type AuthShellProps = {
  badge: string;
  heroTitle: string;
  heroDescription: string;
  heroPoints: string[];
  footerNote: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthShell({
  badge,
  heroTitle,
  heroDescription,
  heroPoints,
  footerNote,
  eyebrow,
  title,
  subtitle,
  children,
}: AuthShellProps) {
  return (
    <PageShell className="flex items-center py-10 sm:py-14">
      <Surface className="mx-auto grid max-w-6xl overflow-hidden lg:grid-cols-[1fr_0.95fr]">
        <aside className="relative overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#111827_40%,#312e81_100%)] p-8 text-white sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_35%)]" />
          <div className="absolute -right-24 top-24 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex h-full flex-col">
            <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
              {badge}
            </span>
            <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              {heroDescription}
            </p>

            <div className="mt-8 grid gap-3">
              {heroPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100 backdrop-blur">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-indigo-100">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="leading-6">{point}</span>
                </div>
              ))}
            </div>

            <p className="mt-auto pt-10 text-sm text-slate-300">{footerNote}</p>
          </div>
        </aside>

        <div className="px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </Surface>
    </PageShell>
  );
}
