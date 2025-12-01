// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";

import HeaderBar from "./components/HeaderBar";
import ProductGallery from "./components/ProductGallery";
import TestimonialsManager from "./components/TestimonialsManager";
import SocialButtons from "./components-ui/SocialButtons";
import PaymentMethods from "./components/PaymentMethods";
import ProductAttachments from "./components/ProductAttachments";
import SmartAssessorPro from "./components/SmartAssessorPro";
import OfferTimer from "./components/OfferTimer";
import DownloadAnalysisPdfButton from "./components/DownloadAnalysisPdfButton.jsx";
import CatalogoAdmin from "./components/CatalogoAdmin";
import { createClient } from '@supabase/supabase-js';

import { STORAGE, loadJSON, saveJSON } from "./lib/storage";
import { buildProducts } from "./data/catalog";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);


// Perfil del usuario guardado por la calculadora IMC
const STORAGE_USER_PROFILE = "vd_user_profile";

export default function VidaDivinaApp() {
  // -------- Filtros / búsqueda --------
  const [category, setCategory] = useState("todas");
  const [query, setQuery] = useState("");

  // -------- Modal producto --------
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  // -------- Controles --------
  const [hero, setHero] = useState("");
  const [editMode, setEditMode] = useState(false);

  // -------- Datos editables --------
  const [prices, setPrices] = useState({});
  const [content, setContent] = useState({});
  const [testimonials, setTestimonials] = useState([]);
  const [media, setMedia] = useState([]);

  // -------- Redes --------
  const [social, setSocial] = useState({
    tiktok: "montoyaihfdianna",
    instagram: "dianamontoya_hdz",
    facebook: "",
  });

  // -------- Adjuntos (Ver más) --------
  const [attachments, setAttachments] = useState(
    loadJSON(STORAGE.ATTACHMENTS, {})
  );
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachmentsFor, setAttachmentsFor] = useState(null);
  const [attachmentsForName, setAttachmentsForName] = useState("");

  // -------- Perfil del usuario (desde calculadora IMC) --------
  const [profile, setProfile] = useState(null);

  // -------- Admin imágenes --------
  const [showAdmin, setShowAdmin] = useState(false);

  // -------- Mapa de imágenes dinámicas (Supabase) --------
  const [imageMap, setImageMap] = useState({});

  function openAttachmentsFor(product) {
    if (!product) return;
    setAttachmentsFor(product.id);
    setAttachmentsForName(
      product.name || product.title || `Producto #${product.id}`
    );
    setShowAttachments(true);
  }
  function closeAttachments() {
    setShowAttachments(false);
    setAttachmentsFor(null);
    setAttachmentsForName("");
  }

  // -------- Cargar imágenes dinámicas desde Supabase --------
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from("vd_catalog_images")
          .select("*");

        if (error) throw error;

        const map = {};
        (data || []).forEach((row) => {
          if (row.product_id && row.image_url) {
            map[row.product_id] = row.image_url;
          }
        });

        setImageMap(map);
      } catch (err) {
        console.error("Error cargando imágenes de catálogo:", err);
      }
    };

    fetchImages();
  }, []);

  // -------- Cargar desde localStorage --------
  useEffect(() => {
    setPrices(loadJSON(STORAGE.PRICES, {}));
    setContent(loadJSON(STORAGE.CONTENT, {}));
    setTestimonials(loadJSON(STORAGE.TESTIMONIALS, []));
    setMedia(loadJSON(STORAGE.MEDIA, []));
    setSocial(
      loadJSON(STORAGE.SOCIAL, {
        tiktok: "montoyaihfdianna",
        instagram: "dianamontoya_hdz",
        facebook: "",
      })
    );
    // attachments ya se inicializó en useState
  }, []);

  // Cargar perfil guardado por la calculadora
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER_PROFILE);
      if (raw) {
        setProfile(JSON.parse(raw));
      }
    } catch (e) {
      console.warn("No se pudo leer el perfil del usuario", e);
    }
  }, []);

  // (bloque que ya tenías, lo dejo igual)
  useEffect(() => {
    setPrices(loadJSON(STORAGE.PRICES, {}));
    setContent(loadJSON(STORAGE.CONTENT, {}));
    setTestimonials(loadJSON(STORAGE.TESTIMONIALS, []));
    setMedia(loadJSON(STORAGE.MEDIA, []));
    setSocial(
      loadJSON(STORAGE.SOCIAL, {
        tiktok: "montoyaihfdianna",
        instagram: "dianamontoya_hdz",
        facebook: "",
      })
    );
  }, []);

  // -------- Guardar en localStorage --------
  useEffect(() => saveJSON(STORAGE.PRICES, prices), [prices]);
  useEffect(() => saveJSON(STORAGE.CONTENT, content), [content]);
  useEffect(() => saveJSON(STORAGE.TESTIMONIALS, testimonials), [testimonials]);
  useEffect(() => saveJSON(STORAGE.MEDIA, media), [media]);
  useEffect(() => saveJSON(STORAGE.SOCIAL, social), [social]);
  useEffect(() => saveJSON(STORAGE.ATTACHMENTS, attachments), [attachments]);

  // -------- Catálogo combinado --------
  const baseProducts = useMemo(() => buildProducts(), []);
  const mergedProducts = useMemo(() => {
    return baseProducts.map((p) => {
      const c = (content && content[p.id]) || {};

      const mergedBullets =
        Array.isArray(c.bullets) && c.bullets.length
          ? c.bullets
          : Array.isArray(p.bullets)
          ? p.bullets
          : [];

      const imgFromDB = imageMap[p.id]; // viene de Supabase

      return {
        ...p,
        name: c.name || p.name,
        img: c.img || imgFromDB || p.img, // prioridad: contenido → BD → catálogo base
        blurb: c.blurb || p.blurb || "",
        bullets: mergedBullets,
        ingredients:
          Array.isArray(c.ingredients) && c.ingredients.length
            ? c.ingredients
            : p.ingredients || [],
        benefits:
          Array.isArray(c.benefits) && c.benefits.length
            ? c.benefits
            : p.benefits || [],
        keywords:
          Array.isArray(c.keywords) && c.keywords.length
            ? c.keywords
            : p.keywords || [],
        discount: p.discount ?? 0,
        price: p.price ?? 0,
      };
    });
  }, [baseProducts, content, imageMap]);

  // -------- Exponer a window (IDs) --------
  useEffect(() => {
    window.__baseProducts = baseProducts;
    window.__mergedProducts = mergedProducts;
  }, [baseProducts, mergedProducts]);

  // -------- Abrir por ID (Asesora Pro) --------
  function getProductById(id) {
    return mergedProducts.find((p) => p.id === id);
  }
  function onOpenById(id) {
    const p = getProductById(id);
    if (!p) return alert("Producto no encontrado en el catálogo.");
    setCategory(p.category);
    setActive(p);
    setOpen(true);
  }

  // -------- Parche global: actualizar desde “Ver más” --------
  useEffect(() => {
    window.__applyContentPatch = (productId, patch = {}) => {
      setContent((prev) => {
        const prevFor = prev?.[productId] || {};
        return {
          ...prev,
          [productId]: {
            ...prevFor,
            ...(patch.name !== undefined ? { name: patch.name } : {}),
            ...(patch.img !== undefined ? { img: patch.img } : {}),
            ...(patch.blurb !== undefined ? { blurb: patch.blurb } : {}),
            ...(Array.isArray(patch.ingredients)
              ? { ingredients: patch.ingredients }
              : {}),
            ...(Array.isArray(patch.benefits)
              ? { benefits: patch.benefits }
              : {}),
          },
        };
      });
    };
    return () => {
      try {
        delete window.__applyContentPatch;
      } catch {}
    };
  }, []);

  // -------- Exportar IDs --------
  function exportCatalogIds() {
    const list = (window.__mergedProducts || window.__baseProducts || []).map(
      (p) => ({
        id: p.id,
        name: p.name || p.title || "",
        category: p.category || "",
        price: p.price ?? null,
      })
    );
    if (!list.length) {
      alert("No se encontraron productos. Asegúrate de que la app haya cargado.");
      return;
    }
    const blob = new Blob([JSON.stringify(list, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "catalog-ids.json";
    a.click();
  }

  // -------- Respaldar / Restaurar --------
  function backupAll() {
    const payload = {
      CONTENT: loadJSON(STORAGE.CONTENT, {}),
      ATTACHMENTS: loadJSON(STORAGE.ATTACHMENTS, {}),
      PRICES: loadJSON(STORAGE.PRICES, {}),
      TESTIMONIALS: loadJSON(STORAGE.TESTIMONIALS, []),
      MEDIA: loadJSON(STORAGE.MEDIA, []),
      SOCIAL: loadJSON(STORAGE.SOCIAL, {}),
      when: new Date().toISOString(),
      app: "vida-divina-app",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vida-divina-backup.json";
    a.click();
  }

  function restoreAll() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result || "{}"));
          if (data.CONTENT) saveJSON(STORAGE.CONTENT, data.CONTENT);
          if (data.ATTACHMENTS)
            saveJSON(STORAGE.ATTACHMENTS, data.ATTACHMENTS);
          if (data.PRICES) saveJSON(STORAGE.PRICES, data.PRICES);
          if (data.TESTIMONIALS)
            saveJSON(STORAGE.TESTIMONIALS, data.TESTIMONIALS);
          if (data.MEDIA) saveJSON(STORAGE.MEDIA, data.MEDIA);
          if (data.SOCIAL) saveJSON(STORAGE.SOCIAL, data.SOCIAL);

          setContent(loadJSON(STORAGE.CONTENT, {}));
          setAttachments(loadJSON(STORAGE.ATTACHMENTS, {}));
          setPrices(loadJSON(STORAGE.PRICES, {}));
          setTestimonials(loadJSON(STORAGE.TESTIMONIALS, []));
          setMedia(loadJSON(STORAGE.MEDIA, []));
          setSocial(loadJSON(STORAGE.SOCIAL, {}));

          alert("¡Restaurado! Si no ves cambios, recarga la página.");
        } catch (err) {
          alert("Archivo inválido.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // -------- Modo Admin de imágenes (solo tú) --------
  if (showAdmin) {
    return (
      <div className="min-h-screen bg-emerald-50 text-gray-900">
        <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-700 text-white text-sm px-4 py-2 flex items-center justify-between shadow">
          <span className="font-medium">Admin de Imágenes — Vida Divina</span>
          <button
            onClick={() => setShowAdmin(false)}
            className="px-3 py-1 rounded bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
          >
            Volver al catálogo
          </button>
        </div>
        <div className="h-10" />
        <CatalogoAdmin />
      </div>
    );
  }

  // -------- Vista normal del catálogo --------
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 text-gray-900">
      {/* Barra fija herramientas */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-700 text-white text-sm px-4 py-2 flex items-center justify-between shadow">
        <span className="font-medium">Herramientas — Catálogo</span>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCatalogIds}
            className="px-3 py-1 rounded bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
            title="Exportar la lista de productos (IDs) como JSON"
          >
            Exportar catálogo (IDs)
          </button>
          <button
            onClick={backupAll}
            className="px-3 py-1 rounded bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
            title="Guardar respaldo completo (incluye imágenes en Base64)"
          >
            Respaldar todo
          </button>
          <button
            onClick={restoreAll}
            className="px-3 py-1 rounded bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
            title="Restaurar desde un archivo de respaldo"
          >
            Restaurar
          </button>
          {/* Botón para abrir el admin de imágenes */}
          <button
            onClick={() => setShowAdmin(true)}
            className="px-3 py-1 rounded bg-yellow-400 text-emerald-900 hover:bg-yellow-300 border border-yellow-200"
            title="Abrir panel para cambiar imágenes del catálogo"
          >
            Admin Imágenes
          </button>
        </div>
      </div>

      {/* Empuje por barra fija */}
      <div className="h-10" />

      {/* Header */}
      <HeaderBar
        hero={hero}
        setHero={setHero}
        editMode={editMode}
        setEditMode={setEditMode}
        social={social}
        setSocial={setSocial}
      />

      {/* Reloj de oferta */}
      <OfferTimer editMode={editMode} defaultHours={8} perUser />

      {/* Asesora Pro */}
      <SmartAssessorPro
        mergedProducts={mergedProducts}
        onOpenById={onOpenById}
        profile={profile}
      />

      {/* Botón para descargar análisis en PDF */}
      <DownloadAnalysisPdfButton />

      {/* Galería */}
      <ProductGallery
        mergedProducts={mergedProducts}
        rec={profile ? { profile } : null}
        category={category}
        setCategory={setCategory}
        query={query}
        setQuery={setQuery}
        prices={prices}
        setPrices={setPrices}
        content={content}
        setContent={setContent}
        editMode={editMode}
        onOpen={(p) => {
          setActive(p);
          setOpen(true);
        }}
        onOpenAttachments={openAttachmentsFor}
      />

      {/* Testimonios */}
      <TestimonialsManager
        products={mergedProducts}
        testimonials={testimonials}
        setTestimonials={setTestimonials}
        editMode={editMode}
      />

      {/* Modal “Ver más” */}
      {showAttachments && (
        <ProductAttachments
          productId={attachmentsFor}
          productName={attachmentsForName}
          attachments={attachments}
          setAttachments={setAttachments}
          onClose={closeAttachments}
        />
      )}

      {/* Formas de pago */}
      <PaymentMethods />

      {/* Redes */}
      <SocialButtons social={social} setSocial={setSocial} />

      {/* WhatsApp flotante */}
      <a
        href={`https://wa.me/527291022897?text=${encodeURIComponent(
          profile
            ? `Hola 👋, soy ${profile.nombre}. Mi IMC es ${profile.imc} (${profile.clasificacion_imc}) y mi objetivo es ${profile.objetivo}. Acabo de ver mis recomendaciones en tu catálogo Vida Divina y quiero información para comprar mi paquete ideal.`
            : "Hola 👋, vi tu catálogo Vida Divina y quiero hacer una compra."
        )}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg px-4 py-3 text-sm hover:opacity-90"
      >
        💬 Pagar o pedir por WhatsApp
      </a>

      {/* Footer */}
      <footer className="px-4 md:px-6 pt-6 pb-24 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Vida Divina · Catálogo de demostración
        profesional.
      </footer>
    </div>
  );
}
