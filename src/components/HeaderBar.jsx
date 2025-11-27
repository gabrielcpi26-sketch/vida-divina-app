
import React from 'react'
export default function HeaderBar({ hero, setHero, editMode, setEditMode, social, setSocial }) {
  function onHeroUpload(e){ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=(ev)=>setHero(String(ev.target?.result||'')); r.readAsDataURL(f); }
  function openSocialSettings(){ const t=prompt('Usuario de TikTok (sin @) o URL completa', social.tiktok||''); if(t==null) return; const i=prompt('Usuario de Instagram (sin @) o URL completa', social.instagram||''); if(i==null) return; const fb=prompt('Usuario o URL de Facebook', social.facebook||''); if(fb==null) return; setSocial({tiktok:t.trim(), instagram:i.trim(), facebook:fb.trim()}); }
  return (
    <section className="relative">
      <div className="h-[220px] md:h-[300px] w-full overflow-hidden">
        {hero ? (<img src={hero} alt="Portada" className="w-full h-full object-cover" />) : (
          <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100 via-white to-emerald-50">
            <div className="text-center"><div className="text-3xl md:text-4xl font-bold tracking-tight">Vida Divina</div><div className="text-sm md:text-base text-gray-600 mt-1">Live Healthy. Live Wealthy.</div><div className="mt-3 text-xs text-gray-500">(Sube tu foto de inicio para personalizar)</div></div>
          </div>
        )}
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        <button onClick={()=>{ const el=document.getElementById('payments'); if(el) el.scrollIntoView({behavior:'smooth'}); }}
                className="px-3 py-2 bg-white/90 backdrop-blur rounded-full text-xs shadow border hover:bg-white"
                title="Ir a formas de pago">
          💳 Formas de pago
        </button>
        <label className="px-3 py-2 bg-white/90 backdrop-blur rounded-full text-xs md:text-sm cursor-pointer shadow border hover:bg-white">📷 Importar portada
          <input type="file" accept="image/*" className="hidden" onChange={onHeroUpload} />
        </label>
        <button onClick={openSocialSettings} className="px-3 py-2 rounded-full text-xs md:text-sm shadow border bg-white text-gray-800 border-gray-200" title="Configurar redes">⚙️ Redes</button>
        <button onClick={() => setEditMode(v=>!v)} className={`px-3 py-2 rounded-full text-xs md:text-sm shadow border ${editMode?'bg-emerald-600 text-white border-emerald-600':'bg-white text-gray-800 border-gray-200'}`} title="Editar catálogo">🖊️ {editMode?'Modo edición':'Editar catálogo'}</button>
      </div>
    </section>
  )
}
