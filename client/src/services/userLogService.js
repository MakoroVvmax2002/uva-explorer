import { API_URL } from "./api";

const LOGS_STORAGE_KEY = "uva_user_activity_logs";

export function logUserActivity({ userName, location }) {
  if (!userName || !userName.trim()) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB"); // DD/MM/YYYY
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const userLocation =
    location && (location.startsWith("http://") || location.startsWith("https://"))
      ? location
      : `https://www.google.com/maps?q=${encodeURIComponent(location || "6.8767,81.0611")}`;

  const logEntry = {
    _id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userName: userName.trim(),
    date: dateStr,
    time: timeStr,
    location: userLocation,
    createdAt: now.toISOString(),
  };

  // 1. Save to local storage instantly
  try {
    const existing = JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY) || "[]");
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([logEntry, ...existing]));
  } catch (e) {
    console.warn("Local user log storage warning:", e);
  }

  // 2. Fire and forget to backend in non-blocking background microtask
  setTimeout(() => {
    fetch(`${API_URL}/api/user-logs/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: userName.trim(),
        location: userLocation,
      }),
    }).catch((err) => {
      console.warn("Backend user log background sync offline:", err);
    });
  }, 0);

  return logEntry;
}

export async function fetchAllUserLogs() {
  let serverLogs = [];
  try {
    const res = await fetch(`${API_URL}/api/user-logs/all`);
    if (res.ok) {
      serverLogs = await res.json();
    }
  } catch (err) {
    console.warn("Failed to fetch server user logs:", err);
  }

  let localLogs = [];
  try {
    localLogs = JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY) || "[]");
  } catch (e) {}

  // Merge server and local logs uniquely by _id or userName+createdAt
  const mergedMap = new Map();
  [...localLogs, ...serverLogs].forEach((item) => {
    const key = item._id || `${item.userName}_${item.date}_${item.time}`;
    if (!mergedMap.has(key)) {
      mergedMap.set(key, item);
    }
  });

  return Array.from(mergedMap.values());
}
