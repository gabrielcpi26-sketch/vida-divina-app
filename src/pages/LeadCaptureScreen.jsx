// src/pages/LeadCaptureScreen.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_USER_PROFILE = "vd_user_profile";

function normalizePhone(raw) {
  if (!raw) return "";
  // deja solo dígitos
  let digits = String(raw).replace(/\D/g, "");
  // si meten 10 dígitos MX, le agregamos 52
  if (digits.length === 10) digits = "52" + digits;
  // si ya trae 521..., lo dejamos
  return digits;
}

export default function LeadCaptureScreen() {
  const navigate = useNavigate();

  const CRM_BASE = (import.meta.env.VITE_CRM_API_BASE || "").replace(/\/$/, "");
  const TENANT_ID = import.meta.env.VITE_TENANT_ID || "";
  const NICHE_KEY = import.meta.env.VITE_NICHE_KEY || "vida_divina";
  const SALES_WA_PHONE = import.meta.env.VITE_SALES_WA_PHONE || "524872586302";

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSave = useMemo(() => {
    return Boolean(CRM_BASE && TENANT_ID && (whatsapp || "").trim());
  }, [CRM_BASE, TENANT_ID, whatsapp]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_USER_PROFILE);
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      setProfile(p);
      if (p?.nombre && p.nombre !== "Invitad@") setName(p.nombre);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Si no hay perfil, regresamos al análisis
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow p-6 text-center">
          <h1 className="text-lg font-bold text-emerald-700">Primero haz tu análisis</h1>
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

    if (!CRM_BASE) {
      setError("Falta configurar VITE_CRM_API_BASE.");
      return;
    }
    if (!TENANT_ID) {
      setError("Falta configurar TENANT_ID del CRM (VITE_TENANT_ID).");
      return;
    }

    const phoneNormalized = normalizePhone(whatsapp);
    if (!phoneNormalized) {
      setError("Por favor escribe tu número de WhatsApp.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tenant_id: TENANT_ID,
        niche_key: NICHE_KEY,
        phone: phoneNormalized,
        name: (name || profile.nombre || "").trim() || null,
        source: "vd_quiz",
        context: {
          flow: "imc_quiz",
          objetivo: profile.objetivo || null,
          imc: profile.imc ?? null,
          imc_class: profile.clasificacion_imc || null,
          needs: profile.needs || null,
          // extras opcionales si existen en tu profile
          sexo: profile.sexo || null,
          edad: profile.edad ?? null,
          peso: profile.peso ?? null,
          estatura: profile.estatura ?? null,
        },
      };

      const res = await fetch(`${CRM_BASE}/api/public/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // si el backend responde HTML o algo raro
      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { ok: false, error: text };
      }

      if (!res.ok || !data?.ok) {
        console.error("CRM lead error:", { status: res.status, data });
        setError(data?.error || `Error al guardar (HTTP ${res.status}).`);
        return;
      }

      localStorage.setItem("vd_last_whatsapp", phoneNormalized);

      // ✅ NO abrir WhatsApp aquí
      // ✅ Mandar al catálogo
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
    const msg = encodeURIComponent(
      `Hola, ya hice mi análisis Vida Divina.\n\nIMC: ${profile.imc} (${profile.clasificacion_imc})\nObjetivo: ${profile.objetivo}\n\nQuiero que me ayudes a elegir mi combo ideal.`
    );
    window.open(`https://wa.me/${SALES_WA_PHONE}?text=${msg}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-emerald-100 p-6">
        <h1 className="text-xl font-extrabold text-emerald-700 text-center">
          Ya tengo tus resultados 🎉
        </h1>

        <p className="mt-2 text-sm text-gray-700 text-center">
          Déjame tu WhatsApp para enviarte tu combo sugerido, instrucciones y promociones.
          <br />
          <span className="text-emerald-700 font-semibold">
            (No te saco a WhatsApp; primero verás tus productos.)
          </span>
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
            <label className="block text-gray-600 mb-1">WhatsApp (para enviarte tu combo)</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border border-emerald-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ej. 4441234567 (o 52 + lada)"
              inputMode="tel"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Tip: escribe con lada (52...) para mejor compatibilidad.
            </p>
          </div>

          {/* Mensaje claro si faltan envs */}
          {!TENANT_ID && (
            <p className="text-xs text-red-600">
              Falta configurar TENANT_ID del CRM (VITE_TENANT_ID).
            </p>
          )}
          {!CRM_BASE && (
            <p className="text-xs text-red-600">Falta configurar VITE_CRM_API_BASE.</p>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

    <button
  type="submit"
  disabled={loading || !canSave}
  onClick={() => {
    if (window.fbq && !loading && canSave) {
      window.fbq("track", "Lead");
    }
  }}
  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60"
>
  {loading ? "Guardando..." : "Guardar y ver mis productos recomendados"}
</button>
        </form>

        <button
          onClick={openWhatsApp}
          className="mt-3 w-full py-2.5 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center justify-center gap-2"
        >
          💬 Hablar por WhatsApp ahora (opcional)
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