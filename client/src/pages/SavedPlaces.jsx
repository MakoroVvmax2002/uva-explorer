import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Heart,
  MapPin,
  Star,
  Trash2,
  Search,
  Compass,
} from "lucide-react";

import {
  getSavedPlaces,
  removeSavedPlace,
} from "../utils/savedPlaces";

const API_URL = "http://localhost:5000";

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  return image;
}

function SavedPlaces() {
  const [places, setPlaces] = useState([]);
  const [savedIds, setSavedIds] = useState(
    getSavedPlaces()
  );

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================
     LOAD PLACES
  ========================================== */

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/places`
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const data = await response.json();

        const placesData = Array.isArray(data)
          ? data
          : Array.isArray(data.places)
            ? data.places
            : [];

        setPlaces(placesData);
      } catch (err) {
        console.error(
          "Failed to load saved places:",
          err
        );

        setError(
          "Unable to load your saved places."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  /* =========================================
     LISTEN FOR SAVE CHANGES
  ========================================== */

  useEffect(() => {
    const updateSavedPlaces = () => {
      setSavedIds(getSavedPlaces());
    };

    window.addEventListener(
      "savedPlacesChanged",
      updateSavedPlaces
    );

    return () => {
      window.removeEventListener(
        "savedPlacesChanged",
        updateSavedPlaces
      );
    };
  }, []);

  /* =========================================
     FILTER SAVED PLACES
  ========================================== */

  const savedPlaces = useMemo(() => {
    const savedSet = new Set(savedIds);

    return places.filter((place) =>
      savedSet.has(place._id)
    );
  }, [places, savedIds]);

  /* =========================================
     SEARCH
  ========================================== */

  const filteredPlaces = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return savedPlaces;
    }

    return savedPlaces.filter((place) => {
      const name = (
        place.name || ""
      ).toLowerCase();

      const location = (
        place.location || ""
      ).toLowerCase();

      const district = (
        place.district || ""
      ).toLowerCase();

      const category = (
        place.category || ""
      ).toLowerCase();

      return (
        name.includes(searchText) ||
        location.includes(searchText) ||
        district.includes(searchText) ||
        category.includes(searchText)
      );
    });
  }, [savedPlaces, search]);

  /* =========================================
     REMOVE
  ========================================== */

  const handleRemove = (id) => {
    const updated = removeSavedPlace(id);

    setSavedIds(updated);
  };

  /* =========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your saved places...
          </p>

        </div>
      </div>
    );
  }

  /* =========================================
     ERROR
  ========================================== */

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">

        <p className="text-sm font-medium text-red-600">
          {error}
        </p>

        <Link
          to="/explore"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Compass size={17} />
          Explore Places
        </Link>

      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

        <div>

          <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
            <Heart
              size={17}
              className="fill-teal-700"
            />

            Your collection
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Saved Places
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Keep your favourite destinations in one place
            and plan your next Uva adventure.
          </p>

        </div>

        {savedPlaces.length > 0 && (
          <div className="rounded-2xl border border-teal-100 bg-teal-50 px-5 py-3">

            <p className="text-xs font-medium text-teal-700">
              Saved destinations
            </p>

            <p className="mt-0.5 text-xl font-extrabold text-teal-800">
              {savedPlaces.length}
            </p>

          </div>
        )}

      </div>


      {/* =====================================
          SEARCH
      ====================================== */}

      {savedPlaces.length > 0 && (
        <div className="mt-8 flex max-w-2xl items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">

          <Search
            size={19}
            className="shrink-0 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search your saved places..."
            className="w-full px-4 py-4 text-sm outline-none"
          />

        </div>
      )}


      {/* =====================================
          EMPTY STATE
      ====================================== */}

      {savedPlaces.length === 0 && (
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex min-h-[430px] flex-col items-center justify-center px-6 py-12 text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-teal-700">

              <Heart
                size={36}
                className="fill-teal-100"
              />

            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              No saved places yet
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
              Start exploring Uva Province and save
              destinations you would like to visit.
            </p>

            <Link
              to="/explore"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
            >
              <Compass size={18} />
              Explore Places
            </Link>

          </div>

        </div>
      )}


      {/* =====================================
          SEARCH EMPTY
      ====================================== */}

      {savedPlaces.length > 0 &&
        filteredPlaces.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center">

            <Search
              size={40}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No matching places
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try a different search term.
            </p>

          </div>
        )}


      {/* =====================================
          PLACE GRID
      ====================================== */}

      {filteredPlaces.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

          {filteredPlaces.map((place) => (
            <SavedPlaceCard
              key={place._id}
              place={place}
              onRemove={() =>
                handleRemove(place._id)
              }
            />
          ))}

        </div>
      )}

    </div>
  );
}


/* =========================================
   SAVED PLACE CARD
========================================= */

function SavedPlaceCard({ place, onRemove }) {
  const image =
    Array.isArray(place.images) &&
    place.images.length > 0
      ? place.images[0]
      : place.image;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-slate-100">

        {image ? (
          <img
            src={getImageUrl(image)}
            alt={place.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <MapPin size={35} />
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />


        {/* Category */}
        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-teal-700 shadow-sm">
          {place.category || "Tourism"}
        </div>


        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-500"
          title="Remove from saved places"
        >
          <Heart
            size={19}
            className="fill-red-500 text-red-500"
          />
        </button>

      </div>


      {/* Content */}
      <div className="p-5">

        <h2 className="text-xl font-bold text-slate-900">
          {place.name}
        </h2>


        {/* Location */}
        <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">

          <MapPin
            size={16}
            className="mt-0.5 shrink-0"
          />

          <span>
            {place.location}
            {place.district
        </div>

        {/* Rating */}
        {(place.reviews > 0 || place.rating > 0) && (
          <div className="mt-3">
            <Link
              to={`/place/${place._id}#reviews`}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
              title="View reviews and ratings"
            >
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span>{place.rating ? Number(place.rating).toFixed(1) : "0.0"}</span>
              <span className="text-slate-500 font-normal">
                ({place.reviews} {place.reviews === 1 ? "review" : "reviews"})
              </span>
            </Link>
          </div>
        )}





        {/* Description */}
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
          {place.description ||
            "Discover this beautiful destination in Uva Province."}
        </p>


        {/* Buttons */}
        <div className="mt-5 flex gap-3">

          <Link
            to={`/place/${place._id}`}
            className="flex flex-1 items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
          >
            View Details
          </Link>

          <button
            type="button"
            onClick={onRemove}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            title="Remove"
          >
            <Trash2 size={18} />
          </button>

        </div>

      </div>

    </article>
  );
}

export default SavedPlaces;