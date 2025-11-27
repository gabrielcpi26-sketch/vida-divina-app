// src/pages/ImcQuiz.jsx
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

const objetivos = [
  { id: "Bajar grasa", label: "Quemar grasa", emoji: "🔥" },
  { id: "Control de peso", label: "Controlar mi peso", emoji: "⚖️" },
  { id: "Ganar músculo", label: "Ganar músculo / tonificar", emoji: "💪" },
  { id: "Más energía y enfoque", label: "Tener más energía", emoji: "⚡" },
  { id: "Mejorar digestión", label: "Mejorar digestión / inflamación", emoji: "🌿" },
  { id: "Manejar estrés", label: "Bajar estrés y descansar mejor", emoji: "🧘‍♀️" },
  { id: "Mejorar piel", label: "Piel, cabello y uñas", emoji: "💛" },
  { id: "Regulación hormonal", label: "Hormonas, ciclo, menopausia", emoji: "🌙" },
];

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

export default function ImcQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

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

  function selectObjetivo(id) {
    setForm((prev) => ({ ...prev, objetivo: id }));
    setError("");
    setStep(2);
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

  function handleBasicChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  function goNextFromNeeds() {
    // al menos una necesidad es opcional, así que solo avanzamos
    setStep(3);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.objetivo) {
      setError("Selecciona al menos un objetivo principal.");
      setStep(1);
      return;
    }

    const peso = parseFloat(form.peso);
    const estatura = parseFloat(form.estatura);

    if (!peso || !estatura) {
      setError("Por favor ingresa tu peso y estatura para calcular tu IMC.");
      setStep(3);
      return;
    }

    const imc = calcularIMC(peso, estatura);
    const clasificacion = clasificarIMC(imc);

    const perfil = {
      nombre: form.nombre || "Invitada",
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
    navigate("/catalogo");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
        {/* Encabezado con pasos */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="uppercase tracking-wide font-semibold text-emerald-500">
            Asesora Pro Vida Divina
          </span>
          <span>
            Paso {step} de 3
          </span>
        </div>

        {step === 1 && (
          <>
            <h1 className="text-xl font-bold text-emerald-700">
              ¿Qué quieres lograr primero?
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Elige tu objetivo principal y armaremos tu combo ideal Vida Divina.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2">
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

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            <p className="mt-4 text-[11px] text-gray-400 text-center">
              Solo necesitas 3 pasos rápidos. No te tomará más de 1 minuto.
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-xl font-bold text-emerald-700">
              ¿Qué cosas quieres mejorar?
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Marca todo lo que sientas que aplica. Así afinamos mejor tu recomendación.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
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

            <div className="mt-4 flex justify-between text-xs">
              <button
                type="button"
                onClick={goBack}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                ← Atrás
              </button>
              <button
                type="button"
                onClick={goNextFromNeeds}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
              >
                Siguiente →
              </button>
            </div>

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h1 className="text-xl font-bold text-emerald-700">
              Último paso: tus datos básicos
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Solo para calcular tu IMC y ajustar mejor la recomendación.
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
              No es un diagnóstico médico, pero sí una guía para elegir mejor tus productos Vida
              Divina.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}