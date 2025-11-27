// src/components/ProductCard.jsx
import React, { useMemo } from "react";

export default function ProductCard({
  product,
  profile,
  editMode = false,
  prices,
  setPrices,
  onOpenAttachments,
}) {

  const pid = product.id;

  const price = useMemo(() => {
    const pv = prices?.[pid]?.price;
    return pv !== undefined && pv !== null ? Number(pv) : Number(product.price || 0);
  }, [prices, pid, product.price]);

  const discount = useMemo(() => {
    const dv = prices?.[pid]?.discount;
    return dv !== undefined && dv !== null ? Number(dv) : Number(product.discount || 0);
  }, [prices, pid, product.discount]);

  const finalPrice = useMemo(() => {
    const p = Number(price) || 0;
    const d = Math.min(95, Math.max(0, Number(discount) || 0));
    return Math.round((p * (100 - d)) / 100);
  }, [price, discount]);

  function updatePrice(field, value) {
    setPrices((prev) => ({
      ...prev,
      [pid]: {
        price,
        discount,
        ...(prev?.[pid] || {}),
        [field]: value === "" ? "" : Number(value),
      },
    }));
  }

  return (
    <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm overflow-hidden flex flex-col">
      {/* Imagen del producto (ajuste automático) */}
      <div className="bg-white aspect-square flex items-center justify-center p-3">
        {product.img ? (
          <img
            src={product.img}
            alt={product.name || "Producto"}
            className="w-full h-full object-contain object-center transition-transform duration-300 hover:scale-105"
            style={{ maxHeight: "220px", objectFit: "contain" }}
            loading="lazy"
          />
        ) : (
          <div className="text-xs text-gray-500">Sin imagen</div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="font-semibold text-gray-800 line-clamp-2">{product.name}</div>

        {/* Componentes o beneficios visibles */}
        {Array.isArray(product.bullets) && product.bullets.length > 0 && (
          <ul className="text-xs text-gray-600 list-disc ml-4 space-y-0.5">
            {product.bullets.slice(0, 4).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}

        {/* Precio / Descuento */}
        <div className="mt-2">
          {editMode ? (
            <div className="grid grid-cols-2 gap-2 items-end">
              <label className="text-[11px] text-gray-500">
                Precio
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-emerald-200 px-2 py-1 text-sm"
                  value={price === "" ? "" : price}
                  onChange={(e) => updatePrice("price", e.target.value)}
                  placeholder="0"
                />
              </label>
              <label className="text-[11px] text-gray-500">
                % Desc.
                <input
                  type="number"
                  min="0"
                  max="95"
                  className="mt-1 w-full rounded-lg border border-emerald-200 px-2 py-1 text-sm"
                  value={discount === "" ? "" : discount}
                  onChange={(e) => updatePrice("discount", e.target.value)}
                  placeholder="0"
                />
              </label>
              <div className="col-span-2 text-sm">
                <span className="text-gray-500">Final: </span>
                <span className="font-bold text-emerald-700">${finalPrice}</span>
                {discount > 0 && (
                  <span className="ml-2 text-xs text-gray-400 line-through">
                    ${Number(price) || 0}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <div className="text-lg font-extrabold text-emerald-700">${finalPrice}</div>
              {discount > 0 && (
                <div className="text-xs text-gray-400 line-through">${Number(price) || 0}</div>
              )}
              {discount > 0 && (
                <div className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  -{discount}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón Ver más */}
        <button
          type="button"
          onClick={() => onOpenAttachments && onOpenAttachments(product)}
          className="mt-2 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 text-sm hover:bg-emerald-50"
        >
          Ver más
        </button>

        {/* Botón dorado Pagar ahora */}
        <a
          href={`https://wa.me/527291022897?text=${encodeURIComponent(
            `Hola, quiero ${product.name} por $${finalPrice}.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 text-center rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-2 text-sm font-semibold shadow hover:opacity-90"
        >
          Pagar ahora
        </a>
      </div>
    </div>
  );
}
