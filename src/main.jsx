import React from "react";
import { createRoot } from "react-dom/client";
import EZOContentEngine from "./EZOContentEngine.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <EZOContentEngine />
  </React.StrictMode>
);
