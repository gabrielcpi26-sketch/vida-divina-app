import React from "react";
import { useNavigate } from "react-router-dom";

export default function IntroScreen() {
  const go = useNavigate();

  function start() {
    go("/imc");
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      {/* 🔥 TÍTULO PRINCIPAL — EL QUE SÍ QUIERES */}
      <h1 className="text-3xl font-extrabold text-gray-900 leading-snug">
        Problemas de <br />
        inflamación o peso estancado?
      </h1>

      <p className="mt-3 text-gray-700 text-base leading-relaxed">
        Haz este mini análisis y descubre qué está pasando con tu cuerpo y qué puedes hacer{" "}
        <span className="font-semibold text-emerald-600">HOY mismo</span> para empezar a sentirte más ligera, con energía y en control.
      </p>

      {/* 🔥 CAJA VERDE */}
      <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-gray-700 text-sm leading-relaxed">
        <div className="font-bold text-emerald-700 mb-1">En menos de 1 minuto vas a:</div>
        <ul className="list-disc ml-5 space-y-1">
          <li>Ver tu IMC explicado de forma sencilla.</li>
          <li>Definir tu objetivo prioritario (grasa, hormonas, energía…).</li>
          <li>Recibir un combo sugerido de productos Vida Divina pensado para ti.</li>
        </ul>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        👇 Toca este botón verde para iniciar tu análisis gratuito.
      </p>

      {/* 🔥 BOTÓN PRINCIPAL */}
      <button
        onClick={start}
        className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-lg shadow hover:bg-emerald-700 transition"
      >
        Empezar mi análisis (gratis)
      </button>
    </div>
  );
}

