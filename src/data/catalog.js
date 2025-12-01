export function buildProducts() {
  const BASE = [
    // === 13 BASE (de tu catalog-ids.json visto en tu app) ===
    // NOTA: Si algún id/nombre no coincide con el tuyo, puedes ajustarlo.
    {

      id: "te_divina_original",
      name: "Té Divina Original",
      category: "tes",
      price: 599,
      img: "/img/te_divina_original.jpg",
      blurb: "Fórmula botánica para limpieza y bienestar digestivo. Libre de cafeína.",
      bullets: ["Mezcla de 12 hierbas", "Apoya digestión", "Libre de cafeína"],
      ingredients: [
        "Hojas de caqui (Persimmon)", "Cardo santo (Holy Thistle)", "Malva", "Marsh/Mallow",
        "Blessed Thistle", "Papaya", "Mirra", "Manzanilla", "Jengibre", "Cranberry", "Chaga", "Reishi"
      ],
      benefits: ["Favorece la digestión", "Apoya depuración", "Sensación de ligereza"],
      keywords: ["detox","digestión","hierbas","reishi","chaga"]
    },
    {
      id: "cafe_divina_sculpt_black",
      name: "Café Divina Sculpt Black",
      category: "cafes",
      price: 499,
      img: "/img/cafe_divina_sculpt_black.jpg",
      blurb: "Café arábica con extractos botánicos seleccionados.",
      bullets: ["Café Arábica premium","Con Reishi y Garcinia","Sabor black"],
      ingredients: ["Café arábica", "Reishi (Ganoderma)", "Garcinia cambogia", "Ginseng*", "Hoja de loto*", "Cactus*", "L-carnitina*"],
      benefits: ["Energía suave", "Apoyo general bienestar", "Apoyo a control del apetito"],
      keywords: ["café","reishi","garcinia","energía","negro"]
    },
    {
      id: "cafe_divina_sculpt_latte",
      name: "Café Divina Sculpt Latte",
      category: "cafes",
      price: 499,
      img: "/img/cafe_divina_sculpt_latte.jpg",
      blurb: "Café arábica estilo latte con Reishi.",
      bullets: ["Perfil cremoso", "Con Reishi", "Opción suave"],
      ingredients: ["Café arábica", "Reishi (Ganoderma)", "Mezcla funcional*"],
      benefits: ["Sabor latte", "Apoyo bienestar", "Alternativa al black"],
      keywords: ["café","latte","reishi"]
    },
    {
      id: "cafe_divina_sculpt_tongkat",
      name: "Café Divina Sculpt Tongkat",
      category: "cafes",
      price: 549,
      img: "/img/cafe_divina_sculpt_tongkat.jpg",
      blurb: "Café arábica con extracto de Tongkat Ali.",
      bullets: ["Café arábica + Tongkat Ali","Sabor balanceado","Funcional"],
      ingredients: ["Café arábica","Tongkat Ali","Reishi*"],
      benefits: ["Energía del café","Opción funcional distinta","Tradición botánica"],
      keywords: ["café","tongkat","funcional"]
    },
    {
      id: "ignite",
      name: "Ignite",
      category: "capsulas",
      price: 649,
      img: "/img/ignite.jpg",
      blurb: "Mezcla premium de enzimas digestivas.",
      bullets: ["Apoya digestión completa","Uso con comidas principales"],
      ingredients: ["Proteasa","Amilasa","Lipasa","Otras enzimas"],
      benefits: ["Mejor digestión","Mejor absorción de nutrientes"],
      keywords: ["enzimas","digestión","proteasa","amilasa","lipasa"]
    },
    {
      id: "sleep_n_lose",
      name: "Sleep N Lose",
      category: "capsulas",
      price: 649,
      img: "/img/sleep_n_lose.jpg",
      blurb: "Fórmula nocturna para descanso con apoyo al control de peso.",
      bullets: ["Con Reishi","Con cetona de frambuesa"],
      ingredients: ["Reishi (Ganoderma lucidum)", "Cetona de frambuesa", "Mezcla nocturna"],
      benefits: ["Apoya descanso saludable","Complementa control de peso"],
      keywords: ["sueño","descanso","reishi","frambuesa"]
    },
    {
      id: "atom",
      name: "Atom",
      category: "capsulas",
      price: 699,
      img: "/img/atom.jpg",
      blurb: "Cápsulas energéticas con mezcla termogénica.",
      bullets: ["Energía y enfoque","Útil antes de actividad"],
      ingredients: ["Café verde*","Té verde*","Guaraná*","Vitaminas/cofactores*"],
      benefits: ["Energía sostenida","Enfoque/claridad"],
      keywords: ["energía","termogénico","guaraná","café verde"]
    },
    {
      id: "mars",
      name: "Mars",
      category: "capsulas",
      price: 699,
      img: "/img/mars.jpg",
      blurb: "Fórmula masculina con hierbas tradicionales.",
      bullets: ["Con Tongkat y Epimedium","Vitalidad"],
      ingredients: ["Tongkat Ali","Horny Goat Weed (Epimedium)","Maca*","Mezcla de apoyo*"],
      benefits: ["Apoyo a vitalidad masculina","Energía y bienestar general"],
      keywords: ["masculino","tongkat","epimedium","vitalidad"]
    },
    {
      id: "venus",
      name: "Venus",
      category: "capsulas",
      price: 699,
      img: "/img/venus.jpg",
      blurb: "Fórmula femenina con hierbas de equilibrio.",
      bullets: ["Maca y Tongkat","Bienestar femenino"],
      ingredients: ["Maca","Tongkat Ali","Mezcla femenina*"],
      benefits: ["Equilibrio femenino","Ánimo y energía"],
      keywords: ["femenino","maca","equilibrio"]
    },
    {
      id: "extracto_chaga",
      name: "Extracto Chaga",
      category: "extractos",
      price: 799,
      img: "/img/extracto_chaga.jpg",
      blurb: "Extracto concentrado de hongo Chaga.",
      bullets: ["Hongo funcional","Presentación gotero"],
      ingredients: ["Chaga (Inonotus obliquus)"],
      benefits: ["Apoyo antioxidante","Bienestar general"],
      keywords: ["chaga","extracto","hongo"]
    },
    {
      id: "extracto_cordycs4",
      name: "Extracto Cordyceps CS-4",
      category: "extractos",
      price: 799,
      img: "/img/extracto_cordycs4.jpg",
      blurb: "Extracto de Cordyceps (CS-4).",
      bullets: ["Hongo funcional","Energía tradicional"],
      ingredients: ["Cordyceps (CS-4)"],
      benefits: ["Apoyo a energía/rendimiento","Bienestar respiratorio tradicional"],
      keywords: ["cordyceps","extracto","energía"]
    },
    {
      id: "extracto_lions_mane",
      name: "Extracto Lion's Mane",
      category: "extractos",
      price: 799,
      img: "/img/extracto_lions_mane.jpg",
      blurb: "Extracto de Hericium erinaceus (melena de león).",
      bullets: ["Hongo funcional","Enfoque/claridad"],
      ingredients: ["Lion's Mane (Hericium erinaceus)"],
      benefits: ["Apoyo cognitivo","Claridad mental"],
      keywords: ["lion's mane","cognitivo","hongo"]
    },
    {
      id: "factor_divina",
      name: "Factor Divina",
      category: "otros",
      price: 599,
      img: "/img/factor_divina.jpg",
      blurb: "Complemento multivitamínico/funcional de uso diario.",
      bullets: ["Uso cotidiano","Complementa nutrición"],
      ingredients: ["Complejo multivitamínico*","Minerales/cofactores*"],
      benefits: ["Apoyo nutricional general","Vitalidad"],
      keywords: ["multivitamínico","diario","divina"]
    }
  ];

  // === 33 PLANTILLAS EDITABLES PARA COMPLETAR 46 ===
  // Puedes renombrar id/name e imagen según tu catálogo real. No chocan con tus ids.
  // Están organizadas por categorías usuales (cafes, tes, capsulas, extractos, batidos, cereal, aceites, otros).
  const FILLERS = [
    // CAFÉS (6)
    {
      id: "custom_cafe_ganoderma_gold",
      name: "Café Divina Gold",
      category: "cafes",
      price: 499,
      img: "/img/placeholder_cafe_gold.jpg",
      blurb: "Café arábica suave con hongo funcional.",
      bullets: ["Arábica + Reishi", "Perfil balanceado", "Ideal diario"],
      ingredients: ["Café arábica", "Reishi (Ganoderma)"],
      benefits: ["Energía suave", "Bienestar general"]
    },
    {
      id: "custom_cafe_mocha",
      name: "Café Divina Mocha",
      category: "cafes",
      price: 499,
      img: "/img/placeholder_cafe_mocha.jpg",
      blurb: "Café con notas de cacao estilo mocha.",
      bullets: ["Arábica + cacao", "Cremoso", "Fácil de tomar"],
      ingredients: ["Café arábica", "Cacao*", "Reishi*"],
      benefits: ["Energía + sabor", "Bienestar"]
    },
    {
      id: "custom_cafe_caramel",
      name: "Café Divina Caramel",
      category: "cafes",
      price: 499,
      img: "/img/placeholder_cafe_caramel.jpg",
      blurb: "Café con notas dulces estilo caramelo.",
      bullets: ["Arábica aromático", "Dulzor ligero", "Opción postre"],
      ingredients: ["Café arábica", "Aromas tipo caramelo*"],
      benefits: ["Energía", "Sabor dulce"]
    },
    {
      id: "custom_cafe_vainilla",
      name: "Café Divina Vainilla",
      category: "cafes",
      price: 499,
      img: "/img/placeholder_cafe_vainilla.jpg",
      blurb: "Café con notas de vainilla.",
      bullets: ["Arábica + vainilla", "Perfil suave"],
      ingredients: ["Café arábica", "Vainilla*"],
      benefits: ["Energía", "Sabor suave"]
    },
    {
      id: "custom_cafe_hazelnut",
      name: "Café Divina Hazelnut",
      category: "cafes",
      price: 499,
      img: "/img/placeholder_cafe_hazelnut.jpg",
      blurb: "Café con notas de avellana.",
      bullets: ["Arábica aromático", "Perfil tostado"],
      ingredients: ["Café arábica", "Aroma de avellana*"],
      benefits: ["Energía", "Sabor tostado"]
    },
    {
      id: "custom_cafe_3en1",
      name: "Café Divina 3 en 1",
      category: "cafes",
      price: 499,
      img: "/img/placeholder_cafe_3en1.jpg",
      blurb: "Café con crema y endulzante integrados.",
      bullets: ["Práctico", "Listo para preparar"],
      ingredients: ["Café arábica", "Base latte", "Endulzante*"],
      benefits: ["Energía", "Comodidad"]
    },

    // TÉS (6) – además del Té Divina Original
    {
      id: "custom_te_divina_manzanilla",
      name: "Té Divina Manzanilla",
      category: "tes",
      price: 549,
      img: "/img/placeholder_te_manzanilla.jpg",
      blurb: "Infusión suave con manzanilla.",
      bullets: ["Relajante tradicional", "Suave sabor"],
      ingredients: ["Manzanilla", "Mezcla botánica*"],
      benefits: ["Relajación", "Confort digestivo"]
    },
    {
      id: "custom_te_divina_jengibre_lim",
      name: "Té Divina Jengibre & Limón",
      category: "tes",
      price: 549,
      img: "/img/placeholder_te_jengibre.jpg",
      blurb: "Infusión fresca con jengibre y limón.",
      bullets: ["Refrescante", "Confort digestivo"],
      ingredients: ["Jengibre", "Limón", "Mezcla botánica*"],
      benefits: ["Frescura", "Digestión"]
    },
    {
      id: "custom_te_divina_frutos_rojos",
      name: "Té Divina Frutos Rojos",
      category: "tes",
      price: 549,
      img: "/img/placeholder_te_frutosrojos.jpg",
      blurb: "Infusión con notas frutales.",
      bullets: ["Frutal", "Aromático"],
      ingredients: ["Frutos rojos*", "Mezcla botánica*"],
      benefits: ["Hidratación rica", "Agradable sabor"]
    },
    {
      id: "custom_te_divina_matcha",
      name: "Té Divina Matcha",
      category: "tes",
      price: 579,
      img: "/img/placeholder_te_matcha.jpg",
      blurb: "Té verde matcha estilo funcional.",
      bullets: ["Té verde fino", "Energía suave"],
      ingredients: ["Matcha", "Mezcla funcional*"],
      benefits: ["Energía suave", "Antioxidantes"]
    },
    {
      id: "custom_te_divina_moringa",
      name: "Té Divina Moringa",
      category: "tes",
      price: 579,
      img: "/img/placeholder_te_moringa.jpg",
      blurb: "Infusión con hoja de moringa.",
      bullets: ["Botánico versátil", "Sabor herbal"],
      ingredients: ["Moringa", "Mezcla botánica*"],
      benefits: ["Antioxidantes", "Uso diario"]
    },
    {
      id: "custom_te_divina_canela",
      name: "Té Divina Canela & Especias",
      category: "tes",
      price: 549,
      img: "/img/placeholder_te_canela.jpg",
      blurb: "Infusión especiada con canela.",
      bullets: ["Aromático cálido", "Confort"],
      ingredients: ["Canela", "Clavo*", "Jengibre*"],
      benefits: ["Confort digestivo", "Aroma agradable"]
    },

    // CÁPSULAS (8) – además de Atom, Mars, Venus, Sleep N Lose, Ignite
    {
      id: "custom_caps_fit",
      name: "Fit Caps",
      category: "capsulas",
      price: 699,
      img: "/img/placeholder_caps_fit.jpg",
      blurb: "Cápsulas para apoyo de control de medidas dentro de un plan.",
      bullets: ["Mezcla funcional", "Uso diurno"],
      ingredients: ["Extractos botánicos*", "Cafeína natural*"],
      benefits: ["Energía", "Apoyo control de medidas"]
    },
    {
      id: "custom_caps_focus",
      name: "Focus Caps",
      category: "capsulas",
      price: 699,
      img: "/img/placeholder_caps_focus.jpg",
      blurb: "Apoyo a concentración y enfoque.",
      bullets: ["Día productivo", "Estudio/trabajo"],
      ingredients: ["L-teanina*", "Cafeína natural*", "Ginseng*"],
      benefits: ["Enfoque", "Alerta suave"]
    },
    {
      id: "custom_caps_immuno",
      name: "Immuno Caps",
      category: "capsulas",
      price: 699,
      img: "/img/placeholder_caps_immuno.jpg",
      blurb: "Mezcla funcional de apoyo general.",
      bullets: ["Uso cotidiano", "Épocas de cambio"],
      ingredients: ["Vitamina C*", "Zinc*", "Reishi*"],
      benefits: ["Apoyo general", "Antioxidantes"]
    },
    {
      id: "custom_caps_omega3",
      name: "Omega 3 Divina",
      category: "capsulas",
      price: 649,
      img: "/img/placeholder_caps_omega3.jpg",
      blurb: "Ácidos grasos esenciales.",
      bullets: ["EPA/DHA*", "Uso cotidiano"],
      ingredients: ["Aceite de pescado*", "Vitamina E*"],
      benefits: ["Bienestar general", "Soporte cardiovascular*"]
    },
    {
      id: "custom_caps_vitd3",
      name: "Vitamina D3",
      category: "capsulas",
      price: 549,
      img: "/img/placeholder_caps_d3.jpg",
      blurb: "Suplemento de vitamina D3.",
      bullets: ["Uso diario", "Coadyuvante nutricional"],
      ingredients: ["Colecalciferol (Vitamina D3)"],
      benefits: ["Apoyo general", "Coadyuvante nutricional"]
    },
    {
      id: "custom_caps_cal_mag",
      name: "Calcio + Magnesio",
      category: "capsulas",
      price: 579,
      img: "/img/placeholder_caps_calmag.jpg",
      blurb: "Fórmula de minerales clave.",
      bullets: ["Uso cotidiano", "Coadyuvante nutricional"],
      ingredients: ["Calcio", "Magnesio", "Vitamina D*"],
      benefits: ["Soporte estructural*", "Complemento diario"]
    },
    {
      id: "custom_caps_probiotico",
      name: "Probiótico Divina",
      category: "capsulas",
      price: 599,
      img: "/img/placeholder_caps_probiotico.jpg",
      blurb: "Fórmula con probióticos.",
      bullets: ["Equilibrio intestinal*", "Uso diario"],
      ingredients: ["Lactobacillus*", "Bifidobacterium*", "Prebióticos*"],
      benefits: ["Bienestar digestivo", "Equilibrio"]
    },
    {
      id: "custom_caps_beauty",
      name: "Beauty Caps (piel/cabello)",
      category: "capsulas",
      price: 649,
      img: "/img/placeholder_caps_beauty.jpg",
      blurb: "Suplemento para belleza desde adentro.",
      bullets: ["Colágeno* + biotina*", "Uso diario"],
      ingredients: ["Colágeno*", "Biotina*", "Vitamina C*"],
      benefits: ["Soporte piel/cabello*", "Antioxidantes"]
    },

    // EXTRACTOS (5) – además de Chaga, Lion's Mane, Cordy
    {
      id: "custom_extracto_reishi",
      name: "Extracto Reishi",
      category: "extractos",
      price: 799,
      img: "/img/placeholder_extracto_reishi.jpg",
      blurb: "Extracto concentrado de Reishi.",
      bullets: ["Hongo funcional", "Uso cotidiano"],
      ingredients: ["Reishi (Ganoderma lucidum)"],
      benefits: ["Apoyo general", "Tradición botánica"]
    },
    {
      id: "custom_extracto_shiitake",
      name: "Extracto Shiitake",
      category: "extractos",
      price: 799,
      img: "/img/placeholder_extracto_shiitake.jpg",
      blurb: "Extracto de Lentinula edodes.",
      bullets: ["Hongo culinario/funcional", "Antioxidantes"],
      ingredients: ["Shiitake (Lentinula edodes)"],
      benefits: ["Bienestar general", "Antioxidantes"]
    },
    {
      id: "custom_extracto_maitake",
      name: "Extracto Maitake",
      category: "extractos",
      price: 799,
      img: "/img/placeholder_extracto_maitake.jpg",
      blurb: "Extracto de Grifola frondosa.",
      bullets: ["Hongo funcional", "Uso tradicional"],
      ingredients: ["Maitake (Grifola frondosa)"],
      benefits: ["Apoyo general", "Tradición oriental"]
    },
    {
      id: "custom_extracto_mix_hongos",
      name: "Extracto Mix de Hongos",
      category: "extractos",
      price: 829,
      img: "/img/placeholder_extracto_mix.jpg",
      blurb: "Mezcla de varios hongos funcionales.",
      bullets: ["Stack funcional", "Versatilidad"],
      ingredients: ["Reishi*","Chaga*","Cordyceps*","Lion's Mane*"],
      benefits: ["Amplio espectro","Antioxidantes"]
    },
    {
      id: "custom_extracto_propolis",
      name: "Extracto Própolis",
      category: "extractos",
      price: 749,
      img: "/img/placeholder_extracto_propolis.jpg",
      blurb: "Extracto de própolis (abejas).",
      bullets: ["Tradición apícola","Uso estacional"],
      ingredients: ["Própolis"],
      benefits: ["Apoyo general","Confort estacional*"]
    },

    // BATIDOS (3)
    {
      id: "custom_batido_vainilla",
      name: "Batido Vainilla",
      category: "batidos",
      price: 799,
      img: "/img/placeholder_batido_vainilla.jpg",
      blurb: "Batido sabor vainilla para complementar tu plan.",
      bullets: ["Fácil de preparar", "Sustituto ocasional*"],
      ingredients: ["Base proteica*", "Vainilla*", "Vitaminas/minerales*"],
      benefits: ["Saciedad*","Practicidad"]
    },
    {
      id: "custom_batido_chocolate",
      name: "Batido Chocolate",
      category: "batidos",
      price: 799,
      img: "/img/placeholder_batido_chocolate.jpg",
      blurb: "Batido sabor chocolate.",
      bullets: ["Cremoso","Sabor intenso"],
      ingredients: ["Base proteica*", "Cacao*", "Vitaminas/minerales*"],
      benefits: ["Saciedad*","Sabor intenso"]
    },
    {
      id: "custom_batido_fresa",
      name: "Batido Fresa",
      category: "batidos",
      price: 799,
      img: "/img/placeholder_batido_fresa.jpg",
      blurb: "Batido sabor fresa.",
      bullets: ["Fresco","Práctico"],
      ingredients: ["Base proteica*", "Fresa*", "Vitaminas/minerales*"],
      benefits: ["Saciedad*","Frescura"]
    },

    // CEREAL (1)
    {
      id: "custom_cereal_divina",
      name: "Cereal Divina",
      category: "cereal",
      price: 399,
      img: "/img/placeholder_cereal.jpg",
      blurb: "Cereal funcional para el desayuno.",
      bullets: ["Fácil y rico","Uso diario"],
      ingredients: ["Granos integrales*", "Semillas*", "Endulzante*"],
      benefits: ["Energía matutina","Practicidad"]
    },

    // ACEITES (2)
    {
      id: "custom_aceite_cbd",
      name: "Aceite Premium",
      category: "aceites",
      price: 899,
      img: "/img/placeholder_aceite.jpg",
      blurb: "Aceite botánico en gotero.",
      bullets: ["Goterito preciso","Uso sublingual"],
      ingredients: ["Aceite portador","Extracto botánico*"],
      benefits: ["Versatilidad","Uso puntual"]
    },
    {
      id: "custom_aceite_rico_omegas",
      name: "Aceite Rico en Omegas",
      category: "aceites",
      price: 749,
      img: "/img/placeholder_aceite_omegas.jpg",
      blurb: "Fuente de omegas en aceite.",
      bullets: ["Uso culinario ligero*","Aporte esencial"],
      ingredients: ["Aceite vegetal rico en omegas*"],
      benefits: ["Aporte de omegas*","Uso diario"]
    },

    // OTROS (2)
    {
      id: "custom_otro_cafe_descafe",
      name: "Café Descafeinado",
      category: "otros",
      price: 499,
      img: "/img/placeholder_descafe.jpg",
      blurb: "Opción sin cafeína.",
      bullets: ["Arábica descafeinado","Sabor suave"],
      ingredients: ["Café arábica descafeinado"],
      benefits: ["Sin cafeína","Sabor café"]
    },
    {
      id: "custom_otro_kit_inicial",
      name: "Kit Inicial",
      category: "otros",
      price: 1599,
      img: "/img/placeholder_kit.jpg",
      blurb: "Kit de inicio con selección de productos.",
      bullets: ["Variedad en un paquete","Ideal para comenzar"],
      ingredients: ["Selección de productos (variable)"],
      benefits: ["Ahorro","Variedad"]
    }
  ];

  // Une base + plantillas (total 46)
  const ALL = [...BASE, ...FILLERS];
  return ALL.slice(0, 46);
}

