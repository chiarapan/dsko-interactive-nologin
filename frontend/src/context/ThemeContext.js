import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

const ColorModeContext = createContext();

export function ColorModeContextProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "light");

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const toggleColorMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const contextValue = useMemo(
    () => ({
      mode,
      toggleColorMode,
      theme,
    }),
    [mode, toggleColorMode, theme] 
  );

  return <ColorModeContext.Provider value={contextValue}>{children}</ColorModeContext.Provider>;
}

export const useThemeMode = () => useContext(ColorModeContext);
