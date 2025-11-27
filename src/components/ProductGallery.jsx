// src/components/ProductGallery.jsx
import React, { useMemo } from "react";
import ProductCard from "./ProductCard";

const CATEGORIES = [
  { id: "todas", label: "Todas" },
  { id: "cafes", label: "Cafés" },
  { id: "tes", label: "Tés" },
  { id: "extractos", label: "Extractos" },
  { id: "aceites", label: "Aceites" },
  { id: "cereal", label: "Cereal" },
  { id: "batidos", label: "Batidos" },
  { id: "capsulas", label: "Cápsulas" },
  { id: "otros", label: "Otros" },
];

export default function ProductGallery({
  mergedProducts = [],
  rec = null, // reservado para recomendaciones
  category,
  setCategory,
  query,
  setQuery,
  prices,
  setPrices,
  content,
  setContent,
  editMode = false,
  onOpen,
  onOpenAttachments,
}) {
  // Normaliza texto
  function norm(s) {
    return String(s || "").toLowerCase();
  }

  // Filtrado por categoría + búsqueda
  const filtered = useMemo(() => {
    const q = norm(query);
    return mergedProducts.filter((p) => {
      const passCat =
        category === "todas" || !category ? true : p.category === category;
      if (!passCat) return false;

      if (!q) return true;

      const haystack = [
        p.name,
        p.title,
        p.blurb,
        ...(Array.isArray(p.bullets) ? p.bullets : []),
        ...(Array.isArray(p.ingredients) ? p.ingredients : []),
        ...(Array.isArray(p.keywords) ? p.keywords : []),
      ]
        .filter(Boolean)
        .map(norm)
        .join(" • ");

      return haystack.includes(q);
    });
  }, [mergedProducts, category, query]);

  const total = mergedProducts.length;
  const count = filtered.length;

  return (
    // 📱 Contenedor tipo pantalla de celular
    <section className="mx-auto max-w-md px-3 mt-4 pb-24">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col gap-3">
        {/* Pestañas de categoría */}
        <div className="w-full overflow-x-auto">
          <div className="inline-flex items-center bg-white border border-emerald-200 rounded-xl p-1 shadow-sm">
            {CATEGORIES.map((c) => {
              const active = (category || "todas") === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory && setCategory(c.id)}
                  className={[
                    "px-3 py-1 text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap",
                    active
                      ? "bg-emerald-600 text-white shadow"
                      : "text-emerald-700 hover:bg-emerald-50",
                  ].join(" ")}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buscador */}
        <div className="w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos, ingredientes, beneficios…"
              value={query}
              onChange={(e) => setQuery && setQuery(e.target.value)}
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 pr-9 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">
              ⌕
            </span>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-3 text-[11px] text-gray-500">
        Mostrando{" "}
        <span className="font-medium text-gray-700">{count}</span> de{" "}
        <span className="font-medium text-gray-700">{total}</span> productos
        {category && category !== "todas" ? (
          <>
            {" "}
            en <span className="uppercase">{category}</span>
          </>
        ) : null}
        {query ? (
          <>
            {" "}
            — búsqueda: <span className="italic">“{query}”</span>
          </>
        ) : null}
      </div>

      {/* Grid de productos (2 columnas tipo app) */}
      {count > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              profile={rec?.profile}
              editMode={editMode}
              prices={prices}
              setPrices={setPrices}
              onOpen={onOpen}
              onOpenAttachments={onOpenAttachments}
            />
          ))}
        </div>
      ) : (
        <EmptyState onClear={() => setQuery && setQuery("")} />
      )}
    </section>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="mt-10 rounded-2xl border border-emerald-100 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
      <div className="text-emerald-700 font-semibold">Sin resultados</div>
      <div className="mt-1 text-xs sm:text-sm">
        Ajusta la categoría o limpia tu búsqueda para ver más productos.
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm"
      >
        Limpiar búsqueda
      </button>
    </div>
  );
}
