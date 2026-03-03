// src/lib/leads.js
import { supabase } from "./supabaseClient";

export async function saveLead(lead) {
  const payload = {
    nombre: lead?.nombre || null,
    telefono: lead?.telefono || null,
    objetivo: lead?.objetivo || null,
    imc: lead?.imc ?? null,
    clasificacion_imc: lead?.clasificacion_imc || null,
    producto_interes: lead?.producto_interes || null,
    utm_source: lead?.utm_source || null,
    utm_campaign: lead?.utm_campaign || null,
  };

  const { error } = await supabase.from("vd_leads_catalog").insert([payload]);
  if (error) throw error;
}