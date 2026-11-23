// Genera los recursos de marca a partir de los materiales oficiales en design/brand.
// - Logo: se extrae el dibujo original (sin redibujarlo) a PNG transparente,
//   en versión oscura y clara. Solo se convierte el fondo blanco en transparencia.
// - Fotos: recortes de las fotografías oficiales de las historias de sabores,
//   tomando únicamente zonas sin texto superpuesto.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = "src/assets/brand";
await mkdir(OUT, { recursive: true });

// ---------- LOGO ----------
async function buildLogo() {
  const { data, info } = await sharp("design/brand/logo-original.jpg")
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // Bounding box del trazo
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[y * w + x] < 170) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 6;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;

  // Alfa = cuánto se aleja el píxel del blanco (antialias suave conservado)
  const make = (rgb) => {
    const out = Buffer.alloc(cw * ch * 4);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const v = data[(y + minY) * w + (x + minX)];
        const a = Math.max(0, Math.min(255, Math.round(((242 - v) / (242 - 58)) * 255)));
        const i = (y * cw + x) * 4;
        out[i] = rgb[0];
        out[i + 1] = rgb[1];
        out[i + 2] = rgb[2];
        out[i + 3] = a;
      }
    }
    return sharp(out, { raw: { width: cw, height: ch, channels: 4 } });
  };

  await make([33, 30, 29]).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-dark.png`);
  await make([255, 250, 242]).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-light.png`);
  console.log("logo", cw, ch);

  // Ícono cuadrado (favicon / apple-touch) con el logo completo sobre blanco
  const size = 512;
  const logoW = Math.round(size * 0.82);
  const logo = await make([33, 30, 29]).resize({ width: logoW }).png().toBuffer();
  const meta = await sharp(logo).metadata();
  await sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
    .composite([{ input: logo, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) }])
    .png()
    .toFile("src/app/icon.png");
  await sharp("src/app/icon.png").resize(180).png().toFile("src/app/apple-icon.png");
}

// ---------- FOTOS OFICIALES (zonas sin texto) ----------
async function crop(file, region, name, width = 600) {
  await sharp(`design/brand/${file}`)
    .extract(region)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${name}.webp`);
}

async function buildPhotos() {
  // La franja de foto de cada historia ocupa x≈0..335. El texto vertical está en el centro.
  await crop("sabores-chocolates.jpg", { left: 0, top: 0, width: 330, height: 360 }, "foto-chocolates");
  await crop("sabores-dulce.jpg", { left: 0, top: 0, width: 325, height: 300 }, "foto-dulce");
  await crop("sabores-agua.jpg", { left: 0, top: 1110, width: 330, height: 490 }, "foto-agua");
  await crop("sabores-cremas.jpg", { left: 0, top: 0, width: 330, height: 500 }, "foto-cremas");
  // Publicación oficial "Dulce tentación" del perfil de Instagram
  await crop("instagram-perfil.jpg", { left: 494, top: 1152, width: 244, height: 326 }, "ig-dulce-tentacion", 488);
  // Foto superior de la pieza oficial de precios (sin el título)
  await crop("precios.jpg", { left: 0, top: 0, width: 1179, height: 300 }, "foto-precios", 1179);
}

await buildLogo();
await buildPhotos();
console.log("ok");
