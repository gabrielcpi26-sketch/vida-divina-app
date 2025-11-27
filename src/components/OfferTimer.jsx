// src/components/OfferTimer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const LS_KEY = "VD_OFFER_TIMER_ENDS_AT"; // cuenta por usuario

function formatRemaining(ms) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return { d, h, m, s: ss };
}

/**
 * 8 horas por usuario (se guarda en localStorage).
 * - defaultHours: 8 por defecto.
 * - editMode: muestra controles de ajuste manual.
 * - perUser: si expira, se reinicia en la siguiente visita del usuario.
 */
export default function OfferTimer({ defaultHours = 8, editMode = false, perUser = true }) {
  const [endsAt, setEndsAt] = useState(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return new Date(raw).toISOString();
    const d = new Date();
    d.setHours(d.getHours() + defaultHours);
    const iso = d.toISOString();
    localStorage.setItem(LS_KEY, iso);
    return iso;
  });

  const [now, setNow] = useState(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (endsAt) localStorage.setItem(LS_KEY, endsAt);
  }, [endsAt]);

  const remaining = useMemo(() => {
    const endMs = endsAt ? new Date(endsAt).getTime() : Date.now();
    return Math.max(0, endMs - now);
  }, [endsAt, now]);

  const { d, h, m, s } = formatRemaining(remaining);
  const expired = remaining <= 0;

  // reinicio por usuario al expirar
  useEffect(() => {
    if (expired && perUser) {
      const d = new Date();
      d.setHours(d.getHours() + defaultHours);
      const iso = d.toISOString();
      setEndsAt(iso);
      localStorage.setItem(LS_KEY, iso);
    }
  }, [expired, perUser, defaultHours]);

  function addHours(n) {
    const base = new Date(endsAt || Date.now());
    base.setHours(base.getHours() + n);
    setEndsAt(base.toISOString());
  }
  function addDays(n) {
    const base = new Date(endsAt || Date.now());
    base.setDate(base.getDate() + n);
    setEndsAt(base.toISOString());
  }
  function setFromInput(e) {
    const v = e.target.value;
    if (!v) return;
    const iso = new Date(v).toISOString();
    setEndsAt(iso);
  }
  function clearTimer() {
    localStorage.removeItem(LS_KEY);
    setEndsAt("");
  }

  // estilos urgentes (rojo/ámbar + pulso)
  return (
    <div className="mx-auto max-w-6xl px-4 mt-4">
      <div className="relative overflow-hidden rounded-2xl border border-red-400 bg-gradient-to-r from-red-50 via-amber-50 to-red-100 shadow-[0_1px_0_rgba(255,255,255,.6)_inset,0_10px_30px_rgba(220,38,38,.15)]">
        {/* banda superior */}
        <div className="px-4 py-2 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white text-xs tracking-wide font-extrabold shadow">
          ⚠️ ¡OFERTA URGENTE!
        </div>

        <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {!expired ? (
            <>
              <div className="text-sm text-red-800 font-semibold">
                Asegura tu precio antes de que se agote el tiempo:
              </div>
              <div className="flex items-center gap-2 animate-pulse">
                <TimeBlock value={d} label="días" />
                <Sep />
                <TimeBlock value={h} label="horas" highlight={h < 2 && d === 0} />
                <Sep />
                <TimeBlock value={m} label="min" highlight={d === 0 && h === 0 && m < 30} />
                <Sep />
                <TimeBlock value={s} label="seg" highlight={d === 0 && h === 0 && m < 5} />
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <div className="text-sm md:text-base font-bold text-red-700">
                ⏱️ Este período terminó.
              </div>
              {editMode && (
                <button
                  onClick={() => addHours(defaultHours)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Reiniciar +{defaultHours}h
                </button>
              )}
            </div>
          )}
        </div>

        {/* controles de edición */}
        {editMode && (
          <div className="px-4 pb-4 flex flex-col md:flex-row items-start md:items-center gap-3 text-xs text-red-900">
            <div className="flex items-center gap-2">
              <button
                onClick={() => addHours(1)}
                className="px-2 py-1 rounded border border-red-300 bg-white hover:bg-red-50"
              >
                +1h
              </button>
              <button
                onClick={() => addHours(6)}
                className="px-2 py-1 rounded border border-red-300 bg-white hover:bg-red-50"
              >
                +6h
              </button>
              <button
                onClick={() => addDays(1)}
                className="px-2 py-1 rounded border border-red-300 bg-white hover:bg-red-50"
              >
                +1 día
              </button>
              <button
                onClick={() => addDays(7)}
                className="px-2 py-1 rounded border border-red-300 bg-white hover:bg-red-50"
              >
                +7 días
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px]">Fin manual:</label>
              <input
                type="datetime-local"
                onChange={setFromInput}
                className="px-2 py-1 rounded border border-red-300 bg-white"
                value={endsAt ? new Date(endsAt).toISOString().slice(0, 16) : ""}
              />
            </div>

            <button
              onClick={clearTimer}
              className="px-2 py-1 rounded border border-red-300 text-red-700 bg-white hover:bg-red-50"
              title="Desactivar/limpiar"
            >
              Desactivar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeBlock({ value, label, highlight = false }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="text-center">
      <div
        className={[
          "min-w-[3.5rem] text-lg md:text-2xl font-black rounded-lg px-3 py-1 border shadow-sm",
          highlight
            ? "text-white bg-red-600 border-red-700 animate-[ping_1.5s_ease-in-out_infinite]"
            : "text-red-800 bg-white border-red-300",
        ].join(" ")}
      >
        {v}
      </div>
      <div className="text-[11px] text-red-700 mt-0.5">{label}</div>
    </div>
  );
}

function Sep() {
  return <div className="text-red-600 font-extrabold">:</div>;
}

