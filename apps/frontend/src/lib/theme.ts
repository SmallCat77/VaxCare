import { useState, useEffect } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "vaxcare_theme";

/**
 * Reads initial theme from localStorage or system preference.
 */
export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // fallback
  }
  return "light";
}

/**
 * Applies the 'dark' class to the <html> documentElement.
 */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

/**
 * Custom React Hook for theme management across all components.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Sync across tabs if user changes theme in another tab
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === THEME_KEY && (e.newValue === "dark" || e.newValue === "light")) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  };

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme: (t: Theme) => {
      setThemeState(t);
      applyTheme(t);
    }
  };
}
