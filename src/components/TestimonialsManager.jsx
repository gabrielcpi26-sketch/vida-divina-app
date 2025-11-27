import React, { useEffect, useState } from "react";

/**
 * TestimonialsManager (con vínculo a producto + subida de archivos)
 * - Lista testimonios
 * - Agregar: nombre, mensaje, producto (relleno automático), foto (archivo) o video (archivo)
 * - Eliminar (solo en modo edición)
 * - Escucha eventos globales: window.dispatchEvent(new CustomEvent('add-testimonial', { detail:{ productName } }))
 */
export default function TestimonialsManager({ testimonials = [], setTestimonials = () => {}, editMode = false }) {
  const [nuevo, setNuevo] = useState({
    nombre: "",
    mensaje: "",
    producto: "", // ← nuevo: vínculo al producto
    foto: "",     // dataURL
    video: "",    // dataURL
  });

  // Si llega un evento externo, prellenar el producto y mostrar aviso
  const [pendienteProducto, setPendienteProducto] = useState("");

  useEffect(() => {
    function onAddTestimonial(ev) {
      const productName = ev?.detail?.productName || "";
      if (productName) {
        setNuevo((prev) => ({ ...prev, producto: productName }));
        setPendienteProducto(productName);
        // Desplaza a la sección de testimonios
        setTimeout(() => {
          document.getElementById("section-testimonios")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    }
    window.addEventListener("add-testimonial", onAddTestimonial);
    return () => window.removeEventListener("add-testimonial", onAddTestimonial);
  }, []);

  function onPickFile(e, type) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNuevo((prev) => ({ ...prev, [type]: reader.result }));
    reader.readAsDataURL(file);
  }

  function agregar() {
    if (!nuevo.nombre.trim() || !nuevo.mensaje.trim()) {
      alert("Escribe al menos nombre y mensaje.");
      return;
    }
    const item = { id: Date.now(), ...nuevo };
    setTestimonials([...(testimonials || []), item]);
    setNuevo({ nombre: "", mensaje: "", producto: "", foto: "", video: "" });
    setPendienteProducto("");
  }

  function eliminar(id) {
    if (!window.confirm("¿Eliminar este testimonio?")) return;
    setTestimonials((testimonials || []).filter((t) => t.id !== id));
  }

  return (
    <section id="section-testimonios" className="px-4 md:px-6 mt-6">
      <div className="border border-emerald-200 rounded-xl bg-white shadow-sm p-5">
        <h2 className="text-lg font-semibold text-emerald-700 mb-3">Testimonios de clientes</h2>

        {/* Aviso cuando llegó desde un producto */}
        {pendienteProducto && !editMode ? (
          <div className="mb-3 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
            Se prellenó el producto <b>{pendienteProducto}</b>. Activa el modo edición para agregar el testimonio.
          </div>
        ) : null}

        {/* Lista */}
        {(testimonials || []).length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay testimonios.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.id} className="border rounded-lg p-3 bg-emerald-50 shadow-sm">
                {t.foto ? (
                  <img src={t.foto} alt={t.nombre} className="w-full h-32 object-cover rounded-md mb-2" />
                ) : null}
                {t.video ? (
                  <video src={t.video} controls className="w-full h-32 object-cover rounded-md mb-2" />
                ) : null}
                <h3 className="text-sm font-semibold text-emerald-700">{t.nombre}</h3>
                {t.producto ? (
                  <div className="text-xs text-emerald-700 mt-0.5">Producto: {t.producto}</div>
                ) : null}
                <p className="text-sm text-gray-700 mt-1">{t.mensaje}</p>

                {editMode && (
                  <button
                    onClick={() => eliminar(t.id)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formulario (solo edición) */}
        {editMode && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-emerald-600 mb-2">Agregar testimonio</h3>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                placeholder="Nombre del cliente"
                className="border rounded-md p-2 text-sm"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              />
              <input
                type="text"
                placeholder="Producto (se rellena si vienes desde una tarjeta)"
                className="border rounded-md p-2 text-sm"
                value={nuevo.producto}
                onChange={(e) => setNuevo({ ...nuevo, producto: e.target.value })}
              />
              <textarea
                placeholder="Mensaje breve"
                className="border rounded-md p-2 text-sm md:col-span-2"
                value={nuevo.mensaje}
                onChange={(e) => setNuevo({ ...nuevo, mensaje: e.target.value })}
              />

              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={(e) => onPickFile(e, "foto")} className="text-sm" />
                {nuevo.foto && <span className="text-xs text-emerald-700">📸 lista</span>}
              </div>

              <div className="flex items-center gap-2">
                <input type="file" accept="video/*" onChange={(e) => onPickFile(e, "video")} className="text-sm" />
                {nuevo.video && <span className="text-xs text-emerald-700">🎬 listo</span>}
              </div>
            </div>

            <button
              onClick={agregar}
              className="mt-3 bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700"
            >
              Agregar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

