import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import WelcomeModal from "./components/WelcomeModal";
import ErrorBoundary from "./components/ErrorBoundary";

// Eagerly loaded home page for instant initial render
import Home from "./pages/Home";

// Lazy loading helper with auto-retry for seamless chunk recovery
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn("Chunk load failed, retrying page import:", error);
      const hasRetried = sessionStorage.getItem("uva_chunk_retry");
      if (!hasRetried) {
        sessionStorage.setItem("uva_chunk_retry", "true");
        window.location.reload();
      }
      throw error;
    }
  });
}

// Lazy-loaded secondary pages for optimized bundle size & fast initial load
const Explore = lazyWithRetry(() => import("./pages/Explore"));
const Planner = lazyWithRetry(() => import("./pages/Planner"));
const Saved = lazyWithRetry(() => import("./pages/Saved"));
const MapPage = lazyWithRetry(() => import("./pages/MapPage"));
const Facilities = lazyWithRetry(() => import("./pages/Facilities"));
const NearbyFacilities = lazyWithRetry(() => import("./pages/NearbyFacilities"));
const TransportFacilities = lazyWithRetry(() => import("./pages/TransportFacilities"));
const PlaceDetails = lazyWithRetry(() => import("./pages/PlaceDetails"));
const WeatherPage = lazyWithRetry(() => import("./pages/WeatherPage"));
const AdminLogin = lazyWithRetry(() => import("./pages/Admin/AdminLogin"));
const ProtectedAdmin = lazyWithRetry(() => import("./pages/Admin/ProtectedAdmin"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
import MerchantAdModal from "./components/MerchantAdModal";

// Fallback loader for lazy-loaded route chunks
function PageLoader() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-md border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <Compass size={22} className="animate-spin text-teal-600 dark:text-teal-400" />
        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
          Loading Uva Explorer...
        </span>
      </div>
    </div>
  );
}

// Auto-resets Admin session as soon as user navigates away from /admin
function AdminSessionGuard() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/admin" && location.pathname !== "/admin/login") {
      const hasAdminToken =
        sessionStorage.getItem("uvaExplorerAdminToken") ||
        sessionStorage.getItem("adminToken") ||
        localStorage.getItem("adminToken");

      if (hasAdminToken) {
        sessionStorage.removeItem("uvaExplorerAdminToken");
        sessionStorage.removeItem("adminToken");
        localStorage.removeItem("adminToken");
        window.dispatchEvent(new Event("storage"));
      }
    }
  }, [location.pathname]);

  return null;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [visitorName, setVisitorName] = useState(() => {
    try {
      return localStorage.getItem("visitorName") || "";
    } catch (e) {
      return "";
    }
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    try {
      const name = localStorage.getItem("visitorName");
      const introDone = localStorage.getItem("uva_intro_completed");
      return !name || !introDone;
    } catch (e) {
      return true;
    }
  });
  const [isLoadingVideoScreen, setIsLoadingVideoScreen] = useState(false);

  // Background Route Prefetching: Downloads all page chunks during idle time for 0ms page switches
  useEffect(() => {
    const prefetchRoutes = () => {
      try {
        import("./pages/Explore");
        import("./pages/Planner");
        import("./pages/Saved");
        import("./pages/MapPage");
        import("./pages/Facilities");
        import("./pages/NearbyFacilities");
        import("./pages/TransportFacilities");
        import("./pages/PlaceDetails");
        import("./pages/WeatherPage");
        import("./pages/Settings");
      } catch (e) {
        console.warn("Background prefetch error:", e);
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(prefetchRoutes);
    } else {
      setTimeout(prefetchRoutes, 800);
    }
  }, []);

  const handleSaveName = (name) => {
    setVisitorName(name);
    try {
      localStorage.setItem("visitorName", name);
    } catch (e) {}

    setShowWelcomeModal(false);

    // Show looping video loading screen on 1st time name submission
    const isIntroDone = localStorage.getItem("uva_intro_completed");
    if (!isIntroDone) {
      setIsLoadingVideoScreen(true);
      setTimeout(() => {
        setIsLoadingVideoScreen(false);
        try {
          localStorage.setItem("uva_intro_completed", "true");
        } catch (e) {}
      }, 3500);
    }
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* ROUTE GUARD TO AUTO-RESET ADMIN SESSION ON DEPARTURE */}
        <AdminSessionGuard />

        {/* FULLSCREEN VIDEO LOADING OVERLAY (1ST TIME VISIT) */}
        {isLoadingVideoScreen && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950 overflow-hidden animate-in fade-in duration-300">
            <video
              src="/videos/loading.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-full bg-slate-950/80 px-6 py-3 backdrop-blur-md border border-white/10 text-white shadow-2xl">
              <Compass size={19} className="animate-spin text-teal-400 shrink-0" />
              <span className="text-xs font-bold tracking-wide">
                Welcome, {visitorName || "Traveler"}! Preparing your journey...
              </span>
            </div>
          </div>
        )}

        {/* WELCOME / NAME PROMPT MODAL */}
        {showWelcomeModal && !isLoadingVideoScreen && (
          <WelcomeModal
            visitorName={visitorName}
            onSaveName={handleSaveName}
          />
        )}

        {/* MERCHANT AD PROMOTION SUBMISSION MODAL */}
        <MerchantAdModal
          isOpen={isAdModalOpen}
          onClose={() => setIsAdModalOpen(false)}
        />

        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Mobile overlay backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-[150] bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar — hidden on mobile unless open */}
          <div
            className={`fixed inset-y-0 left-0 z-[200] transition-transform duration-300 md:relative md:translate-x-0 md:z-auto ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar
              onClose={() => setSidebarOpen(false)}
              onOpenAdModal={() => setIsAdModalOpen(true)}
            />
          </div>

          {/* Main content */}
          <div className="flex min-w-0 flex-1 flex-col relative z-0">
            <div className="relative z-[9999]">
              <Navbar
                onMenuClick={() => setSidebarOpen((prev) => !prev)}
                visitorName={visitorName}
                onChangeNameRequest={() => setShowWelcomeModal(true)}
              />
            </div>

            <main className="flex-1 overflow-y-auto relative z-0">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/place/:id" element={<PlaceDetails />} />
                  <Route path="/planner" element={<Planner />} />
                  <Route path="/weather" element={<WeatherPage />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/facilities" element={<Facilities />} />
                  <Route path="/transport" element={<TransportFacilities />} />
                  <Route path="/nearby" element={<NearbyFacilities />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<ProtectedAdmin />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;