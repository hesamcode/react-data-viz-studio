/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Button from "./Button";

const ToastContext = createContext(null);

function toastStyle(kind) {
  if (kind === "error") {
    return "border-red-500/40 bg-red-500/10 text-red-100";
  }

  if (kind === "success") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-100";
  }

  return "border-slate-600 bg-slate-800/80 text-slate-100";
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutMapRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timeoutId = timeoutMapRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutMapRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    ({ title, description, kind = "info", duration = 3200 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      setToasts((current) => [...current, { id, title, description, kind }]);

      const timeoutId = window.setTimeout(() => removeToast(id), duration);
      timeoutMapRef.current.set(id, timeoutId);
      return id;
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      removeToast,
    }),
    [pushToast, removeToast, toasts],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}

export function ToastViewport() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-2xl backdrop-blur ${toastStyle(toast.kind)}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-xs opacity-90">{toast.description}</p> : null}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 rounded-md p-0 text-slate-200 hover:bg-slate-700"
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
            >
              <span aria-hidden="true">✕</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
