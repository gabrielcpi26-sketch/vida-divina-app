// src/pages/LeadCaptureScreen.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const STORAGE_USER_PROFILE = "vd_user_profile";

export default function LeadCaptureScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_USER_PROFILE);
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      setProfile(p);
      if (p.nombre && p.nombre !== "Invitad@") setName(p.nombre);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Si no hay perfil, regresamos al análisis
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow p-6 text-center">
          <h1 className="text-lg font-bold text-emerald-700">
            Primero haz tu análisis
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            No encontré tus datos. Da clic para volver al análisis personalizado.
          </p>
          <button
            onClick={() => navigate("/imc")}
            className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold"
          >
            Ir al análisis
          </button>
        </div>
      </div>
    );
  }

    async function handleSaveLead(e) {
    e.preventDefault();
    setError("");

    if (!whatsapp.trim()) {
      setError("Por favor escribe tu número de WhatsApp.");
      return;
    }

    setLoading(true);
    try {
      const { error: supaError } = await supabase.from("vd_leads").insert([
        {
          name: name || profile.nombre || null,
          whatsapp,
          objetivo: profile.objetivo || null,
          imc: profile.imc || null,
          imc_class: profile.clasificacion_imc || null,
          needs: profile.needs || null,
          source: "analisis_imc",
        },
      ]);

      if (supaError) throw supaError;

      localStorage.setItem("vd_last_whatsapp", whatsapp);

      // 👉 NUEVO: abrir WhatsApp contigo
      openWhatsApp();

      // 👉 Luego mandarlo al catálogo
      navigate("/catalogo");
    } catch (err) {
      console.error(err);
      setError("Hubo un problema al guardar tus datos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function goWithoutLead() {
    navigate("/catalogo");
  }

  function openWhatsApp() {
    const phone = "524872586302"; // ← aquí pon TU número en formato internacional sin signos
    const msg = encodeURIComponent(
      `Hola, ya hice mi análisis Vida Divina.\n\nIMC: ${profile.imc} (${profile.clasificacion_imc})\nObjetivo: ${profile.objetivo}\n\nQuiero que me ayudes a elegir mi combo ideal.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-emerald-100 p-6">
        <h1 className="text-xl font-extrabold text-emerald-700 text-center">
          Ya tengo tus resultados 🎉
        </h1>
        <p className="mt-2 text-sm text-gray-700 text-center">
          Déjame tu WhatsApp y, además de ver tus productos recomendados, podré
          enviarte tu combo sugerido, instrucciones y promociones directamente.
        </p>

        <form onSubmit={handleSaveLead} className="mt-4 space-y-3 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">Nombre (opcional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ej. Diana"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">
              WhatsApp (para enviarte tu combo)
            </label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ej. 4441234567"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Ver mis productos y guardar mi contacto"}
          </button>
        </form>

        <button
          onClick={openWhatsApp}
          className="mt-3 w-full py-2.5 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center justify-center gap-2"
        >
          💬 Seguir por WhatsApp ahora
        </button>

        <button
          onClick={goWithoutLead}
          className="mt-3 w-full text-xs text-gray-500 underline underline-offset-2"
        >
          Prefiero no dejar mis datos, solo ver mis productos
        </button>

        <p className="mt-3 text-[11px] text-gray-400 text-center">
          Tus datos se usan solo para darte seguimiento a tu análisis, no para spam.
        </p>
      </div>
    </div>
  );
}
