// src/pages/ImcWizard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_USER_PROFILE = "vd_user_profile";

function calcularIMC(peso, estaturaCm) {
  const estaturaM = estaturaCm / 100;
  return peso / (estaturaM * estaturaM);
}

function clasificarIMC(imc) {
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidad";
}

// Opciones de objetivo principal (modo ULTRA simple, 1 clic)
const objetivos = [
  { id: "Bajar grasa", label: "Quemar grasa", emoji: "🔥" },
  { id: "Control de peso", label: "Controlar mi peso", emoji: "⚖️" },
  { id: "Ganar músculo", label: "Tonificar / ganar músculo", emoji: "💪" },
  { id: "Más energía y enfoque", label: "Tener más energía", emoji: "⚡" },
  { id: "Mejorar digestión", label: "Desinflamar y mejorar digestión", emoji: "🌿" },
  { id: "Manejar estrés", label: "Bajar estrés y dormir mejor", emoji: "🧘‍♀️" },
  { id: "Mejorar piel", label: "Piel, cabello y uñas", emoji: "💛" },
  { id: "Regulación hormonal", label: "Hormonas, ciclo, menopausia", emoji: "🌙" },
];

// Misma configuración de necesidades que usa SmartAssessorPro (TRÍADA)
const needsConfig = [
  { key: "detox", label: "Desintoxicación / digestión" },
  { key: "fatLoss", label: "Pérdida de grasa" },
  { key: "appetite", label: "Control de apetito" },
  { key: "glucose", label: "Control de glucosa" },
  { key: "cholesterol", label: "Colesterol / triglicéridos" },
  { key: "pressure", label: "Presión arterial" },
  { key: "stress", label: "Estrés / ansiedad" },
  { key: "memory", label: "Memoria / enfoque" },
  { key: "libido", label: "Libido / deseo sexual" },
  { key: "menopause", label: "Menopausia / bochornos" },
  { key: "cycle", label: "Ciclo menstrual" },
  { key: "vitamins", label: "Vitaminas / defensas" },
  { key: "antiinflamatorio", label: "Antiinflamatorio / dolor" },
  { key: "skin", label: "Piel e hidratación" },
];

export default function ImcWizard() {
  const navigate = useNavigate();

  // step 0 = pantalla mágica inicial, 1 = objetivo, 2 = datos básicos + avanzado
  const [step, setStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    edad: "",
    sexo: "Femenino",
    peso: "",
    estatura: "",
    objetivo: "",
    needs: needsConfig.reduce((acc, n) => ({ ...acc, [n.key]: false }), {}),
  });

  const [error, setError] = useState("");

  // ------- Paso 1: elegir objetivo con 1 clic -------
  function selectObjetivo(id) {
    setForm((prev) => ({ ...prev, objetivo: id }));
    setError("");
    setStep(2);
  }

  // ------- Paso 2: básico + avanzado opcional -------
  function handleBasicChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleNeed(key) {
    setForm((prev) => ({
      ...prev,
      needs: {
        ...prev.needs,
        [key]: !prev.needs[key],
      },
    }));
  }

  function toggleAdvanced() {
    setShowAdvanced((v) => !v);
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.objetivo) {
      setError("Elige primero tu objetivo principal.");
      setStep(1);
      return;
    }

    const peso = parseFloat(form.peso);
    const estatura = parseFloat(form.estatura);

    if (!peso || !estatura) {
      setError("Por favor ingresa tu peso y estatura para calcular tu IMC.");
      return;
    }

    const imc = calcularIMC(peso, estatura);
    const clasificacion = clasificarIMC(imc);

    const perfil = {
      nombre: form.nombre || "Invitad@",
      edad: form.edad ? Number(form.edad) : null,
      sexo: form.sexo,
      peso,
      estatura,
      imc: Number(imc.toFixed(1)),
      clasificacion_imc: clasificacion,
      objetivo: form.objetivo,
      needs: form.needs,
    };

    localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(perfil));
    navigate("/lead");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 border border-emerald-100 relative overflow-hidden">
        {/* Efecto “cinemático” suave */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-amber-100/40 blur-3xl" />

        {/* Encabezado / status */}
        <div className="relative z-10 flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="uppercase tracking-wide font-semibold text-emerald-500">
            ASESORA PRO VIDA DIVINA
          </span>
          {step === 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-700">
              Test rápido · menos de 1 min
            </span>
          ) : (
            <span> Paso {step} de 2 </span>
          )}
        </div>

        <div className="relative z-10">
          {/* PASO 0: PANTALLA INICIAL CON GANCHO + IMAGEN + ESCALERA DE VALOR */}
         

{/* PASO 0: PANTALLA INICIAL CON GANCHO + ESCALERA DE VALOR */}
{step === 0 && (
<div className="text-center">


    {/* Etiquetas superiores */}
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-700 font-semibold shadow-sm">
      <span>✨ Análisis personalizado Vida Divina</span>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-emerald-100">
        Rápido · sin compromiso
      </span>
    </div>

    {/* TÍTULO PRINCIPAL */}
    <h1 className="mt-4 text-2xl md:text-3xl font-extrabold text-emerald-700 leading-snug">
      ¿Problemas de inflamación,
      <br />
      o peso estancado?
    </h1>

  {/* TARJETA CON TU IMAGEN VERDE */} 
<div className="mt-4 bg-white/95 border border-emerald-100 rounded-2xl shadow-md overflow-hidden">
  <div className="relative flex justify-center items-center bg-white">
    <img
      src="/imagenes/teverde1.jpg" // Asegúrate que esté en public/imagenes/teverde1.jpg
      alt="Desintoxícate con Vida Divina"
      className="w-full max-h-[160px] object-contain rounded-xl"
    />
    <div className="absolute bottom-3 left-3 right-3 flex justify-center">
      <div className="inline-block px-3 py-1 rounded-full bg-white/85 text-emerald-800 text-xs font-semibold shadow">
        Desintoxícate con Vida Divina · Té Divina
      </div>
    </div>
  </div>
</div>


    {/* TEXTO DE EMPATÍA / PROMESA */}
 <p className="text-[15px] text-center font-semibold text-emerald-700 leading-snug px-2 mb-2">
  🚨 ¡Descubre qué pasa con tu cuerpo y <span className="text-pink-600 font-bold">toma el control YA</span>! 🚨
</p>

    {/* ESCALERA DE VALOR */}
   <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-2 text-[13px] leading-tight">
  <p className="font-semibold text-emerald-700 mb-1">
    En menos de 1 minuto vas a:
  </p>
  <ul className="list-disc list-inside space-y-1">
    <li>Ver tu IMC explicado de forma sencilla.</li>
    <li>Definir tu objetivo prioritario (grasa, hormonas, digestión, energía...).</li>
    <li>Recibir un combo sugerido de productos Vida Divina pensado especialmente para ti.</li>
  </ul>
</div>


    {/* TEXTO ACTUALIZADO + MANITA ANIMADA SOBRE EL BOTÓN */}
<p className="text-[13px] text-center mt-2 leading-tight">
  <span className="font-semibold text-emerald-700">
    Empieza aquí ⬇️
  </span> responde un par de pasos y al final te enviaremos tus resultados y productos recomendados.
</p>    

    {/* MANITA INTERACTIVA ARRIBA DEL BOTÓN */}
    <div className="mt-1 text-2xl animate-bounce">
      👇
    </div>

    {/* BOTÓN VERDE “FLOTANTE” MÁS LLAMATIVO */}
    <div className="mt-3 flex flex-col items-center gap-2">
      <button
        onClick={() => setStep(1)}
        className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600
                   text-white rounded-xl font-bold text-base shadow-lg
                   hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                   transition-transform transition-shadow duration-200
                   animate-pulse"
      >
        Empezar mi análisis (gratis)
      </button>

      <p className="text-xs text-gray-600">
        Toca el botón verde, es rápido y sin compromiso
      </p>
    </div>

    {/* DISCLAIMER */}
    <p className="mt-4 text-[11px] text-gray-400">
      No es un diagnóstico médico, pero sí una guía clara basada en tu cuerpo y tus objetivos.
    </p>
  </div>
)}


          {/* PASO 1: OBJETIVO */}
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-emerald-700">
                ¿Qué quieres lograr primero?
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Elige tu objetivo principal y armaremos tu combo ideal Vida Divina.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
                {objetivos.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => selectObjetivo(o.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-left text-sm hover:border-emerald-400 hover:bg-emerald-50 ${
                      form.objetivo === o.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-emerald-100 bg-white"
                    }`}
                  >
                    <span className="text-lg">{o.emoji}</span>
                    <span className="text-gray-800">{o.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  ← Volver
                </button>
                <button
                  type="button"
                  onClick={() =>
                    form.objetivo
                      ? setStep(2)
                      : setError("Elige un objetivo para continuar.")
                  }
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
                >
                  Siguiente →
                </button>
              </div>

              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            </>
          )}

          {/* PASO 2: DATOS BÁSICOS + AVANZADO OPCIONAL */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h1 className="text-xl font-bold text-emerald-700">
                Último paso: ajustemos tu recomendación
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Solo necesito tus datos básicos. Si quieres, puedes personalizar aún más
                en modo avanzado.
              </p>

              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">
                    Nombre (opcional, para saludarte)
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleBasicChange}
                    className="w-full border border-emerald-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="Ej. Diana"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Sexo</label>
                    <select
                      name="sexo"
                      value={form.sexo}
                      onChange={handleBasicChange}
                      className="w-full border border-emerald-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option>Femenino</option>
                      <option>Masculino</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Edad (opcional)</label>
                    <input
                      name="edad"
                      type="number"
                      min="10"
                      max="90"
                      value={form.edad}
                      onChange={handleBasicChange}
                      className="w-full border border-emerald-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Ej. 35"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Peso (kg)</label>
                    <input
                      name="peso"
                      type="number"
                      step="0.1"
                      value={form.peso}
                      onChange={handleBasicChange}
                      required
                      className="w-full border border-emerald-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Ej. 68"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Estatura (cm)</label>
                    <input
                      name="estatura"
                      type="number"
                      value={form.estatura}
                      onChange={handleBasicChange}
                      required
                      className="w-full border border-emerald-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Ej. 160"
                    />
                  </div>
                </div>
              </div>

              {/* AVANZADO OPCIONAL */}
              <button
                type="button"
                onClick={toggleAdvanced}
                className="mt-4 w-full text-xs text-emerald-700 underline underline-offset-2"
              >
                {showAdvanced
                  ? "Ocultar opciones avanzadas"
                  : "Quiero personalizar más mi análisis (opcional)"}
              </button>

              {showAdvanced && (
                <div className="mt-3 pt-3 border-t border-emerald-100 text-xs">
                  <div className="uppercase tracking-wide text-emerald-500 font-semibold mb-1">
                    ¿Qué te gustaría mejorar? (puedes elegir varias)
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                    {needsConfig.map((n) => {
                      const active = form.needs[n.key];
                      return (
                        <button
                          key={n.key}
                          type="button"
                          onClick={() => toggleNeed(n.key)}
                          className={`px-3 py-1.5 rounded-full border ${
                            active
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-emerald-100 bg-gray-50 text-gray-700"
                          }`}
                        >
                          {n.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

              <div className="mt-4 flex justify-between text-xs">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow hover:opacity-95"
                >
                  Ver mis productos recomendados
                </button>
              </div>

              <p className="mt-2 text-[11px] text-gray-400 text-center">
                No es un diagnóstico médico, pero sí una guía clara basada en tu cuerpo y
                tus objetivos.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
