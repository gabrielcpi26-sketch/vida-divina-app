// src/components/DownloadAnalysisPdfButton.jsx
import { jsPDF } from "jspdf";

const STORAGE_USER_PROFILE = "vd_user_profile";
const STORAGE_RECOMMENDATIONS = "vd_recommendations";

// Número principal de WhatsApp (puedes cambiarlo al otro si quieres)
const PRIMARY_WHATSAPP = "524872586302"; 
const ASESORA_NAME = "Diana";

export default function DownloadAnalysisPdfButton() {
  function handleClick() {
    const rawProfile = localStorage.getItem(STORAGE_USER_PROFILE);
    if (!rawProfile) {
      alert("Primero realiza tu análisis para generar el PDF.");
      return;
    }

    const profile = JSON.parse(rawProfile);

    let recommendations = null;
    const rawRecs = localStorage.getItem(STORAGE_RECOMMENDATIONS);
    if (rawRecs) {
      try {
        recommendations = JSON.parse(rawRecs);
      } catch (e) {
        console.error("Error leyendo recomendaciones del PDF", e);
      }
    }

    // 1) Generar PDF
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Análisis personalizado Vida Divina", 10, 20);

    // Datos básicos
    doc.setFontSize(12);
    doc.text(`Nombre: ${profile.nombre || "Invitad@"}`, 10, 35);
    doc.text(`Sexo: ${profile.sexo || "-"}`, 10, 43);
    if (profile.edad) {
      doc.text(`Edad: ${profile.edad} años`, 10, 51);
    }

    // IMC y objetivo
    doc.text(
      `IMC: ${profile.imc} (${profile.clasificacion_imc || "sin clasificar"})`,
      10,
      63
    );
    doc.text(
      `Objetivo principal: ${profile.objetivo || "no especificado"}`,
      10,
      71
    );

    let y = 83;

    // Bloque de productos recomendados
    if (recommendations) {
      doc.setFontSize(13);
      doc.text("Productos recomendados:", 10, y);
      y += 8;

      // Producto ideal
      if (recommendations.ideal) {
        const ideal = recommendations.ideal;
        doc.setFontSize(12);
        doc.text("Producto ideal sugerido:", 10, y);
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text(`• ${ideal.nombre} (${ideal.categoria || ""})`, 10, y);
        doc.setFont("helvetica", "normal");
        y += 7;

        const motivoIdeal =
          ideal.beneficioClave && ideal.beneficioClave.trim() !== ""
            ? `¿Por qué es ideal para ti? Porque apoya ${ideal.beneficioClave.toLowerCase()}, alineado a tu objetivo de "${profile.objetivo ||
                ""}" y a tu resultado de IMC.`
            : "¿Por qué es ideal para ti? Porque está alineado a tu objetivo y a tu resultado de IMC.";
        doc.setFontSize(11);
        doc.text(motivoIdeal, 10, y, { maxWidth: 180 });
        y += 16;
      }

      // Complementarios
      if (recommendations.complementarios && recommendations.complementarios.length > 0) {
        doc.setFontSize(12);
        doc.text("Productos complementarios sugeridos:", 10, y);
        y += 7;

        recommendations.complementarios.forEach((p) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.setFont("helvetica", "bold");
          doc.text(`• ${p.nombre} (${p.categoria || ""})`, 10, y);
          doc.setFont("helvetica", "normal");
          y += 6;

          if (p.beneficioClave && p.beneficioClave.trim() !== "") {
            doc.setFontSize(11);
            doc.text(
              `Apoya: ${p.beneficioClave.toLowerCase()}.`,
              12,
              y,
              { maxWidth: 180 }
            );
            y += 10;
          } else {
            y += 4;
          }
        });
      }
    } else {
      doc.setFontSize(11);
      doc.text(
        "Tus productos recomendados se muestran en tu catálogo interactivo.",
        10,
        y,
        { maxWidth: 180 }
      );
      y += 10;
    }

    // Cierre invitando a contactarte
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.text("Siguiente paso:", 10, y);
    y += 7;
    doc.setFontSize(11);
    const cierre1 =
      "Para armar tu combo, resolver dudas de uso y formas de pago, contacta directamente a tu asesora Vida Divina.";
    doc.text(cierre1, 10, y, { maxWidth: 180 });
    y += 12;

    const whatsappText = `WhatsApp de contacto: +${PRIMARY_WHATSAPP} (${ASESORA_NAME}).`;
    doc.text(whatsappText, 10, y, { maxWidth: 180 });
    y += 10;

    doc.setFontSize(9);
    doc.text(
      "Este documento es una guía de bienestar basada en tus respuestas. No sustituye una valoración médica.",
      10,
      y,
      { maxWidth: 180 }
    );

    // 👉 Dispara la descarga del PDF
    doc.save("analisis-vida-divina.pdf");

    // 2) Abrir WhatsApp contigo con mensaje ya armado
    const msg = encodeURIComponent(
      `Hola ${ASESORA_NAME} 👋 ya descargué mi análisis en PDF.\n\nMis datos:\nIMC: ${profile.imc} (${profile.clasificacion_imc})\nObjetivo: ${profile.objetivo}\n\nQuiero que me expliques cómo usar mis productos y que me ayudes a armar mi combo ideal 💚`
    );

    window.open(`https://wa.me/${PRIMARY_WHATSAPP}?text=${msg}`, "_blank");
  }

  return (
    <button
      onClick={handleClick}
      className="mt-3 w-full md:w-auto px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-xs md:text-sm font-semibold"
    >
      ⬇ Descargar mi análisis en PDF y hablar con Diana por WhatsApp
    </button>
  );
}

