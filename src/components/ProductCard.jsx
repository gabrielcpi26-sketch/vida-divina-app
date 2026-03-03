// src/components/ProductCard.jsx
import React, { useMemo } from "react";
import { saveLead } from "../lib/leads"; // ajusta si tu ruta es diferente

export default function ProductCard({
  product,
  profile,
  editMode = false,
  prices,
  setPrices,
  onOpenAttachments,
  content = {},
}) {
  const pid = product?.id;
  const overrides = (pid && content?.[pid]) || {};

  const safeName = overrides?.name || product?.name || product?.title || "Producto";
 const safeImg =
  overrides?.img ||
  product?.custom_img ||
  product?.img ||
  "";

 // ============================
// PRECIOS (Supabase = default)
// ============================
const price = useMemo(() => {
  if (editMode) {
    const pv = prices?.[pid]?.price;
    if (pv !== undefined && pv !== null) return Number(pv);
  }
  return Number(product?.price || 0);
}, [editMode, prices, pid, product?.price]);

const discount = useMemo(() => {
  if (editMode) {
    const dv = prices?.[pid]?.discount;
    if (dv !== undefined && dv !== null) return Number(dv);
  }
  return Number(product?.discount || 0);
}, [editMode, prices, pid, product?.discount]);

const unitPrice = useMemo(() => {
  if (editMode) {
    const uv = prices?.[pid]?.unitPrice;
    if (uv !== undefined && uv !== null) return Number(uv);
  }
  // soporta unitPrice normalizado en App.jsx o unit_price directo
  return Number(product?.unitPrice ?? product?.unit_price ?? 0);
}, [editMode, prices, pid, product?.unitPrice, product?.unit_price]);

const finalPrice = useMemo(() => {
  const p = Number(price) || 0;
  const d = Math.min(95, Math.max(0, Number(discount) || 0));
  return Math.round((p * (100 - d)) / 100);
}, [price, discount]);

  // ============================
  // TEXTO
  // ============================
  const benefitsSource =
    Array.isArray(overrides?.benefits) && overrides.benefits.length
      ? overrides.benefits
      : Array.isArray(product?.benefits)
      ? product.benefits
      : [];

  const bulletsSource =
    Array.isArray(overrides?.bullets) && overrides.bullets.length
      ? overrides.bullets
      : Array.isArray(product?.bullets)
      ? product.bullets
      : [];

  const highlightLines = (benefitsSource.length ? benefitsSource : bulletsSource).slice(0, 3);

  const packageUnits = overrides?.packageUnits ?? product?.packageUnits ?? null;

const promo = editMode ? (prices?.[pid]?.promo || "") : (product?.promo || product?.promo_text || "");

  // ============================
  // Guardar precios/promo
  // ============================
  function updateNumeric(field, value) {
    if (!pid) return;
    setPrices?.((prev) => ({
      ...prev,
      [pid]: {
        ...(prev?.[pid] || {}),
        price,
        discount,
        unitPrice,
        promo,
        [field]: value === "" ? "" : Number(value),
      },
    }));
  }

function getUTM(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function handlePayNow() {
  const phone = "527291022897";
  const amount = Number(finalPrice || price || 0);
  const message = `Hola, quiero el paquete de ${safeName} por $${amount} MXN.`;
  const link = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

  const bmiObj = profile && typeof profile === "object" ? profile : {};
  const imc = bmiObj?.bmi ?? bmiObj?.imc ?? null;
  const clasificacion_imc =
    bmiObj?.category?.label ?? bmiObj?.clasificacion_imc ?? null;
  const objetivo = bmiObj?.objective ?? bmiObj?.objetivo ?? null;

  const isUUID = (v) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(v || "")
    );

  // ✅ ESTE es tu tenant UUID REAL (lo viste en consola)
  const FALLBACK_TENANT_UUID = "4c7f5e26-de17-4933-83df-84d938cd2073";

  try {
    // 1) Guardar lead (como ya lo hacías)
    try {
      await saveLead({
        nombre: bmiObj?.name ?? bmiObj?.nombre ?? null,
        telefono: bmiObj?.phone ?? bmiObj?.telefono ?? null,
        objetivo,
        imc,
        clasificacion_imc,
        producto_interes: safeName,
        utm_source: getUTM("utm_source"),
        utm_campaign: getUTM("utm_campaign"),
      });
    } catch (e) {
      console.warn("saveLead error:", e?.message || e);
    }

    // 2) TenantId: SIEMPRE UUID (si viene mal, usamos el bueno)
    const urlParams = new URLSearchParams(window.location.search);

    const tenantIdRaw =
      urlParams.get("tenantId") ||
      localStorage.getItem("vd_tenant_id") ||
      localStorage.getItem("tenant_id") ||
      "";

    const tenantId = isUUID(tenantIdRaw) ? tenantIdRaw : FALLBACK_TENANT_UUID;

    // 3) fromPhone (cliente) para metadata
    const fromPhoneRaw =
      urlParams.get("from") ||
      bmiObj?.phone ||
      bmiObj?.telefono ||
      "direct_web";

    const fromPhone = String(fromPhoneRaw || "")
      .replace(/[^\d]/g, "")
      .slice(0, 20) || "direct_web";

    const API_BASE = (import.meta?.env?.VITE_API_URL || "http://localhost:3002").replace(/\/$/, "");

    const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        fromPhone,
        amount,
        productName: safeName,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.url) {
      window.location.href = data.url; // ✅ Stripe Checkout
      return;
    }

    console.warn("Stripe session no creada. Fallback a WhatsApp:", data);
    window.open(link, "_blank");
  } catch (err) {
    console.error("Stripe error:", err);
    window.open(link, "_blank");
  }
}
function updatePromo(value) {
  if (!pid) return;
  setPrices?.((prev) => ({
    ...prev,
    [pid]: {
      ...(prev?.[pid] || {}),
      price,
      discount,
      unitPrice,
      promo: value,
    },
  }));
}

  return (
    <div className="h-full rounded-2xl bg-white border border-emerald-100 shadow-sm overflow-hidden flex flex-col text-xs sm:text-sm">
      {/* IMAGEN */}
      <div className="w-full h-48 sm:h-56 bg-white flex items-center justify-center p-2 sm:p-3 relative">
        {promo && !editMode && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full shadow">
            {promo}
          </div>
        )}

        {safeImg ? (
          <img
            src={safeImg}
            alt={safeName}
            className="w-full h-full object-contain object-center transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-[11px] sm:text-xs text-gray-500">Sin imagen</div>
        )}
      </div>

      {/* CONTENIDO */}
      <div className="p-2 sm:p-3 flex-1 flex flex-col gap-2">
        <div className="font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem]">
          {safeName}
        </div>

        {highlightLines.length > 0 && (
          <ul className="text-[11px] text-gray-600 list-disc ml-4 space-y-0.5 min-h-[3.2rem] line-clamp-3">
            {highlightLines.map((line, i) => (
              <li key={i} className="leading-snug">
                {line}
              </li>
            ))}
          </ul>
        )}

        {/* PRECIOS */}
        <div className="mt-1 sm:mt-2">
          {editMode ? (
          <div className="grid grid-cols-2 gap-2 items-end">
              <label className="text-[11px] text-gray-500">
                Precio paquete
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-emerald-200 px-2 py-1 text-xs sm:text-sm"
                  value={price === "" ? "" : price}
                  onChange={(e) => updateNumeric("price", e.target.value)}
                  placeholder="0"
                />
              </label>

              <label className="text-[11px] text-gray-500">
                % Desc.
                <input
                  type="number"
                  min="0"
                  max="95"
                  className="mt-1 w-full rounded-lg border border-emerald-200 px-2 py-1 text-xs sm:text-sm"
                  value={discount === "" ? "" : discount}
                  onChange={(e) => updateNumeric("discount", e.target.value)}
                  placeholder="0"
                />
              </label>

              <label className="col-span-2 text-[11px] text-gray-500">
                Precio por pieza (opcional)
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-emerald-200 px-2 py-1 text-xs sm:text-sm"
                  value={unitPrice === "" ? "" : unitPrice}
                  onChange={(e) => updateNumeric("unitPrice", e.target.value)}
                  placeholder="0"
                />
              </label>

              <label className="col-span-2 text-[11px] text-gray-500">
                Promo (opcional)
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-emerald-200 px-2 py-1 text-xs sm:text-sm"
                  value={promo}
                  onChange={(e) => updatePromo(e.target.value)}
                  placeholder="Ej: Paga 4 y llévate 6"
                />
              </label>

              <div className="col-span-2 text-xs sm:text-sm">
                <span className="text-gray-500">Final paquete: </span>
                <span className="font-bold text-emerald-700">${finalPrice}</span>
                {discount > 0 && (
                  <span className="ml-2 text-[11px] text-gray-400 line-through">
                    ${Number(price) || 0}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1.5">
                <div className="text-base sm:text-lg font-extrabold text-emerald-700">
                  ${finalPrice}
                </div>
                {discount > 0 && (
                  <>
                    <div className="text-[11px] text-gray-400 line-through">
                      ${Number(price) || 0}
                    </div>
                    <div className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      -{discount}%
                    </div>
                  </>
                )}
              </div>

              {packageUnits && (
                <div className="text-[11px] text-gray-500 mt-1">
                  Paquete de {packageUnits} piezas
                </div>
              )}

              {unitPrice > 0 && (
                <div className="text-[11px] text-gray-400">
                  Pieza individual: ${unitPrice}
                </div>
              )}
            </>
          )}
        </div>

{(() => {
  // 1) Prioridad absoluta: custom_blurb (vd_products_pro) o override (si lo manejas en content)
  const custom =
    String(overrides?.custom_blurb || product?.custom_blurb || "").trim();

  // 2) blurb normal si existe y no es placeholder
  const blurb = String(overrides?.blurb || product?.blurb || "").trim();
  const isPlaceholder = blurb.toLowerCase() === "producto vida divina";

  // 3) fallback PRO (solo si NO hay custom_blurb)
  const benefitsSource =
    Array.isArray(overrides?.benefits) && overrides.benefits.length
      ? overrides.benefits
      : Array.isArray(product?.benefits)
      ? product.benefits
      : [];

  const bulletsSource =
    Array.isArray(overrides?.bullets) && overrides.bullets.length
      ? overrides.bullets
      : Array.isArray(product?.bullets)
      ? product.bullets
      : [];

  const autoPro =
    (benefitsSource[0] ? String(benefitsSource[0]).trim() : "") ||
    (bulletsSource[0] ? String(bulletsSource[0]).trim() : "");

  // ✅ MOSTRAR custom_blurb si existe (esto es lo que tú tenías antes)
  if (custom) {
    return (
      <div className="mt-1 text-[11px] text-emerald-700 font-medium">
        {custom}
      </div>
    );
  }

  // Mostrar blurb real si existe
  if (blurb && !isPlaceholder) {
    return (
      <div className="mt-1 text-[11px] text-emerald-700 font-medium">
        {blurb}
      </div>
    );
  }

  // Fallback pro solo si hay bullets/benefits
  if (autoPro) {
    return (
      <div className="mt-1 text-[11px] text-emerald-700 font-medium">
        {autoPro}
      </div>
    );
  }

  return null;
})()}

           {/* BLOQUE BOTONES */}
      <div className="mt-auto flex flex-col gap-2">
        {/* ✅ VER MÁS */}
        <button
          type="button"
          onClick={() => {
            if (typeof onOpenAttachments === "function") {
              onOpenAttachments(product);
            }
          }}
          className="mt-1 sm:mt-2 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 text-xs sm:text-sm hover:bg-emerald-50"
        >
          Ver más
        </button>

        {/* Pagar ahora */}
        <button
          type="button"
          onClick={handlePayNow}
          className="mt-1 sm:mt-2 w-full text-center rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow hover:opacity-90"
        >
          Pagar ahora
        </button>
      </div>
    </div>
  </div>
);
}