import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

// Si tú ya tienes un builder real, cámbialo aquí:
// import { buildProducts } from "../lib/products";
import { buildProducts } from "../lib/products"; // <-- AJUSTA la ruta si tu builder está en otro archivo

function normalizePhoneForWA(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  // si ya trae 52 al inicio, lo dejamos; si no, lo asumimos MX
  if (digits.startsWith("52")) return digits;
  return `52${digits}`;
}

export default function Catalogo() {
  const [imagesByProductId, setImagesByProductId] = useState({});
  const [loadingImages, setLoadingImages] = useState(true);
  const [imgError, setImgError] = useState("");

  const products = useMemo(() => {
    try {
      return buildProducts(); // debe devolver array de {id,name,price,img,...}
    } catch (e) {
      console.error("buildProducts() falló:", e);
      return [];
    }
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadImages() {
      setLoadingImages(true);
      setImgError("");

      try {
        const { data, error } = await supabase
          .from("vd_catalog_images")
          .select("product_id,image_url");

        if (error) throw error;

        const map = {};
        (data || []).forEach((row) => {
          if (row?.product_id && row?.image_url) map[row.product_id] = row.image_url;
        });

        if (alive) setImagesByProductId(map);
      } catch (e) {
        console.error(e);
        if (alive) setImgError("No pude cargar imágenes del catálogo.");
      } finally {
        if (alive) setLoadingImages(false);
      }
    }

    loadImages();
    return () => {
      alive = false;
    };
  }, []);

  // WhatsApp opcional (si ya tienes vd_last_whatsapp guardado en localStorage)
  const lastWhatsapp = useMemo(() => {
    try {
      return localStorage.getItem("vd_last_whatsapp") || "";
    } catch {
      return "";
    }
  }, []);

  function openWhatsAppSales() {
    // Tu número “receptor” (el tuyo / ventas). Si lo manejas por ENV, mejor:
    // const sales = import.meta.env.VITE_SALES_WHATSAPP || "524872586302";
    const sales = import.meta.env.VITE_SALES_WHATSAPP || "524872586302";

    const msg = encodeURIComponent(
      `Hola 👋 Vi el catálogo Vida Divina y quiero ayuda para elegir mi combo ideal.` +
        (lastWhatsapp ? `\n\nMi WhatsApp: ${lastWhatsapp}` : "")
    );
    window.open(`https://wa.me/${sales}?text=${msg}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow border border-emerald-100 p-5">
          <h1 className="text-2xl font-extrabold text-emerald-700">
            Catálogo Vida Divina
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Elige tus productos recomendados. (WhatsApp es opcional.)
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={openWhatsAppSales}
              className="py-2.5 px-4 rounded-xl border border-emerald-200 text-emerald-700 font-semibold"
              type="button"
            >
              💬 Hablar por WhatsApp (opcional)
            </button>

            {loadingImages ? (
              <div className="text-sm text-gray-500 flex items-center">
                Cargando imágenes…
              </div>
            ) : imgError ? (
              <div className="text-sm text-red-600">{imgError}</div>
            ) : (
              <div className="text-sm text-gray-500 flex items-center">
                Imágenes listas ✅
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const img = imagesByProductId[p.id] || p.img; // prioridad: BD, fallback: imagen local
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow border border-emerald-100 overflow-hidden"
              >
                <div className="aspect-[4/3] bg-emerald-50 flex items-center justify-center overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-sm text-gray-400">Sin imagen</div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-800">{p.name}</h3>
                    {typeof p.price === "number" && (
                      <div className="text-emerald-700 font-extrabold">
                        ${p.price}
                      </div>
                    )}
                  </div>

                  {p.blurb && <p className="text-sm text-gray-600 mt-2">{p.blurb}</p>}

                  <div className="mt-4">
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:opacity-95"
                      onClick={() => {
                        // aquí luego conectamos "Agregar al carrito" / "Checkout" / "Order"
                        alert(`Seleccionaste: ${p.name}`);
                      }}
                    >
                      Elegir este producto
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!products.length && (
            <div className="col-span-full bg-white rounded-2xl shadow border border-emerald-100 p-6 text-center text-gray-600">
              No hay productos cargados (buildProducts vacío o ruta incorrecta).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}