// src/utils/subirImagen.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Sube la imagen al bucket "publicidad/catalogo" y regresa la URL pública
export async function subirImagenACatalogo(file) {
  if (!file) return null;

  const nombreUnico = `${Date.now()}-${file.name}`;
  const rutaCompleta = `catalogo/${nombreUnico}`;

  // IMPORTANTE: el nombre del bucket es "publicidad" (minúsculas)
  const { error } = await supabase.storage
    .from("publicidad")
    .upload(rutaCompleta, file);

  if (error) {
    console.error("Error al subir imagen:", error.message);
    return null;
  }

  const { data } = supabase.storage
    .from("publicidad")
    .getPublicUrl(rutaCompleta);

  if (!data || !data.publicUrl) {
    console.error("No se pudo obtener la URL pública de la imagen");
    return null;
  }

  return data.publicUrl;
}
