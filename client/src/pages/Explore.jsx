import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  Search,
  MapPin,
  Star,
  Heart,
  SlidersHorizontal,
  X,
  RefreshCw,
  Compass,
  Clock,
  Phone,
} from "lucide-react";

import { API_URL } from "../services/api";

const SETTINGS_KEY = "uvaExplorerSettings";

const DEFAULT_IMAGE = "/images/places/default.jpg";

const DEFAULT_SETTINGS = {
  siteName: "Uva Explorer",
  province: "Uva",
  defaultDistrict: "Badulla",
  defaultCategory: "Sightseeing",

  theme: "light",

  showRatings: true,
  showReviews: true,
  compactLayout: false,

  notifications: true,
  newPlaceNotifications: true,

  showTouristPlaces: true,
  showFacilities: true,
};

const DEFAULT_CURATED_PLACES = [
  { _id: "1", id: "1", name: "Nine Arches Bridge", category: "Sightseeing", location: "Demodara, Ella, Sri Lanka.", district: "Badulla", rating: 0, reviews: 0, description: "Iconic colonial-era stone train viaduct surrounded by lush jungle and tea fields.", image: "/images/places/nine-arches-bridge.jpg", lat: 6.87676, lng: 81.06076, phone: "N/A", openingHours: "Open 24 hours", openingDays: "Monday - Sunday" },
  { _id: "2", id: "2", name: "Ella Rock", category: "Sightseeing / Hiking", location: "Ella Rock Hiking Resort, Kithalella, Ella, 90090, Sri Lanka.", district: "Badulla", rating: 0, reviews: 0, description: "Challenging mountain trek offering panoramic views across Ella Gap.", image: "/images/places/ella-rock.jpeg", lat: 6.8538, lng: 81.0464, phone: "N/A", openingHours: "Open 24 hours", openingDays: "Monday - Sunday" },
  { _id: "3", id: "3", name: "Little Adam's Peak", category: "Sightseeing / Hiking", location: "Little Adam's Peak, Ella-Passara Road, Ella, Uva, Sri Lanka.", district: "Badulla", rating: 0, reviews: 0, description: "Easy 45-min hike through tea gardens with views of Ella Gap.", image: "/images/places/little-adams-peak.jpg", lat: 6.8625, lng: 81.0638, phone: "+94 70 110 0021", openingHours: "05:00 AM - 06:30 PM", openingDays: "Monday - Sunday" },
  { _id: "4", id: "4", name: "Ravana Falls", category: "Sightseeing", location: "Ravana Ella, Ella Wellawaya Road, Ella, 90090, Sri Lanka.", district: "Badulla", rating: 0, reviews: 0, description: "25-meter cascading waterfall along the main Wellawaya highway.", image: "/images/places/ravana-fall.jpg", lat: 6.84074, lng: 81.05492, phone: "N/A", openingHours: "Open 24 hours", openingDays: "Monday - Sunday" },
  { _id: "5", id: "5", name: "Dowa Rock Temple", category: "Heritage", location: "Dowa Rock Temple, Badulla Bandarawela Road, Bandarawela, Sri Lanka .", district: "Badulla", rating: 0, reviews: 0, description: "2000-year-old rock temple featuring a 38ft carved Buddha statue.", image: "/images/places/dowa-rock-temple.jpg", lat: 6.857426, lng: 81.022059, phone: "+94 57 222 8630", openingHours: "06:00 AM - 06:00 PM", openingDays: "Monday - Sunday" },
  { _id: "6", id: "6", name: "Lipton's Seat", category: "Sightseeing", location: "Lipton Seat Road, Dambethenna Estate, Haputale 90160, Sri Lanka.", district: "Badulla", rating: 0, reviews: 0, description: "Historic lookout point offering panoramic views across tea plantations.", image: "/images/places/liptons-seat.jpg", lat: 6.789521, lng: 81.017612, phone: "+94 57 567 0595", openingHours: "05:30 AM - 05:00 PM", openingDays: "Monday - Sunday" },
  { _id: "7", id: "7", name: "Adisham Bungalow", category: "Heritage", location: "Adisham Bungalow, Adisham Rd, Haputale 90160, Sri Lanka.", district: "Badulla", rating: 0, reviews: 0, description: "Historic 1931 Tudor-style monastery & orchard in Haputale sanctuary.", image: "/images/places/adisham-bungalow.jpg", lat: 6.773087, lng: 80.930990, phone: "+94 57 226 8030", openingHours: "09:00 AM – 04:30 PM", openingDays: "Weekends & Public Holidays" },
  { _id: "8", id: "8", name: "Porowagala Viewpoint", category: "Sightseeing", location: "Mahaulpatha, Galkanda, Bandarawela, Sri Lanka", district: "Badulla", rating: 0, reviews: 0, description: "Scenic panoramic cliff viewpoint overlooking Kinigama & Bandarawela.", image: "/images/places/porowagala-viewpoint.jpg", lat: 6.830560, lng: 81.012682, phone: "055 222 9675", openingHours: "Open 24 hours", openingDays: "Monday - Sunday" },
  { _id: "9", id: "9", name: "Rawana Ella Cave", category: "Historical", location: "Ravana Ella Cave, Ella Wellawaya Road, Ella.", district: "Badulla", rating: 0, reviews: 0, description: "Prehistoric cave site linked to King Ravana legends.", image: "/images/places/rawana-ella-cave.jpg", lat: 6.864793, lng: 81.048639, phone: "+94 71 613 1211", openingHours: "08:30 AM – 05:30 PM", openingDays: "Monday - Sunday" },
  { _id: "10", id: "10", name: "Halpewatte Tea Factory", category: "Cultural", location: "Uva Halpewatte Tea Factory, Badulla Road, Hela Halpe, Ella, Sri Lanka 90090, Sri Lanka.", district: "Badulla", rating: 0, reviews: 0, description: "Largest tea processing factory in Uva with guided tasting tours.", image: "/images/places/halpewatte-tea-factory.jpg", lat: 6.890353, lng: 81.034249, phone: "+94 57 222 8599", openingHours: "08:00 AM - 04:30 PM", openingDays: "Monday - Sunday" },
];

function Explore() {
  const [searchParams] = useSearchParams();
  const [places, setPlaces] = useState(DEFAULT_CURATED_PLACES);

  // Read ?q= and ?category= from URL (set by Home category cards or Navbar search)
  const [search, setSearch] = useState(() => searchParams.get("q") || "");

  const [category, setCategory] = useState(
    () => searchParams.get("category") || "All"
  );

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "All";
    setSearch(q);
    setCategory(cat);
  }, [searchParams]);

  const [saved, setSaved] = useState(() => {
    try {
      const stored = localStorage.getItem("uva_saved_places");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  // Load user settings from storage
  const loadSettings = () => {
    try {
      const stored =
        localStorage.getItem(SETTINGS_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
        });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error(
        "Unable to load settings:",
        error
      );

      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Apply theme & event listeners
  useEffect(() => {
    loadSettings();

    const handleStorageChange = () => {
      loadSettings();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    /*
     * Custom event allows theme changes to update
     * immediately inside the same browser tab.
     */

    window.addEventListener(
      "uvaExplorerSettingsChanged",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "uvaExplorerSettingsChanged",
        handleStorageChange
      );
    };
  }, []);

  /*
  ============================================================
  DETERMINE DARK MODE
  ============================================================
  */

  const [systemDark, setSystemDark] =
    useState(() =>
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches
    );

  useEffect(() => {
    if (
      !window.matchMedia
    ) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleSystemTheme = (event) => {
      setSystemDark(event.matches);
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemTheme
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemTheme
      );
    };
  }, []);

  const isDark =
    settings.theme === "dark" ||
    (
      settings.theme === "system" &&
      systemDark
    );

  /*
  ============================================================
  FETCH PLACES
  ============================================================
  */

  const fetchPlaces = async (
    showFullLoading = false
  ) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      if (showFullLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/api/places`,
        {
          method: "GET",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      const placesData = Array.isArray(data)
        ? data
        : Array.isArray(data?.places)
        ? data.places
        : [];

      if (placesData.length > 0) {
        setPlaces(placesData);
      }
    } catch (err) {
      // Silently keep curated places
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlaces(false);
  }, []);

  // Extract available categories
  const categories = useMemo(() => [
    "All",
    "Nature",
    "Heritage",
    "Religious",
    "Cultural",
    "Historical",
    "Sightseeing",
    "Sightseeing / Hiking",
    "Educational",
    "Monuments / Historical",
    "Monuments / Architecture",
  ], []);

  // Filter places based on search and category
  const filteredPlaces = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return places.filter((place) => {
      const name =
        place?.name?.toLowerCase() || "";

      const location =
        place?.location?.toLowerCase() || "";

      const district =
        place?.district?.toLowerCase() || "";

      const description =
        place?.description?.toLowerCase() || "";

      const placeCategory =
        place?.category || "";

      const matchesSearch =
        !searchText ||
        name.includes(searchText) ||
        location.includes(searchText) ||
        district.includes(searchText) ||
        description.includes(searchText);

      let matchesCategory = category === "All";

      if (!matchesCategory) {
        const catLower = category.toLowerCase();
        const pCatLower = placeCategory.toLowerCase();
        const fullText = `${name} ${placeCategory} ${description} ${location} ${district}`.toLowerCase();

        if (pCatLower.includes(catLower) || catLower.includes(pCatLower)) {
          matchesCategory = true;
        } else if (catLower === "nature") {
          matchesCategory = /nature|waterfall|falls|rock|peak|hike|hiking|trek|jungle|tea|mountain|viewpoint|view|cave|forest|sanctuary|river/i.test(fullText);
        } else if (catLower === "religious") {
          matchesCategory = /religious|temple|buddha|monastery|dowa|cave|sacred|shrine|kovil|church|worship/i.test(fullText);
        } else if (catLower === "heritage") {
          matchesCategory = /heritage|temple|bungalow|monastery|historic|historical|ancient|carved|colonial|statue|tudor|heritage/i.test(fullText);
        } else if (catLower === "cultural") {
          matchesCategory = /cultural|factory|tea|tasting|heritage|craft|local|traditional|culture/i.test(fullText);
        } else if (catLower === "historical") {
          matchesCategory = /historical|historic|ancient|colonial|viaduct|cave|monastery|king|legend|history/i.test(fullText);
        } else if (catLower === "sightseeing") {
          matchesCategory = /sightseeing|view|viewpoint|waterfall|falls|bridge|peak|rock|lookout|gap|scenic/i.test(fullText);
        } else {
          matchesCategory = fullText.includes(catLower);
        }
      }

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    places,
    search,
    category,
  ]);

  // Manage saved places state
  function toggleSaved(id) {
    setSaved((current) => {
      let updated;

      if (current.includes(id)) {
        updated = current.filter(
          (placeId) =>
            placeId !== id
        );
      } else {
        updated = [
          ...current,
          id,
        ];
      }

      localStorage.setItem(
        "uva_saved_places",
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  // Reset search filters
  const resetFilters = () => {
    setSearch("");
    setCategory("All");
  };

  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-slate-950 text-slate-100"
          : "min-h-screen bg-slate-50 text-slate-900"
      }
    >
      <div className="mx-auto w-full px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 xl:px-16">

        {/* Hero Section */}

        <section className="relative overflow-hidden rounded-3xl border border-teal-900/10 bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 px-6 py-10 text-white shadow-sm md:px-10 md:py-14">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-2 text-sm font-semibold text-teal-100">
              <Compass size={17} />
              Discover {settings.province || "Uva"}
            </div>

            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              Explore Amazing Places
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-teal-50 md:text-base">
              Discover beautiful destinations,
              historical landmarks, natural wonders,
              and hidden gems across Uva Province.
            </p>

            {/* Search Bar */}

            <div className="mt-7 max-w-3xl">

              <div
                className={
                  isDark
                    ? "flex items-center rounded-2xl border border-white/20 bg-white/10 px-4 shadow-lg backdrop-blur"
                    : "flex items-center rounded-2xl border border-white/20 bg-white px-4 shadow-lg"
                }
              >

                <Search
                  size={20}
                  className={
                    isDark
                      ? "shrink-0 text-teal-100"
                      : "shrink-0 text-slate-400"
                  }
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  type="text"
                  placeholder="Search places, cities or attractions..."
                  className={
                    isDark
                      ? "w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-teal-100/70"
                      : "w-full bg-transparent px-4 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  }
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                )}

              </div>

            </div>

          </div>

        </section>

        {/* Filter Section */}

        <section className="mt-8">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div
                className={
                  isDark
                    ? "flex items-center gap-2 text-sm font-semibold text-slate-300"
                    : "flex items-center gap-2 text-sm font-semibold text-slate-600"
                }
              >
                <SlidersHorizontal size={17} />
                Explore by category
              </div>

              <p
                className={
                  isDark
                    ? "mt-1 text-xs text-slate-500"
                    : "mt-1 text-xs text-slate-400"
                }
              >
                Choose a category to discover
                specific destinations.
              </p>

            </div>

            {(search || category !== "All") && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex w-fit items-center gap-2 rounded-xl border border-teal-200 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 dark:border-teal-900 dark:text-teal-400 dark:hover:bg-teal-950"
              >
                <X size={16} />
                Clear filters
              </button>
            )}

          </div>

          <div className="mt-5 flex flex-wrap gap-2.5 pb-2">

            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setCategory(item)
                }
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  category === item
                    ? "bg-teal-700 text-white shadow-sm"
                    : isDark
                    ? "border border-slate-800 bg-slate-900 text-slate-300 hover:border-teal-800 hover:bg-slate-800"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

        </section>

        {/* Results Header */}

        {!loading && !error && (
          <div className="mt-6 flex items-center justify-between">

            <div>

              <p
                className={
                  isDark
                    ? "text-sm text-slate-400"
                    : "text-sm text-slate-500"
                }
              >
                Showing{" "}
                <span
                  className={
                    isDark
                      ? "font-bold text-slate-200"
                      : "font-bold text-slate-800"
                  }
                >
                  {filteredPlaces.length}
                </span>{" "}
                destination
                {filteredPlaces.length !== 1
                  ? "s"
                  : ""}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                fetchPlaces(false)
              }
              disabled={refreshing}
              className={
                isDark
                  ? "flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 disabled:opacity-50"
                  : "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              }
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>
        )}

        {/* Loading State */}

        {loading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from({
              length: 6,
            }).map((_, index) => (
              <PlaceSkeleton
                key={index}
                dark={isDark}
              />
            ))}

          </div>
        )}

        {/* Error State */}

        {!loading && error && (
          <div
            className={
              isDark
                ? "mt-10 rounded-3xl border border-red-900/50 bg-red-950/30 p-10 text-center"
                : "mt-10 rounded-3xl border border-red-200 bg-red-50 p-10 text-center"
            }
          >

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <RefreshCw size={24} />
            </div>

            <h2
              className={
                isDark
                  ? "mt-4 text-xl font-bold text-slate-100"
                  : "mt-4 text-xl font-bold text-slate-900"
              }
            >
              Unable to load places
            </h2>

            <p
              className={
                isDark
                  ? "mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400"
                  : "mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500"
              }
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                fetchPlaces()
              }
              className="mt-6 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Places Grid */}

        {!loading &&
          !error &&
          filteredPlaces.length > 0 && (

            <div
              className={
                settings.compactLayout
                  ? "mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              }
            >

              {filteredPlaces.map(
                (place) => (
                  <PlaceCard
                    key={place._id}
                    place={place}
                    isSaved={saved.includes(
                      place._id
                    )}
                    onSave={() =>
                      toggleSaved(
                        place._id
                      )
                    }
                    dark={isDark}
                    settings={settings}
                  />
                )
              )}

            </div>
          )}

        {/* Empty State */}

        {!loading &&
          !error &&
          filteredPlaces.length === 0 && (

            <div
              className={
                isDark
                  ? "mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center"
                  : "mt-10 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm"
              }
            >

              <div
                className={
                  isDark
                    ? "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-500"
                    : "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"
                }
              >
                <Search size={30} />
              </div>

              <h2
                className={
                  isDark
                    ? "mt-5 text-xl font-bold text-slate-100"
                    : "mt-5 text-xl font-bold text-slate-900"
                }
              >
                No places found
              </h2>

              <p
                className={
                  isDark
                    ? "mt-2 text-sm text-slate-500"
                    : "mt-2 text-sm text-slate-500"
                }
              >
                Try another search term or
                category.
              </p>

              <button
                type="button"
                onClick={clearSearch}
                className="mt-6 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Clear Filters
              </button>

            </div>
          )}

      </div>
    </div>
  );
}

/*
============================================================
PLACE CARD
============================================================
*/

function PlaceCard({
  place,
  isSaved,
  onSave,
  dark,
  settings,
}) {
  const image = place?.image || DEFAULT_IMAGE;

  return (
    <article
      className={`place-card group overflow-hidden rounded-[32px] border shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between ${
        dark
          ? "border-slate-800/80 bg-slate-900 hover:border-slate-700"
          : "border-slate-200/80 bg-white"
      }`}
    >
      <div>
        {/* IMAGE */}
        <div className="relative h-60 overflow-hidden">
          <img
            src={image}
            alt={place?.name || "Tourist place"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(event) => {
              if (event.currentTarget.src.includes(DEFAULT_IMAGE)) return;
              event.currentTarget.src = DEFAULT_IMAGE;
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          {/* CATEGORY BADGE */}
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 dark:bg-slate-900/90 px-3.5 py-1 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 shadow-sm backdrop-blur-md">
              {place?.category || "Sightseeing"}
            </span>
          </div>

          {/* SAVE BUTTON */}
          <button
            type="button"
            onClick={onSave}
            aria-label={isSaved ? "Remove from saved places" : "Save place"}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-md transition hover:scale-110 active:scale-95"
          >
            <Heart
              size={18}
              className={isSaved ? "fill-red-500 text-red-500" : "text-slate-600 dark:text-slate-300"}
            />
          </button>

          {/* LOCATION ON IMAGE */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-bold text-white drop-shadow-md">
            <MapPin size={14} className="text-emerald-400 shrink-0" />
            <span className="truncate max-w-[240px]">
              {place?.location || "Uva Province"}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className={settings.compactLayout ? "p-4 space-y-2" : "p-6 space-y-3"}>
          <h2 className={`line-clamp-1 text-xl font-black font-display ${dark ? "text-white" : "text-slate-900"}`}>
            {place?.name || "Unnamed Place"}
          </h2>

          <p className={`line-clamp-2 text-xs leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
            {place?.description || "Experience scenic views and attractions."}
          </p>

          {/* CALCULATED RATING (rendered if users posted reviews) */}
          {settings.showRatings && (place?.reviews > 0 || place?.rating > 0) && (
            <div className="pt-1">
              <Link
                to={`/place/${place._id || place.id}#reviews`}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800 transition hover:bg-amber-100 hover:scale-105 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40"
                title="View reviews and ratings"
              >
                <Star size={14} className="fill-amber-400 text-amber-400 shrink-0" />
                <span>{place.rating ? Number(place.rating).toFixed(1) : "0.0"}</span>
                {settings.showReviews && (
                  <span className="text-amber-700/80 dark:text-amber-400/80 font-semibold">
                    ({place.reviews} {place.reviews === 1 ? "review" : "reviews"})
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* OPENING HOURS & CONTACT */}
          <div className="space-y-1 pt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="line-clamp-1">{place?.openingHours || "06:00 AM - 06:00 PM"} ({place?.openingDays || "Mon - Sun"})</span>
            </div>

            {place?.phone && place.phone !== "N/A" && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{place.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD FOOTER BUTTON */}
      <div className="p-6 pt-0">
        <Link
          to={`/place/${place?._id || place?.id || 1}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 py-3 text-xs font-black text-white shadow-md transition-all hover:scale-[1.02] active:scale-95"
        >
          <span>View Details ➔</span>
        </Link>
      </div>
    </article>
  );
}

/*
============================================================
LOADING SKELETON
============================================================
*/

function PlaceSkeleton({ dark }) {
  return (
    <div
      className={
        dark
          ? "overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
          : "overflow-hidden rounded-3xl border border-slate-200 bg-white"
      }
    >

      <div
        className={
          dark
            ? "h-56 animate-pulse bg-slate-800"
            : "h-56 animate-pulse bg-slate-200"
        }
      />

      <div className="space-y-4 p-5">

        <div
          className={
            dark
              ? "h-6 w-3/4 animate-pulse rounded bg-slate-800"
              : "h-6 w-3/4 animate-pulse rounded bg-slate-200"
          }
        />

        <div
          className={
            dark
              ? "h-4 w-1/2 animate-pulse rounded bg-slate-800"
              : "h-4 w-1/2 animate-pulse rounded bg-slate-200"
          }
        />

        <div
          className={
            dark
              ? "h-4 w-full animate-pulse rounded bg-slate-800"
              : "h-4 w-full animate-pulse rounded bg-slate-200"
          }
        />

        <div
          className={
            dark
              ? "h-10 w-full animate-pulse rounded-xl bg-slate-800"
              : "h-10 w-full animate-pulse rounded-xl bg-slate-200"
          }
        />

      </div>

    </div>
  );
}

export default Explore;