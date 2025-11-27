
import React, { useState } from 'react'

export default function Carousel({ items, onRemoveIndex }) {
  const [index, setIndex] = useState(0); const total = items.length;
  const prev = () => setIndex(i => (i - 1 + total) % total);
  const next = () => setIndex(i => (i + 1) % total);
  const current = items[index];
  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="aspect-video bg-black/5 relative">
        {current.type === 'video'
          ? (<video src={current.url} controls className="w-full h-full object-contain" />)
          : (<img src={current.url} alt={current.name} className="w-full h-full object-contain" />)}
        <div className="absolute inset-x-0 bottom-0 p-2 text-center text-xs text-white bg-gradient-to-t from-black/50 to-transparent">{current.name}</div>
      </div>
      <div className="flex items-center justify-between p-3">
        <div className="text-sm text-neutral-600">{index + 1} / {total}</div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-neutral-50">Anterior</button>
          <button onClick={next} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-neutral-50">Siguiente</button>
          <button onClick={() => onRemoveIndex(index)} className="rounded-xl border px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50">Eliminar</button>
        </div>
      </div>
    </div>
  )
}
