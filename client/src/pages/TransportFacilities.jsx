import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Bus,
  Search,
  MapPin,
  Phone,
  Clock,
  Navigation,
  CheckCircle2,
  Sparkles,
  Ticket,
  ArrowRight,
  ShieldCheck,
  Zap,
  Filter,
  ExternalLink,
} from "lucide-react";
import { fetchAllBuses } from "../services/busService";
import { fetchRoadRoutes } from "../utils/osrmRoutingUtil";

// Default Center: Bandarawela Central Bus Station
const DEFAULT_CENTER = [6.82977, 80.98457];

// Transport Services Data
const TRANSPORT_SERVICES = [
  {
    id: "trn-1",
    name: "Colombo ↔ Bandarawela Highway Luxury Coach",
    routeNumber: "Route 99/EX",
    origin: "Colombo Fort / Makumbura",
    destination: "Bandarawela Central",
    via: "Southern Expressway (E02) → Wellawaya → Haputale → Bandarawela",
    busTimes: [
      { time: "05:30 AM", tag: "Morning Express", icon: "🌅" },
      { time: "08:45 AM", tag: "Day Coach", icon: "☀️" },
      { time: "02:50 PM", tag: "Highway Super", icon: "⚡" },
      { time: "04:30 PM", tag: "Evening Intercity", icon: "🌇" },
      { time: "09:30 PM", tag: "Night Luxury Sleeper", icon: "🌙" },
    ],
    phone: "+94 57 222 2281",
    conductorPhone: "+94 77 105 7740",
    hotline: "1955 (NTC Hotline) / +94 11 770 6000",
    fare: "LKR 1,850",
    busType: "AC King Long Super Luxury (Air-Suspension)",
    description: "Fast direct highway coach connecting Western Capital Colombo to Uva hills via Southern Expressway & Haputale gap.",
    image: "/images/Nearby facilities/Colombo Bandarawela Bus.jpg",
    position: [6.82977, 80.98457],
    routeWaypoints: [
      [6.9271, 79.8612], // Colombo Fort
      [6.8404, 79.9961], // Makumbura
      [6.7410, 81.1010], // Wellawaya
      [6.7670, 80.9560], // Haputale
      [6.82977, 80.98457], // Bandarawela
    ],
    rating: 4.8,
    reviews: 620,
  },
  {
    id: "trn-2",
    name: "Colombo ↔ Badulla Intercity Express",
    routeNumber: "Route 99",
    origin: "Colombo Bastian Mawatha",
    destination: "Badulla Bus Stand",
    via: "Avissawella → Ratnapura → Balangoda → Beragala → Bandarawela → Badulla",
    busTimes: [
      { time: "04:15 AM", tag: "Early Express", icon: "🌅" },
      { time: "07:00 AM", tag: "Intercity Line", icon: "🚌" },
      { time: "10:30 AM", tag: "Mid-Day Direct", icon: "☀️" },
      { time: "01:15 PM", tag: "Mountain Pass", icon: "⛰️" },
      { time: "06:00 PM", tag: "Evening Express", icon: "🌆" },
      { time: "10:45 PM", tag: "Night Sleeper", icon: "🌙" },
    ],
    phone: "+94 55 222 2235",
    conductorPhone: "+94 76 590 0100",
    hotline: "1955 (NTC Hotline)",
    fare: "LKR 1,450",
    busType: "SLTB Ashok Leyland Intercity (Semi-Luxury)",
    description: "Classic high-frequency mountain express route connecting Western Province directly to Uva Province heartlands.",
    image: "/images/Nearby facilities/Colombo Badulla Intercity Bus.jpg",
    position: [6.9934, 81.0550],
    routeWaypoints: [
      [6.9271, 79.8612],
      [6.9530, 80.2070],
      [6.6828, 80.3992],
      [6.6500, 80.7000],
      [6.82977, 80.98457],
      [6.9934, 81.0550],
    ],
    rating: 4.6,
    reviews: 840,
  },
  {
    id: "trn-3",
    name: "Colombo ↔ Ella Direct Tourist Express",
    routeNumber: "Route 99/EX-Ella",
    origin: "Colombo Fort Terminal",
    destination: "Ella Main Street",
    via: "Southern Highway → Wellawaya → Ravana Falls → Ella Town",
    busTimes: [
      { time: "06:00 AM", tag: "Morning Tourist Express", icon: "🌅" },
      { time: "09:30 AM", tag: "Scenic Highway Coach", icon: "☀️" },
      { time: "01:30 PM", tag: "Afternoon Express", icon: "🚌" },
      { time: "11:15 PM", tag: "Overnight Tourist Sleeper", icon: "🌙" },
    ],
    phone: "+94 74 200 0490",
    conductorPhone: "+94 76 138 2300",
    hotline: "+94 11 258 1112 (SLTB Colombo)",
    fare: "LKR 2,100",
    busType: "AC Super Luxury Air-Suspension Coach",
    description: "Dedicated tourist luxury express connecting Colombo directly to Ella town and Ravana waterfalls.",
    image: "/images/Nearby facilities/Colombo Ella Express Bus.jpg",
    position: [6.8667, 81.0466],
    routeWaypoints: [
      [6.9271, 79.8612],
      [6.8404, 79.9961],
      [6.7410, 81.1010],
      [6.8410, 81.0540],
      [6.8667, 81.0466],
    ],
    rating: 4.9,
    reviews: 490,
  },
  {
    id: "trn-4",
    name: "Kandy ↔ Badulla / Ella Scenic Intercity",
    routeNumber: "Route 10",
    origin: "Kandy Goods Shed",
    destination: "Badulla & Ella Town",
    via: "Peradeniya → Nuwara Eliya → Welimada → Bandarawela → Ella → Badulla",
    busTimes: [
      { time: "05:00 AM", tag: "Hill Pass Dawn Express", icon: "🌅" },
      { time: "07:30 AM", tag: "Nuwara Eliya Line", icon: "☕" },
      { time: "10:15 AM", tag: "Tea Country Scenic", icon: "⛰️" },
      { time: "01:00 PM", tag: "Afternoon Pass", icon: "☀️" },
      { time: "04:30 PM", tag: "Evening Intercity", icon: "🌆" },
    ],
    phone: "+94 81 222 2235",
    conductorPhone: "+94 57 222 2281",
    hotline: "+94 81 222 2235 (Kandy Depot)",
    fare: "LKR 1,150",
    busType: "SLTB Mountain Line Intercity",
    description: "Breathtaking mountain pass bus connecting Central Hill Capital Kandy to Uva tourist destinations.",
    image: "/images/Nearby facilities/Kandy Badulla Intercity Bus.jpg",
    position: [6.9934, 81.0550],
    routeWaypoints: [
      [7.2906, 80.6337],
      [6.9497, 80.7891],
      [6.9015, 80.9520],
      [6.82977, 80.98457],
      [6.8667, 81.0466],
      [6.9934, 81.0550],
    ],
    rating: 4.7,
    reviews: 530,
  },
  {
    id: "trn-5",
    name: "Galle / Matara ↔ Bandarawela Expressway Express",
    routeNumber: "Route 31/EX",
    origin: "Galle Central / Matara",
    destination: "Bandarawela Bus Stop",
    via: "Southern Expressway (E01) → Godagama → Hambantota → Wellawaya → Bandarawela",
    busTimes: [
      { time: "06:15 AM", tag: "Coast-to-Hills Morning", icon: "🏖️" },
      { time: "09:45 AM", tag: "Highway Express", icon: "⚡" },
      { time: "01:15 PM", tag: "Southern Line", icon: "🚌" },
      { time: "05:00 PM", tag: "Evening Express", icon: "🌇" },
    ],
    phone: "+94 91 223 4235",
    conductorPhone: "+94 41 222 2235",
    hotline: "+94 91 223 4235 (Galle SLTB)",
    fare: "LKR 1,950",
    busType: "AC Highway Luxury Coach",
    description: "Fast coastal to mountain express bus connecting Southern Province beaches directly to Uva hills.",
    image: "/images/Nearby facilities/Galle Bandarawela Highway Bus.jpg",
    position: [6.82977, 80.98457],
    routeWaypoints: [
      [6.0535, 80.2210],
      [5.9496, 80.5469],
      [6.1241, 81.1185],
      [6.7410, 81.1010],
      [6.82977, 80.98457],
    ],
    rating: 4.8,
    reviews: 310,
  },
  {
    id: "trn-6",
    name: "Monaragala ↔ Colombo Highway Express",
    routeNumber: "Route 98/EX",
    origin: "Monaragala Central",
    destination: "Colombo Pettah",
    via: "Wellawaya → Beragala → Balangoda → Ratnapura → Kottawa Interchange",
    busTimes: [
      { time: "04:00 AM", tag: "Early Bird Express", icon: "🌅" },
      { time: "07:15 AM", tag: "Interchange Express", icon: "🚌" },
      { time: "11:30 AM", tag: "Midday Coach", icon: "☀️" },
      { time: "03:45 PM", tag: "Express Line", icon: "⚡" },
      { time: "10:00 PM", tag: "Night Sleeper", icon: "🌙" },
    ],
    phone: "+94 55 227 6235",
    conductorPhone: "+94 77 911 1161",
    hotline: "1955 (NTC Information)",
    fare: "LKR 1,650",
    busType: "AC Semi-Luxury Express Coach",
    description: "Long distance express bus connecting Monaragala district to Colombo capital city.",
    image: "/images/Nearby facilities/Monaragala Colombo Bus.jpg",
    position: [6.8732, 81.3508],
    routeWaypoints: [
      [6.8732, 81.3508],
      [6.7410, 81.1010],
      [6.6828, 80.3992],
      [6.9271, 79.8612],
    ],
    rating: 4.5,
    reviews: 280,
  },

  // INTERNAL LOCAL BUS SERVICES (Uva Province Local Routes)
  {
    id: "trn-7",
    name: "Bandarawela ↔ Ella ↔ Wellawaya Local Shuttle",
    routeNumber: "Route 311 / Local",
    origin: "Bandarawela Bus Station",
    destination: "Wellawaya Central",
    via: "Kumbalwela → Ella Town → Ravana Ella Waterfall → Wellawaya",
    busTimes: [
      { time: "06:00 AM", tag: "First Morning Shuttle", icon: "🌅" },
      { time: "07:30 AM", tag: "School & Office Shuttle", icon: "🚌" },
      { time: "09:15 AM", tag: "Tourist Scenic Local", icon: "⛰️" },
      { time: "11:45 AM", tag: "Midday Loop", icon: "☀️" },
      { time: "02:30 PM", tag: "Afternoon Shuttle", icon: "🚍" },
      { time: "05:15 PM", tag: "Evening Commuter", icon: "🌆" },
      { time: "07:45 PM", tag: "Last Night Shuttle", icon: "🌙" },
    ],
    phone: "+94 57 222 2281",
    conductorPhone: "+94 77 105 7740",
    hotline: "+94 57 222 2281 (Bandarawela Depot)",
    fare: "LKR 180",
    busType: "SLTB / Private Normal Local Bus (Every 20 mins)",
    description: "High-frequency local Uva shuttle connecting Bandarawela town center, Ella tourist strip, and Ravana Falls.",
    image: "/images/Nearby facilities/Colombo Ella Express Bus.jpg",
    position: [6.8667, 81.0466],
    routeWaypoints: [
      [6.82977, 80.98457], // Bandarawela
      [6.8667, 81.0466],   // Ella
      [6.84074, 81.05492],   // Ravana Falls (A23 Main Road)
      [6.7410, 81.1010],   // Wellawaya
    ],
    rating: 4.7,
    reviews: 340,
    isInternal: true,
  },
  {
    id: "trn-8",
    name: "Bandarawela ↔ Diyatalawa ↔ Haputale Local Line",
    routeNumber: "Route 314 / Local",
    origin: "Bandarawela Central",
    destination: "Haputale Town & Station",
    via: "Kinigama → Diyatalawa Garrison Town → Kahagolla → Haputale",
    busTimes: [
      { time: "06:15 AM", tag: "Morning Garrison Shuttle", icon: "🎖️" },
      { time: "08:00 AM", tag: "School & Local Pass", icon: "🚌" },
      { time: "10:30 AM", tag: "Adisham Monastery Local", icon: "⛪" },
      { time: "01:15 PM", tag: "Afternoon Shuttle", icon: "☀️" },
      { time: "04:00 PM", tag: "Diyatalawa Commuter", icon: "🌆" },
      { time: "06:45 PM", tag: "Night Local", icon: "🌙" },
    ],
    phone: "+94 57 222 2281",
    conductorPhone: "+94 71 546 1710",
    hotline: "+94 57 222 2281 (Bandarawela SLTB)",
    fare: "LKR 140",
    busType: "SLTB Garrison & Mountain Local Line",
    description: "Convenient local bus connecting Bandarawela, Diyatalawa garrison town, and Haputale hill station.",
    image: "/images/Nearby facilities/Orient Hotel Bandarawela.jpg",
    position: [6.7722, 80.9309],
    routeWaypoints: [
      [6.82977, 80.98457], // Bandarawela
      [6.8120, 80.9580],   // Diyatalawa
      [6.7722, 80.9309],   // Haputale
    ],
    rating: 4.6,
    reviews: 290,
    isInternal: true,
  },
  {
    id: "trn-9",
    name: "Badulla ↔ Bandarawela Local Commuter",
    routeNumber: "Route 310 / Local",
    origin: "Badulla Bus Stand",
    destination: "Bandarawela Central",
    via: "Hali-Ela → Demodara Loop → Kumbalwela → Bandarawela",
    busTimes: [
      { time: "05:45 AM", tag: "Early Commuter", icon: "🌅" },
      { time: "07:15 AM", tag: "Peak Morning Shuttle", icon: "⚡" },
      { time: "09:30 AM", tag: "High-Frequency Local", icon: "🚌" },
      { time: "12:00 PM", tag: "Midday Pass", icon: "☀️" },
      { time: "03:15 PM", tag: "Afternoon Express", icon: "🌆" },
      { time: "06:30 PM", tag: "Evening Commuter", icon: "🌙" },
    ],
    phone: "+94 55 222 2235",
    conductorPhone: "+94 76 590 0100",
    hotline: "+94 55 222 2235 (Badulla Depot)",
    fare: "LKR 160",
    busType: "High-Frequency Local Commuter (Every 15 mins)",
    description: "Main arterial local bus connecting Uva District Capital Badulla to Bandarawela via Hali-Ela and Demodara.",
    image: "/images/Nearby facilities/Colombo Badulla Intercity Bus.jpg",
    position: [6.9934, 81.0550],
    routeWaypoints: [
      [6.9934, 81.0550], // Badulla
      [6.9500, 81.0300], // Hali-Ela
      [6.884151, 81.059279], // Demodara / Nine Arches
      [6.82977, 80.98457], // Bandarawela
    ],
    rating: 4.8,
    reviews: 410,
    isInternal: true,
  },
  {
    id: "trn-10",
    name: "Bandarawela ↔ Welimada ↔ Hakgala Local Pass",
    routeNumber: "Route 315 / Local",
    origin: "Bandarawela Bus Stop",
    destination: "Welimada & Hakgala Gardens",
    via: "Boralanda → Welimada Town → Keppetipola → Hakgala Border",
    busTimes: [
      { time: "06:30 AM", tag: "Morning Mountain Pass", icon: "🌅" },
      { time: "08:45 AM", tag: "Welimada Market Bus", icon: "🥦" },
      { time: "11:15 AM", tag: "Botanical Local", icon: "🌺" },
      { time: "02:00 PM", tag: "Afternoon Shuttle", icon: "☀️" },
      { time: "05:00 PM", tag: "Evening Return", icon: "🌆" },
    ],
    phone: "+94 57 224 5235",
    conductorPhone: "+94 77 105 7740",
    hotline: "+94 57 224 5235 (Welimada SLTB)",
    fare: "LKR 190",
    busType: "SLTB Mountain Valley Local Bus",
    description: "Scenic valley bus connecting Bandarawela, Welimada vegetable region, and Hakgala Botanical Gardens border.",
    image: "/images/Nearby facilities/Kandy Badulla Intercity Bus.jpg",
    position: [6.9015, 80.9520],
    routeWaypoints: [
      [6.82977, 80.98457], // Bandarawela
      [6.9015, 80.9520],   // Welimada
      [6.9497, 80.7891],   // Hakgala
    ],
    rating: 4.5,
    reviews: 210,
    isInternal: true,
  },
];

// Leaflet Bus Marker Icon
const busMarkerIcon = L.divIcon({
  className: "custom-bus-icon",
  html: `
    <div style="background-color: #0284c7; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); transform: translate(-50%, -50%);">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M4 12h16"/><path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z"/><circle cx="6.5" cy="16.5" r="1.5"/><circle cx="17.5" cy="16.5" r="1.5"/></svg>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

// Leaflet Route Destination Marker Icon (Striking Rose Red Pin with Glowing Halo)
const destinationMarkerIcon = L.divIcon({
  className: "custom-dest-icon",
  html: `
    <div style="position: relative; width: 40px; height: 40px; transform: translate(-50%, -50%);">
      <div style="position: absolute; inset: -4px; border-radius: 50%; background-color: #f43f5e; opacity: 0.6; animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
      <div style="position: relative; background: linear-gradient(135deg, #f43f5e, #e11d48); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 14px rgba(225,29,72,0.65);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Leaflet Route Origin Start Icon (Vibrant Emerald Green Start Pin)
const originMarkerIcon = L.divIcon({
  className: "custom-origin-icon",
  html: `
    <div style="transform: translate(-50%, -50%);">
      <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(16,185,129,0.5);">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// Leaflet Intermediate Waypoint Icon (Sky Blue Bus Stop Icon)
const waypointMarkerIcon = L.divIcon({
  className: "custom-waypoint-icon",
  html: `
    <div style="transform: translate(-50%, -50%);">
      <div style="background: linear-gradient(135deg, #0284c7, #0369a1); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(2,132,199,0.4);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M4 12h16"/><path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z"/><circle cx="6.5" cy="16.5" r="1.5"/><circle cx="17.5" cy="16.5" r="1.5"/></svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function MapRecenter({ waypoints, position }) {
  const map = useMap();
  useEffect(() => {
    if (waypoints && waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });
    } else if (position && position[0] && position[1]) {
      map.flyTo(position, 10, { duration: 1.2 });
    }
  }, [waypoints, position, map]);
  return null;
}

export default function TransportFacilities() {
  const [buses, setBuses] = useState(TRANSPORT_SERVICES);
  const [search, setSearch] = useState("");
  const [selectedRouteFilter, setSelectedRouteFilter] = useState("All");
  const [selectedBusId, setSelectedBusId] = useState("trn-1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBuses = async () => {
      setLoading(true);
      try {
        const liveBuses = await fetchAllBuses();
        if (Array.isArray(liveBuses) && liveBuses.length > 0) {
          setBuses(liveBuses);
          const firstId = liveBuses[0]._id || liveBuses[0].id;
          setSelectedBusId((prev) => (prev && liveBuses.some((b) => (b._id || b.id) === prev) ? prev : firstId));
        }
      } catch (err) {
        console.warn("Using fallback local bus data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBuses();
  }, []);

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const matchesSearch =
        `${bus.name} ${bus.routeNumber} ${bus.via} ${bus.busType} ${bus.origin} ${bus.destination}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        selectedRouteFilter === "All" ||
        (selectedRouteFilter === "Colombo" && bus.name.includes("Colombo")) ||
        (selectedRouteFilter === "Highway" && bus.routeNumber.includes("EX")) ||
        (selectedRouteFilter === "Intercity" && bus.busType.includes("Intercity")) ||
        (selectedRouteFilter === "Local" && bus.isInternal === true);

      return matchesSearch && matchesFilter;
    });
  }, [buses, search, selectedRouteFilter]);

  const activeBus = useMemo(() => {
    return (
      buses.find((b) => (b._id || b.id) === selectedBusId) ||
      buses[0] ||
      TRANSPORT_SERVICES[0]
    );
  }, [buses, selectedBusId]);

  // Fetch 100% Real Road Geometry for the Active Bus Route using OSRM
  const [roadPolylinePoints, setRoadPolylinePoints] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (!activeBus || !activeBus.routeWaypoints || activeBus.routeWaypoints.length < 2) {
      setRoadPolylinePoints([]);
      return;
    }

    fetchRoadRoutes(activeBus.routeWaypoints, "bus")
      .then((routes) => {
        if (isMounted) {
          if (routes && routes.length > 0 && routes[0].points && routes[0].points.length > 0) {
            setRoadPolylinePoints(routes[0].points);
          } else {
            setRoadPolylinePoints(activeBus.routeWaypoints);
          }
        }
      })
      .catch((err) => {
        console.warn("Road routing fetch error:", err);
        if (isMounted) setRoadPolylinePoints(activeBus.routeWaypoints);
      });

    return () => {
      isMounted = false;
    };
  }, [activeBus]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      
      {/* SPLIT SCREEN GRID LAYOUT */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        
        {/* LEFT COLUMN: STICKY INTERACTIVE MAP STAGE (5/12 Desktop width) */}
        <div className="lg:col-span-5 lg:sticky lg:top-4 z-10 space-y-4">
          
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-xl dark:border-slate-800">
            
            {/* FLOATING ACTIVE ROUTE HEADER OVERLAY */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/90 px-5 py-3.5 backdrop-blur-md text-white">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500 text-white font-extrabold text-xs shadow-xs">
                  🚌
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Live Active Route Map</p>
                  <h3 className="text-xs font-extrabold text-white truncate max-w-[200px]">{activeBus.name}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-sky-500/20 border border-sky-400/40 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-300">
                  {activeBus.routeNumber}
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300">
                  {activeBus.fare}
                </span>
              </div>
            </div>

            {/* LEAFLET CANVAS */}
            <div className="relative h-[380px] lg:h-[calc(100vh-170px)] min-h-[380px] max-h-[640px] w-full">
              <MapContainer
                center={activeBus.position}
                zoom={9.5}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapRecenter waypoints={roadPolylinePoints.length > 0 ? roadPolylinePoints : activeBus.routeWaypoints} position={activeBus.position} />

                {/* 100% REAL ROAD BUS ROUTE POLYLINE PATH FOLLOWING HIGHWAYS & ROADS */}
                {roadPolylinePoints && roadPolylinePoints.length > 0 ? (
                  <Polyline
                    key={`road-poly-${activeBus._id || activeBus.id}-${roadPolylinePoints.length}`}
                    positions={roadPolylinePoints}
                    pathOptions={{
                      color: "#0284c7",
                      weight: 6,
                      opacity: 0.95,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  />
                ) : (
                  activeBus.routeWaypoints && (
                    <Polyline
                      positions={activeBus.routeWaypoints}
                      pathOptions={{
                        color: "#0284c7",
                        weight: 6,
                        opacity: 0.9,
                        dashArray: "8, 10",
                      }}
                    />
                  )
                )}

                {/* ACTIVE ROUTE WAYPOINT & DESTINATION MARKERS */}
                {(() => {
                  const waypoints = activeBus.routeWaypoints || [];
                  if (waypoints.length < 2) return null;

                  const originCoord = waypoints[0];
                  const destCoord = waypoints[waypoints.length - 1];
                  const midCoords = waypoints.slice(1, waypoints.length - 1);

                  return (
                    <>
                      {/* ORIGIN START MARKER */}
                      <Marker position={originCoord} icon={originMarkerIcon} zIndexOffset={500}>
                        <Popup>
                          <div className="p-1 text-center min-w-[170px]">
                            <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase">
                              🚀 Route Start
                            </span>
                            <strong className="block mt-1 text-slate-900 text-xs font-extrabold">{activeBus.origin}</strong>
                            <p className="mt-0.5 text-[11px] text-slate-500 font-semibold">{activeBus.name}</p>
                          </div>
                        </Popup>
                      </Marker>

                      {/* INTERMEDIATE WAYPOINT MARKERS */}
                      {midCoords.map((coord, idx) => (
                        <Marker key={`mid-${idx}`} position={coord} icon={waypointMarkerIcon}>
                          <Popup>
                            <div className="p-1 text-center min-w-[150px]">
                              <span className="inline-block rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-800 uppercase">
                                🚏 Waypoint Stop
                              </span>
                              <p className="mt-1 text-xs font-bold text-slate-800">Route Waypoint #{idx + 1}</p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      {/* DESTINATION END MARKER (WITH PULSING GLOW & DESTINATION PIN) */}
                      <Marker position={destCoord} icon={destinationMarkerIcon} zIndexOffset={1000}>
                        <Popup>
                          <div className="p-1 text-center min-w-[180px]">
                            <span className="inline-block rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-800 uppercase">
                              📍 Route Destination
                            </span>
                            <strong className="block mt-1 text-slate-900 text-xs font-extrabold">{activeBus.destination}</strong>
                            <p className="mt-0.5 text-xs font-bold text-teal-700">{activeBus.routeNumber} • {activeBus.fare}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </>
                  );
                })()}

                {/* OTHER BUS SERVICE MARKERS */}
                {buses.map((bus) => {
                  if ((bus._id || bus.id) === (activeBus._id || activeBus.id)) return null;
                  return (
                    <Marker key={bus._id || bus.id} position={bus.position} icon={busMarkerIcon}>
                      <Popup>
                        <div className="p-1 text-center min-w-[170px]">
                          <strong className="text-slate-900 text-xs font-extrabold">{bus.name}</strong>
                          <br />
                          <span className="mt-1 inline-block rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-800">
                            {bus.routeNumber}
                          </span>
                          <p className="mt-1 text-xs font-bold text-sky-700">Fare: {bus.fare}</p>
                          <p className="mt-0.5 text-xs text-slate-600">📞 Depot: {bus.phone}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* BOTTOM MAP TRANSIT STEPPER FLOATING BADGE */}
              <div className="absolute bottom-3 left-3 right-3 z-[400] pointer-events-none">
                <div className="pointer-events-auto rounded-2xl bg-slate-950/85 p-3 backdrop-blur-md border border-white/10 text-white shadow-xl">
                  <p className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Navigation size={11} /> Waypoint Corridor:
                  </p>
                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {activeBus.via}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: SEARCH, FILTERS & SCHEDULE LIST (7/12 Desktop width) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* HEADER TITLE & SEARCH */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                <Bus size={14} />
                Official SLTB & NTC Passenger Timetables
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
                Transport Facilities & Bus Routes
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Click any bus pass below to view its live highway route map, scheduled departure slots, & operator hotlines.
              </p>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bus (Route 99, EX), city (Colombo, Badulla, Ella)..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs sm:text-sm font-semibold outline-none focus:border-sky-600 focus:bg-white transition dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            {/* QUICK ROUTE FILTER PILLS */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { label: "✨ All Routes", value: "All" },
                { label: "🚐 Internal Local Buses", value: "Local" },
                { label: "🚌 Colombo Express", value: "Colombo" },
                { label: "⚡ Highway Coaches", value: "Highway" },
                { label: "⛰️ Intercity", value: "Intercity" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setSelectedRouteFilter(item.value)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                    selectedRouteFilter === item.value
                      ? "bg-sky-700 text-white shadow-xs dark:bg-sky-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* SCHEDULE CARDS LIST */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Showing {filteredBuses.length} express bus services
            </p>

            {filteredBuses.map((bus) => {
              const currentId = bus._id || bus.id;
              const isSelected = currentId === selectedBusId;

              return (
                <article
                  key={currentId}
                  onClick={() => setSelectedBusId(currentId)}
                  className={`cursor-pointer overflow-hidden rounded-3xl bg-white shadow-sm border transition-all duration-200 hover:shadow-md dark:bg-slate-900 ${
                    isSelected
                      ? "border-sky-500 ring-2 ring-sky-500/30 dark:border-sky-500"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="p-5 space-y-3.5">
                    
                    {/* CARD HEADER & ROUTE BADGES */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-sky-700 px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-xs">
                            {bus.routeNumber}
                          </span>
                          <span className="rounded-lg bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {bus.fare}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                          {bus.name}
                        </h3>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBusId(currentId);
                        }}
                        className={`shrink-0 flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                          isSelected
                            ? "bg-sky-600 text-white shadow-sm"
                            : "bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300"
                        }`}
                      >
                        <Navigation size={13} />
                        {isSelected ? "Active on Map" : "View Map"}
                      </button>
                    </div>

                    {/* ORIGIN TO DESTINATION METRIC */}
                    <div className="flex items-center gap-2 text-xs font-extrabold text-sky-800 dark:text-sky-300 bg-sky-50/70 p-2.5 rounded-2xl border border-sky-100 dark:bg-sky-950/40 dark:border-sky-800/60">
                      <MapPin size={14} className="shrink-0 text-sky-600 dark:text-sky-400" />
                      <span className="truncate">{bus.origin}</span>
                      <ArrowRight size={14} className="shrink-0 text-sky-400" />
                      <span className="truncate">{bus.destination}</span>
                    </div>

                    {/* BUS TYPE & VIA */}
                    <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        🚌 {bus.busType}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        <strong>Via:</strong> {bus.via}
                      </p>
                    </div>

                    {/* TIMETABLE SLOTS */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <Clock size={11} /> Departure Timetable Slots:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {bus.busTimes.map((slot, idx) => (
                          <span
                            key={`tslot-${idx}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                          >
                            <span>{slot.icon || "⏰"}</span>
                            <span>{slot.time}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* OPERATOR PHONE NUMBERS */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-slate-600 dark:text-slate-400 truncate">
                        📞 <strong>SLTB Depot:</strong> <span className="font-bold text-slate-900 dark:text-white">{bus.phone}</span>
                      </div>

                      <a
                        href={`tel:${bus.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-800 dark:bg-teal-600"
                      >
                        <Phone size={12} /> Call Depot
                      </a>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
