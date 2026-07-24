"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const ORDER: Theme[] = ["light", "dark", "system"];

const LABELS: Record<Theme, string> = {
  light: "Thème clair",
  dark: "Thème sombre",
  system: "Thème système",
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme) || "light";
    setTheme(ORDER.includes(stored) ? stored : "light");
    setMounted(true);
  }, []);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  const current = mounted ? theme : "light";

  return (
    <button
      onClick={cycle}
      aria-label={`${LABELS[current]} — cliquer pour changer`}
      title={LABELS[current]}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border border-rd-line bg-rd-graphite/60 text-white/70 transition hover:border-rd-red/50 hover:text-white ${className}`}
    >
      {current === "light" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : current === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      )}
    </button>
  );
}
