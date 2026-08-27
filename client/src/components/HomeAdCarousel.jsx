import { useState, useEffect, useRef } from "react";
import { ExternalLink, Sparkles, Megaphone, PhoneCall } from "lucide-react";
import { fetchPublishedAds } from "../services/adService";

function HomeAdCarousel() {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch & Drag state for touch screen/mouse drag navigation (NO ARROW BUTTONS)
  const [dragStartX, setDragStartX] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchPublishedAds().then((data) => {
      if (isMounted && Array.isArray(data)) {
        setAds(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotate every 4 seconds (4000ms)
  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [ads.length, isPaused]);

  if (ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    setDragStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (dragStartX === null) return;
    const dragEndX = e.changedTouches[0].clientX;
    const diff = dragStartX - dragEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped Left -> Next Ad
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      } else {
        // Swiped Right -> Prev Ad
        setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
      }
    }
    setDragStartX(null);
  };

  // Mouse Drag Handlers for desktop touch screen / mouse drag
  const handleMouseDown = (e) => {
    setDragStartX(e.clientX);
  };

  const handleMouseUp = (e) => {
    if (dragStartX === null) return;
    const diff = dragStartX - e.clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
      }
    }
    setDragStartX(null);
  };

  const handleAdClick = (e) => {
    // Prevent triggering link when clicking call button directly
    if (e.target.closest("a")) return;

    const url = currentAd.targetUrl || (currentAd.contactPhone ? `tel:${currentAd.contactPhone}` : null);
    if (url) {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = url;
      }
    }
  };

  return (
    <section className="animate-section delay-2 mb-12">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Megaphone size={16} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Featured Promotions & Offers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified deals & merchant offers across Uva Province
            </p>
          </div>
        </div>

        {/* Slide Indicator Dots (NO ARROWS) */}
        {ads.length > 1 && (
          <div className="flex items-center gap-1.5">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 bg-amber-500"
                    : "w-2 bg-slate-300 dark:bg-slate-700"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Carousel Container (Clickable to Merchant URL, Drag & Touch Enabled) */}
      <div
        onClick={handleAdClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-slate-900 text-white soft-card-shadow active:cursor-grabbing dark:border-slate-800/60"
        title="Click to visit merchant website & offer"
      >
        <div className="relative flex flex-col md:flex-row min-h-[220px]">
          {/* Ad Image / Video Banner */}
          <div className="relative md:w-1/2 h-56 md:h-auto overflow-hidden bg-slate-800">
            {currentAd.posterType === "video" || currentAd.posterVideo ? (
              <video
                src={currentAd.posterVideo}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <img
                src={currentAd.posterImage}
                alt={currentAd.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-slate-950/40 md:to-slate-950" />
            <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-extrabold text-slate-950 shadow-md flex items-center gap-1">
              {currentAd.posterType === "video" || currentAd.posterVideo ? "🎥 VIDEO PROMO" : "FEATURED PROMO"}
            </span>
          </div>

          {/* Ad Content */}
          <div className="flex flex-1 flex-col justify-between p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
            <div>
              <span className="text-xs font-bold text-amber-400">
                {currentAd.businessName}
              </span>
              <h3 className="mt-1 text-lg font-extrabold text-white sm:text-xl leading-snug">
                {currentAd.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-3">
                {currentAd.description ||
                  "Special promotion for travellers exploring Uva Province!"}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
              <a
                href={`tel:${currentAd.contactPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-amber-400"
              >
                <PhoneCall size={14} className="text-amber-400" />
                <span>{currentAd.contactPhone}</span>
              </a>

              {currentAd.targetUrl ? (
                <a
                  href={currentAd.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition hover:bg-amber-400"
                >
                  <span>Claim Offer</span>
                  <ExternalLink size={14} />
                </a>
              ) : (
                <a
                  href={`tel:${currentAd.contactPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition hover:bg-amber-400"
                >
                  <span>Call Merchant</span>
                  <PhoneCall size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeAdCarousel;
