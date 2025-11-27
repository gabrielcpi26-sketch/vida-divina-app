// ================================
// 📦 Almacenamiento local seguro
// ================================
export const STORAGE = {
  HERO: 'vd_hero',
  SOCIAL: 'vd_social',
  TESTIMONIALS: 'vd_testimonials',
  PRICES: 'vd_prices',
  CONTENT: 'vd_content',
  MEDIA: 'vd_media',
  BMI: 'vd_bmi',
  ATTACHMENTS: 'vd_attachments',
};

// -----------------------------
// Guardar / Cargar JSON seguro
// -----------------------------
export function saveJSON(key, value) {
  if (!key) return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

export function loadJSON(key, fallback = null) {
  if (!key) return fallback;
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch (e) {
    return fallback;
  }
}

// -----------------------------
// Helpers de seguridad
// -----------------------------
export function safeStr(v) {
  try { if (v == null) return ''; return String(v).trim(); } catch { return ''; }
}
export function safeNum(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
export function safeObj(v, def = {}) {
  return v && typeof v === 'object' && !Array.isArray(v) ? v : def;
}
export function safeArr(v, def = []) {
  return Array.isArray(v) ? v : def;
}

// -----------------------------
// 🧩 Conversión a array seguro
// -----------------------------
export function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  return [v];
}

// -----------------------------
// 💲 Formateo de precios
// -----------------------------
export function formatPrice(value, currency = 'MXN', locale = 'es-MX') {
  try {
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
  } catch {
    return '';
  }
}

// -----------------------------
// 🔗 Link de WhatsApp
// -----------------------------
export function whatsLink(phone, message = '') {
  const clean = String(phone || '').replace(/[^\d]/g, '');
  if (!clean) return 'https://wa.me';
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// -----------------------------
// Compatibilidad adicional
// -----------------------------
export const placeholder = null;


