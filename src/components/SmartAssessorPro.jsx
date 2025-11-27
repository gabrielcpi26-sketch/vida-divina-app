// src/components/SmartAssessorPro.jsx
import React, { useMemo, useEffect } from "react";

export default function SmartAssessorPro({ mergedProducts = [], onOpenById, profile }) {
  const result = useMemo(() => {
    if (!profile || !mergedProducts.length) {
      return { ideales: [], complementarios: [], pocoIdeales: [] };
    }

    const objetivo = (profile.objetivo || "").toLowerCase();
    const clasif = (profile.clasificacion_imc || "").toLowerCase();
    const imc = Number(profile.imc || 0);
    const needs = profile.needs || {};

    const objetivoBajarGrasa =
      objetivo.includes("bajar grasa") || objetivo.includes("control de peso");
    const objetivoGanarMusculo = objetivo.includes("ganar músculo") || objetivo.includes("ganar musculo");
    const objetivoEnergia = objetivo.includes("energía") || objetivo.includes("energia");
    const imcAlto = clasif.includes("sobrepeso") || clasif.includes("obesidad") || imc >= 27;
    const imcBajo = clasif.includes("bajo peso") || imc < 18.5;

    function norm(s) {
      return String(s || "").toLowerCase();
    }

    function scoreProduct(p) {
      let score = 0;
      const cat = (p.category || "").toLowerCase();

      const text = [
        p.name,
        p.title,
        p.blurb,
        ...(Array.isArray(p.bullets) ? p.bullets : []),
        ...(Array.isArray(p.ingredients) ? p.ingredients : []),
        ...(Array.isArray(p.benefits) ? p.benefits : []),
        ...(Array.isArray(p.keywords) ? p.keywords : []),
      ]
        .filter(Boolean)
        .map(norm)
        .join(" • ");

      // === Etiquetas por beneficio (según tu lista) ===
      const hasDetox = /desintoxic|detox|depur|colon/.test(text);
      const hasLibido = /libido|sexual|deseo sexual/.test(text);
      const hasFatLoss = /p[eé]rdida de grasa|quemar grasa|quemar|adelgazar/.test(text);
      const hasAppetite = /control de apetito|apetito|antojos|ansiedad por comida/.test(text);
      const hasMenopause = /menopausia|bochornos|sofocos/.test(text);
      const hasCycle = /ciclo menstrual|periodo|regla/.test(text);
      const hasGlucose = /glucosa|az[uú]car|colesterol|triglic[eé]ridos/.test(text);
      const hasVitamins = /vitamina|mineral|antioxidante|defensas/.test(text);
      const hasAntiInflamm = /antiinflamatorio|inflamaci[oó]n|dolor|articulaciones/.test(text);
      const hasPressure = /presi[oó]n arterial|hipertensi[oó]n|tensi[oó]n arterial/.test(text);
      const hasStress = /estr[eé]s|ansiedad|relajaci[oó]n|sueño/.test(text);
      const hasMemory = /memoria|enfoque|concentraci[oó]n|cognitivo/.test(text);
      const hasSkin = /piel|hidrata|arrugas|elasticidad/.test(text);
      const hasProteinMuscle = /prote[ií]na|proteico|m[uú]sculo|masa muscular|amino[aá]cidos/.test(
        text
      );

      // === 1) Objetivo principal + IMC ===

      // Bajar grasa / control peso
      if (objetivoBajarGrasa) {
        if (hasDetox) score += 40;
        if (hasFatLoss) score += 35;
        if (hasAppetite) score += 25;
        if (hasGlucose) score += 20;
        if (hasVitamins) score += 10;
      }

      // Ganar músculo
      if (objetivoGanarMusculo) {
        // Si hay sobrepeso: primero detox + grasa, luego músculo
        if (imcAlto) {
          if (hasDetox) score += 35;
          if (hasFatLoss) score += 30;
          if (hasAppetite) score += 20;
          if (hasGlucose) score += 15;
        }
        // En todos los casos, batidos / proteína suben
        if (cat === "batidos" && hasProteinMuscle) {
          score += imcAlto ? 25 : 40; // más fuerte si no hay tanto peso extra
        }
      }

      // Energía / enfoque
      if (objetivoEnergia) {
        if (hasVitamins) score += 25;
        if (hasStress) score += 15;
        if (hasMemory) score += 15;
      }

      // Apoyo general por IMC alto: detox + metabolismo
      if (imcAlto) {
        if (hasDetox) score += 15;
        if (hasFatLoss) score += 10;
      }

      // IMC bajo + ganar músculo = proteína aún más arriba
      if (imcBajo && objetivoGanarMusculo && cat === "batidos" && hasProteinMuscle) {
        score += 20;
      }

      // Categoría base (leve, por tipo de producto)
      if (["batidos", "capsulas", "tes", "extractos"].includes(cat)) score += 10;
      if (["cafes", "cereal", "aceites"].includes(cat)) score += 5;

      // === 2) Necesidades específicas marcadas en el formulario ===
      // Si la persona MARCA algo, debe subir MUCHO ese beneficio.
      const selectedNeeds = needs || {};

      if (selectedNeeds.detox && hasDetox) score += 30;
      if (selectedNeeds.libido && hasLibido) score += 30;
      if (selectedNeeds.fatLoss && hasFatLoss) score += 30;
      if (selectedNeeds.appetite && hasAppetite) score += 25;
      if (selectedNeeds.menopause && hasMenopause) score += 25;
      if (selectedNeeds.cycle && hasCycle) score += 25;
      if (selectedNeeds.glucose && hasGlucose) score += 25;
      if (selectedNeeds.cholesterol && hasGlucose) score += 20;
      if (selectedNeeds.vitamins && hasVitamins) score += 20;
      if (selectedNeeds.antiinflamatorio && hasAntiInflamm) score += 25;
      if (selectedNeeds.pressure && hasPressure) score += 25;
      if (selectedNeeds.stress && hasStress) score += 25;
      if (selectedNeeds.memory && hasMemory) score += 25;
      if (selectedNeeds.skin && hasSkin) score += 25;

      // === 3) Penalizaciones (para evitar incoherencias) ===

      // Libido NO marcada y objetivo es grasa / músculo -> NO la recomendamos
      if (!selectedNeeds.libido && hasLibido && (objetivoBajarGrasa || objetivoGanarMusculo)) {
        score -= 40; // se va casi seguro a poco ideal
      }

      // Piel no marcada y objetivo de peso/músculo -> baja prioridad
      if (!selectedNeeds.skin && hasSkin && (objetivoBajarGrasa || objetivoGanarMusculo)) {
        score -= 15;
      }

      // Si el producto solo toca temas que la persona NO marcó y no tiene nada de grasa/detox,
      // lo bajamos aún más para que no salga ideal
      const anyNeedSelected = Object.values(selectedNeeds).some(Boolean);
      if (anyNeedSelected) {
        const touchesSelectedNeed =
          (selectedNeeds.detox && hasDetox) ||
          (selectedNeeds.libido && hasLibido) ||
          (selectedNeeds.fatLoss && hasFatLoss) ||
          (selectedNeeds.appetite && hasAppetite) ||
          (selectedNeeds.menopause && hasMenopause) ||
          (selectedNeeds.cycle && hasCycle) ||
          (selectedNeeds.glucose && hasGlucose) ||
          (selectedNeeds.cholesterol && hasGlucose) ||
          (selectedNeeds.vitamins && hasVitamins) ||
          (selectedNeeds.antiinflamatorio && hasAntiInflamm) ||
          (selectedNeeds.pressure && hasPressure) ||
          (selectedNeeds.stress && hasStress) ||
          (selectedNeeds.memory && hasMemory) ||
          (selectedNeeds.skin && hasSkin);

        if (!touchesSelectedNeed && !hasDetox && !hasFatLoss && !hasProteinMuscle) {
          score -= 20;
        }
      }

      if (score < 0) score = 0;
      return score;
    }

    const scored = mergedProducts.map((p) => {
      const s = scoreProduct(p);
      let bucket = "complementario";

      // Umbrales repensados
      if (s >= 70) bucket = "ideal";
      else if (s < 35) bucket = "pocoIdeal";

      return { product: p, score: s, bucket };
    });

    scored.sort((a, b) => b.score - a.score);

    let ideales = scored.filter((x) => x.bucket === "ideal");
    let complementarios = scored.filter((x) => x.bucket === "complementario");
    const pocoIdeales = scored.filter((x) => x.bucket === "pocoIdeal");

    // Fallback: si no hay ideales, promovemos los mejores complementarios
    if (ideales.length === 0 && complementarios.length > 0) {
      const promovidos = complementarios.slice(0, 2);
      ideales = promovidos;
      complementarios = complementarios.slice(2);
    }

    return { ideales, complementarios, pocoIdeales };
  }, [profile, mergedProducts]);

  const { ideales, complementarios, pocoIdeales } = result;

  // Guardar recomendación para el PDF
  useEffect(() => {
    try {
      if (!ideales.length && !complementarios.length) {
        localStorage.removeItem("vd_recommendations");
        return;
      }

      const idealProduct = ideales[0]?.product || null;
      const complementaryProducts = complementarios.map((x) => x.product);

      const recomendacionParaPdf = {
        ideal: idealProduct
          ? {
              nombre: idealProduct.name,
              categoria: idealProduct.category,
              beneficioClave:
                (idealProduct.benefits && idealProduct.benefits[0]) || "",
            }
          : null,
        complementarios: complementaryProducts.slice(0, 4).map((p) => ({
          nombre: p.name,
          categoria: p.category,
          beneficioClave: (p.benefits && p.benefits[0]) || "",
        })),
      };

      localStorage.setItem(
        "vd_recommendations",
        JSON.stringify(recomendacionParaPdf)
      );
    } catch (error) {
      console.error("Error guardando recomendaciones para PDF:", error);
    }
  }, [ideales, complementarios]);

  if (!profile) {
    return (
      <section className="max-w-6xl mx-auto mt-4 px-4">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-gray-700">
          <div className="font-semibold text-emerald-700">Asesora Pro Vida Divina</div>
          <p className="mt-1">
            Para ver recomendaciones personalizadas, primero completa la calculadora de IMC y
            necesidades.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto mt-4 px-4">
      <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-emerald-500 font-semibold">
              Asesora Pro · Recomendación personalizada
            </div>
            <div className="mt-1 text-sm text-gray-700">
              Hola{" "}
              <span className="font-semibold text-emerald-700">
                {profile.nombre || "invitada"}
              </span>
              . Tu IMC es{" "}
              <span className="font-semibold">
                {profile.imc} ({profile.clasificacion_imc})
              </span>{" "}
              y tu objetivo es{" "}
              <span className="font-semibold">{profile.objetivo}</span>.
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Estas sugerencias combinan tu IMC, tus objetivos y lo que marcaste como importante
              (detox, apetito, glucosa, hormonas, etc.). Primero verás los productos más alineados
              para ti.
            </div>
          </div>

          <div className="text-xs bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-gray-700">
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1" /> Ideal
            </div>
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-1" /> Complementario
            </div>
            <div>
              <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-1" /> Poco ideal
              (no recomendado como principal)
            </div>
          </div>
        </div>

        {/* Ideales */}
        {ideales.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-semibold text-emerald-700">
              ✅ Tus productos principales
            </div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ideales.slice(0, 3).map(({ product }) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onOpenById && onOpenById(product.id)}
                  className="text-left rounded-2xl border border-emerald-100 bg-emerald-50/60 hover:bg-emerald-50 px-3 py-2.5 text-sm flex flex-col gap-1"
                >
                  <div className="font-semibold text-gray-800 line-clamp-2">
                    {product.name}
                  </div>
                  {Array.isArray(product.benefits) && product.benefits.length > 0 && (
                    <ul className="text-xs text-gray-700 list-disc ml-4 space-y-0.5">
                      {product.benefits.slice(0, 3).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-1 text-[11px] text-emerald-700 font-medium">
                    Ver detalles y opciones de compra →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Complementarios */}
        {complementarios.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-semibold text-amber-700">
              🟡 Complementos que pueden ayudarte
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              No son los principales, pero pueden potenciar tus resultados o cubrir otras áreas.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {complementarios.slice(0, 12).map(({ product }) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onOpenById && onOpenById(product.id)}
                  className="px-3 py-1.5 rounded-full border border-amber-100 bg-amber-50 hover:bg-amber-100 text-amber-800"
                >
                  {product.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Poco ideales */}
        {pocoIdeales.length > 0 && (
          <details className="mt-4 text-xs text-gray-500">
            <summary className="cursor-pointer">
              🔍 Ver productos poco ideales para tu objetivo (no recomendados como prioridad)
            </summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {pocoIdeales.slice(0, 20).map(({ product }) => (
                <span
                  key={product.id}
                  className="px-2 py-1 rounded-full bg-gray-100 border border-gray-200"
                >
                  {product.name}
                </span>
              ))}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}



