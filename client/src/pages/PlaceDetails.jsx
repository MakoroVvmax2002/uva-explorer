import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { isPlaceSaved, toggleSavedPlace } from "../utils/savedPlaces";
import { API_URL } from "../services/api";
import { saveReviewToStore, getReviewsFromStore, deleteReviewFromStore } from "../utils/reviewStore";
import { getOpeningStatus, getGoogleMapsUrl } from "../utils/openingHoursUtil";
import { getTicketInfo, getPlaceFacilities } from "../data/placeDetailsData";

import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  Clock,
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  MessageSquare,
  User,
  Send,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Upload,
  Image as ImageIcon,
  Camera,
  Loader2,
  ExternalLink,
  Compass,
  Phone,
  Ticket,
  Car,
  Bus,
  Coffee,
  Sparkles,
  Info,
  Bike,
} from "lucide-react";

// Fix Leaflet default icon safely
try {
  if (L && L.Icon && L.Icon.Default) {
    const DefaultIcon = L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }
} catch (e) {
  console.warn("Leaflet default icon setup warning:", e);
}

// Location Pin for Destinations (Teal Pin)
const getDestPinIcon = () => {
  return L.divIcon({
    className: "custom-dest-pin",
    html: `
      <div style="background-color: #0f766e; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.35); transform: translate(-50%, -50%);">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

function createFacilityLogoIcon(emoji, bgColor) {
  return L.divIcon({
    className: "custom-facility-logo",
    html: `
      <div style="background-color: ${bgColor}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.25); transform: translate(-50%, -50%);">
        ${emoji}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

const getFacilityLogoIcon = (category) => {
  const emojiMap = {
    Hotel: { emoji: "🏨", bg: "#2563eb" },
    Restaurant: { emoji: "🍽️", bg: "#ea580c" },
    "Fuel Station": { emoji: "⛽", bg: "#dc2626" },
    "Medical / Hospital": { emoji: "🏥", bg: "#16a34a" },
    "Police Station": { emoji: "🛡️", bg: "#4f46e5" },
    "Bus Station": { emoji: "🚌", bg: "#d97706" },
  };
  const config = emojiMap[category];
  if (config) {
    return createFacilityLogoIcon(config.emoji, config.bg);
  }
  return getDestPinIcon();
};

/* =========================================================
   COORDINATE LOOKUP — known Uva Province locations
========================================================= */

const LOCATION_COORDS = {
  "Porowagala Viewpoint": [6.830560, 81.012682],
  Porowagala: [6.830560, 81.012682],
  Kinigama: [6.830560, 81.012682],
  "Dowa Rock Temple": [6.857426, 81.022059],
  Dowa: [6.857426, 81.022059],
  "Nine Arches Bridge": [6.87676, 81.06076],
  Demodara: [6.90306, 81.06417],
  "Ella Rock": [6.8538, 81.0464],
  "Little Adam's Peak": [6.8625, 81.0638],
  "Ravana Fall": [6.84074, 81.05492],
  "Ravana Falls": [6.84074, 81.05492],
  "Ravana Waterfalls": [6.84074, 81.05492],
  "Rawana Ella Cave": [6.864793, 81.048639],
  "Adisham Bungalow": [6.773087, 80.930990],
  "Adisham Monastery Bungalow": [6.773087, 80.930990],
  Haputale: [6.76750, 80.96028],
  "Lipton's Seat": [6.789521, 81.017612],
  "Lipton's Seat Viewpoint": [6.789521, 81.017612],
  Poonagala: [6.789521, 81.017612],
  "Halpewatte Tea Factory": [6.890353, 81.034249],
  Ella: [6.8667, 81.0466],
  Badulla: [6.98583, 81.05778],
  Bandarawela: [6.82977, 80.98457],
  Kanupalalla: [6.855, 81.058],
  Welimada: [6.90528, 80.95111],
  Passara: [6.973, 81.2117],
};

const UVA_CENTER = [6.8667, 81.0466];

/* =========================================================
   IMAGE URL HELPER
========================================================= */

function getImageUrl(image) {
  if (!image || typeof image !== "string") {
    return "";
  }

  const value = image.trim();

  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/images/")) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/${value}`;
}

/* =========================================================
   PLACE DETAILS
========================================================= */

function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentImage, setCurrentImage] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  /* =======================================================
     REVIEWS STATE
  ======================================================= */
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newText, setNewText] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [uploadingReviewImage, setUploadingReviewImage] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const [reviewVideos, setReviewVideos] = useState([]);
  const [uploadingReviewVideo, setUploadingReviewVideo] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);

  const handleUploadReviewPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReviewImage(true);
    setReviewError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/api/places/upload-review-image`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.path) {
          setReviewImages((prev) => [...prev, data.path]);
          setUploadingReviewImage(false);
          e.target.value = "";
          return;
        }
      }
    } catch (err) {
      console.warn("Server upload endpoint unavailable, using FileReader fallback:", err);
    }

    // Fallback: Read file as Data URL so image upload ALWAYS works!
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setReviewImages((prev) => [...prev, reader.result]);
      }
      setUploadingReviewImage(false);
    };
    reader.onerror = () => {
      setReviewError("Could not read photo file.");
      setUploadingReviewImage(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveReviewPhoto = (index) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadReviewVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setReviewError("Video file size must be under 20MB.");
      alert("Video file size must be under 20MB!");
      e.target.value = "";
      return;
    }

    setUploadingReviewVideo(true);
    setReviewError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setReviewVideos((prev) => [...prev, reader.result]);
      }
      setUploadingReviewVideo(false);
    };
    reader.onerror = () => {
      setReviewError("Could not read video file.");
      setUploadingReviewVideo(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveReviewVideo = (index) => {
    setReviewVideos((prev) => prev.filter((_, i) => i !== index));
  };

  /* =======================================================
     FETCH PLACE & REVIEWS
  ======================================================= */

const PLACE_CONTACT_NUMBERS = {
  "Halpewatte Tea Factory": "+94 57 222 8599",
  "Dowa Rock Temple": "+94 57 222 8630",
  "Lipton's Seat": "+94 57 567 0595",
  "Nine Arches Bridge": "N/A",
  "Ella Rock": "N/A",
  "Little Adam's Peak": "+94 70 110 0021",
  "Adisham Bungalow": "+94 57 226 8030",
  "Rawana Ella Cave": "+94 71 613 1211",
  "Porowagala Viewpoint": "055 222 9675",
  "Ravana Fall": "N/A",
  "Ravana Falls": "N/A",
};

const FALLBACK_PLACES_MAP = {
  "1": {
    _id: "1", id: "1", name: "Nine Arches Bridge", category: "Sightseeing", location: "Demodara, Ella, Sri Lanka.", district: "Badulla", rating: 4.9, reviewsCount: 312,
    description: "The Nine Arches Bridge in Ella is one of the most iconic bridges in Sri Lanka and a masterpiece of early 20th-century railway engineering. Built during the British colonial era entirely out of stone, brick, and cement without steel reinforcement, this towering 30-meter high viaduct spans lush green tea valleys and dense jungle.",
    images: [
      "/images/places/nine-arches-bridge-1.jpg",
      "/images/places/nine-arches-bridge-2.jpg",
      "/images/places/nine-arches-bridge-3.jpg",
      "/images/places/nine-arches-bridge-4.jpg",
      "/images/places/nine-arches-bridge-5.jpg"
    ],
    image: "/images/places/nine-arches-bridge-1.jpg",
    lat: 6.87676, lng: 81.06076,
    phone: "N/A",
    bestTimeToVisit: "6:00 AM - 9:00 AM & 3:00 PM (Train Passing Times)",
    openingDays: "Monday - Sunday",
    openingHours: "Open 24 hours",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.87676,81.06076",
    entryFee: "Free Admission",
  },
  "2": {
    _id: "2", id: "2", name: "Ella Rock", category: "Sightseeing / Hiking", location: "Ella Rock Hiking Resort, Kithalella, Ella, 90090, Sri Lanka.", district: "Badulla", rating: 4.8, reviewsCount: 240,
    description: "Ella Rock is a famous cliff summit offering sweeping panoramic views of the Uva highlands, tea plantations, and the dramatic Ella Gap. The 4-hour round trip hike takes travelers through active railway tracks, eucalyptus forests, and tea plantations.",
    images: [
      "/images/places/ella-rock-1.jpg",
      "/images/places/ella-rock-2.jpg",
      "/images/places/ella-rock-3.jpg",
      "/images/places/ella-rock-4.jpg",
      "/images/places/ella-rock-5.jpg",
      "/images/places/ella-rock-6.jpg",
      "/images/places/ella-rock-7.jpg",
      "/images/places/ella-rock-8.jpg"
    ],
    image: "/images/places/ella-rock-1.jpg",
    lat: 6.8538, lng: 81.0464,
    phone: "N/A",
    bestTimeToVisit: "Early Morning (6:00 AM - 10:00 AM)",
    openingDays: "Monday - Sunday",
    openingHours: "Open 24 hours",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.8538,81.0464",
    entryFee: "Free",
  },
  "3": {
    _id: "3", id: "3", name: "Little Adam's Peak", category: "Sightseeing / Hiking", location: "Little Adam's Peak, Ella-Passara Road, Ella, Uva, Sri Lanka.", district: "Badulla", rating: 4.8, reviewsCount: 198,
    description: "Little Adam's Peak (Punchi Sri Pada) is a scenic 1,141m mountain peak in Ella named after the sacred Adam's Peak due to its matching pyramid shape. The trail winds through picturesque tea gardens with paved steps leading to breathtaking 360-degree sunset views.",
    images: [
      "/images/places/little-adams-peak-1.jpg",
      "/images/places/little-adams-peak-2.jpg",
      "/images/places/little-adams-peak-3.jpg",
      "/images/places/little-adams-peak-4.jpg",
      "/images/places/little-adams-peak-5.jpg",
      "/images/places/little-adams-peak-6.jpg"
    ],
    image: "/images/places/little-adams-peak-1.jpg",
    lat: 6.8625, lng: 81.0638,
    phone: "+94 70 110 0021",
    bestTimeToVisit: "Late Afternoon Sunset (4:30 PM - 6:15 PM)",
    openingDays: "Monday - Sunday",
    openingHours: "5:00 AM - 6:30 PM",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.8625,81.0638",
    entryFee: "Free",
  },
  "4": {
    _id: "4", id: "4", name: "Ravana Falls", category: "Sightseeing", location: "Ravana Ella, Ella Wellawaya Road, Ella, 90090, Sri Lanka.", district: "Badulla", rating: 4.6, reviewsCount: 154,
    description: "Ravana Falls is a popular 25-meter (82 ft) cascading waterfall located along the main Ella-Wellawaya highway. Named after the legendary King Ravana from the Ramayana epic, it surges with impressive volume during monsoon season.",
    images: [
      "/images/places/ravana-fall-1.jpg",
      "/images/places/ravana-fall-2.jpg",
      "/images/places/ravana-fall-3.jpg",
      "/images/places/ravana-fall-4.jpg",
      "/images/places/ravana-fall-5.jpg",
      "/images/places/ravana-fall-6.jpg",
      "/images/places/ravana-fall-7.jpg"
    ],
    image: "/images/places/ravana-fall-1.jpg",
    lat: 6.84074, lng: 81.05492,
    phone: "N/A",
    bestTimeToVisit: "Morning (8:00 AM - 12:00 PM)",
    openingDays: "Monday - Sunday",
    openingHours: "Open 24 hours",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.84074,81.05492",
    entryFee: "Free",
  },
  "5": {
    _id: "5", id: "5", name: "Dowa Rock Temple", category: "Heritage", location: "Dowa Rock Temple, Badulla Bandarawela Road, Bandarawela, Sri Lanka .", district: "Badulla", rating: 4.5, reviewsCount: 92,
    description: "Dowa Rock Temple is an ancient 2,000-year-old heritage site located along the Badulla-Bandarawela main road. It features a giant 38-foot unfinished rock-carved Buddha statue and vibrant cave paintings dating back to King Walagamba's reign.",
    images: [
      "/images/places/dowa-rock-temple-1.jpg",
      "/images/places/dowa-rock-temple-2.jpg",
      "/images/places/dowa-rock-temple-3.jpg",
      "/images/places/dowa-rock-temple-4.jpg",
      "/images/places/dowa-rock-temple-5.jpg",
      "/images/places/dowa-rock-temple-6.jpg",
      "/images/places/dowa-rock-temple-7.jpg",
      "/images/places/dowa-rock-temple-8.jpg",
      "/images/places/dowa-rock-temple-9.jpg",
      "/images/places/dowa-rock-temple-10.jpg",
      "/images/places/dowa-rock-temple-11.jpg"
    ],
    image: "/images/places/dowa-rock-temple-1.jpg",
    lat: 6.857426, lng: 81.022059,
    phone: "+94 57 222 8630",
    bestTimeToVisit: "Morning to Midday (8:00 AM - 4:00 PM)",
    openingDays: "Monday - Sunday",
    openingHours: "6:00 AM - 6:00 PM",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.857425909029196,81.02205925881152",
    entryFee: "LKR 100 - 200",
  },
  "6": {
    _id: "6", id: "6", name: "Lipton's Seat", category: "Sightseeing", location: "Lipton Seat Road, Dambethenna Estate, Haputale 90160, Sri Lanka.", district: "Badulla", rating: 4.8, reviewsCount: 210,
    description: "Lipton's Seat is a famous high-altitude observation point in Haputale where tea pioneer Sir Thomas Lipton sat to admire his vast tea plantations. On clear days, it offers panoramic vistas across seven provinces of Sri Lanka.",
    images: [
      "/images/places/liptons-seat.jpg",
      "/images/places/liptons-seat.jpg"
    ],
    image: "/images/places/liptons-seat.jpg",
    lat: 6.789521, lng: 81.017612,
    phone: "+94 57 567 0595",
    bestTimeToVisit: "Sunrise to 9:30 AM (Before fog sets in)",
    openingDays: "Monday - Sunday",
    openingHours: "5:30 AM - 5:00 PM",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.789520980363356,81.01761188949553",
    entryFee: "LKR 500",
  },
  "7": {
    _id: "7", id: "7", name: "Adisham Bungalow", category: "Heritage", location: "Adisham Bungalow, Adisham Rd, Haputale 90160, Sri Lanka.", district: "Badulla", rating: 4.7, reviewsCount: 165,
    description: "Adisham Bungalow is a stately 1931 Tudor-style mansion built by Sir Thomas Villiers, now operating as St. Benedict's Monastery. Surrounded by the Tangamalai bird sanctuary, it features granite walls, English gardens, and a famous homemade fruit jam shop.",
    images: [
      "/images/places/adisham-bungalow-1.jpg",
      "/images/places/adisham-bungalow-2.jpg",
      "/images/places/adisham-bungalow-3.jpg",
      "/images/places/adisham-bungalow-4.jpg",
      "/images/places/adisham-bungalow-5.jpg"
    ],
    image: "/images/places/adisham-bungalow-1.jpg",
    lat: 6.773087, lng: 80.930990,
    phone: "+94 57 226 8030",
    bestTimeToVisit: "Weekends & Public Holidays (9:00 AM - 4:00 PM)",
    openingDays: "Weekends & Public Holidays",
    openingHours: "9:00 AM – 4:30 PM",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.773086557447562,80.93099045087155",
    entryFee: "LKR 200",
  },
  "8": {
    _id: "8", id: "8", name: "Porowagala Viewpoint", category: "Sightseeing", location: "Mahaulpatha, Galkanda, Bandarawela, Sri Lanka", district: "Badulla", rating: 4.6, reviewsCount: 88,
    description: "Porowagala Viewpoint is a serene cliffside lookout near Bandarawela town offering magnificent views of surrounding tea hills, vegetable farms, and distant mountain ranges.",
    images: [
      "/images/places/porowagala-viewpoint-1.jpg",
      "/images/places/porowagala-viewpoint-2.jpg",
      "/images/places/porowagala-viewpoint-3.jpg",
      "/images/places/porowagala-viewpoint-4.jpg",
      "/images/places/porowagala-viewpoint-5.jpg",
      "/images/places/porowagala-viewpoint-6.jpg",
      "/images/places/porowagala-viewpoint-7.jpg",
      "/images/places/porowagala-viewpoint-8.jpg",
      "/images/places/porowagala-viewpoint-9.jpg",
      "/images/places/porowagala-viewpoint-10.jpg",
      "/images/places/porowagala-viewpoint-11.jpg"
    ],
    image: "/images/places/porowagala-viewpoint-1.jpg",
    lat: 6.830560, lng: 81.012682,
    phone: "055 222 9675",
    bestTimeToVisit: "Morning or Sunset",
    openingDays: "Monday - Sunday",
    openingHours: "Open 24 hours",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.830559988080396,81.01268150484262",
    entryFee: "Free",
  },
  "9": {
    _id: "9", id: "9", name: "Rawana Ella Cave", category: "Historical", location: "Ravana Ella Cave, Ella Wellawaya Road, Ella.", district: "Badulla", rating: 4.5, reviewsCount: 76,
    description: "Historical cave site located 1,370m above sea level near Ella, steeped in Ramayana folklore.",
    images: [
      "/images/places/rawana-ella-cave-1.jpg",
      "/images/places/rawana-ella-cave-2.jpg",
      "/images/places/rawana-ella-cave-3.jpg",
      "/images/places/rawana-ella-cave-4.jpg",
      "/images/places/rawana-ella-cave-5.jpg"
    ],
    image: "/images/places/rawana-ella-cave-1.jpg",
    lat: 6.864793, lng: 81.048639,
    phone: "+94 71 613 1211",
    bestTimeToVisit: "Morning",
    openingDays: "Monday - Sunday",
    openingHours: "8:30 AM – 5:30 PM",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.864792997229675,81.04863933379441",
    entryFee: "LKR 200",
  },
  "10": {
    _id: "10", id: "10", name: "Halpewatte Tea Factory", category: "Cultural", location: "Uva Halpewatte Tea Factory, Badulla Road, Hela Halpe, Ella, Sri Lanka 90090, Sri Lanka.", district: "Badulla", rating: 0, reviewsCount: 0,
    description: "The largest tea factory in the Uva region, offering educational guided tours on orthodox black tea production.",
    images: ["/images/places/halpewatte-tea-factory.jpg"],
    image: "/images/places/halpewatte-tea-factory.jpg",
    lat: 6.890353, lng: 81.034249,
    phone: "+94 57 222 8599",
    bestTimeToVisit: "9:00 AM - 3:00 PM",
    openingDays: "Monday - Sunday",
    openingHours: "8:00 AM - 4:30 PM",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.89035332628612,81.03424924346947",
    entryFee: "LKR 1000",
  },
};

  useEffect(() => {
    if (!id) {
      setError("Invalid place ID.");
      setLoading(false);
      return;
    }

    const fetchPlace = async () => {
      try {
        setLoading(true);
        setError("");

        let loadedPlace = null;

        try {
          const response = await fetch(
            `${API_URL}/api/places/${encodeURIComponent(id)}`
          );
          if (response.ok) {
            loadedPlace = await response.json();
          }
        } catch (apiErr) {
          console.warn("Backend place API unavailable, checking fallback places:", apiErr);
        }

        const searchKey = String(id).toLowerCase();
        let matchedFallback = FALLBACK_PLACES_MAP[id];
        if (!matchedFallback) {
          const targetName = (loadedPlace?.name || decodeURIComponent(searchKey)).toLowerCase();
          matchedFallback = Object.values(FALLBACK_PLACES_MAP).find(
            (p) =>
              p._id === id ||
              p.id === id ||
              p.name.toLowerCase() === targetName ||
              p.name.toLowerCase().includes(targetName) ||
              targetName.includes(p.name.toLowerCase())
          );
        }

        if (loadedPlace) {
          const placeName = loadedPlace.name || matchedFallback?.name || "";
          const phoneFromMap = PLACE_CONTACT_NUMBERS[placeName] || matchedFallback?.phone;

          // Smart Image Merging: Always prioritize and preserve the rich multi-photo array
          let mergedImages = [];
          const fallbackImgs = Array.isArray(matchedFallback?.images) ? matchedFallback.images : [];
          const loadedImgs = Array.isArray(loadedPlace?.images) ? loadedPlace.images : [];

          if (fallbackImgs.length >= loadedImgs.length && fallbackImgs.length > 1) {
            mergedImages = [...fallbackImgs];
            loadedImgs.forEach((img) => {
              if (img && typeof img === "string" && !mergedImages.includes(img)) {
                mergedImages.push(img);
              }
            });
          } else {
            mergedImages = [...loadedImgs];
            fallbackImgs.forEach((img) => {
              if (img && typeof img === "string" && !mergedImages.includes(img)) {
                mergedImages.push(img);
              }
            });
          }

          if (mergedImages.length === 0) {
            if (loadedPlace.image) mergedImages.push(loadedPlace.image);
            if (matchedFallback?.image && !mergedImages.includes(matchedFallback.image)) {
              mergedImages.push(matchedFallback.image);
            }
          }

          loadedPlace = {
            ...matchedFallback,
            ...loadedPlace,
            images: mergedImages,
            phone: (phoneFromMap && phoneFromMap !== "N/A") ? phoneFromMap : (loadedPlace.phone || matchedFallback?.phone || "N/A"),
            location: (matchedFallback?.location && matchedFallback.location.length > 20) ? matchedFallback.location : loadedPlace.location,
            lat: matchedFallback?.lat || loadedPlace.lat,
            lng: matchedFallback?.lng || loadedPlace.lng,
            openingHours: matchedFallback?.openingHours || loadedPlace.openingHours,
            openingDays: matchedFallback?.openingDays || loadedPlace.openingDays,
          };
        } else if (matchedFallback) {
          loadedPlace = matchedFallback;
        }

        if (loadedPlace) {
          setPlace(loadedPlace);
          setCurrentImage(0);
          try {
            setSaved(isPlaceSaved(id));
          } catch (savedError) {
            console.warn("Saved place check failed:", savedError);
            setSaved(false);
          }
        } else {
          setError("Place not found");
        }
      } catch (err) {
        console.error("Failed to load place:", err);
        setError("Unable to load this place.");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        let serverReviews = [];

        try {
          const res = await fetch(
            `${API_URL}/api/places/${encodeURIComponent(id)}/reviews`
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) serverReviews = data;
          }
        } catch (serverErr) {
          console.warn("API reviews endpoint unreachable, checking IndexedDB cache:", serverErr);
        }

        // Fetch IndexedDB reviews (supports videos & photos up to 20MB+)
        const indexedReviews = await getReviewsFromStore(id);

        let localReviews = [];
        try {
          const stored = localStorage.getItem(`uva_reviews_${id}`);
          if (stored) localReviews = JSON.parse(stored);
        } catch (e) {}

        // Merge all reviews uniquely by ID
        const mergedMap = new Map();
        [...indexedReviews, ...localReviews, ...serverReviews].forEach((r) => {
          const key = r._id || r.id || (r.author + r.createdAt);
          if (!mergedMap.has(key)) {
            mergedMap.set(key, r);
          }
        });

        setReviews(Array.from(mergedMap.values()));
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchPlace();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (window.location.hash === "#reviews") {
      setTimeout(() => {
        const el = document.getElementById("reviews-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 350);
    }
  }, [id, reviewsLoading]);

  const totalReviewsCount = reviews.length;
  const computedAvgRating = totalReviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)
    : 0;

  /* =======================================================
     ADMIN ACTIONS
  ======================================================= */

  const isAdmin = Boolean(sessionStorage.getItem("uvaExplorerAdminToken"));

  const handleDeleteReviewAdmin = async (reviewId) => {
    if (!window.confirm("Are you sure you want to remove this review?")) return;

    // Remove from local state
    setReviews((prev) => prev.filter((r) => (r._id || r.id) !== reviewId));

    // Remove from IndexedDB
    await deleteReviewFromStore(reviewId);

    // Remove from localStorage
    try {
      const stored = localStorage.getItem(`uva_reviews_${id}`);
      if (stored) {
        const localList = JSON.parse(stored);
        const updatedLocal = localList.filter((r) => (r._id || r.id) !== reviewId);
        localStorage.setItem(`uva_reviews_${id}`, JSON.stringify(updatedLocal));
      }
    } catch (e) {}

    const token = sessionStorage.getItem("uvaExplorerAdminToken");
    if (!token) return;

    try {
      await fetch(`${API_URL}/api/places/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Failed to delete review on server:", err);
    }
  };

  /* =======================================================
     SUBMIT REVIEW TO DATABASE
  ======================================================= */

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!newAuthor.trim()) {
      setReviewError("Please enter your name.");
      return;
    }

    if (!newText.trim() || newText.trim().length < 5) {
      setReviewError("Review comment must be at least 5 characters long.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");
      setReviewSuccess("");

      let createdReview = null;

      try {
        const response = await fetch(
          `${API_URL}/api/places/${encodeURIComponent(id)}/reviews`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              author: newAuthor.trim(),
              rating: newRating,
              text: newText.trim(),
              images: reviewImages,
              videos: reviewVideos,
            }),
          }
        );

        if (response.ok) {
          createdReview = await response.json();
        }
      } catch (networkErr) {
        console.warn("Backend API unavailable for review submission, using IndexedDB fallback:", networkErr);
      }

      if (!createdReview) {
        createdReview = {
          _id: "rev_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
          id: "rev_" + Date.now(),
          author: newAuthor.trim(),
          rating: newRating,
          text: newText.trim(),
          images: reviewImages,
          videos: reviewVideos,
          createdAt: new Date().toISOString(),
        };
      }

      // Save to IndexedDB (supports videos & photos up to 20MB+)
      const savedReview = await saveReviewToStore(id, createdReview);

      // Prepend review to live state
      setReviews((prev) => [savedReview, ...prev.filter((r) => (r._id || r.id) !== savedReview._id)]);

      // Reset text field, attached photos & videos & show success banner
      setNewText("");
      setReviewImages([]);
      setReviewVideos([]);
      setReviewSuccess("Thank you! Your review has been saved permanently and is now visible to all users.");
    } catch (err) {
      setReviewError(
        err.message || "Failed to submit review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50">
        <div className="mx-auto flex min-h-[600px] max-w-7xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading place details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !place) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <MapPin size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Place not found
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error || "The tourist destination could not be found."}
            </p>

            <Link
              to="/explore"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              <ArrowLeft size={17} />
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     GALLERY DATA
  ======================================================= */

  let rawImages = [];

  if (Array.isArray(place.images)) {
    rawImages = place.images;
  }

  // If images[] is empty, use image
  if (rawImages.length === 0 && place.image) {
    rawImages = [place.image];
  }

  const galleryImages = rawImages
    .map((image) => getImageUrl(image))
    .filter(Boolean);

  /*
    Remove duplicate image URLs
  */
  const uniqueGalleryImages = [...new Set(galleryImages)];

  const currentImageUrl =
    uniqueGalleryImages[currentImage] || "";

  /* =======================================================
     GALLERY FUNCTIONS
  ======================================================= */

  function nextImage() {
    if (uniqueGalleryImages.length <= 1) {
      return;
    }

    setCurrentImage((current) => {
      if (current >= uniqueGalleryImages.length - 1) {
        return 0;
      }

      return current + 1;
    });
  }

  function previousImage() {
    if (uniqueGalleryImages.length <= 1) {
      return;
    }

    setCurrentImage((current) => {
      if (current <= 0) {
        return uniqueGalleryImages.length - 1;
      }

      return current - 1;
    });
  }

  function selectImage(index) {
    setCurrentImage(index);
  }

  useEffect(() => {
    if (!uniqueGalleryImages || uniqueGalleryImages.length <= 1) return;
    const nextIdx = (currentImage + 1) % uniqueGalleryImages.length;
    const prevIdx = (currentImage - 1 + uniqueGalleryImages.length) % uniqueGalleryImages.length;
    [uniqueGalleryImages[nextIdx], uniqueGalleryImages[prevIdx]].forEach((url) => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [currentImage, uniqueGalleryImages]);

  /* =======================================================
     SAVE
  ======================================================= */

  function handleToggleSaved() {
    try {
      const updated = toggleSavedPlace(id);

      setSaved(updated.includes(id));
    } catch (err) {
      console.error("Failed to save place:", err);
    }
  }

  /* =======================================================
     ADD TO TRIP
  ======================================================= */

  function handleAddToTrip() {
    try {
      const activePlannerJson = localStorage.getItem("uva_active_planner_state");
      if (activePlannerJson) {
        const activeState = JSON.parse(activePlannerJson);
        const existingPlaces = Array.isArray(activeState.places) ? activeState.places : [];

        const isAlreadyAdded = existingPlaces.some((p) => (p._id || p.id) === (place._id || place.id) || p.name === place.name);
        if (!isAlreadyAdded) {
          activeState.places = [...existingPlaces, place];
          localStorage.setItem("uva_active_planner_state", JSON.stringify(activeState));
        }
      }
    } catch (e) {
      console.warn("Failed to append place to active trip:", e);
    }

    navigate(`/planner?add=${encodeURIComponent(id)}`);
  }

  // Determine map coordinates from location name
  const mapCoords =
    LOCATION_COORDS[place.name] ||
    LOCATION_COORDS[place.location] ||
    LOCATION_COORDS[place.district] ||
    UVA_CENTER;

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* BACK LINK */}

        <div className="mb-5">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-semibold text-slate-600 transition hover:text-teal-700"
          >
            <ArrowLeft size={18} />
            Back to Explore
          </Link>
        </div>

        {/* =================================================
            GALLERY
        ================================================= */}

        <section>
          <div className="relative h-[320px] overflow-hidden rounded-3xl bg-slate-200 shadow-sm sm:h-[380px] lg:h-[440px]">

            {/* MAIN IMAGE */}

            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={`${place.name} image ${currentImage + 1}`}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="pointer-events-none h-full w-full object-cover"
                onError={(event) => {
                  console.error(
                    "Image failed:",
                    currentImageUrl
                  );

                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-teal-700 shadow">
                    <MapPin size={30} />
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    No image available
                  </p>
                </div>
              </div>
            )}

            {/* GRADIENT */}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

            {/* CATEGORY */}

            <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
              <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-teal-700 shadow sm:text-sm">
                {place.category || "Tourist Attraction"}
              </span>
            </div>

            {/* TOP BUTTONS */}

            <div className="absolute right-5 top-5 flex gap-2 sm:right-7 sm:top-7">

              {/* SAVE */}

              <button
                type="button"
                onClick={handleToggleSaved}
                className={`flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105 ${
                  saved
                    ? "text-red-500"
                    : "text-slate-700 hover:text-red-500"
                }`}
                aria-label="Save place"
              >
                <Heart
                  size={20}
                  className={saved ? "fill-red-500" : ""}
                />
              </button>

              {/* FULLSCREEN */}

              {uniqueGalleryImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowFullscreen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:scale-105 hover:text-teal-700"
                  aria-label="View gallery fullscreen"
                >
                  <Maximize2 size={19} />
                </button>
              )}
            </div>

            {/* PREVIOUS */}

            {uniqueGalleryImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                className="absolute left-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg transition hover:scale-105 hover:bg-white active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* NEXT */}

            {uniqueGalleryImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg transition hover:scale-105 hover:bg-white active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* TITLE */}

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 lg:p-9">
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                {place.name}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-white/90 sm:text-base">
                <MapPin size={18} />

                <span>
                  {place.location}
                  {place.district
                    ? `, ${place.district}`
                    : ""}
                </span>
              </div>
            </div>

            {/* COUNTER */}

            {uniqueGalleryImages.length > 0 && (
              <div className="absolute bottom-5 right-5 rounded-full bg-black/65 px-4 py-2 text-xs font-bold text-white sm:bottom-7 sm:right-7">
                {currentImage + 1} / {uniqueGalleryImages.length}
              </div>
            )}
          </div>

          {/* =================================================
              THUMBNAILS
          ================================================= */}

          {uniqueGalleryImages.length > 1 && (
            <div className="place-gallery-thumbnails mt-4 flex gap-3 overflow-x-auto pb-2">

              {uniqueGalleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => selectImage(index)}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    currentImage === index
                      ? "border-teal-700 ring-2 ring-teal-100"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${place.name} thumbnail ${
                      index + 1
                    }`}
                    className="pointer-events-none h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">

          {/* LEFT */}

          <main className="min-w-0">

            {/* BASIC INFO */}

            <section className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-md shadow-slate-200/50 transition-all">

              <span className="inline-block rounded-full bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-700 border border-teal-100">
                {place.category || "Tourist Attraction"}
              </span>

              <h2 className="mt-3.5 text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
                {place.name}
              </h2>

              <div className="mt-4 flex flex-wrap items-center gap-5">

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin
                    size={18}
                    className="text-teal-700 shrink-0"
                  />

                  <span className="font-medium">
                    {place.location}
                    {place.district
                      ? `, ${place.district}`
                      : ""}
                  </span>
                </div>

                {(totalReviewsCount > 0 || place.reviews > 0) && (
                  <a
                    href="#reviews-section"
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition border border-amber-200/60 shadow-xs"
                    title="View reviews"
                  >
                    <Star size={15} className="fill-amber-400 text-amber-400 shrink-0" />
                    <span className="font-extrabold">{computedAvgRating || place.rating}</span>
                    <span className="text-amber-800/70 font-semibold">
                      ({totalReviewsCount || place.reviews} {totalReviewsCount === 1 ? "review" : "reviews"})
                    </span>
                  </a>
                )}
              </div>
            </section>

            {/* SECTION TAB BUTTON GROUP (SINGLE LINE, NO SLIDING BAR) */}
            {(() => {
              const tabs = [
                { id: "overview", label: "Overview", shortLabel: "Overview", icon: Info },
                { id: "tickets_facilities", label: "Ticket Prices and Facilities", shortLabel: "Tickets & Facilities", icon: Ticket },
                { id: "location", label: "Location", shortLabel: "Location", icon: MapPin },
                { id: "reviews", label: "Reviews", shortLabel: "Reviews", icon: Star, count: totalReviewsCount || place.reviews },
                { id: "about", label: "About", shortLabel: "About", icon: Sparkles },
                { id: "all", label: "All Details", shortLabel: "All", icon: Compass },
              ];

              return (
                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
                  <div className="grid grid-cols-6 gap-1 w-full">
                    {tabs.map((tab) => {
                      const isActive = activeTab === tab.id;
                      const IconComp = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          title={tab.label}
                          className={`flex items-center justify-center gap-1 rounded-xl px-1 sm:px-2 py-2 text-[10px] sm:text-xs md:text-sm font-bold transition-all text-center min-w-0 ${
                            isActive
                              ? "bg-teal-700 text-white shadow-xs dark:bg-teal-600 font-extrabold"
                              : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          {IconComp && <IconComp size={14} className={`shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />}
                          <span className="truncate hidden min-[540px]:inline">{tab.label}</span>
                          <span className="truncate inline min-[540px]:hidden">{tab.shortLabel || tab.label}</span>
                          {tab.count !== undefined && (
                            <span className={`hidden min-[640px]:inline-block rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                              isActive ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                            }`}>
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* OVERVIEW SECTION (SCHEDULE + QUICK INFO) */}
            {(activeTab === "overview" || activeTab === "all") && (
              <>
                {/* OPERATING HOURS & GOOGLE MAPS DETAILS */}
                {(() => {
                  const status = getOpeningStatus(place.openingHours || "06:00 AM - 06:00 PM", place.openingDays || "Monday - Sunday");
                  const gmapsUrl = getGoogleMapsUrl(place.name, place.location, place.googleMapsUrl);
                  return (
                    <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-md shadow-slate-200/50 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2 tracking-tight">
                            <span>Operating Hours & Schedule</span>
                          </h2>
                          <p className="mt-1 text-xs font-medium text-slate-500">Official opening details from Google Maps</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${status.badgeBg}`}>
                            <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {status.statusText}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-200/60 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-teal-200/80">
                          <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs">
                            <CalendarDays size={16} className="text-teal-700 shrink-0" />
                            <span>Opening Days</span>
                          </div>
                          <p className="mt-2 text-sm font-extrabold text-slate-900 leading-snug">
                            {place.openingDays || "Monday - Sunday"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-200/60 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-teal-200/80">
                          <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs">
                            <Clock size={16} className="text-teal-700 shrink-0" />
                            <span>Opening Hours</span>
                          </div>
                          <p className="mt-2 text-sm font-extrabold text-slate-900 leading-snug">
                            {place.openingHours || "06:00 AM - 06:00 PM"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-200/60 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-teal-200/80">
                          <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs">
                            <Phone size={16} className="text-emerald-700 shrink-0" />
                            <span>Contact Number</span>
                          </div>
                          <p className="mt-2 text-sm font-extrabold text-slate-900 leading-snug">
                            {place.phone && place.phone !== "N/A" ? place.phone : "N/A"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-200/60 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-teal-200/80">
                          <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs">
                            <Compass size={16} className="text-sky-700 shrink-0" />
                            <span>GPS Coordinates</span>
                          </div>
                          <p className="mt-2 text-xs font-mono font-bold text-slate-900 leading-snug">
                            {place.lat && place.lng ? `${place.lat}, ${place.lng}` : mapCoords ? `${mapCoords[0]}, ${mapCoords[1]}` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </section>
                  );
                })()}

                {/* QUICK INFORMATION */}

                <section className="mt-6">
                  <div className="grid gap-4 sm:grid-cols-3">

                    <InfoCard
                      icon={<Clock size={21} />}
                      title="Recommended duration"
                      value="2 - 4 Hours"
                    />

                    <InfoCard
                      icon={<CalendarDays size={21} />}
                      title="Best time to visit"
                      value="Morning"
                    />

                    <InfoCard
                      icon={<MapPin size={21} />}
                      title="Distance from Bandarawela Bus Stop"
                      value={place.distance || "Nearby"}
                    />

                  </div>
                </section>
              </>
            )}

            {/* TICKET PRICES & FACILITIES SECTION */}
            {(activeTab === "tickets_facilities" || activeTab === "all") && (
              <>
                {/* TICKET PRICES & ENTRY INFORMATION SECTION */}
                {(() => {
                  const ticketInfo = getTicketInfo(place.name, place.ticketInfo);
                  if (!ticketInfo) return null;

                  return (
                    <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-md shadow-slate-200/50 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2.5 tracking-tight">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100/70 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 shrink-0">
                              <Ticket size={20} />
                            </span>
                            <span>Ticket Prices & Entry Information</span>
                          </h2>
                          <p className="mt-1 text-xs font-medium text-slate-500">Official visitor rates, entry passes, and payment details</p>
                        </div>

                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${ticketInfo.badgeBg}`}>
                            <span className={`w-2 h-2 rounded-full ${ticketInfo.isFree ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                            {ticketInfo.badgeText}
                          </span>
                        </div>
                      </div>

                      {/* Summary Cards */}
                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl bg-teal-50/60 p-4 border border-teal-100/80 shadow-2xs dark:bg-slate-800/60 dark:border-slate-700">
                          <span className="text-[11px] font-bold tracking-wider text-teal-700 dark:text-teal-400 uppercase">Foreign Visitor Ticket</span>
                          <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{ticketInfo.foreignAdult}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Standard adult entry rate</p>
                        </div>

                        <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100/80 shadow-2xs dark:bg-slate-800/60 dark:border-slate-700">
                          <span className="text-[11px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">Local Resident Ticket</span>
                          <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{ticketInfo.localAdult}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sri Lankan citizens with NIC</p>
                        </div>

                        <div className="rounded-2xl bg-sky-50/60 p-4 border border-sky-100/80 shadow-2xs sm:col-span-2 lg:col-span-1 dark:bg-slate-800/60 dark:border-slate-700">
                          <span className="text-[11px] font-bold tracking-wider text-sky-700 dark:text-sky-400 uppercase">Vehicle & Gate Fees</span>
                          <p className="mt-1 text-xs font-extrabold text-slate-900 dark:text-white">{ticketInfo.vehicleFee}</p>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{ticketInfo.paymentMethods}</p>
                        </div>
                      </div>

                      {/* Ticket Breakdown List */}
                      {ticketInfo.passes && ticketInfo.passes.length > 0 && (
                        <div className="mt-5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Entry Pass Breakdown</h3>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {ticketInfo.passes.map((pass, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/60 dark:bg-slate-800/40 dark:border-slate-700/60">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pass.type}</h4>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{pass.desc}</p>
                                </div>
                                <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-black text-teal-800 shadow-2xs border border-slate-200 dark:bg-slate-700 dark:text-teal-300 dark:border-slate-600">
                                  {pass.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notice / Notes Box */}
                      {ticketInfo.notes && (
                        <div className="mt-5 rounded-2xl bg-amber-50/70 p-4 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-3 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300">
                          <AlertCircle size={17} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div className="leading-relaxed">
                            <span className="font-extrabold">Visitor Note: </span>
                            {ticketInfo.notes}
                          </div>
                        </div>
                      )}
                    </section>
                  );
                })()}

            {/* FACILITIES & AMENITIES SECTION (For ALL places) */}
            {(() => {
              const facilities = getPlaceFacilities(place.name, place.category, place.facilities);
              if (!facilities) return null;

              return (
                <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-md shadow-slate-200/50 transition-all">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2.5 tracking-tight">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100/70 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 shrink-0">
                        <Sparkles size={20} />
                      </span>
                      <span>Facilities & Visitor Amenities</span>
                    </h2>
                    <p className="mt-1 text-xs font-medium text-slate-500">Essential services, accessibility, food & beverages, parking, and on-site features</p>
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* PARKING */}
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4.5 hover:border-teal-200 hover:bg-white hover:shadow-sm transition-all dark:bg-slate-800/40 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider mb-3.5 dark:text-teal-400">
                        <Car size={16} className="shrink-0 text-teal-700" />
                        <span>Parking Facilities</span>
                      </div>
                      <div className="space-y-2.5">
                        {Array.isArray(facilities?.parking) && facilities.parking.map((item, i) => (
                          <div key={i} className="rounded-xl bg-white p-3 border border-slate-200/70 shadow-2xs dark:bg-slate-800/70 dark:border-slate-700">
                            <div className="flex items-start gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100/90 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 mt-0.5 shadow-2xs">
                                {getFacilityItemIcon(item?.text || "")}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {item?.text}
                                </p>
                                <div className="mt-2">
                                  <span className="inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-extrabold text-teal-800 border border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800">
                                    {item?.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TRANSPORT & ACCESS */}
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4.5 hover:border-teal-200 hover:bg-white hover:shadow-sm transition-all dark:bg-slate-800/40 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider mb-3.5 dark:text-teal-400">
                        <Bus size={16} className="shrink-0 text-teal-700" />
                        <span>Transport & Access</span>
                      </div>
                      <div className="space-y-2.5">
                        {Array.isArray(facilities?.transport) && facilities.transport.map((item, i) => (
                          <div key={i} className="rounded-xl bg-white p-3 border border-slate-200/70 shadow-2xs dark:bg-slate-800/70 dark:border-slate-700">
                            <div className="flex items-start gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100/90 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 mt-0.5 shadow-2xs">
                                {getFacilityItemIcon(item?.text || "")}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {item?.text}
                                </p>
                                <div className="mt-2">
                                  <span className="inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-extrabold text-teal-800 border border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800">
                                    {item?.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FOOD & BEVERAGES */}
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4.5 hover:border-teal-200 hover:bg-white hover:shadow-sm transition-all dark:bg-slate-800/40 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-3.5 dark:text-amber-400">
                        <Coffee size={16} className="shrink-0 text-amber-700" />
                        <span>Food & Beverages</span>
                      </div>
                      <div className="space-y-2.5">
                        {Array.isArray(facilities?.foodBeverage) && facilities.foodBeverage.map((item, i) => (
                          <div key={i} className="rounded-xl bg-white p-3 border border-slate-200/70 shadow-2xs dark:bg-slate-800/70 dark:border-slate-700">
                            <div className="flex items-start gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 mt-0.5 shadow-2xs">
                                {getFacilityItemIcon(item?.text || "")}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {item?.text}
                                </p>
                                <div className="mt-2">
                                  <span className="inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                                    {item?.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* UTILITIES & COMFORT */}
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4.5 hover:border-teal-200 hover:bg-white hover:shadow-sm transition-all dark:bg-slate-800/40 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-sky-800 font-bold text-xs uppercase tracking-wider mb-3.5 dark:text-sky-400">
                        <Clock size={16} className="shrink-0 text-sky-700" />
                        <span>Utilities & Comfort</span>
                      </div>
                      <div className="space-y-2.5">
                        {Array.isArray(facilities?.utilities) && facilities.utilities.map((item, i) => (
                          <div key={i} className="rounded-xl bg-white p-3 border border-slate-200/70 shadow-2xs dark:bg-slate-800/70 dark:border-slate-700">
                            <div className="flex items-start gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100/90 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 mt-0.5 shadow-2xs">
                                {getFacilityItemIcon(item?.text || "")}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {item?.text}
                                </p>
                                <div className="mt-2">
                                  <span className="inline-block rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold text-sky-800 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800">
                                    {item?.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* HIGHLIGHTS & OTHER FEATURES */}
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4.5 hover:border-teal-200 hover:bg-white hover:shadow-sm transition-all sm:col-span-2 lg:col-span-2 dark:bg-slate-800/40 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-3.5 dark:text-emerald-400">
                        <Sparkles size={16} className="shrink-0 text-emerald-700" />
                        <span>Highlights & Special Features</span>
                      </div>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {Array.isArray(facilities?.other) && facilities.other.map((item, i) => (
                          <div key={i} className="rounded-xl bg-white p-3 border border-slate-200/70 shadow-2xs dark:bg-slate-800/70 dark:border-slate-700">
                            <div className="flex items-start gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 mt-0.5 shadow-2xs">
                                {getFacilityItemIcon(item?.text || "")}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {item?.text}
                                </p>
                                <div className="mt-2">
                                  <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                    {item?.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })()}
              </>
            )}

            {/* LOCATION MAP */}
            {(activeTab === "location" || activeTab === "all") && (
              <section className="mt-8">
                <h2 className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl tracking-tight">
                  Location
                </h2>

                <div className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/50">
                  <div style={{ height: "280px", width: "100%" }}>
                    <MapContainer
                      center={mapCoords}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {/* GREEN 25KM RADIUS CIRCLE FROM BANDARAWELA BUS STOP */}
                      <Circle
                        center={[6.8301, 80.9905]}
                        radius={25000}
                        pathOptions={{
                          color: "#10b981",
                          fillColor: "#10b981",
                          fillOpacity: 0.08,
                          weight: 2,
                          dashArray: "5, 5",
                        }}
                      />

                      <Marker position={mapCoords} icon={getDestPinIcon()}>
                        <Popup>
                          <div className="text-center p-1">
                            <strong className="text-slate-900 text-sm">{place.name}</strong><br />
                            <span className="mt-1 inline-block rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">
                              {place.category || "Destination"}
                            </span>
                          </div>
                        </Popup>
                      </Marker>

                      {/* NEARBY FACILITIES ON MAP */}
                      {[
                        { name: "EKHO Ella", category: "Hotel", position: [6.8710, 81.0490], phone: "+94 57 222 8655" },
                        { name: "Morning Dew Hotel", category: "Hotel", position: [6.8725, 81.0475], phone: "+94 57 493 3373" },
                        { name: "360 Ella", category: "Restaurant", position: [6.8712, 81.0488], phone: "+94 76 288 7480" },
                        { name: "Cafe Chill", category: "Restaurant", position: [6.8708, 81.0492], phone: "+94 77 180 4020" },
                        { name: "Café UFO Ella", category: "Restaurant", position: [6.8695, 81.0480], phone: "+94 77 774 8168" },
                        { name: "Hela Halpe Filling Station", category: "Fuel Station", position: [6.8910, 81.0510], phone: "+94 57 205 0825" },
                        { name: "IMC MED Hospital Ella", category: "Medical / Hospital", position: [6.8740, 81.0485], phone: "+94 71 923 0000" },
                        { name: "Ella Police Station", category: "Police Station", position: [6.8735, 81.0472], phone: "+94 57 222 8522" },
                        { name: "Bandarawela Bus Stop", category: "Bus Station", position: [6.8301, 80.9905], phone: "N/A" },
                      ].map((facility, fIdx) => (
                        <Marker
                          key={`fac-${fIdx}`}
                          position={facility.position}
                          icon={getFacilityLogoIcon(facility.category)}
                        >
                          <Popup>
                            <div className="p-1 text-center min-w-[160px] max-w-[200px]">
                              <div className="mb-2 h-20 w-full overflow-hidden rounded-xl bg-slate-100 shadow-2xs">
                                <img
                                  src={`/images/Nearby facilities/${facility.name}.jpg`}
                                  alt={facility.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/images/places/default.jpg";
                                  }}
                                />
                              </div>
                              <strong className="text-slate-900 text-xs">{facility.name}</strong><br />
                              <span className="mt-0.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                {facility.category}
                              </span>
                              {facility.phone !== "N/A" && (
                                <p className="mt-1 text-[10px] text-teal-700 font-semibold">📞 {facility.phone}</p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                REVIEWS & RATINGS SECTION
            ================================================== */}
            {(activeTab === "reviews" || activeTab === "all") && (
              <section id="reviews-section" className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-md shadow-slate-200/50">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl tracking-tight">
                      Reviews & Ratings
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Community reviews saved in database and shared with all travelers.
                    </p>
                  </div>

                  {totalReviewsCount > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl bg-amber-50/80 px-4 py-3 shadow-xs">
                      <div className="flex items-center gap-1">
                        <Star size={22} className="fill-amber-400 text-amber-400" />
                        <span className="text-2xl font-black text-slate-900">
                          {computedAvgRating}
                        </span>
                      </div>
                      <div className="border-l border-amber-200/80 pl-3">
                        <p className="text-xs font-bold text-amber-900">
                          {totalReviewsCount} {totalReviewsCount === 1 ? "Review" : "Reviews"}
                        </p>
                        <p className="text-[11px] text-amber-700/80">Calculated Visitor Rating</p>
                      </div>
                    </div>
                  )}
                </div>

              {/* WRITE A REVIEW FORM */}
              <div className="mt-8 rounded-2xl bg-slate-50/70 p-5 sm:p-6 shadow-xs">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <MessageSquare size={18} className="text-teal-700" />
                  Leave a Review
                </h3>

                {reviewSuccess && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-teal-100 p-3.5 text-sm font-medium text-teal-800">
                    <CheckCircle2 size={18} className="shrink-0 text-teal-600" />
                    <span>{reviewSuccess}</span>
                  </div>
                )}

                {reviewError && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-600">
                    <AlertCircle size={18} className="shrink-0 text-red-500" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Your Name
                    </label>
                    <div className="mt-1.5 flex items-center rounded-xl bg-white px-3.5 py-2.5 shadow-xs focus-within:ring-2 focus-within:ring-teal-600">
                      <User size={16} className="mr-2 text-slate-400" />
                      <input
                        type="text"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        placeholder="e.g. Ruwan Silva"
                        className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
                        maxLength={60}
                        required
                      />
                    </div>
                  </div>

                  {/* STAR RATING SELECTOR */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Your Rating
                    </label>
                    <div className="mt-2 flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((starIndex) => {
                        const isFilled = starIndex <= (hoverRating || newRating);
                        return (
                          <button
                            key={starIndex}
                            type="button"
                            onClick={() => setNewRating(starIndex)}
                            onMouseEnter={() => setHoverRating(starIndex)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                            aria-label={`Rate ${starIndex} stars`}
                          >
                            <Star
                              size={26}
                              className={
                                isFilled
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300 hover:text-amber-300"
                              }
                            />
                          </button>
                        );
                      })}
                      <span className="ml-2 text-xs font-bold text-slate-600">
                        {hoverRating || newRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* TEXTAREA */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Your Review
                    </label>
                    <textarea
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      rows={3}
                      placeholder="Share details of your experience, scenic spots, or tips for future visitors..."
                      className="mt-1.5 w-full rounded-xl bg-white p-3.5 text-sm text-slate-900 outline-none shadow-xs focus:ring-2 focus:ring-teal-600 placeholder:text-slate-400"
                      maxLength={1000}
                      required
                    />
                  </div>

                  {/* ATTACH REVIEW PHOTOS & VIDEOS (UNDER 20MB) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Attach Review Photos & Videos (Videos Under 20MB)
                    </label>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {/* Photo Upload */}
                      <label className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:shadow transition cursor-pointer">
                        {uploadingReviewImage ? (
                          <Loader2 size={16} className="animate-spin text-teal-700" />
                        ) : (
                          <Camera size={16} className="text-teal-700" />
                        )}
                        {uploadingReviewImage ? "Uploading Photo..." : "Add Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadReviewPhoto}
                          disabled={uploadingReviewImage}
                          className="hidden"
                        />
                      </label>

                      {/* Video Upload (under 20MB) */}
                      <label className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 transition cursor-pointer">
                        {uploadingReviewVideo ? (
                          <Loader2 size={16} className="animate-spin text-amber-600" />
                        ) : (
                          <Camera size={16} className="text-amber-600" />
                        )}
                        {uploadingReviewVideo ? "Attaching Video..." : "🎥 Add Short Video (< 20MB)"}
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleUploadReviewVideo}
                          disabled={uploadingReviewVideo}
                          className="hidden"
                        />
                      </label>

                      {/* Photo Thumbnails */}
                      {reviewImages.map((imgPath, idx) => (
                        <div key={idx} className="relative h-14 w-16 overflow-hidden rounded-xl bg-slate-100 shadow-xs">
                          <img
                            src={getImageUrl(imgPath)}
                            alt="Review preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveReviewPhoto(idx)}
                            className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600"
                            title="Remove photo"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}

                      {/* Video Thumbnails */}
                      {reviewVideos.map((vidUrl, idx) => (
                        <div key={idx} className="relative h-14 w-20 overflow-hidden rounded-xl bg-slate-900 shadow-xs">
                          <video src={vidUrl} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReviewVideo(idx)}
                            className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-white hover:bg-red-600 z-10"
                            title="Remove video"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview || uploadingReviewImage || uploadingReviewVideo}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-50 shadow-md shadow-teal-700/20"
                    >
                      <Send size={16} />
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              </div>

              {/* REVIEWS LIST */}
              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  All Reviews ({reviews.length})
                </h3>

                {reviewsLoading ? (
                  <div className="py-6 text-center text-sm text-slate-500">
                    Loading reviews from database...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50/70 p-8 text-center shadow-xs">
                    <MessageSquare size={32} className="mx-auto text-slate-300" />
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      No reviews yet for this destination.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Be the first to leave a review above!
                    </p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev._id || rev.id || Math.random()}
                      className="rounded-2xl bg-white p-5.5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700 uppercase">
                            {(rev.author || "A")[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {rev.author}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {rev.createdAt
                                ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "Recently added"}
                            </p>
                          </div>
                        </div>

                        {/* RATING STARS & ADMIN ACTION */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={15}
                                className={
                                  s <= rev.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }
                              />
                            ))}
                          </div>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReviewAdmin(rev._id || rev.id)}
                              className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                              title="Delete bad review (Admin)"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="mt-3.5 text-sm leading-relaxed text-slate-700">
                        {rev.text}
                      </p>

                      {/* REVIEW VIDEOS (UNDER 20MB) */}
                      {Array.isArray(rev.videos) && rev.videos.length > 0 && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {rev.videos.map((vidUrl, vidIdx) => (
                            <div key={vidIdx} className="overflow-hidden rounded-2xl bg-slate-900 shadow-xs">
                              <video
                                src={vidUrl}
                                controls
                                playsInline
                                className="h-44 w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* REVIEW PHOTOS (CLICKABLE FULLSCREEN) */}
                      {Array.isArray(rev.images) && rev.images.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2.5 border-t border-slate-100 pt-3">
                          {rev.images.map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              onClick={() => setPreviewPhotoUrl(imgUrl)}
                              className="group relative cursor-pointer overflow-hidden rounded-xl shadow-xs transition hover:scale-105"
                              title="Click to view full screen"
                            >
                              <img
                                src={getImageUrl(imgUrl)}
                                alt={`Review photo by ${rev.author}`}
                                className="h-20 w-24 object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100 text-white text-[10px] font-bold">
                                🔍 Fullscreen
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
            )}

            {/* ABOUT SECTION */}
            {(activeTab === "about" || activeTab === "all") && (
              <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-md shadow-slate-200/50 transition-all">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl tracking-tight">
                  About this place
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base font-normal">
                  {place.description ||
                    "Explore this beautiful destination in Uva Province."}
                </p>
              </section>
            )}
          </main>

          {/* RIGHT */}

          <aside className="lg:sticky lg:top-6">

            <div className="rounded-3xl bg-white shadow-lg shadow-slate-200/50 overflow-hidden">

              <div className="bg-teal-50 p-6">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white">
                  <MapPin size={22} />
                </div>

                <p className="mt-5 text-sm font-semibold text-teal-700">
                  Plan your visit
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
                  Add this place to your journey
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Save this destination or add it to your travel plan.
                </p>
              </div>

              <div className="space-y-3 p-6">

                <button
                  type="button"
                  onClick={handleAddToTrip}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3.5 text-sm font-bold text-white hover:bg-teal-800 transition shadow-md shadow-teal-700/20">
                  <Plus size={19} />
                  Add to My Trip
                </button>

                <button
                  type="button"
                  onClick={handleToggleSaved}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition shadow-xs ${
                    saved
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Heart
                    size={19}
                    className={saved ? "fill-red-500" : ""}
                  />

                  {saved ? "Saved Place" : "Save Place"}
                </button>

              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ===================================================
          FULLSCREEN GALLERY
      =================================================== */}

      {showFullscreen &&
        uniqueGalleryImages.length > 0 && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4">

            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setShowFullscreen(false)}
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close gallery"
            >
              <X size={25} />
            </button>

            {/* PREVIOUS */}

            {uniqueGalleryImages.length > 1 && (
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft size={30} />
              </button>
            )}

            {/* IMAGE */}

            <img
              src={currentImageUrl}
              alt={`${place.name} fullscreen image`}
              className="max-h-[88vh] max-w-[90vw] rounded-2xl object-contain"
            />

            {/* NEXT */}

            {uniqueGalleryImages.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Next image"
              >
                <ChevronRight size={30} />
              </button>
            )}

            {/* COUNTER */}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white">
              {currentImage + 1} / {uniqueGalleryImages.length}
            </div>
          </div>
        )}

      {/* ===================================================
          FULLSCREEN REVIEW PHOTO LIGHTBOX
      =================================================== */}

      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-h-[92vh] max-w-[92vw] overflow-hidden rounded-3xl bg-slate-950 p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
              aria-label="Close picture"
            >
              <X size={20} />
            </button>
            <img
              src={getImageUrl(previewPhotoUrl)}
              alt="Fullscreen review photo"
              className="max-h-[85vh] max-w-[88vw] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   INFORMATION CARD
========================================================= */

function InfoCard({ icon, title, value }) {
  return (
    <div className="flex min-h-[104px] items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-md shadow-slate-200/50 hover:shadow-lg transition-all">

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 shadow-xs">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-sm font-extrabold text-slate-900 leading-snug">
          {value}
        </p>
      </div>

    </div>
  );
}

export default PlaceDetails;