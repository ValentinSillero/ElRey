import Image from "next/image";
import logoDark from "@/assets/brand/logo-dark.png";
import logoLight from "@/assets/brand/logo-light.png";

/** Logo oficial de Helados El Rey (extraído del original, sin modificar su dibujo). */
export function Logo({
  variant = "dark",
  className,
  priority,
  sizes = "140px",
  loading,
}: {
  variant?: "dark" | "light";
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <Image
      src={variant === "dark" ? logoDark : logoLight}
      alt="Helados El Rey"
      className={className}
      preload={priority} loading={loading ?? (priority ? "eager" : undefined)}
      sizes={sizes}
    />
  );
}
