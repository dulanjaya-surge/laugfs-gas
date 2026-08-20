// Guest cart, kept in localStorage. No accounts: the cart lives in the
// browser until checkout, and the server re-prices every line before an
// order is created, so a tampered cart cannot change what is charged.

export type CartLine = { slug: string; qty: number };

const CART_KEY = "laugfs.cart.v1";
const DISTRICT_KEY = "laugfs.district.v1";

export function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l: any) => l && typeof l.slug === "string" && Number.isFinite(l.qty) && l.qty > 0)
      .map((l: any) => ({ slug: l.slug, qty: Math.floor(l.qty) }));
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(lines.filter((l) => l.qty > 0)));
  } catch {
    /* private mode / quota — the cart just will not persist */
  }
  window.dispatchEvent(new CustomEvent("cart:change", { detail: { count: cartCount() } }));
}

export function addToCart(slug: string, qty = 1, max = 5): number {
  const lines = readCart();
  const found = lines.find((l) => l.slug === slug);
  if (found) found.qty = Math.min(max, found.qty + qty);
  else lines.push({ slug, qty: Math.min(max, qty) });
  writeCart(lines);
  return found ? found.qty : qty;
}

export function setQty(slug: string, qty: number, max = 5): void {
  const lines = readCart().map((l) =>
    l.slug === slug ? { ...l, qty: Math.max(0, Math.min(max, qty)) } : l,
  );
  writeCart(lines.filter((l) => l.qty > 0));
}

export function removeLine(slug: string): void {
  writeCart(readCart().filter((l) => l.slug !== slug));
}

export function clearCart(): void {
  writeCart([]);
}

export function cartCount(): number {
  return readCart().reduce((n, l) => n + l.qty, 0);
}

/** The chosen district is remembered across pages — prices depend on it. */
export function getDistrict(): string {
  try {
    return localStorage.getItem(DISTRICT_KEY) || "";
  } catch {
    return "";
  }
}

export function setDistrict(slug: string): void {
  try {
    localStorage.setItem(DISTRICT_KEY, slug);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("district:change", { detail: { slug } }));
}

/** Read the JSON data island every shop page embeds. */
export function shopData(): any {
  const el = document.getElementById("shop-data");
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

/** Rupee formatting, mirroring lib/shop.ts on the server side. */
export function money(value: number, currency = "LKR"): string {
  const n = Number.isFinite(value) ? value : 0;
  const s = n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === "LKR" ? `Rs ${s}` : `${currency} ${s}`;
}
