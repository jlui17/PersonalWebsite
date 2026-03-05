import React from "react";
import { useTheme } from "../context/ThemeContext";

export const ThemeToggle = () => {
  const { experience, toggleExperience } = useTheme();
  const isCafe = experience === "cafe";

  return (
    <button
      onClick={toggleExperience}
      className="experience-toggle"
      aria-label={`Switch to ${isCafe ? "terminal" : "café"} mode`}
    >
      {/* Café Icon with steam */}
      <span 
        className={`toggle-icon ${isCafe ? 'experience-toggle-active' : ''}`}
        title="Café mode"
      >
        {isCafe && (
          <>
            <span className="steam-particle"></span>
            <span className="steam-particle"></span>
            <span className="steam-particle"></span>
          </>
        )}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-5 h-5 relative z-10"
        >
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      </span>

      <span className="text-sm font-medium">
        {isCafe ? "Café" : "Terminal"}
      </span>

      {/* Terminal Icon with cursor */}
      <span 
        className={`toggle-icon ${!isCafe ? 'experience-toggle-active' : ''}`}
        title="Terminal mode"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
        {!isCafe && (
          <span className="absolute -right-1 -bottom-1 text-[10px] text-accent">▋</span>
        )}
      </span>
    </button>
  );
};
