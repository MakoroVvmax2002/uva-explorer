/**
 * Shared API configuration.
 * Uses relative API calls in production (Vercel monorepo) or VITE_API_URL if set.
 */
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production" ? "" : "http://localhost:5000");
