// src/components/SmartAssessorPro.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// =====================
// Números de WhatsApp
// =====================
const WA1 = "7291022897";
const WA2 = "4872586302";

function getSmartWhatsAppNumber() {
  try {
    const stored = localStorage.getItem("vd_assigned_whatsapp");
    if (stored) return stored;
    const last = localStorage.getItem("vd_last_assigned");
    const next = last === WA1 ? WA2 : WA1;
    localStorage.setItem("vd_assigned_whatsapp", next);
    localStorage.setItem("vd_last_assigned", next);
    return next;
  } catch {
    return WA1;
  }
}

// =====================
// Helpers de perfil / IMC
// =====================

// Intenta leer peso desde distintos nombres
function getWeightKg(profile = {}) {
  return Number(
    profile.weight ??
      profile.peso ??
      profile.pesoKg ??
      profile.kg ??
      profile.peso_kg ??
      0
  );
}

// Intenta leer altura en cm desde distintos nombres
function getHeightCm(profile = {}) {
  return Number(
    profile.height ??
      profile.estatura ??
      profile.altura ??
      profile.altura_cm ??
      0
  );
}

function calcIMC(profile) {
  const kg = getWeightKg(profile);
  const cm = getHeightCm(profile);
  const m = cm / 100;
  if (!kg || !m) return null;
  return Number((kg / (m * m)).toFixed(1));
}

function describeIMC(imc, profile) {
  if (imc == null) {
    return {
      label: "Sin datos",
      kilosExtra: null,
      text:
        "Faltan datos de peso y/o estatura. Completa tu registro para ver un análisis más preciso.",
    };
  }

  const kg = getWeightKg(profile);
  const heightM = getHeightCm(profile) / 100;
  const healthyMax = 24.9 * (heightM * heightM);
  const diff = healthyMax && kg ? Number((kg - healthyMax).toFixed(1)) : null;

  if (imc < 18.5)
    return {
      label: "Bajo peso",
      kilosExtra: diff,
      text:
        "Tu IMC está por debajo del rango saludable. El enfoque es ganar masa muscular y energía, evitando tés diuréticos o productos que quiten el apetito.",
    };
  if (imc < 25)
    return {
      label: "Rango saludable",
      kilosExtra: diff,
      text:
        "Estás dentro de un rango saludable. El enfoque es mantener metabolismo activo, digestión ligera y energía estable.",
    };
  if (imc < 30)
    return {
      label: "Sobrepeso",
      kilosExtra: diff,
      text:
        "Tienes un ligero exceso de grasa y algo de retención. La prioridad es desinflamación, digestión y control de antojos.",
    };
  if (imc < 35)
    return {
      label: "Obesidad grado I",
      kilosExtra: diff,
      text:
        "Se requiere un protocolo más estructurado: detox, control metabólico y acompañamiento diario.",
    };
  return {
    label: "Obesidad grado II/III",
    kilosExtra: diff,
    text:
      "Es importante combinar productos específicos con seguimiento cercano. Este análisis no reemplaza una valoración médica.",
  };
}

// Recomendación de agua (≈ 33 ml/kg + ajuste por IMC)
function getWaterRecommendation(profile, imc) {
  const kg = getWeightKg(profile);
  if (!kg) return null;

  let liters = kg * 0.033; // 33 ml por kg
  if (imc != null && imc >= 30) liters += 0.3; // un extra si hay obesidad
  liters = Math.min(Math.max(liters, 1.5), 4); // entre 1.5 y 4 L

  return Number(liters.toFixed(1));
}

// =====================
// Reglas de productos
// =====================

const GOAL_RULES = {
  bajar_grasa: {
    prefer: [
      "te_divina_original",
      "te_divina_latte_verde",
      "atom",
      "factor_divina",
      "capsulas_metabolicas",
    ],
    avoid: ["cafes_caloricos", "batidos_altos_carbohidratos"],
  },
  aumentar_musculo: {
    prefer: [
      "shake_divina",
      "proteina_divina",
      "extracto_maitake",
      "extracto_mix_hongos",
    ],
    avoid: ["te_diuretico_fuerte", "productos_quitan_apetito"],
  },
  energia: {
    prefer: ["atom", "cafe_divina_gold", "cafe_divina_ganoderma"],
    avoid: [],
  },
  digestion: {
    prefer: [
      "te_divina_original",
      "extracto_tremella",
      "extracto_turkey_tail",
      "factor_divina",
    ],
    avoid: ["productos_pesados_noche"],
  },
};

function getIMCRuleIds(imc) {
  if (imc == null) return [];
  if (imc < 18.5) {
    return ["shake_divina", "proteina_divina"]; // evitar tés fuertes
  }
  if (imc < 25) {
    return ["te_divina_original", "atom"];
  }
  if (imc < 30) {
    return [
      "te_divina_original",
      "extracto_turkey_tail",
      "factor_divina",
      "atom",
    ];
  }
  if (imc < 35) {
    return [
      "te_divina_original",
      "extracto_tremella",
      "factor_divina",
      "capsulas_metabolicas",
    ];
  }
  return [
    "te_divina_original",
    "extracto_tremella",
    "extracto_turkey_tail",
    "factor_divina",
    "capsulas_metabolicas",
  ];
}

// Explicación breve por producto – versión “te ayuda a…”
function reasonForProduct(p, profile, imcInfo) {
  const goal = profile?.goal;
  if (!p) return "";

  if (goal === "bajar_grasa" && p.id === "te_divina_original") {
    return "Se elige porque te ayuda a depurar, desinflamar y limpiar tu sistema digestivo para arrancar fuerte tu proceso de bajada de grasa.";
  }
  if (goal === "bajar_grasa" && p.id === "atom") {
    return "Se elige porque te ayuda a aumentar energía y activar el metabolismo con efecto termogénico, sin depender de cafés azucarados.";
  }
  if (goal === "bajar_grasa" && p.id === "factor_divina") {
    return "Se elige porque te ayuda a cubrir vitaminas y minerales clave mientras haces cambios en tu alimentación.";
  }
  if (goal === "aumentar_musculo" && p.id === "shake_divina") {
    return "Se elige porque te ayuda a llegar a tu proteína diaria de forma práctica y apoyar la construcción de masa muscular.";
  }
  if (p.category === "extracto") {
    return "Se elige porque te ayuda a trabajar inflamación interna, defensas y equilibrio hormonal de forma más concentrada.";
  }
  if (p.category === "cafe") {
    return "Se elige porque te ayuda a mejorar enfoque y rendimiento con un café funcional, no solo estimulante.";
  }
  return `Se elige porque te ayuda a avanzar hacia tu objetivo con tu situación actual de IMC (${imcInfo.label}).`;
}

// =====================
// Componente principal
// =====================

export default function SmartAssessorPro({
  profile: profileProp,
  products: productsProp,
  mergedProducts,
}) {
  // Mismo orden de hooks SIEMPRE
  const [recommendations, setRecommendations] = useState({
    main: [],
    secondary: [],
    optional: [],
  });
  const [healthScore, setHealthScore] = useState(0);
  const [progressData, setProgressData] = useState([]);
  const [monthlyPlan, setMonthlyPlan] = useState([]);
  const [showHealth, setShowHealth] = useState(false);
  const [showPlanPreview, setShowPlanPreview] = useState(false);

  const pdfRef = useRef(null);

  const profile = profileProp || {};
  const products = useMemo(
    () => productsProp || mergedProducts || [],
    [productsProp, mergedProducts]
  );

  const imc = useMemo(() => calcIMC(profile), [profile]);
  const imcInfo = useMemo(
    () => describeIMC(imc, profile),
    [imc, profile]
  );
  const waterLiters = useMemo(
    () => getWaterRecommendation(profile, imc),
    [profile, imc]
  );

  // vasos de 250 ml aproximados (no es hook)
  const waterGlasses = waterLiters
    ? Math.round((waterLiters * 1000) / 250)
    : null;

  // -----------------------------
  // Recomendaciones de productos
  // -----------------------------
  useEffect(() => {
    if (!products || products.length === 0) {
      setRecommendations({ main: [], secondary: [], optional: [] });
      return;
    }

    const goal = profile.goal || "bajar_grasa";
    const rule = GOAL_RULES[goal] || GOAL_RULES.bajar_grasa;

    const imcIds = getIMCRuleIds(imc);
    const preferIds = new Set([...(rule.prefer || []), ...imcIds]);

    const scored = products.map((p) => {
      let score = 0;

      if (preferIds.has(p.id)) score += 40;
      if (p.category === "te" && goal === "bajar_grasa") score += 15;
      if (p.category === "batido" && goal === "aumentar_musculo") score += 20;
      if (p.category === "capsula" && goal === "bajar_grasa") score += 10;
      if (p.tags?.includes("detox")) score += 10;
      if (p.tags?.includes("energia") && goal === "energia") score += 15;

      const avoidList = rule.avoid || [];
      if (avoidList.includes(p.id) || p.tags?.includes("evitar")) {
        score -= 100;
      }

      return { ...p, score };
    });

    const valid = scored
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score);

    const main = valid.slice(0, 3);
    const secondary = valid.slice(3, 6);
    const optional = valid.slice(6, 9);

    setRecommendations({ main, secondary, optional });
  }, [products, profile, imc]);

  // -----------------------------
  // HealthScore
  // -----------------------------
  useEffect(() => {
    let score = 60;

    if (profile.goal === "bajar_grasa") score += 10;
    if (profile.goal === "aumentar_musculo") score += 8;

    if (imc != null) {
      if (imc < 18.5) score -= 5;
      else if (imc < 25) score += 5;
      else if (imc < 30) score -= 2;
      else if (imc >= 30) score -= 8;
    }

    score = Math.max(0, Math.min(100, score));
    setHealthScore(score);
  }, [profile, imc]);

  // -----------------------------
  // Gráfica simulada
  // -----------------------------
  useEffect(() => {
    const base = imc || 30;
    const data = [
      { semana: "Semana 1", imc: base },
      { semana: "Semana 2", imc: base - 0.3 },
      { semana: "Semana 3", imc: base - 0.7 },
      { semana: "Semana 4", imc: base - 1.1 },
    ];
    setProgressData(data);
  }, [imc]);

  // -----------------------------
  // Plan mensual (con ejemplo de comida)
  // -----------------------------
  useEffect(() => {
    const goal = profile.goal || "bajar_grasa";

    const baseDiet =
      goal === "aumentar_musculo"
        ? {
            breakfast: "Avena con proteína + plátano.",
            lunch: "Arroz, pollo y verduras.",
            dinner: "Salmón o carne magra con camote.",
            snacks: "Yogurt griego, nueces y un shake Divina.",
          }
        : {
            breakfast: "Omelette de claras con espinaca + papaya.",
            lunch: "Pollo a la plancha con ensalada verde.",
            dinner: "Sopa de verduras + proteína magra (pollo/pescado).",
            snacks: "Pepino, jícama, frutos rojos o manzana.",
          };

    const plan = [
      {
        semana: "Semana 1",
        foco:
          goal === "bajar_grasa"
            ? "Detox, desinflamación y regular digestión."
            : "Activar metabolismo y energía.",
        diet: baseDiet,
      },
      {
        semana: "Semana 2",
        foco:
          goal === "bajar_grasa"
            ? "Control de antojos y balance de glucosa."
            : "Aumentar aporte de proteína y recuperación.",
        diet: baseDiet,
      },
      {
        semana: "Semana 3",
        foco:
          goal === "bajar_grasa"
            ? "Reforzar resultados y reducir medidas."
            : "Definir y mantener masa muscular.",
        diet: baseDiet,
      },
      {
        semana: "Semana 4",
        foco: "Mantenimiento y creación de hábitos sostenibles.",
        diet: baseDiet,
      },
    ];
    setMonthlyPlan(plan);
  }, [profile.goal]);

  // -----------------------------
  // Exportar a PDF
  // -----------------------------
  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    const element = pdfRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("Analisis_VidaDivina.pdf");
  };

  const waNumber = getSmartWhatsAppNumber();

  // ===================================================================
  // RENDER
  // ===================================================================
  return (
    <div className="mt-6 space-y-4">
      {/* Área que se exporta a PDF */}
      <div
        ref={pdfRef}
        className="bg-white rounded-xl shadow-sm border border-emerald-50 p-4 md:p-5 space-y-4"
      >
        {/* Encabezado + botón de salud */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-emerald-700">
              Análisis Personalizado – Asesora Diana Montoya Hernández
            </h2>
            <p className="text-xs text-gray-500">
              Objetivo:{" "}
              <span className="font-semibold text-gray-700">
                {profile.goal === "bajar_grasa"
                  ? "Bajar grasa"
                  : profile.goal === "aumentar_musculo"
                  ? "Aumentar músculo"
                  : profile.goal === "energia"
                  ? "Energía y rendimiento"
                  : profile.goal === "digestion"
                  ? "Digestión y desinflamación"
                  : "Bienestar general"}
              </span>
            </p>
          </div>

          <button
            onClick={() => setShowHealth((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm rounded-full border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition"
          >
            <span className="animate-bounce text-lg">👆</span>
            Ver resumen de tu salud y HealthScore
          </button>
        </div>

        {/* Resumen de salud colapsable */}
        {showHealth && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-lg p-3 text-xs md:text-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-emerald-800">
                  Resumen de tu salud actual
                </p>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-700 border border-emerald-200">
                  IMC: {imc ?? "—"} {imcInfo.label && `· ${imcInfo.label}`}
                </span>
              </div>

              <p className="mt-2 text-gray-700">{imcInfo.text}</p>

              {imcInfo.kilosExtra != null && imcInfo.kilosExtra > 0 && (
                <p className="mt-1 text-gray-700">
                  Estimamos que estás aproximadamente{" "}
                  <span className="font-semibold">
                    {imcInfo.kilosExtra.toFixed(1)} kg
                  </span>{" "}
                  por encima de tu rango saludable.
                </p>
              )}

              {waterLiters && (
                <p className="mt-1 text-emerald-800 font-medium">
                  Recomendación de agua:{" "}
                  <span className="font-bold">{waterLiters} L</span> al día
                  {waterGlasses && (
                    <>
                      {" "}
                      (≈{" "}
                      <span className="font-semibold">
                        {waterGlasses} vasos
                      </span>{" "}
                      de 250 ml).
                    </>
                  )}
                </p>
              )}

              <p className="mt-1 text-[11px] text-gray-500">
                Este análisis es orientativo y no reemplaza la opinión de un
                profesional de salud.
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 text-xs md:text-sm flex flex-col justify-between">
              <div>
                <p className="font-semibold text-amber-800">
                  HealthScore estimado a 30 días
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-700">
                  {healthScore}
                  <span className="text-base font-medium text-amber-600">
                    /100
                  </span>
                </p>
                <p className="mt-1 text-amber-800">
                  Basado en tu objetivo, tu IMC y el protocolo sugerido de
                  productos + hábitos.
                </p>
              </div>
              <div className="mt-2 h-20 md:h-24">
                <ResponsiveContainer>
                  <LineChart data={progressData}>
                    <CartesianGrid stroke="#eee" />
                    <XAxis dataKey="semana" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="imc"
                      stroke="#0f766e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Productos recomendados */}
        <div className="space-y-2">
          <h3 className="text-sm md:text-base font-semibold text-gray-800">
            Productos recomendados para ti
          </h3>

          <div className="space-y-2">
            {recommendations.main.length > 0 && (
              <>
                <p className="text-[11px] font-semibold text-emerald-700">
                  IDEALES para tu objetivo e IMC
                </p>
                <div className="grid md:grid-cols-3 gap-2">
                  {recommendations.main.map((p) => (
                    <div
                      key={p.id}
                      className="relative border border-emerald-100 rounded-lg p-2 bg-white flex flex-col gap-0.5"
                    >
                      {p.id === "te_divina_original" && (
                        <div className="absolute -top-2 right-2 bg-red-600 text-[10px] text-white px-2 py-0.5 rounded-full shadow">
                          Paga 4 y llévate 6
                        </div>
                      )}
                      <p className="font-semibold text-xs text-gray-800 line-clamp-2">
                        {p.name}
                      </p>
                      {p.img && (
                        <img
                          src={p.img}
                          alt={p.name}
                          className="h-14 object-contain mx-auto"
                        />
                      )}
                      <p className="text-[10px] text-gray-600">
                        {reasonForProduct(p, profile, imcInfo)}
                      </p>
                      <button
                        className="text-[11px] px-2 py-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => {
                          window.open(
                            `https://wa.me/52${waNumber}?text=Hola, quiero pedir ${encodeURIComponent(
                              p.name
                            )} del análisis personalizado.`,
                            "_blank"
                          );
                        }}
                      >
                        Quiero este producto
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {recommendations.secondary.length > 0 && (
              <>
                <p className="text-[11px] font-semibold text-amber-700 mt-1.5">
                  Complementos que pueden potenciar tus resultados
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {recommendations.secondary.map((p) => (
                    <span
                      key={p.id}
                      className="px-2.5 py-1 text-[11px] rounded-full bg-amber-50 border border-amber-200 text-amber-800"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Plan nutricional como regalo */}
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs md:text-sm">
          <p className="font-semibold text-amber-800 flex items-center gap-2">
            🎁 Regalo exclusivo: Plan Nutricional 30 Días
          </p>
          <p className="mt-1 text-amber-800">
            Al armar tu pedido conmigo, te regalo un plan mensual de alimentación
            personalizado para acompañar los productos Vida Divina.
          </p>
          <button
            onClick={() => setShowPlanPreview((v) => !v)}
            className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs hover:bg-amber-700"
          >
            {showPlanPreview
              ? "Ocultar vista previa"
              : "Ver ejemplo rápido de mi plan mensual"}
          </button>

          {showPlanPreview && monthlyPlan.length > 0 && (
            <div className="mt-2 space-y-1 text-[11px] md:text-xs">
              {monthlyPlan.map((w) => (
                <div key={w.semana} className="mb-1.5">
                  <p className="font-semibold">
                    {w.semana}: <span className="font-normal">{w.foco}</span>
                  </p>
                </div>
              ))}
              {/* Ejemplo compacto de alimentación diaria */}
              <div className="mt-1 border-t border-amber-200 pt-1">
                <p className="font-semibold text-amber-800">
                  Ejemplo de alimentación diaria:
                </p>
                <p>
                  <b>Desayuno:</b> {monthlyPlan[0].diet.breakfast}
                </p>
                <p>
                  <b>Comida:</b> {monthlyPlan[0].diet.lunch}
                </p>
                <p>
                  <b>Cena:</b> {monthlyPlan[0].diet.dinner}
                </p>
                <p>
                  <b>Snacks:</b> {monthlyPlan[0].diet.snacks}
                </p>
                <p className="mt-1 text-[10px] text-amber-700">
                  El plan completo te lo envío después de confirmar tu compra,
                  ajustado a tus horarios, gustos y productos elegidos. 💚
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones fuera del área PDF */}
      <div className="grid md:grid-cols-2 gap-3">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800"
        >
          Descargar mi análisis en PDF
        </button>
        <button
          onClick={() => {
            window.open(
              `https://wa.me/52${waNumber}?text=Hola, vengo de mi análisis personalizado y quiero armar mi paquete.`,
              "_blank"
            );
          }}
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
        >
          Hablar con Diana por WhatsApp
        </button>
      </div>
    </div>
  );
}






