
# Vista previa del Catálogo Vida Divina (sin errores)

## Requisitos
- Node.js 18 o 20 (recomendado LTS).
- NPM 9+ o PNPM 8+.

Comprueba tu versión:
```
node -v
npm -v
```

## Pasos (rápidos)
1. Instala dependencias:
```
npm ci
```
2. Inicia modo desarrollo:
```
npm run dev
```
3. Abre el enlace que imprime Vite (ej. http://localhost:5173).

> **Nota:** Si ya tenías `node_modules/`, elimina la carpeta y ejecuta `npm ci` para una instalación limpia y evitar conflictos.

## Scripts útiles
- `npm run build` compila a producción en `dist/`.
- `npm run preview` sirve el build para ver la app final.

## Dónde ver lo nuevo
- En la cabecera (Header), verás el botón **💳 Formas de pago**.
- Scrollea o presiona ese botón para llegar a la sección **Formas de pago**, justo antes del footer.

## Datos de pago
- Se guardan en `localStorage` bajo la clave `vd_payment_methods`.
- Puedes **Exportar (JSON)** y **Restablecer** desde la sección.

## Problemas comunes y soluciones
- **Pantalla en blanco o error de sintaxis:** borra `node_modules/` y `package-lock.json`, ejecuta `npm ci` y vuelve a correr `npm run dev`.
- **Puerto ocupado (5173):** Vite elegirá otro puerto automáticamente; revisa la URL en consola.
- **Tailwind no aplica estilos:** asegura que `index.css` esté importado en `main.jsx` (ya lo está), y que no se editen rutas de `tailwind.config.js`.
