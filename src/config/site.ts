export const SITE = {
  name: "Helados El Rey",
  shortName: "El Rey",
  tagline: "Lo bueno se comparte",
  description:
    "Armá tu pedido de Helados El Rey en Colón, San José o Villa Elisa. Elegí tamaño y sabores, y envialo directo por WhatsApp.",
  /** Definí NEXT_PUBLIC_SITE_URL cuando el sitio tenga dominio propio */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  region: "Entre Ríos, Argentina",
  instagram: {
    handle: "heladeriaselrey",
    url: "https://www.instagram.com/heladeriaselrey/",
  },
  linktree: "https://linktr.ee/heladoselrey",
} as const;
