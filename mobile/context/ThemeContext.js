import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import theme from "../utils/theme";

const THEME_KEY = "@spendwise_theme";

const ThemeContext = createContext(null);

const { lightColors, darkColors, spacing, radius, typography, shadows } = theme;

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();

  const [themeMode, setThemeMode] = useState("system");
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);

        if (
          savedTheme === "light" ||
          savedTheme === "dark" ||
          savedTheme === "system"
        ) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.log("Error loading theme:", error.message);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadTheme();
  }, []);

  const updateTheme = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.log("Error saving theme:", error.message);
    }
  };

  const activeMode =
    themeMode === "system" ? systemTheme || "light" : themeMode;

  const colors = activeMode === "dark" ? darkColors : lightColors;

  const value = {
    themeMode,
    activeMode,
    colors,
    spacing,
    radius,
    typography,
    shadows,
    updateTheme,
    isThemeLoaded,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
