import { getLocality, getStore, type Locality, type LocalityId } from "@/config/branches";
import { getFlavor } from "@/config/flavors";
import { getProduct } from "@/config/products";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/cart";
import { cartTotals } from "@/lib/cart";

export type DeliveryMethod = "delivery" | "retiro";

export interface CheckoutData {
  name: string;
  localityId: LocalityId | null;
  method: DeliveryMethod;
  address: string;
  storeId: string | null;
  notes: string;
}

/** Número válido para wa.me: solo dígitos, formato internacional argentino (54…) */
export function isValidWhatsappNumber(n: string | null | undefined): n is string {
  return !!n && /^54\d{10,11}$/.test(n);
}

export type OrderChannel =
  | { kind: "direct"; number: string }
  | { kind: "chat"; url: string }
  | { kind: "none" };

/**
 * Determina a dónde se puede enviar el pedido de una localidad.
 * Nunca usa el contacto de otra localidad.
 */
export function getOrderChannel(locality: Locality | undefined): OrderChannel {
  if (!locality) return { kind: "none" };
  if (isValidWhatsappNumber(locality.whatsappNumber)) return { kind: "direct", number: locality.whatsappNumber };
  if (locality.whatsappChatUrl && /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(locality.whatsappChatUrl)) {
    return { kind: "chat", url: locality.whatsappChatUrl };
  }
  return { kind: "none" };
}

export function buildOrderMessage(items: CartItem[], data: CheckoutData): string {
  const locality = getLocality(data.localityId);
  const store = getStore(locality, data.storeId);
  const lines: string[] = [];

  lines.push("Hola, Helados El Rey. Quiero hacer un pedido.");
  lines.push("");
  lines.push(`Sucursal: ${locality?.name ?? "-"}`);

  items.forEach((item, idx) => {
    const product = getProduct(item.sizeId);
    if (!product) return;
    lines.push("");
    lines.push(`PEDIDO ${idx + 1}`);
    lines.push(item.qty > 1 ? `${item.qty} x ${product.orderLabel}` : product.orderLabel);
    lines.push("Sabores:");
    for (const id of item.flavors) {
      const fl = getFlavor(id);
      if (fl) lines.push(`- ${fl.name}`);
    }
    const lineTotal = product.price * item.qty;
    lines.push(
      item.qty > 1
        ? `Precio: ${formatPrice(lineTotal)} (${formatPrice(product.price)} c/u)`
        : `Precio: ${formatPrice(lineTotal)}`,
    );
  });

  const { subtotal } = cartTotals(items);
  lines.push("");
  lines.push(`SUBTOTAL: ${formatPrice(subtotal)}`);
  lines.push("");
  lines.push(`Cliente: ${data.name.trim()}`);

  if (data.method === "delivery") {
    lines.push("Entrega: Delivery");
    lines.push(`Dirección: ${data.address.trim()}`);
  } else {
    lines.push("Entrega: Retiro en sucursal");
    const where = store
      ? `${store.name}${store.address ? `, ${store.address}` : ""} (${locality?.name})`
      : `${locality?.name ?? "-"} (a coordinar)`;
    lines.push(`Retiro en: ${where}`);
  }
  if (data.notes.trim()) lines.push(`Aclaraciones: ${data.notes.trim()}`);

  lines.push("");
  lines.push(
    data.method === "delivery"
      ? "Quedo a la espera de la confirmación del pedido y el costo de envío. ¡Gracias!"
      : "Quedo a la espera de la confirmación del pedido. ¡Gracias!",
  );
  return lines.join("\n");
}

export function buildDirectUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export interface CheckoutErrors {
  name?: string;
  localityId?: string;
  address?: string;
  storeId?: string;
  items?: string;
}

export function validateCheckout(items: CartItem[], data: CheckoutData): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!items.length) errors.items = "Tu pedido está vacío.";
  if (data.name.trim().length < 2) errors.name = "Contanos tu nombre.";
  const locality = getLocality(data.localityId);
  if (!locality) errors.localityId = "Elegí tu localidad.";
  if (data.method === "delivery" && data.address.trim().length < 4) errors.address = "Necesitamos la dirección de entrega.";
  if (data.method === "retiro" && locality && locality.stores.length > 1 && !getStore(locality, data.storeId)) {
    errors.storeId = "Elegí en qué sucursal retirás.";
  }
  return errors;
}
