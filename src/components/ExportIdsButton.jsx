import React from "react";

export default function ExportIdsButton() {
  function handleExport() {
    const list = (window.__mergedProducts || window.__baseProducts || []).map(p => ({
      id: p.id,
      name: p.name || p.title || "",
      category: p.category || "",
      price: p.price ?? null
    }));
    if (!list.length) {
      alert("No se encontraron productos. Asegúrate de que la app haya cargado.");
      return;
    }
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "catalog-ids.json"; // ← nombre correcto
    a.click();
  }

  return (
    <button
      onClick={handleExport}
      className="fixed bottom-5 left-5 z-50 px-3 py-2 rounded-lg text-xs bg-emerald-600 text-white shadow hover:bg-emerald-700"
      title="Exportar catálogo (IDs)"
    >
      Exportar catálogo (IDs)
    </button>
  );
}
