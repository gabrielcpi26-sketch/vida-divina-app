// src/components/CatalogoAdmin.jsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { buildProducts } from "../data/catalog";
import { subirImagenACatalogo } from "../utils/subirImagen";
import { subirPortada } from "../utils/subirPortada";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Clave para recordar sesión de admin en el navegador
const ADMIN_KEY = "vd_admin_ok";
// Contraseña de administradora (puedes cambiarla)
const ADMIN_PASS = "vida2024";

export default function CatalogoAdmin() {
  const [autorizado, setAutorizado] = useState(false);
  const [clave, setClave] = useState("");
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardandoId, setGuardandoId] = useState(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    id: "",
    name: "",
    category: "",
    price: "",
    blurb: "",
  });
  const [creando, setCreando] = useState(false);

  // ===============================
  // PORTADA EDITABLE (solo 1 activa)
  // ===============================
  const [portada, setPortada] = useState(
    localStorage.getItem("vd_portada_url") || ""
  );
  const [portadaFile, setPortadaFile] = useState(null);

  async function handleSubirPortada() {
    if (!portadaFile) {
      alert("Selecciona una imagen primero");
      return;
    }

    const url = await subirPortada(portadaFile);

    if (url) {
      localStorage.setItem("vd_portada_url", url);
      setPortada(url);
      alert("Portada actualizada correctamente");
    } else {
      alert("No se pudo subir la portada");
    }
  }

  // 🔐 Logout
  const handleSecretLogout = () => {
    try {
      localStorage.removeItem(ADMIN_KEY);
      setAutorizado(false);
      setClave("");
      alert("Sesión cerrada. Se volverá a pedir la contraseña.");
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  // Revisar si ya hay sesión guardada
  useEffect(() => {
    if (localStorage.getItem(ADMIN_KEY) === "1") {
      setAutorizado(true);
    }
  }, []);

  // Cargar catálogo base + productos extra
  useEffect(() => {
    if (!autorizado) return;

    const cargar = async () => {
      try {
        setCargando(true);
        const base = buildProducts();

        const { data, error } = await supabase
          .from("vd_extra_products")
          .select("*");

        if (error) throw error;

        const extras = data || [];
        setProductos([...base, ...extras]);
      } catch (err) {
        console.error("Error cargando catálogo en admin:", err);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [autorizado]);

  // Subir imagen + guardar en vd_catalog_images
  const handleFileChange = async (productoId, file) => {
    if (!file) return;
    try {
      setGuardandoId(productoId);

      const url = await subirImagenACatalogo(file);
      if (!url) {
        alert("No se pudo subir la imagen al servidor.");
        return;
      }

      const { error } = await supabase.from("vd_catalog_images").upsert({
        product_id: productoId,
        image_url: url,
      });

      if (error) throw error;

      // actualizar tarjeta local para verla al instante
      setProductos((prev) =>
        prev.map((p) => (p.id === productoId ? { ...p, img: url } : p))
      );

      alert("Imagen actualizada correctamente ✅");
    } catch (err) {
      console.error("Error al guardar imagen:", err);
      alert("No se pudo guardar la imagen");
    } finally {
      setGuardandoId(null);
    }
  };

  // ========= VISTA LOGIN =========
  if (!autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="bg-white rounded-xl shadow p-6 w-full max-w-sm">
          <h1 className="text-lg font-semibold text-emerald-800 mb-2">
            Admin de Imágenes — Vida Divina
          </h1>
          <p className="text-xs text-gray-600 mb-4">
            Esta pantalla es solo para ti. Ingresa la contraseña de
            administradora.
          </p>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 text-sm mb-3"
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />
          <button
            onClick={() => {
              if (clave === ADMIN_PASS) {
                localStorage.setItem(ADMIN_KEY, "1");
                setAutorizado(true);
              } else {
                alert("Contraseña incorrecta");
              }
            }}
            className="w-full bg-emerald-600 text-white rounded px-3 py-2 text-sm font-medium hover:bg-emerald-700"
          >
            Entrar
          </button>
          <p className="mt-3 text-[11px] text-gray-500">
            Si alguien más ve esta pantalla, no podrá hacer nada sin la
            contraseña correcta.
          </p>
        </div>
      </div>
    );
  }

  // ========= VISTA ADMIN =========
  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-emerald-800">
            Admin de Imágenes — Vida Divina
          </h1>
          <button
            onClick={handleSecretLogout}
            className="text-xs px-2 py-1 rounded-full border border-emerald-300 text-emerald-700 hover:bg-emerald-100"
          >
            Salir
          </button>
        </div>

        <p className="text-xs text-gray-600 mb-4">
          Aquí solo tú puedes cambiar las imágenes del catálogo, agregar
          productos extra y ahora también la imagen de portada. Los clientes no
          ven esta pantalla.
        </p>

        {cargando ? (
          <p className="text-sm text-gray-500">Cargando catálogo...</p>
        ) : (
          <>
            {/* Tarjetas de productos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {productos.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm"
                >
                  <h2 className="font-semibold text-sm text-emerald-800">
                    {p.name || p.title || "(Sin nombre)"}
                  </h2>
                  <p className="text-[11px] text-gray-500 mb-2">
                    ID: <span className="font-mono">{p.id}</span>
                  </p>

                  <div className="border rounded-lg overflow-hidden bg-gray-50 mb-2 h-32 flex items-center justify-center">
                    {p.img ? (
                      <img
                        src={p.img}
                        alt={p.name}
                        className="max-h-32 object-contain"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">
                        Sin imagen (usa el botón de abajo)
                      </span>
                    )}
                  </div>

                  <label className="text-[11px] text-gray-600 block mb-1">
                    Cambiar imagen:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(p.id, e.target.files?.[0] || null)
                    }
                    className="text-[11px]"
                  />
                  {guardandoId === p.id && (
                    <p className="text-[11px] text-emerald-600 mt-1">
                      Guardando imagen...
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Formulario para agregar nuevos productos */}
            <div className="mt-8 p-4 rounded-xl bg-sky-50 border border-sky-200">
              <h3 className="font-semibold text-sky-800 mb-1">
                Agregar nuevo producto al catálogo
              </h3>
              <p className="text-xs text-sky-700 mb-3">
                Se guardará en Supabase (tabla{" "}
                <code className="font-mono">vd_extra_products</code>) y
                aparecerá en tu catálogo sin tocar código.
              </p>

              <div className="grid gap-2 max-w-md text-sm">
                <input
                  className="border rounded px-2 py-1"
                  placeholder="ID (ej. factor_divina)"
                  value={nuevoProducto.id}
                  onChange={(e) =>
                    setNuevoProducto((p) => ({ ...p, id: e.target.value }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Nombre visible (ej. Factor Divina)"
                  value={nuevoProducto.name}
                  onChange={(e) =>
                    setNuevoProducto((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Categoría (cafes, tes, extractos, capsulas, batidos, aceites...)"
                  value={nuevoProducto.category}
                  onChange={(e) =>
                    setNuevoProducto((p) => ({
                      ...p,
                      category: e.target.value,
                    }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  type="number"
                  placeholder="Precio (opcional)"
                  value={nuevoProducto.price}
                  onChange={(e) =>
                    setNuevoProducto((p) => ({
                      ...p,
                      price: e.target.value,
                    }))
                  }
                />
                <textarea
                  className="border rounded px-2 py-1"
                  rows={3}
                  placeholder="Descripción corta (blurb)"
                  value={nuevoProducto.blurb}
                  onChange={(e) =>
                    setNuevoProducto((p) => ({
                      ...p,
                      blurb: e.target.value,
                    }))
                  }
                />

                <button
                  disabled={creando}
                  onClick={async () => {
                    if (
                      !nuevoProducto.id.trim() ||
                      !nuevoProducto.name.trim() ||
                      !nuevoProducto.category.trim()
                    ) {
                      alert("ID, nombre y categoría son obligatorios");
                      return;
                    }

                    try {
                      setCreando(true);

                      const payload = {
                        id: nuevoProducto.id.trim(),
                        name: nuevoProducto.name.trim(),
                        category: nuevoProducto.category.trim(),
                        price: nuevoProducto.price
                          ? Number(nuevoProducto.price)
                          : null,
                        blurb: nuevoProducto.blurb.trim() || null,
                      };

                      const { error } = await supabase
                        .from("vd_extra_products")
                        .upsert(payload);

                      if (error) throw error;

                      setProductos((prev) => [...prev, payload]);

                      alert("Producto agregado ✅");

                      setNuevoProducto({
                        id: "",
                        name: "",
                        category: "",
                        price: "",
                        blurb: "",
                      });
                    } catch (err) {
                      console.error("Error al crear producto:", err);
                      alert("No se pudo guardar el producto");
                    } finally {
                      setCreando(false);
                    }
                  }}
                  className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-60"
                >
                  {creando ? "Guardando..." : "Guardar producto"}
                </button>
              </div>
            </div>

            {/* PANEL DE PORTADA */}
            <div className="mt-10 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800">
                Imagen de Bienvenida (Portada)
              </h2>

              <p className="text-sm text-blue-600 mb-3">
                Esta será la imagen que aparece en tu pantalla de inicio (IMC
                Wizard).
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPortadaFile(e.target.files[0])}
                className="mb-3"
              />

              <button
                onClick={handleSubirPortada}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Subir Portada
              </button>

              {portada && (
                <div className="mt-4">
                  <p className="text-sm text-blue-700 font-semibold">
                    Vista previa:
                  </p>
                  <img
                    src={portada}
                    className="mt-2 max-h-52 rounded shadow-lg object-contain bg-white"
                    alt="Portada actual"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
