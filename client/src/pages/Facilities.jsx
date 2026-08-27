import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Hotel,
  Utensils,
  Fuel,
  ShieldCheck,
  Stethoscope,
  Compass,
  TentTree,
  Bike,
  Bus,
  Search,
  MapPin,
  Phone,
  Star,
  Clock,
  Navigation,
} from "lucide-react";

const facilities = [
  // HOTELS (Bandarawela, Haputale, Diyatalawa, Ella)
  {
    id: 1,
    name: "Bandarawela Heritage Hotel",
    type: "Hotel",
    location: "Main Street, Bandarawela",
    rating: 4.5,
    reviews: 512,
    phone: "+94 57 222 2501",
    description: "Colonial-style heritage hotel in the center of Bandarawela town.",
    image: "/images/Nearby facilities/Bandarawela Heritage Hotel.jpg",
    icon: Hotel,
    lat: 6.8315,
    lng: 80.9880,
  },
  {
    id: 2,
    name: "Orient Hotel Bandarawela",
    type: "Hotel",
    location: "Diyatalawa Road, Bandarawela",
    rating: 4.3,
    reviews: 380,
    phone: "+94 57 222 2407",
    description: "Comfortable city hotel close to Bandarawela bus stand.",
    image: "/images/Nearby facilities/Orient Hotel Bandarawela.jpg",
    icon: Hotel,
    lat: 6.8285,
    lng: 80.9850,
  },
  {
    id: 3,
    name: "Melheim Resort & Spa",
    type: "Hotel",
    location: "Beragala Road, Haputale",
    rating: 4.7,
    reviews: 840,
    phone: "+94 57 226 8000",
    description: "Luxury hillside resort offering panoramic views of southern plains from Haputale.",
    image: "/images/Nearby facilities/Melheim Resort & Spa.jpg",
    icon: Hotel,
    lat: 6.7680,
    lng: 80.9420,
  },
  {
    id: 4,
    name: "Olympus Plaza Hotel",
    type: "Hotel",
    location: "Station Road, Haputale",
    rating: 4.2,
    reviews: 410,
    phone: "+94 57 226 8200",
    description: "Scenic hotel located near Haputale railway station.",
    image: "/images/Nearby facilities/Olympus Plaza Hotel.jpg",
    icon: Hotel,
    lat: 6.7685,
    lng: 80.9580,
  },
  {
    id: 5,
    name: "Diyatalawa Heritage Bungalow",
    type: "Hotel",
    location: "Garrison Town, Diyatalawa",
    rating: 4.6,
    reviews: 215,
    phone: "+94 57 222 9100",
    description: "Charming bungalow in the cool climate of Diyatalawa military town.",
    image: "/images/Nearby facilities/Diyatalawa Heritage Bungalow.jpg",
    icon: Hotel,
    lat: 6.8120,
    lng: 80.9580,
  },
  {
    id: 6,
    name: "EKHO Ella",
    type: "Hotel",
    location: "Ella Town",
    rating: 4.6,
    reviews: 656,
    phone: "+94 57 222 8655",
    description: "Hotel accommodation in the heart of the Ella area.",
    image: "/images/Nearby facilities/EKHO Ella.jpg",
    icon: Hotel,
    lat: 6.8710,
    lng: 81.0490,
  },
  {
    id: 7,
    name: "Morning Dew Hotel",
    type: "Hotel",
    location: "Wamullahena, Ella",
    rating: 4.3,
    reviews: 632,
    phone: "+94 57 493 3373",
    description: "Comfortable accommodation with easy access to Ella attractions.",
    image: "/images/Nearby facilities/Morning Dew Hotel.jpg",
    icon: Hotel,
    lat: 6.8725,
    lng: 81.0475,
  },

  // RESTAURANTS (Bandarawela, Haputale, Welimada, Ella)
  {
    id: 8,
    name: "Bandarawela Rest House Dining",
    type: "Restaurant",
    location: "Rest House Road, Bandarawela",
    rating: 4.4,
    reviews: 420,
    phone: "+94 57 222 2201",
    description: "Traditional Sri Lankan and Western meals in historic Bandarawela.",
    image: "/images/Nearby facilities/Bandarawela Rest House Dining.jpg",
    icon: Utensils,
    lat: 6.8305,
    lng: 80.9865,
  },
  {
    id: 9,
    name: "Misty Mountain Cafe Haputale",
    type: "Restaurant",
    location: "Main Street, Haputale",
    rating: 4.5,
    reviews: 580,
    phone: "+94 57 226 8110",
    description: "Popular local cafe overlooking the Haputale mist gap.",
    image: "/images/Nearby facilities/Misty Mountain Cafe Haputale.jpg",
    icon: Utensils,
    lat: 6.7682,
    lng: 80.9570,
  },
  {
    id: 10,
    name: "Risara Bakers & Restaurant",
    type: "Restaurant",
    location: "Station Road, Haputale",
    rating: 4.3,
    reviews: 310,
    phone: "+94 57 226 8050",
    description: "Fresh pastries, rice & curry, and hot tea in Haputale.",
    image: "/images/Nearby facilities/Risara Bakers & Restaurant.jpg",
    icon: Utensils,
    lat: 6.7675,
    lng: 80.9565,
  },
  {
    id: 11,
    name: "Welimada Family Restaurant",
    type: "Restaurant",
    location: "Nuwara Eliya Road, Welimada",
    rating: 4.2,
    reviews: 290,
    phone: "+94 57 224 5100",
    description: "Spacious restaurant serving hill country cuisine in Welimada.",
    image: "/images/Nearby facilities/Welimada Family Restaurant.jpg",
    icon: Utensils,
    lat: 6.9020,
    lng: 80.9160,
  },
  {
    id: 12,
    name: "360 Ella",
    type: "Restaurant",
    location: "Main Street, Ella",
    rating: 4.6,
    reviews: 6361,
    phone: "+94 76 288 7480",
    description: "Popular restaurant serving food in central Ella.",
    image: "/images/Nearby facilities/360 Ella.jpg",
    icon: Utensils,
    lat: 6.8712,
    lng: 81.0488,
  },
  {
    id: 13,
    name: "Cafe Chill",
    type: "Restaurant",
    location: "Main Street, Ella",
    rating: 4.5,
    reviews: 12184,
    phone: "+94 77 180 4020",
    description: "Popular restaurant and café in Ella town.",
    image: "/images/Nearby facilities/Cafe Chill.jpg",
    icon: Utensils,
    lat: 6.8708,
    lng: 81.0492,
  },

  // FUEL STATIONS (Bandarawela, Haputale, Diyatalawa, Welimada, Halpe)
  {
    id: 14,
    name: "Ceypetco Central Station Bandarawela",
    type: "Fuel Station",
    location: "Main Street, Bandarawela",
    rating: 4.4,
    reviews: 512,
    phone: "+94 57 222 2234",
    description: "24/7 central filling station serving petrol and diesel in Bandarawela.",
    image: "/images/Nearby facilities/Ceypetco Central Station Bandarawela.jpg",
    icon: Fuel,
    lat: 6.8320,
    lng: 80.9860,
  },
  {
    id: 15,
    name: "LIOC Fuel Station Bandarawela",
    type: "Fuel Station",
    location: "Badulla Road, Bandarawela",
    rating: 4.3,
    reviews: 320,
    phone: "+94 57 222 2890",
    description: "Lanka IOC fuel station located on the Badulla road.",
    image: "/images/Nearby facilities/LIOC Fuel Station Bandarawela.jpg",
    icon: Fuel,
    lat: 6.8340,
    lng: 80.9910,
  },
  {
    id: 16,
    name: "Ceypetco Filling Station Haputale",
    type: "Fuel Station",
    location: "Badulla Road, Haputale",
    rating: 4.2,
    reviews: 210,
    phone: "+94 57 226 8020",
    description: "Fuel station conveniently serving travellers in Haputale.",
    image: "/images/Nearby facilities/Ceypetco Filling Station Haputale.jpg",
    icon: Fuel,
    lat: 6.7670,
    lng: 80.9560,
  },
  {
    id: 17,
    name: "Diyatalawa Fuel Station",
    type: "Fuel Station",
    location: "Main Road, Diyatalawa",
    rating: 4.3,
    reviews: 180,
    phone: "+94 57 222 9050",
    description: "Fuel station in Diyatalawa town.",
    image: "/images/Nearby facilities/Diyatalawa Fuel Station.jpg",
    icon: Fuel,
    lat: 6.8140,
    lng: 80.9610,
  },
  {
    id: 18,
    name: "Welimada Ceypetco Station",
    type: "Fuel Station",
    location: "Badulla Road, Welimada",
    rating: 4.2,
    reviews: 240,
    phone: "+94 57 224 5020",
    description: "Fuel station serving Welimada agricultural and tourist traffic.",
    image: "/images/Nearby facilities/Welimada Ceypetco Station.jpg",
    icon: Fuel,
    lat: 6.9030,
    lng: 80.9170,
  },
  {
    id: 19,
    name: "Hela Halpe Filling Station",
    type: "Fuel Station",
    location: "Halpe, Badulla Road",
    rating: 4.3,
    reviews: 195,
    phone: "+94 57 205 0825",
    description: "Fuel station between Bandarawela and Ella.",
    image: "/images/Nearby facilities/Hela Halpe Filling Station.jpg",
    icon: Fuel,
    lat: 6.8890,
    lng: 81.0110,
  },

  // HOSPITALS & MEDICAL (Bandarawela, Haputale, Diyatalawa, Welimada, Ella)
  {
    id: 20,
    name: "Bandarawela District Base Hospital",
    type: "Medical",
    location: "Hospital Road, Bandarawela",
    rating: 4.5,
    reviews: 430,
    phone: "+94 57 222 2261",
    description: "Primary government district hospital in Bandarawela with emergency care.",
    image: "/images/Nearby facilities/Bandarawela District Base Hospital.jpg",
    icon: Stethoscope,
    lat: 6.8335,
    lng: 80.9890,
  },
  {
    id: 21,
    name: "Haputale Base Hospital",
    type: "Medical",
    location: "Hospital Road, Haputale",
    rating: 4.3,
    reviews: 190,
    phone: "+94 57 226 8061",
    description: "Divisional hospital providing medical services in Haputale.",
    image: "/images/Nearby facilities/Haputale Base Hospital.jpg",
    icon: Stethoscope,
    lat: 6.7690,
    lng: 80.9590,
  },
  {
    id: 22,
    name: "Diyatalawa Army & Base Hospital",
    type: "Medical",
    location: "Base Road, Diyatalawa",
    rating: 4.7,
    reviews: 350,
    phone: "+94 57 222 9061",
    description: "Major regional hospital facility located in Diyatalawa.",
    image: "/images/Nearby facilities/Diyatalawa Army & Base Hospital.jpg",
    icon: Stethoscope,
    lat: 6.8150,
    lng: 80.9560,
  },
  {
    id: 23,
    name: "Welimada Divisional Hospital",
    type: "Medical",
    location: "Hospital Road, Welimada",
    rating: 4.2,
    reviews: 210,
    phone: "+94 57 224 5061",
    description: "Divisional healthcare center serving Welimada region.",
    image: "/images/Nearby facilities/Welimada Divisional Hospital.jpg",
    icon: Stethoscope,
    lat: 6.9040,
    lng: 80.9140,
  },
  {
    id: 24,
    name: "IMC MED Hospital Ella",
    type: "Medical",
    location: "Ella - Passara Road",
    rating: 4.8,
    reviews: 107,
    phone: "+94 71 923 0000",
    description: "Medical facility serving visitors and residents in Ella.",
    image: "/images/Nearby facilities/IMC MED Hospital Ella.jpg",
    icon: Stethoscope,
    lat: 6.8740,
    lng: 81.0485,
  },

  // POLICE STATIONS (Bandarawela, Haputale, Diyatalawa, Welimada, Ella)
  {
    id: 25,
    name: "Bandarawela Division Police Station",
    type: "Police",
    location: "Main Street, Bandarawela",
    rating: 4.4,
    reviews: 180,
    phone: "+94 57 222 2222",
    description: "Headquarters divisional police station in Bandarawela.",
    image: "/images/Nearby facilities/Bandarawela Division Police Station.jpg",
    icon: ShieldCheck,
    lat: 6.8310,
    lng: 80.9855,
  },
  {
    id: 26,
    name: "Haputale Police Station",
    type: "Police",
    location: "Station Road, Haputale",
    rating: 4.1,
    reviews: 85,
    phone: "+94 57 226 8222",
    description: "Police station serving Haputale town and surrounding estates.",
    image: "/images/Nearby facilities/Haputale Police Station.jpg",
    icon: ShieldCheck,
    lat: 6.7675,
    lng: 80.9585,
  },
  {
    id: 27,
    name: "Diyatalawa Police Station",
    type: "Police",
    location: "Main Road, Diyatalawa",
    rating: 4.3,
    reviews: 92,
    phone: "+94 57 222 9222",
    description: "Police station serving Diyatalawa garrison town.",
    image: "/images/Nearby facilities/Diyatalawa Police Station.jpg",
    icon: ShieldCheck,
    lat: 6.8130,
    lng: 80.9595,
  },
  {
    id: 28,
    name: "Welimada Police Station",
    type: "Police",
    location: "Police Road, Welimada",
    rating: 4.0,
    reviews: 74,
    phone: "+94 57 224 5222",
    description: "Local police station serving Welimada district.",
    image: "/images/Nearby facilities/Welimada Police Station.jpg",
    icon: ShieldCheck,
    lat: 6.9015,
    lng: 80.9150,
  },
  {
    id: 29,
    name: "Ella Police Station",
    type: "Police",
    location: "Police Station Road, Ella",
    rating: 4.2,
    reviews: 115,
    phone: "+94 57 222 8522",
    description: "Local police station serving the Ella area.",
    image: "/images/Nearby facilities/Ella Police Station.jpg",
    icon: ShieldCheck,
    lat: 6.8735,
    lng: 81.0472,
  },
  {
    id: 30,
    name: "Scan Alpine Camping Store",
    type: "Camping",
    location: "Ella",
    rating: 4.7,
    reviews: 60,
    phone: "+94 57 223 5107",
    description: "Camping and outdoor equipment store.",
    image: "/images/Nearby facilities/Scan Alpine Camping Store.jpg",
    icon: TentTree,
    lat: 6.8720,
    lng: 81.0480,
  },
  {
    id: 31,
    name: "Peak Point Camping",
    type: "Camping",
    location: "Kanupalalla",
    rating: 5.0,
    reviews: 12,
    phone: "+94 70 588 9291",
    description: "Tent rental service for outdoor activities.",
    image: "/images/Nearby facilities/Peak Point Camping.jpg",
    icon: TentTree,
    lat: 6.8550,
    lng: 81.0580,
  },

  // BIKE RENTAL
  {
    id: 32,
    name: "Ella Scooter Rental EllaBike",
    type: "Bike Rental",
    location: "Wellawaya-Ella-Kumbalwela Highway",
    rating: 4.8,
    reviews: 248,
    phone: "+94 77 911 1161",
    description: "Scooter rental service for exploring Ella and surrounding areas.",
    image: "/images/Nearby facilities/Ella Scooter Rental EllaBike.jpg",
    icon: Bike,
    lat: 6.8700,
    lng: 81.0490,
  },
  {
    id: 33,
    name: "Scooter Rental 4U Ella Bikes",
    type: "Bike Rental",
    location: "Main Street, Ella",
    rating: 4.9,
    reviews: 176,
    phone: "+94 71 546 1710",
    description: "Scooter rental service located in central Ella.",
    image: "/images/Nearby facilities/Scooter Rental 4U Ella Bikes.jpg",
    icon: Bike,
    lat: 6.8718,
    lng: 81.0482,
  },
];

const categories = [
  { name: "All", icon: Compass },
  { name: "Hotel", icon: Hotel },
  { name: "Restaurant", icon: Utensils },
  { name: "Fuel Station", icon: Fuel },
  { name: "Medical", icon: Stethoscope },
  { name: "Police", icon: ShieldCheck },
  { name: "Tour Guide", icon: Compass },
  { name: "Camping", icon: TentTree },
  { name: "Bike Rental", icon: Bike },
];

function Facilities({ defaultCategory }) {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const catFromUrl = searchParams.get("category");
  const [category, setCategory] = useState(catFromUrl || defaultCategory || "All");
  const [search, setSearch] = useState(queryParam);
  const navigate = useNavigate();

  useEffect(() => {
    setSearch(queryParam);
    const cat = searchParams.get("category") || defaultCategory;
    if (cat) {
      setCategory(cat);
    }
  }, [queryParam, searchParams, defaultCategory]);

  const filteredFacilities = facilities.filter((facility) => {
    const matchesCategory =
      category === "All" || facility.type === category;

    const text =
      `${facility.name} ${facility.location} ${facility.type}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl dark:text-white">
          Facilities & Services
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Find useful services near tourist destinations across Uva.
        </p>
      </div>

      {/* Search */}
      <div className="mt-8 flex max-w-3xl items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <Search size={20} className="text-slate-400 dark:text-slate-500" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search hotels, restaurants, fuel, medical..."
          className="w-full bg-transparent px-4 py-4 text-sm outline-none dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      {/* Categories */}
      <div className="mt-6 flex flex-wrap gap-3">
        {categories.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => setCategory(item.name)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                category === item.name
                  ? "bg-teal-700 text-white shadow-sm dark:bg-teal-600 dark:text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} />
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div className="mt-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {filteredFacilities.length}
          </span>{" "}
          facilities
        </p>
      </div>

      {/* Cards */}
      {filteredFacilities.length > 0 ? (
        <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredFacilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              navigate={navigate}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center dark:bg-slate-900 dark:border-slate-800">
          <Search
            size={40}
            className="mx-auto text-slate-300 dark:text-slate-600"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-200">
            No facilities found
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Try another search or category.
          </p>
        </div>
      )}
    </div>
  );
}

function getFallbackImageForFacility(facility) {
  if (facility.image) return facility.image;
  if (facility.name) return `/images/Nearby facilities/${facility.name}.jpg`;
  return "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80";
}

function FacilityCard({ facility, navigate }) {
  const Icon = facility.icon || Compass;

  const handleViewMap = () => {
    navigate(
      `/map?lat=${facility.lat}&lng=${facility.lng}&name=${encodeURIComponent(
        facility.name
      )}&category=${encodeURIComponent(facility.type)}`
    );
  };

  return (
    <article className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-900 dark:border-slate-800">
      <div>
        {/* TOP IMAGE BANNER WITH OVERLAY BADGES */}
        <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={getFallbackImageForFacility(facility)}
            alt={facility.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80";
            }}
          />

          {/* OVERLAY ICON BADGE */}
          <div className="absolute left-2.5 top-2.5 z-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-teal-700 shadow-xs backdrop-blur-xs dark:bg-slate-900/90 dark:text-teal-400">
              <Icon size={16} />
            </div>
          </div>

          {/* OVERLAY TYPE BADGE */}
          <div className="absolute right-2.5 top-2.5 z-10">
            <span className="rounded-full bg-slate-900/85 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs shadow-xs">
              {facility.type}
            </span>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-3.5">
          <h2 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-1 dark:text-white" title={facility.name}>
            {facility.name}
          </h2>

          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <MapPin size={12} className="text-teal-600 shrink-0 dark:text-teal-400" />
            <span className="truncate">{facility.location}</span>
          </p>

          {/* Rating */}
          {facility.rating > 0 && (
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-bold">{facility.rating}</span>
              <span className="text-slate-400 dark:text-slate-500">({facility.reviews})</span>
            </div>
          )}

          <p className="mt-2 text-[11px] leading-snug text-slate-500 line-clamp-2 dark:text-slate-400">
            {facility.description}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-3.5 pb-3.5 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={handleViewMap}
          className="rounded-xl border border-slate-200 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          View Map
        </button>

        <a
          href={`tel:${facility.phone}`}
          className="flex items-center justify-center gap-1 rounded-xl bg-teal-700 py-1.5 text-[11px] font-bold text-white transition hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
        >
          <Phone size={13} />
          Call
        </a>
      </div>
    </article>
  );
}

export default Facilities;