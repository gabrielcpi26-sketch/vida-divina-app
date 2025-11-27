// src/lib/recover.js
import { STORAGE, loadJSON } from "./storage";

/**
 * Normaliza un id a string estable.
 */
function normId(x) {
  if (x == null) return "";
  const s = String(x).trim();
  return s === "" ? "" : s;
}

/**
 * Intenta leer "variantes" históricas por si tu app los usó en algún momento.
 */
function readAllContentCandidates() {
  const main = loadJSON(STORAGE.CONTENT, {});
  // Si alguna vez tuviste otra clave, agrégala aquí:
  const legacy1 = loadJSON("VD_CONTENT", {});
  const legacy2 = loadJSON("VIDA_CONTENT", {});
  const merged = { ...legacy1, ...legacy2, ...main };
  return merged;
}

/**
 * Reconstruye productos desde el contenido local guardado por ti en el navegador.
 * Usa los campos que sueles editar: name/title, blurb, bullets, img, category,
 * ingredients, benefits, keywords.
 */
export function recoverProductsFromLocal() {
  try {
    const content = readAllContentCandidates();
    const prices = loadJSON(STORAGE.PRICES, {});
    const products = [];

    Object.keys(content || {}).forEach((rawId) => {
      const id = normId(rawId);
      if (!id) return;

      const c = content[rawId] || {};
      const priceObj = prices[rawId] || {};

      const name = c.name || c.title || `Producto ${id}`;
      const img = c.img || c.image || "/images/placeholder.png";
      const blurb = c.blurb || "";
      const bullets = Array.isArray(c.bullets) ? c.bullets : [];
      const category = c.category ? String(c.category).trim() : "otros";
      const ingredients = Array.isArray(c.ingredients) ? c.ingredients : [];
      const benefits = Array.isArray(c.benefits) ? c.benefits : [];
      const keywords = Array.isArray(c.keywords) ? c.keywords : [];

      products.push({
        id,
        category,
        name,
        img,
        blurb,
        bullets,
        ingredients,
        benefits,
        keywords,
        _price: priceObj.price ?? null,
        _promoPercent: priceObj.promoPercent ?? null,
        _originalPrice: priceObj.originalPrice ?? null,
      });
    });

    return products;
  } catch (e) {
    console.warn("recoverProductsFromLocal error:", e);
    return [];
  }
}

/**
 * Une el catálogo base con lo recuperado:
 * - Agrega los que falten (por id).
 * - Si coincide id, rellena huecos de base con datos locales (img, bullets, etc).
 */
export function mergeBaseWithRecovered(baseProducts = [], recovered = []) {
  const byId = new Map();
  (baseProducts || []).forEach((p) => {
    const id = normId(p.id);
    if (!id) return;
    byId.set(id, { ...p, id });
  });

  (recovered || []).forEach((r) => {
    const id = normId(r.id);
    if (!id) return;
    if (!byId.has(id)) {
      byId.set(id, { ...r, id });
    } else {
      const cur = byId.get(id);
      byId.set(id, {
        ...cur,
        img: cur.img || r.img,
        blurb: cur.blurb || r.blurb,
        bullets:
          (Array.isArray(cur.bullets) && cur.bullets.length ? cur.bullets : []) ||
          (Array.isArray(r.bullets) ? r.bullets : []),
        ingredients:
          (Array.isArray(cur.ingredients) && cur.ingredients.length ? cur.ingredients : []) ||
          (Array.isArray(r.ingredients) ? r.ingredients : []),
        benefits:
          (Array.isArray(cur.benefits) && cur.benefits.length ? cur.benefits : []) ||
          (Array.isArray(r.benefits) ? r.benefits : []),
        keywords:
          (Array.isArray(cur.keywords) && cur.keywords.length ? cur.keywords : []) ||
          (Array.isArray(r.keywords) ? r.keywords : []),
      });
    }
  });

  // Devuelve en orden estable: primero base (con huecos llenados), luego puramente recuperados.
  const baseIds = new Set((baseProducts || []).map((p) => normId(p.id)));
  const baseList = [];
  const recOnly = [];
  for (const v of byId.values()) {
    (baseIds.has(v.id) ? baseList : recOnly).push(v);
  }
  return [...baseList, ...recOnly];
}
