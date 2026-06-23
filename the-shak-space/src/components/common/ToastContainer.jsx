import { useToastStore } from "../../stores/useToastStore";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`px-4 py-3 rounded-xl border text-sm shadow-lg backdrop-blur-md ${
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
              : "bg-red-500/15 border-red-500/40 text-red-200"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-white/70 hover:text-white cursor-pointer"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
