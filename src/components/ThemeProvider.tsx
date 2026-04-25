"use client";

import { useEffect } from "react";
import { useUserStore } from "../store/useUserStore";

/**
 * Theme definitions: each theme overrides key CSS custom properties
 * and applies a body-level class for Tailwind overrides.
 */
const THEME_VARS: Record<string, Record<string, string>> = {
  dark: {
    // Default — no overrides needed, uses base styles
  },
  crimson: {
    "--color-primary": "#dc2626",
    "--color-primary-container": "#450a0a",
    "--color-on-primary": "#ffffff",
    "--color-on-primary-container": "#fecaca",
    "--color-surface": "#1c1111",
    "--color-surface-container": "#2a1515",
    "--color-surface-container-high": "#351a1a",
    "--color-surface-container-low": "#1f1212",
    "--color-surface-container-lowest": "#150e0e",
    "--color-surface-container-highest": "#402020",
    "--color-on-surface": "#fde8e8",
    "--color-on-surface-variant": "#d4a0a0",
    "--color-secondary": "#f87171",
    "--color-secondary-container": "#7f1d1d",
    "--color-on-secondary": "#ffffff",
    "--color-outline": "#6b3030",
    "--color-outline-variant": "#4a2020",
    "--color-surface-tint": "#dc2626",
    "--color-error": "#fbbf24",
    "--theme-bg": "#120a0a",
    "--theme-text": "#fde8e8",
    "--theme-card-bg": "#1c1111",
    "--theme-accent": "#dc2626",
  },
  abyssal: {
    "--color-primary": "#06b6d4",
    "--color-primary-container": "#083344",
    "--color-on-primary": "#ffffff",
    "--color-on-primary-container": "#a5f3fc",
    "--color-surface": "#0c1a1f",
    "--color-surface-container": "#112228",
    "--color-surface-container-high": "#162a32",
    "--color-surface-container-low": "#0e1c22",
    "--color-surface-container-lowest": "#091418",
    "--color-surface-container-highest": "#1c3640",
    "--color-on-surface": "#e0f7fa",
    "--color-on-surface-variant": "#80cbc4",
    "--color-secondary": "#22d3ee",
    "--color-secondary-container": "#164e63",
    "--color-on-secondary": "#ffffff",
    "--color-outline": "#1e5060",
    "--color-outline-variant": "#153a48",
    "--color-surface-tint": "#06b6d4",
    "--color-error": "#f87171",
    "--theme-bg": "#080f14",
    "--theme-text": "#e0f7fa",
    "--theme-card-bg": "#0c1a1f",
    "--theme-accent": "#06b6d4",
  },
  cyberpunk: {
    "--color-primary": "#e879f9",
    "--color-primary-container": "#4a044e",
    "--color-on-primary": "#ffffff",
    "--color-on-primary-container": "#f5d0fe",
    "--color-surface": "#1a0a1e",
    "--color-surface-container": "#241428",
    "--color-surface-container-high": "#2e1a33",
    "--color-surface-container-low": "#1e0c22",
    "--color-surface-container-lowest": "#140818",
    "--color-surface-container-highest": "#3a2240",
    "--color-on-surface": "#fae8ff",
    "--color-on-surface-variant": "#d8b4fe",
    "--color-secondary": "#a78bfa",
    "--color-secondary-container": "#581c87",
    "--color-on-secondary": "#ffffff",
    "--color-outline": "#6b2180",
    "--color-outline-variant": "#4a1560",
    "--color-surface-tint": "#e879f9",
    "--color-error": "#fb923c",
    "--theme-bg": "#0f0515",
    "--theme-text": "#fae8ff",
    "--theme-card-bg": "#1a0a1e",
    "--theme-accent": "#e879f9",
  },
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUserStore(state => state.user?.theme);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Remove all theme classes
    html.removeAttribute("data-theme");
    body.classList.remove("theme-crimson", "theme-abyssal", "theme-cyberpunk", "theme-active");

    // Clear all custom properties from previous theme
    Object.values(THEME_VARS).forEach(vars => {
      Object.keys(vars).forEach(key => {
        html.style.removeProperty(key);
      });
    });

    if (theme && theme !== "dark" && THEME_VARS[theme]) {
      html.setAttribute("data-theme", theme);
      body.classList.add(`theme-${theme}`, "theme-active");

      // Apply CSS custom properties
      const vars = THEME_VARS[theme];
      Object.entries(vars).forEach(([key, value]) => {
        html.style.setProperty(key, value);
      });
    }
  }, [theme]);

  return <>{children}</>;
}
