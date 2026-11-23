"use client";

import { AnimatePresence, m, useDragControls } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useMediaQuery, useScrollLock } from "@/lib/hooks";
import { isTopOverlay, pushOverlay, trapTab } from "@/lib/overlay-stack";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  /** Texto accesible si el título no es solo texto */
  label?: string;
  subtitle?: React.ReactNode;
  headerLeft?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Ancho del panel lateral en escritorio */
  width?: number;
  /** En celular ocupa casi toda la altura (evita saltos al filtrar) */
  tall?: boolean;
}

/**
 * Panel responsivo: en celulares se desliza desde abajo (se puede arrastrar para cerrar),
 * en escritorio aparece como panel lateral.
 */
export function Sheet({ open, onClose, title, label, subtitle, headerLeft, footer, children, width = 480, tall = false }: SheetProps) {
  const desktop = useMediaQuery("(min-width: 768px)");
  const drag = useDragControls();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useScrollLock(open);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const token = {};
    const release = pushOverlay(token);
    returnFocus.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 30);
    const onKey = (e: KeyboardEvent) => {
      // solo responde el panel que está arriba de todo
      if (!isTopOverlay(token)) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
      trapTab(e, panelRef.current);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      release();
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const variants = desktop
    ? { hidden: { x: "100%" }, shown: { x: 0 } }
    : { hidden: { y: "100%" }, shown: { y: 0 } };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]" role="presentation">
          <m.div
            className="absolute inset-0 bg-carbon/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={label ? undefined : titleId}
            aria-label={label}
            tabIndex={-1}
            className={`absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col ${tall ? "h-[92dvh] md:h-auto" : ""} overflow-hidden rounded-t-[28px] bg-cream shadow-2xl outline-none md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:rounded-none md:rounded-l-[32px]`}
            style={desktop ? { width: `min(${width}px, 100vw)` } : undefined}
            variants={variants}
            initial="hidden"
            animate="shown"
            exit="hidden"
            transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.9 }}
            drag={desktop ? false : "y"}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
          >
            {/* manija para arrastrar (celular) */}
            <div
              className="flex shrink-0 touch-none justify-center pt-2.5 pb-1 md:hidden"
              onPointerDown={(e) => drag.start(e)}
              aria-hidden
            >
              <span className="h-1.5 w-11 rounded-full bg-ink/20" />
            </div>
            <header
              className="flex shrink-0 items-center gap-3 px-4 pt-1 pb-3 sm:px-6 md:pt-6"
              onPointerDown={(e) => {
                if (!desktop && (e.target as HTMLElement).closest("button") === null) drag.start(e);
              }}
            >
              {headerLeft}
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="truncate font-display text-[1.45rem] leading-tight font-extrabold tracking-tight">
                  {title}
                </h2>
                {subtitle && <div className="text-sm text-muted">{subtitle}</div>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-white shadow-[inset_0_0_0_1.5px_var(--color-line)] transition hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)] active:scale-95"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6">{children}</div>
            {footer && (
              <div className="shrink-0 border-t border-line bg-cream/95 px-4 pt-3 pb-[max(14px,env(safe-area-inset-bottom))] backdrop-blur sm:px-6">
                {footer}
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
