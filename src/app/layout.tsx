import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, Instrument_Serif } from "next/font/google";
import { SITE } from "@/config/site";
import { LOCALITIES } from "@/config/branches";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Helados El Rey · Pedí tu helado en Colón, San José y Villa Elisa",
    template: "%s · Helados El Rey",
  },
  description: SITE.description,
  keywords: ["helados", "heladería", "Colón", "San José", "Villa Elisa", "Entre Ríos", "helado a domicilio", "El Rey"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE.name,
    title: "Helados El Rey · El rey del helado",
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f1cfa8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // en Android el teclado achica el área visible: la barra inferior del selector queda visible
  interactiveWidget: "resizes-content",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "IceCreamShop",
  name: SITE.name,
  slogan: SITE.tagline,
  url: SITE.url,
  sameAs: [SITE.instagram.url],
  areaServed: LOCALITIES.map((l) => ({ "@type": "City", name: `${l.name}, Entre Ríos` })),
  priceRange: "$$",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${bricolage.variable} ${figtree.variable} ${instrument.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
