import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchRoadRoutes } from "../utils/osrmRoutingUtil";
import {
  Navigation,
  MapPin,
  Car,
  Bus,
  Footprints,
  ArrowRightLeft,
  Clock,
  ExternalLink,
  Compass,
  Layers,
  Globe,
} from "lucide-react";

// Bandarawela Central Bus Station Center
const BANDARAWELA_CENTER = [6.82977, 80.98457];

// Location Pin for Destinations (Teal Pin)
const destinationPinIcon = L.divIcon({
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

// Origin Pin (Amber Flag)
const originPinIcon = L.divIcon({
  className: "custom-origin-pin",
  html: `
    <div style="background-color: #d97706; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(217,119,6,0.5); transform: translate(-50%, -50%);">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19],
});

// Route Start Marker (Red A)
const routeStartIcon = L.divIcon({
  className: "custom-route-start-pin",
  html: `
    <div style="background-color: #ef4444; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 15px; border: 3px solid white; box-shadow: 0 4px 10px rgba(239,68,68,0.5); transform: translate(-50%, -50%);">
      A
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// Route End Marker (Blue B)
const routeEndIcon = L.divIcon({
  className: "custom-route-end-pin",
  html: `
    <div style="background-color: #2563eb; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 15px; border: 3px solid white; box-shadow: 0 4px 10px rgba(37,99,235,0.5); transform: translate(-50%, -50%);">
      B
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// Category-specific Logo Creator for Facilities
function createFacilityLogoIcon(emoji, bgColor) {
  return L.divIcon({
    className: "custom-facility-logo",
    html: `
      <div style="background-color: ${bgColor}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.25); transform: translate(-50%, -50%);">
        ${emoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

const facilityLogoIcons = {
  hotel: createFacilityLogoIcon("🏨", "#2563eb"),
  restaurant: createFacilityLogoIcon("🍽️", "#ea580c"),
  fuel: createFacilityLogoIcon("⛽", "#dc2626"),
  medical: createFacilityLogoIcon("🏥", "#16a34a"),
  police: createFacilityLogoIcon("🛡️", "#4f46e5"),
  transport: createFacilityLogoIcon("🚌", "#d97706"),
};

function getIconForLocation(loc) {
  if (loc.name === "Bandarawela Bus Stop") {
    return originPinIcon;
  }
  if (loc.type === "attraction") {
    return destinationPinIcon;
  }
  if (facilityLogoIcons[loc.type]) {
    return facilityLogoIcons[loc.type];
  }
  return destinationPinIcon;
}

// Helper component to center map or fit bounds smoothly
function MapController({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length === 2 && bounds[0] && bounds[1]) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, animate: true });
    } else if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 10.2, { duration: 1.5 });
    }
  }, [center, zoom, bounds, map]);
  return null;
}

// Map Click Detector Component
function MapClickDetector({ pickingMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (pickingMode) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

function getMapLocationImage(loc) {
  if (!loc) return null;
  if (loc.image) return loc.image;

  const name = loc.name || "";
  
  if (name.includes("Porowagala")) return "/images/places/porowagala-viewpoint.jpg";
  if (name.includes("Dowa")) return "/images/places/dowa-rock-temple.jpg";
  if (name.includes("Adisham")) return "/images/places/adisham-bungalow.jpg";
  if (name.includes("Ella Rock")) return "/images/places/ella-rock.jpeg";
  if (name.includes("Little Adam")) return "/images/places/little-adams-peak.jpg";
  if (name.includes("Nine Arches")) return "/images/places/nine-arches-bridge.jpg";
  if (name.includes("Rawana Ella Cave") || name.includes("Ravana Cave")) return "/images/places/rawana-ella-cave.jpg";
  if (name.includes("Halpewatte")) return "/images/places/halpewatte-tea-factory.jpg";
  if (name.includes("Ravana Fall")) return "/images/places/ravana-fall.jpg";
  if (name.includes("Lipton")) return "/images/places/liptons-seat.jpg";

  return `/images/Nearby facilities/${name}.jpg`;
}

// Haversine formula to compute exact straight-line distance in kilometers
function calculateHaversineKm(coords1, coords2) {
  if (!coords1 || !coords2) return 0;
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Travel ETA Calculator
function getTravelEstimate(straightKm, mode = "car") {
  const roadKm = straightKm * 1.25; // Winding road factor in Uva terrain
  let speedKmH = 40; // Car / Tuk-Tuk
  if (mode === "bus") speedKmH = 25;
  if (mode === "walk") speedKmH = 4.5;

  const totalMins = Math.max(1, Math.round((roadKm / speedKmH) * 60));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  let durationText = "";
  if (hrs > 0) {
    durationText = `${hrs} hr ${mins} min`;
  } else {
    durationText = `${mins} min`;
  }

  return {
    roadKm: roadKm.toFixed(1),
    straightKm: straightKm.toFixed(1),
    durationText,
    totalMins,
  };
}

// Multi-route generator (Best Route + 2 Alternative Routes with distinct colors)
function generateAlternativeRoutes(originCoords, destCoords, travelMode = "car") {
  if (!originCoords || !destCoords) return [];

  const straightKm = calculateHaversineKm(originCoords, destCoords);
  const [lat1, lng1] = originCoords;
  const [lat2, lng2] = destCoords;

  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  const latDiff = lat2 - lat1;
  const lngDiff = lng2 - lng1;

  // 1. BEST & FASTEST ROUTE (Primary - Teal / Emerald #0f766e)
  const p1_best = [lat1 + latDiff * 0.35 + lngDiff * 0.08, lng1 + lngDiff * 0.35 - latDiff * 0.08];
  const p2_best = [lat1 + latDiff * 0.70 - lngDiff * 0.04, lng1 + lngDiff * 0.70 + latDiff * 0.04];
  const bestWaypoints = [originCoords, p1_best, p2_best, destCoords];
  const bestEstimate = getTravelEstimate(straightKm * 1.0, travelMode);

  // 2. SCENIC MOUNTAIN ROUTE (Alternative 1 - Purple #7c3aed)
  const p1_scenic = [midLat + lngDiff * 0.22, midLng - latDiff * 0.22];
  const scenicWaypoints = [originCoords, p1_scenic, destCoords];
  const scenicEstimate = getTravelEstimate(straightKm * 1.16, travelMode);

  // 3. MAIN HIGHWAY / BYWAY ROUTE (Alternative 2 - Amber #d97706)
  const p1_express = [midLat - lngDiff * 0.18, midLng + latDiff * 0.18];
  const expressWaypoints = [originCoords, p1_express, destCoords];
  const expressEstimate = getTravelEstimate(straightKm * 1.10, travelMode);

  return [
    {
      id: "best",
      name: "⚡ Best & Fastest Route",
      via: "Direct Main Road",
      color: "#0f766e",
      hoverColor: "#115e59",
      activeBorder: "border-teal-600 bg-teal-50/90 dark:bg-teal-950/60 dark:border-teal-500",
      dashArray: null,
      weight: 6,
      distanceKm: bestEstimate.roadKm,
      durationText: bestEstimate.durationText,
      tag: "BEST ROUTE",
      tagBg: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700",
      waypoints: bestWaypoints,
    },
    {
      id: "scenic",
      name: "🏞️ Scenic Mountain Route",
      via: "Highland Ridge Pass",
      color: "#7c3aed",
      hoverColor: "#6d28d9",
      activeBorder: "border-purple-600 bg-purple-50/90 dark:bg-purple-950/60 dark:border-purple-500",
      dashArray: "6, 8",
      weight: 5,
      distanceKm: scenicEstimate.roadKm,
      durationText: scenicEstimate.durationText,
      tag: "SCENIC VIEW",
      tagBg: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700",
      waypoints: scenicWaypoints,
    },
    {
      id: "express",
      name: "🛣️ Valley Highway Byway",
      via: "Bypass Main Road",
      color: "#d97706",
      hoverColor: "#b45309",
      activeBorder: "border-amber-600 bg-amber-50/90 dark:bg-amber-950/60 dark:border-amber-500",
      dashArray: "4, 6",
      weight: 5,
      distanceKm: expressEstimate.roadKm,
      durationText: expressEstimate.durationText,
      tag: "LESS TRAFFIC",
      tagBg: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700",
      waypoints: expressWaypoints,
    },
  ];
}

function getGoogleMapsDirectionsUrl(originCoords, originName, destCoords, destName, travelMode) {
  const modeMap = {
    car: "driving",
    bus: "transit",
    walk: "walking",
  };
  const mode = modeMap[travelMode] || "driving";
  const o = originCoords ? `${originCoords[0]},${originCoords[1]}` : encodeURIComponent(originName || "");
  const d = destCoords ? `${destCoords[0]},${destCoords[1]}` : encodeURIComponent(destName || "");
  return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=${mode}`;
}

const allMapData = [
  // ==========================================
  // TOURIST ATTRACTIONS (Inside 25km radius)
  // ==========================================
  {
    name: "Porowagala Viewpoint",
    position: [6.830560, 81.012682],
    category: "Viewpoint (Bandarawela)",
    type: "attraction",
    dist: "3.5 km",
    phone: "055 222 9675",
    openingHours: "Open 24 hours",
    address: "Mahaulpatha, Galkanda, Bandarawela, Sri Lanka",
    locationCode: "R2J7+34 Bandarawela, Sri Lanka - 6.830559988080396, 81.01268150484262",
  },
  {
    name: "Dowa Rock Temple",
    position: [6.857426, 81.022059],
    category: "Historical Cave Temple (Dowa)",
    type: "attraction",
    dist: "6.0 km",
    phone: "+94 57 222 8630",
    openingHours: "6:00 AM - 6:00 PM",
    address: "Dowa Rock Temple, Badulla Bandarawela Road, Bandarawela, Sri Lanka .",
    locationCode: "V24C+GWC, Sri Lanka - 6.857425909029196, 81.02205925881152",
  },
  {
    name: "Adisham Bungalow",
    position: [6.773087, 80.930990],
    category: "Benedictine Monastery (Haputale)",
    type: "attraction",
    dist: "12.8 km",
    phone: "+94 57 226 8030",
    openingHours: "9:00 AM – 4:30 PM",
    address: "Adisham Bungalow, Adisham Rd, Haputale 90160, Sri Lanka.",
    locationCode: "6.773086557447562, 80.93099045087155",
  },
  {
    name: "Ella Rock",
    position: [6.8538, 81.0464],
    category: "Cliff Viewpoint & Hiking Trail",
    type: "attraction",
    dist: "13.8 km",
    phone: "N/A",
    openingHours: "Open 24 hours",
    address: "Ella Rock Hiking Resort, Kithalella, Ella, 90090, Sri Lanka.",
    locationCode: "V25V+4JJ, Unnamed Road, Ella, Sri Lanka - 6.865390333517679, 81.04314223209576",
  },
  {
    name: "Little Adam's Peak",
    position: [6.8625, 81.0638],
    category: "Panoramic Peak (Ella)",
    type: "attraction",
    dist: "15.1 km",
    phone: "+94 70 110 0021",
    openingHours: "5:00 AM - 6:30 PM",
    address: "Little Adam's Peak, Ella-Passara Road, Ella, Uva, Sri Lanka.",
    locationCode: "V387+36 Ella, Sri Lanka - 6.8680245630699215, 81.06307696582688",
  },
  {
    name: "Nine Arches Bridge",
    position: [6.87676, 81.06076],
    category: "Colonial Bridge (Demodara)",
    type: "attraction",
    dist: "15.4 km",
    phone: "N/A",
    openingHours: "Open 24 hours",
    address: "Demodara, Ella, Sri Lanka.",
    locationCode: "V3G6+X3, Ambagollapathana, Sri Lanka - 6.884151154188959, 81.05927859962034",
  },
  {
    name: "Rawana Ella Cave",
    position: [6.864793, 81.048639],
    category: "Prehistoric Cave Site",
    type: "attraction",
    dist: "16.5 km",
    phone: "+94 71 613 1211",
    openingHours: "8:30 AM – 5:30 PM",
    address: "Ravana Ella Cave, Ella Wellawaya Road, Ella.",
    locationCode: "V27X+QFR, Ella, Sri Lanka - 6.864792997229675, 81.04863933379441",
  },
  {
    name: "Halpewatte Tea Factory",
    position: [6.890353, 81.034249],
    category: "Tea Processing Tour (Halpe)",
    type: "attraction",
    dist: "18.2 km",
    phone: "+94 57 222 8599",
    openingHours: "8:00 AM - 4:30 PM",
    address: "Uva Halpewatte Tea Factory, Badulla Road, Hela Halpe, Ella, Sri Lanka 90090, Sri Lanka.",
    locationCode: "V2QM+PR Kumbalwela, Sri Lanka - +94572228599 - 6.89035332628612, 81.03424924346947",
  },
  {
    name: "Ravana Falls",
    position: [6.84074, 81.05492],
    category: "Roadside Waterfall (A23)",
    type: "attraction",
    dist: "19.2 km",
    phone: "N/A",
    openingHours: "Open 24 hours",
    address: "Ravana Ella, Ella Wellawaya Road, Ella, 90090, Sri Lanka.",
    locationCode: "V28V+FRM, A23, Ella, Sri Lanka - 6.866848203611271, 81.04451312018932",
  },
  {
    name: "Lipton's Seat",
    position: [6.789521, 81.017612],
    category: "Panoramic Viewpoint (Dambatenne)",
    type: "attraction",
    dist: "22.5 km",
    phone: "+94 57 567 0595",
    openingHours: "5:30 AM - 5:00 PM",
    address: "Lipton Seat Road, Dambethenna Estate, Haputale 90160, Sri Lanka.",
    locationCode: "6.789520980363356, 81.01761188949553",
  },

  // ==========================================
  // HOTELS & RESORTS (Bandarawela, Haputale, Diyatalawa, Ella)
  // ==========================================
  { name: "Bandarawela Heritage Hotel", position: [6.83150, 80.98800], category: "Heritage Hotel (Bandarawela)", type: "hotel", phone: "+94 57 222 2501" },
  { name: "Orient Hotel Bandarawela", position: [6.82850, 80.98500], category: "Hotel (Bandarawela)", type: "hotel", phone: "+94 57 222 2407" },
  { name: "Melheim Resort & Spa Haputale", position: [6.77100, 80.94500], category: "Luxury Resort (Haputale)", type: "hotel", phone: "+94 57 226 8000" },
  { name: "Olympus Plaza Hotel", position: [6.76850, 80.95800], category: "Hotel (Haputale)", type: "hotel", phone: "+94 57 226 8200" },
  { name: "Thotalagala Plantation House", position: [6.77800, 80.95100], category: "Boutique Hotel (Haputale)", type: "hotel", phone: "+94 77 301 2288" },
  { name: "Diyatalawa Heritage Bungalow", position: [6.81200, 80.95800], category: "Bungalow (Diyatalawa)", type: "hotel", phone: "+94 57 222 9100" },
  { name: "EKHO Ella", position: [6.87100, 81.04900], category: "Resort Hotel (Ella)", type: "hotel", phone: "+94 57 222 8655" },
  { name: "Morning Dew Hotel", position: [6.87250, 81.04750], category: "Hotel (Ella)", type: "hotel", phone: "+94 57 493 3373" },
  { name: "Green Hill Ella", position: [6.86900, 81.05200], category: "Hotel (Ella)", type: "hotel", phone: "+94 77 919 2937" },

  // ==========================================
  // RESTAURANTS & CAFES (Bandarawela, Haputale, Welimada, Ella)
  // ==========================================
  { name: "Bandarawela Rest House Dining", position: [6.83050, 80.98650], category: "Restaurant (Bandarawela)", type: "restaurant", phone: "+94 57 222 2201" },
  { name: "Family Restaurant Bandarawela", position: [6.82900, 80.98400], category: "Family Dining (Bandarawela)", type: "restaurant", phone: "+94 57 222 3120" },
  { name: "Misty Mountain Cafe Haputale", position: [6.76820, 80.95700], category: "Cafe (Haputale)", type: "restaurant", phone: "+94 57 226 8110" },
  { name: "Risara Bakers & Restaurant", position: [6.76750, 80.95650], category: "Bakery & Cafe (Haputale)", type: "restaurant", phone: "+94 57 226 8050" },
  { name: "Welimada Family Restaurant", position: [6.90389, 80.95250], category: "Restaurant (Welimada)", type: "restaurant", phone: "+94 57 224 5100" },
  { name: "360 Ella", position: [6.87120, 81.04880], category: "Restaurant (Ella)", type: "restaurant", phone: "+94 76 288 7480" },
  { name: "Cafe Chill", position: [6.87080, 81.04920], category: "Cafe & Bar (Ella)", type: "restaurant", phone: "+94 77 180 4020" },
  { name: "Café UFO Ella", position: [6.86950, 81.04800], category: "Restaurant (Ella)", type: "restaurant", phone: "+94 77 774 8168" },
  { name: "Cafe One Love Ella", position: [6.87300, 81.04700], category: "Cafe (Ella)", type: "restaurant", phone: "+94 70 143 0561" },

  // ==========================================
  // FUEL STATIONS (Bandarawela, Haputale, Diyatalawa, Welimada, Ella)
  // ==========================================
  { name: "Ceypetco Central Station Bandarawela", position: [6.83200, 80.98600], category: "Fuel Station (Bandarawela)", type: "fuel", phone: "+94 57 222 2234" },
  { name: "LIOC Fuel Station Bandarawela", position: [6.83400, 80.99100], category: "Fuel Station (Bandarawela)", type: "fuel", phone: "+94 57 222 2890" },
  { name: "Ceypetco Filling Station Haputale", position: [6.76700, 80.95600], category: "Fuel Station (Haputale)", type: "fuel", phone: "+94 57 226 8020" },
  { name: "Diyatalawa Fuel Station", position: [6.81900, 80.96200], category: "Fuel Station (Diyatalawa)", type: "fuel", phone: "+94 57 222 9050" },
  { name: "Hela Halpe Fuel Station", position: [6.90450, 81.06550], category: "Fuel Station (Halpe / Badulla Rd)", type: "fuel", phone: "+94 57 205 0825" },
  { name: "Welimada Ceypetco Filling Station", position: [6.90389, 80.95250], category: "Fuel Station (Welimada)", type: "fuel", phone: "+94 57 224 5020" },

  // ==========================================
  // HOSPITALS & MEDICAL (Bandarawela, Haputale, Diyatalawa, Welimada, Ella)
  // ==========================================
  { name: "Bandarawela District Base Hospital", position: [6.83361, 80.98556], category: "Base Hospital (Bandarawela)", type: "medical", phone: "+94 57 222 2261" },
  { name: "Haputale Base Hospital", position: [6.76861, 80.95833], category: "Divisional Hospital (Haputale)", type: "medical", phone: "+94 57 226 8061" },
  { name: "Diyatalawa Base & Military Hospital", position: [6.81889, 80.96444], category: "Base Hospital (Diyatalawa)", type: "medical", phone: "+94 57 222 9061" },
  { name: "Welimada Divisional Hospital", position: [6.90528, 80.95111], category: "Hospital (Welimada)", type: "medical", phone: "+94 57 224 5061" },
  { name: "IMC MED Hospital Ella", position: [6.87400, 81.04850], category: "Medical Center (Ella)", type: "medical", phone: "+94 71 923 0000" },
  { name: "Health Aid Ella Medical Centre", position: [6.86980, 81.04780], category: "Medical Clinic (Ella)", type: "medical", phone: "+94 76 390 2100" },

  // ==========================================
  // POLICE STATIONS (Bandarawela, Haputale, Diyatalawa, Welimada, Ella)
  // ==========================================
  { name: "Bandarawela Division Police Station", position: [6.83100, 80.98550], category: "Police Station (Bandarawela)", type: "police", phone: "+94 57 222 2222" },
  { name: "Haputale Police Station", position: [6.76850, 80.95750], category: "Police Station (Haputale)", type: "police", phone: "+94 57 226 8222" },
  { name: "Diyatalawa Police Station", position: [6.81800, 80.96300], category: "Police Station (Diyatalawa)", type: "police", phone: "+94 57 222 9222" },
  { name: "Welimada Police Station", position: [6.90389, 80.95250], category: "Police Station (Welimada)", type: "police", phone: "+94 57 224 5222" },
  { name: "Ella Police Station", position: [6.87350, 81.04720], category: "Police Station (Ella)", type: "police", phone: "+94 57 222 8522" },

  // ==========================================
  // TRANSPORT HUBS (Bandarawela, Haputale, Diyatalawa, Demodara, Ella)
  // ==========================================
  { name: "Bandarawela Bus Stop", position: [6.82977, 80.98457], category: "Central Bus Stand (Origin)", type: "transport", phone: "N/A" },
  { name: "Bandarawela Railway Station", position: [6.83194, 80.98667], category: "Railway Station (Bandarawela)", type: "transport", phone: "+94 57 222 2271" },
  { name: "Haputale Railway Station", position: [6.76750, 80.96028], category: "Railway Station (Haputale)", type: "transport", phone: "+94 57 226 8271" },
  { name: "Diyatalawa Railway Station", position: [6.82111, 80.96306], category: "Railway Station (Diyatalawa)", type: "transport", phone: "+94 57 222 9271" },
  { name: "Demodara Railway Station & Loop", position: [6.90306, 81.06417], category: "Railway Station (Demodara)", type: "transport", phone: "N/A" },
  { name: "Ella Railway Station", position: [6.86889, 81.04750], category: "Railway Station (Ella)", type: "transport", phone: "+94 57 222 8271" },
];

// User GPS Location Pin (Pulsing Cyan Circle)
const userGpsIcon = L.divIcon({
  className: "custom-user-gps",
  html: `
    <div style="background-color: #0284c7; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 0 0 8px rgba(2, 132, 199, 0.35); transform: translate(-50%, -50%);">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19],
});

function Map() {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("all");
  const [userGpsCoords, setUserGpsCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("idle"); // 'idle', 'detecting', 'success', 'denied'
  const [flyTarget, setFlyTarget] = useState(null);
  const [dbFacilities, setDbFacilities] = useState([]);

  // Distance & Directions Panel State
  const [originMode, setOriginMode] = useState("gps"); // 'gps', 'bandarawela', 'haputale', 'ella', 'badulla', 'diyatalawa', 'custom'
  const [originCoords, setOriginCoords] = useState(BANDARAWELA_CENTER);
  const [originName, setOriginName] = useState("Bandarawela Central Bus Stop");

  const [selectedDestName, setSelectedDestName] = useState("Nine Arches Bridge");
  const [destCoords, setDestCoords] = useState([6.87676, 81.06076]);

  const [travelMode, setTravelMode] = useState("car"); // 'car', 'bus', 'walk'
  const [pickingMode, setPickingMode] = useState(null); // null, 'origin', 'destination'
  const [panelOpen, setPanelOpen] = useState(true);

  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const nameParam = searchParams.get("name");

  // Fetch admin custom facilities from database
  useEffect(() => {
    fetch("http://localhost:5000/api/facilities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map((f) => ({
            name: f.name,
            position: [f.lat, f.lng],
            category: f.type,
            type: f.type.toLowerCase().includes("hotel") ? "hotel" :
                  f.type.toLowerCase().includes("restaurant") ? "restaurant" :
                  f.type.toLowerCase().includes("fuel") ? "fuel" :
                  f.type.toLowerCase().includes("medical") || f.type.toLowerCase().includes("hospital") ? "medical" :
                  f.type.toLowerCase().includes("police") ? "police" : "facility",
            phone: f.phone || "N/A",
          }));
          setDbFacilities(mapped);
        }
      })
      .catch((err) => console.error("Error fetching custom db facilities:", err));
  }, []);

  const combinedMapData = useMemo(() => {
    return [...allMapData, ...dbFacilities];
  }, [dbFacilities]);

  // Handle URL query parameters for destination (if navigated with ?lat=..&lng=..&name=..)
  useEffect(() => {
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      setDestCoords([lat, lng]);
      if (nameParam) setSelectedDestName(nameParam);
      setFlyTarget({ coords: [lat, lng], zoom: 13.5 });
    }
  }, [latParam, lngParam, nameParam]);

  // Auto-detect GPS on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserGpsCoords(coords);
          setGpsStatus("success");
          if (originMode === "gps") {
            setOriginCoords(coords);
            setOriginName("📱 My Current Live GPS Location");
          }
        },
        (err) => {
          console.warn("GPS detection warning:", err);
          setGpsStatus("denied");
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }
  }, []);

  // Update Origin when selector changes
  const handleOriginChange = (val) => {
    setOriginMode(val);
    setPickingMode(null);

    if (val === "gps") {
      if (userGpsCoords) {
        setOriginCoords(userGpsCoords);
        setOriginName("📱 My Current Live GPS Location");
      } else {
        handleZoomToUserGps();
      }
    } else if (val === "bandarawela") {
      setOriginCoords([6.82977, 80.98457]);
      setOriginName("🚌 Bandarawela Central Bus Stop");
    } else if (val === "haputale") {
      setOriginCoords([6.7722, 80.9309]);
      setOriginName("🚂 Haputale Railway Station");
    } else if (val === "ella") {
      setOriginCoords([6.8667, 81.0466]);
      setOriginName("⛰️ Ella Town Center");
    } else if (val === "badulla") {
      setOriginCoords([6.9934, 81.0550]);
      setOriginName("🏛️ Badulla Town / Bus Stand");
    } else if (val === "diyatalawa") {
      setOriginCoords([6.8120, 80.9580]);
      setOriginName("🎖️ Diyatalawa Garrison Town");
    } else if (val === "map_click") {
      setPickingMode("origin");
    }
  };

  // Handle Destination Select
  const handleDestSelect = (name) => {
    setSelectedDestName(name);
    const found = combinedMapData.find((d) => d.name === name);
    if (found) {
      setDestCoords(found.position);
    }
  };

  // Swap Origin and Destination
  const handleSwapPoints = () => {
    const tempCoords = originCoords;
    const tempName = originName;
    setOriginCoords(destCoords);
    setOriginName(selectedDestName);
    setDestCoords(tempCoords);
    setSelectedDestName(tempName);
  };

  function handleZoomToUserGps() {
    setGpsStatus("detecting");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserGpsCoords(coords);
          setGpsStatus("success");
          if (originMode === "gps") {
            setOriginCoords(coords);
            setOriginName("📱 My Current Live GPS Location");
          }
          setFlyTarget({ coords, zoom: 14.5 });
        },
        (err) => {
          console.warn("GPS failed:", err);
          setGpsStatus("denied");
          alert("Could not detect your exact GPS location. Please check browser location permissions.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsStatus("denied");
    }
  }

  // Selected Active Route State ('best', 'scenic', 'express')
  const [selectedRouteId, setSelectedRouteId] = useState("best");
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  const routeCoordsKey = useMemo(() => {
    if (!originCoords || !destCoords) return "";
    return `${originCoords[0].toFixed(4)},${originCoords[1].toFixed(4)};${destCoords[0].toFixed(4)},${destCoords[1].toFixed(4)};${travelMode}`;
  }, [originCoords, destCoords, travelMode]);

  // Fetch real road polylines from OSRM OpenStreetMap network
  useEffect(() => {
    let isMounted = true;
    if (originCoords && destCoords) {
      setIsRoutingLoading(true);
      fetchRoadRoutes([originCoords, destCoords], travelMode).then((routes) => {
        if (isMounted) {
          setAlternativeRoutes(routes);
          setIsRoutingLoading(false);
        }
      });
    } else {
      setAlternativeRoutes([]);
    }
    return () => {
      isMounted = false;
    };
  }, [routeCoordsKey]);

  // Calculate distance metrics
  const straightKm = useMemo(() => {
    if (!originCoords || !destCoords) return 0;
    return calculateHaversineKm(originCoords, destCoords);
  }, [originCoords, destCoords]);

  const activeRoute = useMemo(() => {
    return alternativeRoutes.find((r) => r.id === selectedRouteId) || alternativeRoutes[0] || null;
  }, [alternativeRoutes, selectedRouteId]);

  const travelMetrics = useMemo(() => {
    if (activeRoute) {
      return {
        roadKm: activeRoute.distanceKm,
        straightKm: straightKm.toFixed(1),
        durationText: activeRoute.durationText,
      };
    }
    return getTravelEstimate(straightKm, travelMode);
  }, [activeRoute, straightKm, travelMode]);

  // Route bounds for Leaflet fitBounds
  const routeBounds = useMemo(() => {
    if (originCoords && destCoords) {
      return [originCoords, destCoords];
    }
    return null;
  }, [originCoords, destCoords]);

  const targetLocation = flyTarget?.coords 
    ? flyTarget.coords 
    : (latParam && lngParam) 
      ? [parseFloat(latParam), parseFloat(lngParam)] 
      : BANDARAWELA_CENTER;

  const targetZoom = flyTarget?.zoom 
    ? flyTarget.zoom 
    : (latParam && lngParam) 
      ? 14 
      : 10.2;

  const filteredLocations = combinedMapData.filter((loc) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "attraction") return loc.type === "attraction";
    if (activeFilter === "hotel") return loc.type === "hotel";
    if (activeFilter === "restaurant") return loc.type === "restaurant";
    if (activeFilter === "fuel") return loc.type === "fuel";
    if (activeFilter === "medical") return loc.type === "medical";
    if (activeFilter === "police") return loc.type === "police";
    return true;
  });

  const gmapsDirectionsUrl = useMemo(() => {
    return getGoogleMapsDirectionsUrl(originCoords, originName, destCoords, selectedDestName, travelMode);
  }, [originCoords, originName, destCoords, selectedDestName, travelMode]);

  return (
    <div className="w-full">
      {/* HEADER TITLE SECTION */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
              Interactive Map Explorer
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Uva Province Interactive Map
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            Live Regional Map
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Explore tourist attractions, hotels, fuel stations, hospitals, and transport facilities across Bandarawela, Ella, Haputale, Welimada & Badulla!
        </p>
      </div>

      {/* FILTER BUTTONS */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeFilter === "all"
              ? "bg-teal-700 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          All ({allMapData.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("attraction")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeFilter === "attraction"
              ? "bg-teal-700 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          📍 Attractions (Location Pins)
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("hotel")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeFilter === "hotel"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          🏨 Hotels Logo
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("restaurant")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeFilter === "restaurant"
              ? "bg-orange-600 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          🍽️ Restaurants Logo
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("fuel")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeFilter === "fuel"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          ⛽ Fuel Logo
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("medical")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeFilter === "medical"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          🏥 Hospitals Logo
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("police")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeFilter === "police"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          🛡️ Police Logo
        </button>
      </div>

      {/* MAP LEGEND CARD */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            🗺️ Map Legend & Icon Guide
          </h3>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
            Central Hub: Bandarawela Bus Stop (6.82977, 80.98457)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 border border-emerald-200/80 shrink-0 whitespace-nowrap shadow-2xs dark:bg-emerald-950/40 dark:border-emerald-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">A</span>
            <span className="font-extrabold text-emerald-900 dark:text-emerald-300">Origin (Start A)</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-1.5 border border-rose-200/80 shrink-0 whitespace-nowrap shadow-2xs dark:bg-rose-950/40 dark:border-rose-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white font-bold text-[10px]">B</span>
            <span className="font-extrabold text-rose-900 dark:text-rose-300">Destination (End B)</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-1.5 border border-teal-200/80 shrink-0 whitespace-nowrap shadow-2xs dark:bg-teal-950/40 dark:border-teal-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-white font-bold text-[10px]">📍</span>
            <span className="font-extrabold text-teal-900 dark:text-teal-300">Attraction</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 border border-blue-200/80 shrink-0 whitespace-nowrap shadow-2xs dark:bg-blue-950/40 dark:border-blue-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[11px]">🏨</span>
            <span className="font-extrabold text-blue-900 dark:text-blue-300">Hotel</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-1.5 border border-orange-200/80 shrink-0 whitespace-nowrap shadow-2xs dark:bg-orange-950/40 dark:border-orange-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white text-[11px]">🍽️</span>
            <span className="font-extrabold text-orange-900 dark:text-orange-300">Restaurant</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 border border-red-200/80 shrink-0 whitespace-nowrap shadow-2xs dark:bg-red-950/40 dark:border-red-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px]">⛽</span>
            <span className="font-extrabold text-red-900 dark:text-red-300">Fuel</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-100 px-3 py-1.5 border border-emerald-300/80 shrink-0 whitespace-nowrap shadow-2xs dark:bg-emerald-950/60 dark:border-emerald-700">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-dashed border-emerald-600 bg-emerald-200 dark:border-emerald-400 dark:bg-emerald-800"></span>
            <span className="font-extrabold text-emerald-900 dark:text-emerald-300">25km Circle</span>
          </div>
        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        
        {/* FLOATING GPS ZOOM BUTTON OVERLAY */}
        <div className="absolute right-4 top-4 z-[1000]">
          <button
            type="button"
            onClick={handleZoomToUserGps}
            className="flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:bg-sky-700 active:scale-95 border-2 border-white"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sky-700 font-bold">🎯</span>
            {gpsStatus === "detecting" ? "Detecting GPS..." : "Zoom to My GPS Location"}
          </button>
        </div>

        <MapContainer
          center={BANDARAWELA_CENTER}
          zoom={10.2}
          style={{ height: "620px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={targetLocation} zoom={targetZoom} bounds={routeBounds} />

          <MapClickDetector
            pickingMode={pickingMode}
            onMapClick={(coords) => {
              if (pickingMode === "origin") {
                setOriginCoords(coords);
                setOriginName(`Custom Point (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
              } else if (pickingMode === "destination") {
                setDestCoords(coords);
                setSelectedDestName(`Custom Point (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
              }
              setPickingMode(null);
            }}
          />

          {/* RENDER ALL CALCULATED ALTERNATIVE ROUTES WITH SUITABLE DISTINCT COLORS */}
          {originCoords && destCoords && alternativeRoutes.map((route) => {
            const isSelected = route.id === (activeRoute?.id || "best");
            return (
              <Polyline
                key={`route-polyline-${route.id}`}
                positions={route.waypoints}
                pathOptions={{
                  color: route.color,
                  weight: isSelected ? 7 : 4.5,
                  opacity: isSelected ? 0.95 : 0.55,
                  dashArray: isSelected ? null : route.dashArray,
                }}
                eventHandlers={{
                  click: () => setSelectedRouteId(route.id),
                }}
              />
            );
          })}

          {/* ROUTE ORIGIN MARKER (POINT A) */}
          {originCoords && (
            <Marker position={originCoords} icon={routeStartIcon}>
              <Popup>
                <div className="p-1 text-center min-w-[150px]">
                  <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Origin (Start A)
                  </span>
                  <h3 className="mt-1 font-bold text-slate-900 text-sm">{originName}</h3>
                </div>
              </Popup>
            </Marker>
          )}

          {/* ROUTE DESTINATION MARKER (POINT B) */}
          {destCoords && (
            <Marker position={destCoords} icon={routeEndIcon}>
              <Popup>
                <div className="p-1 text-center min-w-[150px]">
                  <span className="inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                    Destination (End B)
                  </span>
                  <h3 className="mt-1 font-bold text-slate-900 text-sm">{selectedDestName}</h3>
                  <p className="mt-1 text-xs font-bold text-emerald-700">
                    Road Dist: {travelMetrics.roadKm} km | ETA: {travelMetrics.durationText}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* USER GPS MARKER & 5KM RADIUS CIRCLE (IF DETECTED) */}
          {userGpsCoords && (
            <Circle
              center={userGpsCoords}
              radius={5000}
              pathOptions={{
                color: "#0284c7",
                fillColor: "#0284c7",
                fillOpacity: 0.08,
                weight: 2,
                dashArray: "4, 4",
              }}
            />
          )}

          {/* GREEN 25KM RADIUS CIRCLE AROUND BANDARAWELA BUS STOP */}
          <Circle
            center={BANDARAWELA_CENTER}
            radius={25000}
            pathOptions={{
              color: "#10b981",
              fillColor: "#10b981",
              fillOpacity: 0.06,
              weight: 2.5,
              dashArray: "6, 6",
            }}
          />

          {filteredLocations.map((loc, idx) => (
            <Marker
              key={`${loc.name}-${idx}`}
              position={loc.position}
              icon={getIconForLocation(loc)}
              eventHandlers={{
                click: () => {
                  setDestCoords(loc.position);
                  setSelectedDestName(loc.name);
                },
              }}
            >
              <Popup>
                <div className="p-1 text-center min-w-[170px] max-w-[220px]">
                  {getMapLocationImage(loc) && (
                    <div className="mb-2 h-24 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-2xs">
                      <img
                        src={getMapLocationImage(loc)}
                        alt={loc.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          if (e.target && e.target.parentElement) {
                            e.target.parentElement.style.display = "none";
                          }
                        }}
                      />
                    </div>
                  )}
                  <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{loc.name}</h3>
                  <span className="mt-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-100">
                    {loc.category}
                  </span>

                  {loc.address && (
                    <div className="mt-2 text-xs text-slate-700 leading-tight">
                      <span className="font-bold text-slate-900">📍 Address:</span> {loc.address}
                    </div>
                  )}

                  {loc.locationCode && (
                    <div className="mt-1 text-[11px] text-slate-600 font-mono leading-tight">
                      <span className="font-bold font-sans text-slate-800">🧭 Location Code:</span> {loc.locationCode}
                    </div>
                  )}

                  {loc.openingHours && (
                    <div className="mt-1 text-xs font-semibold text-amber-800">
                      ⏰ <span className="font-bold">Openings:</span> {loc.openingHours}
                    </div>
                  )}

                  {loc.phone && (
                    <div className="mt-1 text-xs font-semibold text-slate-700">
                      📞 <span className="font-bold">Contact:</span> {loc.phone}
                    </div>
                  )}

                  {loc.dist && (
                    <div className="mt-1 text-xs font-bold text-emerald-700">
                      🚗 {loc.dist} from Bandarawela Bus Stop
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDestCoords(loc.position);
                      setSelectedDestName(loc.name);
                    }}
                    className="mt-2.5 w-full rounded-lg bg-teal-700 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-teal-800 transition"
                  >
                    🎯 Calculate Distance to Here
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Map;