import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, Trash2, Map, CalendarPlus } from "lucide-react";
import { API_URL } from "../services/api";

const SAMPLE_PLACES_FALLBACK = [
  { _id: "1", id: "1", name: "Nine Arches Bridge", category: "Sightseeing", location: "Gotuwala, Demodara, Ella, Sri Lanka", district: "Badulla", rating: 4.9, reviews: 312, description: "Iconic colonial-era stone train viaduct surrounded by lush jungle.", image: "/images/places/nine-arches-bridge.jpg" },
  { _id: "2", id: "2", name: "Ella Rock", category: "Sightseeing", location: "V25V+4JJ, Unnamed Road, Ella, Sri Lanka", district: "Badulla", rating: 4.8, reviews: 240, description: "Challenging mountain trek offering panoramic views across Ella Gap.", image: "/images/places/ella-rock.jpg" },
  { _id: "3", id: "3", name: "Little Adam's Peak", category: "Sightseeing", location: "V387+36 Ella, Sri Lanka", district: "Badulla", rating: 4.8, reviews: 198, description: "Easy 45-min hike through tea gardens with views of Ella Gap.", image: "/images/places/little-adams-peak.jpg" },
  { _id: "4", id: "4", name: "Ravana Falls", category: "Sightseeing", location: "Wellawaya Road (A23), Ella, Sri Lanka", district: "Badulla", rating: 4.6, reviews: 154, description: "25-meter cascading waterfall along the main Wellawaya highway.", image: "/images/places/ravana-falls.jpg" },
  { _id: "6", id: "6", name: "Lipton's Seat", category: "Sightseeing", location: "Haputale, Sri Lanka", district: "Badulla", rating: 4.8, reviews: 210, description: "Historic lookout point where Sir Thomas Lipton surveyed his tea empire.", image: "/images/places/liptons-seat.jpg" },
];

function Saved() {
  const [savedIds, setSavedIds] = useState([]);
  const [places, setPlaces] = useState(SAMPLE_PLACES_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("uva_saved_places");
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch(`${API_URL}/api/places`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : [];
        if (list.length > 0) {
          setPlaces(list);
        }
      } catch (err) {
        console.warn("Using sample places fallback for saved page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const savedPlaces = places.filter((p) => savedIds.includes((p._id || p.id).toString()));

  const handleRemoveSaved = (id) => {
    const updated = savedIds.filter((savedId) => savedId.toString() !== id.toString());
    setSavedIds(updated);
    localStorage.setItem("uva_saved_places", JSON.stringify(updated));
  };

  return (
    <div className="p-4 sm:p-8 mx-auto max-w-7xl">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#176B45] dark:text-[#159A9C]">Your Collection</p>
        <h1 className="mt-1 text-2xl font-black text-[#26332D] sm:text-3xl dark:text-white">Saved Places</h1>
        <p className="mt-1 text-xs sm:text-sm text-[#64746C] dark:text-slate-400">
          Your bookmarked tourist destinations across Uva Province.
        </p>
      </div>

      {loading ? (
        <div className="mt-10 text-center text-xs font-semibold text-[#64746C] dark:text-slate-400">
          Loading saved places...
        </div>
      ) : savedPlaces.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedPlaces.map((place) => (
            <article
              key={place._id || place.id}
              className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 dark:border-slate-800"
            >
              {/* Image */}
              <div className="relative h-48 w-full bg-slate-200 dark:bg-slate-800">
                <img
                  src={place.image || "/images/places/default.jpg"}
                  alt={place.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = "/images/places/default.jpg";
                  }}
                />
                <button
                  onClick={() => handleRemoveSaved(place._id || place.id)}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-md transition hover:bg-white hover:scale-110 dark:bg-slate-900/90 dark:text-rose-400"
                  title="Remove from saved"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5">
                <span className="rounded-full bg-[#176B45]/10 px-3 py-1 text-[11px] font-extrabold text-[#176B45] dark:bg-[#159A9C]/20 dark:text-[#159A9C]">
                  {place.category}
                </span>

                <h2 className="mt-3 text-lg font-black text-[#26332D] dark:text-white">
                  {place.name}
                </h2>

                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#64746C] dark:text-slate-400">
                  <MapPin size={14} className="text-[#176B45] dark:text-[#159A9C]" />
                  {place.location}, {place.district}
                </p>

                {(place.reviews > 0 || place.rating > 0) && (
                  <div className="mt-2">
                    <Link
                      to={`/place/${place._id || place.id}#reviews`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-[#F4B942] hover:underline"
                      title="View reviews and ratings"
                    >
                      <Star size={14} className="fill-[#F4B942] text-[#F4B942]" />
                      <span>{place.rating ? Number(place.rating).toFixed(1) : "0.0"}</span>
                      <span className="text-[#64746C] font-normal dark:text-slate-400">
                        ({place.reviews} {place.reviews === 1 ? "review" : "reviews"})
                      </span>
                    </Link>
                  </div>
                )}

                <p className="mt-3 line-clamp-2 text-xs text-[#64746C] dark:text-slate-400 leading-relaxed">
                  {place.description}
                </p>

                {/* Actions */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link
                    to={`/place/${place._id || place.id}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-extrabold text-[#26332D] transition hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    View Details
                  </Link>

                  <Link
                    to="/planner"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#176B45] py-2.5 text-center text-xs font-extrabold text-white transition hover:bg-[#115234]"
                  >
                    <CalendarPlus size={14} />
                    Add to Trip
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
            <Heart size={32} />
          </div>

          <h2 className="mt-4 text-xl font-extrabold text-[#26332D] dark:text-white">
            No saved places yet
          </h2>

          <p className="mt-2 text-[#64746C] max-w-sm mx-auto text-xs sm:text-sm dark:text-slate-400">
            Click the heart icon on any destination in the Explore page to add it to your saved collection.
          </p>

          <Link
            to="/explore"
            className="mt-6 inline-block rounded-2xl bg-[#176B45] px-6 py-3 text-xs font-extrabold text-white transition hover:bg-[#115234]"
          >
            Explore Destinations
          </Link>
        </div>
      )}
    </div>
  );
}

export default Saved;