// src/components/SmartAssessorPro.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
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
    label: "Obesidad II",
    kilosExtra: diff,
    text:
      "Es importante combinar productos específicos con seguimiento cercano. Este análisis no reemplaza una valoración médica.",
  };
}

function getWaterRecommendation(profile, imc) {
  const kg = getWeightKg(profile);
  if (!kg) return null;

  let liters = kg * 0.033;
  if (imc != null && imc >= 30) liters += 0.3;
  liters = Math.min(Math.max(liters, 1.5), 4);
  return Number(liters.toFixed(1));
}

// ===============================
// FASE 0.1 - IMC exacto + Scoring
// ===============================
function toNumberSafe(v) {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function bmiCategoryAdvanced(bmi) {
  const x = toNumberSafe(bmi);
  if (!x) return { key: "unknown", label: "No disponible" };
  if (x < 18.5) return { key: "under", label: "Bajo peso" };
  if (x < 25) return { key: "normal", label: "Normal" };
  if (x < 30) return { key: "over", label: "Sobrepeso" };
  if (x < 35) return { key: "ob1", label: "Obesidad I" };
  return { key: "ob2", label: "Obesidad II" };
}

function computeHealthScore({ bmi, age, sex, objective }) {
  let score = 100;

  const a = toNumberSafe(age);
  const b = toNumberSafe(bmi);

  const dist = Math.abs(b - 22);
  score -= dist * 2;

  if (a >= 30) score -= (a - 29) * 0.4;

  const s = String(sex || "").toLowerCase();
  if (s.includes("muj")) score += 1;
  if (s.includes("hom") || s.includes("masc")) score -= 1;

  const obj = String(objective || "").toLowerCase();
  if (obj.includes("quemar") || obj.includes("grasa")) score -= 2;
  if (obj.includes("energ")) score -= 1;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let risk = "Bajo";
  if (bmiCategoryAdvanced(b).key === "over") risk = "Moderado";
  if (bmiCategoryAdvanced(b).key === "ob1") risk = "Alto";
  if (bmiCategoryAdvanced(b).key === "ob2") risk = "Muy alto";
  if (bmiCategoryAdvanced(b).key === "under") risk = "Moderado";

  let profile = "Equilibrado";
  if (bmiCategoryAdvanced(b).key === "under") profile = "Bajo peso / posible déficit";
  if (bmiCategoryAdvanced(b).key === "over") profile = "Tendencia a acumulación";
  if (bmiCategoryAdvanced(b).key === "ob1" || bmiCategoryAdvanced(b).key === "ob2")
    profile = "Resistencia metabólica probable";

  return { healthScore: score, metabolicRisk: risk, metabolicProfile: profile };
}

// =====================
// Objetivos: NORMALIZACIÓN (QUIZ -> KEYS INTERNAS)
// =====================
function normalizeGoalKey(profile = {}) {
  const raw = (profile.goal ?? profile.objetivo ?? "").toString().trim();
  const x = raw.toLowerCase();

  // IDs exactos del ImcQuiz.jsx (compatibilidad)
  if (x === "control_peso") return "bajar_grasa";
  if (x === "estres_sueno") return "estres";

  // Ya viene como key interna
  if (
    x === "bajar_grasa" ||
    x === "aumentar_musculo" ||
    x === "energia" ||
    x === "digestion" ||
    x === "estres" ||
    x === "piel" ||
    x === "hormonal"
  ) {
    return x;
  }

  // Mapeo desde ImcQuiz.jsx (texto)
  if (x.includes("bajar grasa") || x.includes("quemar grasa") || x.includes("control de peso"))
    return "bajar_grasa";
  if (x.includes("ganar músculo") || x.includes("tonificar") || x.includes("músculo"))
    return "aumentar_musculo";
  if (x.includes("energía") || x.includes("enfoque") || x.includes("rendimiento"))
    return "energia";
  if (x.includes("digestión") || x.includes("inflam")) return "digestion";
  if (x.includes("estrés") || x.includes("estres") || x.includes("dormir") || x.includes("ansiedad"))
    return "estres";
  if (x.includes("piel") || x.includes("cabello") || x.includes("uñas")) return "piel";
  if (x.includes("horm") || x.includes("ciclo") || x.includes("menop")) return "hormonal";

  return "bajar_grasa";
}

function displayGoalLabel(goalKey) {
  if (goalKey === "bajar_grasa") return "Bajar grasa / control de peso";
  if (goalKey === "aumentar_musculo") return "Aumentar músculo / tonificar";
  if (goalKey === "energia") return "Energía y rendimiento";
  if (goalKey === "digestion") return "Digestión y desinflamación";
  if (goalKey === "estres") return "Estrés y descanso";
  if (goalKey === "piel") return "Piel, cabello y uñas";
  if (goalKey === "hormonal") return "Hormonas y ciclo";
  return "Bienestar general";
}

// =====================
// Tags/benefits esperados por objetivo (matching real)
// =====================
const GOAL_BENEFIT_TAGS = {
  bajar_grasa: ["fatloss", "metabolism", "appetite", "detox", "glucose", "digestion"],
  aumentar_musculo: ["muscle", "protein", "recovery", "energy"],
  energia: ["energy", "focus", "performance", "memory"],
  digestion: ["digestion", "antiinflamatorio", "detox", "bloating", "gut"],
  estres: ["stress", "sleep", "calm", "anxiety", "relax", "descanso"],
  piel: ["skin", "collagen", "hydration"],
  hormonal: ["hormonal", "cycle", "menopause", "ciclo", "hormonas", "pms", "menopausia", "balance"],
};

// =====================
// Reglas de productos (tu base)
// =====================
const GOAL_RULES = {
  bajar_grasa: {
    prefer: ["te_divina_original", "te_divina_latte_verde", "atom", "factor_divina", "capsulas_metabolicas"],
    avoid: ["cafes_caloricos", "batidos_altos_carbohidratos"],
  },
  aumentar_musculo: {
    prefer: ["shake_divina", "proteina_divina", "extracto_maitake", "extracto_mix_hongos"],
    avoid: ["te_diuretico_fuerte", "productos_quitan_apetito"],
  },
  energia: {
    prefer: ["atom", "cafe_divina_gold", "cafe_divina_ganoderma"],
    avoid: [],
  },
  digestion: {
    prefer: ["te_divina_original", "extracto_tremella", "extracto_turkey_tail", "factor_divina"],
    avoid: ["productos_pesados_noche"],
  },
  estres: { prefer: [], avoid: [] },
  piel: { prefer: [], avoid: [] },
  hormonal: { prefer: [], avoid: [] },
};

const GOAL_CATEGORY_BOOST = {
  bajar_grasa: { te: 12, capsula: 8 },
  aumentar_musculo: { batido: 14, proteina: 14 },
  energia: { cafe: 12, capsula: 6 },
  digestion: { te: 10, extracto: 10 },
  estres: { extracto: 12, capsula: 8 },
  piel: { extracto: 12, capsula: 8 },
  hormonal: { capsula: 14, extracto: 10 }, // clave para no meter té "por relleno"
};

function getIMCRuleIds(imc) {
  if (imc == null) return [];
  if (imc < 18.5) return ["shake_divina", "proteina_divina"];
  if (imc < 25) return ["te_divina_original", "atom"];
  if (imc < 30) return ["te_divina_original", "extracto_turkey_tail", "factor_divina", "atom"];
  if (imc < 35) return ["te_divina_original", "extracto_tremella", "factor_divina", "capsulas_metabolicas"];
  return ["te_divina_original", "extracto_tremella", "extracto_turkey_tail", "factor_divina", "capsulas_metabolicas"];
}

// Texto pro: amarra beneficio real + ingredientes si existen
function buildReasonPro(p, imcInfo, goalKey) {
  const benefits = Array.isArray(p.benefits) ? p.benefits : [];
  const keywords = Array.isArray(p.keywords) ? p.keywords : [];
  const ingredients = Array.isArray(p.ingredients) ? p.ingredients : [];

  const goalTags = GOAL_BENEFIT_TAGS[goalKey] || [];
  const haystack = [
    ...benefits.map((x) => String(x).toLowerCase()),
    ...keywords.map((x) => String(x).toLowerCase()),
    ...ingredients.map((x) => String(x).toLowerCase()),
    String(p.category || "").toLowerCase(),
    String(p.name || "").toLowerCase(),
  ].join(" | ");

  const hits = goalTags
    .filter((t) => haystack.includes(String(t).toLowerCase()))
    .slice(0, 3);

  const benefitLine =
    hits.length > 0
      ? `Se elige por beneficios clave: ${hits.join(", ")}.`
      : `Se elige porque encaja con tu objetivo y tu IMC (${imcInfo.label}).`;

  const ingLine =
    ingredients.length > 0
      ? `Enfocado en: ${ingredients.slice(0, 4).join(", ")}.`
      : "";

  return `${benefitLine} ${ingLine}`.trim();
}

// =====================
// Componente principal
// =====================
export default function SmartAssessorPro({
  profile: profileProp,
  products: productsProp,
  mergedProducts,
  onOpenById,
}) {
  const [recommendations, setRecommendations] = useState({ main: [], secondary: [], optional: [] });

  const [healthScore, setHealthScore] = useState(0);
  const [progressData, setProgressData] = useState([]);
  const [monthlyPlan, setMonthlyPlan] = useState([]);
  const [showHealth, setShowHealth] = useState(false);
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const [metabolicRisk, setMetabolicRisk] = useState("—");
  const [metabolicProfile, setMetabolicProfile] = useState("—");

  const pdfRef = useRef(null);
const leadStateSent = useRef(false);

  const profile = profileProp || {};
// Evita loops por cambios de referencia en el objeto profile
const profileStable = useMemo(
  () => ({
    age: profile.age ?? profile.edad ?? 0,
    sex: profile.sex ?? profile.sexo ?? "",
    goal: profile.goal ?? profile.objetivo ?? "",
    phone:
      profile.phone ??
      profile.telefono ??
      profile.from_phone ??
      localStorage.getItem("vd_last_whatsapp") ??
      null,
    weight:
      profile.weight ??
      profile.peso ??
      profile.pesoKg ??
      profile.kg ??
      profile.peso_kg ??
      0,
    height:
      profile.height ??
      profile.estatura ??
      profile.altura ??
      profile.altura_cm ??
      0,
    needs: profile.needs || {}
  }),
  [
    profile.age,
    profile.edad,
    profile.sex,
    profile.sexo,
    profile.goal,
    profile.objetivo,
    profile.phone,
    profile.telefono,
    profile.from_phone,
    profile.weight,
    profile.peso,
    profile.pesoKg,
    profile.kg,
    profile.peso_kg,
    profile.height,
    profile.estatura,
    profile.altura,
    profile.altura_cm,
    profile.needs
  ]
);
  const products = useMemo(() => productsProp || mergedProducts || [], [productsProp, mergedProducts]);

  const imc = useMemo(() => calcIMC(profile), [profile]);
  const imcInfo = useMemo(() => describeIMC(imc, profile), [imc, profile]);
  const waterLiters = useMemo(() => getWaterRecommendation(profile, imc), [profile, imc]);
  const waterGlasses = waterLiters ? Math.round((waterLiters * 1000) / 250) : null;

  const goalKey = useMemo(() => normalizeGoalKey(profile), [profile]);
  const goalTags = GOAL_BENEFIT_TAGS[goalKey] || [];


  // -----------------------------
  // HealthScore (computeHealthScore)
  // -----------------------------
useEffect(() => {
  if (imc == null) {
    setHealthScore(0);
    setMetabolicRisk("—");
    setMetabolicProfile("—");
    return;
  }

const age = profileStable.age;
const sex = profileStable.sex;
const objective = profileStable.goal;

  const { healthScore, metabolicRisk, metabolicProfile } = computeHealthScore({
    bmi: imc,
    age,
    sex,
    objective,
  });

  setHealthScore(healthScore);
  setMetabolicRisk(metabolicRisk);
  setMetabolicProfile(metabolicProfile);

}, [imc, profileStable]);

  // -----------------------------
  // Recomendaciones de productos (DEFINITIVO PRO)
  // -----------------------------
  useEffect(() => {
    if (!products || products.length === 0) {
      setRecommendations({ main: [], secondary: [], optional: [] });
      return;
    }

    const rule = GOAL_RULES[goalKey] || GOAL_RULES.bajar_grasa;

    const imcIds = getIMCRuleIds(imc);
    const preferIds = new Set([...(rule.prefer || []), ...imcIds]);

    const hit = (arr, tag) =>
      Array.isArray(arr) &&
      arr.some((x) => String(x).toLowerCase().includes(String(tag).toLowerCase()));

    const scored = products.map((p) => {
      let score = 0;

      // =========================
      // BASE (tu motor actual)
      // =========================
      if (preferIds.has(p.id)) score += 40;

      if (p.category === "te" && goalKey === "bajar_grasa") score += 15;
      if (p.category === "batido" && goalKey === "aumentar_musculo") score += 20;
      if (p.category === "capsula" && goalKey === "bajar_grasa") score += 10;

      if (p.tags?.includes("detox")) score += 10;
      if (p.tags?.includes("energia") && goalKey === "energia") score += 15;

      // =========================
      // PRO (matching real por datos)
      // =========================
      const benefits = Array.isArray(p.benefits) ? p.benefits : [];
      const keywords = Array.isArray(p.keywords) ? p.keywords : [];
      const bullets = Array.isArray(p.bullets) ? p.bullets : [];
      const ingredients = Array.isArray(p.ingredients) ? p.ingredients : [];

      const catBoost = GOAL_CATEGORY_BOOST[goalKey] || {};
      if (catBoost[p.category]) score += catBoost[p.category];

      const hasSignals =
        (Array.isArray(p.benefits) && p.benefits.length > 0) ||
        (Array.isArray(p.keywords) && p.keywords.length > 0) ||
        (Array.isArray(p.bullets) && p.bullets.length > 0) ||
        (Array.isArray(p.ingredients) && p.ingredients.length > 0) ||
        (Array.isArray(p.tags) && p.tags.length > 0);

      let goalHits = 0;
      goalTags.forEach((t) => {
        if (hit(benefits, t)) goalHits += 1;
        else if (hit(keywords, t)) goalHits += 0.7;
        else if (hit(ingredients, t)) goalHits += 0.4;
        else if (hit(bullets, t)) goalHits += 0.4;
      });

      // matching fuerte objetivo
      score += goalHits * 18;

      // ---- haystack completo (para reglas maestras) ----
      const cat = String(p.category || "").toLowerCase();
      const nm = String(p.name || "").toLowerCase();
      const hay = [
        ...benefits.map((x) => String(x).toLowerCase()),
        ...keywords.map((x) => String(x).toLowerCase()),
        ...ingredients.map((x) => String(x).toLowerCase()),
        ...bullets.map((x) => String(x).toLowerCase()),
        ...((Array.isArray(p.tags) ? p.tags : []).map((x) => String(x).toLowerCase())),
        cat,
        nm,
      ].join(" | ");



      // ======================================
      // 🔥 REGLAS MAESTRAS POR OBJETIVO (100%)
      // ======================================
      // A) Estrés/descanso: subir calmantes, bajar estimulantes
      if (goalKey === "estres") {
        const calmCore = ["sleep", "melatonina", "relax", "descanso", "calm", "ansiedad", "stress"];
        const stimulantCore = ["cafe", "café", "energia", "energy", "preworkout", "estimul"];
        const hasCalm = calmCore.some((t) => hay.includes(t));
        const hasStim = stimulantCore.some((t) => hay.includes(t));
        if (hasCalm) score += 45;
        if (hasStim) score -= 50;
      }

      // B) Quemar grasa: subir metabolismo/detox/glucosa, bajar "masa/volumen"
      if (goalKey === "bajar_grasa") {
        const fatCore = ["fatloss", "metabolism", "metabol", "termogen", "glucose", "appetite", "detox", "grasa", "quemar"];
        const muscleCore = ["masa", "volumen", "bulking"];
        if (fatCore.some((t) => hay.includes(t))) score += 40;
        if (muscleCore.some((t) => hay.includes(t))) score -= 15;
      }

      // C) Músculo: subir proteína/recuperación, bajar sleep/relax como TOP
      if (goalKey === "aumentar_musculo") {
        const muscleCore = ["protein", "proteina", "proteína", "muscle", "masa", "recovery", "recuper"];
        const relaxCore = ["sleep", "melatonina", "relax", "calm"];
        if (muscleCore.some((t) => hay.includes(t))) score += 45;
        if (relaxCore.some((t) => hay.includes(t))) score -= 15;
      }

      // D) Energía: subir energía/focus, bajar sleep como TOP
      if (goalKey === "energia") {
        const energyCore = ["energy", "energ", "focus", "performance", "rendimiento"];
        const sleepCore = ["sleep", "melatonina"];
        if (energyCore.some((t) => hay.includes(t))) score += 35;
        if (sleepCore.some((t) => hay.includes(t))) score -= 20;
      }

      // E) Digestión: subir digestion/antiinflamatorio/gut/fibra
      if (goalKey === "digestion") {
        const digestCore = ["digestion", "digest", "antiinflam", "gut", "bloating", "fibra", "intestin", "inflam", "detox"];
        if (digestCore.some((t) => hay.includes(t))) score += 45;
      }

      // ======================================
      // Afinación hormonal (anti-proteína genérica)
      // ======================================
      const isProteinLike =
        cat.includes("prote") ||
        cat.includes("batido") ||
        hay.includes("proteína") ||
        hay.includes("proteina") ||
        hay.includes("protein") ||
        nm.includes("pure");

      if (goalKey === "hormonal" && isProteinLike && goalHits === 0) {
        score -= 35;
      }

      const hormonalCore = ["hormonal", "ciclo", "cycle", "menopause", "menopausia", "pms", "maca", "tongkat", "adaptog"];
      const hasHormonalCore = hormonalCore.some((t) => hay.includes(t));

      if (goalKey === "hormonal" && isProteinLike && !hasHormonalCore) {
        score -= 120;
      }

      // ======================================
      // Regla MAESTRA de coherencia (definitiva)
      // Producto sin relación directa NO debe ser TOP
      // ======================================
      if (goalHits === 0) score -= 25;

      // Extra fino: en hormonal, evita que “tés” sin señal hormonal suban por default
      if (goalKey === "hormonal" && cat === "te" && goalHits === 0) score -= 10;

      // Match por needs del quiz (si vienen)
      const needs = profile.needs || {};
      Object.keys(needs).forEach((k) => {
        if (!needs[k]) return;
        if (hit(benefits, k) || hit(keywords, k)) score += 10;
      });

      // =========================
      // IMC Rules definitivas
      // =========================
      if (imc != null && imc < 25) {
        if (hit(benefits, "detox") || hit(keywords, "detox")) score -= 4;
        if (hit(benefits, "hydration") || hit(keywords, "hydration")) score += 3;
        if (hit(benefits, "digestion") || hit(keywords, "digestion")) score += 4;
      }

      if (imc != null && imc >= 25 && imc < 30) {
        if (hit(benefits, "digestion") || hit(keywords, "digestion")) score += 6;
        if (hit(benefits, "antiinflamatorio") || hit(keywords, "antiinflamatorio")) score += 6;
        if (hit(benefits, "metabolism") || hit(keywords, "metabolism")) score += 5;
        if (hit(benefits, "appetite") || hit(keywords, "appetite")) score += 4;
      }

      if (imc != null && imc >= 30) {
        if (hit(benefits, "fatloss") || hit(keywords, "fatloss")) score += 10;
        if (hit(benefits, "glucose") || hit(keywords, "glucose")) score += 8;
        if (hit(benefits, "metabolism") || hit(keywords, "metabolism")) score += 8;
        if (hit(benefits, "detox") || hit(keywords, "detox")) score += 6;
      }

      // Ajustes suaves por riesgo/perfil
      const age = profile.age ?? profile.edad ?? 0;
      if (metabolicRisk === "Alto") score += 4;
      if (metabolicRisk === "Muy alto") score += 6;
      if (String(metabolicProfile).toLowerCase().includes("acumulación")) score += 3;
      if (String(metabolicProfile).toLowerCase().includes("resistencia")) score += 4;
      if (age >= 40) score += 2;

      // =========================
      // NO recomendar “paquetes” sin info real
      // =========================
      const isPack =
        p.category === "afiliacion" ||
        String(p.id || "").startsWith("paq_") ||
        String(p.name || "").toLowerCase().includes("paquete");

      if (isPack && !hasSignals) score -= 300;

      // Penalización por evitar (igual que antes)
      const avoidList = rule?.avoid || [];
      if (avoidList.includes(p.id) || p.tags?.includes("evitar")) score -= 100;

      return { ...p, score, _hasSignals: hasSignals, _isPack: isPack };
    });

    // =======================================
    // Regla maestra: asegurar "núcleo" del objetivo en TOP
    // =======================================
    const coreTagsByGoal = {
      bajar_grasa: ["fatloss", "metabolism", "glucose", "appetite", "detox"],
      aumentar_musculo: ["muscle", "protein", "recovery"],
      energia: ["energy", "focus", "performance"],
      digestion: ["digestion", "antiinflamatorio", "gut", "bloating", "fibra"],
      estres: ["stress", "sleep", "calm", "anxiety", "relax", "descanso"],
      piel: ["skin", "collagen", "hydration"],
      hormonal: ["hormonal", "cycle", "menopause", "pms", "ciclo", "hormonas"],
    };

    const coreTags = coreTagsByGoal[goalKey] || [];
    const corePick = scored.find((p) => {
      if (p._isPack) return false;
      const b = Array.isArray(p.benefits) ? p.benefits : [];
      const k = Array.isArray(p.keywords) ? p.keywords : [];
      const i = Array.isArray(p.ingredients) ? p.ingredients : [];
      const u = Array.isArray(p.bullets) ? p.bullets : [];
      const text = [...b, ...k, ...i, ...u, p.name, p.category]
        .map((x) => String(x).toLowerCase())
        .join(" | ");
      return coreTags.some((t) => text.includes(String(t).toLowerCase()));
    });

    if (corePick) {
      const idx = scored.findIndex((x) => x.id === corePick.id);
      if (idx >= 0) scored[idx] = { ...scored[idx], score: scored[idx].score + 25 };
    }

// =======================================
// 🔥 REGLA PRO DEFINITIVA: FORZAR NÚCLEO TERAPÉUTICO REAL
// =======================================

const STRICT_CORE_TAGS = {
  estres: ["sleep", "relax", "calm", "descanso", "melatonina", "anxiety", "stress"],
  energia: ["energy", "focus", "rendimiento", "performance", "energia"],
  aumentar_musculo: ["protein", "proteina", "muscle", "recovery"],
  bajar_grasa: ["fatloss", "metabolism", "grasa", "termogen", "glucose"],
  digestion: ["digestion", "gut", "antiinflam", "fibra"],
  hormonal: ["hormonal", "cycle", "menopause", "ciclo", "hormonas"],
};

const strictTags = STRICT_CORE_TAGS[goalKey] || [];

scored.forEach((p) => {
  if (p._isPack) return;

  const b = Array.isArray(p.benefits) ? p.benefits : [];
  const k = Array.isArray(p.keywords) ? p.keywords : [];
  const i = Array.isArray(p.ingredients) ? p.ingredients : [];
  const u = Array.isArray(p.bullets) ? p.bullets : [];

  const text = [...b, ...k, ...i, ...u, p.name, p.category]
    .map((x) => String(x).toLowerCase())
    .join(" | ");

  const hasStrictCore = strictTags.some((t) =>
    text.includes(String(t).toLowerCase())
  );

  // Si NO tiene núcleo real del objetivo → penalización fuerte
  if (!hasStrictCore) {
    p.score -= 35;
  }
});

    // =========================
    // Selección PRO del TOP (SIEMPRE 3)
    // =========================
    const sorted = [...scored].sort((a, b) => b.score - a.score);

    const hasAnyInfo = (p) => {
      return (
        (Array.isArray(p?.benefits) && p.benefits.length > 0) ||
        (Array.isArray(p?.keywords) && p.keywords.length > 0) ||
        (Array.isArray(p?.bullets) && p.bullets.length > 0) ||
        (Array.isArray(p?.ingredients) && p.ingredients.length > 0) ||
        (Array.isArray(p?.tags) && p.tags.length > 0) ||
        String(p?.name || "").trim().length > 0 ||
        String(p?.category || "").trim().length > 0
      );
    };

    const hasSignalsLoose = (p) => Boolean(p?._hasSignals) || hasAnyInfo(p);

    const pickTopN = (list, n = 3) => {
      const picks = [];
      const seen = new Set();

      const push = (p) => {
        if (!p) return;
        const key = String(p.id || p.name || "");
        if (!key || seen.has(key)) return;
        seen.add(key);
        picks.push(p);
      };

      for (const p of list) {
        if (picks.length >= n) break;
        if (!p._isPack && p.score > 0 && hasSignalsLoose(p)) push(p);
      }

      for (const p of list) {
        if (picks.length >= n) break;
        if (!p._isPack && p.score > 0 && hasAnyInfo(p)) push(p);
      }

      for (const p of list) {
        if (picks.length >= n) break;
        if (!p._isPack && hasAnyInfo(p)) push(p);
      }

      return picks;
    };

    // ==========================================
    // Diversidad terapéutica (antes de pickTopN)
    // ==========================================
    const THERAPEUTIC_TYPE = {
      te: "metabolico",
      capsula: "regulador",
      extracto: "adaptogeno",
      proteina: "nutricional",
      batido: "nutricional",
      cafe: "estimulante",
    };

    const getTherapeuticType = (p) => {
      const c = String(p?.category || "").toLowerCase();
      return THERAPEUTIC_TYPE[c] || "general";
    };

    const reorderByDiversity = (list) => {
      const picks = [];
      const used = new Set();

      for (const p of list) {
        if (p._isPack) continue;
        const type = getTherapeuticType(p);
        if (!used.has(type) || picks.length < 2) {
          picks.push(p);
          used.add(type);
        }
        if (picks.length >= 3) break;
      }

      if (picks.length === 0) return list;

      const pickedIds = new Set(picks.map((x) => x.id));
      return [...picks, ...list.filter((x) => !pickedIds.has(x.id))];
    };

    const sortedDiversified = reorderByDiversity(sorted);
    const main = pickTopN(sortedDiversified, 3);

    const rest = sorted
      .filter((p) => !p._isPack)
      .filter((p) => !main.some((m) => m.id === p.id))
      .filter((p) => hasAnyInfo(p));

    const secondary = rest.slice(0, 3);
    const optional = rest.slice(3, 6);

setRecommendations({ main, secondary, optional });

// guardar recomendación principal en CRM SOLO UNA VEZ
if (main?.length && !leadStateSent.current) {

  leadStateSent.current = true;

  const recommendedIds = main.map(p => p.id);

  const tenant_id = "4c7f5e26-de17-4933-83df-84d938cd2073";

const phone = window.LEAD_PHONE || profileStable.phone;

  console.log("SMART DATA", { tenant_id, phone });

  if (tenant_id && phone) {
    try {
      fetch("https://crm-backend-zkto.onrender.com/api/public/lead-state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tenant_id,
          phone,
          recommended_products: main.map(p => ({
  id: p.id,
  name: p.name,
  price: p.price || p.precio || 0
})),
          context: {
            flow: "smart_assessor",
            goalKey,
            imc
          }
        })
      });
    } catch (e) {
      console.warn("lead-state save skipped", e);
    }
  }
}

}, [products, profileStable, imc, goalKey, metabolicRisk, metabolicProfile, goalTags]);

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
  // Plan mensual (con ejemplo)
  // -----------------------------
  useEffect(() => {
    const goal = goalKey;

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
        foco: goal === "bajar_grasa" ? "Detox, desinflamación y regular digestión." : "Activar metabolismo y energía.",
        diet: baseDiet,
      },
      {
        semana: "Semana 2",
        foco: goal === "bajar_grasa" ? "Control de antojos y balance de glucosa." : "Aumentar aporte de proteína y recuperación.",
        diet: baseDiet,
      },
      {
        semana: "Semana 3",
        foco: goal === "bajar_grasa" ? "Reforzar resultados y reducir medidas." : "Definir y mantener masa muscular.",
        diet: baseDiet,
      },
      {
        semana: "Semana 4",
        foco: "Mantenimiento y creación de hábitos sostenibles.",
        diet: baseDiet,
      },
    ];
    setMonthlyPlan(plan);
  }, [goalKey]);

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
// ===============================
// 🔥 CHECKOUT STRIPE (SMART)
// ===============================
const handleBuy = async (product) => {
  try {
    const tenant_id = "4c7f5e26-de17-4933-83df-84d938cd2073";

    const phone = window.LEAD_PHONE || profileStable.phone;

    if (!phone) {
      alert("Necesitamos tu WhatsApp antes de continuar.");
      return;
    }

    const res = await fetch(
      "https://crm-backend-zkto.onrender.com/api/stripe/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId: tenant_id,
          fromPhone: phone,
          productName: product.name,
          amount: product.price || product.precio || 0,
        }),
      }
    );

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url;
    } else {
      console.error("No checkout url", data);
      alert("Error generando pago.");
    }
  } catch (e) {
    console.error("Error checkout:", e);
    alert("Error al iniciar pago.");
  }
};

  // ===================================================================
// RENDER
// ===================================================================
return (
  <div className="mt-6 space-y-4">
    <div
      ref={pdfRef}
      className="bg-white rounded-xl shadow-sm border border-emerald-50 p-4 md:p-5 space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-emerald-700">
            Análisis Personalizado – Asesora Diana Montoya Hernández
          </h2>
          <p className="text-xs text-gray-500">
            Objetivo:{" "}
            <span className="font-semibold text-gray-700">
              {displayGoalLabel(goalKey)}
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

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-white text-emerald-800 border border-emerald-200">
                Riesgo metabólico: <b>{metabolicRisk}</b>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-white text-emerald-800 border border-emerald-200">
                Perfil: <b>{metabolicProfile}</b>
              </span>
            </div>

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
                    <span className="font-semibold">{waterGlasses} vasos</span>{" "}
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

          <div className="h-full rounded-2xl bg-white border border-emerald-100 shadow-sm overflow-hidden flex flex-col p-3">
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

      <div className="space-y-2">
        <h3 className="text-sm md:text-base font-semibold text-gray-800">
          Recomendados para tu tipo de metabolismo
        </h3>

        <div className="space-y-2">
          {recommendations.main.length > 0 && (
            <>
              <p className="text-[11px] font-semibold text-emerald-700">
                IDEALES para tu objetivo e IMC
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                {recommendations.main.map((p) => (
                  <div
                    key={p.id}
                    className="relative h-full border border-emerald-100 rounded-lg p-2 bg-white flex flex-col"
                  >
                    {p.id === "te_divina_original" && (
                      <div className="absolute -top-2 right-2 bg-red-600 text-[10px] text-white px-2 py-0.5 rounded-full shadow">
                        Paga 4 y llévate 6
                      </div>
                    )}

                    <p className="font-semibold text-xs text-gray-800 line-clamp-2 min-h-[2.25rem]">
                      {p.name}
                    </p>

<p className="text-[11px] text-gray-600 text-center">
  ✔Desinflama tu cuerpo desde la primera semana
</p>


{(() => {
  const base = Number(p.price || p.price_mxn || p.precio || p.unit_price || 0);

  // 🔥 lógica simple de oferta (NO rompe nada)
  const hasPromo = base >= 700; // aplica a productos fuertes
  const oldPrice = hasPromo ? Math.round(base * 1.25) : null;

  return (
    <div className="mt-1 text-center">
      {hasPromo && (
        <p className="text-[11px] text-gray-400 line-through">
          ${oldPrice.toLocaleString()} MXN
        </p>
      )}

      <p className="text-lg font-extrabold text-emerald-700">
        ${base.toLocaleString()} MXN
      </p>


      {hasPromo && (
        <p className="text-[11px] text-red-600 font-semibold">
          🔥 Oferta especial hoy
        </p>
      )}
    </div>
  );
})()}
<p className="text-[11px] text-gray-500 text-center">
  ⭐ 4.8 (128 reseñas)
</p>



                    {/* Imagen recomendación */}
                    <div className="w-full h-32 bg-white flex items-center justify-center p-2">
                      {p.img && (
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    {/* Motivo */}
<p className="mt-2 text-[11px] text-gray-600 line-clamp-3 min-h-[3.2rem]">
  {buildReasonPro(p, imcInfo, goalKey)}
</p>

<p className="text-[11px] text-gray-500 text-center">
  🚚 Envío desde $50 MXN
</p>

<p className="text-[11px] text-green-600 text-center">
  ✔ Pago seguro • Sin compromiso
</p>

{/* Botón abajo siempre */}
<div className="mt-auto pt-2">
 {/* 🔥 URGENCIA PRO */}
  <p className="text-[11px] text-gray-500 text-center mb-1">
    🔥 7 personas viendo este producto ahora
  </p>
<p className="text-[11px] text-red-500 text-center">
  ⏳ Últimas horas con este precio
</p>

  <button
    type="button"
    className="w-full text-[11px] px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
    onClick={async () => {
      try {
        const tenant_id = "4c7f5e26-de17-4933-83df-84d938cd2073";
        const phone = window.LEAD_PHONE || profileStable.phone;

        // 👉 1. Intentar Stripe primero
        if (phone) {
          const res = await fetch(
            "https://crm-backend-zkto.onrender.com/api/stripe/create-checkout-session",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                tenantId: tenant_id,
                fromPhone: phone,
                productName: p.name,
                amount: p.price || p.precio || 0,
              }),
            }
          );

          const data = await res.json();

          if (data?.url) {
            window.location.href = data.url;
            return; // 🔥 IMPORTANTE: corta aquí
          }
        }

        // 👉 2. Si falla Stripe → abrir catálogo
        if (typeof onOpenById === "function" && p?.id) {
          onOpenById(p.id);
          return;
        }

        // 👉 3. Último fallback → WhatsApp
        window.open(
          `https://wa.me/52${waNumber}?text=Hola, quiero pedir ${encodeURIComponent(
            p.name
          )} del análisis personalizado.`,
          "_blank"
        );
      } catch (e) {
        console.error("Error botón compra:", e);

        // fallback seguro SIEMPRE
        window.open(
          `https://wa.me/52${waNumber}?text=Hola, quiero pedir ${encodeURIComponent(
            p.name
          )} del análisis personalizado.`,
          "_blank"
        );
      }
    }}
  >
    Comprar ahora con precio especial
  </button>
</div>
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

<div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs md:text-sm">

  <p className="font-semibold text-amber-800 flex items-center gap-2">
    🎁 Regalo exclusivo: Plan Nutricional Personalizado (30 días)
  </p>

  <p className="mt-2 text-amber-800 leading-relaxed">
    Basado en tu diagnóstico, preparé un protocolo de alimentación diseñado para ayudarte a 
    <b> bajar grasa, desinflamar y mejorar tu metabolismo</b>.
  </p>

  <p className="mt-2 text-amber-800">
    Tu plan incluye:
  </p>

  <ul className="mt-1 list-disc list-inside text-amber-800 space-y-1">
    <li>Qué comer para bajar grasa</li>
    <li>Qué evitar para reducir inflamación</li>
    <li>Cómo usar tus productos recomendados</li>
    <li>Ejemplo de menú semanal</li>
  </ul>

  <p className="mt-2 text-[11px] text-amber-700">
    Solo mostramos un adelanto. Tu plan completo se envía automáticamente cuando lo desbloqueas.
  </p>

<button
  onClick={async () => {
  const tenant_id = "4c7f5e26-de17-4933-83df-84d938cd2073";

  const phone = window.LEAD_PHONE || profileStable.phone;

  if (!phone) {
    alert("Primero necesitamos tu WhatsApp para enviarte el plan.");
    return;
  }

  try {
    await fetch(
      "https://crm-backend-zkto.onrender.com/api/public/lead-state",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
     body: JSON.stringify({
  tenant_id,
  phone,
  recommended_products: recommendations.main.map(p => ({
  id: p.id,
  name: p.name,
  price: p.price || p.precio || 0
})),
  context: {
    flow: "smart_assessor",
    goalKey,
    imc,
    healthScore,

    // 🔥 NUEVO (NO ROMPE NADA)
    metabolicRisk,
    metabolicProfile,
    kilosExtra: imcInfo?.kilosExtra || null,
    imcLabel: imcInfo?.label || null,
    waterLiters,

    unlock_plan: true
  }
})
      }
    );

    // 🔥 NUEVO (NO BORRA NADA)
    const waPhone = "5214872592095";

const message = encodeURIComponent("Listo, ya hice mi análisis. ¿Qué hago ahora?");

    const url = `https://wa.me/${waPhone}?text=${message}`;

    window.open(url, "_blank");

  } catch (e) {
    console.warn("unlock plan error", e);
  }
}}
  className="relative mt-4 w-full py-4 rounded-xl text-white text-base md:text-lg font-bold 
  bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500
  shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-200"
>

  <span className="absolute -top-2 -left-2 animate-bounce text-xl">
    🎁
  </span>

  Recibir mi plan personalizado ahora

<p className="text-xs text-amber-700 mt-2 text-center">
  Basado en tu cuerpo, listo en segundos por WhatsApp
</p>

  <span className="absolute -right-2 top-1 animate-pulse text-xl">
    ✨
  </span>

</button>

<button
  onClick={() => setShowPlanPreview((v) => !v)}
  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs hover:bg-amber-700"
>
  {showPlanPreview
    ? "Ocultar vista previa"
    : "Ver ejemplo rápido de mi plan"}
</button>

{showPlanPreview && monthlyPlan.length > 0 && (
  <div className="mt-3 space-y-1 text-[11px] md:text-xs">

    {monthlyPlan.map((w) => (
      <div key={w.semana} className="mb-1.5">
        <p className="font-semibold">
          {w.semana}: <span className="font-normal">{w.foco}</span>
        </p>
      </div>
    ))}

    <div className="mt-2 border-t border-amber-200 pt-2">
      <p className="font-semibold text-amber-800">
        Ejemplo de alimentación diaria
      </p>

      <p><b>Desayuno:</b> {monthlyPlan[0].diet.breakfast}</p>
      <p><b>Comida:</b> {monthlyPlan[0].diet.lunch}</p>
      <p><b>Cena:</b> {monthlyPlan[0].diet.dinner}</p>
      <p><b>Snacks:</b> {monthlyPlan[0].diet.snacks}</p>

<p className="mt-2 text-[10px] text-amber-700">
  El plan completo se envía por WhatsApp junto con recomendaciones para usar tus productos. 💚
</p>
    </div>
  </div>
)}

</div>
</div>
</div>

);
}