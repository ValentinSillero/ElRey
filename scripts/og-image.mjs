// Imagen para compartir en redes (Open Graph): logo oficial + cono del hero.
import sharp from "sharp";

const W = 1200;
const H = 630;
const BG = { r: 241, g: 207, b: 168 }; // mismo fondo que la foto del cono (#F1CFA8)

const cone = await sharp("src/assets/hero/cono.webp").resize({ height: 600 }).png().toBuffer();
const coneMeta = await sharp(cone).metadata();
const logo = await sharp("src/assets/brand/logo-dark.png").resize({ width: 440 }).png().toBuffer();
const logoMeta = await sharp(logo).metadata();

await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
  .composite([
    { input: cone, left: 780 - Math.round(coneMeta.width / 2) + 80, top: H - coneMeta.height },
    { input: logo, left: 90, top: Math.round((H - logoMeta.height) / 2) },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile("src/app/opengraph-image.jpg");

await sharp("src/app/opengraph-image.jpg").toFile("src/app/twitter-image.jpg");
console.log("og ok");
