/**
 * Calculates current real-time operating status for places and facilities.
 * @param {string} openingHours e.g. "06:00 AM - 06:00 PM", "Open 24 Hours", "Open 24/7"
 * @param {string} openingDays e.g. "Monday - Sunday", "Weekends & Public Holidays"
 * @returns {{ isOpen: boolean, statusText: string, color: string, badgeBg: string }}
 */
export function getOpeningStatus(openingHours = "", openingDays = "") {
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const daysLower = (openingDays || "").toLowerCase();
  const hoursLower = (openingHours || "").toLowerCase();

  // 1. Check Day Eligibility
  let isDayValid = true;
  if (daysLower.includes("weekend")) {
    isDayValid = currentDayIndex === 0 || currentDayIndex === 6; // Sun or Sat
  } else if (daysLower.includes("monday - saturday") || daysLower.includes("mon - sat")) {
    isDayValid = currentDayIndex >= 1 && currentDayIndex <= 6;
  } else if (daysLower.includes("monday - friday") || daysLower.includes("mon - fri")) {
    isDayValid = currentDayIndex >= 1 && currentDayIndex <= 5;
  }

  if (!isDayValid) {
    return {
      isOpen: false,
      statusText: "Closed Today",
      color: "text-rose-600 dark:text-rose-400",
      badgeBg: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-500/30",
    };
  }

  // 2. Check 24 Hours
  if (
    hoursLower.includes("24 hour") ||
    hoursLower.includes("24/7") ||
    hoursLower.includes("always open") ||
    hoursLower.includes("open 24")
  ) {
    return {
      isOpen: true,
      statusText: "Open 24 Hours",
      color: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-500/30",
    };
  }

  // 3. Parse Time Ranges (e.g., "08:00 AM - 06:00 PM")
  const timeRangeMatch = (openingHours || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!timeRangeMatch) {
    // Default fallback if time pattern is irregular (e.g., "Sunrise to Sunset")
    return {
      isOpen: true,
      statusText: openingHours || "Open Today",
      color: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-500/30",
    };
  }

  const [, startH, startM, startAmpm, endH, endM, endAmpm] = timeRangeMatch;

  const parseToMinutes = (hStr, mStr, ampmStr) => {
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const ampm = ampmStr.toUpperCase();
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };

  const openMinutes = parseToMinutes(startH, startM, startAmpm);
  let closeMinutes = parseToMinutes(endH, endM, endAmpm);

  if (closeMinutes < openMinutes) {
    // Overnight hours (e.g. 8 PM - 2 AM)
    closeMinutes += 24 * 60;
  }

  const effectiveCurrent = currentMinutes < openMinutes && closeMinutes > 24 * 60 ? currentMinutes + 24 * 60 : currentMinutes;

  if (effectiveCurrent >= openMinutes && effectiveCurrent <= closeMinutes) {
    const isClosingSoon = closeMinutes - effectiveCurrent <= 60; // within 1 hour of closing
    if (isClosingSoon) {
      return {
        isOpen: true,
        statusText: "Closing Soon",
        color: "text-amber-600 dark:text-amber-400",
        badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-500/30",
      };
    }
    return {
      isOpen: true,
      statusText: "Open Now",
      color: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-500/30",
    };
  }

  return {
    isOpen: false,
    statusText: "Closed Now",
    color: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-500/30",
  };
}

/**
 * Constructs direct Google Maps Place search link for a place or facility
 */
export function getGoogleMapsUrl(name = "", location = "", existingUrl = "") {
  if (existingUrl && existingUrl.trim() !== "") {
    return existingUrl;
  }
  const query = `${name} ${location} Uva Sri Lanka`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
