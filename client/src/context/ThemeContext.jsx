import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const SETTINGS_KEY = "uvaExplorerSettings";

const ThemeContext = createContext({
  isDark: false,
  theme: "light",
  setTheme: () => {},
});

// Theme context provider broadcasting light/dark theme across the app
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.theme || "light";
      }
    } catch {}
    return "light";
  });

  const [systemDark, setSystemDark] = useState(
    () =>
      window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false
  );

  // Listen for OS-level dark mode changes
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDark =
    theme === "dark" || (theme === "system" && systemDark);

  // Apply/remove the Tailwind dark class on the root element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Listen for settings changes from other tabs or the Settings page
  useEffect(() => {
    const syncTheme = () => {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setThemeState(parsed.theme || "light");
        }
      } catch {}
    };

    window.addEventListener("storage", syncTheme);
    window.addEventListener("uvaExplorerSettingsChanged", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("uvaExplorerSettingsChanged", syncTheme);
    };
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      const current = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...current, theme: newTheme })
      );
      window.dispatchEvent(new Event("uvaExplorerSettingsChanged"));
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
