/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { buildTheme } from "../theme";

const STORAGE_KEY = "admin_color_mode";

const ColorModeContext = createContext({ mode: "light", toggleColorMode: () => {} });

const modoInicial = () => {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo === "light" || salvo === "dark") return salvo;
  } catch {
    // localStorage indisponível: segue a preferência do sistema
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(modoInicial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // sem persistência
    }
  }, [mode]);

  const value = useMemo(
    () => ({ mode, toggleColorMode: () => setMode((m) => (m === "dark" ? "light" : "dark")) }),
    [mode]
  );
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ColorModeContext);
