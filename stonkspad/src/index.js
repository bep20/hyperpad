import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppContextProvider } from "./context/AppStore";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>
);

// image
// main => Redefining meaning of stonks
// subtitle => One Stonk at a time
// Radiym() DexScreener() BirdEye()
