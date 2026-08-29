import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  ShieldCheck,
  Footprints,
  Edit3,
  Sun,
  Moon,
  CheckCheck,
  Trash2,
  ExternalLink,
  Sparkles,
  Train,
  CloudSun,
  MapPin,
  X,
  Compass,
  Heart,
  Building2,
  Settings,
  Lock,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "☀️ Great Weather in Ella & Haputale",
    message: "Clear sunny skies (24°C). Ideal conditions for hiking Little Adam's Peak & Ella Rock today!",
    time: "10m ago",
    unread: true,
    category: "weather",
    link: "/weather",
  },
  {
    id: 2,
    title: "🚂 Ella Odyssey Train Crossing",
    message: "The iconic blue train is scheduled to cross Nine Arches Viaduct at 11:30 AM and 3:20 PM.",
    time: "45m ago",
    unread: true,
    category: "attraction",
    link: "/map?lat=6.87676&lng=81.06076&name=Nine%20Arches%20Bridge",
  },
  {
    id: 3,
    title: "🌄 Porowagala Viewpoint Featured",
    message: "Explore panoramic views over tea plantations in Bandarawela. Added to Explore Places!",
    time: "2h ago",
    unread: true,
    category: "place",
    link: "/explore",
  },
  {
    id: 4,
    title: "⛰️ Mist Advisory on Beragala Pass",
    message: "Light fog reported along Haputale-Beragala Road. Drive carefully with fog lights on.",
    time: "4h ago",
    unread: false,
    category: "safety",
    link: "/nearby",
  },
];

// Master Omni-Search Index across the entire web application
const GLOBAL_SEARCH_INDEX = [
  // Explore Places
  { id: "p1", title: "Nine Arches Bridge", category: "Explore Places", subtitle: "Demodara • Colonial Viaduct", icon: Compass, link: "/place/1" },
  { id: "p2", title: "Ella Rock", category: "Explore Places", subtitle: "Ella Peak • Mountain Trek", icon: Compass, link: "/place/2" },
  { id: "p3", title: "Little Adam's Peak", category: "Explore Places", subtitle: "Ella • Sunset Peak Trail", icon: Compass, link: "/place/3" },
  { id: "p4", title: "Ravana Falls", category: "Explore Places", subtitle: "Ella • Cascading Waterfall", icon: Compass, link: "/place/4" },
  { id: "p5", title: "Dowa Rock Temple", category: "Explore Places", subtitle: "Badulla • 2000yr Rock Temple", icon: Compass, link: "/place/5" },
  { id: "p6", title: "Lipton's Seat", category: "Explore Places", subtitle: "Haputale • Tea Empire Viewpoint", icon: Compass, link: "/place/6" },
  { id: "p7", title: "Adisham Bungalow", category: "Explore Places", subtitle: "Haputale • Benedictine Monastery", icon: Compass, link: "/place/7" },
  { id: "p8", title: "Porowagala Viewpoint", category: "Explore Places", subtitle: "Bandarawela • Panoramic Cliff View", icon: Compass, link: "/explore?category=Sightseeing" },

  // Saved Places
  { id: "s1", title: "Explore Saved Places", category: "Saved Places", subtitle: "View your bookmarked destinations", icon: Heart, link: "/saved" },

  // Nearby Facilities & Places
  { id: "f1", title: "Nearby Places & Map", category: "Nearby Places", subtitle: "Interactive radius map & live GPS", icon: MapPin, link: "/nearby" },
  { id: "f2", title: "Bandarawela Heritage Hotel", category: "Nearby Facilities", subtitle: "Hotel • Bandarawela Town", icon: Building2, link: "/facilities?q=Hotel" },
  { id: "f3", title: "Melheim Resort & Spa", category: "Nearby Facilities", subtitle: "Hotel • Haputale Hillside", icon: Building2, link: "/facilities?q=Melheim" },
  { id: "f4", title: "Cafe Chill Ella", category: "Nearby Facilities", subtitle: "Restaurant • Main Street Ella", icon: Building2, link: "/facilities?q=Restaurant" },
  { id: "f5", title: "Ceypetco Fuel Station", category: "Nearby Facilities", subtitle: "Fuel Station • 24/7 Petrol & Diesel", icon: Building2, link: "/facilities?q=Fuel" },
  { id: "f6", title: "Bandarawela District Hospital", category: "Nearby Facilities", subtitle: "Medical • Emergency Center", icon: Building2, link: "/facilities?q=Medical" },
  { id: "f7", title: "Ella Police Station", category: "Nearby Facilities", subtitle: "Police • Emergency Assistance", icon: Building2, link: "/facilities?q=Police" },

  // Weather & Climate
  { id: "w1", title: "Ella Weather Forecast", category: "Weather", subtitle: "Today & tomorrow sunny forecast", icon: CloudSun, link: "/weather?q=Ella" },
  { id: "w2", title: "Haputale Weather Forecast", category: "Weather", subtitle: "Mist advisory & mountain weather", icon: CloudSun, link: "/weather?q=Haputale" },
  { id: "w3", title: "Bandarawela Weather Forecast", category: "Weather", subtitle: "Live Google Weather connected", icon: CloudSun, link: "/weather?q=Bandarawela" },

  // Notifications
  { id: "n1", title: "Notifications & Alerts", category: "Notifications", subtitle: "View travel updates & train alerts", icon: Bell, link: "#notifications" },
  { id: "n2", title: "Ella Odyssey Train Schedule", category: "Notifications", subtitle: "Nine Arches train crossing times", icon: Train, link: "/map?lat=6.87676&lng=81.06076&name=Nine%20Arches%20Bridge" },

  // Admin & Settings
  { id: "a1", title: "Admin Panel & Security", category: "Admin & Settings", subtitle: "System admin login & facility manager", icon: ShieldCheck, link: "/admin" },
  { id: "a2", title: "App Settings & Theme", category: "Admin & Settings", subtitle: "Light/Dark theme & preferences", icon: Settings, link: "/settings" },
  { id: "a3", title: "Change Your Nickname", category: "Admin & Settings", subtitle: "Update your visitor session name", icon: Edit3, link: "#edit-name" },
];

function Navbar({ onMenuClick, visitorName, onChangeNameRequest }) {
  const navigate = useNavigate();
  const { isDark, setTheme } = useTheme();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const checkAdmin = () => {
      const token =
        sessionStorage.getItem("uvaExplorerAdminToken") ||
        sessionStorage.getItem("adminToken") ||
        localStorage.getItem("adminToken");
      setIsAdminLoggedIn(Boolean(token));
    };

    checkAdmin();
    window.addEventListener("storage", checkAdmin);
    return () => window.removeEventListener("storage", checkAdmin);
  }, []);

  // Close search and notification dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Omni Search Filter Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return GLOBAL_SEARCH_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  const handleSearchResultClick = (item) => {
    setShowSearchDropdown(false);
    setSearchQuery("");

    if (item.link === "#notifications") {
      setShowNotifications(true);
    } else if (item.link === "#edit-name") {
      if (onChangeNameRequest) onChangeNameRequest();
    } else if (item.link) {
      navigate(item.link);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const q = searchQuery.trim();
      const lowerQ = q.toLowerCase();
      setShowSearchDropdown(false);

      if (lowerQ.includes("notif") || lowerQ.includes("alert")) {
        setShowNotifications(true);
        return;
      }

      if (lowerQ.includes("name") || lowerQ.includes("nickname")) {
        if (onChangeNameRequest) onChangeNameRequest();
        return;
      }

      const weatherKeywords = ["weather", "forecast", "temperature", "rain", "climate", "sunny", "fog", "mist"];
      const isWeatherQuery = weatherKeywords.some((kw) => lowerQ.includes(kw));

      const facilityKeywords = [
        "hotel", "restaurant", "fuel", "petrol", "diesel", "hospital", "medical",
        "doctor", "police", "bank", "atm", "cafe", "resort", "rental", "bike",
        "scooter", "camping", "facility", "facilities", "stay", "lodging", "food"
      ];
      const isFacilityQuery = facilityKeywords.some((kw) => lowerQ.includes(kw));

      const savedKeywords = ["saved", "bookmark", "favorite"];
      const isSavedQuery = savedKeywords.some((kw) => lowerQ.includes(kw));

      const adminKeywords = ["admin", "login", "password", "security"];
      const isAdminQuery = adminKeywords.some((kw) => lowerQ.includes(kw));

      const settingsKeywords = ["setting", "theme", "dark", "light"];
      const isSettingsQuery = settingsKeywords.some((kw) => lowerQ.includes(kw));

      if (isWeatherQuery) {
        navigate(`/weather?q=${encodeURIComponent(q)}`);
      } else if (isSavedQuery) {
        navigate(`/saved`);
      } else if (isFacilityQuery) {
        navigate(`/facilities?q=${encodeURIComponent(q)}`);
      } else if (isAdminQuery) {
        navigate(`/admin`);
      } else if (isSettingsQuery) {
        navigate(`/settings`);
      } else {
        navigate(`/explore?q=${encodeURIComponent(q)}`);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleNotifClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setShowNotifications(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const displayName = isAdminLoggedIn
    ? "Hi Admin"
    : visitorName
    ? `Hi ${visitorName}`
    : "Hi User";

  const initialLetter = isAdminLoggedIn
    ? "A"
    : visitorName
    ? visitorName.trim().charAt(0).toUpperCase()
    : "U";

  return (
    <header className="relative z-[100] flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-8 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#08120c]/90 transition-colors">
      {/* Left: hamburger (mobile) + search */}
      <div className="flex flex-1 items-center gap-3">
        {/* Mobile hamburger button */}
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 md:hidden dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* UNIVERSAL OMNI SEARCH BOX WITH LIVE DROPDOWN — DRIBBBLE PILL */}
        <div className="relative w-full max-w-md" ref={searchRef}>
          <div className="flex w-full items-center rounded-full bg-slate-100 dark:bg-slate-800/90 px-4 border border-transparent focus-within:border-emerald-500/40 focus-within:bg-white dark:focus-within:bg-slate-900 shadow-sm focus-within:shadow-md transition-all duration-200">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search destinations, weather, bus..."
              className="w-full border-0 bg-transparent px-3 py-2.5 text-xs font-semibold outline-none ring-0 placeholder:text-slate-400 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchDropdown(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* OMNI SEARCH LIVE DROPDOWN MENU */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-[100] animate-in fade-in duration-150">
              <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                Quick Results across Uva Explorer
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map((item) => {
                  const IconComponent = item.icon || Compass;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSearchResultClick(item)}
                      className="group flex cursor-pointer items-center justify-between p-3.5 transition hover:bg-teal-50/60 dark:hover:bg-slate-800/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-teal-700 dark:bg-slate-800 dark:text-teal-400">
                          <IconComponent size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 shrink-0 ml-2">
                        {item.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: theme toggle + bell notifications + profile */}
      <div className="ml-4 flex shrink-0 items-center gap-3 md:gap-4">
        {/* Sun / Moon Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-[#334155] transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle light/dark theme"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
        </button>

        {/* Notifications Bell Dropdown Container */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition ${
              showNotifications
                ? "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                : "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
            aria-label="Notifications"
            title="Uva Travel Notifications & Weather Updates"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATIONS DROPDOWN MENU */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-teal-600 dark:text-teal-400" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    Uva Travel Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => setShowNotifications(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Actions toolbar */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                  <button
                    onClick={handleClearNotifications}
                    className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 size={13} /> Clear all
                  </button>
                </div>
              )}

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotifClick(item)}
                      className={`group flex cursor-pointer items-start gap-3 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        item.unread ? "bg-teal-50/40 dark:bg-teal-950/20" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                            {item.time}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                          {item.message}
                        </p>
                      </div>

                      {item.unread && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Sparkles size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      No Notifications
                    </p>
                    <p className="text-[11px] text-slate-400">
                      You're all caught up with Uva travel updates!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile avatar & user status */}
        <div
          onClick={() => {
            if (isAdminLoggedIn) {
              navigate("/admin");
            } else if (onChangeNameRequest) {
              onChangeNameRequest();
            }
          }}
          className="flex cursor-pointer items-center gap-2.5 rounded-2xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          title={isAdminLoggedIn ? "System Admin Active" : "Click to edit your name"}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full shadow-xs transition-transform duration-200 hover:scale-105 ${
              isAdminLoggedIn
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 ring-2 ring-amber-400/40"
                : "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
            }`}
          >
            {isAdminLoggedIn ? (
              <ShieldCheck size={19} className="text-amber-800 dark:text-amber-300" />
            ) : (
              <Footprints size={19} className="text-teal-700 dark:text-teal-300" />
            )}
          </div>

          <div className="hidden md:block text-left">
            <p className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              {displayName}
              {isAdminLoggedIn && <ShieldCheck size={14} className="text-amber-500 shrink-0" />}
              {!isAdminLoggedIn && <Edit3 size={11} className="text-slate-400 opacity-60 group-hover:opacity-100" />}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAdminLoggedIn ? "System Admin" : "Explore Uva"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;