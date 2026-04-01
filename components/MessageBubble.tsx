import { cn, formatTime } from "@/lib/format";

export default function MessageBubble({
  content,
  createdAt,
  isOwn,
}: {
  content: string;
  createdAt: string;
  isOwn: boolean;
}) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-[24px] px-4 py-3 shadow-sm sm:max-w-[70%]",
          isOwn
            ? "rounded-br-md bg-slate-950 text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-900",
        )}
      >
        <p className="whitespace-pre-line text-sm leading-6">{content}</p>
        <p className={cn("mt-2 text-right text-xs", isOwn ? "text-slate-300" : "text-slate-500")}>
          {formatTime(createdAt)}
        </p>
      </div>
    </div>
  );
}
