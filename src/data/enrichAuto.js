// src/data/enrichAuto.js
const CAT_HINTS = {
  cafes: {
    keywords: ["energía", "café", "reishi"],
    benefits: ["Aporta energía suave"]
  },
  tes: {
    keywords: ["té", "digestión", "detox"],
    benefits: ["Apoyo digestivo suave"]
  },
  extractos: {
    keywords: ["extracto", "hongo", "bienestar"],
    benefits: ["Soporte general de bienestar"]
  },
  capsulas: {
    keywords: ["nutrición", "suplemento"],
    benefits: ["Apoyo nutricional diario"]
  },
  batidos: {
    keywords: ["proteína", "saciedad"],
    benefits: ["Soporte de saciedad y recuperación"]
  },
  cereal: {
    keywords: ["fibra", "saciedad"],
    benefits: ["Aporte de fibra y saciedad"]
  },
  aceites: {
    keywords: ["aceite", "omega"],
    benefits: ["Aporte de ácidos grasos saludables"]
  },
  otros: {
    keywords: ["bienestar", "funcional"],
    benefits: ["Producto funcional de apoyo general"]
  }
};

// Saca palabras útiles del nombre
function deriveFromName(name = "") {
  const n = name.toLowerCase();
  const kw = [];
  if (/\bcafé|\bcafe\b/.test(n)) kw.push("café", "energía");
  if (/\bté|\bte\b/.test(n)) kw.push("té", "digestión");
  if (/\bslim|sculpt|fit\b/.test(n)) kw.push("control de peso");
  if (/\bcolágeno|collagen\b/.test(n)) kw.push("colágeno", "belleza");
  if (/\bomega\b/.test(n)) kw.push("omega", "corazón");
  if (/\bcordy|cordyceps\b/.test(n)) kw.push("cordyceps", "energía");
  if (/\blion|melena\b/.test(n)) kw.push("melena de león", "mente");
  if (/\bchaga\b/.test(n)) kw.push("chaga", "antioxidante");
  return Array.from(new Set(kw));
}

export function autoEnrichFrom(products = []) {
  const map = {};
  for (const p of products) {
    const id = p.id;
    const cat = (p.category || "otros").toLowerCase();
    const hints = CAT_HINTS[cat] || CAT_HINTS["otros"];
    const nameKW = deriveFromName(p.name || p.title || "");

    map[id] = {
      ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
      keywords: Array.from(new Set([...(p.keywords || []), ...hints.keywords, ...nameKW])),
      benefits: Array.from(new Set([...(p.benefits || []), ...hints.benefits]))
    };
  }
  return map;
}
