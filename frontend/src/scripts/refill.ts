// Refill page: pick a size, pick a district, see the price for that pair,
// then add it to the cart. Everything is driven off the JSON data island so
// the page needs no further requests.
import { addToCart, cartCount, getDistrict, setDistrict, shopData, money } from "./cart";

const data = shopData();
const root = document.querySelector<HTMLElement>(".refill");

if (data && root) {
  const products: any[] = data.products ?? [];
  const currency: string = data.currency ?? "LKR";
  const maxQty: number = data.maxQtyPerItem ?? 5;

  const sizeButtons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-size]"));
  const images = Array.from(root.querySelectorAll<HTMLElement>("[data-img]"));
  const districtSel = root.querySelector<HTMLSelectElement>("#district");
  const priceEl = root.querySelector<HTMLElement>("[data-price]");
  const deliveryEl = root.querySelector<HTMLElement>("[data-delivery]");
  const totalEl = root.querySelector<HTMLElement>("[data-line-total]");
  const badgeEl = root.querySelector<HTMLElement>("[data-weight-badge]");
  const useEl = root.querySelector<HTMLElement>("[data-use]");
  // These two live in the detail section below, outside .refill.
  const descEl = document.querySelector<HTMLElement>("[data-desc]");
  const nameEl = document.querySelector<HTMLElement>("[data-name]");
  const qtyEl = root.querySelector<HTMLElement>("[data-qty]");
  const addBtn = root.querySelector<HTMLButtonElement>("[data-add]");
  const noPrice = root.querySelector<HTMLElement>("[data-no-price]");

  let size = products[0]?.slug ?? "";
  let qty = 1;

  const product = () => products.find((p) => p.slug === size);
  const unitPrice = (): number | null => {
    const d = districtSel?.value;
    if (!d || !size) return null;
    const row = data.prices?.[d]?.[size];
    return Number.isFinite(row) ? Number(row) : null;
  };
  const deliveryFee = (): number => {
    const d = data.districts?.find((x: any) => x.slug === districtSel?.value);
    return Number(d?.deliveryFee ?? data.deliveryFee ?? 0);
  };

  function render() {
    const p = product();
    images.forEach((img) => {
      const on = img.dataset.img === size;
      img.classList.toggle("is-active", on);
      img.setAttribute("aria-hidden", on ? "false" : "true");
    });
    sizeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.size === size)));

    if (badgeEl) badgeEl.textContent = p?.weightLabel ?? "";
    if (nameEl) nameEl.textContent = p?.name ?? "";
    if (useEl) useEl.textContent = p?.useCase ?? "";
    if (descEl) descEl.textContent = p?.description ?? "";
    if (qtyEl) qtyEl.textContent = String(qty);

    const unit = unitPrice();
    const hasPrice = unit !== null;
    if (priceEl) priceEl.textContent = hasPrice ? money(unit as number, currency) : "—";
    if (deliveryEl) deliveryEl.textContent = money(deliveryFee(), currency);
    if (totalEl)
      totalEl.textContent = hasPrice
        ? money((unit as number) * qty + deliveryFee(), currency)
        : "—";
    if (noPrice) noPrice.hidden = hasPrice || !districtSel?.value;
    if (addBtn) addBtn.disabled = !hasPrice;
  }

  sizeButtons.forEach((b) =>
    b.addEventListener("click", () => {
      size = b.dataset.size ?? size;
      render();
    }),
  );

  districtSel?.addEventListener("change", () => {
    setDistrict(districtSel.value);
    render();
  });

  root.querySelector("[data-qty-down]")?.addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    render();
  });
  root.querySelector("[data-qty-up]")?.addEventListener("click", () => {
    qty = Math.min(maxQty, qty + 1);
    render();
  });

  addBtn?.addEventListener("click", () => {
    if (unitPrice() === null) return;
    addToCart(size, qty, maxQty);
    const flash = root.querySelector<HTMLElement>("[data-added]");
    if (flash) {
      flash.textContent = `${qty} × ${product()?.weightLabel} added — ${cartCount()} in your cart`;
      flash.classList.add("is-on");
      window.setTimeout(() => flash.classList.remove("is-on"), 3200);
    }
    qty = 1;
    render();
  });

  // Restore the district chosen earlier in the session.
  const saved = getDistrict();
  if (saved && districtSel && Array.from(districtSel.options).some((o) => o.value === saved)) {
    districtSel.value = saved;
  }
  render();
}
