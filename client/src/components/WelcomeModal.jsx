import { useState } from "react";
import { Compass, Sparkles, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { logUserActivity } from "../services/userLogService";

function WelcomeModal({ visitorName, onSaveName }) {
  const [nameInput, setNameInput] = useState(visitorName || "");
  const { isDark, setTheme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = nameInput.trim() || "Visitor";
    localStorage.setItem("visitorName", finalName);

    const defaultMapsUrl = "https://www.google.com/maps?q=6.87676,81.06076";

    // Attempt HTML5 Geolocation to get exact Google Maps coordinates link
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          logUserActivity({ userName: finalName, location: mapsUrl });
        },
        () => {
          logUserActivity({ userName: finalName, location: defaultMapsUrl });
        },
        { timeout: 4000 }
      );
    } else {
      logUserActivity({ userName: finalName, location: defaultMapsUrl });
    }

    onSaveName(finalName);
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md dark:bg-slate-950/90 transition-colors duration-300">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute left-1/4 top-1/4 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

      {/* ENTER YOUR NAME FORM */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 transition-colors duration-300">
        {/* Theme Toggle Button in top right */}
        <button
          onClick={toggleTheme}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
        </button>

        {/* Logo */}
        <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1F3952] shadow-md border-2 border-teal-500/40">
          <img src="/images/logo.png" alt="Uva Explore Logo" className="h-full w-full object-cover scale-[1.38]" />
        </div>

        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 border border-teal-200/80 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20">
            <Sparkles size={13} /> Welcome to Uva Explorer
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Enter Your Name
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Please enter your name to personalize your travel experience across Uva Province.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Name
            </label>
            <input
              type="text"
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Kasun Perera"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 py-4 text-sm font-bold text-white shadow-lg transition hover:from-teal-500 hover:to-emerald-500 active:scale-98"
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default WelcomeModal;
