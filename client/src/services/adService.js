import { API_URL } from "./api";

const LOCAL_STORAGE_KEY = "uva_explorer_merchant_ads";

const DEFAULT_DEMO_ADS = [
  {
    _id: "ad-demo-1",
    businessName: "Grand Ella View Cafe & Bakery",
    contactPhone: "+94 77 123 4567",
    title: "🍰 20% Off Fresh Artisan Pastries & Ella Peak Coffee",
    description: "Show your Uva Explorer app at checkout for an exclusive 20% discount on all artisan breakfast items & specialty coffees!",
    targetUrl: "https://google.com/search?q=Ella+Cafe",
    posterImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
    receiptImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400",
    status: "published",
    durationDays: 14,
    publishedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: "ad-demo-2",
    businessName: "Uva Hillside Scooter & Bike Rentals",
    contactPhone: "+94 71 987 6543",
    title: "🛵 Explore Ella & Haputale on Honda Scooters from Rs. 2,500/day",
    description: "Unlimited mileage, free helmets, and 24/7 roadside assistance across Badulla & Bandarawela districts.",
    targetUrl: "https://google.com/search?q=Ella+Scooter+Rentals",
    posterImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1200",
    receiptImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400",
    status: "published",
    durationDays: 30,
    publishedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export function getLocalAds() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Local storage ad error:", e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_ADS));
  return DEFAULT_DEMO_ADS;
}

export function saveLocalAds(ads) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ads));
  } catch (e) {
    console.error("Local storage save error:", e);
  }
}

export async function fetchPublishedAds() {
  try {
    const res = await fetch(`${API_URL}/api/ads/published`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, loading local published ads:", err);
  }
  const local = getLocalAds();
  const now = new Date();
  return local.filter(
    (ad) => ad.status === "published" && (!ad.expiresAt || new Date(ad.expiresAt) > now)
  );
}

export async function fetchAllAdminAds() {
  try {
    const res = await fetch(`${API_URL}/api/ads/admin/all`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, loading local admin ads:", err);
  }
  return getLocalAds();
}

export async function submitAdRequest(adData) {
  try {
    const res = await fetch(`${API_URL}/api/ads/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API unavailable, saving ad request locally:", err);
  }

  const local = getLocalAds();
  const newAd = {
    ...adData,
    _id: "ad-" + Date.now(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const updated = [newAd, ...local];
  saveLocalAds(updated);
  return newAd;
}

export async function updateAdStatus(id, updateData) {
  try {
    const res = await fetch(`${API_URL}/api/ads/admin/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API unavailable, updating ad locally:", err);
  }

  const local = getLocalAds();
  const updated = local.map((ad) => {
    if (ad._id === id) {
      const status = updateData.status || ad.status;
      const durationDays = updateData.durationDays || ad.durationDays || 7;
      let publishedAt = ad.publishedAt;
      let expiresAt = ad.expiresAt;

      if (status === "published") {
        const now = new Date();
        publishedAt = now.toISOString();
        if (updateData.expiresAt) {
          expiresAt = new Date(updateData.expiresAt).toISOString();
        } else {
          expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
        }
      } else if (updateData.expiresAt) {
        expiresAt = new Date(updateData.expiresAt).toISOString();
      }

      return {
        ...ad,
        ...updateData,
        status,
        durationDays,
        publishedAt,
        expiresAt,
      };
    }
    return ad;
  });

  saveLocalAds(updated);
  return updated.find((ad) => ad._id === id);
}

export async function deleteAd(id) {
  try {
    const res = await fetch(`${API_URL}/api/ads/admin/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn("Backend API unavailable, deleting ad locally:", err);
  }

  const local = getLocalAds();
  const filtered = local.filter((ad) => ad._id !== id);
  saveLocalAds(filtered);
  return true;
}
