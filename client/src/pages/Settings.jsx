import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Globe2,
  Palette,
  Bell,
  Map,
  Save,
  RotateCcw,
  Check,
  Info,
  Sun,
  Moon,
  Sparkles,
  UserCheck,
  Cpu,
} from "lucide-react";

const DEFAULT_SETTINGS = {
  siteName: "Uva Explorer",
  province: "Uva",
  defaultDistrict: "Badulla",
  defaultCategory: "Sightseeing",

  theme: "light",

  showRatings: false,
  showReviews: false,
  compactLayout: false,

  notifications: true,
  newPlaceNotifications: true,

  showTouristPlaces: true,
  showFacilities: true,
};

const SETTINGS_KEY = "uvaExplorerSettings";

/* ============================================================
   GLOBAL THEME
============================================================ */

function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/* ============================================================
   SETTINGS
============================================================ */

function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  /* ============================================================
     LOAD SETTINGS
  ============================================================ */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        const merged = {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };

        setSettings(merged);

        applyTheme(merged.theme);
      } else {
        applyTheme(DEFAULT_SETTINGS.theme);
      }
    } catch (error) {
      console.error("Unable to load settings:", error);

      setSettings(DEFAULT_SETTINGS);
      applyTheme(DEFAULT_SETTINGS.theme);
    }
  }, []);

  /* ============================================================
     HANDLE INPUT
  ============================================================ */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setSaved(false);
  };

  /* ============================================================
     THEME TOGGLE
  ============================================================ */

  const toggleTheme = () => {
    const newTheme =
      settings.theme === "dark"
        ? "light"
        : "dark";

    setSettings((previous) => ({
      ...previous,
      theme: newTheme,
    }));

    // Apply immediately to entire application
    applyTheme(newTheme);

    setSaved(false);
  };

  /* ============================================================
     SAVE SETTINGS
  ============================================================ */

  const saveSettings = () => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      applyTheme(settings.theme);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Unable to save settings:", error);
    }
  };

  /* ============================================================
     RESET SETTINGS
  ============================================================ */

  const resetSettings = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all settings to their default values?"
    );

    if (!confirmed) return;

    setSettings(DEFAULT_SETTINGS);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(DEFAULT_SETTINGS)
    );

    applyTheme(DEFAULT_SETTINGS.theme);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const isDark = settings.theme === "dark";

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
              <SettingsIcon size={24} />
            </div>

            <div>

              <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                Uva Explorer
              </p>

              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Settings
              </h1>

            </div>

          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Manage your Uva Explorer preferences,
            appearance, notifications, and map
            settings.
          </p>

        </div>

        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {saved && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">

            <Check size={20} />

            Settings saved successfully.

          </div>
        )}

        {/* ==================================================
            GENERAL SETTINGS
        ================================================== */}

        <SettingsCard
          icon={<Globe2 size={20} />}
          title="General Settings"
          description="Configure the basic information used by Uva Explorer."
        >

          <div className="grid gap-5 md:grid-cols-2">

            <SettingInput
              label="Site Name"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              placeholder="Uva Explorer"
            />

            <SettingInput
              label="Province"
              name="province"
              value={settings.province}
              onChange={handleChange}
              placeholder="Uva"
            />

            <SettingInput
              label="Default District"
              name="defaultDistrict"
              value={settings.defaultDistrict}
              onChange={handleChange}
              placeholder="Badulla"
            />

            <div>

              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Default Category
              </label>

              <select
                name="defaultCategory"
                value={settings.defaultCategory}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >

                <option value="Sightseeing">
                  Sightseeing
                </option>

                <option value="Nature">
                  Nature
                </option>

                <option value="Heritage">
                  Heritage
                </option>

                <option value="Religious">
                  Religious
                </option>

                <option value="Cultural">
                  Cultural
                </option>

                <option value="Historical">
                  Historical
                </option>

              </select>

            </div>

          </div>

        </SettingsCard>

        {/* ==================================================
            APPEARANCE
        ================================================== */}

        <SettingsCard
          icon={<Palette size={20} />}
          title="Appearance"
          description="Customize the appearance of the entire Uva Explorer application."
        >

          {/* THEME TOGGLE */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

            <div className="flex items-center justify-between gap-5">

              <div className="flex items-center gap-4">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    isDark
                      ? "bg-indigo-900/50 text-indigo-400"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >

                  {isDark ? (
                    <Moon size={23} />
                  ) : (
                    <Sun size={23} />
                  )}

                </div>

                <div>

                  <p className="font-semibold text-slate-900 dark:text-white">
                    {isDark
                      ? "Dark Mode"
                      : "Light Mode"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {isDark
                      ? "Dark theme is currently enabled."
                      : "Light theme is currently enabled."}
                  </p>

                </div>

              </div>

              {/* THEME SWITCH */}

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle application theme"
                aria-pressed={isDark}
                className={`relative h-8 w-14 shrink-0 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                  isDark
                    ? "bg-teal-600"
                    : "bg-slate-300"
                }`}
              >

                <span
                  className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isDark
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                >

                  {isDark ? (
                    <Moon
                      size={14}
                      className="text-indigo-600"
                    />
                  ) : (
                    <Sun
                      size={14}
                      className="text-amber-500"
                    />
                  )}

                </span>

              </button>

            </div>

          </div>

          {/* THEME STATUS */}

          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">

            <div className="flex items-center gap-2">

              {isDark ? (
                <Moon
                  size={17}
                  className="text-indigo-400"
                />
              ) : (
                <Sun
                  size={17}
                  className="text-amber-500"
                />
              )}

              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Current theme
              </span>

            </div>

            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold capitalize text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
              {settings.theme}
            </span>

          </div>

          {/* DIVIDER */}

          <div className="my-6 border-t border-slate-200 dark:border-slate-700" />

          {/* OTHER APPEARANCE */}

          <div className="space-y-4">

            <ToggleSetting
              name="showRatings"
              checked={settings.showRatings}
              onChange={handleChange}
              title="Show ratings"
              description="Display tourist place ratings."
            />

            <ToggleSetting
              name="showReviews"
              checked={settings.showReviews}
              onChange={handleChange}
              title="Show review counts"
              description="Display the number of reviews for tourist places."
            />

            <ToggleSetting
              name="compactLayout"
              checked={settings.compactLayout}
              onChange={handleChange}
              title="Compact layout"
              description="Use smaller spacing and more compact content."
            />

          </div>

        </SettingsCard>

        {/* ==================================================
            NOTIFICATIONS
        ================================================== */}

        <SettingsCard
          icon={<Bell size={20} />}
          title="Notifications"
          description="Choose which notifications you want to receive."
        >

          <div className="space-y-4">

            <ToggleSetting
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              title="Enable notifications"
              description="Allow Uva Explorer to display notifications."
            />

            <ToggleSetting
              name="newPlaceNotifications"
              checked={settings.newPlaceNotifications}
              onChange={handleChange}
              title="New place notifications"
              description="Notify when a new tourist destination is added."
            />

          </div>

        </SettingsCard>

        {/* ==================================================
            MAP SETTINGS
        ================================================== */}

        <SettingsCard
          icon={<Map size={20} />}
          title="Map Settings"
          description="Control the information displayed on the Uva Explorer map."
        >

          <div className="space-y-4">

            <ToggleSetting
              name="showTouristPlaces"
              checked={settings.showTouristPlaces}
              onChange={handleChange}
              title="Show tourist places"
              description="Display tourist attractions on the map."
            />

            <ToggleSetting
              name="showFacilities"
              checked={settings.showFacilities}
              onChange={handleChange}
              title="Show nearby facilities"
              description="Display facilities such as hospitals, hotels, restaurants, and other services."
            />

          </div>

        </SettingsCard>

        {/* ==================================================
            INFORMATION
        ================================================== */}

        <div className="mt-6 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/30">

          <Info
            size={20}
            className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
          />

          <div>

            <h3 className="font-semibold text-blue-900 dark:text-blue-300">
              About Settings
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-700 dark:text-blue-400">
              Your preferences are stored locally
              in your browser. Theme changes are
              applied immediately and remain active
              after refreshing the application.
            </p>

          </div>

        </div>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >

            <RotateCcw size={17} />

            Reset Defaults

          </button>

          <button
            type="button"
            onClick={saveSettings}
            className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >

            <Save size={17} />

            Save Settings

          </button>

        </div>

        {/* ==================================================
            ABOUT THIS APP & PRODUCER INFORMATION
        ================================================== */}

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 md:p-8">
          
          {/* Top Header & Big Logo */}
          <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left md:gap-8">
            
            {/* Big Website Logo Container */}
            <div className="relative shrink-0">
              <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-teal-500/40 bg-[#1F3952] shadow-xl flex items-center justify-center ring-8 ring-teal-500/10">
                <img
                  src="/images/logo.png"
                  alt="Uva Explore Logo"
                  className="h-full w-full object-cover scale-[1.38]"
                />
              </div>
              <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-white shadow-md border-2 border-white dark:border-slate-900">
                <Check size={16} />
              </span>
            </div>

            {/* App & Producer Info Header */}
            <div className="mt-5 md:mt-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-800 border border-teal-200/80 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20">
                <Sparkles size={13} /> Official Uva Province Travel Guide
              </div>

              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                UVA EXPLORE
              </h2>

              <p className="text-xs font-extrabold tracking-widest text-teal-600 dark:text-teal-400 uppercase">
                DISCOVER THE HIGHLANDS
              </p>

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Uva Explore is the official smart travel and navigation companion for Uva Province, Sri Lanka. Designed for tourists, local travelers, and adventurers to discover top destinations, verified ticket pricing, live bus schedules, and local facilities in Badulla, Ella, Haputale, and beyond.
              </p>

              {/* Version & Status Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Version 2.4.0 (Official Build)
                </span>
                <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  System Online & Verified
                </span>
              </div>
            </div>
          </div>

          <hr className="my-6 border-slate-200 dark:border-slate-800" />

          {/* Producer & Development Team Details */}
          <div className="grid gap-6 md:grid-cols-2">
            
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                  <UserCheck size={18} />
                </div>
                <span>Producer Information</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex justify-between border-b border-slate-200/60 pb-1.5 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-500">Lead Producer / Creator:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">W.M.V.R.Wijesundara (Vmax)</span>
                </li>
                <li className="flex justify-between border-b border-slate-200/60 pb-1.5 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-500">Target Region:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Uva Province, Sri Lanka 🇱🇰</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-slate-500">Data Management:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">MongoDB Database</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                  <Cpu size={18} />
                </div>
                <span>Technology Stack</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["React 19", "Vite JS", "Node.js", "Express.js", "MongoDB", "TailwindCSS v4", "Leaflet Maps", "OpenStreetMap"].map((tech) => (
                  <span key={tech} className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-6 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
            © 2026 Uva Explore — Discover The Highlands. Built for Sri Lanka Tourism & Adventure.
          </div>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   SETTINGS CARD
============================================================ */

function SettingsCard({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 md:p-7">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
          {icon}
        </div>

        <div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>

        </div>

      </div>

      <div className="mt-6">
        {children}
      </div>

    </section>
  );
}

/* ============================================================
   INPUT
============================================================ */

function SettingInput({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-teal-500 dark:focus:ring-teal-900"
      />

    </div>
  );
}

/* ============================================================
   TOGGLE
============================================================ */

function ToggleSetting({
  name,
  checked,
  onChange,
  title,
  description,
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">

      <div>

        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>

      </div>

      <div className="relative shrink-0">

        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />

        <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-teal-600 dark:bg-slate-600" />

        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />

      </div>

    </label>
  );
}

export default Settings;