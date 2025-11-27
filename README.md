
# Vida Divina — Catálogo Interactivo (Modular)

Proyecto listo para editar con **IA** y con tu editor (VS Code). Incluye:
- App modular (componentes separados)
- Tailwind (estilos de las clases utilitarias)
- Tests con Vitest (mínimos)

## Cómo usar
1. Descomprime el ZIP.
2. Abre la carpeta en VS Code.
3. Instala dependencias:
   ```
   npm install
   ```
4. Ejecuta:
   ```
   npm run dev
   ```
5. Abre el navegador en la URL que te indique (por defecto: http://localhost:5173).

## Editar con IA
- Puedes arrastrar cualquiera de los archivos `.jsx` aquí a ChatGPT (canvas) para editarlos.
- O pega el contenido de un archivo y dime qué cambios hacer.
- También puedes volver a subir el ZIP; yo puedo devolver una versión nueva.

## Estructura
- `src/App.jsx` — App principal
- `src/components/HeaderBar.jsx`
- `src/components/ProductGallery.jsx`
- `src/components/SmartAssessor.jsx`
- `src/components/TestimonialsManager.jsx`
- `src/components-ui/Carousel.jsx`
- `src/components-ui/SocialButtons.jsx`
- `src/lib/storage.js` (helpers y storage)
- `src/lib/recommender.js` (IMC y recomendaciones)
- `src/data/catalog.js` (datos, CSV y builder)

> Nota: si no quieres Tailwind, puedes eliminar `postcss.config.js`, `tailwind.config.js` y las clases seguirán compilando, solo que sin estilos utilitarios.
