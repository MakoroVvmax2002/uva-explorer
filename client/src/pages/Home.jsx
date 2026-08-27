import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Mountain,
  Landmark,
  Compass,
  ArrowRight,
  Star,
  Heart,
  Sparkles,
  Calendar,
  Building2,
  Map as MapIcon,
  CloudSun,
  Award,
  Bus,
  ShieldCheck,
  Search,
  CheckCircle2,
} from "lucide-react";
import { API_URL } from "../services/api";
import { toggleSavedPlace, isPlaceSaved } from "../utils/savedPlaces";
import { getAllReviewsFromStore } from "../utils/reviewStore";
import { places as staticPlaces } from "../data/places";
import HomeAdCarousel from "../components/HomeAdCarousel";

const POPULAR_DESTINATIONS = [
  {
    id: "1",
    name: "Nine Arches Bridge",
    location: "Demodara, Ella",
    tag: "Colonial Viaduct • Train Crossing",
    image: "/images/places/nine-arches-bridge.jpg",
    link: "/place/1",
  },
  {
    id: "2",
    name: "Ella Rock",
    location: "Ella Peak",
    tag: "Mountain Summit • Scenic Hike",
    image: "/images/places/ella-rock.jpg",
    link: "/place/2",
  },
  {
    id: "6",
    name: "Lipton's Seat",
    location: "Poonagala, Haputale",
    tag: "Tea Estate Viewpoint • 7 Provinces View",
    image: "/images/places/liptons-seat.jpg",
    link: "/place/6",
  },
  {
    id: "4",
    name: "Ravana Falls",
    location: "Ella Gap",
    tag: "Cascading Waterfall • Legend Cave",
    image: "/images/places/ravana-fall.jpg",
    link: "/place/4",
  },
];

const HERO_CAROUSEL_IMAGES = [
  { url: "/images/places/nine-arches-bridge.jpg", title: "Nine Arches Bridge" },
  { url: "/images/places/ella-rock.jpg", title: "Ella Rock" },
  { url: "/images/places/liptons-seat.jpg", title: "Lipton's Seat" },
  { url: "/images/places/ravana-fall.jpg", title: "Ravana Falls" },
  { url: "/images/places/little-adams-peak.jpg", title: "Little Adam's Peak" },
  { url: "/images/places/adisham-bungalow.jpg", title: "Adisham Bungalow" },
  { url: "/images/places/porowagala-viewpoint.jpg", title: "Porowagala Viewpoint" },
];

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-rotate hero background images every 3 seconds with smooth crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Search & Tour Widget State
  const [searchLocation, setSearchLocation] = useState("Ella");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [tourCategory, setTourCategory] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("uva_saved_places");
      setSavedIds(stored ? JSON.parse(stored) : []);
    } catch {}
  }, []);

  // Fetch places and app user reviews
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/places`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : [];
          setPlaces(list);
        }
      } catch (err) {
        console.warn("Failed to fetch places from API:", err);
      } finally {
        setLoading(false);
      }

      try {
        let storeRev = await getAllReviewsFromStore();
        if (!Array.isArray(storeRev)) storeRev = [];

        const localRevs = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("uva_reviews_")) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key));
              if (Array.isArray(parsed)) {
                localRevs.push(...parsed);
              }
            } catch (e) {}
          }
        }

        const revMap = new Map();
        [...storeRev, ...localRevs].forEach((r) => {
          if (r) {
            const k = r._id || r.id || `${r.author}_${r.createdAt}`;
            revMap.set(k, r);
          }
        });

        setAllReviews(Array.from(revMap.values()));
      } catch (err) {
        console.warn("Failed to load local reviews:", err);
      }
    };

    loadData();
  }, []);

  // Compute real average rating and total review count strictly from user reviews submitted in this app
  const getDestinationStats = (item) => {
    const matchedPlace = places.find(
      (p) =>
        String(p._id) === String(item.id) ||
        String(p.id) === String(item.id) ||
        p.name?.toLowerCase() === item.name?.toLowerCase()
    );

    const localReviews = allReviews.filter((r) => {
      if (!r) return false;
      const pId = String(r.placeId || r.place?._id || r.place?.id || "");
      const pName = String(r.placeName || r.place?.name || "").toLowerCase();
      const itemName = String(item.name || "").toLowerCase();
      const matchId =
        pId === String(item.id) ||
        (matchedPlace &&
          (pId === String(matchedPlace._id) || pId === String(matchedPlace.id)));
      const matchName =
        pName &&
        (pName === itemName ||
          (matchedPlace && pName === String(matchedPlace.name).toLowerCase()));
      return matchId || matchName;
    });

    const dbReviewCount = typeof matchedPlace?.reviews === "number" ? matchedPlace.reviews : 0;
    const dbRating = typeof matchedPlace?.rating === "number" ? matchedPlace.rating : 0;

    if (localReviews.length > 0) {
      const localSum = localReviews.reduce(
        (sum, r) => sum + (Number(r.rating) || 5),
        0
      );
      const totalCount = Math.max(dbReviewCount, localReviews.length);
      const avg = (localSum / localReviews.length).toFixed(1);
      return `⭐ ${avg} (${totalCount} ${totalCount === 1 ? "review" : "reviews"})`;
    }

    if (dbReviewCount > 0) {
      return `⭐ ${dbRating.toFixed(1)} (${dbReviewCount} ${dbReviewCount === 1 ? "review" : "reviews"})`;
    }

    return "No reviews yet";
  };

  const handleToggleSave = (id) => {
    const updated = toggleSavedPlace(id);
    setSavedIds(updated);
  };

  const handleWidgetSearch = (e) => {
    e.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(searchLocation)}&category=${encodeURIComponent(tourCategory)}`);
  };

  return (
    <div className="w-full bg-[#F4F7F4] dark:bg-[#08120c] text-[#122119] dark:text-[#F4F7F4] transition-colors duration-300 pb-12">
      
      {/* 1. HERO SECTION — DRIBBBLE 27010990 LUXURY TRAVEL LANDING FRAME */}
      <section className="relative mx-3 sm:mx-6 lg:mx-10 my-4 sm:my-6 rounded-[36px] lg:rounded-[44px] min-h-[580px] lg:min-h-[640px] flex flex-col justify-between overflow-hidden bg-slate-950 p-6 sm:p-10 lg:p-14 shadow-2xl border border-white/10">
        
        {/* HERO CAROUSEL BACKGROUND (Auto-rotates every 3s with smooth crossfade & subtle scale) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {HERO_CAROUSEL_IMAGES.map((img, idx) => (
            <img
              key={img.url}
              src={img.url}
              alt={img.title}
              className={`absolute inset-0 h-full w-full object-cover object-center scale-105 transition-all duration-1000 ease-in-out ${
                idx === currentHeroIndex ? "opacity-75 z-10 scale-100" : "opacity-0 z-0 scale-110"
              }`}
            />
          ))}
          {/* Dual Overlay Gradient for contrast */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
        </div>

        {/* HERO TOP BAR: FLOATING BADGES & QUICK HIGHLIGHTS */}
        <div className="relative z-30 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white backdrop-blur-md border border-white/20 shadow-md">
            <Sparkles size={14} className="text-[#F4B942]" /> SRI LANKA'S UVA HIGHLANDS
          </span>

          <div className="hidden sm:flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3.5 py-1.5 text-xs font-extrabold text-white backdrop-blur-md border border-white/20 shadow-sm">
              ⭐ 4.9 Rating (App Reviews)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-3.5 py-1.5 text-xs font-extrabold text-emerald-300 backdrop-blur-md border border-emerald-500/30 shadow-sm">
              🌿 100+ Mountain Trails
            </span>
          </div>
        </div>

        {/* HERO MAIN HEADLINE & SUBTITLE */}
        <div className="relative z-30 my-auto py-8 max-w-4xl space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.06] tracking-tight font-display">
            Discover Sri Lanka's <br />
            <span className="bg-gradient-to-r from-[#62C8C2] via-emerald-300 to-[#F4B942] bg-clip-text text-transparent">
              Emerald Highlands
            </span>
          </h1>

          <p className="max-w-2xl text-sm sm:text-base text-slate-200 font-medium leading-relaxed drop-shadow-sm">
            Experience breathtaking tea mountain peaks, waterfalls, colonial viaducts, & ancient heritage in Ella, Haputale, Bandarawela, & Badulla.
          </p>
        </div>

        {/* DRIBBBLE 27010990 GLASSMORPHIC TRAVEL SEARCH WIDGET */}
        <div className="relative z-30 w-full pt-2">
          <div className="rounded-[28px] sm:rounded-[32px] bg-white/95 dark:bg-slate-900/95 p-4 sm:p-6 shadow-2xl backdrop-blur-xl border border-white/40 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                <Compass size={16} className="text-emerald-600 dark:text-emerald-400" /> 
                Plan Your Next Mountain Escape
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
                EXPLORE UVA • BADULLA & MONARAGALA
              </span>
            </div>

            <form onSubmit={handleWidgetSearch} className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center">
              
              {/* STARTING DATE */}
              <div className="bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-700/60">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Starting Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={15} className="text-emerald-600 shrink-0" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* END DATE */}
              <div className="bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-700/60">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">End Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={15} className="text-emerald-600 shrink-0" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* DESTINATION */}
              <div className="bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-700/60">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Destination</label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={15} className="text-emerald-600 shrink-0" />
                  <select
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="Ella">Ella Hill Town</option>
                    <option value="Bandarawela">Bandarawela Central</option>
                    <option value="Haputale">Haputale Pass</option>
                    <option value="Badulla">Badulla Capital</option>
                    <option value="Diyatalawa">Diyatalawa Garrison</option>
                    <option value="Welimada">Welimada Valley</option>
                    <option value="Monaragala">Monaragala</option>
                  </select>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 py-4 px-6 text-xs font-extrabold text-white shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <Search size={16} />
                  <span>Search Destinations ➔</span>
                </button>
              </div>

            </form>
          </div>
        </div>

      </section>

      {/* 2. POPULAR DESTINATIONS GRID SECTION — DRIBBBLE CARDS */}
      <section className="mx-auto w-full px-4 py-10 sm:px-8 lg:px-12 xl:px-16 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#159A9C]">
            HANDPICKED ATTRACTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
            Popular Destinations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Top tourist attractions across Ella, Haputale, Bandarawela & Badulla.
          </p>
        </div>

        {/* 4 VERTICAL TALL DRIBBBLE DESTINATION CARDS */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_DESTINATIONS.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="group relative flex h-[420px] flex-col justify-end overflow-hidden rounded-[32px] bg-slate-900 p-6 shadow-xl transition-all duration-300 hover:-translate-y-2.5 hover:shadow-2xl hover:shadow-emerald-950/30 border border-slate-200/20 dark:border-slate-800/80"
            >
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="relative z-10 space-y-2">
                
                {/* 1. RATING / REVIEWS BADGE (Fixed single-line height slot) */}
                <div className="flex items-center h-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3.5 py-1 text-[11px] font-extrabold text-white backdrop-blur-md border border-white/25 shadow-md whitespace-nowrap">
                    {getDestinationStats(item)}
                  </span>
                </div>

                {/* 2. TITLE (Fixed 2-line height slot so 1-line and 2-line titles align) */}
                <div className="min-h-[2.75rem] flex items-end">
                  <h3 className="text-xl font-black text-white leading-tight group-hover:text-[#F4B942] transition line-clamp-2 font-display">
                    {item.name}
                  </h3>
                </div>

                {/* 3. LOCATION (Fixed 1-line height slot) */}
                <div className="h-5 flex items-center">
                  <p className="text-xs text-slate-300 font-semibold truncate">
                    {item.location}
                  </p>
                </div>

                {/* 4. TAG (Fixed 2-line height slot) */}
                <div className="min-h-[2.25rem] flex items-start">
                  <p className="text-[11px] text-[#F4B942] font-bold leading-snug line-clamp-2">
                    {item.tag}
                  </p>
                </div>

              </div>
            </Link>
          ))}
        </div>

        {/* CENTERED BUTTON */}
        <div className="text-center pt-2">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#159A9C] hover:bg-[#117e80] px-8 py-4 text-xs font-black text-white shadow-xl shadow-teal-900/20 transition-all hover:scale-105 active:scale-98"
          >
            <span>Explore All Destinations ➔</span>
          </Link>
        </div>
      </section>

      {/* 3. WHY UVA EXPLORER / VALUE PROPOSITION SECTION */}
      <section className="bg-white py-12 dark:bg-slate-900 border-y border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#176B45] dark:text-[#159A9C]">
              EXCELLENCE IN TOURISM
            </span>
            <h2 className="mt-1 text-2xl font-black text-[#26332D] sm:text-4xl dark:text-white">
              Why Uva Explorer?
            </h2>
          </div>

          <div className="grid gap-8 grid-cols-1 md:grid-cols-3 text-center">
            
            {/* FEATURE 1 */}
            <div className="p-6 rounded-3xl bg-[#F8FAF7] dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#176B45] text-white shadow-md mb-4">
                <Award size={26} />
              </div>
              <h3 className="text-base font-extrabold text-[#26332D] dark:text-white">
                Years of Heritage
              </h3>
              <p className="mt-2 text-xs text-[#64746C] dark:text-slate-300 leading-relaxed">
                Discover 2,000-year-old rock carvings, ancient Buddhist shrines, & colonial era tea estates rich in history.
              </p>
            </div>

            {/* FEATURE 2 */}
            <div className="p-6 rounded-3xl bg-[#F8FAF7] dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#159A9C] text-white shadow-md mb-4">
                <Mountain size={26} />
              </div>
              <h3 className="text-base font-extrabold text-[#26332D] dark:text-white">
                Stunning Tours & Treks
              </h3>
              <p className="mt-2 text-xs text-[#64746C] dark:text-slate-300 leading-relaxed">
                Experience mountain summit treks, cascading waterfall dips, tea factory walks, & cloud forest viewpoints.
              </p>
            </div>

            {/* FEATURE 3 */}
            <div className="p-6 rounded-3xl bg-[#F8FAF7] dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2E8B57] text-white shadow-md mb-4">
                <Bus size={26} />
              </div>
              <h3 className="text-base font-extrabold text-[#26332D] dark:text-white">
                Express Transport & Schedules
              </h3>
              <p className="mt-2 text-xs text-[#64746C] dark:text-slate-300 leading-relaxed">
                Real-time highway luxury coaches, mountain train schedules, depot contacts, & local bus transfers.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. UNFORGETTABLE ADVENTURES BENTO GRID (EXACT MATCH TO REFERENCE IMAGE) */}
      <section className="mx-auto w-full px-4 py-12 sm:px-8 lg:px-12 xl:px-16 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#159A9C]">
            ACTIVITIES & EXPERIENCES
          </span>
          <h2 className="mt-1 text-2xl font-black text-[#26332D] sm:text-4xl dark:text-white">
            Unforgettable Adventures
          </h2>
        </div>

        {/* ASYMMETRIC BENTO GRID */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          
          {/* BENTO CARD 1: TALL LEFT */}
          <Link
            to="/explore?category=Sightseeing"
            className="group relative flex h-72 md:h-full min-h-[320px] flex-col justify-end overflow-hidden rounded-[32px] bg-slate-900 p-6 md:row-span-2 shadow-lg"
          >
            <img
              src="/images/places/ella-rock.jpg"
              alt="Hiking"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10">
              <span className="rounded-full bg-[#176B45] px-3 py-1 text-[10px] font-extrabold text-white">
                TREKKING
              </span>
              <h3 className="mt-2 text-xl font-extrabold text-white leading-tight group-hover:text-[#F4B942]">
                Hiking & Peak Trails ➔
              </h3>
            </div>
          </Link>

          {/* BENTO CARD 2: TOP RIGHT 1 */}
          <Link
            to="/explore?category=Educational"
            className="group relative flex h-48 flex-col justify-end overflow-hidden rounded-[28px] bg-slate-900 p-5 shadow-lg lg:col-span-2"
          >
            <img
              src="/images/places/halpewatte-tea-factory.jpg"
              alt="Tea Factory"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10">
              <span className="rounded-full bg-[#159A9C] px-3 py-1 text-[10px] font-extrabold text-white">
                TEA ESTATES
              </span>
              <h3 className="mt-1 text-base font-extrabold text-white group-hover:text-[#F4B942]">
                Tea Tasting & Tours ➔
              </h3>
            </div>
          </Link>

          {/* BENTO CARD 3: TOP RIGHT 2 */}
          <Link
            to="/explore?q=Waterfall"
            className="group relative flex h-48 flex-col justify-end overflow-hidden rounded-[28px] bg-slate-900 p-5 shadow-lg"
          >
            <img
              src="/images/places/ravana-fall.jpg"
              alt="Waterfalls"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
              onError={(e) => {
                e.target.src = "/images/places/nine-arches-bridge.jpg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10">
              <span className="rounded-full bg-[#2E8B57] px-3 py-1 text-[10px] font-extrabold text-white">
                WATERFALLS
              </span>
              <h3 className="mt-1 text-base font-extrabold text-white group-hover:text-[#F4B942]">
                Cascades & Dips ➔
              </h3>
            </div>
          </Link>

          {/* BENTO CARD 4: BOTTOM RIGHT 1 */}
          <Link
            to="/explore?category=Heritage"
            className="group relative flex h-52 flex-col justify-end overflow-hidden rounded-[28px] bg-slate-900 p-5 shadow-lg lg:col-span-2"
          >
            <img
              src="/images/places/dowa-rock-temple.jpg"
              alt="Historical"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10">
              <span className="rounded-full bg-[#F4B942] px-3 py-1 text-[10px] font-extrabold text-slate-950">
                HERITAGE
              </span>
              <h3 className="mt-1 text-base font-extrabold text-white group-hover:text-[#F4B942]">
                Ancient Rock Temples ➔
              </h3>
            </div>
          </Link>

          {/* BENTO CARD 5: BOTTOM RIGHT 2 */}
          <Link
            to="/map?lat=6.87676&lng=81.06076&name=Nine%20Arches%20Bridge"
            className="group relative flex h-52 flex-col justify-end overflow-hidden rounded-[28px] bg-slate-900 p-5 shadow-lg"
          >
            <img
              src="/images/places/nine-arches-bridge.jpg"
              alt="Train Viaduct"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10">
              <span className="rounded-full bg-sky-600 px-3 py-1 text-[10px] font-extrabold text-white">
                RAILWAYS
              </span>
              <h3 className="mt-1 text-base font-extrabold text-white group-hover:text-[#F4B942]">
                Viaduct Train Walks ➔
              </h3>
            </div>
          </Link>

        </div>
      </section>

      {/* 5. MERCHANT PROMOTIONS / SPONSORED ADS CAROUSEL */}
      <section className="mx-auto w-full px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <HomeAdCarousel />
      </section>

      {/* 6. TRUSTED BY / BRAND PARTNERS SECTION */}
      <section className="bg-white py-8 dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto w-full px-4 text-center sm:px-8 lg:px-12 xl:px-16">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#64746C] dark:text-slate-400 mb-6">
            TRUSTED BY TRAVEL OPERATORS & TOURISM BOARDS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-75 grayscale hover:grayscale-0 transition duration-300">
            <span className="text-sm font-black tracking-wider text-[#26332D] dark:text-white">SLTDA TOURISM</span>
            <span className="text-sm font-black tracking-wider text-[#176B45] dark:text-[#159A9C]">SLTB EXPRESS</span>
            <span className="text-sm font-black tracking-wider text-[#2E8B57] dark:text-white">NTC SRI LANKA</span>
            <span className="text-sm font-black tracking-wider text-blue-600 dark:text-blue-400">Booking.com</span>
            <span className="text-sm font-black tracking-wider text-[#F4B942]">PickMe</span>
          </div>
        </div>
      </section>

      {/* 7. PREMIUM DARK CHARCOAL FOOTER (#26332D) */}
      <footer className="bg-[#26332D] text-slate-300 py-12 border-t border-slate-800">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-4">
            
            {/* BRAND SUMMARY */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2 text-white">
                <Compass size={24} className="text-[#F4B942]" />
                <span className="text-lg font-black tracking-wide">Uva Explorer</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Official travel guide and interactive planner for Uva Province, Sri Lanka. Explore Ella, Haputale, Bandarawela, & Badulla.
              </p>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4B942]">Quick Services</h4>
              <ul className="mt-3 space-y-2 text-xs">
                <li><Link to="/explore" className="hover:text-white transition">Explore Destinations</Link></li>
                <li><Link to="/map" className="hover:text-white transition">Interactive Map Stage</Link></li>
                <li><Link to="/planner" className="hover:text-white transition">My Day Trip Planner</Link></li>
                <li><Link to="/transport" className="hover:text-white transition">Transport & Bus Schedules</Link></li>
              </ul>
            </div>

            {/* NEARBY DIRECTORY */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4B942]">Nearby Facilities</h4>
              <ul className="mt-3 space-y-2 text-xs">
                <li><Link to="/facilities?q=Hotel" className="hover:text-white transition">Hotels & Resorts</Link></li>
                <li><Link to="/facilities?q=Restaurant" className="hover:text-white transition">Restaurants & Cafes</Link></li>
                <li><Link to="/facilities?q=Fuel" className="hover:text-white transition">24/7 Fuel Stations</Link></li>
                <li><Link to="/facilities?q=Medical" className="hover:text-white transition">Hospitals & Emergency</Link></li>
              </ul>
            </div>

            {/* CONTACT INFO */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4B942]">Contact & Support</h4>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                📞 <strong>Central Depot:</strong> +94 57 222 2281 <br />
                📍 <strong>Location:</strong> Bandarawela Central Bus Station <br />
                ✉️ <strong>Email:</strong> info@uvaexplorer.lk
              </p>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© 2026 Uva Explorer Sri Lanka. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/admin/login" className="hover:text-slate-300">Admin Portal</Link>
              <Link to="/settings" className="hover:text-slate-300">Settings & Theme</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}