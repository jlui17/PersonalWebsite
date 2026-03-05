import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "justinlui-experience";

const ThemeContext = createContext({
  experience: "cafe",
  setExperience: () => {},
  toggleExperience: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [experience, setExperienceState] = useState("cafe");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved experience from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === "cafe" || saved === "terminal")) {
      setExperienceState(saved);
      document.body.className = `mode-${saved}`;
    } else {
      // Default to café mode
      document.body.className = "mode-cafe";
    }
    setIsLoaded(true);
  }, []);

  const setExperience = (newExperience) => {
    if (newExperience !== "cafe" && newExperience !== "terminal") return;
    
    setExperienceState(newExperience);
    document.body.className = `mode-${newExperience}`;
    localStorage.setItem(STORAGE_KEY, newExperience);
  };

  const toggleExperience = () => {
    const newExperience = experience === "cafe" ? "terminal" : "cafe";
    setExperience(newExperience);
  };

  // Prevent flash of wrong theme
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ experience, setExperience, toggleExperience }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
