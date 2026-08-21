// Shared refill-page helpers: the data island the page embeds, and the money
// formatting used on both sides of the wire.
import { getProducts, getDistricts, mediaUrl, mediaAlt } from "./strapi";

export type PriceMap = Record<string, Record<string, number>>; // district -> product -> price

export type RefillProduct = {
  slug: string;
  name: string;
  weightLabel: string;
  weightKg: number;
  tagline: string;
  useCase: string;
  description: string;
  image: string;
  imageAlt: string;
};

export type RefillDistrict = { slug: string; name: string };
export type RefillCity = { slug: string; name: string };

export type RefillData = {
  currency: string;
  products: RefillProduct[];
  districts: RefillDistrict[];
  cities: Record<string, RefillCity[]>; // keyed by district slug
  prices: PriceMap;
  pageTitle: string;
  pageAccent: string;
  pageIntro: string;
  priceNote: string;
  agentNote: string;
  hotlineLabel: string;
  supportPhone: string;
  supportEmail: string;
};

/** Rupee formatting used everywhere prices are shown. */
export function money(value: number, currency = "LKR"): string {
  const n = Number.isFinite(value) ? value : 0;
  const formatted = n.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === "LKR" ? `Rs ${formatted}` : `${currency} ${formatted}`;
}

const FALLBACK_IMG = "/design/gas.png";

/**
 * Everything the refill page needs in one payload: the sizes, the districts
 * and their towns, and a compact `district -> product -> price` lookup. Prices
 * and towns are small and change rarely, so embedding them makes selection
 * instant; only the agent list is fetched on demand, since a dealer network
 * can be far too large to ship whole.
 */
export async function getRefillData(): Promise<RefillData> {
  const [productsRaw, districtsRaw] = await Promise.all([getProducts(), getDistricts()]);

  const products: RefillProduct[] = productsRaw
    .filter((p: any) => p.active !== false)
    .map((p: any) => ({
      slug: p.slug,
      name: p.name,
      weightLabel: p.weightLabel,
      weightKg: Number(p.weightKg),
      tagline: p.tagline ?? "",
      useCase: p.useCase ?? "",
      description: p.description ?? "",
      image: mediaUrl(p.image, FALLBACK_IMG),
      imageAlt: mediaAlt(p.image, `${p.name} LP Gas cylinder`),
    }));

  const active = districtsRaw.filter((d: any) => d.active !== false);

  const districts: RefillDistrict[] = active.map((d: any) => ({ slug: d.slug, name: d.name }));

  const cities: Record<string, RefillCity[]> = Object.fromEntries(
    active.map((d: any) => [
      d.slug,
      (d.cities ?? [])
        .filter((c: any) => c?.slug && c.active !== false)
        .map((c: any) => ({ slug: c.slug, name: c.name })),
    ]),
  );

  const prices: PriceMap = Object.fromEntries(
    active.map((d: any) => [
      d.slug,
      Object.fromEntries(
        (d.prices ?? [])
          .filter((r: any) => r?.product?.slug)
          .map((r: any) => [r.product.slug, Number(r.price)]),
      ),
    ]),
  );

  // Page copy lives on the Refill page block now; these are the defaults it
  // falls back to.
  return {
    currency: "LKR",
    products,
    districts,
    cities,
    prices,
    pageTitle: "Find your refill price and your nearest agent.",
    pageAccent: "refill price",
    pageIntro:
      "Refill prices are set district by district. Choose your cylinder size and where you are, and we will show the price and the authorised agents nearest you.",
    priceNote:
      "Refills are exchanged for your empty cylinder. Prices are the published district refill prices and may be revised.",
    agentNote:
      "Call an authorised agent directly to arrange your refill. They confirm availability and delivery for your area.",
    hotlineLabel: "Not sure who to call?",
    supportPhone: "+94 11 5 566 222",
    supportEmail: "info@laugfsgas.lk",
  };
}
