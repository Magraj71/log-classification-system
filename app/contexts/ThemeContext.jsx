"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem("theme");
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const setThemeValue = (value) => {
    if (value === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = prefersDark ? "dark" : "light";
      setTheme(resolved);
      localStorage.setItem("theme", "system");
      document.documentElement.setAttribute("data-theme", resolved);
    } else {
      setTheme(value);
      localStorage.setItem("theme", value);
      document.documentElement.setAttribute("data-theme", value);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeValue }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
