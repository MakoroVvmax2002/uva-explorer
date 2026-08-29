import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchRoadRoutes, getDistanceInMeters, calculateMinDistanceToRoute } from "../utils/osrmRoutingUtil";
import { API_URL } from "../services/api";
import {
  MapPin,
  Phone,
  Info,
  Navigation,
  ArrowRight,
  Flag,
  Compass,
  ExternalLink,
  X,
  CheckCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  Car,
  Bus,
  Bike,
  Footprints,
  Zap,
  Fuel,
  Clock,
  Loader2,
  Volume2,
  VolumeX,
  AlertTriangle,
  Play,
  Square,
  Locate,
  Crosshair,
} from "lucide-react";

// DEFAULT MAP CENTER: Bandarawela Central Hub, Uva Province
const DEFAULT_CENTER = [6.82977, 80.98457];

// High-Definition Professional Map Tile Layer Configurations (100% Free & No API Key Required)
const MAP_TILE_CONFIGS = {
  voyager: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    subdomains: [],
    maxZoom: 19,
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: [],
    maxZoom: 19,
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  vibrant: {
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    subdomains: "abc",
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles by <a href="https://www.hotosm.org/">HOT</a>',
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};

// Comprehensive Catalog of Places, Nearby Facilities, and Transport Stands
const ALL_MAP_ASSETS = [
  // --- 1. PLACES & ATTRACTIONS ---
  {
    id: "1",
    name: "Nine Arches Bridge",
    category: "place",
    subCategory: "Attraction / Viaduct",
    location: "Demodara, Ella, Sri Lanka",
    lat: 6.87676,
    lng: 81.06076,
    image: "/images/places/nine-arches-bridge.jpg",
    description: "Iconic colonial-era stone train viaduct located directly on the railway line between Ella and Demodara stations, accessible via main road pathway.",
    iconType: "place",
  },
  {
    id: "2",
    name: "Ella Rock",
    category: "place",
    subCategory: "Hiking / Peak",
    location: "Ella Rock Hiking Resort, Kithalella, Ella, 90090, Sri Lanka",
    lat: 6.8538,
    lng: 81.0464,
    image: "/images/places/ella-rock.jpg",
    description: "Challenging cliffside trail offering dramatic panoramic views across Ella Gap.",
    iconType: "place",
  },
  {
    id: "3",
    name: "Little Adam's Peak",
    category: "place",
    subCategory: "Hiking / Viewpoint",
    location: "Little Adam's Peak, Ella-Passara Road, Ella, Uva, Sri Lanka",
    lat: 6.8625,
    lng: 81.0638,
    image: "/images/places/little-adams-peak.jpg",
    description: "Easy scenic hike with sweeping views of tea gardens and mountain crests.",
    iconType: "place",
  },
  {
    id: "4",
    name: "Ravana Fall",
    category: "place",
    subCategory: "Waterfall / Nature",
    location: "Ravana Ella, Ella Wellawaya Road, Ella, 90090, Sri Lanka",
    lat: 6.84074,
    lng: 81.05492,
    image: "/images/places/ravana-fall.jpg",
    description: "Famous 25-meter cascading roadside waterfall situated directly along the main Ella Wellawaya Road (A23).",
    iconType: "place",
  },
  {
    id: "5",
    name: "Dowa Rock Temple",
    category: "place",
    subCategory: "Historical / Heritage",
    location: "Dowa Rock Temple, Badulla Bandarawela Road, Bandarawela, Sri Lanka",
    lat: 6.857426,
    lng: 81.022059,
    image: "/images/places/dowa-rock-temple.jpg",
    description: "Ancient heritage rock temple featuring a 38-foot carved standing Buddha statue.",
    iconType: "place",
  },
  {
    id: "6",
    name: "Lipton's Seat",
    category: "place",
    subCategory: "Viewpoint / Tea Estate",
    location: "Lipton Seat Road, Dambethenna Estate, Haputale 90160, Sri Lanka",
    lat: 6.789521,
    lng: 81.017612,
    image: "/images/places/liptons-seat.jpg",
    description: "Famous mountain lookout where Sir Thomas Lipton surveyed his historic tea empire.",
    iconType: "place",
  },
  {
    id: "7",
    name: "Adisham Bungalow",
    category: "place",
    subCategory: "Monuments / Architecture",
    location: "Adisham Bungalow, Adisham Rd, Haputale 90160, Sri Lanka",
    lat: 6.773087,
    lng: 80.930990,
    image: "/images/places/adisham-bungalow.jpg",
    description: "Tudor-style stone mansion nestled inside thick pine forest sanctuary in Haputale.",
    iconType: "place",
  },
  {
    id: "8",
    name: "Porowagala Viewpoint",
    category: "place",
    subCategory: "Scenic Lookout",
    location: "Mahaulpatha, Galkanda, Bandarawela, Sri Lanka",
    lat: 6.830560,
    lng: 81.012682,
    image: "/images/places/porowagala-viewpoint.jpg",
    description: "Scenic cliffside viewpoint in Galkanda, Bandarawela offering panoramic views of surrounding tea hills and valleys.",
    iconType: "place",
  },
  {
    id: "9",
    name: "Rawana Ella Cave",
    category: "place",
    subCategory: "Prehistoric Cave Site",
    location: "Ravana Ella Cave, Ella Wellawaya Road, Ella",
    lat: 6.864793,
    lng: 81.048639,
    image: "/images/places/rawana-ella-cave.jpg",
    description: "Prehistoric archaeological cave site located up the cliff trail off the main Ella Wellawaya Road near Ravana Ella.",
    iconType: "place",
  },
  {
    id: "10",
    name: "Halpewatte Tea Factory",
    category: "place",
    subCategory: "Cultural / Tea Tour",
    location: "Uva Halpewatte Tea Factory, Badulla Road, Hela Halpe, Ella, Sri Lanka 90090, Sri Lanka",
    lat: 6.890353,
    lng: 81.034249,
    image: "/images/places/halpewatte-tea-factory.jpg",
    description: "Largest tea processing factory in Uva offering guided tea manufacturing and tasting tours.",
    iconType: "place",
  },

  // --- 2. NEARBY FACILITIES (Spread 360° across 25km Radius from Bandarawela Hub) ---
  // A. CENTRAL SECTOR (0-5 km: Bandarawela & Diyatalawa)
  {
    id: "f1",
    name: "Bandarawela Heritage Hotel",
    category: "facility",
    subCategory: "Hotel & Resort",
    location: "Main Street, Bandarawela (Center)",
    lat: 6.83150,
    lng: 80.98800,
    image: "/images/Nearby facilities/Bandarawela Heritage Hotel.jpg",
    phone: "+94 57 222 2501",
    description: "Colonial-style heritage hotel in central Bandarawela town.",
    iconType: "hotel",
  },
  {
    id: "f3",
    name: "Bandarawela District Base Hospital",
    category: "facility",
    subCategory: "Hospital / Emergency",
    location: "Hospital Road, Bandarawela (Center)",
    lat: 6.83361,
    lng: 80.98556,
    image: "/images/Nearby facilities/Bandarawela District Base Hospital.jpg",
    phone: "+94 57 222 2261",
    description: "Primary government general hospital with 24/7 emergency care.",
    iconType: "hospital",
  },
  {
    id: "f5",
    name: "Ceypetco Central Station Bandarawela",
    category: "facility",
    subCategory: "Fuel & Service",
    location: "Badulla Road, Bandarawela (Center)",
    lat: 6.83200,
    lng: 80.98600,
    image: "/images/Nearby facilities/Ceypetco Central Station Bandarawela.jpg",
    phone: "+94 57 222 2300",
    description: "24/7 petrol & diesel filling station in central town.",
    iconType: "fuel",
  },
  {
    id: "f6",
    name: "Bandarawela Division Police Station",
    category: "facility",
    subCategory: "Police / Emergency Safety",
    location: "Police Station Road, Bandarawela (Center)",
    lat: 6.83100,
    lng: 80.98550,
    image: "/images/Nearby facilities/Bandarawela Division Police Station.jpg",
    phone: "+94 57 222 2222",
    description: "Central divisional police headquarters for tourist security.",
    iconType: "police",
  },
  {
    id: "f-diya-1",
    name: "Diyatalawa Base & Military Hospital",
    category: "facility",
    subCategory: "Hospital / Medical Center",
    location: "Garrison Road, Diyatalawa (4 km SW)",
    lat: 6.81889,
    lng: 80.96444,
    image: "/images/Nearby facilities/Diyatalawa Base & Military Hospital.jpg",
    phone: "+94 57 222 9226",
    description: "Full service regional hospital equipped with trauma unit.",
    iconType: "hospital",
  },
  {
    id: "f-diya-2",
    name: "Diyatalawa Garrison Ceypetco Station",
    category: "facility",
    subCategory: "Fuel & Auto Service",
    location: "Garrison Road, Diyatalawa (4 km SW)",
    lat: 6.81900,
    lng: 80.96200,
    image: "/images/Nearby facilities/Diyatalawa Fuel Station.jpg",
    phone: "+94 57 222 9050",
    description: "Fuel station in Diyatalawa military town providing 24/7 service.",
    iconType: "fuel",
  },
  {
    id: "f-diya-3",
    name: "Diyatalawa Police Station",
    category: "facility",
    subCategory: "Police / Safety",
    location: "Station Road, Diyatalawa (4 km SW)",
    lat: 6.81800,
    lng: 80.96300,
    image: "/images/Nearby facilities/Diyatalawa Police Station.jpg",
    phone: "+94 57 222 9222",
    description: "Police station ensuring visitor safety around Fox Hill and Diyatalawa.",
    iconType: "police",
  },
  {
    id: "f-diya-4",
    name: "Diyatalawa Heritage Hill Resort",
    category: "facility",
    subCategory: "Hotel & Resort",
    location: "Fox Hill Road, Diyatalawa (4 km SW)",
    lat: 6.81200,
    lng: 80.95800,
    image: "/images/Nearby facilities/Diyatalawa Heritage Bungalow.jpg",
    phone: "+94 57 222 9100",
    description: "Hillside holiday resort surrounded by pine forests.",
    iconType: "hotel",
  },

  // B. SOUTH & SOUTH-WEST SECTOR (6-15 km: Haputale, Beragala, Poonagala)
  {
    id: "f-hapu-1",
    name: "Melheim Resort & Spa",
    category: "facility",
    subCategory: "Resort & Spa",
    location: "Beragala Road, Haputale (8 km S)",
    lat: 6.77100,
    lng: 80.94500,
    image: "/images/Nearby facilities/Melheim Resort & Spa.jpg",
    phone: "+94 57 226 8000",
    description: "Luxury mountain resort with panoramic southern valley views.",
    iconType: "hotel",
  },
  {
    id: "f-hapu-2",
    name: "Haputale Divisional Base Hospital",
    category: "facility",
    subCategory: "Hospital / Emergency",
    location: "Hospital Road, Haputale (8 km S)",
    lat: 6.76861,
    lng: 80.95833,
    image: "/images/Nearby facilities/Haputale Base Hospital.jpg",
    phone: "+94 57 226 8061",
    description: "Government base hospital offering round-the-clock medical care.",
    iconType: "hospital",
  },
  {
    id: "f-hapu-3",
    name: "Haputale Police Station",
    category: "facility",
    subCategory: "Police Station",
    location: "Main Street, Haputale (8 km S)",
    lat: 6.76850,
    lng: 80.95750,
    image: "/images/Nearby facilities/Haputale Police Station.jpg",
    phone: "+94 57 226 8222",
    description: "Central police station in Haputale near train station.",
    iconType: "police",
  },
  {
    id: "f-hapu-4",
    name: "Ceypetco Filling Station Haputale",
    category: "facility",
    subCategory: "Fuel Station",
    location: "Station Road, Haputale (8 km S)",
    lat: 6.76700,
    lng: 80.95600,
    image: "/images/Nearby facilities/Ceypetco Filling Station Haputale.jpg",
    phone: "+94 57 226 8020",
    description: "Main fuel station serving travellers in Haputale pass.",
    iconType: "fuel",
  },
  {
    id: "f-poona-1",
    name: "Poonagala Estate Hospital",
    category: "facility",
    subCategory: "Medical Center",
    location: "Lipton's Seat Road, Poonagala (9 km SE)",
    lat: 6.77700,
    lng: 81.00500,
    image: "/images/Nearby facilities/Misty Mountain Cafe Haputale.jpg",
    phone: "+94 57 226 8300",
    description: "Estate clinic serving visitors traveling to Lipton's Seat viewpoint.",
    iconType: "hospital",
  },

  // C. EAST SECTOR (6-12 km: Ella & Demodara)
  {
    id: "f-ella-1",
    name: "EKHO Ella Resort",
    category: "facility",
    subCategory: "Resort Hotel",
    location: "Ella Town Center (8 km E)",
    lat: 6.87100,
    lng: 81.04900,
    image: "/images/Nearby facilities/EKHO Ella.jpg",
    phone: "+94 57 222 8655",
    description: "Hotel accommodation in central Ella town.",
    iconType: "hotel",
  },
  {
    id: "f-ella-2",
    name: "Ella Police Station",
    category: "facility",
    subCategory: "Police Station",
    location: "Main Street, Ella (8 km E)",
    lat: 6.87350,
    lng: 81.04720,
    image: "/images/Nearby facilities/Ella Police Station.jpg",
    phone: "+94 57 222 8522",
    description: "Local police station serving Ella tourist area.",
    iconType: "police",
  },
  {
    id: "f-demo-1",
    name: "Demodara Peripheral Unit & Hospital",
    category: "facility",
    subCategory: "Medical / Hospital",
    location: "Station Road, Demodara (9 km E)",
    lat: 6.90306,
    lng: 81.06417,
    image: "/images/Nearby facilities/IMC MED Hospital Ella.jpg",
    phone: "+94 57 222 8410",
    description: "Regional government hospital near Demodara loop.",
    iconType: "hospital",
  },
  {
    id: "f-demo-2",
    name: "Demodara Ceypetco Fuel Station",
    category: "facility",
    subCategory: "Fuel & Service",
    location: "Badulla Highway, Demodara (9 km E)",
    lat: 6.90450,
    lng: 81.06550,
    image: "/images/Nearby facilities/Hela Halpe Filling Station.jpg",
    phone: "+94 57 222 8422",
    description: "Petrol & diesel filling station servicing Demodara.",
    iconType: "fuel",
  },

  // D. NORTH & NORTH-WEST SECTOR (10-18 km: Welimada, Keppetipola, Ettampitiya)
  {
    id: "f-weli-1",
    name: "Welimada Base Hospital",
    category: "facility",
    subCategory: "Hospital / Emergency",
    location: "Main Street, Welimada (11 km N)",
    lat: 6.90528,
    lng: 80.95111,
    image: "/images/Nearby facilities/Welimada Divisional Hospital.jpg",
    phone: "+94 57 224 5261",
    description: "Primary general base hospital serving Welimada region.",
    iconType: "hospital",
  },
  {
    id: "f-weli-2",
    name: "Welimada Division Police Station",
    category: "facility",
    subCategory: "Police Station",
    location: "Police Station Road, Welimada (11 km N)",
    lat: 6.90389,
    lng: 80.95250,
    image: "/images/Nearby facilities/Welimada Police Station.jpg",
    phone: "+94 57 224 5222",
    description: "Divisional police station in Welimada.",
    iconType: "police",
  },
  {
    id: "f-weli-3",
    name: "Keppetipola LIOC Fuel Station",
    category: "facility",
    subCategory: "Fuel Station",
    location: "Nuwara Eliya Road, Keppetipola (16 km NW)",
    lat: 6.93800,
    lng: 80.88700,
    image: "/images/Nearby facilities/Welimada Ceypetco Filling Station.jpg",
    phone: "+94 57 224 5800",
    description: "Lanka IOC fuel station on Keppetipola highway.",
    iconType: "fuel",
  },
  {
    id: "f-ettam-1",
    name: "Ettampitiya Rural Hospital & Clinic",
    category: "facility",
    subCategory: "Hospital",
    location: "Main Road, Ettampitiya (10 km NE)",
    lat: 6.92000,
    lng: 80.98000,
    image: "/images/Nearby facilities/Welimada Divisional Hospital.jpg",
    phone: "+94 57 224 8100",
    description: "Rural hospital serving Ettampitiya valley.",
    iconType: "hospital",
  },

  // E. NORTH-EAST SECTOR (14-22 km: Hali-Ela & Badulla Corridor)
  {
    id: "f-hali-1",
    name: "Hali-Ela Divisional Hospital",
    category: "facility",
    subCategory: "Government Hospital & ER",
    location: "Main Street, Hali-Ela (14 km NE)",
    lat: 6.95389,
    lng: 81.03194,
    image: "/images/Nearby facilities/Bandarawela District Base Hospital.jpg",
    phone: "+94 55 229 4261",
    description: "Divisional hospital providing emergency medical services in Hali-Ela.",
    iconType: "hospital",
  },
  {
    id: "f-hali-2",
    name: "Hali-Ela Police Station",
    category: "facility",
    subCategory: "Police Station",
    location: "Badulla Road, Hali-Ela (14 km NE)",
    lat: 6.95300,
    lng: 81.03100,
    image: "/images/Nearby facilities/Bandarawela Division Police Station.jpg",
    phone: "+94 55 229 4222",
    description: "Local police station providing 24/7 safety in Hali-Ela township.",
    iconType: "police",
  },
  {
    id: "f-hali-3",
    name: "Hali-Ela Ceypetco Filling Station",
    category: "facility",
    subCategory: "Fuel & Auto Service",
    location: "Badulla Highway, Hali-Ela (14 km NE)",
    lat: 6.95400,
    lng: 81.03250,
    image: "/images/Nearby facilities/Ceypetco Central Station Bandarawela.jpg",
    phone: "+94 55 229 4300",
    description: "24/7 petrol and diesel filling station in Hali-Ela town.",
    iconType: "fuel",
  },
  {
    id: "f-hali-4",
    name: "Hali-Ela Hillside Guest House & Dining",
    category: "facility",
    subCategory: "Hotel & Guest House",
    location: "Kandy Road, Hali-Ela (14 km NE)",
    lat: 6.95200,
    lng: 81.03000,
    image: "/images/Nearby facilities/Orient Hotel Bandarawela.jpg",
    phone: "+94 55 229 4500",
    description: "Comfortable guest house accommodation with local dining.",
    iconType: "hotel",
  },
  {
    id: "f-bad-1",
    name: "Badulla Provincial General Hospital",
    category: "facility",
    subCategory: "Teaching Hospital",
    location: "Hospital Road, Badulla (20 km NE)",
    lat: 6.98583,
    lng: 81.05778,
    image: "/images/Nearby facilities/Bandarawela District Base Hospital.jpg",
    phone: "+94 55 222 2261",
    description: "Largest tertiary referral hospital in Uva Province.",
    iconType: "hospital",
  },
  {
    id: "f-bad-2",
    name: "Badulla Senior Police Division HQ",
    category: "facility",
    subCategory: "Police HQ",
    location: "Lower Street, Badulla (20 km NE)",
    lat: 6.98806,
    lng: 81.05400,
    image: "/images/Nearby facilities/Bandarawela Division Police Station.jpg",
    phone: "+94 55 222 2222",
    description: "Provincial police headquarters for Uva Province.",
    iconType: "police",
  },

  // F. SOUTH-EAST & WEST SECTORS (13-22 km: Koslanda & Ohiya)
  {
    id: "f-kos-1",
    name: "Koslanda Ceypetco Station",
    category: "facility",
    subCategory: "Fuel Station",
    location: "Wellawaya Road, Koslanda (14 km SE)",
    lat: 6.74200,
    lng: 81.01800,
    image: "/images/Nearby facilities/Ceypetco Central Station Bandarawela.jpg",
    phone: "+94 57 226 7100",
    description: "Filling station serving travelers near Diyaluma Falls.",
    iconType: "fuel",
  },
  {
    id: "f-ohiya-1",
    name: "Ohiya Eco Mountain Lodge",
    category: "facility",
    subCategory: "Hotel & Lodge",
    location: "Horton Plains Road, Ohiya (17 km W)",
    lat: 6.81500,
    lng: 80.84000,
    image: "/images/Nearby facilities/Diyatalawa Heritage Bungalow.jpg",
    phone: "+94 57 228 9010",
    description: "High altitude mountain lodge near Horton Plains sanctuary.",
    iconType: "hotel",
  },

  // --- 3. TRANSPORT STANDS & HUBS ---
  {
    id: "t1",
    name: "Bandarawela Central Bus Stand",
    category: "transport",
    subCategory: "Central Bus Terminal",
    location: "Bus Stand Road, Bandarawela Town",
    lat: 6.82977,
    lng: 80.98457,
    image: "/images/Nearby facilities/Colombo Bandarawela Bus.jpg",
    phone: "+94 57 222 2281",
    description: "Major central bus terminal connecting Colombo, Kandy, Badulla, Ella & Haputale.",
    iconType: "bus",
  },
  {
    id: "t2",
    name: "Ella Railway Station",
    category: "transport",
    subCategory: "Train Station / Main Line",
    location: "Station Road, Ella",
    lat: 6.86889,
    lng: 81.04750,
    image: "/images/places/nine-arches-bridge.jpg",
    phone: "+94 57 222 8571",
    description: "Iconic mountain railway station on the Main Line famous for scenic train journeys.",
    iconType: "train",
  },
  {
    id: "t3",
    name: "Badulla Bus Terminal",
    category: "transport",
    subCategory: "Intercity Bus Depot",
    location: "Main Bus Terminal, Badulla",
    lat: 6.98306,
    lng: 81.05389,
    image: "/images/Nearby facilities/Colombo Badulla Intercity Bus.jpg",
    phone: "+94 55 222 2281",
    description: "Capital bus hub for Uva Province servicing long-distance highway coaches.",
    iconType: "bus",
  },
  {
    id: "t4",
    name: "Haputale Railway Station",
    category: "transport",
    subCategory: "Mountain Railway Station",
    location: "Station Road, Haputale",
    lat: 6.76750,
    lng: 80.96028,
    image: "/images/Nearby facilities/Olympus Plaza Hotel.jpg",
    phone: "+94 57 226 8020",
    description: "High altitude train station providing direct access to Lipton's Seat & Adisham.",
    iconType: "train",
  },
  {
    id: "t5",
    name: "Demodara Loop Railway Station",
    category: "transport",
    subCategory: "Railway Station",
    location: "Demodara",
    lat: 6.90306,
    lng: 81.06417,
    image: "/images/places/nine-arches-bridge.jpg",
    description: "World-famous spiral railway loop station.",
    iconType: "train",
  },
  {
    id: "t6",
    name: "Diyatalawa Railway Station",
    category: "transport",
    subCategory: "Railway Station",
    location: "Diyatalawa",
    lat: 6.82111,
    lng: 80.96306,
    image: "/images/Nearby facilities/Diyatalawa Heritage Bungalow.jpg",
    phone: "+94 57 222 9200",
    description: "Historic hill station railway stop serving Diyatalawa military resort area.",
    iconType: "train",
  },
];

// Photo Avatar Circle Pin Drop Badge Generator
function getAssetMarkerIcon(asset, isSelected = false, waypointBadge = null, isStart = false, isEnd = false) {
  // 1. BLUE TEARDROP PIN FOR DESTINATION (Point B / End Point)
  if (isEnd) {
    const scale = isSelected ? "scale(1.2)" : "scale(1.0)";
    const badgeHtml = waypointBadge
      ? `<div style="position: absolute; top: -5px; right: -5px; background: #2563eb; color: #ffffff; font-size: 9px; font-weight: 900; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); z-index: 10;">${waypointBadge}</div>`
      : "";

    return L.divIcon({
      className: "custom-blue-teardrop-pin",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: ${scale}; transition: transform 0.2s ease;">
          ${badgeHtml}
          <svg width="26" height="34" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(37,99,235,0.45));">
            <path d="M19 0C8.50659 0 0 8.50659 0 19C0 31.8 19 48 19 48C19 48 38 31.8 38 19C38 8.50659 29.4934 0 19 0Z" fill="#1d4ed8"/>
            <path d="M19 2.5C9.8873 2.5 2.5 9.8873 2.5 19C2.5 30.2 19 45 19 45C19 45 35.5 30.2 35.5 19C35.5 9.8873 28.1127 2.5 19 2.5Z" fill="#2563eb"/>
            <circle cx="19" cy="18" r="7.5" fill="#ffffff"/>
          </svg>
        </div>
      `,
      iconSize: [26, 34],
      iconAnchor: [13, 34],
      popupAnchor: [0, -34],
    });
  }

  // 2. RED TEARDROP PIN FOR MAP CLICKED RANDOM LOCATIONS & START POINT (Point A)
  if (asset.isCustom || isStart) {
    const scale = isSelected ? "scale(1.2)" : "scale(1.0)";
    const badgeHtml = waypointBadge
      ? `<div style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: #ffffff; font-size: 9px; font-weight: 900; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); z-index: 10;">${waypointBadge}</div>`
      : "";

    return L.divIcon({
      className: "custom-red-teardrop-pin",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: ${scale}; transition: transform 0.2s ease;">
          ${badgeHtml}
          <svg width="26" height="34" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(225,29,72,0.45));">
            <path d="M19 0C8.50659 0 0 8.50659 0 19C0 31.8 19 48 19 48C19 48 38 31.8 38 19C38 8.50659 29.4934 0 19 0Z" fill="#be123c"/>
            <path d="M19 2.5C9.8873 2.5 2.5 9.8873 2.5 19C2.5 30.2 19 45 19 45C19 45 35.5 30.2 35.5 19C35.5 9.8873 28.1127 2.5 19 2.5Z" fill="#ef4444"/>
            <circle cx="19" cy="18" r="7.5" fill="#ffffff"/>
          </svg>
        </div>
      `,
      iconSize: [26, 34],
      iconAnchor: [13, 34],
      popupAnchor: [0, -34],
    });
  }

  let bg = "#0f766e";
  let symbol = "📍";

  if (isEnd) {
    bg = "#2563eb"; // Blue Pin for End Point / Destination
    symbol = "🏁";
  } else if (isStart || (isSelected && !isEnd)) {
    bg = "#ef4444"; // Red Pin for Selected Location / Start Point
    symbol = "🎯";
  } else if (asset.category === "place") {
    bg = "#10b981"; // Emerald Green
    symbol = "🌿";
  } else if (asset.category === "facility") {
    if (asset.iconType === "hotel") { bg = "#6366f1"; symbol = "🏨"; }
    else if (asset.iconType === "hospital") { bg = "#ef4444"; symbol = "🏥"; }
    else if (asset.iconType === "fuel") { bg = "#f59e0b"; symbol = "⛽"; }
    else if (asset.iconType === "police") { bg = "#64748b"; symbol = "👮"; }
    else { bg = "#3b82f6"; symbol = "🏢"; }
  } else if (asset.category === "transport") {
    if (asset.iconType === "bus") { bg = "#06b6d4"; symbol = "🚌"; }
    else if (asset.iconType === "train") { bg = "#8b5cf6"; symbol = "🚂"; }
    else { bg = "#0284c7"; symbol = "🚏"; }
  }

  let border = "3px solid white";
  if (isEnd) {
    border = "4px solid #2563eb"; // Bold Blue Border for End Point
  } else if (isSelected || isStart) {
    border = "4px solid #ef4444"; // Bold Red Border for Selected Location / Start Point
  }

  const scale = (isSelected || isStart || isEnd) ? "scale(1.28)" : "scale(1.0)";
  const size = (isSelected || isStart || isEnd) ? 48 : 42;

  const imgSrc = asset.image || "/images/places/porowagala-viewpoint.jpg";
  const innerContent = `<img src="${imgSrc}" alt="${asset.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" onError="this.onerror=null; this.src='/images/places/porowagala-viewpoint.jpg';" />`;

  const badgeHtml = waypointBadge
    ? `<div style="position: absolute; top: -4px; right: -4px; background: ${isEnd ? "#2563eb" : "#ef4444"}; color: #ffffff; font-size: 10px; font-weight: 900; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); z-index: 10;">${waypointBadge}</div>`
    : "";

  return L.divIcon({
    className: "custom-map-pin-drop",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: ${scale}; transition: transform 0.2s ease;">
        ${badgeHtml}
        <div style="background-color: ${bg}; color: white; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; border: ${border}; box-shadow: 0 4px 14px rgba(0,0,0,0.4); padding: 1px;">
          ${innerContent}
        </div>
        <div style="width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 8px solid ${bg}; margin-top: -1px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));"></div>
      </div>
    `,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

// 3D Perspective Navigation Arrow Avatar Icon
function getNavigationUserIcon(heading = 0) {
  return L.divIcon({
    className: "live-3d-navigation-arrow-marker",
    html: `
      <div style="position: relative; width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; transform: perspective(300px) rotateX(15deg); filter: drop-shadow(0 10px 18px rgba(0,0,0,0.45));">
        <div style="position: absolute; width: 54px; height: 54px; border-radius: 50%; background: rgba(37, 99, 235, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${heading}deg); transition: transform 0.3s ease;">
          <defs>
            <linearGradient id="arrow3dRightGrad" x1="24" y1="4" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#3b82f6"/>
              <stop offset="60%" stop-color="#2563eb"/>
              <stop offset="100%" stop-color="#1d4ed8"/>
            </linearGradient>
            <linearGradient id="arrow3dLeftGrad" x1="24" y1="4" x2="10" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#93c5fd"/>
              <stop offset="60%" stop-color="#60a5fa"/>
              <stop offset="100%" stop-color="#3b82f6"/>
            </linearGradient>
          </defs>

          <!-- Outer 3D Halo Ring -->
          <circle cx="24" cy="24" r="22" fill="#0f172a" opacity="0.25"/>
          <circle cx="24" cy="24" r="20" fill="url(#arrow3dRightGrad)" opacity="0.3" stroke="#ffffff" stroke-width="2"/>

          <!-- 3D Arrow Left Facet -->
          <path d="M24 6L10 38L24 30V6Z" fill="url(#arrow3dLeftGrad)"/>

          <!-- 3D Arrow Right Facet -->
          <path d="M24 6L38 38L24 30V6Z" fill="url(#arrow3dRightGrad)"/>

          <!-- 3D Center Spine Highlight Line -->
          <line x1="24" y1="6" x2="24" y2="30" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>

          <!-- Center Metallic Pin Core -->
          <circle cx="24" cy="24" r="3.5" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  });
}

function NavigationCenterController({ isNavigating, userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (isNavigating && userLocation && userLocation[0] && userLocation[1]) {
      map.flyTo(userLocation, 17.5, { animate: true, duration: 1.2 });
    }
  }, [isNavigating, userLocation, map]);
  return null;
}

// Distinct "My Current Location" Vibrant Green Pulsing GPS Marker Icon
function getMyLocationMarkerIcon() {
  return L.divIcon({
    className: "my-current-location-green-gps-marker",
    html: `
      <div style="position: relative; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 46px; height: 46px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #34d399, #059669); border: 3px solid white; box-shadow: 0 4px 14px rgba(16,185,129,0.75); display: flex; align-items: center; justify-content: center;">
          <div style="width: 11px; height: 11px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}

function MapBoundsController({ selectedAsset, routePoints, isNavigating }) {
  const map = useMap();

  useEffect(() => {
    if (isNavigating) return; // Do not overwrite camera during active navigation
    if (routePoints && routePoints.length >= 2) {
      const validPoints = routePoints.filter(
        (p) => Array.isArray(p) && p.length === 2 && !isNaN(Number(p[0])) && !isNaN(Number(p[1]))
      );
      if (validPoints.length >= 2) {
        try {
          const bounds = L.latLngBounds(validPoints);
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, animate: true });
          }
        } catch (e) {
          console.warn("fitBounds warning:", e);
        }
      }
    } else if (selectedAsset && selectedAsset.lat && selectedAsset.lng) {
      map.flyTo([selectedAsset.lat, selectedAsset.lng], 13, { duration: 1.2 });
    }
  }, [selectedAsset, routePoints, isNavigating, map]);

  return null;
}

function MapFlyToController({ flyTargetCoords }) {
  const map = useMap();
  useEffect(() => {
    if (flyTargetCoords && flyTargetCoords[0] && flyTargetCoords[1]) {
      map.flyTo(flyTargetCoords, 15.5, { duration: 1.2 });
    }
  }, [flyTargetCoords, map]);
  return null;
}

// Leaflet Event Listener to capture ANY click on the raw map surface
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function Planner() {
  const navigate = useNavigate();
  const [mapAssets, setMapAssets] = useState(ALL_MAP_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [customPoint, setCustomPoint] = useState(null);

  // MAP ENGINE STYLE & CATEGORY FILTER STATE
  const [mapStyle, setMapStyle] = useState("voyager"); // "voyager", "satellite", "dark", "osm"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [maxDistance, setMaxDistance] = useState(50); // 5km to 50km (50 = Any)
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  // TRAVEL MODE & MULTI-STOP ROUTING STATE
  const [travelMode, setTravelMode] = useState("driving"); // "driving", "motorbike", "biking", "walking"
  const [startAsset, setStartAsset] = useState(null);
  const [waypointStops, setWaypointStops] = useState([]);
  const [endAsset, setEndAsset] = useState(null);
  const [roadRoutes, setRoadRoutes] = useState([]);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // LIVE GPS TURN-BY-TURN NAVIGATION & VOICE SYSTEM STATE
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState(null); // [lat, lng]
  const [userHeading, setUserHeading] = useState(0); // degrees
  const [userSpeed, setUserSpeed] = useState(0); // km/h
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [offRouteDistance, setOffRouteDistance] = useState(0);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [navInstruction, setNavInstruction] = useState("");
  const [lastSpokenTime, setLastSpokenTime] = useState(0);

  // TOP FLOATING TOAST FEEDBACK FOR AUTOMATIC MAP CLICKS
  const [planToast, setPlanToast] = useState("");

  const showPlanToast = (msg) => {
    setPlanToast(msg);
    setTimeout(() => {
      setPlanToast((curr) => (curr === msg ? "" : curr));
    }, 3200);
  };

  // MOBILE BOTTOM SHEET DRAGGABLE HEIGHT & PERCENTAGE SYSTEM
  const [sheetPercent, setSheetPercent] = useState(48); // default 48% height
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const touchStartY = React.useRef(0);
  const touchStartPercent = React.useRef(48);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartPercent.current = sheetPercent;
    setIsDraggingSheet(true);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingSheet) return;
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY.current - currentY; // dragging UP increases height
    const screenHeight = window.innerHeight;
    const deltaPercent = (deltaY / screenHeight) * 100;

    // Clamp strictly between 15% (mini bottom bar) and 82% (NEVER 100% FULLSCREEN!)
    let newPercent = touchStartPercent.current + deltaPercent;
    if (newPercent < 15) newPercent = 15;
    if (newPercent > 82) newPercent = 82; // Never allow 100% fullscreen!
    setSheetPercent(Math.round(newPercent));
  };

  const handleTouchEnd = () => {
    setIsDraggingSheet(false);
    // Snap to nearest clean percentage preset: 15%, 45%, 65%, 82%
    setSheetPercent((current) => {
      if (current < 25) return 15; // Mini bottom bar
      if (current < 55) return 45; // Medium (45%)
      if (current < 75) return 65; // High (65%)
      return 82; // Max 82% (NEVER 100% FULLSCREEN!)
    });
  };

  // Pre-load Web Speech Synthesis female voices on mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  // CURRENT LOCATION GPS POINT STATE
  const [myLocationPoint, setMyLocationPoint] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [flyTargetCoords, setFlyTargetCoords] = useState(null);

  // Locate User's Live Current GPS Position on the Map & Fly to Location
  const handleLocateMe = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const gpsPoint = {
          id: "my_current_gps_location",
          name: "📍 My Current Location",
          category: "GPS Location",
          subCategory: "Device Live GPS",
          location: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
          lat: lat,
          lng: lng,
          isCustom: true,
          isCurrentGPS: true,
          image: "/images/places/porowagala-viewpoint.jpg",
          description: "Your live device GPS location detected in Uva Province.",
        };

        setMyLocationPoint(gpsPoint);
        setSelectedAsset(gpsPoint);
        setFlyTargetCoords([lat, lng]);
        setIsLocating(false);
      },
      (err) => {
        console.warn("Locate Me Geolocation error:", err);
        setIsLocating(false);
        alert("Unable to fetch your GPS position. Please ensure location permissions are enabled.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Web Speech Synthesis Voice Notice Helper (Female Girl Voice Enforced)
  const getFemaleVoice = () => {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const femaleKeywords = [
      "samantha",
      "zira",
      "victoria",
      "karen",
      "fiona",
      "moira",
      "veena",
      "jenny",
      "aria",
      "ava",
      "emily",
      "joanna",
      "siri",
      "google us english",
      "google uk english female",
      "female",
      "woman",
      "girl",
    ];

    const maleKeywords = ["david", "mark", "george", "richard", "james", "male", "guy"];

    // 1. Look for English female voice
    const foundFemale = voices.find((v) => {
      const name = v.name.toLowerCase();
      const isEn = v.lang.toLowerCase().startsWith("en");
      const hasFemaleName = femaleKeywords.some((k) => name.includes(k));
      const hasMaleName = maleKeywords.some((k) => name.includes(k));
      return isEn && hasFemaleName && !hasMaleName;
    });

    if (foundFemale) return foundFemale;

    // 2. Fallback to any non-male English voice
    const nonMaleEn = voices.find((v) => {
      const name = v.name.toLowerCase();
      const isEn = v.lang.toLowerCase().startsWith("en");
      const hasMaleName = maleKeywords.some((k) => name.includes(k));
      return isEn && !hasMaleName;
    });

    if (nonMaleEn) return nonMaleEn;

    return voices[0] || null;
  };

  const speakVoiceNotice = (text) => {
    if (voiceMuted || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const femaleVoice = getFemaleVoice();
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        utterance.lang = femaleVoice.lang;
      } else {
        utterance.lang = "en-US";
      }

      utterance.rate = 0.98;
      utterance.pitch = 1.25; // Pitch tuned for female voice tone
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis warning:", e);
    }
  };

  // Start Live Journey Action
  const handleStartJourney = () => {
    if (!startAsset || !endAsset) return;
    setIsNavigating(true);
    setSelectedAsset(null); // Close side panel for full navigation view

    const destName = endAsset.name || "your destination";
    const msg = `Starting journey to ${destName}. Follow the highlighted blue route.`;
    setNavInstruction(msg);
    speakVoiceNotice(msg);

    if (!userLocation && startAsset) {
      setUserLocation([startAsset.lat, startAsset.lng]);
    }
  };

  // Stop / Exit Journey Action
  const handleStopJourney = () => {
    setIsNavigating(false);
    setIsOffRoute(false);
    setNavInstruction("");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Watch Live GPS Location & Track Pathway for Off-Route Detection & Voice Prompts
  useEffect(() => {
    let watchId = null;

    if (isNavigating) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const heading = pos.coords.heading || 0;
            const speed = pos.coords.speed ? (pos.coords.speed * 3.6).toFixed(0) : 0;

            setUserLocation([lat, lng]);
            setUserHeading(heading);
            setUserSpeed(speed);

            const activePolylinePoints = roadRoutes[0]?.points || [];

            if (activePolylinePoints.length >= 2) {
              const distToRoute = calculateMinDistanceToRoute([lat, lng], activePolylinePoints);
              setOffRouteDistance(Math.round(distToRoute));

              // If user strays away > 65 meters from the blue highlighted route
              if (distToRoute > 65) {
                setIsOffRoute(true);
                const warnNotice = "Wrong path! Please turn around!";
                setNavInstruction("⚠️ WRONG PATH! Please turn around and rejoin the blue route.");

                const now = Date.now();
                if (now - lastSpokenTime > 12000) { // Throttled every 12s
                  speakVoiceNotice(warnNotice);
                  setLastSpokenTime(now);
                }
              } else {
                setIsOffRoute(false);

                if (endAsset) {
                  const distToDest = getDistanceInMeters(lat, lng, endAsset.lat, endAsset.lng);
                  if (distToDest < 35) {
                    const arriveMsg = `You have arrived at ${endAsset.name}! Journey completed.`;
                    setNavInstruction(`🎉 ${arriveMsg}`);
                    speakVoiceNotice(arriveMsg);
                    setIsNavigating(false);
                  } else {
                    setNavInstruction(`Follow highlighted blue route to ${endAsset.name}`);
                  }
                }
              }
            }
          },
          (err) => console.warn("Live GPS Navigation Watch Error:", err),
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );
      }
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, roadRoutes, endAsset, voiceMuted, lastSpokenTime]);

  const handleViewDetails = (asset) => {
    if (!asset) return;

    if (asset.category === "place" && !asset.isCustom) {
      const cleanId = String(asset.id || "").replace(/^api_p_/, "").replace(/^p_?/, "");
      if (cleanId && cleanId.length > 0) {
        navigate(`/place/${cleanId}`);
      } else {
        navigate(`/explore?q=${encodeURIComponent(asset.name)}`);
      }
    } else if (asset.category === "facility") {
      navigate(`/facilities?search=${encodeURIComponent(asset.name)}`);
    } else if (asset.category === "transport") {
      navigate(`/transport?search=${encodeURIComponent(asset.name)}`);
    } else {
      navigate(`/explore?q=${encodeURIComponent(asset.name || "")}`);
    }
  };

  // Add intermediate stop to multi-stop itinerary
  const handleAddWaypoint = (asset) => {
    if (!asset) return;
    const isAlreadyWaypoint = waypointStops.some((s) => s.id === asset.id);
    if (isAlreadyWaypoint) return;

    setWaypointStops((prev) => [...prev, asset]);
  };

  // Remove waypoint stop
  const handleRemoveWaypoint = (id) => {
    setWaypointStops((prev) => prev.filter((s) => s.id !== id));
  };

  // Move waypoint Up
  const handleMoveWaypointUp = (index) => {
    if (index <= 0) return;
    setWaypointStops((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  // Move waypoint Down
  const handleMoveWaypointDown = (index) => {
    if (index >= waypointStops.length - 1) return;
    setWaypointStops((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  // Fetch API Places & Facilities if backend is running
  useEffect(() => {
    fetch(`${API_URL}/api/places`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formattedApiPlaces = data.map((p, idx) => ({
            id: `api_p_${p._id || idx}`,
            name: p.name,
            category: "place",
            subCategory: p.category || "Attraction",
            location: p.location || "Uva Region",
            lat: p.lat || 6.82977,
            lng: p.lng || 80.98457,
            image: p.image || "/images/places/nine-arches.jpg",
            description: p.description || "Popular destination in Uva Province.",
            iconType: "place",
          }));
          setMapAssets((prev) => {
            const existingNames = new Set(prev.map((a) => a.name));
            const newPlaces = formattedApiPlaces.filter((p) => !existingNames.has(p.name));
            return [...prev, ...newPlaces];
          });
        }
      })
      .catch((e) => console.warn("API Places warning:", e));
  }, []);

  // Handle clicking ANYWHERE on the map to add stops sequentially & collapse panel for full map view
  const handleMapClick = (latlng) => {
    // Touching map closes side drawer for 100% full map view
    setSelectedAsset(null);

    const newPoint = {
      id: `custom_${Date.now()}`,
      name: `Custom Location (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
      category: "Map Location",
      subCategory: "Custom GPS Coordinates",
      location: `Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}`,
      lat: latlng.lat,
      lng: latlng.lng,
      isCustom: true,
      image: "/images/places/porowagala-viewpoint.jpg",
      description: "Custom point selected directly on OpenStreetMap in Uva Province.",
    };

    setCustomPoint(newPoint);

    if (!startAsset) {
      // 1st Click -> Set as RED Start Point
      setStartAsset(newPoint);
      showPlanToast("🚩 Start Point Set! Tap next spot for Destination.");
    } else if (!endAsset && startAsset.id !== newPoint.id) {
      // 2nd Click -> Set as BLUE Destination Point
      setEndAsset(newPoint);
      showPlanToast("🏁 Destination Set! Road route calculated.");
    } else if (startAsset && endAsset) {
      // 3rd+ Clicks -> Automatically push previous endAsset to stops list, set new click as Destination
      const prevEnd = endAsset;
      setWaypointStops((prevStops) => [...prevStops, prevEnd]);
      setEndAsset(newPoint);
      showPlanToast(`🚏 Stop #${waypointStops.length + 1} Added! 🏁 New Destination Set.`);
    }
  };

  // Handle clicking on specific asset markers (places/facilities/stands)
  const handleSelectAssetAuto = (asset) => {
    if (!asset) return;

    if (!startAsset) {
      setStartAsset(asset);
      showPlanToast(`🚩 Start Point Set: ${asset.name}`);
    } else if (!endAsset && startAsset.id !== asset.id) {
      setEndAsset(asset);
      showPlanToast(`🏁 Destination Set: ${asset.name}`);
    } else if (startAsset && endAsset && endAsset.id !== asset.id) {
      const prevEnd = endAsset;
      setWaypointStops((prevStops) => [...prevStops, prevEnd]);
      setEndAsset(asset);
      showPlanToast(`🚏 Stop #${waypointStops.length + 1} Added: ${prevEnd.name} | 🏁 Destination: ${asset.name}`);
    }

    if (window.innerWidth < 768) {
      setSelectedAsset(null);
    } else {
      setSelectedAsset(asset);
    }
  };

  // All ordered waypoints for multi-stop road calculation
  const allOrderedWaypoints = useMemo(() => {
    const list = [];
    if (startAsset) list.push(startAsset);
    waypointStops.forEach((stop) => list.push(stop));
    if (endAsset) list.push(endAsset);
    return list;
  }, [startAsset, waypointStops, endAsset]);

  const routePoints = useMemo(() => {
    if (allOrderedWaypoints.length >= 2) {
      return allOrderedWaypoints.map((pt) => [pt.lat, pt.lng]);
    }
    return [];
  }, [allOrderedWaypoints]);

  const routeKey = useMemo(() => {
    if (routePoints.length < 2) return "";
    return `${travelMode}:${routePoints.map((pt) => `${pt[0].toFixed(4)},${pt[1].toFixed(4)}`).join(";")}`;
  }, [routePoints, travelMode]);

  useEffect(() => {
    let isMounted = true;
    if (routePoints.length >= 2) {
      setIsRoutingLoading(true);
      fetchRoadRoutes(routePoints, travelMode).then((routes) => {
        if (isMounted) {
          setRoadRoutes(routes);
          setIsRoutingLoading(false);
        }
      });
    } else {
      setRoadRoutes([]);
      setIsRoutingLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [routeKey]);

  // Filtered map assets based on category filter and Strava route length distance slider
  const filteredMapAssets = useMemo(() => {
    const centerLat = startAsset?.lat || DEFAULT_CENTER[0];
    const centerLng = startAsset?.lng || DEFAULT_CENTER[1];

    return mapAssets.filter((asset) => {
      // 1. Category Filter
      let matchesCat = true;
      if (categoryFilter === "place") matchesCat = asset.category === "place";
      else if (categoryFilter === "transport") matchesCat = asset.category === "transport";
      else if (categoryFilter === "hotel") matchesCat = asset.category === "facility" && asset.iconType === "hotel";
      else if (categoryFilter === "hospital") matchesCat = asset.category === "facility" && asset.iconType === "hospital";
      else if (categoryFilter === "fuel") matchesCat = asset.category === "facility" && asset.iconType === "fuel";
      else if (categoryFilter === "police") matchesCat = asset.category === "facility" && asset.iconType === "police";

      if (!matchesCat) return false;

      // 2. Strava Distance Filter (Radius from Start / Central Hub)
      if (maxDistance < 50) {
        const distKm = getDistanceInMeters(centerLat, centerLng, asset.lat, asset.lng) / 1000;
        if (distKm > maxDistance) return false;
      }

      return true;
    });
  }, [mapAssets, categoryFilter, maxDistance, startAsset]);

  return (
    <div className="relative h-[calc(100vh-64px)] w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* FLOATING TOAST NOTIFICATION BANNER FOR AUTOMATIC MAP CLICKS */}
      {planToast && !isNavigating && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[2000] animate-bounce pointer-events-none w-11/12 max-w-md text-center">
          <div className="rounded-full bg-slate-900/95 text-white px-5 py-2.5 shadow-2xl backdrop-blur-md border border-emerald-400/50 flex items-center justify-center gap-2 text-xs sm:text-sm font-black">
            <span>{planToast}</span>
          </div>
        </div>
      )}

      {/* TOP-LEFT FLOATING ITINERARY QUICK CONTROL BAR */}
      {allOrderedWaypoints.length > 0 && !isNavigating && (
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedAsset(selectedAsset ? null : (startAsset || endAsset || allOrderedWaypoints[0]))}
            className="flex items-center gap-2 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 px-4 py-2.5 shadow-2xl backdrop-blur-md border border-slate-700 text-xs font-extrabold transition active:scale-95 cursor-pointer"
          >
            <ListOrdered size={15} className="text-emerald-400" />
            <span>Itinerary ({allOrderedWaypoints.length} Points)</span>
            {roadRoutes.length > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-black border border-emerald-500/30">
                ~{roadRoutes[0].distanceKm} km
              </span>
            )}
          </button>
        </div>
      )}

      {/* TOP-RIGHT FLOATING MAP CONTROLS & STYLE SWITCHER */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        {/* MAP STYLE PICKER BUTTON */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-2 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 px-3.5 py-2 shadow-2xl backdrop-blur-md border border-slate-700 text-xs font-extrabold transition active:scale-95 cursor-pointer"
          >
            <Compass size={15} className="text-teal-400" />
            <span className="capitalize">{mapStyle}</span>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
              {mapStyle === "voyager" ? "🗺️ ESRI Topo" : mapStyle === "satellite" ? "🛰️ 3D Sat" : mapStyle === "vibrant" ? "🎨 HOT Vibrant" : "🌍 Standard"}
            </span>
          </button>

          {showStyleMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl border border-slate-700 z-[2000] space-y-1">
              <button
                type="button"
                onClick={() => { setMapStyle("voyager"); setShowStyleMenu(false); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${mapStyle === "voyager" ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
              >
                <span>🗺️ ESRI Topo HD</span>
                {mapStyle === "voyager" && <span>✓</span>}
              </button>
              <button
                type="button"
                onClick={() => { setMapStyle("satellite"); setShowStyleMenu(false); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${mapStyle === "satellite" ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
              >
                <span>🛰️ ESRI 3D Satellite</span>
                {mapStyle === "satellite" && <span>✓</span>}
              </button>
              <button
                type="button"
                onClick={() => { setMapStyle("vibrant"); setShowStyleMenu(false); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${mapStyle === "vibrant" ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
              >
                <span>🎨 HOT Vibrant Map</span>
                {mapStyle === "vibrant" && <span>✓</span>}
              </button>
              <button
                type="button"
                onClick={() => { setMapStyle("osm"); setShowStyleMenu(false); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${mapStyle === "osm" ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
              >
                <span>🌍 Standard OSM</span>
                {mapStyle === "osm" && <span>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* CATEGORY FILTER CHIPS BAR */}
        <div className="hidden sm:flex items-center gap-1 rounded-full bg-slate-900/90 p-1.5 shadow-2xl backdrop-blur-md border border-slate-700 text-xs font-bold">
          {[
            { id: "all", label: "All", icon: "📍" },
            { id: "place", label: "Places", icon: "🌿" },
            { id: "hotel", label: "Hotels", icon: "🏨" },
            { id: "hospital", label: "Medical", icon: "🏥" },
            { id: "fuel", label: "Fuel", icon: "⛽" },
            { id: "transport", label: "Stands", icon: "🚌" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition ${categoryFilter === cat.id ? "bg-teal-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-800"}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* LIVE NAVIGATION TOP HUD BAR & WARNING BANNER */}
      {isNavigating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] w-11/12 max-w-xl">
          <div
            className={`rounded-3xl p-4 shadow-2xl backdrop-blur-md border transition-all duration-300 ${
              isOffRoute
                ? "bg-rose-600/95 text-white border-rose-400 animate-bounce ring-4 ring-rose-500/50"
                : "bg-slate-900/95 text-white border-slate-700 ring-2 ring-blue-500/40"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    isOffRoute ? "bg-white text-rose-600" : "bg-blue-600 text-white"
                  }`}
                >
                  {isOffRoute ? <AlertTriangle size={24} className="animate-spin" /> : <Navigation size={22} />}
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                    {isOffRoute ? "⚠️ Wrong Path, Turn Around!" : "Navigation Active"}
                  </h3>
                  <p className="text-xs text-slate-200 font-semibold mt-0.5">
                    {isOffRoute
                      ? `You are ${offRouteDistance}m away from the blue pathway.`
                      : navInstruction || `Heading towards ${endAsset?.name || "destination"}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* VOICE MUTE TOGGLE */}
                <button
                  type="button"
                  onClick={() => setVoiceMuted(!voiceMuted)}
                  className={`p-2 rounded-xl border transition ${
                    voiceMuted
                      ? "bg-rose-500/20 text-rose-200 border-rose-400"
                      : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                  }`}
                  title={voiceMuted ? "Unmute Voice Commands" : "Mute Voice Commands"}
                >
                  {voiceMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* STOP JOURNEY BUTTON */}
                <button
                  type="button"
                  onClick={handleStopJourney}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black transition shadow-sm"
                >
                  <Square size={14} fill="currentColor" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIGH-VISIBILITY FLOATING LIVE LOCATION GPS BUTTON */}
      <div className="absolute bottom-7 right-7 z-[1000]">
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-[0_8px_30px_rgba(0,0,0,0.3)] border-2 border-emerald-500 transition-all duration-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:scale-110 active:scale-95 cursor-pointer dark:bg-slate-900 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
          title="Track Live My Location (Zoom & Show Green Icon)"
        >
          {/* Outer gentle pulsing ring highlight */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500/25 animate-ping pointer-events-none" />

          {isLocating ? (
            <Loader2 size={26} className="animate-spin text-emerald-600 group-hover:text-white" />
          ) : (
            <Crosshair size={26} className="stroke-[2.5] text-emerald-600 transition-colors group-hover:text-white" />
          )}
        </button>
      </div>

      {/* 100% FULL-SCREEN LEAFLET MAP */}
      <MapContainer center={DEFAULT_CENTER} zoom={11} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          key={`tile-${mapStyle}`}
          url={MAP_TILE_CONFIGS[mapStyle].url}
          subdomains={MAP_TILE_CONFIGS[mapStyle].subdomains}
          maxZoom={MAP_TILE_CONFIGS[mapStyle].maxZoom}
          attribution={MAP_TILE_CONFIGS[mapStyle].attribution}
        />

        <MapFlyToController flyTargetCoords={flyTargetCoords} />
        <NavigationCenterController isNavigating={isNavigating} userLocation={userLocation} />
        <MapBoundsController selectedAsset={selectedAsset} routePoints={routePoints} isNavigating={isNavigating} />
        <MapClickHandler onMapClick={handleMapClick} />

        {/* RENDER MY CURRENT LOCATION GPS MARKER IF LOCATED */}
        {myLocationPoint && (
          <Marker
            position={[myLocationPoint.lat, myLocationPoint.lng]}
            icon={getMyLocationMarkerIcon()}
            eventHandlers={{
              click: () => setSelectedAsset(myLocationPoint),
            }}
            zIndexOffset={900}
          >
            <Tooltip direction="top" offset={[0, -22]}>
              <span className="font-extrabold text-teal-900 text-xs px-1 py-0.5">📍 My Current Location</span>
            </Tooltip>
          </Marker>
        )}

        {/* LIVE NAVIGATION ROTATING ARROW MARKER */}
        {isNavigating && userLocation && (
          <Marker position={userLocation} icon={getNavigationUserIcon(userHeading)} zIndexOffset={1000}>
            <Tooltip direction="top" offset={[0, -20]} permanent={false}>
              <span className="font-black text-slate-900 text-xs px-1 py-0.5">📱 Live GPS Location</span>
            </Tooltip>
          </Marker>
        )}

        {/* RENDER REAL ROAD POLYLINES (HIGHLIGHTED BLUE DURING NAVIGATION) */}
        {roadRoutes.map((route) => (
          <Polyline
            key={`route-${route.id}`}
            positions={route.points}
            pathOptions={{
              color: isNavigating ? "#2563eb" : (travelMode === "walking" ? "#10b981" : travelMode === "biking" ? "#f59e0b" : route.color),
              weight: isNavigating ? 8 : (route.weight || 6),
              opacity: 0.95,
              dashArray: travelMode === "walking" ? "8, 8" : route.dashArray,
            }}
          />
        ))}

        {/* RENDER CUSTOM MAP CLICKED MARKER IF ACTIVE */}
        {customPoint && (
          <Marker
            position={[customPoint.lat, customPoint.lng]}
            icon={getAssetMarkerIcon(
              customPoint,
              selectedAsset?.id === customPoint.id,
              startAsset?.id === customPoint.id ? "🚩" : endAsset?.id === customPoint.id ? "🏁" : null
            )}
            eventHandlers={{
              click: () => setSelectedAsset(customPoint),
            }}
          >
            <Tooltip direction="top" offset={[0, -32]}>
              <span className="font-extrabold text-slate-900 text-xs px-1 py-0.5">Selected Map Location</span>
            </Tooltip>
          </Marker>
        )}

        {/* RENDER ALL CATALOG ASSET MARKERS */}
        {filteredMapAssets.map((asset) => {
          const isSelected = selectedAsset?.id === asset.id;
          const isStart = startAsset?.id === asset.id;
          const isEnd = endAsset?.id === asset.id;
          const waypointIndex = waypointStops.findIndex((s) => s.id === asset.id);

          let badge = null;
          if (isStart) badge = "🚩";
          else if (isEnd) badge = "🏁";
          else if (waypointIndex !== -1) badge = `${waypointIndex + 1}`;

          return (
            <Marker
              key={`map-asset-${asset.id}`}
              position={[asset.lat, asset.lng]}
              icon={getAssetMarkerIcon(asset, isSelected, badge, isStart, isEnd)}
              eventHandlers={{
                click: () => handleSelectAssetAuto(asset),
              }}
            >
              <Tooltip direction="top" offset={[0, -32]}>
                <span className="font-extrabold text-slate-900 text-xs px-1 py-0.5">{asset.name}</span>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {/* MOBILE BACKDROP OVERLAY — Tapping backdrop closes panel so user can tap map */}
      {selectedAsset && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs md:hidden z-[999]"
          onClick={() => setSelectedAsset(null)}
        />
      )}

      {/* RESPONSIVE PANEL DRAWER (Bottom Sheet on Mobile, Right Panel on Desktop) */}
      <div
        style={{
          height:
            typeof window !== "undefined" && window.innerWidth < 768 && (selectedAsset || allOrderedWaypoints.length > 0)
              ? `${sheetPercent}vh`
              : undefined,
          maxHeight: typeof window !== "undefined" && window.innerWidth < 768 ? "82vh" : undefined,
        }}
        className={`fixed md:absolute right-0 bottom-0 left-0 md:left-auto top-auto md:top-0 z-[1000] w-full md:w-96 md:h-full bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl shadow-2xl border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 rounded-t-[32px] md:rounded-none flex flex-col justify-between overflow-hidden transform transition-all duration-150 ease-out ${
          selectedAsset || allOrderedWaypoints.length > 0
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between overflow-hidden">
          
          {/* NATIVE SLEEK DRAG HANDLE PILL FOR MOBILE (Photo 02 style) */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setSheetPercent(sheetPercent < 45 ? 65 : 25)}
            className="w-full py-2.5 flex items-center justify-center select-none shrink-0 md:hidden cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 transition" />
          </div>

          {/* FIXED PANEL HEADER */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] sm:text-[11px] font-black uppercase text-teal-800 dark:bg-teal-950 dark:text-teal-300 truncate max-w-[140px] sm:max-w-none">
              {selectedAsset ? `${selectedAsset.category || "LOCATION"}` : "MULTI-STOP PLANNER"}
            </span>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* MOBILE TAP MAP BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAsset(null);
                  setSheetPercent(15);
                }}
                className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2 py-1 text-[11px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition border border-emerald-200/60 dark:border-emerald-800/40"
              >
                <Compass size={13} className="text-emerald-600" />
                <span>Tap Map 🗺️</span>
              </button>

              {/* RED CIRCLED CLOSE X BUTTON */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSelectedAsset(null);
                  setSheetPercent(15);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200 transition shrink-0 cursor-pointer border border-rose-300 dark:border-rose-800"
                title="Close Panel"
                aria-label="Close"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE BODY CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {selectedAsset ? (
              <>
                {/* LOCATION IMAGE */}
                {selectedAsset.image && !selectedAsset.isCustom && (
                  <div className="h-32 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-xs">
                    <img
                      src={selectedAsset.image}
                      alt={selectedAsset.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        if (e.target && e.target.parentElement) {
                          e.target.parentElement.style.display = "none";
                        }
                      }}
                    />
                  </div>
                )}

                {/* LOCATION TITLE & ADDRESS */}
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {selectedAsset.name}
                  </h2>

                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <MapPin size={14} className="text-teal-700 dark:text-teal-400 shrink-0" />
                    {selectedAsset.location}
                  </p>
                </div>

                {/* LATITUDE & LONGITUDE DISPLAY BOX */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 dark:bg-slate-800/60 dark:border-slate-700">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-1">
                    GPS Coordinates
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-sans">Latitude</span>
                      <span>{selectedAsset.lat ? selectedAsset.lat.toFixed(5) : "N/A"}° N</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-sans">Longitude</span>
                      <span>{selectedAsset.lng ? selectedAsset.lng.toFixed(5) : "N/A"}° E</span>
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                {selectedAsset.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedAsset.description}
                  </p>
                )}
              </>
            ) : (
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Multi-Stop Trip Itinerary
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Click any marker or spot on the map to set Start, Add Waypoints, or Destination.
                </p>
              </div>
            )}

            {/* STRAVA: ROUTE LENGTH DISTANCE SLIDER */}
            <div className="rounded-2xl bg-slate-900 text-white p-3.5 border border-slate-800 shadow-lg space-y-2 select-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-600 font-black text-white text-[11px]">
                    🚴
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white tracking-wide uppercase">
                      Strava Route Length Filter
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {startAsset ? `Radius from ${startAsset.name}` : "Radius from Central Hub"}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 text-xs font-black">
                  {maxDistance >= 50 ? "ANY DISTANCE" : `≤ ${maxDistance} km`}
                </span>
              </div>

              {/* STRAVA MINI HISTOGRAM / ELEVATION BARS */}
              <div className="flex items-end justify-between gap-1 px-1 pt-1 h-5">
                {[12, 18, 25, 32, 28, 40, 35, 22, 45, 30, 20, 38, 50, 42, 28, 15, 30, 48, 35, 20].map((h, i) => {
                  const valAtBar = (i / 20) * 50;
                  const isActive = valAtBar <= maxDistance || maxDistance >= 50;
                  return (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-full rounded-xs transition-all duration-200 ${
                        isActive ? "bg-orange-500" : "bg-slate-700/60"
                      }`}
                    />
                  );
                })}
              </div>

              {/* STRAVA SLIDER TRACK */}
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="2.5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-orange-500 h-2 bg-slate-800 rounded-lg cursor-pointer appearance-auto border border-slate-700"
                  title="Filter Route Length Distance"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400">
                <span>5 km (Local)</span>
                <span>25 km (Regional)</span>
                <span>50+ km (All Uva)</span>
              </div>
            </div>

            {/* TRAVEL DISTANCE & MODE CALCULATOR BOX */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 dark:bg-slate-800/70 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5 tracking-wide">
                  <Compass size={15} className="text-teal-700 dark:text-teal-400" />
                  Travel Distance & Mode
                </span>

                {isRoutingLoading && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Calculating...</span>
                  </div>
                )}
              </div>

              {/* TRAVEL MODE SELECTION TABS */}
              <div className="mt-2.5 grid grid-cols-5 gap-1 bg-white p-1 rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setTravelMode("driving")}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition ${
                    travelMode === "driving"
                      ? "bg-teal-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Car size={12} />
                  <span>Car</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode("bus")}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition ${
                    travelMode === "bus"
                      ? "bg-teal-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Bus size={12} />
                  <span>Bus</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode("motorbike")}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition ${
                    travelMode === "motorbike"
                      ? "bg-teal-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Zap size={12} />
                  <span>Bike</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode("biking")}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition ${
                    travelMode === "biking"
                      ? "bg-teal-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Bike size={12} />
                  <span>Cycle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode("walking")}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition ${
                    travelMode === "walking"
                      ? "bg-teal-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Footprints size={12} />
                  <span>Walk</span>
                </button>
              </div>

              {/* DISTANCE & DURATION STATS SUMMARY */}
              {roadRoutes.length > 0 ? (
                <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-xl bg-white p-2.5 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wide">
                      Total Distance
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      ~{roadRoutes[0].distanceKm} km
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wide">
                      Est. Time
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {roadRoutes[0].durationText}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-center p-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Select 🚩 <strong>Start</strong> and 🏁 <strong>Destination</strong> to calculate road distance.
                </div>
              )}
            </div>

            {/* ACTIVE MULTI-STOP ITINERARY TIMELINE */}
            {allOrderedWaypoints.length > 0 && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 dark:bg-slate-800/80 dark:border-slate-700">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ListOrdered size={15} className="text-teal-700 dark:text-teal-400" />
                    Trip Sequence ({allOrderedWaypoints.length} Points)
                  </span>

                  {roadRoutes.length > 0 && (
                    <span className="text-[11px] font-black text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-full">
                      ~{roadRoutes[0].distanceKm} km
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {/* START ORIGIN */}
                  {startAsset && (
                    <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-1.5 text-xs font-bold text-amber-900 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200">
                      <span className="truncate pr-2">🚩 Start: {startAsset.name}</span>
                      <button
                        type="button"
                        onClick={() => setStartAsset(null)}
                        className="text-amber-700 hover:text-amber-900 dark:text-amber-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* INTERMEDIATE WAYPOINT STOPS */}
                  {waypointStops.map((stop, idx) => (
                    <div
                      key={`waypoint-${stop.id}`}
                      className="flex items-center justify-between rounded-xl bg-white border border-slate-200 p-1.5 text-xs font-semibold text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-1">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white dark:bg-teal-700">
                          {idx + 1}
                        </span>
                        <span className="truncate">{stop.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveWaypointUp(idx)}
                          disabled={idx === 0}
                          className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveWaypointDown(idx)}
                          disabled={idx === waypointStops.length - 1}
                          className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveWaypoint(stop.id)}
                          className="p-0.5 text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* DESTINATION END */}
                  {endAsset && (
                    <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-1.5 text-xs font-bold text-rose-900 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200">
                      <span className="truncate pr-2">🏁 End: {endAsset.name}</span>
                      <button
                        type="button"
                        onClick={() => setEndAsset(null)}
                        className="text-rose-700 hover:text-rose-900 dark:text-rose-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FIXED BOTTOM ACTION BUTTONS BAR */}
          <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 space-y-2">
            {selectedAsset && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* BUTTON 1: SET AS START POINT */}
                <button
                  type="button"
                  onClick={() => {
                    setStartAsset(selectedAsset);
                    if (window.innerWidth < 768) setSelectedAsset(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-extrabold text-white transition shadow-2xs ${
                    startAsset?.id === selectedAsset.id
                      ? "bg-amber-700 ring-2 ring-amber-400"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  <Flag size={14} />
                  <span>{startAsset?.id === selectedAsset.id ? "✓ Start Point" : "🚩 Set Start"}</span>
                </button>

                {/* BUTTON 2: ADD AS WAYPOINT STOP */}
                <button
                  type="button"
                  onClick={() => {
                    handleAddWaypoint(selectedAsset);
                    if (window.innerWidth < 768) setSelectedAsset(null);
                  }}
                  disabled={waypointStops.some((s) => s.id === selectedAsset.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-extrabold text-white transition shadow-2xs ${
                    waypointStops.some((s) => s.id === selectedAsset.id)
                      ? "bg-emerald-700 opacity-80"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  <Plus size={14} />
                  <span>
                    {waypointStops.some((s) => s.id === selectedAsset.id)
                      ? "✓ Added"
                      : `🚏 Add Stop`}
                  </span>
                </button>

                {/* BUTTON 3: MAKE DESTINATION */}
                <button
                  type="button"
                  onClick={() => {
                    setEndAsset(selectedAsset);
                    if (window.innerWidth < 768) setSelectedAsset(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-extrabold text-white transition shadow-2xs ${
                    endAsset?.id === selectedAsset.id
                      ? "bg-rose-700 ring-2 ring-rose-400"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  <Navigation size={14} />
                  <span>{endAsset?.id === selectedAsset.id ? "✓ Destination" : "🏁 Destination"}</span>
                </button>
              </div>
            )}

            {/* BUTTON 4: START JOURNEY (TURN-BY-TURN LIVE NAVIGATION) */}
            {startAsset && endAsset && roadRoutes.length > 0 && !isNavigating && (
              <button
                type="button"
                onClick={handleStartJourney}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs sm:text-sm font-black text-white transition hover:from-blue-700 hover:to-indigo-700 shadow-lg animate-pulse"
              >
                <Play size={16} fill="currentColor" />
                🚀 Start Journey (Live Voice Navigation)
              </button>
            )}

            {/* CLEAR ENTIRE MULTI-STOP ROUTE */}
            {allOrderedWaypoints.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStartAsset(null);
                  setWaypointStops([]);
                  setEndAsset(null);
                  setRoadRoutes([]);
                  handleStopJourney();
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                Clear Entire Trip Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Planner;