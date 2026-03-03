// src/components/ProductAttachments.jsx
import React, { useMemo, useState } from "react";

/**
 * Modal de detalles de producto.
 *
 * - Modo CLIENTE (editMode = false):
 *   Solo lectura: nombre, descripción, puntos clave, ingredientes, beneficios,
 *   testimonios y links de video.
 *
 * - Modo ADMIN (editMode = true):
 *   Desde aquí puedes editar:
 *     · Nombre
 *     · Descripción corta
 *     · Puntos clave (uno por línea)
 *     · Ingredientes destacados (uno por línea)
 *     · Beneficios esperados (uno por línea)
 *     · Testimonios (nombre + texto)
 *     · Links de video (título + URL)
 */

export default function ProductAttachments({
  product,
  editMode = false,
  content,
  setContent,
  testimonials = [],
  setTestimonials,
  media = [],
  setMedia,
  onClose,
}) {
  if (!product) return null;

  const productId = product.id;

  // Overrides actuales del producto en "content"
  const currentOverrides =
    (content && productId && content[productId]) || {};

  // Estado local para los campos de texto del producto
  const [name, setName] = useState(
    currentOverrides.name || product.name || ""
  );
  const [blurb, setBlurb] = useState(
    currentOverrides.blurb || product.blurb || ""
  );
  const [bulletsText, setBulletsText] = useState(
    (currentOverrides.bullets || product.bullets || []).join("\n")
  );
  const [ingredientsText, setIngredientsText] = useState(
    (currentOverrides.ingredients || product.ingredients || []).join("\n")
  );
  const [benefitsText, setBenefitsText] = useState(
    (currentOverrides.benefits || product.benefits || []).join("\n")
  );

const [packageUnits, setPackageUnits] = useState(() => {
  const raw =
    currentOverrides.package_units ??
    currentOverrides.packageUnits ??
    product.package_units ??
    product.packageUnits ??
    "";

  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : "";
});

  // Testimonios y media filtrados por producto
  const productTestimonials = useMemo(
    () =>
      Array.isArray(testimonials)
        ? testimonials.filter((t) => {
            const pid =
              t.productId || t.product_id || t.idProducto || t.productoId;
            return pid === productId;
          })
        : [],
    [testimonials, productId]
  );

  const productMedia = useMemo(
    () =>
      Array.isArray(media)
        ? media.filter((m) => {
            const pid =
              m.productId || m.product_id || m.idProducto || m.productoId;
            return pid === productId;
          })
        : [],
    [media, productId]
  );

  // Estado local para NUEVOS testimonios y links
  const [newTestName, setNewTestName] = useState("");
  const [newTestText, setNewTestText] = useState("");
  const [newMediaLabel, setNewMediaLabel] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");

  // Helpers para convertir texto -> arrays
  function splitLines(str) {
    if (!str) return [];
    return String(str)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Guardar cambios de texto del producto (nombre, blurb, bullets, etc.)
// src/components/ProductAttachments.jsx
async function handleSaveProductText() {
  if (!productId) return;

  const patch = {
    custom_name: (name || "").trim() || null,
    custom_blurb: (blurb || "").trim() || null,
    bullets: splitLines(bulletsText),
    ingredients: splitLines(ingredientsText),
    benefits: splitLines(benefitsText),
    package_units: packageUnits === "" ? null : Number(packageUnits), // ✅ OJO: número
    updated_at: new Date().toISOString(),
  };

  try {
    // ✅ esto ya existe en App.jsx y hace upsert a Supabase
    if (typeof window.__applyContentPatch === "function") {
      await window.__applyContentPatch(productId, patch);
    }

    // ✅ actualiza estado local para verlo sin refrescar
    setContent?.((prev) => ({
      ...(prev || {}),
      [productId]: { ...(prev?.[productId] || {}), ...patch },
    }));
  } catch (e) {
    console.error("Error guardando en Supabase:", e);
  }
}

  // Agregar / eliminar testimonios
  function handleAddTestimonial() {
    if (!setTestimonials || !productId) return;
    if (!newTestText.trim()) return;

    const item = {
      id: `t-${productId}-${Date.now()}`,
      productId,
      name: newTestName.trim(),
      text: newTestText.trim(),
    };

    setTestimonials((prev) => [...(prev || []), item]);
    setNewTestName("");
    setNewTestText("");
  }

  function handleRemoveTestimonial(id) {
    if (!setTestimonials) return;
    setTestimonials((prev) => (prev || []).filter((t) => t.id !== id));
  }

  // Agregar / eliminar links de video
  function handleAddMedia() {
    if (!setMedia || !productId) return;
    if (!newMediaUrl.trim()) return;

    const item = {
      id: `m-${productId}-${Date.now()}`,
      productId,
      label: newMediaLabel.trim() || "Video de referencia",
      url: newMediaUrl.trim(),
    };

    setMedia((prev) => [...(prev || []), item]);
    setNewMediaLabel("");
    setNewMediaUrl("");
  }

  function handleRemoveMedia(id) {
    if (!setMedia) return;
    setMedia((prev) => (prev || []).filter((m) => m.id !== id));
  }

  // Versión de solo lectura usa el mismo texto que el admin ve en los textareas
  const readonlyBullets = splitLines(bulletsText);
  const readonlyIngredients = splitLines(ingredientsText);
  const readonlyBenefits = splitLines(benefitsText);

  // Normalizar media para modo lectura
  const videoItems = productMedia
    .map((m, idx) => {
      const url =
        m.url || m.link || m.href || m.videoUrl || m.src || m.enlace;
      if (!url || typeof url !== "string") return null;
      const label = m.label || m.title || m.nombre || `Video ${idx + 1}`;
      return { id: m.id, url, label };
    })
    .filter(Boolean);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: 620,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: 20,
          boxShadow:
            "0 18px 45px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(148,163,184,0.25)",
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            {editMode ? (
              <>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del producto"
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.6)",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#065f46",
                    marginBottom: 6,
                  }}
                />
                <textarea
                  value={blurb}
                  onChange={(e) => setBlurb(e.target.value)}
                  placeholder="Descripción corta / fórmula, etc."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.6)",
                    fontSize: 13,
                    color: "#4b5563",
                    resize: "vertical",
                  }}
                />
              </>
            ) : (
              <>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#065f46",
                  }}
                >
                  {name}
                </h2>
                {blurb && (
                  <p
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: "#4b5563",
                      lineHeight: 1.5,
                    }}
                  >
                    {blurb}
                  </p>
                )}
              </>
            )}
          </div>

          {product.img && (
            <div
              style={{
                flexShrink: 0,
                width: 96,
                height: 96,
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.4)",
                background: "#f9fafb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={product.img}
                alt={name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
        </div>

        {/* PUNTOS CLAVE */}
        <section style={{ marginTop: 16 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "#065f46",
            }}
          >
            Puntos clave
          </h3>
          {editMode ? (
            <textarea
              value={bulletsText}
              onChange={(e) => setBulletsText(e.target.value)}
              placeholder="Escribe un punto por línea"
              rows={4}
              style={{
                width: "100%",
                marginTop: 6,
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.6)",
                fontSize: 13,
                color: "#374151",
                resize: "vertical",
              }}
            />
          ) : readonlyBullets.length > 0 ? (
            <ul
              style={{
                margin: "6px 0 0",
                paddingLeft: 18,
                fontSize: 13,
                color: "#374151",
              }}
            >
              {readonlyBullets.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>

        {/* INGREDIENTES */}
        <section style={{ marginTop: 16 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "#065f46",
            }}
          >
            Ingredientes destacados
          </h3>
          {editMode ? (
            <textarea
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="Escribe un ingrediente por línea"
              rows={4}
              style={{
                width: "100%",
                marginTop: 6,
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.6)",
                fontSize: 13,
                color: "#374151",
                resize: "vertical",
              }}
            />
          ) : readonlyIngredients.length > 0 ? (
            <p
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#374151",
                lineHeight: 1.5,
              }}
            >
              {readonlyIngredients.join(" · ")}
            </p>
          ) : null}
        </section>

        {/* BENEFICIOS */}
        <section style={{ marginTop: 16 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "#065f46",
            }}
          >
            Beneficios esperados
          </h3>
          {editMode ? (
            <textarea
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              placeholder="Escribe un beneficio por línea"
              rows={4}
              style={{
                width: "100%",
                marginTop: 6,
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.6)",
                fontSize: 13,
                color: "#374151",
                resize: "vertical",
              }}
            />
          ) : readonlyBenefits.length > 0 ? (
            <ul
              style={{
                margin: "6px 0 0",
                paddingLeft: 18,
                fontSize: 13,
                color: "#374151",
              }}
            >
              {readonlyBenefits.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>
{/* CONFIGURACIÓN DEL PAQUETE (solo admin) */}
{editMode && (
  <section style={{ marginTop: 16 }}>
    <h3
      style={{
        margin: 0,
        fontSize: 14,
        fontWeight: 600,
        color: "#065f46",
      }}
    >
      Paquete
    </h3>
    <div
      style={{
        marginTop: 6,
        fontSize: 12,
        color: "#4b5563",
      }}
    >
      <label>
        Piezas incluidas en este paquete:
        <input
          type="number"
          min="1"
          value={packageUnits}
         onChange={(e) => setPackageUnits(e.target.value === "" ? "" : Number(e.target.value))}
          style={{
            marginLeft: 8,
            width: 80,
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid rgba(148,163,184,0.8)",
            fontSize: 12,
          }}
        />
      </label>
      <div style={{ marginTop: 4, color: "#9ca3af" }}>
        Ejemplo: 12 sobres, 4 frascos, 6 piezas, etc.
      </div>
    </div>
  </section>
)}


        {/* TESTIMONIOS */}
        <section style={{ marginTop: 20 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "#065f46",
            }}
          >
            Testimonios de clientes
          </h3>

          {editMode ? (
            <>
              {productTestimonials.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {productTestimonials.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: 8,
                        borderRadius: 10,
                        border: "1px solid rgba(209,213,219,0.9)",
                        background: "#f9fafb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#111827",
                            }}
                          >
                            {t.text}
                          </div>
                          {t.name && (
                            <div
                              style={{
                                marginTop: 2,
                                fontSize: 12,
                                color: "#6b7280",
                              }}
                            >
                              — {t.name}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTestimonial(t.id)}
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: 11,
                            color: "#b91c1c",
                            cursor: "pointer",
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Nuevo testimonio */}
              <div
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderRadius: 12,
                  border: "1px dashed rgba(148,163,184,0.9)",
                  background: "#f9fafb",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <input
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  placeholder="Nombre del cliente (opcional)"
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(209,213,219,0.9)",
                    fontSize: 12,
                  }}
                />
                <textarea
                  value={newTestText}
                  onChange={(e) => setNewTestText(e.target.value)}
                  placeholder="Escribe el testimonio aquí..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(209,213,219,0.9)",
                    fontSize: 12,
                    resize: "vertical",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTestimonial}
                  style={{
                    alignSelf: "flex-end",
                    marginTop: 2,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "none",
                    background:
                      "linear-gradient(135deg,#22c55e,#16a34a,#22c55e)",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Añadir testimonio
                </button>
              </div>
            </>
          ) : productTestimonials.length > 0 ? (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {productTestimonials.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid rgba(209,213,219,0.9)",
                    background: "#f9fafb",
                  }}
                >
                  {t.text && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      “{t.text}”
                    </p>
                  )}
                  {t.name && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 12,
                        color: "#6b7280",
                        fontStyle: "italic",
                      }}
                    >
                      — {t.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : !editMode ? (
            <p
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#9ca3af",
              }}
            >
              Aún no hay testimonios para este producto.
            </p>
          ) : null}
        </section>

        {/* VIDEOS / LINKS */}
        <section style={{ marginTop: 20 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "#065f46",
            }}
          >
            Videos y recursos de referencia
          </h3>

          {editMode ? (
            <>
              {videoItems.length > 0 && (
                <ul
                  style={{
                    margin: "6px 0 0",
                    paddingLeft: 18,
                    fontSize: 13,
                  }}
                >
                  {videoItems.map((v) => (
                    <li
                      key={v.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span>{v.label}</span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: 11,
                            textDecoration: "underline",
                          }}
                        >
                          Abrir
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(v.id)}
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: 11,
                            color: "#b91c1c",
                            cursor: "pointer",
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Nuevo link */}
              <div
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderRadius: 12,
                  border: "1px dashed rgba(148,163,184,0.9)",
                  background: "#f9fafb",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <input
                  value={newMediaLabel}
                  onChange={(e) => setNewMediaLabel(e.target.value)}
                  placeholder="Título del video / recurso"
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(209,213,219,0.9)",
                    fontSize: 12,
                  }}
                />
                <input
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="URL (YouTube, TikTok, PDF, etc.)"
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(209,213,219,0.9)",
                    fontSize: 12,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddMedia}
                  style={{
                    alignSelf: "flex-end",
                    marginTop: 2,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "none",
                    background:
                      "linear-gradient(135deg,#22c55e,#16a34a,#22c55e)",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Añadir link
                </button>
              </div>
            </>
          ) : videoItems.length > 0 ? (
            <ul
              style={{
                margin: "6px 0 0",
                paddingLeft: 18,
                fontSize: 13,
              }}
            >
              {videoItems.map((v) => (
                <li key={v.id}>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    {v.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : !editMode ? (
            <p
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#9ca3af",
              }}
            >
              Aún no hay videos ni recursos de referencia para
              este producto.
            </p>
          ) : null}
        </section>

        {/* BOTONES INFERIORES */}
        <div
          style={{
            marginTop: 22,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          {editMode && (
            <button
              type="button"
              onClick={handleSaveProductText}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                background: "#e5f9ed",
                color: "#166534",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Guardar texto
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #22c55e, #16a34a, #22c55e)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
