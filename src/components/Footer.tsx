import { Instagram } from "./icons";
import { LOCALITIES } from "@/config/branches";
import { SITE } from "@/config/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-carbon pt-14 pb-10 text-cream">
      <div className="container-x">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo variant="light" className="h-16 w-auto" sizes="120px" />
            <p className="mt-4 font-serif text-2xl text-cream/85 italic">{SITE.tagline}.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="eyebrow text-cream/50">Pedidos</p>
              <ul className="mt-3 grid gap-2">
                <li><a className="hover:text-orange-soft" href="#pedido">Armar pedido</a></li>
                <li><a className="hover:text-orange-soft" href="#pedido">Tamaños y precios</a></li>
              </ul>
            </div>
            <div>
              <p className="eyebrow text-cream/50">Localidades</p>
              <ul className="mt-3 grid gap-2">
                {LOCALITIES.map((l) => (
                  <li key={l.id}>
                    <a className="hover:text-orange-soft" href="#sucursales">{l.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-cream/50">Redes</p>
              <a
                className="mt-3 inline-flex items-center gap-2 hover:text-orange-soft"
                href={SITE.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="size-4" aria-hidden /> @{SITE.instagram.handle}
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-cream/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name} · {SITE.region}</p>
          <p>Los pedidos se confirman por WhatsApp con cada sucursal.</p>
        </div>
      </div>
    </footer>
  );
}
