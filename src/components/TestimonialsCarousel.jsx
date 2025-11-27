import React, { useEffect, useMemo, useRef, useState } from 'react';
import { loadJSON, STORAGE } from '../lib/storage';

/**
 * Usa lo que ya guardas en STORAGE.TESTIMONIALS
 * Estructura esperada por item: { text, author, img?, videoUrl? }
 */
export default function TestimonialsCarousel() {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    setItems(loadJSON(STORAGE.TESTIMONIALS, []));
  }, []);

  useEffect(() => {
    clearInterval(timer.current);
    if (!items.length) return;
    timer.current = setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer.current);
  }, [items]);

  const current = useMemo(() => items[idx] || null, [items, idx]);
  if (!items.length) return null;

  return (
    <section className="px-4 md:px-6">
      <div className="rounded-xl bg-white shadow border border-gray-200 overflow-hidden">
        <div className="bg-emerald-600 text-white px-4 py-2 text-sm font-medium">Testimonios</div>
        <div className="p-4 flex flex-col md:flex-row items-center gap-4">
          {current?.img ? (
            <img src={current.img} alt="Testimonio" className="w-28 h-28 rounded-lg object-cover border border-gray-200" />
          ) : null}

          <div className="flex-1">
            <p className="text-sm text-gray-800 leading-relaxed">“{current?.text || ''}”</p>
            <div className="text-xs text-gray-500 mt-1">— {current?.author || 'Cliente'}</div>

            {current?.videoUrl ? (
              <video
                className="mt-3 w-full max-w-md rounded-lg border border-gray-200"
                src={current.videoUrl}
                controls
              />
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2.5 h-2.5 rounded-full ${i===idx ? 'bg-emerald-600' : 'bg-gray-300'}`}
                aria-label={`Ir al testimonio ${i+1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
