// src/components/IntroHero.jsx
import React from "react";
import heroImg from "../assets/hero.png"; // <<-- tu imagen nueva

export default function IntroHero({ onStart }) {
  return (
    <section className="mx-auto max-w-6xl mt-6 px-4">
      <div className="rounded-3xl bg-white shadow-md border border-emerald-100 overflow-hidden grid md:grid-cols-2">
        {/* Columna izquierda: imagen */}
        <div className="bg-emerald-50/40 relative">
          <img
            src={heroImg}
            alt="Mujer con inflamación abdominal"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Columna derecha: copy de venta */}
        <div className="p-6 md:p-8 flex flex-col justify-center gap-4">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
            Asesora Pro Vida Divina
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-emerald-800">
            ¿Problemas de inflamación, cansancio o peso estancado?
          </h1>

          <p className="text-sm text-gray-700">
            Haz este mini análisis y descubre qué está pasando con tu cuerpo y
            qué puedes hacer <span className="font-semibold">HOY</span> mismo
            para empezar a sentirte más ligera, con energía y en control.
          </p>

          <ul className="text-sm text-gray-700 space-y-1 bg-emerald-50/60 border border-emerald-100 rounded-2xl px-4 py-3">
            <li>• Tu IMC explicado de forma sencilla.</li>
            <li>• Tu objetivo prioritario (grasa, hormonas, energía, digestión…).</li>
            <li>• Un combo sugerido de productos Vida Divina pensado para ti.</li>
          </ul>

          <div className="text-xs text-gray-500">
            Empieza aquí 👇 Responde un par de pasos y al final verás tus
            productos recomendados.
          </div>

          <button
            type="button"
            onClick={onStart}
            className="mt-1 w-full md:w-auto inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 text-sm shadow-lg shadow-emerald-500/30 transition-transform hover:-translate-y-0.5"
          >
            Empezar mi análisis (gratis)
          </button>

          <div className="mt-1 text-[11px] text-gray-400">
            No es un diagnóstico médico, pero sí una guía orientativa basada en
            tu cuerpo y tus objetivos.
          </div>
        </div>
      </div>
    </section>
  );
}
