import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapPin,
  Navigation,
  Compass,
  Hotel,
  Utensils,
  Fuel,
  Stethoscope,
  ShieldCheck,
  Phone,
  Star,
  Search,
  LocateFixed,
  AlertCircle,
  Bus,
  Clock,
} from "lucide-react";
import { API_URL } from "../services/api";
import { getOpeningStatus, getGoogleMapsUrl } from "../utils/openingHoursUtil";

// Default Fallback Hub: Bandarawela Central Bus Stop
const DEFAULT_CENTER = [6.82977, 80.98457];

// Preset Origins for quick selection
const PRESET_LOCATIONS = {
  "my_location": { name: "📱 My Live GPS Location", coords: null },
  "bandarawela": { name: "🚌 Bandarawela Town / Central Bus Stop", coords: [6.82977, 80.98457] },
  "haputale": { name: "🚂 Haputale Railway Station", coords: [6.7722, 80.9309] },
  "ella": { name: "⛰️ Ella Town Center", coords: [6.8667, 81.0466] },
  "badulla": { name: "🏛️ Badulla Town / Bus Stand", coords: [6.9934, 81.0550] },
  "diyatalawa": { name: "🎖️ Diyatalawa Garrison Town", coords: [6.8120, 80.9580] },
};

// Static Master List of Uva Province Attractions & Facilities with real coordinates
const ALL_NEARBY_DATA = [
  // Tourist Attractions (Explore Places)
  { id: "att-1", name: "Porowagala Viewpoint", category: "Attraction", subCategory: "Sightseeing Viewpoint", position: [6.830560, 81.012682], rating: 4.6, reviews: 312, phone: "055 222 9675", description: "Scenic panoramic cliff viewpoint overlooking Kinigama & Bandarawela.", image: "/images/places/porowagala-viewpoint.jpg", isExplorePlace: true, openingDays: "Monday - Sunday", openingHours: "Open 24 Hours", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.830559988080396,81.01268150484262" },
  { id: "att-2", name: "Dowa Rock Temple", category: "Attraction", subCategory: "Historical Cave Temple", position: [6.857426, 81.022059], rating: 4.5, reviews: 420, phone: "+94 57 222 8630", description: "2000-year-old rock temple featuring an 38ft carved Buddha statue.", image: "/images/places/dowa-rock-temple.jpg", isExplorePlace: true, openingDays: "Monday - Sunday", openingHours: "06:00 AM - 06:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.857425909029196,81.02205925881152" },
  { id: "att-3", name: "Adisham Bungalow", category: "Attraction", subCategory: "Benedictine Monastery", position: [6.773087, 80.930990], rating: 4.7, reviews: 1120, phone: "+94 57 226 8030", description: "Historic 1931 Tudor-style monastery & orchard in Haputale sanctuary.", image: "/images/places/adisham-bungalow.jpg", isExplorePlace: true, openingDays: "Weekends & Public Holidays", openingHours: "09:00 AM - 04:30 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.773086557447562,80.93099045087155" },
  { id: "att-4", name: "Ella Rock", category: "Attraction", subCategory: "Hiking Trail & Cliff", position: [6.8538, 81.0464], rating: 4.8, reviews: 3410, phone: "N/A", description: "Challenging mountain trek offering views across Ella Gap.", image: "/images/places/ella-rock.jpeg", isExplorePlace: true, openingDays: "Monday - Sunday", openingHours: "Open 24 Hours", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.8538,81.0464" },
  { id: "att-5", name: "Little Adam's Peak", category: "Attraction", subCategory: "Panoramic Peak", position: [6.8625, 81.0638], rating: 4.8, reviews: 4210, phone: "+94 70 110 0021", description: "Easy 45-min hike through tea gardens with views of Ella Gap.", image: "/images/places/little-adams-peak.jpg", isExplorePlace: true, openingDays: "Monday - Sunday", openingHours: "05:00 AM - 06:30 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.8625,81.0638" },
  { id: "att-6", name: "Nine Arches Bridge", category: "Attraction", subCategory: "Colonial Viaduct", position: [6.87676, 81.06076], rating: 4.9, reviews: 7890, phone: "N/A", description: "Iconic colonial-era stone train viaduct surrounded by lush jungle.", image: "/images/places/nine-arches-bridge.jpg", isExplorePlace: true, openingDays: "Monday - Sunday", openingHours: "Open 24 Hours", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.87676,81.06076" },
  { id: "att-7", name: "Rawana Ella Cave", category: "Attraction", subCategory: "Prehistoric Cave Site", position: [6.864793, 81.048639], rating: 4.3, reviews: 520, phone: "+94 71 613 1211", description: "Ancient cave site linked to King Ravana legends.", image: "/images/places/rawana-ella-cave.jpg", isExplorePlace: true, openingDays: "Monday - Sunday", openingHours: "08:30 AM - 05:30 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.864792997229675,81.04863933379441" },
  { id: "att-8", name: "Halpewatte Tea Factory", category: "Attraction", subCategory: "Tea Factory Tour", position: [6.890353, 81.034249], rating: 4.6, reviews: 890, phone: "+94 57 222 8599", description: "Largest tea processing factory in Uva with guided tasting tours.", image: "/images/places/halpewatte-tea-factory.jpg", isExplorePlace: true, openingDays: "Monday - Sunday", openingHours: "08:00 AM - 04:30 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.89035332628612,81.03424924346947" },
  { id: "att-9", name: "Ravana Falls", category: "Attraction", subCategory: "Roadside Waterfall", position: [6.84074, 81.05492], rating: 4.6, reviews: 5410, phone: "N/A", description: "25-meter cascading waterfall along the main Wellawaya highway.", image: "/images/places/ravana-fall.jpg", isExplorePlace: true, openingDays: "Monday - Sunday", openingHours: "Open 24 Hours", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.84074,81.05492" },
  { id: "att-10", name: "Lipton's Seat", category: "Attraction", subCategory: "Tea Plantation Viewpoint", position: [6.789521, 81.017612], rating: 4.8, reviews: 2150, phone: "+94 57 567 0595", description: "Historic lookout point where Sir Thomas Lipton surveyed his tea empire.", image: "/images/places/liptons-seat.jpg", isExplorePlace: true, openingDays: "Monday - Sunday", openingHours: "05:30 AM - 05:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=6.789520980363356,81.01761188949553" },

  // Hotels
  { id: "hot-1", name: "Bandarawela Heritage Hotel", category: "Hotel", subCategory: "Heritage Lodging", position: [6.83150, 80.98800], rating: 4.5, reviews: 512, phone: "+94 57 222 2501", description: "Colonial-style heritage hotel in central Bandarawela town.", image: "/images/Nearby facilities/Bandarawela Heritage Hotel.jpg", openingDays: "Monday - Sunday", openingHours: "24 Hours Check-in", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bandarawela+Heritage+Hotel" },
  { id: "hot-2", name: "Orient Hotel Bandarawela", category: "Hotel", subCategory: "City Hotel", position: [6.82850, 80.98500], rating: 4.3, reviews: 380, phone: "+94 57 222 2407", description: "City hotel close to Bandarawela bus stand.", image: "/images/Nearby facilities/Orient Hotel Bandarawela.jpg", openingDays: "Monday - Sunday", openingHours: "24 Hours Check-in", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Orient+Hotel+Bandarawela" },
  { id: "hot-3", name: "Melheim Resort & Spa", category: "Hotel", subCategory: "Luxury Resort", position: [6.77100, 80.94500], rating: 4.7, reviews: 840, phone: "+94 57 226 8000", description: "Luxury hillside resort overlooking southern plains from Haputale.", image: "/images/Nearby facilities/Melheim Resort & Spa.jpg", openingDays: "Monday - Sunday", openingHours: "24 Hours Check-in", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Melheim+Resort+%26+Spa+Haputale" },
  { id: "hot-4", name: "Olympus Plaza Hotel", category: "Hotel", subCategory: "Plaza Hotel", position: [6.76850, 80.95800], rating: 4.2, reviews: 410, phone: "+94 57 226 8200", description: "Scenic hotel located near Haputale railway station.", image: "/images/Nearby facilities/Olympus Plaza Hotel.jpg", openingDays: "Monday - Sunday", openingHours: "24 Hours Check-in", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Olympus+Plaza+Hotel+Haputale" },
  { id: "hot-5", name: "Diyatalawa Heritage Bungalow", category: "Hotel", subCategory: "Bungalow", position: [6.81200, 80.95800], rating: 4.6, reviews: 215, phone: "+94 57 222 9100", description: "Charming bungalow in the cool climate of Diyatalawa.", image: "/images/Nearby facilities/Diyatalawa Heritage Bungalow.jpg", openingDays: "Monday - Sunday", openingHours: "24 Hours Check-in", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Diyatalawa+Heritage+Bungalow" },
  { id: "hot-6", name: "EKHO Ella", category: "Hotel", subCategory: "Resort Hotel", position: [6.87100, 81.04900], rating: 4.6, reviews: 656, phone: "+94 57 222 8655", description: "Hotel accommodation in central Ella town.", image: "/images/Nearby facilities/EKHO Ella.jpg", openingDays: "Monday - Sunday", openingHours: "24 Hours Check-in", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=EKHO+Ella" },
  { id: "hot-7", name: "Morning Dew Hotel", category: "Hotel", subCategory: "Hotel", position: [6.87250, 81.04750], rating: 4.3, reviews: 632, phone: "+94 57 493 3373", description: "Comfortable accommodation with easy access to Ella attractions.", image: "/images/Nearby facilities/Morning Dew Hotel.jpg", openingDays: "Monday - Sunday", openingHours: "24 Hours Check-in", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Morning+Dew+Hotel+Ella" },

  // Restaurants
  { id: "res-1", name: "Bandarawela Rest House Dining", category: "Restaurant", subCategory: "Traditional & Western", position: [6.83050, 80.98650], rating: 4.4, reviews: 420, phone: "+94 57 222 2201", description: "Traditional Sri Lankan and Western dining in historic Bandarawela.", image: "/images/Nearby facilities/Bandarawela Rest House Dining.jpg", openingDays: "Monday - Sunday", openingHours: "07:00 AM - 10:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bandarawela+Rest+House" },
  { id: "res-2", name: "Welimada Family Restaurant", category: "Restaurant", subCategory: "Family Dining", position: [6.90389, 80.95250], rating: 4.2, reviews: 290, phone: "+94 57 224 5100", description: "Spacious restaurant serving hill country cuisine in Welimada.", image: "/images/Nearby facilities/Welimada Family Restaurant.jpg", openingDays: "Monday - Sunday", openingHours: "07:30 AM - 09:30 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Welimada+Family+Restaurant" },
  { id: "res-3", name: "Misty Mountain Cafe Haputale", category: "Restaurant", subCategory: "Hilltop Cafe", position: [6.76820, 80.95700], rating: 4.5, reviews: 580, phone: "+94 57 226 8110", description: "Popular local cafe overlooking the Haputale mist gap.", image: "/images/Nearby facilities/Misty Mountain Cafe Haputale.jpg", openingDays: "Monday - Sunday", openingHours: "07:00 AM - 09:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Misty+Mountain+Cafe+Haputale" },
  { id: "res-4", name: "Risara Bakers & Restaurant", category: "Restaurant", subCategory: "Bakery & Cafe", position: [6.76750, 80.95650], rating: 4.3, reviews: 310, phone: "+94 57 226 8050", description: "Fresh pastries, short eats, and tea in Haputale.", image: "/images/Nearby facilities/Risara Bakers & Restaurant.jpg", openingDays: "Monday - Sunday", openingHours: "06:00 AM - 09:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Risara+Bakers+Haputale" },
  { id: "res-5", name: "360 Ella", category: "Restaurant", subCategory: "Multi-cuisine", position: [6.87120, 81.04880], rating: 4.6, reviews: 6361, phone: "+94 76 288 7480", description: "Popular main street restaurant in Ella.", image: "/images/Nearby facilities/360 Ella.jpg", openingDays: "Monday - Sunday", openingHours: "08:00 AM - 11:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=360+Ella" },
  { id: "res-6", name: "Cafe Chill", category: "Restaurant", subCategory: "Cafe & Bar", position: [6.87080, 81.04920], rating: 4.5, reviews: 12184, phone: "+94 77 180 4020", description: "Vibrant cafe and lounge in Ella.", image: "/images/Nearby facilities/Cafe Chill.jpg", openingDays: "Monday - Sunday", openingHours: "08:00 AM - 11:30 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe+Chill+Ella" },

  // Fuel Stations
  { id: "fue-1", name: "Ceypetco Central Station Bandarawela", category: "Fuel Station", subCategory: "Petrol & Diesel (24/7)", position: [6.83200, 80.98600], rating: 4.4, reviews: 512, phone: "+94 57 222 2234", description: "24/7 filling station serving petrol and diesel in Bandarawela.", image: "/images/Nearby facilities/Ceypetco Central Station Bandarawela.jpg", openingDays: "Monday - Sunday", openingHours: "Open 24 Hours", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ceypetco+Bandarawela" },
  { id: "fue-2", name: "LIOC Fuel Station Bandarawela", category: "Fuel Station", subCategory: "Lanka IOC Station", position: [6.83400, 80.99100], rating: 4.3, reviews: 320, phone: "+94 57 222 2890", description: "Lanka IOC station located on Badulla road.", image: "/images/Nearby facilities/LIOC Fuel Station Bandarawela.jpg", openingDays: "Monday - Sunday", openingHours: "06:00 AM - 10:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=LIOC+Fuel+Station+Bandarawela" },
  { id: "fue-3", name: "Ceypetco Filling Station Haputale", category: "Fuel Station", subCategory: "Petrol Station", position: [6.76700, 80.95600], rating: 4.2, reviews: 210, phone: "+94 57 226 8020", description: "Main fuel station serving travellers in Haputale.", image: "/images/Nearby facilities/Ceypetco Filling Station Haputale.jpg", openingDays: "Monday - Sunday", openingHours: "06:00 AM - 09:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ceypetco+Haputale" },
  { id: "fue-4", name: "Diyatalawa Fuel Station", category: "Fuel Station", subCategory: "Petrol Station", position: [6.81900, 80.96200], rating: 4.3, reviews: 180, phone: "+94 57 222 9050", description: "Fuel station in Diyatalawa military town.", image: "/images/Nearby facilities/Diyatalawa Fuel Station.jpg", openingDays: "Monday - Sunday", openingHours: "06:00 AM - 09:30 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Diyatalawa+Fuel+Station" },
  { id: "fue-5", name: "Welimada Ceypetco Station", category: "Fuel Station", subCategory: "Petrol Station", position: [6.90389, 80.95250], rating: 4.2, reviews: 240, phone: "+94 57 224 5020", description: "Fuel station serving Welimada agricultural and tourist traffic.", image: "/images/Nearby facilities/Welimada Ceypetco Station.jpg", openingDays: "Monday - Sunday", openingHours: "06:00 AM - 09:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Welimada+Ceypetco+Station" },

  // Hospitals
  { id: "med-1", name: "Bandarawela District Base Hospital", category: "Medical", subCategory: "Base Hospital & ER", position: [6.83361, 80.98556], rating: 4.5, reviews: 430, phone: "+94 57 222 2261", description: "Primary district hospital in Bandarawela with 24h emergency room.", image: "/images/Nearby facilities/Bandarawela District Base Hospital.jpg", openingDays: "Monday - Sunday", openingHours: "Open 24 Hours (ER)", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bandarawela+District+Base+Hospital" },
  { id: "med-2", name: "Haputale Base Hospital", category: "Medical", subCategory: "Divisional Hospital", position: [6.76861, 80.95833], rating: 4.3, reviews: 190, phone: "+94 57 226 8061", description: "Government hospital providing medical care in Haputale.", image: "/images/Nearby facilities/Haputale Base Hospital.jpg", openingDays: "Monday - Sunday", openingHours: "Open 24 Hours (ER)", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Haputale+Base+Hospital" },
  { id: "med-3", name: "Diyatalawa Base & Military Hospital", category: "Medical", subCategory: "Regional Hospital", position: [6.81889, 80.96444], rating: 4.7, reviews: 350, phone: "+94 57 222 9061", description: "Major medical center facility in Diyatalawa.", image: "/images/Nearby facilities/Diyatalawa Base & Military Hospital.jpg", openingDays: "Monday - Sunday", openingHours: "Open 24 Hours (ER)", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Diyatalawa+Military+Hospital" },

  // Police
  { id: "pol-1", name: "Bandarawela Division Police Station", category: "Police", subCategory: "Police HQ", position: [6.83100, 80.98550], rating: 4.4, reviews: 180, phone: "+94 57 222 2222", description: "Headquarters police station in Bandarawela.", image: "/images/Nearby facilities/Bandarawela Division Police Station.jpg", openingDays: "Monday - Sunday", openingHours: "Open 24 Hours", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bandarawela+Police+Station" },
  { id: "pol-5", name: "Ella Police Station", category: "Police", subCategory: "Police Station", position: [6.87350, 81.04720], rating: 4.2, reviews: 115, phone: "+94 57 222 8522", description: "Local police station serving the Ella area.", image: "/images/Nearby facilities/Ella Police Station.jpg", openingDays: "Monday - Sunday", openingHours: "Open 24 Hours", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ella+Police+Station" },

  // Outdoor & Rentals
  { id: "cmp-1", name: "Scan Alpine Camping Store", category: "Camping", subCategory: "Camping Equipment", position: [6.87200, 81.04800], rating: 4.7, reviews: 60, phone: "+94 57 223 5107", description: "Camping and outdoor equipment store in Ella.", image: "/images/Nearby facilities/Scan Alpine Camping Store.jpg", openingDays: "Monday - Saturday", openingHours: "08:30 AM - 07:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Scan+Alpine+Camping+Ella" },
  { id: "bik-1", name: "Ella Scooter Rental EllaBike", category: "Bike Rental", subCategory: "Scooter & Bike Rental", position: [6.87000, 81.04900], rating: 4.8, reviews: 248, phone: "+94 77 911 1161", description: "Scooter rental service for exploring Ella and surrounding areas.", image: "/images/Nearby facilities/Ella Scooter Rental EllaBike.jpg", openingDays: "Monday - Sunday", openingHours: "08:00 AM - 08:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ella+Scooter+Rental+EllaBike" },
  { id: "bik-2", name: "Scooter Rental 4U Ella Bikes", category: "Bike Rental", subCategory: "Scooter Rental", position: [6.87180, 81.04820], rating: 4.9, reviews: 176, phone: "+94 71 546 1710", description: "Scooter rental service located in central Ella.", image: "/images/Nearby facilities/Scooter Rental 4U Ella Bikes.jpg", openingDays: "Monday - Sunday", openingHours: "08:00 AM - 08:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Scooter+Rental+4U+Ella+Bikes" },

  // --- HALI-ELA (HALIELA) SECTOR (14 km NE) ---
  { id: "med-hali-1", name: "Hali-Ela Divisional Hospital", category: "Medical", subCategory: "Government Hospital & ER", position: [6.95389, 81.03194], rating: 4.4, reviews: 142, phone: "+94 55 229 4261", description: "Divisional hospital providing 24/7 emergency medical services in Hali-Ela.", image: "/images/Nearby facilities/Bandarawela District Base Hospital.jpg", openingDays: "Monday - Sunday", openingHours: "Open 24 Hours (ER)", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hali-Ela+Hospital" },
  { id: "pol-hali-2", name: "Hali-Ela Police Station", category: "Police", subCategory: "Police Station", position: [6.95300, 81.03100], rating: 4.3, reviews: 98, phone: "+94 55 229 4222", description: "Local police station providing 24/7 security and assistance in Hali-Ela.", image: "/images/Nearby facilities/Bandarawela Division Police Station.jpg", openingDays: "Monday - Sunday", openingHours: "Open 24 Hours", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hali-Ela+Police+Station" },
  { id: "fue-hali-3", name: "Hali-Ela Ceypetco Fuel Station", category: "Fuel Station", subCategory: "Petrol Station", position: [6.95400, 81.03250], rating: 4.4, reviews: 210, phone: "+94 55 229 4300", description: "24/7 petrol and diesel filling station on Badulla highway in Hali-Ela.", image: "/images/Nearby facilities/Ceypetco Central Station Bandarawela.jpg", openingDays: "Monday - Sunday", openingHours: "Open 24 Hours", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hali-Ela+Fuel+Station" },
  { id: "hot-hali-4", name: "Hali-Ela Hillside Guest House & Dining", category: "Hotel", subCategory: "Guest House", position: [6.95200, 81.03000], rating: 4.3, reviews: 85, phone: "+94 55 229 4500", description: "Comfortable guest house accommodation with local hill country dining.", image: "/images/Nearby facilities/Bandarawela Heritage Hotel.jpg", openingDays: "Monday - Sunday", openingHours: "24 Hours Check-in", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hali-Ela+Guest+House" },

  // --- ETTAMPITIYA SECTOR (10 km NE) ---
  { id: "med-ettam-1", name: "Ettampitiya Rural Hospital & Clinic", category: "Medical", subCategory: "Rural Hospital", position: [6.92000, 80.98000], rating: 4.3, reviews: 75, phone: "+94 57 224 8100", description: "Rural hospital serving Ettampitiya valley.", image: "/images/Nearby facilities/Bandarawela District Base Hospital.jpg", openingDays: "Monday - Sunday", openingHours: "Open 24 Hours (ER)", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ettampitiya+Hospital" },

  // --- POONAGALA & HAPUTALE SECTOR (8-14 km S) ---
  { id: "med-poona-1", name: "Poonagala Estate Hospital", category: "Medical", subCategory: "Estate Clinic", position: [6.77700, 81.00500], rating: 4.2, reviews: 65, phone: "+94 57 226 8300", description: "Estate clinic serving visitors traveling to Lipton's Seat viewpoint.", image: "/images/Nearby facilities/Bandarawela District Base Hospital.jpg", openingDays: "Monday - Sunday", openingHours: "07:00 AM - 05:00 PM", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Poonagala+Hospital" },

  // --- OHIYA & HORTON PLAINS SECTOR (17 km W) ---
  { id: "hot-ohiya-1", name: "Ohiya Eco Mountain Lodge", category: "Hotel", subCategory: "Mountain Lodge", position: [6.81500, 80.84000], rating: 4.6, reviews: 140, phone: "+94 57 228 9010", description: "High altitude mountain lodge near Horton Plains sanctuary.", image: "/images/Nearby facilities/Diyatalawa Heritage Bungalow.jpg", openingDays: "Monday - Sunday", openingHours: "24 Hours Check-in", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ohiya+Eco+Lodge" },
];

// Haversine formula to compute exact distance in kilometers
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

// User GPS Location Marker (Pulsing Cyan Icon)
const userGpsIcon = L.divIcon({
  className: "custom-user-gps",
  html: `
    <div style="background-color: #0284c7; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 0 0 6px rgba(2, 132, 199, 0.3); transform: translate(-50%, -50%);">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// Destination Pin (Teal Pin)
const destPinIcon = L.divIcon({
  className: "custom-dest-pin",
  html: `
    <div style="background-color: #0f766e; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); transform: translate(-50%, -50%);">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Facility Category Logo Creator
function createFacilityLogoIcon(emoji, bgColor) {
  return L.divIcon({
    className: "custom-facility-logo",
    html: `
      <div style="background-color: ${bgColor}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.25); transform: translate(-50%, -50%);">
        ${emoji}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

const facilityLogos = {
  Hotel: createFacilityLogoIcon("🏨", "#2563eb"),
  Restaurant: createFacilityLogoIcon("🍽️", "#ea580c"),
  "Fuel Station": createFacilityLogoIcon("⛽", "#dc2626"),
  Medical: createFacilityLogoIcon("🏥", "#16a34a"),
  Police: createFacilityLogoIcon("🛡️", "#4f46e5"),
  Attraction: destPinIcon,
};

function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

function NearbyFacilities() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [selectedOrigin, setSelectedOrigin] = useState("my_location");
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  const [locationName, setLocationName] = useState("Detecting GPS Location...");
  const [gpsStatus, setGpsStatus] = useState("detecting"); // 'detecting', 'success', 'denied'
  const [maxRadiusKm, setMaxRadiusKm] = useState(5.0); // DEFAULT 5KM RADIUS
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(queryParam);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  // Detect Live GPS Location on mount
  useEffect(() => {
    detectUserGps();
  }, []);

  function detectUserGps() {
    setGpsStatus("detecting");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setLocationName("Your Live GPS Location");
          setGpsStatus("success");
          setSelectedOrigin("my_location");
        },
        (err) => {
          console.warn("GPS detection failed, falling back to Bandarawela Bus Stop:", err);
          setUserLocation(DEFAULT_CENTER);
          setLocationName("Bandarawela Central Bus Stop (Fallback)");
          setGpsStatus("denied");
          setSelectedOrigin("bandarawela");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserLocation(DEFAULT_CENTER);
      setLocationName("Bandarawela Central Bus Stop");
      setGpsStatus("denied");
      setSelectedOrigin("bandarawela");
    }
  }

  // Handle origin dropdown switch
  function handleOriginChange(e) {
    const val = e.target.value;
    setSelectedOrigin(val);

    if (val === "my_location") {
      detectUserGps();
    } else if (PRESET_LOCATIONS[val]?.coords) {
      setUserLocation(PRESET_LOCATIONS[val].coords);
      setLocationName(PRESET_LOCATIONS[val].name);
      setGpsStatus("preset");
    }
  }

  // Filter places inside maxRadiusKm (Default 5.0 km) and matching category/search
  const nearbyPlaces = useMemo(() => {
    return ALL_NEARBY_DATA.map((item) => {
      const distKm = calculateHaversineKm(userLocation, item.position);
      return { ...item, distKm };
    })
      .filter((item) => {
        // Enforce max 5km (or selected) radius boundary
        const isInsideRadius = item.distKm <= maxRadiusKm;
        const matchesCategory =
          selectedCategory === "All" || item.category === selectedCategory;
        const matchesSearch =
          !searchQuery ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subCategory.toLowerCase().includes(searchQuery.toLowerCase());

        return isInsideRadius && matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.distKm - b.distKm); // Sort closest first
  }, [userLocation, maxRadiusKm, selectedCategory, searchQuery]);

  // Determine dynamic map zoom based on radius
  const mapZoom = useMemo(() => {
    if (maxRadiusKm <= 5) return 13.2;
    if (maxRadiusKm <= 10) return 12.0;
    if (maxRadiusKm <= 15) return 11.2;
    return 10.5;
  }, [maxRadiusKm]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      
      {/* HEADER & LOCATION INDICATOR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
              <LocateFixed size={14} />
              5km User Radius Mode
            </span>
            {gpsStatus === "success" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 size={12} /> Live GPS Active
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Nearby Places & Facilities
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Showing all attractions, hotels, dining, fuel, & emergency services within{" "}
            <strong className="text-sky-700">{maxRadiusKm} km</strong> of your actual location.
          </p>
        </div>

        {/* RE-DETECT GPS BUTTON */}
        <button
          onClick={detectUserGps}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 active:scale-95"
        >
          <Navigation size={16} />
          {gpsStatus === "detecting" ? "Locating You..." : "Detect My GPS Location"}
        </button>
      </div>

      {/* LOCATION & RADIUS CONTROLS CARD */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="grid gap-4 md:grid-cols-12 md:items-center">
          
          {/* LOCATION SELECTOR */}
          <div className="md:col-span-6">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              📍 Current Location Center
            </label>
            <div className="relative">
              <select
                value={selectedOrigin}
                onChange={handleOriginChange}
                className="w-full appearance-none rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-4 pr-10 text-sm font-semibold text-slate-900 transition focus:border-sky-600 focus:bg-white focus:outline-none"
              >
                <option value="my_location">📱 My Live GPS Location ({gpsStatus === 'success' ? 'Detected' : 'Searching...'})</option>
                <option value="bandarawela">🚌 Bandarawela Town / Central Bus Stop</option>
                <option value="haputale">🚂 Haputale Railway Station</option>
                <option value="ella">⛰️ Ella Town Center</option>
                <option value="badulla">🏛️ Badulla Town / Bus Stand</option>
                <option value="diyatalawa">🎖️ Diyatalawa Garrison Town</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                ▼
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Center: <span className="font-semibold text-slate-700">{locationName}</span> ({userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)})
            </p>
          </div>

          {/* RADIUS PRESET BUTTONS (5km Default) */}
          <div className="md:col-span-6">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              🎯 Distance Radius Limit
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "5 km (Default)", value: 5.0 },
                { label: "10 km", value: 10.0 },
                { label: "15 km", value: 15.0 },
                { label: "25 km", value: 25.0 },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setMaxRadiusKm(item.value)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                    maxRadiusKm === item.value
                      ? "bg-sky-600 text-white shadow-sm ring-2 ring-sky-600/30"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Showing places within <strong className="text-sky-700">{maxRadiusKm}km</strong> radius circle of center.
            </p>
          </div>

        </div>
      </div>

      {/* MAP & SEARCH BAR */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        
        {/* MAP LEGEND HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-600 animate-pulse"></span>
            <strong>Blue Circle = {maxRadiusKm}km Radius Zone from Your Location</strong>
          </div>
          <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
            <span>📱 User Location</span>
            <span>📍 Attraction</span>
            <span>🏨 Hotel</span>
            <span>🍽️ Restaurant</span>
            <span>⛽ Fuel</span>
            <span>🏥 Hospital</span>
            <span>🛡️ Police</span>
          </div>
        </div>

        {/* LEAFLET MAP CONTAINER */}
        <div style={{ height: "480px", width: "100%" }}>
          <MapContainer
            center={userLocation}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapRecenter center={userLocation} zoom={mapZoom} />


            <Circle
              center={userLocation}
              radius={maxRadiusKm * 1000}
              pathOptions={{
                color: "#0284c7",
                fillColor: "#0284c7",
                fillOpacity: 0.08,
                weight: 2.5,
                dashArray: "6, 6",
              }}
            />

            {/* USER LOCATION MARKER */}
            <Marker position={userLocation} icon={userGpsIcon}>
              <Popup>
                <div className="p-1 text-center">
                  <strong className="text-sky-900 text-sm">📍 Your Selected Center</strong>
                  <p className="mt-0.5 text-xs text-slate-600">{locationName}</p>
                  <span className="mt-1 inline-block rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                    Radius: {maxRadiusKm} km Zone
                  </span>
                </div>
              </Popup>
            </Marker>

            {/* NEARBY PLACES MARKERS */}
            {nearbyPlaces.map((item) => (
              <Marker
                key={item.id}
                position={item.position}
                icon={facilityLogos[item.category] || destPinIcon}
              >
                <Popup>
                  <div className="p-1 text-center min-w-[170px] max-w-[210px]">
                    <div className="mb-2 h-24 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-2xs">
                      <img
                        src={item.image || `/images/Nearby facilities/${item.name}.jpg`}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          if (e.target && e.target.parentElement) {
                            e.target.parentElement.style.display = "none";
                          }
                        }}
                      />
                    </div>
                    <strong className="text-slate-900 text-sm line-clamp-1">{item.name}</strong><br />
                    <span className="mt-0.5 inline-block rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200">
                      {item.subCategory}
                    </span>
                    <p className="mt-1 text-xs font-bold text-emerald-700">
                      📍 {item.distKm.toFixed(1)} km from you
                    </p>
                    {item.phone !== "N/A" && (
                      <p className="mt-0.5 text-xs text-slate-600">📞 {item.phone}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* CATEGORY & SEARCH FILTERS */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* CATEGORY PILLS */}
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Attraction", "Hotel", "Restaurant", "Fuel Station", "Medical", "Police"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-sm dark:bg-teal-600 dark:text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {cat === "All" && "✨ All"}
              {cat === "Attraction" && "📍 Attractions"}
              {cat === "Hotel" && "🏨 Hotels"}
              {cat === "Restaurant" && "🍽️ Dining"}
              {cat === "Fuel Station" && "⛽ Fuel"}
              {cat === "Medical" && "🏥 Hospitals"}
              {cat === "Police" && "🛡️ Police"}
            </button>
          ))}
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nearby places..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:border-sky-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* RESULTS GRID SUMMARY */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Showing <span className="font-extrabold text-sky-700 dark:text-sky-400">{nearbyPlaces.length}</span> places within{" "}
          <span className="font-bold text-slate-900 dark:text-white">{maxRadiusKm}km</span> of your location
        </p>
        <span className="text-xs text-slate-400 dark:text-slate-500">Sorted by closest distance</span>
      </div>

      {/* PLACES CARDS GRID */}
      {nearbyPlaces.length > 0 ? (
        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {nearbyPlaces.map((place) => (
            <article
              key={place.id}
              className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-2xs transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-900 dark:border-slate-800 ${
                place.isExplorePlace
                  ? "border-teal-300 ring-2 ring-teal-500/20 dark:border-teal-700/50"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {(() => {
                const status = getOpeningStatus(place.openingHours || "08:00 AM - 08:00 PM", place.openingDays || "Monday - Sunday");
                const gmapsUrl = getGoogleMapsUrl(place.name, place.location, place.googleMapsUrl);
                return (
                  <>
                    <div>
                      {/* THUMBNAIL IMAGE BANNER */}
                      <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={place.image || `/images/Nearby facilities/${place.name}.jpg`}
                          alt={place.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.target.src = `/images/Nearby facilities/${place.name}.jpg`;
                          }}
                        />
                        
                        {/* OVERLAY BADGES */}
                        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1 z-10">
                          {place.isExplorePlace && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-700/90 px-2.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-xs shadow-xs">
                              🌄 Explore
                            </span>
                          )}
                          <span className="inline-block rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                            {place.subCategory}
                          </span>
                        </div>

                        {/* DISTANCE & STATUS BADGES */}
                        <div className="absolute right-2.5 top-2.5 z-10 flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 shadow-xs backdrop-blur-xs border border-emerald-200 dark:bg-slate-900/90 dark:text-emerald-400 dark:border-emerald-800/50">
                            <MapPin size={10} />
                            {place.distKm.toFixed(1)} km
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold shadow-xs backdrop-blur-xs border ${status.badgeBg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {status.statusText}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5">
                        <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 dark:text-white" title={place.name}>
                          {place.name}
                        </h3>

                        {/* OPENING HOURS */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          <Clock size={12} className="text-teal-600 dark:text-teal-400 shrink-0" />
                          <span className="line-clamp-1">{place.openingHours || "08:00 AM - 08:00 PM"} ({place.openingDays || "Mon-Sun"})</span>
                        </div>

                        {(place.reviews > 0 || place.rating > 0) && (
                          <div className="mt-1.5">
                            <Link
                              to={`/place/${place.id || place._id}#reviews`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                              title="View reviews and ratings"
                            >
                              <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                              <span>{place.rating ? Number(place.rating).toFixed(1) : "0.0"}</span>
                              <span className="text-slate-400 dark:text-slate-500 font-normal">({place.reviews})</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CARD ACTIONS */}
                    <div className="px-3.5 pb-3.5 pt-0 flex items-center justify-between gap-1.5">
                      <Link
                        to={`/map?lat=${place.position[0]}&lng=${place.position[1]}&name=${encodeURIComponent(place.name)}`}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <Compass size={13} /> View Map
                      </Link>

                      {place.phone !== "N/A" && (
                        <a
                          href={`tel:${place.phone}`}
                          className="inline-flex items-center justify-center gap-1 rounded-xl bg-teal-700 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
                        >
                          <Phone size={13} /> Call
                        </a>
                      )}
                    </div>
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:bg-slate-900 dark:border-slate-800">
          <MapPin size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">No Places Found Within {maxRadiusKm}km</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try increasing your search radius or selecting a different location above.</p>
          <button
            onClick={() => setMaxRadiusKm(15.0)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700"
          >
            Expand Radius to 15 km
          </button>
        </div>
      )}

    </div>
  );
}

export default NearbyFacilities;