// Shared shop helpers: money formatting and the shape of the data island the
// refill/cart/checkout pages hand to their client scripts.

export type PriceMap = Record<string, Record<string, number>>; // district -> product -> price

export type ShopProduct = {
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

export type ShopDistrict = { slug: string; name: string; deliveryFee: number };

export type ShopData = {
  currency: string;
  deliveryFee: number;
  maxQtyPerItem: number;
  products: ShopProduct[];
  districts: ShopDistrict[];
  prices: PriceMap;
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
