import { API_URL } from "./api";

const LOGS_STORAGE_KEY = "uva_user_activity_logs";

export async function logUserActivity({ userName, location }) {
  if (!userName || !userName.trim()) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB"); // DD/MM/YYYY
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

  // 1. Save to local storage for offline fallback
  try {
    const existing = JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY) || "[]");
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([logEntry, ...existing]));
  } catch (e) {
    console.warn("Local user log storage warning:", e);
  }

  // 2. Send to backend Express server to append to Excel file
  try {
    const response = await fetch(`${API_URL}/api/user-logs/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: userName.trim(),
        location: userLocation,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn("Backend user log API offline, saved locally:", err);
  }

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
