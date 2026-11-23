import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Instagram } from "./icons";
import { SITE } from "@/config/site";
import igPost from "@/assets/brand/ig-dulce-tentacion.webp";
import fotoChocolates from "@/assets/brand/foto-chocolates.webp";
import fotoCremas from "@/assets/brand/foto-cremas.webp";
import fotoAgua from "@/assets/brand/foto-agua.webp";
import logoDark from "@/assets/brand/logo-dark.png";

// Imágenes oficiales de la marca (publicación e historias de @heladeriaselrey).
const TILES = [
  { src: igPost, className: "" },
  { src: fotoChocolates, className: "" },
  { src: fotoCremas, className: "" },
  { src: fotoAgua, className: "" },
];

export function InstagramSection() {
  return (
    <section className="bg-peach/60 py-16 sm:py-24" aria-labelledby="ig-title">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-16 place-items-center rounded-full bg-white p-2.5 shadow-[0_0_0_3px_var(--color-orange)]">
              <Image src={logoDark} alt="" sizes="48px" className="h-auto w-full" />
            </span>
            <div>
              <p className="font-display text-lg font-extrabold tracking-tight">@{SITE.instagram.handle}</p>
              <p className="text-sm text-muted">Heladerías El Rey oficial</p>
            </div>
          </div>
          <h2 id="ig-title" className="section-title mt-7">
            Lo bueno <span className="font-serif font-normal tracking-[-0.02em] italic">se comparte</span>
          </h2>
          <p className="mt-4 max-w-[40ch] text-[16px] leading-relaxed text-ink/75">
            Novedades, sabores y todo lo que pasa en Colón, San José y Villa Elisa. Seguinos para no perderte nada.
          </p>
          <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="btn btn-dark mt-7 h-14 px-6">
            <Instagram className="size-5" aria-hidden /> Seguir en Instagram
            <ArrowUpRight className="size-4 opacity-70" aria-hidden />
          </a>
        </div>

        <a
          href={SITE.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto grid w-full max-w-[520px] grid-cols-2 gap-2.5 sm:gap-3 lg:mr-0"
          aria-label={`Ver el perfil @${SITE.instagram.handle} en Instagram`}
        >
          {TILES.map((t, i) => (
            <span
              key={i}
              className={`relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-vanilla ${t.className} ${i % 2 ? "translate-y-6" : ""}`}
            >
              <Image
                src={t.src}
                alt=""
                fill
                sizes="(min-width:640px) 260px, 46vw"
                className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
              />
            </span>
          ))}
        </a>
      </div>
    </section>
  );
}
