import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Plus,
  Trash2,
  Edit,
  Check,
  AlertCircle,
  LogOut,
  Image as ImageIcon,
  X,
  Save,
  MapPin,
  Star,
  Upload,
  Loader2,
  MessageSquare,
  Search,
  Building2,
  Phone,
  Compass,
  Megaphone,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  ExternalLink,
  Users,
  FileSpreadsheet,
  Download,
  Ticket,
  Car,
  Bus,
  Coffee,
  Sparkles,
} from "lucide-react";
import { fetchAllAdminAds, updateAdStatus, deleteAd as removeAdService } from "../../services/adService";
import { getAllReviewsFromStore, deleteReviewFromStore } from "../../utils/reviewStore";
import { fetchAllUserLogs } from "../../services/userLogService";
import { fetchAllBuses, createBusService, updateBusService, deleteBusService } from "../../services/busService";
import { getTicketInfo, getPlaceFacilities } from "../../data/placeDetailsData";

const API_URL = "http://localhost:5000";
const TOKEN_KEY = "uvaExplorerAdminToken";

// Coordinates of Bandarawela Central Bus Terminal / Bus Stop
const BANDARAWELA_BUS_STOP = { lat: 6.833055, lng: 80.985833 };

/**
 * Automatically calculates road distance in kilometers from Bandarawela Bus Stand.
 */
function calcDistanceFromBandarawela(destLat, destLng) {
  if (!destLat || !destLng || isNaN(destLat) || isNaN(destLng)) return "0km";
  const R = 6371; // Earth's radius in km
  const dLat = (destLat - BANDARAWELA_BUS_STOP.lat) * (Math.PI / 180);
  const dLon = (destLng - BANDARAWELA_BUS_STOP.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(BANDARAWELA_BUS_STOP.lat * (Math.PI / 180)) *
      Math.cos(destLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDist = R * c;
  
  // Apply winding hill country road factor (~1.22x)
  const roadDist = Math.max(1, Math.round(straightDist * 1.22));
  return `${roadDist}km`;
}

// Custom pin icon for the admin map location picker
const pickerPinIcon = L.divIcon({
  className: "custom-picker-pin",
  html: `
    <div style="background-color: #0d9488; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); transform: translate(-50%, -50%);">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function MapClickHandler({ onSelectCoords }) {
  useMapEvents({
    click(e) {
      onSelectCoords(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

const DEFAULT_IMAGE = "/images/places/default.jpg";

const emptyForm = {
  name: "",
  location: "",
  district: "Badulla",
  province: "Uva",
  category: "Sightseeing",
  distance: "10km",
  rating: 4.5,
  reviews: 0,
  description: "",
  image: DEFAULT_IMAGE,
  images: [],
  lat: 6.82977,
  lng: 80.98457,
  openingDays: "Monday - Sunday",
  openingHours: "06:00 AM - 06:00 PM",
  googleMapsUrl: "",
  ticketInfo: {
    hasTicket: false,
    badgeText: "Ticket Required",
    foreignAdult: "",
    localAdult: "",
    vehicleFee: "",
    paymentMethods: "",
    notes: "",
    passes: [],
  },
  facilities: {
    parking: [],
    transport: [],
    foodBeverage: [],
    utilities: [],
    other: [],
  },
};

function Admin() {
  // State Management

  const [places, setPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState("places"); // "places" | "facilities" | "reviews" | "ads"
  const [adminReviews, setAdminReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [reviewSearch, setReviewSearch] = useState("");

  // Ad Management State
  const [adminAds, setAdminAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [previewAdImage, setPreviewAdImage] = useState(null);

  // Bus Services Management State
  const [adminBuses, setAdminBuses] = useState([]);
  const [busesLoading, setBusesLoading] = useState(false);
  const [editingBusId, setEditingBusId] = useState(null);
  const [busSearch, setBusSearch] = useState("");
  const [busFormData, setBusFormData] = useState({
    name: "",
    routeNumber: "",
    origin: "",
    destination: "",
    via: "",
    fare: "",
    busType: "",
    phone: "",
    conductorPhone: "",
    hotline: "1955 (NTC Hotline)",
    description: "",
    image: "/images/Nearby facilities/Colombo Bandarawela Bus.jpg",
    isInternal: false,
    busTimes: "05:30 AM, 08:45 AM, 02:50 PM, 09:30 PM",
  });

  const loadAdminBuses = useCallback(async () => {
    setBusesLoading(true);
    try {
      const data = await fetchAllBuses();
      setAdminBuses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Bus fetch error:", e);
    } finally {
      setBusesLoading(false);
    }
  }, []);

  const loadAdminAds = useCallback(async () => {
    setAdsLoading(true);
    try {
      const data = await fetchAllAdminAds();
      setAdminAds(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Ad fetch error:", e);
    } finally {
      setAdsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminAds();
  }, [loadAdminAds]);

  const handleUpdateAdStatus = async (adId, newStatus, durationDays) => {
    try {
      const updated = await updateAdStatus(adId, { status: newStatus, durationDays });
      if (updated) {
        setAdminAds((prev) => prev.map((a) => (a._id === adId ? updated : a)));
        setSuccess(`Ad status updated to ${newStatus}!`);
      }
    } catch (e) {
      setError("Failed to update ad status.");
    }
  };

  const handleDeleteAdItem = async (adId) => {
    if (!window.confirm("Are you sure you want to delete this ad submission?")) return;
    try {
      await removeAdService(adId);
      setAdminAds((prev) => prev.filter((a) => a._id !== adId));
      setSuccess("Advertisement deleted successfully!");
    } catch (e) {
      setError("Failed to delete advertisement.");
    }
  };

  // User Activity Logs State
  const [userLogs, setUserLogs] = useState([]);
  const [userLogsLoading, setUserLogsLoading] = useState(false);
  const [userLogSearch, setUserLogSearch] = useState("");

  const loadUserLogs = useCallback(async () => {
    try {
      setUserLogsLoading(true);
      const data = await fetchAllUserLogs();
      setUserLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("User log fetch error:", e);
    } finally {
      setUserLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "user-logs") {
      loadUserLogs();
    }
  }, [activeTab, loadUserLogs]);

  // Facility Management State
  const emptyFacilityForm = {
    name: "",
    type: "Hotel",
    location: "",
    description: "",
    phone: "+94 ",
    rating: 4.5,
    reviews: 12,
    image: "",
    lat: 6.8301,
    lng: 80.9905,
    openingDays: "Monday - Sunday",
    openingHours: "08:00 AM - 08:00 PM",
    googleMapsUrl: "",
  };

  const [adminFacilities, setAdminFacilities] = useState([]);
  const [facilityForm, setFacilityForm] = useState(emptyFacilityForm);
  const [editingFacilityId, setEditingFacilityId] = useState(null);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [savingFacility, setSavingFacility] = useState(false);
  const [deletingFacilityId, setDeletingFacilityId] = useState(null);
  const [facilitySearch, setFacilitySearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // null = idle, "main" = uploading main image, number = uploading gallery[index]
  const [uploadingSlot, setUploadingSlot] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    ...emptyForm,
    images: [],
  });

  /*
  ============================================================
  REFS
  ============================================================
  */

  // Prevent React StrictMode from running the initial request twice
  const initialFetchDone = useRef(false);

  // Prevent multiple fetch requests at the same time
  const fetchInProgress = useRef(false);

  // Store current AbortController
  const abortControllerRef = useRef(null);

  /*
  ============================================================
  CATEGORIES
  ============================================================
  */

  const categories = [
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
  ];

  /*
  ============================================================
  AUTHENTICATION
  ============================================================
  */

  const getAdminToken = useCallback(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Unable to access sessionStorage:", error);
      return null;
    }
  }, []);

  const handleUnauthorized = useCallback(() => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem("adminToken");
      localStorage.removeItem("adminToken");
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Unable to clear admin token:", error);
    }

    window.location.replace("/admin/login");
  }, []);

  /*
  ============================================================
  IMAGE URL
  ============================================================
  */

  const getImageUrl = useCallback((image) => {
    if (!image || typeof image !== "string") {
      return DEFAULT_IMAGE;
    }

    const cleanImage = image.trim();

    if (!cleanImage) {
      return DEFAULT_IMAGE;
    }

    if (
      cleanImage.startsWith("http://") ||
      cleanImage.startsWith("https://") ||
      cleanImage.startsWith("data:")
    ) {
      return cleanImage;
    }

    if (cleanImage.startsWith("/uploads/")) {
      return `${API_URL}${cleanImage}`;
    }

    if (cleanImage.startsWith("/images/")) {
      return cleanImage;
    }

    if (cleanImage.startsWith("/")) {
      return cleanImage;
    }

    return `/${cleanImage}`;
  }, []);

  /*
  ============================================================
  IMAGE UPLOAD
  ============================================================
  */

  /**
   * Uploads a File to the server and returns the public path string.
   * @param {File} file
   * @returns {Promise<string>} e.g. "/images/places/1234-photo.jpg"
   */
  const uploadImage = useCallback(
    async (file) => {
      const token = getAdminToken();
      const body = new FormData();
      body.append("image", file);

      const response = await fetch(
        `${API_URL}/api/admin/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        throw new Error("Unauthorized");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      return data.path;
    },
    [getAdminToken, handleUnauthorized]
  );

  /*
  ============================================================
  SAFE IMAGE ERROR HANDLER
  ============================================================
  */

  const handleImageError = (event) => {
    const image = event.currentTarget;

    // Prevent infinite image-error loops
    if (image.dataset.fallbackApplied === "true") {
      return;
    }

    image.dataset.fallbackApplied = "true";
    image.src = DEFAULT_IMAGE;
  };

  /*
  ============================================================
  FETCH PLACES & MANUAL REFRESH HANDLER
  ============================================================
  */

  const fetchPlaces = useCallback(
    async (initial = false) => {
      /*
       * Don't start another request if one is already running.
       */
      if (fetchInProgress.current && !initial) {
        // allow manual refresh to bypass
      } else if (fetchInProgress.current) {
        return;
      }

      fetchInProgress.current = true;

      /*
       * Cancel previous request if there is one.
       */
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (initial && places.length === 0) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await fetch(
          `${API_URL}/api/places`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          let message = "Failed to fetch places.";
          try {
            const data = await response.json();
            if (data?.message) message = data.message;
          } catch {
            // Ignore invalid JSON
          }
          throw new Error(message);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setPlaces(data);
        } else {
          throw new Error("Empty backend response");
        }
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }
        console.error("Fetch places error:", err);

        // Comprehensive catalog of curated Uva Province destinations if server API is offline
        setPlaces([
          { _id: "1", name: "Nine Arches Bridge", category: "Sightseeing", location: "Demodara, Ella, Sri Lanka", district: "Badulla", rating: 4.9, reviews: 312, image: "/images/places/nine-arches-bridge.jpg", distance: "24km" },
          { _id: "2", name: "Ella Rock", category: "Sightseeing / Hiking", location: "Kithalella, Ella, 90090, Sri Lanka", district: "Badulla", rating: 4.8, reviews: 240, image: "/images/places/ella-rock.jpg", distance: "22km" },
          { _id: "3", name: "Little Adam's Peak", category: "Sightseeing / Hiking", location: "Ella-Passara Road, Ella, Uva, Sri Lanka", district: "Badulla", rating: 4.8, reviews: 198, image: "/images/places/little-adams-peak.jpg", distance: "23km" },
          { _id: "4", name: "Ravana Fall", category: "Sightseeing", location: "Wellawaya Road (A23), Ella, Sri Lanka", district: "Badulla", rating: 4.6, reviews: 154, image: "/images/places/ravana-fall.jpg", distance: "20km" },
          { _id: "5", name: "Dowa Rock Temple", category: "Heritage", location: "Badulla Bandarawela Road, Bandarawela", district: "Badulla", rating: 4.5, reviews: 92, image: "/images/places/dowa-rock-temple.jpg", distance: "6km" },
          { _id: "6", name: "Lipton's Seat", category: "Sightseeing", location: "Dambethenna Estate, Haputale", district: "Badulla", rating: 4.8, reviews: 210, image: "/images/places/liptons-seat.jpg", distance: "18km" },
          { _id: "7", name: "Adisham Bungalow", category: "Monuments / Architecture", location: "Adisham Rd, Haputale 90160", district: "Badulla", rating: 4.7, reviews: 165, image: "/images/places/adisham-bungalow.jpg", distance: "14km" },
          { _id: "8", name: "Porowagala Viewpoint", category: "Sightseeing", location: "Mahaulpatha, Galkanda, Bandarawela", district: "Badulla", rating: 4.6, reviews: 88, image: "/images/places/porowagala-viewpoint.jpg", distance: "3km" },
          { _id: "9", name: "Rawana Ella Cave", category: "Historical", location: "Ella Wellawaya Road, Ella", district: "Badulla", rating: 4.5, reviews: 76, image: "/images/places/rawana-ella-cave.jpg", distance: "21km" },
          { _id: "10", name: "Halpewatte Tea Factory", category: "Cultural", location: "Badulla Road, Hela Halpe, Ella", district: "Badulla", rating: 4.7, reviews: 130, image: "/images/places/halpewatte-tea-factory.jpg", distance: "25km" },
          { _id: "11", name: "Diyaluma Falls", category: "Sightseeing", location: "Koslanda, Wellawaya, Sri Lanka", district: "Badulla", rating: 4.9, reviews: 280, image: "/images/places/diyaluma-falls.jpg", distance: "32km" },
          { _id: "12", name: "Bambarakanda Falls", category: "Sightseeing", location: "Kalupahana, Haldummulla, Sri Lanka", district: "Badulla", rating: 4.8, reviews: 195, image: "/images/places/bambarakanda-falls.jpg", distance: "28km" },
          { _id: "13", name: "Dunhinda Falls", category: "Sightseeing", location: "Badulla, Sri Lanka", district: "Badulla", rating: 4.7, reviews: 215, image: "/images/places/dunhinda-falls.jpg", distance: "30km" },
          { _id: "14", name: "Muthiyangana Raja Maha Viharaya", category: "Religious", location: "Badulla Town, Sri Lanka", district: "Badulla", rating: 4.6, reviews: 140, image: "/images/places/muthiyangana.jpg", distance: "28km" },
          { _id: "15", name: "Bogoda Wooden Bridge", category: "Heritage", location: "Hali-Ela, Badulla, Sri Lanka", district: "Badulla", rating: 4.5, reviews: 85, image: "/images/places/bogoda-wooden-bridge.jpg", distance: "22km" },
          { _id: "16", name: "Mahiyanganaya Stupa", category: "Religious", location: "Mahiyanganaya, Badulla, Sri Lanka", district: "Badulla", rating: 4.8, reviews: 310, image: "/images/places/mahiyanganaya.jpg", distance: "65km" },
          { _id: "17", name: "Sorabora Wewa", category: "Sightseeing", location: "Mahiyanganaya, Sri Lanka", district: "Badulla", rating: 4.6, reviews: 120, image: "/images/places/sorabora-wewa.jpg", distance: "67km" },
          { _id: "18", name: "Maduru Oya National Park", category: "Nature", location: "Mahiyanganaya Border, Sri Lanka", district: "Badulla", rating: 4.7, reviews: 160, image: "/images/places/maduru-oya.jpg", distance: "78km" },
        ]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        fetchInProgress.current = false;
      }
    },
    [handleUnauthorized, places.length]
  );

  const handleRefreshPlaces = async () => {
    fetchInProgress.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    await fetchPlaces(false);
    setSuccess("Destinations list refreshed successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  /*
  ============================================================
  INITIAL AUTH CHECK + FETCH
  ============================================================
  */

  useEffect(() => {
    /*
     * React StrictMode can execute effects twice
     * during development.
     *
     * This prevents duplicate API requests.
     */
    if (initialFetchDone.current) {
      return;
    }

    initialFetchDone.current = true;

    const token = getAdminToken();

    if (!token) {
      window.location.replace("/admin/login");
      return;
    }

    fetchPlaces(true);

    /*
     * Cleanup
     */
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [getAdminToken, fetchPlaces]);

  /*
  ============================================================
  FORM
  ============================================================
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      ...emptyForm,
      images: [],
    });
  };

  /*
  ============================================================
  GALLERY
  ============================================================
  */

  const addGalleryImage = () => {
    setFormData((previous) => ({
      ...previous,
      images: [
        ...previous.images,
        "",
      ],
    }));
  };

  const updateGalleryImage = (
    index,
    value
  ) => {
    setFormData((previous) => {
      const updatedImages = [
        ...previous.images,
      ];

      updatedImages[index] = value;

      return {
        ...previous,
        images: updatedImages,
      };
    });
  };

  const removeGalleryImage = (index) => {
    setFormData((previous) => ({
      ...previous,
      images: previous.images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      ),
    }));
  };

  /*
  ============================================================
  FETCH ADMIN REVIEWS
  ============================================================
  */

  const fetchAdminReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      let serverReviews = [];

      try {
        const response = await fetch(`${API_URL}/api/places/reviews/all`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) serverReviews = data;
        }
      } catch (err) {
        console.warn("Server reviews API unreachable, reading IndexedDB reviews:", err);
      }

      // Collect all persistent reviews saved in IndexedDB
      const indexedReviews = await getAllReviewsFromStore();

      let localReviews = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("uva_reviews_")) {
            const placeId = key.replace("uva_reviews_", "");
            const items = JSON.parse(localStorage.getItem(key) || "[]");
            if (Array.isArray(items)) {
              items.forEach((item) => {
                localReviews.push({
                  ...item,
                  place: item.place || { name: `Destination #${placeId}` },
                });
              });
            }
          }
        }
      } catch (e) {}

      // Merge all reviews uniquely
      const mergedMap = new Map();
      [...indexedReviews, ...localReviews, ...serverReviews].forEach((r) => {
        const idKey = r._id || r.id || (r.author + r.createdAt);
        if (!mergedMap.has(idKey)) {
          mergedMap.set(idKey, r);
        }
      });

      setAdminReviews(Array.from(mergedMap.values()));
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    // Immediately remove from local state
    setAdminReviews((prev) => prev.filter((r) => (r._id || r.id) !== reviewId));

    // Remove from IndexedDB
    await deleteReviewFromStore(reviewId);

    // Remove from localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("uva_reviews_")) {
          const items = JSON.parse(localStorage.getItem(key) || "[]");
          const updated = items.filter((r) => (r._id || r.id) !== reviewId);
          localStorage.setItem(key, JSON.stringify(updated));
        }
      }
    } catch (e) {}

    const token = getAdminToken();
    if (!token) return;

    try {
      setDeletingReviewId(reviewId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/places/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      setSuccess("Bad review removed successfully!");
      fetchPlaces(false);
    } catch (err) {
      console.error("Failed to delete review on server:", err);
    } finally {
      setDeletingReviewId(null);
    }
  };

  /*
  ============================================================
  FACILITIES MANAGEMENT HANDLERS
  ============================================================
  */

  const fetchAdminFacilities = useCallback(async () => {
    try {
      setFacilitiesLoading(true);
      const response = await fetch(`${API_URL}/api/facilities`);
      if (response.ok) {
        const data = await response.json();
        setAdminFacilities(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch facilities:", err);
    } finally {
      setFacilitiesLoading(false);
    }
  }, []);

  const handleFacilitySubmit = async (e) => {
    e.preventDefault();
    const token = getAdminToken();
    if (!token) return handleUnauthorized();

    try {
      setSavingFacility(true);
      setError("");
      setSuccess("");

      const isEdit = !!editingFacilityId;
      const url = isEdit
        ? `${API_URL}/api/facilities/${editingFacilityId}`
        : `${API_URL}/api/facilities`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(facilityForm),
      });

      if (!response.ok) throw new Error("Failed to save facility.");

      setSuccess(isEdit ? "Facility updated successfully!" : "Facility added to map successfully!");
      setEditingFacilityId(null);
      setFacilityForm(emptyFacilityForm);
      fetchAdminFacilities();
    } catch (err) {
      setError(err.message || "Failed to save facility.");
    } finally {
      setSavingFacility(false);
    }
  };

  const handleDeleteFacility = async (facId) => {
    if (!window.confirm("Are you sure you want to remove this facility from the map?")) return;
    const token = getAdminToken();
    if (!token) return handleUnauthorized();

    try {
      setDeletingFacilityId(facId);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/api/facilities/${facId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete facility.");

      setAdminFacilities((prev) => prev.filter((f) => (f._id || f.id) !== facId));
      setSuccess("Facility removed successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete facility.");
    } finally {
      setDeletingFacilityId(null);
    }
  };

  const handleEditFacility = (facility) => {
    setEditingFacilityId(facility._id || facility.id);
    setFacilityForm({
      name: facility.name || "",
      type: facility.type || "Hotel",
      location: facility.location || "",
      description: facility.description || "",
      phone: facility.phone || "",
      rating: facility.rating ?? 4.5,
      reviews: facility.reviews ?? 12,
      image: facility.image || "",
      lat: facility.lat ?? 6.8301,
      lng: facility.lng ?? 80.9905,
      openingDays: facility.openingDays || "Monday - Sunday",
      openingHours: facility.openingHours || "08:00 AM - 08:00 PM",
      googleMapsUrl: facility.googleMapsUrl || "",
    });
  };

  /*
  ============================================================
  EDIT
  ============================================================
  */

  const handleEdit = (place) => {
    const galleryImages = Array.isArray(place.images) ? [...place.images] : [];

    const targetId = place._id || place.id;
    setEditingId(targetId);

    const defaultTicket = getTicketInfo(place.name);
    const initialTicket = place.ticketInfo && (place.ticketInfo.hasTicket || place.ticketInfo.foreignAdult)
      ? place.ticketInfo
      : defaultTicket || {
          hasTicket: false,
          badgeText: "Ticket Required",
          foreignAdult: "",
          localAdult: "",
          vehicleFee: "",
          paymentMethods: "",
          notes: "",
          passes: [],
        };

    const defaultFacilities = getPlaceFacilities(place.name, place.category);
    const initialFacilities = place.facilities && (
      (place.facilities.parking && place.facilities.parking.length > 0) ||
      (place.facilities.transport && place.facilities.transport.length > 0) ||
      (place.facilities.foodBeverage && place.facilities.foodBeverage.length > 0)
    )
      ? place.facilities
      : defaultFacilities;

    setFormData({
      name: place.name || "",
      location: place.location || "",
      district:
        place.district || "Badulla",
      province:
        place.province || "Uva",
      category:
        place.category || "Sightseeing",
      distance:
        place.distance || "10km",
      rating:
        place.rating ?? 4.5,
      reviews:
        place.reviews ?? 0,
      description:
        place.description || "",
      image:
        place.image || DEFAULT_IMAGE,
      images: galleryImages,
      lat: place.lat ?? 6.82977,
      lng: place.lng ?? 80.98457,
      openingDays: place.openingDays || "Monday - Sunday",
      openingHours: place.openingHours || "06:00 AM - 06:00 PM",
      googleMapsUrl: place.googleMapsUrl || "",
      ticketInfo: JSON.parse(JSON.stringify(initialTicket)),
      facilities: JSON.parse(JSON.stringify(initialFacilities)),
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    resetForm();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ============================================================
  TICKET & FACILITIES CUSTOMIZATION HANDLERS FOR ADMIN
  ============================================================
  */

  const handleTicketChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      ticketInfo: {
        ...(prev.ticketInfo || {}),
        [field]: value,
      },
    }));
  };

  const addTicketPass = () => {
    setFormData((prev) => ({
      ...prev,
      ticketInfo: {
        ...(prev.ticketInfo || {}),
        passes: [
          ...(prev.ticketInfo?.passes || []),
          { type: "Standard Visitor Pass", price: "LKR 500", desc: "General visitor pass" },
        ],
      },
    }));
  };

  const updateTicketPass = (index, field, value) => {
    setFormData((prev) => {
      const updatedPasses = [...(prev.ticketInfo?.passes || [])];
      updatedPasses[index] = {
        ...updatedPasses[index],
        [field]: value,
      };
      return {
        ...prev,
        ticketInfo: {
          ...(prev.ticketInfo || {}),
          passes: updatedPasses,
        },
      };
    });
  };

  const removeTicketPass = (index) => {
    setFormData((prev) => ({
      ...prev,
      ticketInfo: {
        ...(prev.ticketInfo || {}),
        passes: (prev.ticketInfo?.passes || []).filter((_, i) => i !== index),
      },
    }));
  };

  const addFacilityItem = (category) => {
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...(prev.facilities || {}),
        [category]: [
          ...(prev.facilities?.[category] || []),
          { text: "New Facility Detail", status: "Available" },
        ],
      },
    }));
  };

  const updateFacilityItem = (category, index, field, value) => {
    setFormData((prev) => {
      const updatedCategory = [...(prev.facilities?.[category] || [])];
      updatedCategory[index] = {
        ...updatedCategory[index],
        [field]: value,
      };
      return {
        ...prev,
        facilities: {
          ...(prev.facilities || {}),
          [category]: updatedCategory,
        },
      };
    });
  };

  const removeFacilityItem = (category, index) => {
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...(prev.facilities || {}),
        [category]: (prev.facilities?.[category] || []).filter((_, i) => i !== index),
      },
    }));
  };

  /*
  ============================================================
  SAVE PLACE
  ============================================================
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = getAdminToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `${API_URL}/api/places/${editingId}`
        : `${API_URL}/api/places`;

      const method = isEditing
        ? "PUT"
        : "POST";

      const cleanImages =
        formData.images.filter(
          (image) =>
            typeof image === "string" &&
            image.trim() !== ""
        );

      const payload = {
        ...formData,

        rating: Number(formData.rating),
        reviews: Number(formData.reviews),

        images: cleanImages,
      };

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      /*
       * Token expired
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();
        return;
      }

      let data = {};

      try {
        data = await response.json();
      } catch {
        // Ignore invalid JSON
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to ${
              isEditing
                ? "update"
                : "add"
            } place.`
        );
      }

      setSuccess(
        isEditing
          ? "Place updated successfully!"
          : "New place added successfully!"
      );

      resetForm();

      /*
       * Refresh the data WITHOUT hiding the table.
       */
      await fetchPlaces(false);
    } catch (err) {
      console.error(
        "Save place error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while saving the place."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ============================================================
  DELETE PLACE
  ============================================================
  */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this place?"
      );

    if (!confirmed) {
      return;
    }

    const token = getAdminToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      const response = await fetch(
        `${API_URL}/api/places/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();
        return;
      }

      let data = {};

      try {
        data = await response.json();
      } catch {
        // Ignore invalid JSON
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete place."
        );
      }

      /*
       * IMPORTANT:
       * Remove the item immediately from the local list.
       *
       * This makes deletion instant and avoids
       * table flickering.
       */
      setPlaces((previous) =>
        previous.filter(
          (place) =>
            place._id !== id
        )
      );

      setSuccess(
        "Place deleted successfully!"
      );

      /*
       * Synchronize with database silently.
       */
      fetchPlaces(false);
    } catch (err) {
      console.error(
        "Delete place error:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete place."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  ============================================================
  LOGOUT
  ============================================================
  */

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem("adminToken");
      localStorage.removeItem("adminToken");
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore
    }

    window.location.replace("/");
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 md:p-8 max-w-full overflow-x-hidden box-border">
      <div className="mx-auto max-w-7xl w-full">

        {/* Header */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between max-w-full">

          <div className="flex items-center gap-4 max-w-full">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-teal-600/30 shadow-md flex items-center justify-center bg-[#1F3952]">
              <img
                src="/images/logo.png"
                alt="Uva Explore Logo"
                className="h-full w-full object-cover scale-[1.38]"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                UVA EXPLORE
              </h2>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700">
                ADMINISTRATOR DASHBOARD
              </p>

              <h1 className="mt-0.5 text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 truncate">
                Destination & System Management
              </h1>

              <p className="mt-1 text-xs text-slate-500 hidden sm:block">
                Add, edit, and manage destinations, facilities, timetables & user logs across Uva Province.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-fit items-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-3 font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Tab Navigation */}

        <div className="mt-6 flex flex-wrap border-b border-slate-200 max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("places")}
            className={`flex items-center gap-2 border-b-2 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition shrink-0 ${
              activeTab === "places"
                ? "border-teal-700 text-teal-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <MapPin size={18} />
            Destinations ({places.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("facilities");
              fetchAdminFacilities();
            }}
            className={`flex items-center gap-2 border-b-2 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition shrink-0 ${
              activeTab === "facilities"
                ? "border-teal-700 text-teal-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Building2 size={18} />
            Add Facilities ({adminFacilities.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("reviews");
              fetchAdminReviews();
            }}
            className={`flex items-center gap-2 border-b-2 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition shrink-0 ${
              activeTab === "reviews"
                ? "border-teal-700 text-teal-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <MessageSquare size={18} />
            Moderate Reviews ({adminReviews.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("ads");
              loadAdminAds();
            }}
            className={`flex items-center gap-2 border-b-2 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition shrink-0 ${
              activeTab === "ads"
                ? "border-teal-700 text-teal-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Megaphone size={18} />
            Manage Ads ({adminAds.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("user-logs");
              loadUserLogs();
            }}
            className={`flex items-center gap-2 border-b-2 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition shrink-0 ${
              activeTab === "user-logs"
                ? "border-teal-700 text-teal-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users size={18} />
            👥 Visitor Logs ({userLogs.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("buses");
              loadAdminBuses();
            }}
            className={`flex items-center gap-2 border-b-2 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition shrink-0 ${
              activeTab === "buses"
                ? "border-teal-700 text-teal-700 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Compass size={18} />
            🚌 Bus Services ({adminBuses.length})
          </button>
        </div>

        {/* Alerts */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 max-w-full">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />
            <div>
              <p>{error}</p>
              <p className="mt-1 text-xs font-normal">
                Make sure your backend server and MongoDB are running.
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 max-w-full">
            <Check size={20} />
            {success}
          </div>
        )}

        {activeTab === "places" && (
          <>
            {/* Admin Form Panel */}

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm max-w-full overflow-hidden">

              {editingId && (
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 sm:px-5 sm:py-3.5 border border-amber-200 max-w-full overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0">
                    <Edit size={18} className="text-amber-700 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-amber-900 truncate">
                      Currently Editing: "{formData.name || 'Destination'}"
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="shrink-0 rounded-xl bg-amber-200 px-4 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-300 w-fit"
                  >
                    Cancel Editing
                  </button>
                </div>
              )}

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">

              {editingId ? (
                <Edit size={21} />
              ) : (
                <Plus size={21} />
              )}

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                {editingId
                  ? "Edit Tourist Place"
                  : "Add New Tourist Place"}
              </h2>

              <p className="text-sm text-slate-500">
                {editingId
                  ? "Update the destination information below."
                  : "Add a new destination to Uva Explorer."}
              </p>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-5 md:grid-cols-2"
          >

            {/* NAME */}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </label>

              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Diyaluma Falls"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* LOCATION */}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </label>

              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Koslanda"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* INTERACTIVE MAP LOCATION PICKER FOR DESTINATION */}
            <div className="col-span-full rounded-2xl border border-teal-200 bg-teal-50/50 p-3 sm:p-4 max-w-full overflow-hidden box-border">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between max-w-full">
                <div>
                  <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-teal-900">
                    <MapPin size={16} className="text-teal-700 shrink-0" />
                    Pick Destination Location from Map
                  </label>
                  <p className="text-xs text-slate-600">
                    🎯 Click anywhere on the map or drag the pin to set destination Latitude & Longitude automatically!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const lat = Number(pos.coords.latitude.toFixed(6));
                          const lng = Number(pos.coords.longitude.toFixed(6));
                          const calcDist = calcDistanceFromBandarawela(lat, lng);
                          setFormData((prev) => ({
                            ...prev,
                            lat,
                            lng,
                            distance: calcDist,
                            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                          }));
                        },
                        () => alert("Unable to access GPS location.")
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 bg-white px-3 py-1.5 text-xs font-bold text-teal-800 shadow-xs hover:bg-teal-100 w-fit shrink-0"
                >
                  🎯 Use My GPS Location
                </button>
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-teal-200 shadow-inner max-w-full" style={{ height: "260px" }}>
                <MapContainer
                  center={[formData.lat || 6.82977, formData.lng || 80.98457]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapClickHandler
                    onSelectCoords={(lat, lng) => {
                      const calcDist = calcDistanceFromBandarawela(lat, lng);
                      setFormData((prev) => ({
                        ...prev,
                        lat,
                        lng,
                        distance: calcDist,
                        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                      }));
                    }}
                  />

                  <Marker
                    position={[formData.lat || 6.82977, formData.lng || 80.98457]}
                    icon={pickerPinIcon}
                    draggable={true}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target;
                        const pos = marker.getLatLng();
                        const lat = Number(pos.lat.toFixed(6));
                        const lng = Number(pos.lng.toFixed(6));
                        const calcDist = calcDistanceFromBandarawela(lat, lng);
                        setFormData((prev) => ({
                          ...prev,
                          lat,
                          lng,
                          distance: calcDist,
                          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                        }));
                      },
                    }}
                  />
                </MapContainer>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-full">
                <div className="min-w-0">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Latitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="lat"
                    value={formData.lat || 6.82977}
                    onChange={(e) => {
                      const newLat = parseFloat(e.target.value) || 0;
                      const calcDist = calcDistanceFromBandarawela(newLat, formData.lng);
                      setFormData((prev) => ({
                        ...prev,
                        lat: newLat,
                        distance: calcDist,
                        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${newLat},${prev.lng}`,
                      }));
                    }}
                    className="mt-1 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-teal-700 box-border"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Longitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="lng"
                    value={formData.lng || 80.98457}
                    onChange={(e) => {
                      const newLng = parseFloat(e.target.value) || 0;
                      const calcDist = calcDistanceFromBandarawela(formData.lat, newLng);
                      setFormData((prev) => ({
                        ...prev,
                        lng: newLng,
                        distance: calcDist,
                        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${prev.lat},${newLng}`,
                      }));
                    }}
                    className="mt-1 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-teal-700 box-border"
                  />
                </div>
              </div>
            </div>

            {/* DISTRICT */}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                District
              </label>

              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Badulla"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* PROVINCE */}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Province
              </label>

              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Uva"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* DISTANCE */}

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Distance (from Bandarawela Bus Stand)
                </label>
                <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  ⚡ Auto-calculated from Bandarawela
                </span>
              </div>

              <input
                type="text"
                name="distance"
                value={formData.distance}
                onChange={handleChange}
                placeholder="e.g. 18km (Auto-calculated from Bandarawela Bus Stand)"
                className="mt-2 w-full rounded-xl border border-teal-200 bg-teal-50/20 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>



            {/* OPENING DAYS */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Opening Days
              </label>
              <input
                type="text"
                name="openingDays"
                value={formData.openingDays || ""}
                onChange={handleChange}
                placeholder="e.g. Monday - Sunday or Weekends"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* OPENING HOURS */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Opening Hours
              </label>
              <input
                type="text"
                name="openingHours"
                value={formData.openingHours || ""}
                onChange={handleChange}
                placeholder="e.g. 07:00 AM - 06:00 PM or Open 24 Hours"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* GOOGLE MAPS URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Google Maps Link / URL (from Google Maps Details)
              </label>
              <input
                type="text"
                name="googleMapsUrl"
                value={formData.googleMapsUrl || ""}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/search/?api=1&query=..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* MAIN IMAGE */}

            <div className="md:col-span-2">

              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Main Image Path / URL
              </label>

              <div className="mt-2 flex flex-col gap-4 md:flex-row">

                <div className="flex w-full gap-2">
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="/images/places/diyaluma.jpg"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                  {/* Hidden file input for main image */}
                  <input
                    id="browse-main-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      e.target.value = "";
                      try {
                        setUploadingSlot("main");
                        setError("");
                        const path = await uploadImage(file);
                        setFormData((prev) => ({ ...prev, image: path }));
                      } catch (err) {
                        setError(err.message || "Upload failed");
                      } finally {
                        setUploadingSlot(null);
                      }
                    }}
                  />

                  <button
                    type="button"
                    disabled={uploadingSlot !== null}
                    onClick={() =>
                      document
                        .getElementById("browse-main-image")
                        .click()
                    }
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Browse local image"
                  >
                    {uploadingSlot === "main" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    Browse
                  </button>
                </div>

                {formData.image && (
                  <img
                    src={getImageUrl(
                      formData.image
                    )}
                    alt="Main preview"
                    className="h-20 w-28 rounded-xl border object-cover"
                    onError={
                      handleImageError
                    }
                  />
                )}

              </div>

            </div>

            {/* GALLERY */}

            <div className="md:col-span-2">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Gallery Images
                  </label>

                  <p className="mt-1 text-xs text-slate-400">
                    Add additional photos for
                    the place details carousel.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addGalleryImage}
                  className="flex w-fit items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                >
                  <Plus size={17} />
                  Add Gallery Image
                </button>

              </div>

              {formData.images.length ===
                0 && (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                  <ImageIcon
                    size={30}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    No gallery images added
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Click "Add Gallery Image"
                    to add photos.
                  </p>

                </div>
              )}

              <div className="mt-4 space-y-4">

                {formData.images.map(
                  (image, index) => (
                    <div
                      key={`${index}-${image}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >

                      <div className="flex gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-500">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={image}
                              onChange={(event) =>
                                updateGalleryImage(
                                  index,
                                  event.target.value
                                )
                              }
                              placeholder="/images/places/diyaluma-1.jpg"
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            />

                            {/* Hidden file input for this gallery slot */}
                            <input
                              id={`browse-gallery-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                e.target.value = "";
                                try {
                                  setUploadingSlot(index);
                                  setError("");
                                  const path = await uploadImage(file);
                                  updateGalleryImage(index, path);
                                } catch (err) {
                                  setError(err.message || "Upload failed");
                                } finally {
                                  setUploadingSlot(null);
                                }
                              }}
                            />

                            <button
                              type="button"
                              disabled={uploadingSlot !== null}
                              onClick={() =>
                                document
                                  .getElementById(`browse-gallery-${index}`)
                                  .click()
                              }
                              className="flex shrink-0 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Browse local image"
                            >
                              {uploadingSlot === index ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Upload size={16} />
                              )}
                              Browse
                            </button>
                          </div>

                          {image && (
                            <img
                              src={getImageUrl(
                                image
                              )}
                              alt={`Gallery preview ${
                                index + 1
                              }`}
                              className="mt-3 h-24 w-36 rounded-xl border object-cover"
                              onError={
                                handleImageError
                              }
                            />
                          )}

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeGalleryImage(
                              index
                            )
                          }
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-rose-600 transition hover:bg-rose-100"
                          title="Remove image"
                        >
                          <X size={19} />
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">

              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </label>

              <textarea
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the tourist attraction..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />

            </div>

            {/* TICKET PRICES CUSTOMIZER FOR ADMIN */}
            <div className="md:col-span-2 rounded-2xl border border-teal-200/80 bg-teal-50/40 p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between border-b border-teal-200/60 pb-3 mb-4 gap-3">
                <div className="flex items-center gap-2">
                  <Ticket className="text-teal-700" size={20} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-teal-900">
                    Ticket Prices & Visitor Rates Customizer
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-teal-900 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs hover:bg-teal-50 transition">
                  <input
                    type="checkbox"
                    checked={formData.ticketInfo?.hasTicket || false}
                    onChange={(e) => handleTicketChange("hasTicket", e.target.checked)}
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Enable Ticket Prices Section</span>
                </label>
              </div>

              {formData.ticketInfo?.hasTicket ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Badge Label Text</label>
                      <input
                        type="text"
                        value={formData.ticketInfo?.badgeText || ""}
                        onChange={(e) => handleTicketChange("badgeText", e.target.value)}
                        placeholder="e.g. Foreign Ticket Required"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-teal-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Foreign Adult Ticket Rate</label>
                      <input
                        type="text"
                        value={formData.ticketInfo?.foreignAdult || ""}
                        onChange={(e) => handleTicketChange("foreignAdult", e.target.value)}
                        placeholder="e.g. LKR 550 (~$1.80 USD)"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-teal-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Local Resident Ticket Rate</label>
                      <input
                        type="text"
                        value={formData.ticketInfo?.localAdult || ""}
                        onChange={(e) => handleTicketChange("localAdult", e.target.value)}
                        placeholder="e.g. LKR 100"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-teal-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Vehicle / Gate Fees</label>
                      <input
                        type="text"
                        value={formData.ticketInfo?.vehicleFee || ""}
                        onChange={(e) => handleTicketChange("vehicleFee", e.target.value)}
                        placeholder="e.g. Bike LKR 50 | Car LKR 250"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-teal-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Payment Methods</label>
                      <input
                        type="text"
                        value={formData.ticketInfo?.paymentMethods || ""}
                        onChange={(e) => handleTicketChange("paymentMethods", e.target.value)}
                        placeholder="e.g. Cash Only (LKR)"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-teal-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Important Notes</label>
                      <input
                        type="text"
                        value={formData.ticketInfo?.notes || ""}
                        onChange={(e) => handleTicketChange("notes", e.target.value)}
                        placeholder="e.g. Valid ID required for local rates"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-teal-600 bg-white"
                      />
                    </div>
                  </div>

                  {/* ENTRY PASSES BREAKDOWN LIST */}
                  <div className="mt-4 pt-3 border-t border-teal-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Entry Passes & Ticket Breakdown</span>
                      <button
                        type="button"
                        onClick={addTicketPass}
                        className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-white px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-50 transition shadow-2xs"
                      >
                        <Plus size={14} />
                        Add Ticket Pass
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(formData.ticketInfo?.passes || []).map((pass, pIdx) => (
                        <div key={pIdx} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl bg-white p-3 border border-slate-200 shadow-2xs max-w-full overflow-hidden box-border">
                          <input
                            type="text"
                            value={pass.type || ""}
                            onChange={(e) => updateTicketPass(pIdx, "type", e.target.value)}
                            placeholder="Pass Name / Type"
                            className="w-full sm:flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-teal-600 text-slate-900 bg-white box-border"
                          />
                          <input
                            type="text"
                            value={pass.price || ""}
                            onChange={(e) => updateTicketPass(pIdx, "price", e.target.value)}
                            placeholder="Price (e.g. LKR 500)"
                            className="w-full sm:w-32 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-teal-600 text-teal-800 bg-white box-border"
                          />
                          <input
                            type="text"
                            value={pass.desc || ""}
                            onChange={(e) => updateTicketPass(pIdx, "desc", e.target.value)}
                            placeholder="Description / Requirements"
                            className="w-full sm:flex-[2] rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-teal-600 text-slate-900 bg-white box-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeTicketPass(pIdx)}
                            className="self-end sm:self-center p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                            title="Remove Pass"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Check "Enable Ticket Prices Section" above to configure custom entry ticket rates, passes, and fees for this destination.</p>
              )}
            </div>

            {/* FACILITIES & AMENITIES CUSTOMIZER FOR ADMIN */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-5 shadow-xs max-w-full overflow-hidden box-border">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                <Car className="text-teal-700 shrink-0" size={20} />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  Facilities, Parking, Transport & Amenities Customizer
                </h3>
              </div>

              <div className="space-y-6">
                {[
                  { key: "parking", title: "Parking Facilities", icon: Car },
                  { key: "transport", title: "Transport & Access", icon: Bus },
                  { key: "foodBeverage", title: "Food & Beverages", icon: Coffee },
                  { key: "utilities", title: "Utilities & Comfort", icon: Clock },
                  { key: "other", title: "Highlights & Special Features", icon: Sparkles },
                ].map((cat) => (
                  <div key={cat.key} className="rounded-xl border border-slate-200/80 bg-white p-3 sm:p-3.5 shadow-2xs max-w-full overflow-hidden box-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800">
                        <cat.icon size={15} className="text-teal-700 shrink-0" />
                        <span>{cat.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addFacilityItem(cat.key)}
                        className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 hover:bg-teal-100 transition w-fit"
                      >
                        <Plus size={13} />
                        Add {cat.title.split(" ")[0]} Item
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.facilities?.[cat.key] || []).length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-1">No items added yet. Click "Add Item" to add facility features.</p>
                      ) : (
                        (formData.facilities?.[cat.key] || []).map((item, fIdx) => (
                          <div key={fIdx} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 p-2.5 max-w-full overflow-hidden box-border">
                            <input
                              type="text"
                              value={item.text || ""}
                              onChange={(e) => updateFacilityItem(cat.key, fIdx, "text", e.target.value)}
                              placeholder="Feature / Detail (e.g. Dedicated Car Parking Lot)"
                              className="w-full sm:flex-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-teal-600 bg-white text-slate-900 box-border"
                            />
                            <input
                              type="text"
                              value={item.status || ""}
                              onChange={(e) => updateFacilityItem(cat.key, fIdx, "status", e.target.value)}
                              placeholder="Status Badge (e.g. LKR 50 / Free / Available)"
                              className="w-full sm:w-36 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-bold outline-none focus:border-teal-600 text-teal-800 bg-white box-border"
                            />
                            <button
                              type="button"
                              onClick={() => removeFacilityItem(cat.key, fIdx)}
                              className="self-end sm:self-center p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                              title="Delete facility item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BUTTONS */}

            <div className="flex flex-wrap gap-3 md:col-span-2">

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    {editingId
                      ? "Updating..."
                      : "Adding..."}
                  </>
                ) : (
                  <>
                    {editingId ? (
                      <Save size={18} />
                    ) : (
                      <Plus size={18} />
                    )}

                    {editingId
                      ? "Update Place"
                      : "Add Place"}
                  </>
                )}

              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </div>

        {/* ==================================================
            EXISTING PLACES
        ================================================== */}

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Existing Destinations
              </h2>

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">

                <span>
                  {places.length} destination
                  {places.length !== 1
                    ? "s"
                    : ""}{" "}
                  currently available.
                </span>

                {refreshing && (
                  <span className="flex items-center gap-1.5 text-teal-700">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700" />
                    Updating...
                  </span>
                )}

              </div>

            </div>

            <button
              type="button"
              onClick={handleRefreshPlaces}
              disabled={refreshing}
              className="flex w-fit items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/80 px-4 py-2 text-xs sm:text-sm font-bold text-teal-800 hover:bg-teal-100 transition active:scale-95 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Compass size={16} className={refreshing ? "animate-spin text-teal-600" : "text-teal-600"} />
              <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
            </button>

          </div>

          {/* ==================================================
              INITIAL LOADING ONLY
          ================================================== */}

          {loading && places.length === 0 ? (
            <div className="mt-8 flex items-center justify-center py-10">

              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700" />

              <span className="ml-3 text-sm text-slate-500">
                Loading places...
              </span>

            </div>

          ) : places.length === 0 ? (

            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

              <MapPin
                size={35}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-3 font-semibold text-slate-700">
                No destinations yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first tourist place
                using the form above.
              </p>

            </div>

          ) : (

            /*
             * IMPORTANT:
             *
             * The table stays mounted during refresh.
             *
             * This is the main fix for the flickering.
             */

            <div className="mt-6 overflow-x-auto">

              <table className="w-full min-w-[1000px] text-left text-sm text-slate-600">

                <thead className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-400">

                  <tr>

                    <th className="px-4 py-3">
                      Place & Description
                    </th>

                    <th className="px-4 py-3">
                      Category & Location
                    </th>

                    <th className="px-4 py-3">
                      Ticket Prices & Passes
                    </th>

                    <th className="px-4 py-3">
                      Facilities & Transport
                    </th>

                    <th className="px-4 py-3">
                      Rating & Photos
                    </th>

                    <th className="px-4 py-3 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {places.map(
                    (place) => (

                      <tr
                        key={place._id}
                        className="transition-colors hover:bg-slate-50"
                      >

                        {/* PLACE & DESCRIPTION */}

                        <td className="px-4 py-4">

                          <div className="flex items-start gap-3">

                            <img
                              src={getImageUrl(
                                place.image
                              )}
                              alt={
                                place.name ||
                                "Tourist place"
                              }
                              loading="lazy"
                              className="h-14 w-20 rounded-xl border object-cover shrink-0 mt-0.5"
                              onError={
                                handleImageError
                              }
                            />

                            <div className="max-w-[220px]">

                              <p className="font-semibold text-slate-900 leading-snug">
                                {place.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400 font-medium">
                                {place.district ||
                                  "Badulla, Uva"}
                              </p>

                              {place.description && (
                                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-tight">
                                  {place.description}
                                </p>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* CATEGORY & LOCATION */}

                        <td className="px-4 py-4">
                          <div className="space-y-1 max-w-[180px]">
                            <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                              {place.category ||
                                "Sightseeing"}
                            </span>
                            <p className="text-xs text-slate-500 truncate" title={place.location}>
                              {place.location || "N/A"}
                            </p>
                          </div>
                        </td>

                        {/* TICKET PRICES & PASSES */}

                        <td className="px-4 py-4">
                          {(() => {
                            const tInfo = getTicketInfo(place.name, place.ticketInfo);
                            if (!tInfo) {
                              return <span className="text-xs text-slate-400 italic">Free / No Ticket</span>;
                            }
                            return (
                              <div className="space-y-1 min-w-[150px]">
                                <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold border ${
                                  tInfo.isFree ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {tInfo.badgeText || (tInfo.hasTicket ? "Ticket Required" : "Free Entry")}
                                </span>
                                {tInfo.foreignAdult && (
                                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                                    Foreign: {tInfo.foreignAdult}
                                  </p>
                                )}
                                {tInfo.localAdult && (
                                  <p className="text-[10px] font-semibold text-slate-600 leading-tight">
                                    Local: {tInfo.localAdult}
                                  </p>
                                )}
                                {tInfo.passes && tInfo.passes.length > 0 && (
                                  <p className="text-[10px] font-bold text-teal-700">
                                    🎟️ {tInfo.passes.length} Entry Passes
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* FACILITIES & TRANSPORT */}

                        <td className="px-4 py-4">
                          {(() => {
                            const facs = getPlaceFacilities(place.name, place.category, place.facilities);
                            if (!facs) return <span className="text-xs text-slate-400 italic">Default</span>;
                            const parkCount = facs.parking?.length || 0;
                            const transCount = facs.transport?.length || 0;
                            const foodCount = facs.foodBeverage?.length || 0;
                            const utilCount = facs.utilities?.length || 0;
                            const totalCount = parkCount + transCount + foodCount + utilCount + (facs.other?.length || 0);

                            return (
                              <div className="space-y-1 min-w-[190px]">
                                <div className="flex flex-wrap gap-1">
                                  <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200" title="Parking">
                                    🚗 {parkCount} Parking
                                  </span>
                                  <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200" title="Transport">
                                    🚌 {transCount} Access
                                  </span>
                                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200" title="Food & Beverage">
                                    ☕ {foodCount} Food
                                  </span>
                                  <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200" title="Utilities">
                                    🚽 {utilCount} Utilities
                                  </span>
                                </div>
                                <p className="text-[10px] font-medium text-slate-500">
                                  {totalCount} Total Facility Features
                                </p>
                              </div>
                            );
                          })()}
                        </td>

                        {/* RATING & PHOTOS */}

                        <td className="px-4 py-4">

                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Star
                                size={14}
                                className="fill-amber-400 text-amber-400"
                              />
                              <span className="text-xs font-bold text-slate-900">
                                {place.rating ?? "N/A"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({place.reviews || 0})
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <ImageIcon
                                size={13}
                                className="text-slate-400"
                              />
                              <span>
                                {Array.isArray(
                                  place.images
                                )
                                  ? place.images
                                      .length
                                  : 0}{" "}
                                photos
                              </span>
                            </div>
                          </div>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  place
                                )
                              }
                              className="rounded-xl p-2.5 text-teal-700 transition hover:bg-teal-50"
                              title="Edit"
                            >
                              <Edit
                                size={17}
                              />
                            </button>

                             <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  place._id || place.id
                                )
                              }
                              disabled={
                                deletingId ===
                                (place._id || place.id)
                              }
                              className="rounded-xl p-2.5 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId ===
                              (place._id || place.id) ? (
                                <span className="block h-[17px] w-[17px] animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
                              ) : (
                                <Trash2
                                  size={17}
                                />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
    </>
    )}

    {/* ==================================================
        MANAGE FACILITIES TAB (ADD FACILITIES TO MAP)
    ================================================== */}
    {activeTab === "facilities" && (
      <>
        {/* ADD / EDIT FACILITY FORM */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {editingFacilityId && (
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-amber-50 px-5 py-3.5 border border-amber-200">
              <div className="flex items-center gap-2">
                <Edit size={18} className="text-amber-700" />
                <span className="text-sm font-bold text-amber-900">
                  Editing Facility: "{facilityForm.name || "Facility"}"
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingFacilityId(null);
                  setFacilityForm(emptyFacilityForm);
                }}
                className="rounded-xl bg-amber-200 px-4 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-300"
              >
                Cancel Editing
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              {editingFacilityId ? <Edit size={21} /> : <Plus size={21} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingFacilityId ? "Edit Facility" : "Add Facility to Map"}
              </h2>
              <p className="text-sm text-slate-500">
                {editingFacilityId
                  ? "Update facility details and map position."
                  : "Add hotels, restaurants, fuel stations, hospitals, police stations, or hubs to the map."}
              </p>
            </div>
          </div>

          <form onSubmit={handleFacilitySubmit} className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                  placeholder="e.g. Bandarawela Heritage Hotel"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Facility Category / Type *
                </label>
                <select
                  value={facilityForm.type}
                  onChange={(e) => setFacilityForm({ ...facilityForm, type: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-teal-700 focus:bg-white"
                >
                  <option value="Hotel">🏨 Hotel / Accommodation</option>
                  <option value="Restaurant">🍽️ Restaurant & Cafe</option>
                  <option value="Fuel Station">⛽ Fuel Station (Ceypetco / LIOC)</option>
                  <option value="Medical">🏥 Hospital / Medical Center</option>
                  <option value="Police">🛡️ Police Station</option>
                  <option value="Bus Station">🚌 Bus Station</option>
                  <option value="Railway Station">🚂 Railway Station</option>
                  <option value="Tour Guide">🧭 Tour Guide</option>
                  <option value="Camping">⛺ Camping Equipment Store</option>
                  <option value="Bike Rental">🚲 Bike / Scooter Rental</option>
                </select>
              </div>
            </div>

            {/* INTERACTIVE MAP LOCATION PICKER */}
            <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-teal-900">
                    <MapPin size={16} className="text-teal-700" />
                    Interactive Map Location Picker
                  </label>
                  <p className="text-xs text-slate-600">
                    🎯 Click anywhere on the map or drag the pin to set exact Latitude & Longitude automatically!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setFacilityForm((prev) => ({
                            ...prev,
                            lat: Number(pos.coords.latitude.toFixed(6)),
                            lng: Number(pos.coords.longitude.toFixed(6)),
                          }));
                        },
                        () => alert("Unable to access GPS location.")
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 bg-white px-3 py-1.5 text-xs font-bold text-teal-800 shadow-xs hover:bg-teal-100"
                >
                  🎯 Use My GPS Location
                </button>
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-teal-200 shadow-inner" style={{ height: "320px" }}>
                <MapContainer
                  center={[facilityForm.lat || 6.82977, facilityForm.lng || 80.98457]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapClickHandler
                    onSelectCoords={(lat, lng) => setFacilityForm((prev) => ({ ...prev, lat, lng }))}
                  />

                  <Marker
                    position={[facilityForm.lat || 6.82977, facilityForm.lng || 80.98457]}
                    icon={pickerPinIcon}
                    draggable={true}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target;
                        const pos = marker.getLatLng();
                        setFacilityForm((prev) => ({
                          ...prev,
                          lat: Number(pos.lat.toFixed(6)),
                          lng: Number(pos.lng.toFixed(6)),
                        }));
                      },
                    }}
                  />
                </MapContainer>
              </div>
            </div>

            {/* FACILITY IMAGE URL & UPLOAD */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Facility Image (Paste Image URL or Upload Image)
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={facilityForm.image || ""}
                  onChange={(e) => setFacilityForm({ ...facilityForm, image: e.target.value })}
                  placeholder="Paste Image URL (e.g. https://... or /images/places/...)"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs outline-none focus:border-teal-700"
                />
                <label className="inline-flex cursor-pointer shrink-0 items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-teal-800">
                  <Upload size={15} />
                  Upload Image File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const token = getAdminToken();
                      if (!token) return handleUnauthorized();

                      const fd = new FormData();
                      fd.append("image", file);

                      try {
                        setSuccess("Uploading facility image...");
                        const res = await fetch(`${API_URL}/api/admin/upload`, {
                          method: "POST",
                          headers: { Authorization: `Bearer ${token}` },
                          body: fd,
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setFacilityForm((prev) => ({ ...prev, image: data.path }));
                          setSuccess("Facility image uploaded successfully!");
                        }
                      } catch (err) {
                        setError("Failed to upload image file.");
                      }
                    }}
                  />
                </label>
              </div>
              {facilityForm.image && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
                  <img
                    src={getImageUrl(facilityForm.image)}
                    alt="Facility Preview"
                    className="h-14 w-20 rounded-lg object-cover border"
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-800 truncate">Facility Image Active</span>
                    <span className="block text-[11px] text-slate-500 truncate">{facilityForm.image}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location / Address *
                </label>
                <input
                  type="text"
                  required
                  value={facilityForm.location}
                  onChange={(e) => setFacilityForm({ ...facilityForm, location: e.target.value })}
                  placeholder="e.g. Main Street, Bandarawela"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Latitude (GPS) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={facilityForm.lat}
                  onChange={(e) => setFacilityForm({ ...facilityForm, lat: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 6.8315"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Longitude (GPS) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={facilityForm.lng}
                  onChange={(e) => setFacilityForm({ ...facilityForm, lng: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 80.9880"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={facilityForm.phone}
                  onChange={(e) => setFacilityForm({ ...facilityForm, phone: e.target.value })}
                  placeholder="+94 57 222 2501"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rating (0 - 5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={facilityForm.rating}
                  onChange={(e) => setFacilityForm({ ...facilityForm, rating: parseFloat(e.target.value) || 4.5 })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reviews Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={facilityForm.reviews}
                  onChange={(e) => setFacilityForm({ ...facilityForm, reviews: parseInt(e.target.value, 10) || 0 })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Facility Description
              </label>
              <textarea
                rows={2}
                value={facilityForm.description}
                onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                placeholder="Brief description of the facility..."
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Opening Days
                </label>
                <input
                  type="text"
                  value={facilityForm.openingDays || ""}
                  onChange={(e) => setFacilityForm({ ...facilityForm, openingDays: e.target.value })}
                  placeholder="e.g. Monday - Sunday"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={facilityForm.openingHours || ""}
                  onChange={(e) => setFacilityForm({ ...facilityForm, openingHours: e.target.value })}
                  placeholder="e.g. 08:00 AM - 08:00 PM or 24 Hours"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Google Maps URL
                </label>
                <input
                  type="text"
                  value={facilityForm.googleMapsUrl || ""}
                  onChange={(e) => setFacilityForm({ ...facilityForm, googleMapsUrl: e.target.value })}
                  placeholder="https://www.google.com/maps/..."
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingFacility}
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-700 px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-teal-800 disabled:opacity-50"
            >
              {savingFacility ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving Facility...
                </>
              ) : (
                <>
                  <Save size={18} /> {editingFacilityId ? "Update Facility" : "Add Facility to Map"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* FACILITIES LIST TABLE */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Registered Map Facilities</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage all facilities rendered on the 25km interactive map.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="mr-2 text-slate-400" />
                <input
                  type="text"
                  value={facilitySearch}
                  onChange={(e) => setFacilitySearch(e.target.value)}
                  placeholder="Search facilities..."
                  className="bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button
                type="button"
                onClick={fetchAdminFacilities}
                disabled={facilitiesLoading}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {facilitiesLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {facilitiesLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <Loader2 size={24} className="mx-auto animate-spin text-teal-700 mb-2" />
              Loading facilities from database...
            </div>
          ) : adminFacilities.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <Building2 size={35} className="mx-auto text-slate-400" />
              <h3 className="mt-3 font-semibold text-slate-700">No custom facilities yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Add facilities using the form above to render them on the interactive map.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm text-slate-600">
                <thead className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Facility Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">GPS Coordinates</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {adminFacilities
                    .filter((f) => {
                      const q = facilitySearch.toLowerCase();
                      return (
                        !q ||
                        (f.name && f.name.toLowerCase().includes(q)) ||
                        (f.type && f.type.toLowerCase().includes(q)) ||
                        (f.location && f.location.toLowerCase().includes(q))
                      );
                    })
                    .map((fac) => {
                      const facId = fac._id || fac.id;
                      return (
                        <tr key={facId} className="transition-colors hover:bg-slate-50">
                          <td className="px-4 py-4 font-bold text-slate-900">{fac.name}</td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
                              {fac.type}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs font-medium">{fac.location}</td>
                          <td className="px-4 py-4 text-xs font-mono text-slate-500">
                            {fac.lat?.toFixed(4)}, {fac.lng?.toFixed(4)}
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-700 font-semibold">{fac.phone}</td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditFacility(fac)}
                                className="rounded-xl p-2.5 text-teal-700 transition hover:bg-teal-50"
                                title="Edit Facility"
                              >
                                <Edit size={17} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteFacility(facId)}
                                disabled={deletingFacilityId === facId}
                                className="rounded-xl p-2.5 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                                title="Delete Facility"
                              >
                                {deletingFacilityId === facId ? (
                                  <Loader2 size={17} className="animate-spin" />
                                ) : (
                                  <Trash2 size={17} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )}

    {/* ==================================================
        COMMUNITY REVIEWS MODERATION TAB
    ================================================== */}

    {activeTab === "reviews" && (
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Moderate Community Reviews
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Inspect and delete bad, inappropriate, or spam reviews submitted by visitors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={17} className="mr-2 text-slate-400" />
              <input
                type="text"
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                placeholder="Search reviews or authors..."
                className="bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={fetchAdminReviews}
              disabled={reviewsLoading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {reviewsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {reviewsLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            <Loader2 size={24} className="mx-auto animate-spin text-teal-700 mb-2" />
            Loading community reviews from database...
          </div>
        ) : adminReviews.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <MessageSquare size={35} className="mx-auto text-slate-400" />
            <h3 className="mt-3 font-semibold text-slate-700">No reviews found</h3>
            <p className="mt-1 text-sm text-slate-500">
              No community reviews have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm text-slate-600">
              <thead className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Review Comment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {adminReviews
                  .filter((r) => {
                    const searchStr = reviewSearch.toLowerCase();
                    return (
                      !searchStr ||
                      (r.author && r.author.toLowerCase().includes(searchStr)) ||
                      (r.text && r.text.toLowerCase().includes(searchStr)) ||
                      (r.place?.name && r.place.name.toLowerCase().includes(searchStr))
                    );
                  })
                  .map((rev) => {
                    const reviewId = rev._id || rev.id;
                    return (
                      <tr key={reviewId} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-4 font-bold text-slate-900">
                          {rev.place?.name || "Destination"}
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-700">
                          {rev.author}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Star size={15} className="fill-amber-400 text-amber-400" />
                            <span className="font-bold">{rev.rating}</span>
                          </div>
                        </td>
                        <td className="max-w-xs px-4 py-4 text-xs leading-relaxed text-slate-600">
                          <p>{rev.text}</p>
                          {Array.isArray(rev.videos) && rev.videos.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {rev.videos.map((vidUrl, vidIdx) => (
                                <div
                                  key={vidIdx}
                                  onClick={() => setPreviewAdImage({ url: vidUrl, title: `Review Video by ${rev.author}`, isVideo: true })}
                                  className="group relative h-10 w-14 cursor-pointer overflow-hidden rounded border border-amber-300 bg-slate-900 shadow-xs"
                                >
                                  <video src={vidUrl} className="h-full w-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-amber-300 text-[10px] font-bold">
                                    🎥 Play
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {Array.isArray(rev.images) && rev.images.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {rev.images.map((imgUrl, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={getImageUrl(imgUrl)}
                                  alt="Review photo"
                                  className="h-10 w-12 rounded border object-cover shadow-xs"
                                />
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                          {rev.createdAt
                            ? new Date(rev.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(reviewId)}
                            disabled={deletingReviewId === reviewId}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                          >
                            {deletingReviewId === reviewId ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Remove Bad Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

    {/* ==================================================
        MANAGE MERCHANT ADS TAB
    ================================================== */}
    {activeTab === "ads" && (
      <div className="mt-8 space-y-6">
        {/* Header summary & stats */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="text-amber-500" size={22} />
              Merchant Ads & Promotion Management Authority
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Verify payment receipts, adjust publishing times, publish or remove banners displayed on Home page.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-2xl bg-amber-50 px-3.5 py-1.5 text-xs font-extrabold text-amber-800 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
              {adminAds.filter((a) => a.status === "pending").length} Pending Verification
            </span>
            <span className="rounded-2xl bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
              {adminAds.filter((a) => a.status === "published").length} Live Published Banners
            </span>
          </div>
        </div>

        {/* Ad Submissions List */}
        {adsLoading ? (
          <div className="p-12 text-center">
            <Loader2 size={32} className="mx-auto animate-spin text-teal-600" />
            <p className="mt-2 text-xs font-bold text-slate-500">Loading merchant ad submissions...</p>
          </div>
        ) : adminAds.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Megaphone size={36} className="mx-auto text-slate-400" />
            <h3 className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">
              No Advertisement Requests Yet
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Merchant ad requests submitted via sidebar will appear here for verification & publishing.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {adminAds.map((ad) => {
              const isPending = ad.status === "pending";
              const isPublished = ad.status === "published";
              const isPaused = ad.status === "paused";
              const isRejected = ad.status === "rejected";

              return (
                <div
                  key={ad._id}
                  className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 p-6"
                >
                  <div>
                    {/* Header: Business & Status Pill */}
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                          {ad.businessName}
                        </span>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                          <Phone size={13} className="text-teal-600" />
                          <span>{ad.contactPhone}</span>
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
                          isPublished
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : isPending
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : isPaused
                            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {ad.status}
                      </span>
                    </div>

                    {/* Promotion Title & Description */}
                    <div className="mt-4">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {ad.title}
                      </h3>
                      {ad.description && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                          {ad.description}
                        </p>
                      )}
                    </div>

                    {/* Image / Video Thumbnails: Ad Banner + Payment Receipt */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                          Ad Banner ({ad.posterType === "video" || ad.posterVideo ? "🎥 Video" : "📷 Image"})
                        </span>
                        <div
                          onClick={() =>
                            setPreviewAdImage({
                              url: ad.posterVideo || ad.posterImage,
                              title: `${ad.businessName} ${ad.posterVideo ? "Video Banner" : "Poster"}`,
                              isVideo: Boolean(ad.posterType === "video" || ad.posterVideo),
                            })
                          }
                          className="group relative h-28 cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 dark:border-slate-700"
                        >
                          {ad.posterType === "video" || ad.posterVideo ? (
                            <video src={ad.posterVideo} autoPlay loop muted playsInline className="h-full w-full object-cover" />
                          ) : (
                            <img
                              src={ad.posterImage}
                              alt="Poster"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition group-hover:opacity-100 text-white font-bold text-xs gap-1">
                            <Eye size={16} /> View Full
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                          Payment Slip / Receipt
                        </span>
                        {ad.receiptImage ? (
                          <div
                            onClick={() => setPreviewAdImage({ url: ad.receiptImage, title: `${ad.businessName} Payment Receipt`, isVideo: false })}
                            className="group relative h-28 cursor-pointer overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30"
                          >
                            <img
                              src={ad.receiptImage}
                              alt="Receipt"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition group-hover:opacity-100 text-white font-bold text-xs gap-1">
                              <Eye size={16} /> Check Slip
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-28 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                            No Receipt Uploaded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Publishing Duration & Expiration Control */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Clock size={14} className="text-teal-600" />
                        <span>
                          Duration: <strong>{ad.durationDays || 7} Days</strong>
                        </span>
                      </div>

                      {ad.expiresAt && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Expires: {new Date(ad.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Authority Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleDeleteAdItem(ad._id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
                    >
                      <Trash2 size={14} /> Remove
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {isPublished ? (
                        <button
                          onClick={() => handleUpdateAdStatus(ad._id, "paused", ad.durationDays)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-700"
                        >
                          <Pause size={14} /> Pause Ad
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateAdStatus(ad._id, "published", ad.durationDays || 7)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-md transition hover:bg-emerald-500"
                        >
                          <Play size={14} /> Publish Ad
                        </button>
                      )}

                      {!isRejected && !isPublished && (
                        <button
                          onClick={() => handleUpdateAdStatus(ad._id, "rejected", ad.durationDays)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

    {/* ==================================================
        USER ACTIVITY LOGS & EXCEL DATABASE TAB
    ================================================== */}
    {activeTab === "user-logs" && (
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <FileSpreadsheet size={20} />
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                User Activity Excel Database
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Live Visitor Records automatically appended to <code className="font-mono text-teal-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">server/data/user_activity.xlsx</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.open(`${API_URL}/api/user-logs/download-excel`, "_blank")}
              className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-800 active:scale-98"
            >
              <Download size={16} />
              📥 Download Excel File (.xlsx)
            </button>

            <button
              type="button"
              onClick={loadUserLogs}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mt-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userLogSearch}
              onChange={(e) => setUserLogSearch(e.target.value)}
              placeholder="Search user logs by name, location, or date..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-teal-600 focus:bg-white"
            />
          </div>
        </div>

        {/* LOGS TABLE */}
        {userLogsLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-teal-700" />
          </div>
        ) : userLogs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <Users size={32} className="mx-auto text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-700">No user activity logs recorded yet.</p>
            <p className="mt-1 text-xs text-slate-400">When visitors enter their name on the site, records will automatically show up here.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-extrabold tracking-wider">
                  <th className="px-4 py-3.5">User Name</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5">Google Maps Link</th>
                  <th className="px-4 py-3.5 text-right">Excel Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-xs">
                {userLogs
                  .filter((log) => {
                    if (!userLogSearch.trim()) return true;
                    const q = userLogSearch.toLowerCase();
                    return (
                      log.userName?.toLowerCase().includes(q) ||
                      log.location?.toLowerCase().includes(q) ||
                      log.date?.toLowerCase().includes(q) ||
                      log.time?.toLowerCase().includes(q)
                    );
                  })
                  .map((log, idx) => (
                    <tr key={log._id || idx} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        👤 {log.userName}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        📅 {log.date}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        ⏰ {log.time}
                      </td>
                      <td className="px-4 py-3.5">
                        {log.location && log.location.startsWith("http") ? (
                          <a
                            href={log.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-bold text-teal-700 hover:text-teal-900 underline hover:no-underline"
                          >
                            <MapPin size={14} className="text-teal-600" />
                            <span>Open Google Maps Pin</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <a
                            href={`https://www.google.com/maps?q=${encodeURIComponent(log.location || "6.8767,81.0611")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-bold text-teal-700 hover:text-teal-900 underline hover:no-underline"
                          >
                            <MapPin size={14} className="text-teal-600" />
                            <span>{log.location || "Open Google Maps"}</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Logged in Excel
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

    {/* Bus Services Management Tab */}
    {activeTab === "buses" && (
      <div className="mt-8 space-y-8">
        
        {/* ADD / EDIT BUS FORM */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingBusId ? "✏️ Edit Bus Service" : "🚌 Add New Bus Service"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage intercity & local bus timetables, fares, phone numbers, & routes.
              </p>
            </div>
            {editingBusId && (
              <button
                type="button"
                onClick={() => {
                  setEditingBusId(null);
                  setBusFormData({
                    name: "",
                    routeNumber: "",
                    origin: "",
                    destination: "",
                    via: "",
                    fare: "",
                    busType: "",
                    phone: "",
                    conductorPhone: "",
                    hotline: "1955 (NTC Hotline)",
                    description: "",
                    image: "/images/Nearby facilities/Colombo Bandarawela Bus.jpg",
                    isInternal: false,
                    busTimes: "05:30 AM, 08:45 AM, 02:50 PM, 09:30 PM",
                  });
                }}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setSuccess("");
              try {
                const timesArray = busFormData.busTimes
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => ({ time: t, tag: "Express", icon: "🚌" }));

                const payload = {
                  name: busFormData.name,
                  routeNumber: busFormData.routeNumber,
                  origin: busFormData.origin,
                  destination: busFormData.destination,
                  via: busFormData.via,
                  fare: busFormData.fare,
                  busType: busFormData.busType,
                  phone: busFormData.phone || "N/A",
                  conductorPhone: busFormData.conductorPhone || "N/A",
                  hotline: busFormData.hotline || "1955 (NTC Hotline)",
                  description: busFormData.description || "",
                  image: busFormData.image || "/images/Nearby facilities/Colombo Bandarawela Bus.jpg",
                  isInternal: Boolean(busFormData.isInternal),
                  busTimes: timesArray.length > 0 ? timesArray : [{ time: "06:00 AM", tag: "Daily", icon: "🌅" }],
                };

                if (editingBusId) {
                  await updateBusService(editingBusId, payload);
                  setSuccess("Bus service updated successfully in database!");
                } else {
                  await createBusService(payload);
                  setSuccess("New bus service added to database!");
                }

                setEditingBusId(null);
                setBusFormData({
                  name: "",
                  routeNumber: "",
                  origin: "",
                  destination: "",
                  via: "",
                  fare: "",
                  busType: "",
                  phone: "",
                  conductorPhone: "",
                  hotline: "1955 (NTC Hotline)",
                  description: "",
                  image: "/images/Nearby facilities/Colombo Bandarawela Bus.jpg",
                  isInternal: false,
                  busTimes: "05:30 AM, 08:45 AM, 02:50 PM, 09:30 PM",
                });
                loadAdminBuses();
              } catch (err) {
                setError(err?.response?.data?.error || "Failed to save bus service.");
              }
            }}
            className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase">Bus Service Name *</label>
              <input
                type="text"
                required
                value={busFormData.name}
                onChange={(e) => setBusFormData({ ...busFormData, name: e.target.value })}
                placeholder="e.g. Colombo ↔ Bandarawela Highway Coach"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase">Route Number *</label>
              <input
                type="text"
                required
                value={busFormData.routeNumber}
                onChange={(e) => setBusFormData({ ...busFormData, routeNumber: e.target.value })}
                placeholder="e.g. Route 99/EX"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase">Fare Amount *</label>
              <input
                type="text"
                required
                value={busFormData.fare}
                onChange={(e) => setBusFormData({ ...busFormData, fare: e.target.value })}
                placeholder="e.g. LKR 1,850"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase">Origin Station *</label>
              <input
                type="text"
                required
                value={busFormData.origin}
                onChange={(e) => setBusFormData({ ...busFormData, origin: e.target.value })}
                placeholder="e.g. Colombo Fort"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase">Destination Terminal *</label>
              <input
                type="text"
                required
                value={busFormData.destination}
                onChange={(e) => setBusFormData({ ...busFormData, destination: e.target.value })}
                placeholder="e.g. Bandarawela Central"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase">Bus Type *</label>
              <input
                type="text"
                required
                value={busFormData.busType}
                onChange={(e) => setBusFormData({ ...busFormData, busType: e.target.value })}
                placeholder="e.g. AC King Long Super Luxury"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-xs font-bold text-slate-600 uppercase">Transit Corridor (Via Route) *</label>
              <input
                type="text"
                required
                value={busFormData.via}
                onChange={(e) => setBusFormData({ ...busFormData, via: e.target.value })}
                placeholder="e.g. Southern Expressway (E02) → Wellawaya → Haputale → Bandarawela"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase">SLTB Depot Phone</label>
              <input
                type="text"
                value={busFormData.phone}
                onChange={(e) => setBusFormData({ ...busFormData, phone: e.target.value })}
                placeholder="+94 57 222 2281"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase">Conductor Phone</label>
              <input
                type="text"
                value={busFormData.conductorPhone}
                onChange={(e) => setBusFormData({ ...busFormData, conductorPhone: e.target.value })}
                placeholder="+94 77 105 7740"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase">Hotline Info</label>
              <input
                type="text"
                value={busFormData.hotline}
                onChange={(e) => setBusFormData({ ...busFormData, hotline: e.target.value })}
                placeholder="1955 (NTC Hotline)"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-xs font-bold text-slate-600 uppercase">Departure Times (Comma Separated)</label>
              <input
                type="text"
                value={busFormData.busTimes}
                onChange={(e) => setBusFormData({ ...busFormData, busTimes: e.target.value })}
                placeholder="05:30 AM, 08:45 AM, 02:50 PM, 09:30 PM"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-xs font-bold text-slate-600 uppercase">Bus Image URL</label>
              <input
                type="text"
                value={busFormData.image}
                onChange={(e) => setBusFormData({ ...busFormData, image: e.target.value })}
                placeholder="/images/Nearby facilities/Colombo Bandarawela Bus.jpg"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-teal-600"
              />
            </div>

            <div className="col-span-full flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={busFormData.isInternal}
                  onChange={(e) => setBusFormData({ ...busFormData, isInternal: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>🚐 Internal Local Bus Service (Local Uva Route)</span>
              </label>
            </div>

            <div className="col-span-full pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-teal-800 active:scale-98"
              >
                <Save size={16} />
                {editingBusId ? "Update Bus Service" : "Add Bus Service to Database"}
              </button>
            </div>
          </form>
        </div>

        {/* BUS SERVICES TABLE / LIST */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Active Bus Services ({adminBuses.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All bus routes stored in MongoDB and rendered live on /transport.
              </p>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busSearch}
                onChange={(e) => setBusSearch(e.target.value)}
                placeholder="Filter by route name, number, or city..."
                className="w-full sm:w-64 rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {busesLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 size={24} className="animate-spin text-teal-700" />
            </div>
          ) : adminBuses.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Compass size={32} className="mx-auto text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-700">No bus services found in database.</p>
              <p className="mt-1 text-xs text-slate-400">Use the form above to add a new bus route.</p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-extrabold tracking-wider">
                    <th className="px-4 py-3.5">Route</th>
                    <th className="px-4 py-3.5">Origin ➔ Destination</th>
                    <th className="px-4 py-3.5">Type & Category</th>
                    <th className="px-4 py-3.5">Fare</th>
                    <th className="px-4 py-3.5">Depot Contact</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-xs">
                  {adminBuses
                    .filter((b) => {
                      if (!busSearch.trim()) return true;
                      const q = busSearch.toLowerCase();
                      return (
                        b.name?.toLowerCase().includes(q) ||
                        b.routeNumber?.toLowerCase().includes(q) ||
                        b.origin?.toLowerCase().includes(q) ||
                        b.destination?.toLowerCase().includes(q) ||
                        b.via?.toLowerCase().includes(q)
                      );
                    })
                    .map((bus) => (
                      <tr key={bus._id || bus.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5">
                          <div className="font-extrabold text-slate-900">{bus.name}</div>
                          <span className="inline-block rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 mt-1">
                            {bus.routeNumber}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-medium text-slate-700">
                          {bus.origin} ➔ {bus.destination}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-800">{bus.busType}</span>
                          <br />
                          {bus.isInternal ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-block mt-0.5">
                              🚐 Internal Local
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 inline-block mt-0.5">
                              ⚡ Intercity Highway
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 font-bold text-emerald-700">
                          {bus.fare}
                        </td>

                        <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                          📞 {bus.phone}
                        </td>

                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBusId(bus._id || bus.id);
                              setBusFormData({
                                name: bus.name || "",
                                routeNumber: bus.routeNumber || "",
                                origin: bus.origin || "",
                                destination: bus.destination || "",
                                via: bus.via || "",
                                fare: bus.fare || "",
                                busType: bus.busType || "",
                                phone: bus.phone || "",
                                conductorPhone: bus.conductorPhone || "",
                                hotline: bus.hotline || "1955 (NTC Hotline)",
                                description: bus.description || "",
                                image: bus.image || "/images/Nearby facilities/Colombo Bandarawela Bus.jpg",
                                isInternal: Boolean(bus.isInternal),
                                busTimes: Array.isArray(bus.busTimes)
                                  ? bus.busTimes.map((t) => t.time).join(", ")
                                  : "05:30 AM, 02:50 PM",
                              });
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 border border-sky-200"
                          >
                            <Edit size={13} /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBusItem(bus._id || bus.id)}
                            className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 border border-rose-200"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    )}

    {/* Full Screen Image / Video Lightbox Preview Modal */}
    {previewAdImage && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative max-w-3xl overflow-hidden rounded-3xl bg-slate-900 p-4 text-white shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-200">{previewAdImage.title}</h3>
            <button
              onClick={() => setPreviewAdImage(null)}
              className="rounded-full bg-slate-800 p-1.5 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-3 max-h-[80vh] overflow-auto">
            {previewAdImage.isVideo ? (
              <video src={previewAdImage.url} controls autoPlay className="w-full rounded-2xl object-contain max-h-[75vh]" />
            ) : (
              <img src={previewAdImage.url} alt="Preview" className="w-full rounded-2xl object-contain max-h-[75vh]" />
            )}
          </div>
        </div>
      </div>
    )}

      </div>
    </div>
  );
}

export default Admin;