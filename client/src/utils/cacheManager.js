/**
 * High-Performance In-Memory & SessionStorage Cache Manager for Uva Explorer
 * Provides 0ms instant data retrieval with Stale-While-Revalidate background syncing.
 */

const memoryCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes default TTL

export function getCachedData(key) {
  // 1. Check in-memory fast map (0ms)
  if (memoryCache.has(key)) {
    const item = memoryCache.get(key);
    if (Date.now() - item.timestamp < CACHE_TTL_MS) {
      return item.data;
    }
  }

  // 2. Check sessionStorage fallback (0ms)
  try {
    const stored = sessionStorage.getItem(`uva_cache_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (e) {
    // Ignore storage errors
  }

  return null;
}

export function setCachedData(key, data) {
  const cacheObj = {
    data,
    timestamp: Date.now(),
  };

  memoryCache.set(key, cacheObj);

  try {
    sessionStorage.setItem(`uva_cache_${key}`, JSON.stringify(cacheObj));
  } catch (e) {
    // Ignore quota errors
  }
}

/**
 * Executes a fetch request with Stale-While-Revalidate caching strategy.
 * Returns cached data immediately (0ms) if available, while fetching fresh data in background.
 */
export async function fetchWithCache(url, options = {}, keyOverride = null) {
  const cacheKey = keyOverride || url;
  const cached = getCachedData(cacheKey);

  // Return cached data immediately if present
  if (cached) {
    // Fire background revalidation silently
    fetch(url, options)
      .then((res) => (res.ok ? res.json() : null))
      .then((freshData) => {
        if (freshData) setCachedData(cacheKey, freshData);
      })
      .catch(() => {});

    return { data: cached, fromCache: true };
  }

  // If no cache, perform fast network fetch with 3.5s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      setCachedData(cacheKey, data);
      return { data, fromCache: false };
    }
  } catch (err) {
    clearTimeout(timeoutId);
  }

  return { data: null, fromCache: false };
}
