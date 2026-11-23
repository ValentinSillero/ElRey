/**
 * LOCALIDADES, SUCURSALES Y WHATSAPP
 * ---------------------------------------------------------------
 * Fuente de los enlaces: Linktree oficial (linktr.ee/heladoselrey).
 *
 * WHATSAPP POR LOCALIDAD
 *  - `whatsappNumber`: número en formato internacional SOLO con dígitos
 *    (ej. "5493447000000"). Con este dato el pedido se abre en WhatsApp
 *    con el mensaje ya escrito. Números confirmados por la heladería.
 *  - `whatsappChatUrl`: enlace oficial de chat de cada localidad (del Linktree).
 *    Respaldo: esos enlaces no permiten precargar texto, así que solo se usan
 *    si falta el número (el sitio copia el pedido y abre ese chat para pegarlo).
 *  - Si faltan ambos, el sitio no permite enviar el pedido de esa localidad.
 *
 * SUCURSALES
 *  - `address`: dirección confirmada por la heladería (`null` si falta).
 *  - `mapsUrl`: enlace oficial de Google Maps (del Linktree). Si una sucursal
 *    no lo tiene, se arma una búsqueda de Google Maps con su dirección.
 */

export type LocalityId = "colon" | "san-jose" | "villa-elisa";

export interface Store {
  id: string;
  name: string;
  address: string | null;
  mapsUrl: string | null;
}

export interface Locality {
  id: LocalityId;
  name: string;
  whatsappNumber: string | null;
  whatsappChatUrl: string | null;
  stores: Store[];
}

export const LOCALITIES: Locality[] = [
  {
    id: "colon",
    name: "Colón",
    whatsappNumber: "5493447606666", // +54 9 3447 60-6666
    whatsappChatUrl: "https://wa.me/message/MHD2JRPPCTE5E1",
    stores: [
      {
        id: "colon-urquiza",
        name: "Sucursal Urquiza",
        address: "Urquiza 302",
        mapsUrl: "https://g.co/kgs/G41f5RS",
      },
      {
        id: "colon-12-de-abril",
        name: "Sucursal 12 de Abril",
        address: "12 de Abril 117",
        mapsUrl: "https://g.co/kgs/wcb4Mib",
      },
    ],
  },
  {
    id: "san-jose",
    name: "San José",
    whatsappNumber: "5493447542588", // +54 9 3447 54-2588
    whatsappChatUrl: "https://wa.me/message/YMKBVQARWBLKO1",
    stores: [
      {
        id: "san-jose",
        name: "Sucursal San José",
        address: "9 de Julio 1633",
        mapsUrl: null, // sin enlace oficial: se usa búsqueda por dirección
      },
    ],
  },
  {
    id: "villa-elisa",
    name: "Villa Elisa",
    whatsappNumber: "5493447592282", // +54 9 3447 59-2282
    whatsappChatUrl: "https://wa.me/message/IMLU6IJ6QWKGF1",
    stores: [
      {
        id: "villa-elisa",
        name: "Sucursal Villa Elisa",
        address: "Urquiza 1601",
        mapsUrl: "https://g.co/kgs/U1CXe7A",
      },
    ],
  },
];

export function getLocality(id: string | null | undefined): Locality | undefined {
  return LOCALITIES.find((l) => l.id === id);
}

export function getStore(locality: Locality | undefined, storeId: string | null | undefined) {
  return locality?.stores.find((s) => s.id === storeId);
}

/** Enlace oficial de Maps o, si no hay, una búsqueda con la dirección confirmada. */
export function storeMapsUrl(store: Store, locality: Locality): string | null {
  if (store.mapsUrl) return store.mapsUrl;
  if (!store.address) return null;
  const q = `${store.address}, ${locality.name}, Entre Ríos, Argentina`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
