/**
 * SABORES
 * ---------------------------------------------------------------
 * Listado tomado de las historias oficiales "Nuestros Sabores".
 * - Para sumar un sabor: agregalo al array de su categoría.
 * - Para ocultarlo temporalmente: `available: false`.
 * - `photo`: foto de la bocha que se muestra (ver src/lib/flavor-photos.ts).
 *   Son imágenes ILUSTRATIVAS por tipo de sabor. Cuando haya fotos reales de
 *   El Rey, agregalas a `src/assets/flavors` y registralas en flavor-photos.ts.
 *   Si un sabor queda sin foto (`photo: null`), se muestra un diseño tipográfico.
 * - `color`: tono de respaldo para el diseño tipográfico.
 */

import type { PhotoKey } from "@/lib/flavor-photos";

export type CategoryId = "cremas" | "chocolates" | "dulce-de-leche" | "al-agua";

export interface Flavor {
  id: string;
  name: string;
  category: CategoryId;
  color: string;
  photo: PhotoKey | null;
  available?: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
}

export const CATEGORIES: Category[] = [
  { id: "cremas", name: "Cremas", short: "Cremas" },
  { id: "chocolates", name: "Chocolates", short: "Chocolates" },
  { id: "dulce-de-leche", name: "Dulce de leche", short: "Dulce de leche" },
  { id: "al-agua", name: "Al agua", short: "Al agua" },
];

const f = (name: string, category: CategoryId, color: string, photo: PhotoKey | null): Flavor => ({
  id: slug(name),
  name,
  category,
  color,
  photo,
});

export function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const FLAVORS: Flavor[] = [
  // CREMAS
  f("Chocotorta", "cremas", "#7a4a2e", "chocotorta"),
  f("Baileys", "cremas", "#c9a27a", "tiramisu"),
  f("Tiramisú", "cremas", "#b8875c", "tiramisu"),
  f("Lemon Pie", "cremas", "#efe09a", "limon-crema"),
  f("Mousse Limón", "cremas", "#f3ecbf", "limon-crema"),
  f("Yatay", "cremas", "#e9a94a", "sambayon"),
  f("Kinder", "cremas", "#efdcb8", "avellanas"),
  f("Buono", "cremas", "#c99a6a", "avellanas"),
  f("Marroc", "cremas", "#8f5c3c", "chocolate-almendras"),
  f("Frutilla a la crema", "cremas", "#f2a4ae", "frutilla-crema"),
  f("Vainilla", "cremas", "#f6e8c6", "vainilla"),
  f("Banana Split", "cremas", "#f1df9e", "vainilla"),
  f("Menta granizada", "cremas", "#b9dfc3", "menta"),
  f("Cereza", "cremas", "#d9566f", "frutos-rojos"),
  f("Maracuyá", "cremas", "#f0bd45", "limon-crema"),
  f("Crema del cielo", "cremas", "#b9d6ec", "crema-cielo"),
  f("Pistaccio", "cremas", "#b5c27a", "pistacho"),
  f("Sambayón", "cremas", "#e6bf72", "sambayon"),
  f("Mascarpone con frutos rojos", "cremas", "#c8435c", "frutos-rojos"),
  f("Oreo", "cremas", "#4a4040", "oreo"),
  f("Frutos del bosque", "cremas", "#9c2c4f", "frutos-rojos"),
  f("Bombón Rocher", "cremas", "#9a6a43", "avellanas"),
  f("Coco con dulce de leche", "cremas", "#efe3cf", "crema-ddl"),
  f("Americana", "cremas", "#f7ecd2", "vainilla"),
  f("Tramontana", "cremas", "#c79a6a", "chocotorta"),
  f("Granizado", "cremas", "#e9dcc4", "granizado"),
  f("Higos a la crema", "cremas", "#a8707a", "frutos-rojos"),
  f("Crema con frutilla", "cremas", "#f0b2b8", "frutilla-crema"),
  f("Flan con dulce de leche", "cremas", "#e3b35c", "crema-ddl"),
  // CHOCOLATES
  f("Chocolate", "chocolates", "#6b3a24", "chocolate"),
  f("Chocolate con almendras", "chocolates", "#7c4a2f", "chocolate-almendras"),
  f("Chocolate Bombón", "chocolates", "#5d321f", "chocolate"),
  f("Chocolate amargo", "chocolates", "#3b1f14", "amargo"),
  // DULCE DE LECHE
  f("Dulce de leche", "dulce-de-leche", "#c48a4f", "dulce"),
  f("Dulce granizado", "dulce-de-leche", "#b77f48", "dulce-granizado"),
  f("Dulce con nuez", "dulce-de-leche", "#a9743f", "dulce-nuez"),
  f("Súper dulce de leche", "dulce-de-leche", "#9c5f2b", "dulce"),
  // AL AGUA
  f("Limón", "al-agua", "#ece27a", "sorbete-limon"),
  f("Ananá", "al-agua", "#f2d35b", "sorbete-limon"),
  f("Durazno", "al-agua", "#f5a964", "sorbete-naranja"),
  f("Frutilla al agua", "al-agua", "#d63a55", "sorbete-frutilla"),
  f("Mandarina", "al-agua", "#f39a3a", "sorbete-naranja"),
];

const BY_ID = new Map(FLAVORS.map((x) => [x.id, x]));

export function getFlavor(id: string): Flavor | undefined {
  return BY_ID.get(id);
}

export function availableFlavors() {
  return FLAVORS.filter((x) => x.available !== false);
}
