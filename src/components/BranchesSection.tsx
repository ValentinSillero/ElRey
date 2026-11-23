"use client";

import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { LOCALITIES, storeMapsUrl, type LocalityId } from "@/config/branches";
import { useOrder } from "@/lib/order-store";
import { getOrderChannel } from "@/lib/whatsapp";
import { scrollToId } from "@/lib/hooks";
import { SectionHeader } from "./SectionHeader";

/**
 * Sucursales en formato editorial: tres columnas separadas por filetes,
 * la dirección como protagonista y acciones discretas (enlaces + un botón fino).
 */
export function BranchesSection() {
  const { localityId, requestLocality, hydrated, items } = useOrder();

  const orderHere = (id: LocalityId) => {
    const changing = localityId && localityId !== id && items.length > 0;
    requestLocality(id);
    if (!changing) scrollToId("pedido");
  };

  return (
    <section id="sucursales" className="relative bg-vanilla/40 py-14 sm:py-20" aria-labelledby="branches-title">
      <div className="container-x">
        <SectionHeader
          label="Sucursales"
          id="branches-title"
          title={
            <>
              Nuestras <span className="font-serif font-normal tracking-[-0.01em] italic">sucursales</span>
            </>
          }
          description="Tres localidades en Entre Ríos, cada una con su propio WhatsApp para recibir tu pedido."
        />

        <ul className="mt-8 grid divide-y divide-hairline sm:mt-12 md:grid-cols-3 md:divide-x md:divide-y-0">
          {LOCALITIES.map((l) => {
            const channel = getOrderChannel(l);
            const chatUrl = channel.kind === "direct" ? `https://wa.me/${channel.number}` : channel.kind === "chat" ? channel.url : null;
            const active = hydrated && localityId === l.id;
            return (
              <li key={l.id} className="flex flex-col py-7 first:pt-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-[1.5rem] leading-tight font-bold tracking-[-0.025em] sm:text-[1.65rem]">{l.name}</h3>
                  {active && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-orange">
                      <span className="size-1.5 rounded-full bg-orange" aria-hidden />
                      Tu localidad
                    </span>
                  )}
                </div>

                <ul className="mt-4 grid gap-3">
                  {l.stores.length === 0 && <li className="text-[14px] text-muted">Retiro y entregas a coordinar por WhatsApp.</li>}
                  {l.stores.map((s) => {
                    const maps = storeMapsUrl(s, l);
                    return (
                      <li key={s.id} className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold text-ink">{s.address ?? s.name}</p>
                          {s.address && <p className="text-[13px] text-muted">{s.name}</p>}
                        </div>
                        {maps && (
                          <a
                            href={maps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-quiet shrink-0 text-[13px] text-ink/75"
                            aria-label={`Ver ${s.name} de ${l.name} en Google Maps`}
                          >
                            Mapa <ArrowUpRight className="size-3.5" aria-hidden />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 md:mt-auto md:pt-8">
                  <button type="button" onClick={() => orderHere(l.id)} className="btn-sm btn-line group h-9 px-4">
                    Pedir en {l.name}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </button>
                  {chatUrl && (
                    <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="link-quiet text-[13px] text-ink/75" aria-label={`WhatsApp de ${l.name}`}>
                      <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
