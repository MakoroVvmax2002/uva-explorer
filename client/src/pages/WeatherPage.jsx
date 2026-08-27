import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CloudSun,
  ExternalLink,
  MapPin,
  Compass,
  Calendar,
  Sparkles,
  Droplets,
  Wind,
  Sun,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const UVA_WEATHER_CITIES = {
  Ella: { name: "Ella", lat: 6.8667, lng: 81.0466, query: "weather+in+Ella+Sri+Lanka" },
  Bandarawela: { name: "Bandarawela", lat: 6.8298, lng: 80.9846, query: "weather+in+Bandarawela+Sri+Lanka" },
  Haputale: { name: "Haputale", lat: 6.7722, lng: 80.9309, query: "weather+in+Haputale+Sri+Lanka" },
  Badulla: { name: "Badulla", lat: 6.9934, lng: 81.0550, query: "weather+in+Badulla+Sri+Lanka" },
  Diyatalawa: { name: "Diyatalawa", lat: 6.8120, lng: 80.9580, query: "weather+in+Diyatalawa+Sri+Lanka" },
};

function WeatherPage() {
  const [searchParams] = useSearchParams();
  const queryParam = (searchParams.get("q") || "").toLowerCase();

  const initialCity = (() => {
    if (queryParam.includes("bandarawela")) return "Bandarawela";
    if (queryParam.includes("haputale")) return "Haputale";
    if (queryParam.includes("badulla")) return "Badulla";
    if (queryParam.includes("diyatalawa")) return "Diyatalawa";
    return "Ella";
  })();

  const [selectedCityKey, setSelectedCityKey] = useState(initialCity);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (queryParam.includes("bandarawela")) setSelectedCityKey("Bandarawela");
    else if (queryParam.includes("haputale")) setSelectedCityKey("Haputale");
    else if (queryParam.includes("badulla")) setSelectedCityKey("Badulla");
    else if (queryParam.includes("diyatalawa")) setSelectedCityKey("Diyatalawa");
    else if (queryParam.includes("ella")) setSelectedCityKey("Ella");
  }, [queryParam]);

  const city = UVA_WEATHER_CITIES[selectedCityKey];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto`
    )
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setWeatherData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Weather API error:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCityKey]);

  // Decode WMO weather code to readable string & icon
  const getWeatherInfo = (code) => {
    if (code === 0) return { label: "Sunny / Clear Sky", icon: "☀️", bg: "from-amber-500/10 to-orange-500/10" };
    if (code === 1 || code === 2 || code === 3) return { label: "Partly Cloudy", icon: "⛅", bg: "from-sky-500/10 to-blue-500/10" };
    if (code >= 45 && code <= 48) return { label: "Misty / Foggy", icon: "🌫️", bg: "from-slate-500/10 to-gray-500/10" };
    if (code >= 51 && code <= 67) return { label: "Light Rain Showers", icon: "🌧️", bg: "from-blue-500/10 to-cyan-500/10" };
    if (code >= 80) return { label: "Thunderstorms / Heavy Rain", icon: "⛈️", bg: "from-indigo-500/10 to-purple-500/10" };
    return { label: "Pleasant Mountain Climate", icon: "🌤️", bg: "from-emerald-500/10 to-teal-500/10" };
  };

  const todayCode = weatherData?.daily?.weathercode?.[0] ?? 1;
  const tomorrowCode = weatherData?.daily?.weathercode?.[1] ?? 2;

  const todayInfo = getWeatherInfo(todayCode);
  const tomorrowInfo = getWeatherInfo(tomorrowCode);

  const todayMax = weatherData?.daily?.temperature_2m_max?.[0] ?? 25;
  const todayMin = weatherData?.daily?.temperature_2m_min?.[0] ?? 16;
  const todayRain = weatherData?.daily?.precipitation_probability_max?.[0] ?? 15;
  const todayCurrent = weatherData?.current_weather?.temperature ?? 23;
  const windSpeed = weatherData?.current_weather?.windspeed ?? 12;

  const tomorrowMax = weatherData?.daily?.temperature_2m_max?.[1] ?? 24;
  const tomorrowMin = weatherData?.daily?.temperature_2m_min?.[1] ?? 15;
  const tomorrowRain = weatherData?.daily?.precipitation_probability_max?.[1] ?? 25;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* HEADER & GOOGLE WEATHER LINK */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <CloudSun size={24} />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">
              Weather Forecast
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Real-time today and tomorrow weather forecasts for tourist destinations across Uva Province.
          </p>
        </div>

        {/* GOOGLE WEATHER CONNECTED BUTTON */}
        <a
          href={`https://www.google.com/search?q=${city.query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-extrabold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700"
        >
          <ExternalLink size={15} />
          <span>Open Live Google Weather</span>
        </a>
      </div>

      {/* CITY SELECTION TABS */}
      <div className="mt-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Select Uva Destination City:
        </label>
        <div className="flex flex-wrap gap-2.5">
          {Object.keys(UVA_WEATHER_CITIES).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedCityKey(key)}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-extrabold transition ${
                selectedCityKey === key
                  ? "bg-teal-700 text-white shadow-md dark:bg-teal-600"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <MapPin size={14} className={selectedCityKey === key ? "text-teal-200" : "text-slate-400"} />
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* TODAY & TOMORROW WEATHER CARDS */}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* TODAY'S FORECAST */}
        <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br ${todayInfo.bg} p-6 sm:p-8 shadow-sm dark:border-slate-800`}>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-teal-700 px-3.5 py-1 text-xs font-extrabold text-white">
              📅 Today's Forecast
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {city.name}, Sri Lanka
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 dark:text-white">
                  {Math.round(todayCurrent)}°C
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  (High: {Math.round(todayMax)}° / Low: {Math.round(todayMin)}°)
                </span>
              </div>
              <p className="mt-2 text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="text-2xl">{todayInfo.icon}</span>
                <span>{todayInfo.label}</span>
              </p>
            </div>
            <div className="text-6xl">{todayInfo.icon}</div>
          </div>

          {/* Details Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-5 text-xs dark:border-slate-800">
            <div className="flex items-center gap-2.5 rounded-xl bg-white/60 p-3 dark:bg-slate-900/60">
              <Droplets size={18} className="text-blue-500 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-400">Rain Chance</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{todayRain}% Max</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-white/60 p-3 dark:bg-slate-900/60">
              <Wind size={18} className="text-sky-500 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-400">Wind Speed</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{windSpeed} km/h</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/80 p-4 text-xs leading-relaxed text-slate-700 dark:bg-slate-900/80 dark:text-slate-300 border border-white/40 dark:border-slate-800">
            💡 <strong>Today's Travel Tip:</strong> Excellent conditions for outdoor sightseeing in {city.name}. Perfect time to visit viewpoints & waterfalls!
          </div>
        </div>

        {/* TOMORROW'S FORECAST */}
        <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br ${tomorrowInfo.bg} p-6 sm:p-8 shadow-sm dark:border-slate-800`}>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-slate-900 px-3.5 py-1 text-xs font-extrabold text-white dark:bg-slate-800">
              📆 Tomorrow's Forecast
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {city.name}, Sri Lanka
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 dark:text-white">
                  {Math.round(tomorrowMax)}°C
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  (High: {Math.round(tomorrowMax)}° / Low: {Math.round(tomorrowMin)}°)
                </span>
              </div>
              <p className="mt-2 text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="text-2xl">{tomorrowInfo.icon}</span>
                <span>{tomorrowInfo.label}</span>
              </p>
            </div>
            <div className="text-6xl">{tomorrowInfo.icon}</div>
          </div>

          {/* Details Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-5 text-xs dark:border-slate-800">
            <div className="flex items-center gap-2.5 rounded-xl bg-white/60 p-3 dark:bg-slate-900/60">
              <Droplets size={18} className="text-blue-500 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-400">Rain Chance</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{tomorrowRain}% Max</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-white/60 p-3 dark:bg-slate-900/60">
              <TrendingUp size={18} className="text-teal-500 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-400">Best Window</span>
                <span className="font-extrabold text-teal-700 dark:text-teal-400">7:30 AM - 1:00 PM</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/80 p-4 text-xs leading-relaxed text-slate-700 dark:bg-slate-900/80 dark:text-slate-300 border border-white/40 dark:border-slate-800">
            💡 <strong>Tomorrow's Travel Tip:</strong> Plan mountain hikes early in the morning for maximum visibility and clear skies!
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherPage;
