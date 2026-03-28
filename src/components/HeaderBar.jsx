
// src/components/HeaderBar.jsx
import React from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function HeaderBar({
  hero,
  setHero,
  editMode,
  setEditMode,
  social,
  setSocial,
}) {
  // ✅ Subir portada: guarda en Supabase (persistente) + actualiza UI
  async function onHeroUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    try {
      // 1) Subir a Storage (bucket: publicidad) en carpeta portada/
      const ext = (f.name.split(".").pop() || "png").toLowerCase();
      const path = `portada/${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("publicidad")
        .upload(path, f, { upsert: true });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage
        .from("publicidad")
        .getPublicUrl(path);

      const url = pub?.publicUrl || "";
      if (!url) throw new Error("No se pudo obtener publicUrl");

      // 2) Guardar URL en tabla settings (persistente)
      const { error: setErr } = await supabase
        .from("vd_settings")
        .upsert({ key: "hero_image", value: url });

      if (setErr) throw setErr;

      // 3) Actualizar estado local (se ve al instante)
      setHero(url);
      alert("✅ Portada guardada y persistente");
    } catch (err) {
      console.error("Error subiendo portada:", err);
      alert("No se pudo guardar la portada");
    }
  }

  function openSocialSettings() {
    const t = prompt(
      "Usuario de TikTok (sin @) o URL completa",
      social.tiktok || ""
    );
    if (t == null) return;
    const i = prompt(
      "Usuario de Instagram (sin @) o URL completa",
      social.instagram || ""
    );
    if (i == null) return;
    const fb = prompt("Usuario o URL de Facebook", social.facebook || "");
    if (fb == null) return;

    setSocial({
      tiktok: t.trim(),
      instagram: i.trim(),
      facebook: fb.trim(),
    });
  }

  // 🔒 ADMIN SUPER PRO (oculto para clientes)
  const isAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("vd_admin_secure") === "DIANA_MASTER_2026";

  return (
    <section className="relative">
      {/* ✅ Recuadro PRO */}
      <div className="mx-auto max-w-6xl px-3 sm:px-4 pt-3">
        <div className="relative w-full h-[260px] md:h-[420px] overflow-hidden rounded-2xl shadow-xl bg-white">
          {hero ? (
            <>
              <img
                src={hero}
                alt="Portada"
                className="w-full h-full object-cover object-[center_55%]"
              />
              {/* overlay elegante para que se vea pro */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100 via-white to-emerald-50">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold tracking-tight">
                  Vida Divina
                </div>
                <div className="text-sm md:text-base text-gray-600 mt-1">
                  Live Healthy. Live Wealthy.
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  (Sube tu foto de inicio para personalizar)
                </div>
              </div>
            </div>
          )}

          {/* 🔒 SOLO ADMIN VE ESTO */}
          {isAdmin && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-2">
              <button
                onClick={() => {
                  const el = document.getElementById("payments");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-2 bg-white/90 backdrop-blur rounded-full text-xs shadow border hover:bg-white"
                title="Ir a formas de pago"
              >
                💳 Formas de pago
              </button>

              <label className="px-3 py-2 bg-white/90 backdrop-blur rounded-full text-xs md:text-sm cursor-pointer shadow border hover:bg-white">
                📷 Importar portada
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onHeroUpload}
                />
              </label>

              <button
                onClick={openSocialSettings}
                className="px-3 py-2 rounded-full text-xs md:text-sm shadow border bg-white text-gray-800 border-gray-200"
                title="Configurar redes"
              >
                ⚙️ Redes
              </button>

              <button
                onClick={() => setEditMode((v) => !v)}
                className={`px-3 py-2 rounded-full text-xs md:text-sm shadow border ${
                  editMode
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-800 border-gray-200"
                }`}
                title="Editar catálogo"
              >
                🖊️ {editMode ? "Modo edición" : "Editar catálogo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}