// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useLocation } from "react-router-dom";

import HeaderBar from "./components/HeaderBar";
import ProductGallery from "./components/ProductGallery";
import TestimonialsManager from "./components/TestimonialsManager";
import SocialButtons from "./components-ui/SocialButtons";
import PaymentMethods from "./components/PaymentMethods";
import ProductAttachments from "./components/ProductAttachments";
import SmartAssessorPro from "./components/SmartAssessorPro";
import OfferTimer from "./components/OfferTimer";

import CatalogoAdmin from "./components/CatalogoAdmin";

// ✅ Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const STORAGE_USER_PROFILE = "vd_user_profile";



export default function VidaDivinaApp() {
console.log("APP_VIDA_DIVINA_RENDER_OK");
  // -------- Filtros / búsqueda --------
  const [category, setCategory] = useState("todas");
  const [query, setQuery] = useState("");

  // -------- Modal producto (si lo usas) --------
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  // -------- Header / modo edición --------
  const [hero, setHero] = useState("");
  const [editMode, setEditMode] = useState(false);

  // -------- Perfil IMC --------
  const [profile, setProfile] = useState(null);

  // -------- Admin imágenes --------
  const [showAdmin, setShowAdmin] = useState(false);

  // ✅ “Ver más” modal
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachmentsFor, setAttachmentsFor] = useState(null);

  // -------- Datos desde Supabase --------
  const [baseProducts, setBaseProducts] = useState([]);
  const [contentMap, setContentMap] = useState({});
  const [testimonials, setTestimonials] = useState([]);
  const [media, setMedia] = useState([]);
  const [imageMap, setImageMap] = useState({});
const [mergedProducts, setMergedProducts] = useState([]);

const location = useLocation();

const META_PIXEL_ID = "1554833019152744";

useEffect(() => {
  if (window.fbq) {
    window.fbq("track", "PageView");
    return;
  }

  window.fbq = function () {
    window.fbq.callMethod
      ? window.fbq.callMethod.apply(window.fbq, arguments)
      : window.fbq.queue.push(arguments);
  };

  if (!window._fbq) window._fbq = window.fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = "2.0";
  window.fbq.queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";

  script.onload = () => {
    window.fbq("init", "1554833019152744");
    window.fbq("track", "PageView");
    console.log("PIXEL_CARGADO_OK");
  };

  document.head.appendChild(script);
}, []);

  // ✅ Precios/promo (usados por ProductCard en editMode)
  // (puedes migrarlos a Supabase después; ahorita se mantienen en estado)
  const [prices, setPrices] = useState({});

  // ✅ Redes
const [social, setSocial] = useState(() => {
  try {
    const saved = localStorage.getItem("vd_social_links");
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    tiktok: "montoyaihfdianna",
    instagram: "dianamontoya_hdz",
    facebook: "",
  };
});

useEffect(() => {
  try {
    localStorage.setItem("vd_social_links", JSON.stringify(social));
  } catch {}
}, [social]);



 // ==============================
// 🔥 CARGA TOTAL DESDE SUPABASE
// ==============================
useEffect(() => {
  const fetchAll = async () => {
    try {
      const [
  { data: products, error: e1 },
  { data: content, error: e2 },
  { data: testimonialsData, error: e3 },
  { data: mediaData, error: e4 },
  { data: images, error: e5 },
  { data: baseProducts, error: e6 }, // 👈 NUEVO
] = await Promise.all([
  supabase
    .from("vd_products_pro")
    .select("*")
    .eq("active", true)
    .gt("price", 0),

  supabase.from("vd_product_content").select("*"),
  supabase.from("vd_testimonials").select("*"),
  supabase.from("vd_product_media").select("*"),
  supabase.from("vd_catalog_images").select("*"),

  // 👇 NUEVA QUERY
  supabase.from("vd_products").select("id, price"),
]);

      if (e1) throw e1;
      if (e2) throw e2;
      if (e3) throw e3;
      if (e4) throw e4;
      if (e5) throw e5;

      setBaseProducts(products || []);
// 🔥 MAPA DE PRECIOS REALES
const priceMap = {};
(baseProducts || []).forEach((p) => {
  priceMap[p.id] = p.price;
});

      const contentObj = {};
      (content || []).forEach((row) => {
        contentObj[row.product_id] = row;
      });
      setContentMap(contentObj);

      // ✅ NORMALIZADOR QUIRÚRGICO (evita romper bullets jsonb)
      const toArr = (v) => {
        if (Array.isArray(v)) return v;
        if (v == null) return [];
        if (typeof v === "string") {
          try {
            const parsed = JSON.parse(v);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            const s = v.trim();
            return s ? [s] : [];
          }
        }
        // jsonb a veces llega como objeto
        if (typeof v === "object") {
          try {
            const vals = Object.values(v);
            return Array.isArray(vals) ? vals : [];
          } catch {
            return [];
          }
        }
        return [];
      };


      
      
      // ✅ mapa de imágenes (vd_catalog_images)
const imgMap = {};
(images || []).forEach((row) => {
  const key = String(row?.product_id || "").trim().toLowerCase();
  if (key) imgMap[key] = row.image_url;
});

const merged = (products || []).map((p) => {
  const pid = String(p?.id || "").trim().toLowerCase();
  const extra = contentObj[p.id] || {};
  return {
    ...p,
    img: imgMap[pid] || p.img || "",
          benefits: toArr(extra.benefits),
          keywords: toArr(extra.keywords),
          ingredients: toArr(extra.ingredients),
          bullets: toArr(extra.bullets),
          custom_name: extra.custom_name || p.name,
        };
      });
      setMergedProducts(merged);
      window.__vdMergedProducts = merged;

      setTestimonials(testimonialsData || []);
      setMedia(mediaData || []);

    
    } catch (err) {
      console.error("Error cargando Supabase:", err);
    }
  };

  fetchAll();
}, []);


useEffect(() => {
  if (!showAdmin) {
    fetchImagesMap(); // ✅ al volver al catálogo, recarga imágenes
  }
}, [showAdmin]);




async function fetchImagesMap() {
  const { data, error } = await supabase
    .from("vd_catalog_images")
    .select("product_id,image_url");

  if (error) {
    console.error("fetchImagesMap error:", error);
    return;
  }


// ✅ Re-merge automático cuando cambien products/content/images
useEffect(() => {
  // mismo normalizador que ya usas
  const toArr = (v) => {
    if (Array.isArray(v)) return v;
    if (v == null) return [];
    if (typeof v === "string") {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        const s = v.trim();
        return s ? [s] : [];
      }
    }
    if (typeof v === "object") {
      try {
        const vals = Object.values(v);
        return Array.isArray(vals) ? vals : [];
      } catch {
        return [];
      }
    }
    return [];
  };

const merged = (baseProducts || []).map((p) => {
  const extra = contentMap?.[p.id] || {};
  return {
    ...p,
    img: imageMap?.[p.id] || p.img || "",
    benefits: toArr(extra.benefits),
    keywords: toArr(extra.keywords),
    ingredients: toArr(extra.ingredients),
    bullets: toArr(extra.bullets),
    custom_name: extra.custom_name || p.name,

    // 🔥 FIX PRECIO REAL
    price: priceMap?.[p.id] ?? p.price ?? 0,
  };
});

  setMergedProducts(merged);
}, [baseProducts, contentMap, imageMap]);

  const map = {};
  (data || []).forEach((r) => {
    if (r?.product_id && r?.image_url) map[r.product_id] = r.image_url;
  });

  setImageMap(map);
}

async function fetchImagesMap() {
  const { data, error } = await supabase
    .from("vd_catalog_images")
    .select("product_id,image_url");

  if (error) {
    console.error("fetchImagesMap error:", error);
    return;
  }

  const map = {};
  (data || []).forEach((r) => {
    if (r?.product_id && r?.image_url) map[r.product_id] = r.image_url;
  });

  setImageMap(map);

  // ✅ CLAVE: actualiza mergedProducts con el nuevo map (para que se pinte al volver)
  setMergedProducts((prev) =>
    (prev || []).map((p) => ({
      ...p,
      img: map[p.id] || p.img || "",
    }))
  );
}

  // ==============================
  // Perfil IMC desde localStorage
  // ==============================
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER_PROFILE);
      if (raw) setProfile(JSON.parse(raw));
    } catch (e) {
      console.warn("No se pudo leer el perfil del usuario", e);
    }
  }, []);

// ==============================
// 🔥 Cargar portada persistente (Supabase)
// ==============================
useEffect(() => {
  async function fetchHeroImage() {
    try {
      const { data, error } = await supabase
        .from("vd_settings")
        .select("value")
        .eq("key", "hero_image")
        .single();

      if (!error && data?.value) {
        setHero(data.value);
      }
    } catch (err) {
      console.warn("No se pudo cargar hero_image:", err);
    }
  }

  fetchHeroImage();
}, []);

  // ==============================
  // PATCH GLOBAL para “Ver más”
  // ==============================
  useEffect(() => {
    window.__applyContentPatch = async (productId, patch = {}) => {
      try {
        await supabase.from("vd_product_content").upsert({
          product_id: productId,
          ...patch,
          updated_at: new Date().toISOString(),
        });

        setContentMap((prev) => ({
          ...prev,
          [productId]: { ...(prev?.[productId] || {}), ...patch },
        }));
      } catch (e) {
        console.error("Error guardando patch:", e);
      }
    };

    return () => {
      try {
        delete window.__applyContentPatch;
      } catch {}
    };
  }, []);

  function getProductById(id) {
    return mergedProducts.find((p) => p.id === id);
  }

  function onOpenById(id) {
    const p = getProductById(id);
    if (!p) return;
    setCategory(p.category);
    setActive(p);
    setOpen(true);
  }

function getUTM(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

  // ==============================
  // EXPORTAR CATÁLOGO
  // ==============================
  function exportCatalogIds() {
    const list = (mergedProducts || []).map((p) => ({
      id: p.id,
      name: p.name || p.title || "",
      category: p.category || "",
      price: p.price ?? null,
    }));

    const blob = new Blob([JSON.stringify(list, null, 2)], {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "catalog-ids.json";
    a.click();
  }

  // ==============================
  // ADMIN IMÁGENES
  // ==============================
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

 // ==============================
// UI
// ==============================

const ADMIN_KEY = "vd_admin_secure";
const ADMIN_VALUE = "DIANA_MASTER_2026";

const isAdmin =
  typeof window !== "undefined" &&
  localStorage.getItem(ADMIN_KEY) === ADMIN_VALUE;

return (
  <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 text-gray-900">

    {/* 🔥 Barra PRO (solo admin) */}
    {isAdmin && (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-700 text-white text-sm px-4 py-2 flex items-center justify-between shadow">
          <span className="font-medium">Herramientas — Catálogo</span>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCatalogIds}
              className="px-3 py-1 rounded bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
            >
              Exportar catálogo
            </button>
            <button
              onClick={() => setShowAdmin(true)}
              className="px-3 py-1 rounded bg-yellow-400 text-emerald-900 hover:bg-yellow-300 border border-yellow-200"
            >
              Admin Imágenes
            </button>
          </div>
        </div>

        {/* Empuje solo si existe barra */}
        <div className="h-10" />
      </>
    )}

      {/* Header */}
      <HeaderBar
        hero={hero}
        setHero={setHero}
        editMode={editMode}
        setEditMode={setEditMode}
        social={social}
        setSocial={setSocial}
      />

      {/* Oferta */}
      <OfferTimer editMode={editMode} defaultHours={8} perUser />

      {/* Asesora Pro */}
      <SmartAssessorPro
        mergedProducts={mergedProducts}
        onOpenById={onOpenById}
        profile={profile}
      />

   

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
        content={contentMap} // 👈 IMPORTANTE: tu ProductCard usa content[pid]
        setContent={setContentMap}
        editMode={editMode}
        onOpen={(p) => {
          setActive(p);
          setOpen(true);
        }}
        onOpenAttachments={(p) => {
          setAttachmentsFor(p.id);
          setShowAttachments(true);
        }}
      />

      {/* ✅ Modal “Ver más” */}
      {showAttachments && attachmentsFor && (
        <ProductAttachments
          product={getProductById(attachmentsFor)}
          editMode={editMode}
          content={contentMap}
          setContent={setContentMap}
          testimonials={testimonials}
          setTestimonials={setTestimonials}
          media={media}
          setMedia={setMedia}
          onClose={() => {
            setShowAttachments(false);
            setAttachmentsFor(null);
          }}
        />
      )}

      {/* Testimonios */}
      <TestimonialsManager
        products={mergedProducts}
        testimonials={testimonials}
        setTestimonials={setTestimonials}
        editMode={editMode}
      />

      {/* Pagos */}
      <PaymentMethods />

      {/* Redes */}
      <SocialButtons social={social} setSocial={setSocial} />

      {/* Footer */}
      <footer className="px-4 md:px-6 pt-6 pb-24 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Vida Divina · Catálogo de demostración profesional.
      </footer>
    </div>
  );
}