import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import theme from "../utils/theme";

const THEME_KEY = "@spendwise_theme";
const THEME_PALETTE_KEY = "@spendwise_theme_palette";

const DEFAULT_THEME = "system";
const DEFAULT_PALETTE = "violet";

const ThemeContext = createContext(null);

const { lightColors, darkColors, spacing, radius, typography, shadows } = theme;

export const THEME_PALETTES = {
  violet: {
    label: "Violet",
    light: {
      primary: "#6C4CF1",
      primaryDark: "#5638D4",
      primaryLight: "#EEE9FF",
    },
    dark: {
      primary: "#8B6CFF",
      primaryDark: "#7454E8",
      primaryLight: "#2A2345",
    },
  },
  forest: {
    label: "Forest",
    light: {
      primary: "#237A57",
      primaryDark: "#17583E",
      primaryLight: "#E6F4EA",
    },
    dark: {
      primary: "#4DB68A",
      primaryDark: "#32966C",
      primaryLight: "#19382C",
    },
  },
  ocean: {
    label: "Ocean",
    light: {
      primary: "#246BCE",
      primaryDark: "#174A91",
      primaryLight: "#E6F1FF",
    },
    dark: {
      primary: "#68A7FF",
      primaryDark: "#4386E0",
      primaryLight: "#1C304B",
    },
  },
  sunset: {
    label: "Sunset",
    light: {
      primary: "#D96B27",
      primaryDark: "#93451B",
      primaryLight: "#FFF0E5",
    },
    dark: {
      primary: "#FF9B62",
      primaryDark: "#E67B3E",
      primaryLight: "#45291D",
    },
  },
};

const getUserThemeKey = (key, userId) => (userId ? `${key}_${userId}` : null);

const ThemeProvider = ({ children, userId = null }) => {
  const systemTheme = useColorScheme();

  const [themeMode, setThemeMode] = useState(DEFAULT_THEME);
  const [themePalette, setThemePalette] = useState(DEFAULT_PALETTE);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadTheme = async () => {
      setIsThemeLoaded(false);
      setThemeMode(DEFAULT_THEME);
      setThemePalette(DEFAULT_PALETTE);

      try {
        if (!userId) {
          return;
        }

        const modeKey = getUserThemeKey(THEME_KEY, userId);
        const paletteKey = getUserThemeKey(THEME_PALETTE_KEY, userId);

        const [savedTheme, savedPalette, legacyTheme, legacyPalette] =
          await Promise.all([
            AsyncStorage.getItem(modeKey),
            AsyncStorage.getItem(paletteKey),
            AsyncStorage.getItem(THEME_KEY),
            AsyncStorage.getItem(THEME_PALETTE_KEY),
          ]);

        if (cancelled) {
          return;
        }

        const validMode = ["light", "dark", "system"].includes(savedTheme);
        const validPalette = Object.prototype.hasOwnProperty.call(
          THEME_PALETTES,
          savedPalette,
        );

        if (validMode) {
          setThemeMode(savedTheme);
        } else if (
          legacyTheme &&
          ["light", "dark", "system"].includes(legacyTheme)
        ) {
          setThemeMode(legacyTheme);
          await AsyncStorage.setItem(modeKey, legacyTheme);
        }

        if (validPalette) {
          setThemePalette(savedPalette);
        } else if (
          legacyPalette &&
          Object.prototype.hasOwnProperty.call(THEME_PALETTES, legacyPalette)
        ) {
          setThemePalette(legacyPalette);
          await AsyncStorage.setItem(paletteKey, legacyPalette);
        }
      } catch (error) {
        console.log("Error loading theme:", error.message);
      } finally {
        if (!cancelled) {
          setIsThemeLoaded(true);
        }
      }
    };

    loadTheme();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const updateTheme = async (mode) => {
    if (!["light", "dark", "system"].includes(mode)) {
      return;
    }

    try {
      if (userId) {
        await AsyncStorage.setItem(getUserThemeKey(THEME_KEY, userId), mode);
      }
      setThemeMode(mode);
    } catch (error) {
      console.log("Error saving theme:", error.message);
    }
  };

  const updateThemePalette = async (palette) => {
    if (!Object.prototype.hasOwnProperty.call(THEME_PALETTES, palette)) {
      return;
    }

    try {
      if (userId) {
        await AsyncStorage.setItem(
          getUserThemeKey(THEME_PALETTE_KEY, userId),
          palette,
        );
      }
      setThemePalette(palette);
    } catch (error) {
      console.log("Error saving theme palette:", error.message);
    }
  };

  const activeMode =
    themeMode === "system" ? systemTheme || "light" : themeMode;

  const baseColors = activeMode === "dark" ? darkColors : lightColors;
  const paletteColors = THEME_PALETTES[themePalette][activeMode];

  const colors = {
    ...baseColors,
    ...paletteColors,
  };

  const value = {
    themeMode,
    activeMode,
    themePalette,
    themePalettes: THEME_PALETTES,
    colors,
    spacing,
    radius,
    typography,
    shadows,
    updateTheme,
    updateThemePalette,
    isThemeLoaded,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export { ThemeProvider };

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
