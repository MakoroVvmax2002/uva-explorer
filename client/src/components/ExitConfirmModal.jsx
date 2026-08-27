import { LogOut, AlertTriangle, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ExitConfirmModal({ isOpen, onClose, onConfirmExit }) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        {/* Warning Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
          <AlertTriangle size={28} />
        </div>

        {/* Content */}
        <div className="mt-5 text-center">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Are you sure you want to exit?
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Exiting will reset your active tourist session name and return you to the welcome screen.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={onConfirmExit}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-rose-600 py-3 text-xs font-bold text-white shadow-md transition hover:bg-rose-700 active:scale-98"
          >
            <LogOut size={15} />
            <span>Yes, Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExitConfirmModal;
