import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

// NUEVA PANTALLA DE INICIO (la que tiene foto)
import IntroScreen from "./pages/IntroScreen";

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
        {/* SOLO UNA RUTA "/" → la nueva portada */}
        <Route path="/" element={<IntroScreen />} />

        {/* El wizard al presionar “Empezar análisis” */}
        <Route path="/imc" element={<ImcWizard />} />

        {/* Captura de información antes del WhatsApp */}
        <Route path="/lead" element={<LeadCaptureScreen />} />

        {/* Catálogo final */}
        <Route path="/catalogo" element={<VidaDivinaApp />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);


