import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import "./index.css";
import theme from "./theme";
import App from "./App.jsx";
import { AuthProvider } from "./Context/AuthContext";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StrictMode>
        <App />
      </StrictMode>
    </ThemeProvider>
  </AuthProvider>
);
