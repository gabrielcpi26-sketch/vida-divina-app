// src/components/ProductGallery.jsx
import React, { useMemo } from "react";
import ProductCard from "./ProductCard";

function prettyLabel(cid) {
  const key = String(cid || "").trim().toLowerCase();
  if (!key || key === "todas") return "Todas";

  // etiquetas bonitas (sin cambiar el id real)
  const map = {
    cafe: "Cafés",
    tes: "Tés",
    extractos: "Extractos",
    suplementos: "Suplementos",
    proteinas: "Proteínas",
    belleza: "Belleza",
    sculpt: "Sculpt",
    afiliacion: "Afiliación",
    general: "General",
  };

  return map[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}



export default function ProductGallery({
  mergedProducts = [],
  rec = null,
  category = "todas",
  setCategory,
  query = "",
  setQuery,
  prices,
  setPrices,
  content,
  setContent,
  editMode = false,
  onOpen, // abrir modal del producto (si aplica)
  onOpenAttachments, // abrir “Ver más”
}) {
  const norm = (s) => String(s || "").toLowerCase();

const categories = useMemo(() => {
  const set = new Set();
  (mergedProducts || []).forEach((p) => {
    const c = String(p?.category || "").trim().toLowerCase();
    if (c) set.add(c);
  });
  return ["todas", ...Array.from(set).sort()];
}, [mergedProducts]);

const filtered = useMemo(() => {
  const q = norm(query);
  const cat = String(category || "todas").trim().toLowerCase();

return (mergedProducts || []).filter((p) => {
  // ✅ Ocultar duplicados de "pieza" en el catálogo
  const pid = String(p?.id || "").trim().toLowerCase();
  if (pid.endsWith("_pieza")) return false;

  const pcat = String(p?.category || "").trim().toLowerCase();
  const passCat = cat === "todas" || !cat ? true : pcat === cat;
  if (!passCat) return false;

  if (!q) return true;

  const haystack = [
    p.name,
    p.title,
    p.blurb,
    ...(Array.isArray(p.bullets) ? p.bullets : []),
    ...(Array.isArray(p.ingredients) ? p.ingredients : []),
    ...(Array.isArray(p.keywords) ? p.keywords : []),
    ...(Array.isArray(p.benefits) ? p.benefits : []),
  ]
    .filter(Boolean)
    .map(norm)
    .join(" • ");

  return haystack.includes(q);
});
}, [mergedProducts, category, query]);
const total = (mergedProducts || []).length;
  const count = filtered.length;

  // ✅ Handlers seguros (evitan “no pasa nada” por props undefined)
  const handleOpen = (product) => {
    if (typeof onOpen === "function") onOpen(product);
  };

  const handleOpenAttachments = (product) => {
    if (typeof onOpenAttachments === "function") onOpenAttachments(product);
  };

  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-4 mt-4 pb-24">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col gap-3">
        {/* Pestañas */}
        <div className="w-full overflow-x-auto">
       <div className="inline-flex items-center bg-white border border-emerald-200 rounded-xl p-1 shadow-sm">
  {categories.map((cid) => {
    const active = String(category || "todas").toLowerCase() === cid;

return (
  <button
    key={cid}
    type="button"
    onClick={() => setCategory && setCategory(cid)}
    className={[
      "px-3 py-1 text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap",
      active
        ? "bg-emerald-600 text-white shadow"
        : "text-emerald-700 hover:bg-emerald-50",
    ].join(" ")}
  >
    {prettyLabel(cid)}
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
        Mostrando <span className="font-medium text-gray-700">{count}</span> de{" "}
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

      {/* Grid */}
      {count > 0 ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              profile={rec?.profile}
              editMode={editMode}
              prices={prices}
              setPrices={setPrices}
              content={content}
              setContent={setContent}
              onOpen={() => handleOpen(p)}
              onOpenAttachments={() => handleOpenAttachments(p)}
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