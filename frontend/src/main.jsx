import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import AuthProvider from "./auth/AuthProvider.jsx";
import LanguageProvider from "./i18n/LanguageProvider.jsx";
import MenuSectionsProvider from "./menu/MenuSectionsProvider.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <MenuSectionsProvider>
            <App />
          </MenuSectionsProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);
