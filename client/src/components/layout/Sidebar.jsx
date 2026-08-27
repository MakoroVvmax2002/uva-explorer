import { Link, useLocation } from "react-router-dom";

import {
  Home,
  Map,
  Compass,
  CalendarDays,
  Heart,
  Settings,
  MapPin,
  Building2,
  Bus,
  ShieldCheck,
  CloudSun,
  Megaphone,
  X,
} from "lucide-react";

function Sidebar({ onClose, onOpenAdModal }) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">

      {/* Logo */}
      <Link to="/" onClick={onClose} className="flex items-center justify-between border-b border-slate-200 px-5 py-4 transition hover:opacity-95 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-teal-200/80 dark:border-teal-800 flex items-center justify-center bg-[#1F3952] shadow-xs">
            <img
              src="/images/logo.png"
              alt="Uva Explore Logo"
              className="h-full w-full object-cover scale-[1.38]"
            />
          </div>

          <div>
            <h1 className="font-extrabold text-slate-900 leading-tight dark:text-white text-sm tracking-tight">
              UVA EXPLORE
            </h1>
            <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider dark:text-teal-400">
              Discover The Highlands
            </p>
          </div>
        </div>

        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 md:hidden dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <SidebarItem
          icon={<Home size={19} />}
          label="Home"
          to="/"
          exact
          onClose={onClose}
        />

        <SidebarItem
          icon={<Compass size={19} />}
          label="Explore Places"
          to="/explore"
          onClose={onClose}
        />

        <SidebarItem
          icon={<CalendarDays size={19} />}
          label="My Planner"
          to="/planner"
          onClose={onClose}
        />

        <SidebarItem
          icon={<CloudSun size={19} />}
          label="Weather Forecast"
          to="/weather"
          onClose={onClose}
        />

        <SidebarItem
          icon={<Heart size={19} />}
          label="Saved Places"
          to="/saved"
          onClose={onClose}
        />

        {/* Other */}
        <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Other Services
        </p>

        <SidebarItem
          icon={<Building2 size={19} />}
          label="Nearby Facilities"
          to="/facilities"
          onClose={onClose}
        />

        <SidebarItem
          icon={<Bus size={19} />}
          label="Transport Facilities"
          to="/transport"
          onClose={onClose}
        />

        <SidebarItem
          icon={<ShieldCheck size={19} />}
          label="Admin Panel"
          to="/admin"
          onClose={onClose}
        />

        <SidebarItem
          icon={<Settings size={19} />}
          label="Settings"
          to="/settings"
          onClose={onClose}
        />

      </nav>

      {/* Bottom Section: Weather Card + Promote Business */}
      <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
        <Link
          to="/weather"
          onClick={onClose}
          className="group block rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100/80 p-4 transition hover:border-teal-300 dark:from-teal-950/40 dark:to-emerald-950/30 dark:border-teal-800/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
              <span>🌤️</span> Weather Today
            </span>
            <span className="rounded-full bg-teal-200/60 px-2 py-0.5 text-[10px] font-bold text-teal-900 dark:bg-teal-900/60 dark:text-teal-200">
              23°C
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-teal-700 dark:text-teal-400">
            Sunny in Ella & Haputale. Ideal hiking conditions!
          </p>
        </Link>

        {/* Merchant Ads / Promote Business Button (UNDER WEATHER CARD) */}
        <button
          onClick={() => {
            if (onClose) onClose();
            if (onOpenAdModal) onOpenAdModal();
          }}
          className="flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-xs font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 transition border border-amber-200/60 dark:border-amber-800/40 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <Megaphone size={17} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Promote Business</span>
          </div>
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
            ADS
          </span>
        </button>
      </div>

    </aside>
  );
}

function SidebarItem({ icon, label, to, exact = false, onClose }) {
  const location = useLocation();

  const isActive = exact
    ? location.pathname === to
    : location.pathname === to ||
      (to !== "/" && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClose}
      className={`mb-1.5 flex w-full items-center gap-3 rounded-full px-4 py-3 text-xs font-bold transition-all border-0 outline-none ring-0 ${
        isActive
          ? "bg-[#159A9C] text-white shadow-lg shadow-teal-900/30 font-extrabold border-0"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white border-0"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default Sidebar;