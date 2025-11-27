
import React, { useEffect, useState } from "react";

export default function PaymentMethods(){
  const initial = {
    paypal: { email: "", note: "", qr: "" },
    bbva: { clabe: "", account: "", holder: "", qr: "" },
    banorte: { clabe: "", account: "", holder: "", qr: "" }
  };
  const [data, setData] = useState(initial);

  useEffect(()=>{
    try{
      const stored = localStorage.getItem("vd_payment_methods");
      if(stored) setData(JSON.parse(stored));
    }catch(e){}
  },[]);

  useEffect(()=>{
    try{
      localStorage.setItem("vd_payment_methods", JSON.stringify(data));
    }catch(e){}
  },[data]);

  function onChange(method, field, value){
    setData(d => ({...d, [method]: {...d[method], [field]: value}}));
  }
  function onFile(method, file){
    if(!file) return;
    const r = new FileReader();
    r.onload = () => onChange(method, "qr", String(r.result||""));
    r.readAsDataURL(file);
  }
  function copy(txt){
    if(!txt) return;
    navigator.clipboard.writeText(txt).then(()=>{
      alert("Copiado al portapapeles");
    });
  }
  function resetAll(){
    if(!confirm("¿Restablecer todos los datos de pago?")) return;
    setData(initial);
    localStorage.removeItem("vd_payment_methods");
  }
  function exportJSON(){
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vd_payment_methods.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="payments" className="px-4 md:px-6 py-8">
      <h2 className="text-2xl font-semibold mb-2">Formas de pago</h2>
      <p className="text-sm text-gray-600 mb-6">
        Edita tus datos de PayPal, BBVA (Bancomer) y Banorte. Se guardan localmente en tu navegador.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-4 border rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">PayPal</h3>
            <button className="text-xs px-2 py-1 border rounded" onClick={()=>copy(data.paypal.email)}>Copiar email</button>
          </div>
          <label className="block text-xs">Email</label>
          <input className="w-full border rounded px-2 py-1 mb-2 text-sm" value={data.paypal.email} onChange={e=>onChange("paypal","email",e.target.value)} placeholder="tu-email@ejemplo.com" />
          <label className="block text-xs">Nota (opcional)</label>
          <input className="w-full border rounded px-2 py-1 mb-2 text-sm" value={data.paypal.note} onChange={e=>onChange("paypal","note",e.target.value)} placeholder="Pago por pedido #123" />
          <label className="block text-xs">QR (imagen)</label>
          <input type="file" accept="image/*" className="w-full mb-2 text-sm" onChange={e=>onFile("paypal", e.target.files?.[0])} />
          {data.paypal.qr ? <img src={data.paypal.qr} alt="QR PayPal" className="w-full h-36 object-contain border rounded" /> : <div className="h-36 flex items-center justify-center border rounded text-xs text-gray-400">No hay QR</div>}
        </div>

        <div className="p-4 border rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">BBVA (Bancomer)</h3>
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 border rounded" onClick={()=>copy(data.bbva.clabe)}>Copiar CLABE</button>
              <button className="text-xs px-2 py-1 border rounded" onClick={()=>copy(data.bbva.account)}>Copiar cuenta</button>
            </div>
          </div>
          <label className="block text-xs">CLABE</label>
          <input className="w-full border rounded px-2 py-1 mb-2 text-sm" value={data.bbva.clabe} onChange={e=>onChange("bbva","clabe",e.target.value)} placeholder="012345678901234567" />
          <label className="block text-xs">Número de cuenta</label>
          <input className="w-full border rounded px-2 py-1 mb-2 text-sm" value={data.bbva.account} onChange={e=>onChange("bbva","account",e.target.value)} placeholder="1234567890" />
          <label className="block text-xs">Titular</label>
          <input className="w-full border rounded px-2 py-1 mb-2 text-sm" value={data.bbva.holder} onChange={e=>onChange("bbva","holder",e.target.value)} placeholder="Nombre del titular" />
          <label className="block text-xs">QR (imagen)</label>
          <input type="file" accept="image/*" className="w-full mb-2 text-sm" onChange={e=>onFile("bbva", e.target.files?.[0])} />
          {data.bbva.qr ? <img src={data.bbva.qr} alt="QR BBVA" className="w-full h-36 object-contain border rounded" /> : <div className="h-36 flex items-center justify-center border rounded text-xs text-gray-400">No hay QR</div>}
        </div>

        <div className="p-4 border rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Banorte</h3>
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 border rounded" onClick={()=>copy(data.banorte.clabe)}>Copiar CLABE</button>
              <button className="text-xs px-2 py-1 border rounded" onClick={()=>copy(data.banorte.account)}>Copiar cuenta</button>
            </div>
          </div>
          <label className="block text-xs">CLABE</label>
          <input className="w-full border rounded px-2 py-1 mb-2 text-sm" value={data.banorte.clabe} onChange={e=>onChange("banorte","clabe",e.target.value)} placeholder="012345678901234567" />
          <label className="block text-xs">Número de cuenta</label>
          <input className="w-full border rounded px-2 py-1 mb-2 text-sm" value={data.banorte.account} onChange={e=>onChange("banorte","account",e.target.value)} placeholder="1234567890" />
          <label className="block text-xs">Titular</label>
          <input className="w-full border rounded px-2 py-1 mb-2 text-sm" value={data.banorte.holder} onChange={e=>onChange("banorte","holder",e.target.value)} placeholder="Nombre del titular" />
          <label className="block text-xs">QR (imagen)</label>
          <input type="file" accept="image/*" className="w-full mb-2 text-sm" onChange={e=>onFile("banorte", e.target.files?.[0])} />
          {data.banorte.qr ? <img src={data.banorte.qr} alt="QR Banorte" className="w-full h-36 object-contain border rounded" /> : <div className="h-36 flex items-center justify-center border rounded text-xs text-gray-400">No hay QR</div>}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button className="px-4 py-2 rounded bg-emerald-600 text-white shadow" onClick={()=>alert("Datos guardados localmente")}>Guardar</button>
        <button className="px-4 py-2 rounded border" onClick={resetAll}>Restablecer</button>
        <button className="px-4 py-2 rounded border" onClick={exportJSON}>Exportar (JSON)</button>
        <span className="text-sm text-gray-500 ml-auto">Los datos se guardan localmente.</span>
      </div>
    </section>
  );
}
