// src/components/ProductAttachments.jsx
import React, { useEffect, useMemo, useState } from "react";
import { STORAGE, loadJSON, saveJSON } from "../lib/storage";
import { subirImagenACatalogo } from "../utils/subirImagen";


export default function ProductAttachments({
  productId,
  productName,
  attachments,
  setAttachments,
  onClose,
}) {
  const safeId = productId ?? "unknown";

  // Estado base
  const current = useMemo(
    () => attachments?.[safeId] || { files: [], links: [], components: [], benefits: [] },
    [attachments, safeId]
  );

  const contentAll = loadJSON(STORAGE.CONTENT, {});
  const contentFor = contentAll?.[safeId] || {};

  const [tab, setTab] = useState("cover"); // cover | components | benefits | files

  // PORTADA (nombre / imagen / blurb)
  const [nameEdit, setNameEdit] = useState(contentFor.name || productName || "");
  const [imageUrl, setImageUrl] = useState(contentFor.img || "");
  const [blurb, setBlurb] = useState(contentFor.blurb || "");

  // COMPONENTES
  const [components, setComponents] = useState(current.components || contentFor.ingredients || []);
  const [newComp, setNewComp] = useState("");

  // BENEFICIOS
  const [benefits, setBenefits] = useState(current.benefits || contentFor.benefits || []);
  const [newBenefit, setNewBenefit] = useState("");
  const [bulkBenefits, setBulkBenefits] = useState("");

  // ARCHIVOS/LINKS
  const [files, setFiles] = useState(current.files || []);
  const [links, setLinks] = useState(current.links || []);

  // ---- Funciones: PORTADA ----
function onPickCoverFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  subirImagenACatalogo(file).then((url) => {
    if (url) {
      setImageUrl(url);
      alert("Imagen subida correctamente.");
    } else {
      alert("Error al subir la imagen.");
    }
  });
}


  // ---- Funciones: Componentes ----
  function addComponent() {
    const v = (newComp || "").trim();
    if (!v) return;
    setComponents((prev) => [...prev, v]);
    setNewComp("");
  }
  function removeComponent(idx) {
    setComponents((prev) => prev.filter((_, i) => i !== idx));
  }

  // ---- Funciones: Beneficios ----
  function addBenefit() {
    const v = (newBenefit || "").trim();
    if (!v) return;
    setBenefits((prev) => [...prev, v]);
    setNewBenefit("");
  }
  function addBulkBenefits() {
    const lines = (bulkBenefits || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) return;
    setBenefits((prev) => [...prev, ...lines]);
    setBulkBenefits("");
  }
  function removeBenefit(idx) {
    setBenefits((prev) => prev.filter((_, i) => i !== idx));
  }

  // ---- Funciones: Archivos/Links ----
  function onAddFiles(e) {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    const metas = list.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified,
    }));
    setFiles((prev) => [...prev, ...metas]);
    e.target.value = "";
  }
  function onRemoveFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }
  function onAddLink() {
    const url = prompt("Pega el enlace (Drive/OneDrive/URL pública):");
    if (!url) return;
    setLinks((prev) => [...prev, { url, label: url }]);
  }
  function onRemoveLink(idx) {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  }

  // ---- Guardar TODO ----
  function handleSave(e) {
    e?.preventDefault?.();

    // 1) Guardar adjuntos (archivos/links + copia de componentes/beneficios)
    const nextForId = {
      files,
      links,
      components,
      benefits,
    };
    const nextAll = { ...(attachments || {}), [safeId]: nextForId };
    setAttachments?.(nextAll);
    saveJSON(STORAGE.ATTACHMENTS, nextAll);

    // 2) Guardar en CONTENT (nombre, img, blurb, ingredientes, beneficios)
    const curr = loadJSON(STORAGE.CONTENT, {});
    const prevFor = curr?.[safeId] || {};
    const nextContent = {
      ...curr,
      [safeId]: {
        ...prevFor,
        name: nameEdit || prevFor.name || "",
        img: imageUrl || prevFor.img || "",
        blurb: blurb || prevFor.blurb || "",
        ingredients: components || prevFor.ingredients || [],
        benefits: benefits || prevFor.benefits || [],
      },
    };
    saveJSON(STORAGE.CONTENT, nextContent);

    // 3) Parche React inmediato (si está disponible)
    if (typeof window !== "undefined" && typeof window.__applyContentPatch === "function") {
      window.__applyContentPatch(safeId, {
        name: nameEdit || "",
        img: imageUrl || "",
        blurb: blurb || "",
        ingredients: components || [],
        benefits: benefits || [],
      });
    }

    alert("¡Guardado! Portada, componentes y beneficios actualizados.");
    onClose?.();
  }

  // Reset al cambiar producto
  useEffect(() => {
    const contentAll2 = loadJSON(STORAGE.CONTENT, {});
    const contentFor2 = contentAll2?.[safeId] || {};
    setNameEdit(contentFor2.name || productName || "");
    setImageUrl(contentFor2.img || "");
    setBlurb(contentFor2.blurb || "");

    setFiles(current.files || []);
    setLinks(current.links || []);
    setComponents(current.components || contentFor2.ingredients || []);
    setBenefits(current.benefits || contentFor2.benefits || []);
    setNewComp("");
    setNewBenefit("");
    setBulkBenefits("");
    setTab("cover");
  }, [current, productName, safeId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-emerald-600 text-white flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            Adjuntos / Edición —{" "}
            <span className="opacity-90">{nameEdit || productName || safeId}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs bg-white text-emerald-700 rounded hover:bg-emerald-50"
          >
            Cerrar
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3">
          <div className="inline-flex gap-1 bg-emerald-50 p-1 rounded-lg border border-emerald-200">
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${tab === "cover" ? "bg-white border" : ""}`}
              onClick={() => setTab("cover")}
            >
              Portada
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${tab === "components" ? "bg-white border" : ""}`}
              onClick={() => setTab("components")}
            >
              Componentes
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${tab === "benefits" ? "bg-white border" : ""}`}
              onClick={() => setTab("benefits")}
            >
              Beneficios
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${tab === "files" ? "bg-white border" : ""}`}
              onClick={() => setTab("files")}
            >
              Archivos / Links
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-6">
          {/* PORTADA */}
          {tab === "cover" && (
            <section className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nombre del producto</label>
                <input
                  value={nameEdit}
                  onChange={(e) => setNameEdit(e.target.value)}
                  placeholder="Ej. Té Divina Original"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Imagen (URL)</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Pega aquí el link de la imagen (https://...)"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <div className="text-[11px] text-gray-500 mt-1">
                  Tip: También puedes <b>subir un archivo</b> y se guardará localmente (Base64).
                </div>
                <div className="mt-2">
                  <input type="file" accept="image/*" onChange={onPickCoverFile} />
                </div>

                {imageUrl ? (
                  <div className="mt-3">
                    <img
                      src={imageUrl}
                      alt="Vista previa"
                      className="w-40 h-40 object-cover rounded-lg border"
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-400">Sin imagen aún.</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Descripción corta (opcional)</label>
                <textarea
                  value={blurb}
                  onChange={(e) => setBlurb(e.target.value)}
                  placeholder="Resumen/beneficio principal que verás en la portada."
                  className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
            </section>
          )}

          {/* COMPONENTES */}
          {tab === "components" && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-emerald-700">Componentes / Ingredientes</h4>
                <span className="text-xs text-gray-500">Total: {components.length}</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={newComp}
                  onChange={(e) => setNewComp(e.target.value)}
                  placeholder="Ej. Reishi (Ganoderma)"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addComponent}
                  className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Agregar
                </button>
              </div>
              {components?.length ? (
                <ul className="mt-3 space-y-1 max-h-44 overflow-auto pr-1">
                  {components.map((c, idx) => (
                    <li key={idx} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                      <span className="truncate">{c}</span>
                      <button
                        type="button"
                        onClick={() => removeComponent(idx)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-gray-500">Sin componentes aún.</p>
              )}
            </section>
          )}

          {/* BENEFICIOS */}
          {tab === "benefits" && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-emerald-700">Beneficios</h4>
                <span className="text-xs text-gray-500">Total: {benefits.length}</span>
              </div>

              <div className="flex gap-2">
                <input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Ej. Control del apetito"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Agregar
                </button>
              </div>

              <div className="mt-3">
                <label className="block text-xs text-gray-600 mb-1">
                  Pegado masivo (una línea por beneficio)
                </label>
                <textarea
                  value={bulkBenefits}
                  onChange={(e) => setBulkBenefits(e.target.value)}
                  placeholder={"Ej.\nApoya la digestión\nAumenta energía\nMejora enfoque"}
                  className="w-full border rounded-lg px-3 py-2 text-sm min-h-[90px]"
                />
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={addBulkBenefits}
                    className="px-3 py-2 text-sm rounded-lg bg-white hover:bg-gray-50 border"
                  >
                    Agregar todas las líneas
                  </button>
                </div>
              </div>

              {benefits?.length ? (
                <ul className="mt-3 space-y-1 max-h-44 overflow-auto pr-1">
                  {benefits.map((b, idx) => (
                    <li key={idx} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                      <span className="truncate">{b}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-gray-500">Sin beneficios aún.</p>
              )}
            </section>
          )}

          {/* ARCHIVOS / LINKS */}
          {tab === "files" && (
            <section>
              <h4 className="text-sm font-semibold text-emerald-700 mb-2">Archivos</h4>
              <input type="file" multiple onChange={onAddFiles} />
              {files?.length ? (
                <ul className="mt-3 space-y-1 max-h-44 overflow-auto pr-1">
                  {files.map((f, idx) => (
                    <li key={idx} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                      <span className="truncate">
                        {f.name}{" "}
                        <span className="text-xs text-gray-500">({f.type || "archivo"})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveFile(idx)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-gray-500">Aún no hay archivos adjuntos.</p>
              )}

              <h4 className="text-sm font-semibold text-emerald-700 mt-4 mb-2">Enlaces</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onAddLink}
                  className="px-3 py-2 text-sm rounded-lg bg-white hover:bg-gray-50 border"
                >
                  Agregar enlace
                </button>
              </div>
              {links?.length ? (
                <ul className="mt-3 space-y-1 max-h-44 overflow-auto pr-1">
                  {links.map((l, idx) => (
                    <li key={idx} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                      <a href={l.url} target="_blank" rel="noreferrer" className="text-emerald-700 underline truncate">
                        {l.label || l.url}
                      </a>
                      <button
                        type="button"
                        onClick={() => onRemoveLink(idx)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-gray-500">Aún no hay enlaces.</p>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-white hover:bg-gray-100 border"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}



