// src/utils/subirPortada.js

// Reutilizamos la misma función que ya funciona para el catálogo
import { subirImagenACatalogo } from "./subirImagen";

export async function subirPortada(file) {
  if (!file) return null;

  try {
    const url = await subirImagenACatalogo(file);

    if (!url) {
      console.error("No se obtuvo URL al subir la portada");
      return null;
    }

    return url;
  } catch (err) {
    console.error("Error al subir portada:", err);
    return null;
  }
}

