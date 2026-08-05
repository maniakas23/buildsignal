import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

let toastId = 0;
const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

function notify(type: Toast["type"], message: string) {
  const id = `${++toastId}`;
  toasts = [...toasts, { id, type, message }];
  listeners.forEach((l) => l([...toasts]));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l([...toasts]));
  }, 5000);
}

export const toast = {
  success: (message: string) => notify("success", message),
  error: (message: string) => notify("error", message),
  info: (message: string) => notify("info", message),
};

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.add(setCurrentToasts);
    return () => listeners.delete(setCurrentToasts);
  }, []);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle,
  };

  const colors = {
    success: "bg-green-50 text-green-600 border-green-200",
    error: "bg-red-50 text-red-600 border-red-200",
    info: "bg-blue-50 text-blue-600 border-blue-200",
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {currentToasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg ${colors[t.type]}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
