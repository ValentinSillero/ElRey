// Prepara las tres fotos de potes (1/4, 1/2 y 1 kg) para la sección "Armá tu pedido":
// 1) normaliza el fondo de cada foto al MISMO color exacto (#E6D4BA) para que el
//    fundido entre composiciones no muestre bordes;
// 2) recorta cada pote con el mismo margen relativo y la base a la misma altura,
//    así los tres comparten "la mesa" al animar el cambio de tamaño;
// 3) exporta WebP optimizado.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const BG = [230, 212, 186];
const SIZES = ["cuarto", "medio", "kilo"];
await mkdir("src/assets/potes", { recursive: true });

for (const name of SIZES) {
  const { data, info } = await sharp(`design/ai/pote-${name}.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // fondo medido en los bordes (mediana)
  const samples = [[], [], []];
  for (let x = 0; x < w; x += 8) for (const y of [3, h - 4]) for (let k = 0; k < 3; k++) samples[k].push(data[(y * w + x) * 3 + k]);
  for (let y = 0; y < h; y += 8) for (const x of [3, w - 4]) for (let k = 0; k < 3; k++) samples[k].push(data[(y * w + x) * 3 + k]);
  const bg = samples.map((s) => s.sort((a, b) => a - b)[s.length >> 1]);

  const px = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 3) for (let k = 0; k < 3; k++) px[i + k] = Math.min(255, Math.round((data[i + k] * BG[k]) / bg[k]));

  // caja del objeto (diferencia clara contra el fondo; ignora la sombra suave)
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      const d = Math.max(Math.abs(px[i] - BG[0]), Math.abs(px[i + 1] - BG[1]), Math.abs(px[i + 2] - BG[2]));
      if (d > 26) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const objH = y1 - y0;
  const padX = Math.round(objH * 0.12);
  const padTop = Math.round(objH * 0.06);
  const padBottom = Math.round(objH * 0.08); // deja aire para la sombra de apoyo
  const left = Math.max(0, x0 - padX);
  const top = Math.max(0, y0 - padTop);
  const right = Math.min(w, x1 + padX);
  const bottom = Math.min(h, y1 + padBottom);

  const out = await sharp(px, { raw: { width: w, height: h, channels: 3 } })
    .extract({ left, top, width: right - left, height: bottom - top })
    .resize({ height: 900, withoutEnlargement: true })
    .webp({ quality: 84, effort: 6 })
    .toFile(`src/assets/potes/pote-${name}.webp`);
  console.log(name, "fondo", bg.join(","), "objeto", x1 - x0, "x", objH, "->", out.width, "x", out.height, Math.round(out.size / 1024) + "KB");
}
