# Helados El Rey — sitio de pedidos

Sitio web de pedidos para Helados El Rey (Colón, San José y Villa Elisa, Entre Ríos).
El cliente elige localidad, tamaño y sabores, arma el carrito y envía el pedido al WhatsApp de su localidad.
No tiene pagos online, cuentas de usuario ni base de datos.

**Tecnologías:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Lucide.

## Cómo correrlo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (sitio estático)
npm start
```

Para el dominio definitivo, definí `NEXT_PUBLIC_SITE_URL` (ej. `https://heladoselrey.com.ar`) para que los metadatos y la imagen para compartir usen la URL correcta.

## Qué editar (todo está centralizado en `src/config`)

| Qué | Archivo |
|---|---|
| Precios, tamaños y **máximo de sabores por tamaño** | `src/config/products.ts` |
| Sabores y categorías (agregar, quitar, ocultar con `available: false`) | `src/config/flavors.ts` |
| Localidades, sucursales, direcciones, Google Maps y **WhatsApp** | `src/config/branches.ts` |
| Instagram, textos generales | `src/config/site.ts` |

### WhatsApp por localidad

`whatsappNumber` en `branches.ts`, formato solo dígitos (`549` + característica + número):

| Localidad | Número |
|---|---|
| Colón | +54 9 3447 60-6666 → `5493447606666` |
| San José | +54 9 3447 54-2588 → `5493447542588` |
| Villa Elisa | +54 9 3447 59-2282 → `5493447592282` |

- Con número cargado, el pedido se abre en WhatsApp **con el mensaje ya escrito**.
- `whatsappChatUrl` (enlaces del Linktree) queda como respaldo: si se borra un número, el sitio copia el pedido y abre ese chat para pegarlo.
- Si una localidad no tiene ni número ni enlace, el sitio no deja enviar el pedido (nunca lo manda a otra localidad).

### Sucursales

| Localidad | Sucursal | Dirección |
|---|---|---|
| Colón | Urquiza | Urquiza 302 |
| Colón | 12 de Abril | 12 de Abril 117 |
| San José | San José | 9 de Julio 1633 |
| Villa Elisa | Villa Elisa | Urquiza 1601 |

El botón "Mapa" usa el enlace oficial del Linktree; San José no tiene uno, así que abre una búsqueda de Google Maps con la dirección.

### Sabores por tamaño (confirmado)

`maxFlavors` en `products.ts`: 1/4 kg → 2, 1/2 kg → 3, 1 kg → 4.

## Imágenes

- `src/assets/brand/logo-*.png`: logo oficial, extraído del archivo original sin redibujarlo (solo se quitó el fondo blanco).
- `src/assets/brand/foto-*.webp` y `ig-dulce-tentacion.webp`: recortes de las fotos oficiales de las historias y del perfil de Instagram (zonas sin texto).
- `src/assets/potes/pote-{cuarto,medio,kilo}.webp`: tres composiciones distintas para "Armá tu pedido" (pote chico con 2 bochas, mediano con 3, grande con 4). Comparten cámara, luz y fondo `#E6D4BA` (el mismo de la sección), y se regeneran con `node scripts/potes.mjs` desde `design/ai/pote-*.png`. Las bochas ilustran combinaciones posibles, no equivalen al peso.
- `src/assets/hero/cono.webp`: cono del hero. Su fondo es `#F1CFA8`, el mismo color del fondo del hero, para que se integre sin bordes.
- `src/assets/flavors/*.webp`: 23 fotos de bochas, una por tipo de sabor (640×640, **WebP con transparencia real**: sin fondo y con la sombra de contacto semitransparente). Se apoyan sobre la superficie crema de las tarjetas (`--color-surface` en `globals.css`).

El cono y las bochas son **imágenes fotorrealistas originales generadas con IA** (Figma AI, archivo "Helados El Rey · Imágenes web" en la cuenta de Figma). No son fotos de terceros ni del producto real de El Rey: son **ilustrativas del tipo de sabor**, y el sitio lo aclara debajo de los sabores. Los originales en alta resolución están en `design/ai`.

Qué foto usa cada sabor se define en `src/config/flavors.ts` (campo `photo`). Si un sabor queda sin foto (`photo: null`), se muestra un diseño tipográfico.

### Reemplazar por fotos reales de El Rey

1. Fotografiá cada bocha sobre fondo blanco o muy claro, vista 3/4, luz suave.
2. Copiá el archivo a `design/ai/bochas/<nombre>.png` y corré `node scripts/process-photos.mjs` (quita el fondo, conserva la sombra como transparencia, recorta y exporta a WebP). Revisá el resultado sobre un fondo oscuro para detectar restos del fondo.
3. Si es un sabor nuevo, registralo en `src/lib/flavor-photos.ts` y asignalo en `src/config/flavors.ts`.

### Scripts

```bash
node scripts/brand-assets.mjs    # logo, ícono y recortes de fotos oficiales (design/brand)
node scripts/process-photos.mjs  # bochas y cono (design/ai) → src/assets
node scripts/og-image.mjs        # imagen para compartir en redes
```

## Estructura

```
src/
  app/            layout, página, estilos globales, íconos e imagen Open Graph
  components/     secciones (Hero, Armá tu pedido, Sucursales, Instagram), selector de sabores y carrito
  components/ui/  Sheet (carrito: panel inferior en celular / lateral en escritorio),
                  Dialog (selector de sabores: pantalla completa en celular / modal en escritorio),
                  ConfirmDialog
  config/         datos del negocio
  lib/            carrito, mensaje de WhatsApp, estado del pedido (localStorage), hooks
scripts/          generación de recursos gráficos
design/brand/     materiales oficiales de la marca (fuente de los recursos)
```

El carrito, la localidad y los datos de entrega se guardan en el navegador del cliente (`localStorage`), así el pedido se conserva al recargar.
