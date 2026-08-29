import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import WelcomeModal from "./components/WelcomeModal";

// Eagerly loaded home page for instant initial render
import Home from "./pages/Home";

// Lazy-loaded secondary pages for optimized bundle size & fast initial load
const Explore = lazy(() => import("./pages/Explore"));
const Planner = lazy(() => import("./pages/Planner"));
const Saved = lazy(() => import("./pages/Saved"));
const MapPage = lazy(() => import("./pages/MapPage"));
const Facilities = lazy(() => import("./pages/Facilities"));
const NearbyFacilities = lazy(() => import("./pages/NearbyFacilities"));
const TransportFacilities = lazy(() => import("./pages/TransportFacilities"));
const PlaceDetails = lazy(() => import("./pages/PlaceDetails"));
const WeatherPage = lazy(() => import("./pages/WeatherPage"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const ProtectedAdmin = lazy(() => import("./pages/Admin/ProtectedAdmin"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
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
    return localStorage.getItem("visitorName") || "";
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const handleSaveName = (name) => {
    setVisitorName(name);
    localStorage.setItem("visitorName", name);
    setShowWelcomeModal(false);
  };

  return (
    <BrowserRouter>
      {/* ROUTE GUARD TO AUTO-RESET ADMIN SESSION ON DEPARTURE */}
      <AdminSessionGuard />

      {/* WELCOME / NAME PROMPT MODAL */}
      {showWelcomeModal && (
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
          <Navbar
            onMenuClick={() => setSidebarOpen((prev) => !prev)}
            visitorName={visitorName}
            onChangeNameRequest={() => setShowWelcomeModal(true)}
          />

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
  );
}

export default App;