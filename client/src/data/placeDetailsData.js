/* =========================================================================
   PLACE DETAILS EXTRA DATA: Ticket Prices & Facilities
   Structured research data for destinations in Uva Province, Sri Lanka
========================================================================= */

/**
 * Ticket Prices Data
 * ONLY for:
 * 1. Lipton's Seat
 * 2. Little Adam's Peak
 * 3. Adisham Bungalow
 * 4. Porowagala Viewpoint
 * 5. Halpewatte Tea Factory / Tea Tour
 */
export const TICKET_PRICES_DATA = {
  lipton: {
    id: "lipton",
    name: "Lipton's Seat",
    isFree: false,
    badgeText: "Ticket Required at Gate",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300",
    foreignAdult: "LKR 550 (~$1.80 USD)",
    localAdult: "LKR 100",
    vehicleFee: "Tuk-Tuk: LKR 100 | Car/Van: LKR 250",
    paymentMethods: "Cash Only (Paid at Dambatenne Estate Gate)",
    freeFor: "Children under 6 years",
    openingInfo: "Open Daily 05:30 AM - 05:00 PM (Best before 09:00 AM)",
    notes: "The entry ticket counter is situated at the Dambatenne Tea Estate gate (~1.5 km before the summit). Visitors can walk up or take a local tuk-tuk from the gate.",
    passes: [
      { type: "Foreign Visitor Ticket", price: "LKR 550", desc: "Per foreign adult entry to Dambatenne estate viewpoint" },
      { type: "Local Resident Ticket", price: "LKR 100", desc: "Per Sri Lankan resident entry" },
      { type: "Tuk-Tuk Estate Gate Toll", price: "LKR 100", desc: "Vehicle access fee at Dambatenne gate" },
      { type: "Car / Van Toll", price: "LKR 250", desc: "Vehicle access fee at estate gate" },
    ]
  },
  littleadam: {
    id: "littleadam",
    name: "Little Adam's Peak",
    isFree: true,
    badgeText: "Free Public Entry",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300",
    foreignAdult: "FREE (LKR 0)",
    localAdult: "FREE (LKR 0)",
    vehicleFee: "Free Parking at Trailhead",
    paymentMethods: "Free Access / Cash & Cards for Adventure Rides",
    freeFor: "All Visitors (Public Trail)",
    openingInfo: "Open 24/7 (Best early morning or sunset)",
    notes: "Hiking to the summit of Little Adam's Peak is 100% FREE. Optional adventure activities at Flying Ravana (Zipline, ATV, Abseiling) located at the base have separate ticket fees.",
    passes: [
      { type: "Summit Hike & Public Trail", price: "FREE", desc: "Open access public trail & 360° viewpoint deck" },
      { type: "Flying Ravana Mega Zipline (Optional)", price: "~$25 USD (LKR 7,500)", desc: "Dual mega zipline across Ella valley" },
      { type: "ATV Off-Road Quad Bike (Optional)", price: "~$25 USD (LKR 7,500)", desc: "Guided quad bike adventure track" },
      { type: "Abseiling & Climbing Wall (Optional)", price: "~$15 USD (LKR 4,500)", desc: "Outdoor adventure climbing wall experience" },
    ]
  },
  adisham: {
    id: "adisham",
    name: "Adisham Bungalow",
    isFree: false,
    badgeText: "Ticket Required",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300",
    foreignAdult: "LKR 500 (~$1.65 USD)",
    localAdult: "LKR 250 (Adults) / LKR 100 (Children)",
    vehicleFee: "Free Parking inside Monastery Grounds",
    paymentMethods: "Cash Only at Entrance Counter",
    freeFor: "Monastery Monks & Religious Clergy",
    openingInfo: "Open Weekends (Sat & Sun), Public/Poya Holidays, & School Vacations (09:00 AM - 04:30 PM)",
    notes: "Adisham is a working Benedictine monastery. Open to the public on weekends, public holidays, and school vacations only. Photography inside the bungalow interior is strictly prohibited.",
    passes: [
      { type: "Foreign Adult Ticket", price: "LKR 500", desc: "Full entry pass to monastery gardens & historical rooms" },
      { type: "Local Adult Ticket", price: "LKR 250", desc: "Sri Lankan resident adult entry pass" },
      { type: "Local Child Ticket", price: "LKR 100", desc: "Resident child entry pass (under 12 years)" },
    ]
  },
  porowagala: {
    id: "porowagala",
    name: "Porowagala Viewpoint",
    isFree: true,
    badgeText: "Free Public Entry",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300",
    foreignAdult: "FREE (LKR 0)",
    localAdult: "FREE (LKR 0)",
    vehicleFee: "Free Roadside & Cliffside Parking",
    paymentMethods: "Free Public Access",
    freeFor: "All Visitors",
    openingInfo: "Open 24 Hours",
    notes: "Porowagala Viewpoint in Bandarawela is a publicly accessible natural cliff lookout point. No entry ticket or permit is required.",
    passes: [
      { type: "Public Viewpoint Access", price: "FREE", desc: "Unrestricted access to panoramic cliff viewpoint over Bandarawela & Kinigama" },
    ]
  },
  halpewatte: {
    id: "halpewatte",
    name: "Halpewatte Tea Factory",
    isFree: false,
    badgeText: "Ticket Required",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300",
    foreignAdult: "LKR 3,000 (~$10 USD)",
    localAdult: "LKR 1,500",
    vehicleFee: "Free Factory Parking Lot",
    paymentMethods: "Cash & Credit Cards (at Rooftop Sky Cafe)",
    freeFor: "Children under 5 years",
    openingInfo: "Open Daily 08:00 AM - 04:30 PM",
    notes: "Factory tours operate daily. Tickets are purchased at the rooftop Sky Cafe and include a guided walkthrough of the tea manufacturing process and a tea tasting flight.",
    passes: [
      { type: "Factory Tour & Tasting (Foreign)", price: "LKR 3,000 (~$10 USD)", desc: "Guided tea processing walkthrough & tea tasting" },
      { type: "Factory Tour & Tasting (Local)", price: "LKR 1,500", desc: "Resident factory tour & tea tasting pass" },
      { type: "Handmade Tea Masterclass (Optional)", price: "~$30 USD (LKR 9,000)", desc: "Interactive hand-rolling tea workshop & souvenir gift" },
    ]
  }
};

/**
 * Returns ticket information if the place matches one of the 5 allowed places.
 * Returns null otherwise.
 */
export function getTicketInfo(placeName, customTicketInfo = null) {
  if (customTicketInfo && customTicketInfo.hasTicket) {
    return customTicketInfo;
  }
  if (!placeName || typeof placeName !== "string") return null;
  const nameLower = placeName.toLowerCase().trim();

  if (nameLower.includes("lipton")) return TICKET_PRICES_DATA.lipton;
  if (nameLower.includes("little adam") || nameLower.includes("adam's peak") || nameLower.includes("adams peak")) return TICKET_PRICES_DATA.littleadam;
  if (nameLower.includes("adisham")) return TICKET_PRICES_DATA.adisham;
  if (nameLower.includes("porowagala") || nameLower.includes("porowagala")) return TICKET_PRICES_DATA.porowagala;
  if (nameLower.includes("halpewatte") || nameLower.includes("halpe")) return TICKET_PRICES_DATA.halpewatte;

  return null;
}

/**
 * Facilities & Amenities Data for ALL places
 */
export const FACILITIES_DATA = {
  lipton: {
    parking: [
      { text: "Dedicated Estate Parking Gate (Dambatenne)", status: "Estate Access Toll" },
      { text: "Tuk-Tuk Bay at Summit Viewpoint", status: "Limited Summit Space" },
      { text: "Vehicle Access Toll: Tuk-Tuk LKR 100 / Car LKR 250", status: "At Gate" }
    ],
    transport: [
      { text: "Tuk-Tuk Ride from Haputale Town (approx 45 mins)", status: "Recommended" },
      { text: "Scenic Tea Plantation Trek (7 km from Dambatenne Factory)", status: "Hiking Path" },
      { text: "Public Bus from Haputale to Dambatenne Tea Factory", status: "Regular Route" }
    ],
    foodBeverage: [
      { text: "Historic Lipton Summit Tea Shop (Hot Ceylon Tea & Samosas)", status: "On-Site Cafe" },
      { text: "Fresh King Coconut & Local Fruit Stalls along trail", status: "Along Trail" },
      { text: "Packaged Snacks & Bottled Water Counter", status: "Available" }
    ],
    utilities: [
      { text: "Clean Public Restroom at Summit Tea Shop", status: "Available" },
      { text: "Sheltered Viewpoint Gazebos & Benches", status: "Rest Area" },
      { text: "Good 4G Cellular & Mobile Signal Coverage", status: "Dialog / Mobitel" },
      { text: "Eco Litter Bins along viewpoint perimeter", status: "Waste Bins" }
    ],
    other: [
      { text: "360° Panoramic Viewpoint Platform & Photo Decks", status: "Highlight" },
      { text: "Fresh Dambatenne Ceylon Tea Pack Sales Counter", status: "Gift Shop" },
      { text: "Famous Early Morning Sunrise Viewing Spot", status: "Best at 6-9 AM" }
    ]
  },
  littleadam: {
    parking: [
      { text: "Free Car & Motorcycle Parking Lot at Trailhead", status: "Free Parking" },
      { text: "Tuk-Tuk Stand near Ella-Passara Road Entrance", status: "Available" }
    ],
    transport: [
      { text: "5-min Tuk-Tuk ride from Ella Railway Station", status: "Easy Access" },
      { text: "Paved Footpath & 350+ Stone Steps to Summit", status: "Family Hike" },
      { text: "Public Bus Stop directly at Passara Road Junction", status: "Bus Stop" }
    ],
    foodBeverage: [
      { text: "Ravana Pool Club & Restaurant at Trailhead", status: "Dining & Bar" },
      { text: "Fresh Fruit, Smoothie & King Coconut Kiosks", status: "Along Trail" },
      { text: "Ella Flower Garden Restaurant near base", status: "Full Meals" }
    ],
    utilities: [
      { text: "Clean Restrooms at Flying Ravana Adventure Center", status: "Base Restrooms" },
      { text: "Rest Huts & Shaded Benches along stair trail", status: "Rest Stops" },
      { text: "Strong 4G Mobile & Internet Coverage", status: "High Speed" },
      { text: "Eco Trash Sorting Bins on summit path", status: "Clean Trail" }
    ],
    other: [
      { text: "Flying Ravana Mega Zipline & Adventure Park", status: "Optional Sport" },
      { text: "Instagram Photo Swing & Panoramic Ridge Spots", status: "Photo Points" },
      { text: "Pet-Friendly Hiking Trail", status: "Allowed" }
    ]
  },
  adisham: {
    parking: [
      { text: "Spacious Visitor Vehicle Parking Grounds", status: "Free On-Site" },
      { text: "Separate Parking Bay for Tour Buses & Vans", status: "Available" }
    ],
    transport: [
      { text: "15-min Tuk-Tuk ride from Haputale Town / Railway Station", status: "Easy Access" },
      { text: "Narrow Tarred Mountain Road through Tangamalai Forest", status: "Scenic Drive" },
      { text: "Hiking Trail through Forest Reserve from Haputale", status: "Nature Walk" }
    ],
    foodBeverage: [
      { text: "Adisham Monastery Shop (Homemade Jam, Cordial & Chutney)", status: "Organic Shop" },
      { text: "Fresh Fruit Juice & Herbal Tea Kiosk", status: "Refreshments" }
    ],
    utilities: [
      { text: "Clean Visitor Restroom Facility near Main Gate", status: "Available" },
      { text: "Manicured English Lawns & Seating Benches", status: "Garden Lounge" },
      { text: "Litter Disposal Bins across grounds", status: "Maintained" },
      { text: "Fair Mobile Network Coverage", status: "Standard 4G" }
    ],
    other: [
      { text: "Historic Benedictine Monastery Museum & Library", status: "Heritage Site" },
      { text: "Orchards & Tangamalai Sanctuary Trailhead", status: "Nature Spot" },
      { text: "Strict Quiet Zone & Monastery Dress Code applies", status: "Monastery Rules" }
    ]
  },
  porowagala: {
    parking: [
      { text: "Free Cliffside Roadside Parking for Cars & Bikes", status: "Free Parking" },
      { text: "Tuk-Tuk Turning Circle & Parking Space", status: "Available" }
    ],
    transport: [
      { text: "3 km Drive from Bandarawela Town Center (10 mins)", status: "Direct Access" },
      { text: "Accessible by Car, Van, Scooter, or Tuk-Tuk", status: "Paved Road" },
      { text: "Local Bus Service to Kinigama Junction", status: "Nearby Stop" }
    ],
    foodBeverage: [
      { text: "Local Ceylon Tea Stall near viewpoint entrance", status: "Tea & Snacks" },
      { text: "Fresh Fruit & Seasonal Snack Vendors", status: "Roadside Kiosks" }
    ],
    utilities: [
      { text: "Sheltered Concrete Gazebo & Viewing Benches", status: "Rest Pavilion" },
      { text: "Strong 4G Cellular Signal (Dialog / Mobitel / Hutch)", status: "Full Coverage" },
      { text: "Waste Collection Bins near viewing area", status: "Maintained" }
    ],
    other: [
      { text: "Cliffside Panoramic Photography Deck over Bandarawela", status: "Scenic Deck" },
      { text: "Ideal Sunrise & Sunset Observation Point", status: "Photo Spot" },
      { text: "Quiet Scenic Picnic Area for Families & Travelers", status: "Relaxation" }
    ]
  },
  halpewatte: {
    parking: [
      { text: "Ample Dedicated Parking Lot for Cars, Vans & Buses", status: "Free Visitor Parking" },
      { text: "Covered Driver Waiting Area", status: "Available" }
    ],
    transport: [
      { text: "15-min Drive from Ella Town on Badulla-Ella Highway", status: "Highway Access" },
      { text: "Tuk-Tuk Service from Ella Station or Hotels", status: "Easy Transport" }
    ],
    foodBeverage: [
      { text: "Rooftop Sky Cafe (Gourmet Tea, Pastries & Snacks)", status: "Rooftop Dining" },
      { text: "Ceylon Tea Tasting Flight Counter", status: "Tasting Bar" }
    ],
    utilities: [
      { text: "Modern Clean Restrooms for Factory Guests", status: "Maintained" },
      { text: "Air-Conditioned Presentation Lounge & Audio Visual Room", status: "Comfortable" },
      { text: "Strong 4G Cellular & WiFi Coverage", status: "High Speed" },
      { text: "Wheelchair Ramp Access on Ground Level", status: "Accessible" }
    ],
    other: [
      { text: "Halpe Tea Souvenir Boutique (Pure Ceylon Tea Boxes)", status: "Gift Shop" },
      { text: "Live Tea Processing Walkthrough with Factory Guide", status: "Guided Tour" },
      { text: "Handmade Specialty Tea Masterclass Experience", status: "Workshop" }
    ]
  },
  ninearches: {
    parking: [
      { text: "Motorcycle / Scooter / Bike Parking Bay", status: "LKR 50" },
      { text: "Paid Car & Van Parking Lots at Gotuwala & Passara Road entrances", status: "LKR 200 - 300" },
      { text: "Tuk-Tuk Drop-off points close to bridge path", status: "Available" }
    ],
    transport: [
      { text: "15-min Forest Walk from Passara Road drop-off", status: "Walking Trail" },
      { text: "Tuk-Tuk Access down to bridge viewpoint base", status: "Rough Road" },
      { text: "Train Journey Access (Ella to Demodara route)", status: "Rail Connection" }
    ],
    foodBeverage: [
      { text: "Jungle View Cafes & Juice Bars overlooking bridge", status: "Panoramic Dining" },
      { text: "King Coconut & Fresh Fruit Sellers on bridge trail", status: "Refreshments" }
    ],
    utilities: [
      { text: "Basic Restrooms inside local cafes along path", status: "Cafe Access" },
      { text: "Wooden Viewpoint Benches & Terraces", status: "Photo Spot" },
      { text: "Good 4G Mobile Signal Coverage", status: "Dialog / Mobitel" },
      { text: "Waste Collection Bins along trail", status: "Clean Zone" }
    ],
    other: [
      { text: "Colonial Stone Viaduct Train Passing Photography", status: "Must See" },
      { text: "Tea Plantation Footpaths & Jungle Trekking", status: "Explore" },
      { text: "Handicraft & Local Souvenir Kiosks", status: "Gift Items" }
    ]
  },
  ellarock: {
    parking: [
      { text: "Parking Lots near Kithalella Railway Station / Ella Town", status: "Available" }
    ],
    transport: [
      { text: "3 to 4 Hour Mountain Hike along Rail Tracks & Forest", status: "Challenging Hike" },
      { text: "Local Guides Available at Kithalella Station", status: "Recommended" }
    ],
    foodBeverage: [
      { text: "Fruit & King Coconut Kiosks near trail base", status: "Base Trail" },
      { text: "Bring Your Own (BYO) Water & Trail Snacks", status: "Essential" }
    ],
    utilities: [
      { text: "Resting Spots under Eucalyptus Trees on summit", status: "Natural Shade" },
      { text: "Intermittent 4G Mobile Coverage on summit", status: "Variable" },
      { text: "Pack-It-In, Pack-It-Out Trash Policy", status: "Eco Trail" }
    ],
    other: [
      { text: "Dramatic Cliff Top Viewpoint facing Ella Gap", status: "Summit Vista" },
      { text: "Mist & Cloud Forest Landscape Photography", status: "Scenic Spot" }
    ]
  },
  ravanafall: {
    parking: [
      { text: "Roadside Parking Bays along Wellawaya-Ella Highway", status: "Free / Limited" }
    ],
    transport: [
      { text: "Direct Highway Access on Wellawaya Road (A23)", status: "Roadside Site" },
      { text: "10-min Tuk-Tuk ride from Ella Town", status: "Quick Access" }
    ],
    foodBeverage: [
      { text: "Boiled Corn & Roasted Peanuts Stalls", status: "Street Food" },
      { text: "King Coconut & Fresh Mango / Pineapple Sellers", status: "Fruit Stalls" }
    ],
    utilities: [
      { text: "Public Restrooms near highway bridge", status: "Available" },
      { text: "Concrete Viewing Bridge & Safety Barriers", status: "Observation" },
      { text: "Strong 4G Cellular Signal", status: "Full Coverage" }
    ],
    other: [
      { text: "25-meter Cascading Waterfall Photo Platform", status: "Iconic Site" },
      { text: "Local Handicrafts, Gems & Souvenir Stalls", status: "Marketplace" }
    ]
  },
  dowa: {
    parking: [
      { text: "Parking Bay directly outside temple entrance gate", status: "Free Parking" }
    ],
    transport: [
      { text: "Directly on A16 Badulla-Bandarawela Main Road", status: "Highway Stop" },
      { text: "Public Bus Stop right at entrance gate", status: "Bus Route" }
    ],
    foodBeverage: [
      { text: "Local Refreshment Shop opposite temple gate", status: "Tea & Water" }
    ],
    utilities: [
      { text: "Temple Visitor Restroom Facility", status: "Available" },
      { text: "Shaded Courtyard Resting Area", status: "Courtyard" },
      { text: "Strong 4G Mobile Signal", status: "Available" }
    ],
    other: [
      { text: "38-foot Rock Carved Buddha Statue & Prehistoric Cave", status: "Heritage Site" },
      { text: "Shoe Storage Counter at Entrance", status: "Temple Rules" }
    ]
  }
};

/**
 * Returns structured facilities data for ANY given place.
 */
export function getPlaceFacilities(placeName, category = "", customFacilities = null) {
  if (customFacilities && typeof customFacilities === "object") {
    const ensureArray = (val) => (Array.isArray(val) ? val : []);
    const hasAny =
      (Array.isArray(customFacilities.parking) && customFacilities.parking.length > 0) ||
      (Array.isArray(customFacilities.transport) && customFacilities.transport.length > 0) ||
      (Array.isArray(customFacilities.foodBeverage) && customFacilities.foodBeverage.length > 0) ||
      (Array.isArray(customFacilities.utilities) && customFacilities.utilities.length > 0) ||
      (Array.isArray(customFacilities.other) && customFacilities.other.length > 0);

    if (hasAny) {
      return {
        parking: ensureArray(customFacilities.parking),
        transport: ensureArray(customFacilities.transport),
        foodBeverage: ensureArray(customFacilities.foodBeverage),
        utilities: ensureArray(customFacilities.utilities),
        other: ensureArray(customFacilities.other),
      };
    }
  }

  if (!placeName || typeof placeName !== "string") {
    return getDefaultFacilities(category);
  }

  const nameLower = placeName.toLowerCase().trim();

  if (nameLower.includes("lipton")) return FACILITIES_DATA.lipton;
  if (nameLower.includes("little adam") || nameLower.includes("adam's peak") || nameLower.includes("adams peak")) return FACILITIES_DATA.littleadam;
  if (nameLower.includes("adisham")) return FACILITIES_DATA.adisham;
  if (nameLower.includes("porowagala") || nameLower.includes("porowagala")) return FACILITIES_DATA.porowagala;
  if (nameLower.includes("halpewatte") || nameLower.includes("halpe")) return FACILITIES_DATA.halpewatte;
  if (nameLower.includes("nine arch") || nameLower.includes("9 arch")) return FACILITIES_DATA.ninearches;
  if (nameLower.includes("ella rock")) return FACILITIES_DATA.ellarock;
  if (nameLower.includes("ravana fall") || nameLower.includes("ravana waterfall")) return FACILITIES_DATA.ravanafall;
  if (nameLower.includes("dowa")) return FACILITIES_DATA.dowa;

  return getDefaultFacilities(category);
}

function getDefaultFacilities(category = "") {
  return {
    parking: [
      { text: "Vehicle Parking available near location entrance", status: "Available" },
      { text: "Dedicated spaces for Tuk-Tuks, Motorcycles & Cars", status: "Standard" }
    ],
    transport: [
      { text: "Accessible by Car, Van, Scooter & Local Tuk-Tuk", status: "Vehicle Access" },
      { text: "Public Bus & Main Road Connections Nearby", status: "Public Transit" }
    ],
    foodBeverage: [
      { text: "Local Cafes, Tea Shops & Refreshment Outlets Nearby", status: "Nearby Outlets" },
      { text: "Fresh Juice, King Coconut & Drinking Water Counters", status: "Refreshments" }
    ],
    utilities: [
      { text: "Restroom Access Available at site or nearby premises", status: "Available" },
      { text: "Resting Benches & Shaded Observation Areas", status: "Seating Area" },
      { text: "Mobile Network Cellular Signal Coverage", status: "4G Coverage" }
    ],
    other: [
      { text: "Scenic Viewpoint & Photography Opportunities", status: "Photo Points" },
      { text: "Local Visitor Assistance & Guided Opportunities", status: "Visitor Info" }
    ]
  };
}
