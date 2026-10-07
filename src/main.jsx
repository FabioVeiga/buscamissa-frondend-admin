import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import { ColorModeProvider } from "./Context/ColorModeContext";
import { UnsavedChangesProvider } from "./Context/UnsavedChangesContext";
import App from "./App.jsx";
import { AuthProvider } from "./Context/AuthContext";

createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider>
      <ColorModeProvider>
        <UnsavedChangesProvider>
          <StrictMode>
            <App />
          </StrictMode>
        </UnsavedChangesProvider>
      </ColorModeProvider>
    </AuthProvider>
  </Router>
);
