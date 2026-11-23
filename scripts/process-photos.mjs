// Procesa las fotografías originales generadas para el sitio (design/ai):
// - Bochas: RECORTE CON TRANSPARENCIA REAL. Se elimina el fondo claro y la sombra
//   de contacto se conserva como sombra semitransparente (no como gris opaco).
//   Salida: WebP con canal alfa, 640×640.
// - Cono del hero: recorte vertical y WebP. Su fondo es #F1CFA8 (color del hero).
import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";

const SRC = "design/ai/bochas";
const OUT = "src/assets/flavors";
await mkdir(OUT, { recursive: true });
await mkdir("src/assets/hero", { recursive: true });

// Color de la sombra (marrón muy oscuro, cálido): se reconstruye su opacidad
// asumiendo que en la foto original estaba compuesta sobre el fondo claro.
const SHADOW = [58, 40, 30];
// Dirección de color de la sombra cálida medida en las fotos (déficit relativo R:G:B ≈ 0,67:0,84:1)
const SHADOW_HUE = [105, 67, 31];
const T_ROUGH = Number(process.env.T_ROUGH ?? 0.75);

function boxMean(arr, w, h, r) {
  const S = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += arr[y * w + x];
      S[(y + 1) * (w + 1) + x + 1] = S[y * (w + 1) + x + 1] + row;
    }
  }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
      const sum = S[y1 * (w + 1) + x1] - S[y0 * (w + 1) + x1] - S[y1 * (w + 1) + x0] + S[y0 * (w + 1) + x0];
      out[y * w + x] = sum / ((y1 - y0) * (x1 - x0));
    }
  }
  return out;
}

function borderColor(buf, w, h) {
  const vals = [[], [], []];
  const push = (x, y) => {
    const i = (y * w + x) * 3;
    for (let k = 0; k < 3; k++) vals[k].push(buf[i + k]);
  };
  for (let x = 0; x < w; x += 4) {
    push(x, 2);
    push(x, h - 3);
  }
  for (let y = 0; y < h; y += 4) {
    push(2, y);
    push(w - 3, y);
  }
  return vals.map((v) => v.sort((a, b) => a - b)[Math.floor(v.length / 2)]);
}

/** Desvío estándar local de la luminancia (ventana (2r+1)²) con imágenes integrales. */
function localStd(L, w, h, r) {
  const S = new Float64Array((w + 1) * (h + 1));
  const S2 = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    let row2 = 0;
    for (let x = 0; x < w; x++) {
      const v = L[y * w + x];
      row += v;
      row2 += v * v;
      S[(y + 1) * (w + 1) + x + 1] = S[y * (w + 1) + x + 1] + row;
      S2[(y + 1) * (w + 1) + x + 1] = S2[y * (w + 1) + x + 1] + row2;
    }
  }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(w, x + r + 1);
      const n = (y1 - y0) * (x1 - x0);
      const a = y1 * (w + 1) + x1, b = y0 * (w + 1) + x1, c = y1 * (w + 1) + x0, d = y0 * (w + 1) + x0;
      const sum = S[a] - S[b] - S[c] + S[d];
      const sum2 = S2[a] - S2[b] - S2[c] + S2[d];
      const mean = sum / n;
      out[y * w + x] = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
    }
  }
  return out;
}

async function cutout(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const N = w * h;
  const bg = borderColor(data, w, h);

  // 1) normalizar el fondo a blanco
  const px = new Uint8Array(N * 3);
  for (let i = 0; i < N * 3; i += 3) {
    for (let k = 0; k < 3; k++) px[i + k] = Math.min(255, Math.round((data[i + k] * 255) / bg[k]));
  }

  // 2) métricas por píxel
  const L = new Float32Array(N);
  const dist = new Uint8Array(N);
  const chroma = new Uint8Array(N);
  for (let p = 0; p < N; p++) {
    const r = px[p * 3], g = px[p * 3 + 1], b = px[p * 3 + 2];
    L[p] = 0.299 * r + 0.587 * g + 0.114 * b;
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    dist[p] = 255 - mn;
    chroma[p] = mx - mn;
  }
  // suaviza el grano fino de la foto antes de medir textura
  const Lb = new Float32Array(N);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          s += L[yy * w + xx];
          n++;
        }
      }
      Lb[y * w + x] = s / n;
    }
  }
  // rugosidad = curvatura local promedio (una rampa de sombra lisa da ~0; la textura del helado, mucho más)
  const lap = new Float32Array(N);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      lap[p] = Math.abs(4 * Lb[p] - Lb[p - 1] - Lb[p + 1] - Lb[p - w] - Lb[p + w]);
    }
  }
  const rough = boxMean(lap, w, h, 3);

  // ¿el color sigue la "línea de sombra" del fondo? (misma proporción de oscurecimiento por canal)
  const spread = (p) => {
    let mn = Infinity, mx = -Infinity;
    for (let k = 0; k < 3; k++) {
      const a = (255 - px[p * 3 + k]) / (255 - SHADOW_HUE[k]);
      if (a < mn) mn = a;
      if (a > mx) mx = a;
    }
    return mx - mn;
  };

  // 3) el fondo y la sombra (lisos y con tono de sombra) se inundan desde los bordes;
  //    la textura del helado los frena.
  const isBg = (p) => (dist[p] < 12 && rough[p] < 0.4) || (rough[p] < T_ROUGH && spread(p) < 0.1);
  const reached = new Uint8Array(N);
  const queue = new Int32Array(N);
  let qh = 0, qt = 0;
  const seed = (p) => {
    if (!reached[p] && isBg(p)) {
      reached[p] = 1;
      queue[qt++] = p;
    }
  };
  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    seed(y * w);
    seed(y * w + w - 1);
  }
  while (qh < qt) {
    const p = queue[qh++];
    const x = p % w, y = (p - x) / w;
    if (x > 0) seed(p - 1);
    if (x < w - 1) seed(p + 1);
    if (y > 0) seed(p - w);
    if (y < h - 1) seed(p + w);
  }

  // 4) objeto = mayor región no alcanzada (descarta motas sueltas)
  const label = new Int32Array(N).fill(-1);
  let best = -1, bestSize = 0, cur = 0;
  for (let s = 0; s < N; s++) {
    if (reached[s] || label[s] !== -1) continue;
    let size = 0;
    qh = qt = 0;
    queue[qt++] = s;
    label[s] = cur;
    while (qh < qt) {
      const p = queue[qh++];
      size++;
      const x = p % w, y = (p - x) / w;
      const nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1];
      for (const q of nb) {
        if (q >= 0 && !reached[q] && label[q] === -1) {
          label[q] = cur;
          queue[qt++] = q;
        }
      }
    }
    if (size > bestSize) {
      bestSize = size;
      best = cur;
    }
    cur++;
  }
  const mask = Buffer.alloc(N);
  for (let p = 0; p < N; p++) mask[p] = label[p] === best ? 255 : 0;

  // 5) borde suave y apenas contraído (evita halo claro)
  const soft = await sharp(mask, { raw: { width: w, height: h, channels: 1 } }).blur(1.3).extractChannel(0).raw().toBuffer();
  // franja de ~4 px junto al borde, donde puede quedar el halo claro del fondo original
  const band = await sharp(mask, { raw: { width: w, height: h, channels: 1 } }).blur(2.6).extractChannel(0).raw().toBuffer();

  // 6) componer: helado opaco + sombra semitransparente reconstruida
  const out = Buffer.alloc(N * 4);
  for (let p = 0; p < N; p++) {
    let objA = Math.min(1, Math.max(0, (soft[p] - 70) / 185));
    if (objA > 0 && band[p] < 240) {
      // en el borde, los píxeles casi blancos son restos del fondo: se desvanecen
      objA *= Math.min(1, Math.max(0, (dist[p] - 10) / 22));
    }
    let shA = 0;
    if (objA < 1) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += (255 - px[p * 3 + k]) / (255 - SHADOW[k]);
      shA = Math.min(0.9, Math.max(0, s / 3 - 0.012));
    }
    const a = objA + (1 - objA) * shA;
    for (let k = 0; k < 3; k++) {
      const c = a > 0 ? (objA * px[p * 3 + k] + (1 - objA) * shA * SHADOW[k]) / a : 0;
      out[p * 4 + k] = Math.round(c);
    }
    out[p * 4 + 3] = Math.round(a * 255);
  }
  return { out, w, h };
}

for (const file of (await readdir(SRC)).filter((f) => f.endsWith(".png"))) {
  const name = file.replace(/\.png$/, "");
  const { out, w, h } = await cutout(`${SRC}/${file}`);
  const crop = Math.round(w * 0.9);
  const off = Math.round((w - crop) / 2);
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: off, top: off, width: crop, height: Math.min(crop, h - off) })
    .resize(640, 640)
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(`${OUT}/${name}.webp`);
  console.log("bocha", name);
}

// Cono del hero
await sharp("design/ai/hero-cono.png")
  .extract({ left: 152, top: 96, width: 720, height: 1400 })
  .webp({ quality: 84, effort: 6 })
  .toFile("src/assets/hero/cono.webp");
console.log("hero ok");

