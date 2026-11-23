"use client";

import Image from "next/image";
import { m, useScroll, useTransform } from "motion/react";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { useRef } from "react";
import { LOCALITIES } from "@/config/branches";
import { availableFlavors } from "@/config/flavors";
import { scrollToId } from "@/lib/hooks";
import cono from "@/assets/hero/cono.webp";

/**
 * El fondo del hero usa exactamente el color de fondo de la foto del cono (#F1CFA8),
 * así la fotografía se integra sin bordes visibles.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const coneY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const total = availableFlavors().length;

  const start = () => scrollToId("pedido");

  return (
    <section
      ref={ref}
      id="inicio"
      className="relative isolate overflow-hidden bg-[#F1CFA8] pt-16 md:pt-[72px]"
      aria-labelledby="hero-title"
    >
      <div className="container-x grid items-center lg:min-h-[min(880px,calc(100svh-72px))] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* texto */}
        <div className="relative z-10 pt-7 sm:pt-10 lg:max-w-[580px] lg:pt-0 lg:pb-10">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/45 px-3 py-1.5 text-[13px] font-semibold text-ink/80 ring-1 ring-white/50">
            <MapPin className="size-3.5 text-orange" aria-hidden />
            {LOCALITIES.map((l) => l.name).join(" · ")}
          </p>

          <h1 id="hero-title" className="mt-4 text-carbon sm:mt-5">
            <span className="block font-display text-[clamp(3.3rem,18vw,5.6rem)] leading-[0.86] font-extrabold tracking-[-0.045em] uppercase sm:text-[clamp(5rem,13vw,7.25rem)] lg:text-[clamp(6rem,8.4vw,8.6rem)]">
              El Rey
            </span>
            <span className="block font-serif text-[clamp(2.85rem,15.5vw,4.8rem)] leading-[0.95] tracking-[-0.02em] text-choco italic sm:text-[clamp(4.3rem,11vw,6.2rem)] lg:text-[clamp(5.1rem,7.2vw,7.4rem)]">
              del helado.
            </span>
          </h1>

          <p className="mt-4 max-w-[30ch] text-[17px] leading-relaxed text-ink/80 sm:mt-6 sm:text-lg">
            Elegí tus sabores favoritos y disfrutalos donde quieras.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
            <button type="button" onClick={start} className="btn btn-dark group h-14 w-full justify-between pr-2 pl-6 text-[17px] sm:w-auto">
              Armar mi pedido
              <span className="grid size-10 place-items-center rounded-full bg-orange text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="size-5" aria-hidden />
              </span>
            </button>
            <a href="#sucursales" className="btn hidden h-14 bg-white/50 text-[16px] text-ink ring-1 ring-white/60 hover:bg-white sm:inline-flex">
              Sucursales
            </a>
          </div>

          <p className="mt-4 flex items-center gap-2 text-[13px] text-ink/70 sm:mt-6 sm:text-sm">
            <MessageCircle className="size-4 text-choco" aria-hidden />
            Armás tu pedido acá y lo confirmás por WhatsApp.
          </p>
        </div>

        {/* cono protagonista */}
        <div className="relative mx-auto mt-4 w-[min(64%,300px)] sm:w-[min(46%,340px)] lg:mt-0 lg:w-auto lg:justify-self-center">
          <m.div style={{ y: coneY }} className="relative">
            <div className="relative aspect-[720/1400] animate-[cone-in_1s_var(--ease-out-soft)_both] lg:h-[min(78svh,740px)]">
              <div className="h-full w-full animate-[cone-float_7s_ease-in-out_infinite]">
                <Image
                  src={cono}
                  alt="Cono de helado con una bocha de dulce de leche y otra de chocolate"
                  fill
                  preload
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width:1024px) 400px, (min-width:640px) 340px, 64vw"
                  className="object-contain select-none"
                  draggable={false}
                />
              </div>
            </div>

            {/* detalles editoriales */}
            <div className="absolute top-[20%] -left-[48%] hidden animate-[badge-in_0.8s_0.5s_var(--ease-spring)_both] rounded-2xl bg-white/80 px-4 py-3 shadow-[0_18px_40px_-24px_rgb(74_42_29/0.6)] backdrop-blur sm:block">
              <p className="font-display text-2xl leading-none font-extrabold">{total}</p>
              <p className="mt-1 text-xs font-semibold text-muted">sabores para elegir</p>
            </div>
            <div className="absolute right-[-30%] bottom-[30%] hidden animate-[badge-in_0.8s_0.7s_var(--ease-spring)_both] items-center gap-2 rounded-full bg-carbon py-2 pr-4 pl-2 text-cream shadow-[0_18px_40px_-20px_rgb(0_0_0/0.7)] sm:flex">
              <span className="grid size-8 place-items-center rounded-full bg-[#1f8f4e]">
                <MessageCircle className="size-4" aria-hidden />
              </span>
              <span className="text-sm leading-tight font-semibold">
                Pedido directo
                <span className="block text-xs font-normal text-cream/65">por WhatsApp</span>
              </span>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
