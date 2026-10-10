import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from "lucide-react";

const ToastContext = createContext({
  showToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Global Toast Container - Bottom Right */}
      <div className="fixed bottom-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl p-4 shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 transition-all ${
              t.type === "success"
                ? "bg-slate-900/95 text-white border-teal-500/30 dark:bg-slate-900/95 dark:text-white dark:border-teal-400/40"
                : t.type === "error"
                ? "bg-rose-950/95 text-rose-100 border-rose-500/30 dark:bg-rose-950/95"
                : "bg-slate-900/95 text-slate-100 border-slate-700/50"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {t.type === "success" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                  <CheckCircle2 size={18} />
                </div>
              )}
              {t.type === "error" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                  <AlertCircle size={18} />
                </div>
              )}
              {t.type === "info" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Info size={18} />
                </div>
              )}
              <span className="text-xs font-bold leading-snug">{t.message}</span>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
