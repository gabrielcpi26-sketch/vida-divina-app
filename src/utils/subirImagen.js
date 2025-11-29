// src/utils/subirImagen.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function subirImagenACatalogo(file) {
  const nombreUnico = `${Date.now()}-${file.name}`;
  const rutaCompleta = `catalogo/${nombreUnico}`;

  const { error } = await supabase.storage
    .from('PUBLICIDAD')
    .upload(rutaCompleta, file);

  if (error) {
    console.error('Error al subir imagen:', error.message);
    return null;
  }

  const { data } = supabase.storage
    .from('PUBLICIDAD')
    .getPublicUrl(rutaCompleta);

  return data.publicUrl;
}

