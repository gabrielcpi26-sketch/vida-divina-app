import React, { useMemo } from "react";

/**
 * SmartAssessor
 * Formulario compacto para capturar objetivo, estatura y peso.
 * Incluye una lista AMPLIA de objetivos.
 */
export default function SmartAssessor({
  objective,
  setObjective,
  heightCm,
  setHeightCm,
  weightKg,
  setWeightKg,
  onOpenById
}) {
  // Lista ampliada de objetivos (value = clave guardada, label = texto visible)
  const objetivos = [
    { value: "bajar_peso", label: "Bajar de peso" },
    { value: "definicion", label: "Definición / Tonificar" },
    { value: "musculo", label: "Ganar masa muscular" },
    { value: "energia", label: "Aumentar energía / enfoque" },
    { value: "bienestar", label: "Bienestar general" },
    { value: "detox", label: "Desintoxicación / depuración" },
    { value: "digestivo", label: "Salud digestiva" },
    { value: "inmunidad", label: "Sistema inmune" },
    { value: "descanso", label: "Dormir mejor / anti-estrés" },
    { value: "glucosa", label: "Control de glucosa" },
    { value: "corazon", label: "Salud cardiovascular" },
    { value: "articulaciones", label: "Articulaciones / inflamación" },
    { value: "antiedad", label: "Antiedad / antioxidantes" },
    { value: "pelo_piel_unas", label: "Pelo, piel y uñas" },
    { value: "femenina", label: "Salud femenina" },
    { value: "masculina", label: "Salud masculina" },
  ];

  // Si por alguna razón el objective actual no está en la lista, usa uno seguro
  const objectiveSafe = useMemo(() => {
    const exists = objetivos.some(o => o.value === objective);
    return exists ? objective : "bajar_peso";
  }, [objective]);

  return (
    <section className="px-4 md:px-6 mt-4">
      <div className="rounded-xl border border-emerald-200 bg-white shadow-sm p-4 md:p-5">
        <h2 className="text-lg font-semibold text-emerald-700 mb-3">
          Asesora inteligente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Objetivo */}
          <div>
            <label className="text-sm text-gray-600">Objetivo</label>
            <select
              className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
              value={objectiveSafe}
              onChange={(e) => setObjective(e.target.value)}
            >
              {objetivos.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Estatura */}
          <div>
            <label className="text-sm text-gray-600">Estatura (cm)</label>
            <input
              type="number"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="Ej: 165"
            />
          </div>

          {/* Peso */}
          <div>
            <label className="text-sm text-gray-600">Peso (kg)</label>
            <input
              type="number"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="Ej: 70"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Completa tus datos para ver recomendaciones personalizadas en la Asesora Pro.
        </p>
      </div>
    </section>
  );
}
