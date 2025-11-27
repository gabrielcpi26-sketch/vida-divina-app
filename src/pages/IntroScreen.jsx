import React from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.png"; 
// Asegúrate que tu imagen se llame hero.png y esté en src/assets/

export default function IntroScreen() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/imc"); // 👉 te manda directo al formulario / quiz
  };

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col justify-start pb-10">
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* TARJETA PRINCIPAL CON FOTO + TEXTO */}
        <div className="bg-white rounded-3xl shadow-md overflow-hidden flex flex-col md:flex-row">

          {/* FOTO */}
          <div className="w-full md:w-1/2">
            <img
              src={heroImg}
              alt="Mujer con inflamación abdominal"
              className="w-full h-full object-cover"
            />
          </div>

          {/* TEXTO / GANCHO */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
              Asesora Pro Vida Divina
            </div>

            <div className="inline-flex items-center gap-2 mt-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs">
              <span>✨ Análisis personalizado</span>
              <span className="text-gray-400">•</span>
              <span>Gratis y sin compromiso</span>
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              ¿Problemas de inflamación<br />o peso estancado?
            </h1>

            <p className="mt-3 text-gray-600 text-sm md:text-base">
              Haz este mini análisis y descubre qué está pasando con tu cuerpo y
              qué puedes hacer <span className="font-semibold text-emerald-700">HOY mismo</span>{" "}
              para empezar a sentirte más ligera, con energía y en control.
            </p>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mt-5 text-sm text-gray-700">
              <div className="font-semibold text-emerald-700 mb-1">
                En menos de 1 minuto vas a:
              </div>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Ver tu IMC explicado de forma sencilla.</li>
                <li>• Definir tu objetivo prioritario (grasa, hormonas, energía…).</li>
                <li>• Recibir un combo sugerido de productos Vida Divina pensado para ti.</li>
              </ul>
            </div>

            {/* MANITA + TEXTO DE INVITACIÓN */}
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold mt-3">
              <span className="animate-bounce text-xl">👇</span>
              <span>Toca este botón verde para iniciar tu análisis gratuito.</span>
            </div>

            {/* BOTÓN PRINCIPAL */}
            <button
              onClick={handleStart}
              className="mt-3 bg-emerald-600 hover:bg-emerald-700 transition-all text-white font-bold text-lg py-3 px-6 rounded-2xl shadow-md w-full md:w-auto"
            >
              Empezar mi análisis (gratis)
            </button>

            <div className="mt-3 text-xs text-gray-400">
              No es un diagnóstico médico, solo una guía clara basada en tu cuerpo y tus objetivos.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
