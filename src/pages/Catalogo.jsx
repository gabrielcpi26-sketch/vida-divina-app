import { useState } from "react";
import { supabase } from "../supabaseClient"; // ajusta la ruta
import { subirImagenACatalogo } from "../utils/subirImagen"; // ajusta la ruta

export default function CatalogoUploaderSimple({ productId }) {
  const [imagenUrl, setImagenUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;

    setLoading(true);
    try {
      const url = await subirImagenACatalogo(file);
      if (!url) return;

      // ✅ guarda/actualiza en la tabla que lee el catálogo
      const { error } = await supabase
        .from("vd_catalog_images")
        .upsert(
          { product_id: productId, image_url: url },
          { onConflict: "product_id" }
        );

      if (error) throw error;

      setImagenUrl(url);
      console.log("OK imagen:", productId, url);
    } catch (err) {
      console.error(err);
      alert("Error subiendo/guardando imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {loading && <p>Subiendo...</p>}
      {imagenUrl && (
        <div>
          <p>Imagen lista:</p>
          <img src={imagenUrl} alt="Subida" style={{ width: 200 }} />
        </div>
      )}
    </div>
  );
}