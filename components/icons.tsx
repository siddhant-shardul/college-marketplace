import { cn } from "@/lib/format";

type IconProps = {
  className?: string;
};

function base(className?: string) {
  return cn("h-5 w-5 shrink-0", className);
}

export function StorefrontIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <path d="M4 10.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8.5" />
      <path d="M3 10.5 4.8 4.9A1.5 1.5 0 0 1 6.2 4h11.6a1.5 1.5 0 0 1 1.4.9L21 10.5" />
      <path d="M3 10.5a3 3 0 0 0 6 0" />
      <path d="M9 10.5a3 3 0 0 0 6 0" />
      <path d="M15 10.5a3 3 0 0 0 6 0" />
    </svg>
  );
}

export function PlusCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function ChatBubbleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <path d="M7 18.8 3.8 20l1.2-3.2A8 8 0 1 1 20 12a8 8 0 0 1-13 6.8Z" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={base(className)}>
      <path d="m5 12 4 4L19 7" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.6 2.8 16.5A2 2 0 0 0 4.5 19h15a2 2 0 0 0 1.7-3l-7.5-12.4a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <path d="M12 20h9" />
      <path d="m16.5 3.5 4 4L8 20l-5 1 1-5 12.5-12.5Z" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14a1 1 0 0 1-1 .9H7a1 1 0 0 1-1-.9L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.3 2.3 4.8-5.3" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function PhotoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base(className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 15-4.5-4.5L8 19" />
    </svg>
  );
}
