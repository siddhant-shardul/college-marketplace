import { Button } from "@/components/ui";
import { TrashIcon } from "@/components/icons";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.20)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <TrashIcon />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} className="w-full sm:w-auto">{cancelLabel}</Button>
          <Button variant="danger" onClick={onConfirm} className="w-full sm:w-auto">{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
