import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/theme";

export function ThemeToggle({ className = "", showLabel = false }: { className?: string; showLabel?: boolean }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-2xs ${
        isDark
          ? "bg-[#0C1D2B] border-[#1B364A] text-amber-400 hover:bg-[#122A3C] hover:text-amber-300 ring-1 ring-amber-400/20"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      } ${className}`}
      title={isDark ? "Switch to Hospital Day Mode" : "Switch to Hospital Night/Dark Mode"}
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <>
          <Sun size={14} className="text-amber-400 shrink-0" />
          {showLabel && <span>Day Mode</span>}
        </>
      ) : (
        <>
          <Moon size={14} className="text-slate-600 shrink-0" />
          {showLabel && <span>Dark Mode</span>}
        </>
      )}
    </button>
  );
}
