import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

// Wizard / formulario IMC
import ImcWizard from "./pages/ImcWizard.jsx";

// Captura de leads
import LeadCaptureScreen from "./pages/LeadCaptureScreen.jsx";

// Catálogo
import VidaDivinaApp from "./App.jsx";

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pantalla inicial: IMC */}
        <Route path="/" element={<ImcWizard />} />

        {/* Captura de información antes del WhatsApp */}
        <Route path="/lead" element={<LeadCaptureScreen />} />

        {/* Catálogo final */}
        <Route path="/catalogo" element={<VidaDivinaApp />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);


