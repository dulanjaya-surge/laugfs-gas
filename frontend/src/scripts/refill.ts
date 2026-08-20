// Refill page: choose a cylinder size and a location, see the district price
// and the authorised agents to call. Prices and towns come from the embedded
// data island; only the agent list is fetched, since a dealer network can be
// far larger than is sensible to ship to the browser.

type Product = {
  slug: string; name: string; weightLabel: string; tagline: string;
  useCase: string; description: string;
};
type Agent = {
  name: string; addressLine: string; phone: string; phoneAlt: string;
  hours: string; mapUrl: string; deliversHome: boolean; cityName: string;
};

const DISTRICT_KEY = "laugfs.district.v1";
const CITY_KEY = "laugfs.city.v1";

function readIsland(): any {
  const el = document.getElementById("refill-data");
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

function money(value: number, currency = "LKR"): string {
  const n = Number.isFinite(value) ? value : 0;
  const s = n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === "LKR" ? `Rs ${s}` : `${currency} ${s}`;
}

const store = {
  get(key: string): string {
    try { return localStorage.getItem(key) || ""; } catch { return ""; }
  },
  set(key: string, value: string): void {
    try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch { /* private mode */ }
  },
};

const data = readIsland();

if (data) {
  const products: Product[] = data.products ?? [];
  const currency: string = data.currency ?? "LKR";

  const districtSel = document.querySelector<HTMLSelectElement>("#district");
  const citySel = document.querySelector<HTMLSelectElement>("#city");
  const statusEl = document.querySelector<HTMLElement>("[data-locator-status]");
  const sizeCards = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-size]"));
  const images = Array.from(document.querySelectorAll<HTMLElement>("[data-img]"));
  const badgeEl = document.querySelector<HTMLElement>("[data-weight-badge]");
  const nameEl = document.querySelector<HTMLElement>("[data-name]");
  const useEl = document.querySelector<HTMLElement>("[data-use]");
  const descEl = document.querySelector<HTMLElement>("[data-desc]");
  const priceEl = document.querySelector<HTMLElement>("[data-price]");
  const priceForEl = document.querySelector<HTMLElement>("[data-price-for]");
  const agentsList = document.querySelector<HTMLElement>("[data-agents-list]");
  const agentsState = document.querySelector<HTMLElement>("[data-agents-state]");
  const agentsCount = document.querySelector<HTMLElement>("[data-agents-count]");
  const agentsTitle = document.querySelector<HTMLElement>("[data-agents-title]");

  let size = products[0]?.slug ?? "";
  let requestToken = 0; // guards against a slow response overwriting a newer one

  const districtName = () =>
    data.districts?.find((d: any) => d.slug === districtSel?.value)?.name ?? "";
  const cityName = () =>
    (data.cities?.[districtSel?.value ?? ""] ?? []).find((c: any) => c.slug === citySel?.value)?.name ?? "";
  const priceFor = (productSlug: string): number | null => {
    const p = data.prices?.[districtSel?.value ?? ""]?.[productSlug];
    return Number.isFinite(p) ? Number(p) : null;
  };

  // ---- Cylinder size ------------------------------------------------------
  function renderSize() {
    const p = products.find((x) => x.slug === size);
    images.forEach((img) => {
      const on = img.dataset.img === size;
      img.classList.toggle("is-active", on);
      img.setAttribute("aria-hidden", on ? "false" : "true");
    });
    sizeCards.forEach((c) => c.setAttribute("aria-checked", String(c.dataset.size === size)));

    if (badgeEl) badgeEl.textContent = p?.weightLabel ?? "";
    if (nameEl) nameEl.textContent = p?.name ?? "";
    if (useEl) useEl.textContent = p?.useCase ?? "";
    if (descEl) descEl.textContent = p?.description ?? "";

    const price = priceFor(size);
    if (priceEl) priceEl.textContent = price === null ? "—" : money(price, currency);
    if (priceForEl) {
      priceForEl.textContent = price === null
        ? "select a district"
        : `refill price in ${districtName()}`;
    }
  }

  // ---- Prices on every card, so a district shows the whole range at once --
  function renderCardPrices() {
    for (const card of sizeCards) {
      const slug = card.dataset.size ?? "";
      const el = card.querySelector<HTMLElement>(`[data-card-price="${slug}"]`);
      if (!el) continue;
      const price = priceFor(slug);
      el.textContent = price === null ? "Select a district" : money(price, currency);
      el.classList.toggle("is-priced", price !== null);
    }
  }

  // ---- Towns for the chosen district -------------------------------------
  function renderCities(preferred = "") {
    if (!citySel) return;
    const list = data.cities?.[districtSel?.value ?? ""] ?? [];
    citySel.innerHTML = "";
    const all = document.createElement("option");
    all.value = "";
    all.textContent = list.length ? "All towns" : "All towns";
    citySel.appendChild(all);
    for (const c of list) {
      const o = document.createElement("option");
      o.value = c.slug;
      o.textContent = c.name;
      citySel.appendChild(o);
    }
    citySel.disabled = !districtSel?.value || list.length === 0;
    if (preferred && list.some((c: any) => c.slug === preferred)) citySel.value = preferred;
  }

  // ---- Agents -------------------------------------------------------------
  function agentCard(a: Agent): string {
    const tel = a.phone.replace(/\s/g, "");
    const alt = a.phoneAlt ? `<a href="tel:${a.phoneAlt.replace(/\s/g, "")}">${a.phoneAlt}</a>` : "";
    return `
      <li class="agent">
        <div class="agent__main">
          <h3 class="agent__name">${a.name}</h3>
          <p class="agent__addr">${a.addressLine}</p>
          <div class="agent__meta">
            ${a.cityName ? `<span class="agent__tag">${a.cityName}</span>` : ""}
            ${a.deliversHome ? `<span class="agent__tag agent__tag--ok">Home delivery</span>` : ""}
            ${a.hours ? `<span class="agent__hours">${a.hours}</span>` : ""}
          </div>
        </div>
        <div class="agent__actions">
          <a class="btn btn--gold agent__call" href="tel:${tel}">Call ${a.phone}</a>
          ${alt ? `<span class="agent__alt">or ${alt}</span>` : ""}
          ${a.mapUrl ? `<a class="link-underline" href="${a.mapUrl}" target="_blank" rel="noopener noreferrer">DIRECTIONS →</a>` : ""}
        </div>
      </li>`;
  }

  async function loadAgents() {
    if (!agentsList || !agentsState) return;
    const district = districtSel?.value ?? "";
    if (!district) {
      agentsList.innerHTML = "";
      agentsState.hidden = false;
      agentsState.textContent = "Select your district above to see the authorised agents nearest you.";
      if (agentsCount) agentsCount.hidden = true;
      return;
    }

    const token = ++requestToken;
    agentsState.hidden = false;
    agentsState.textContent = "Finding authorised agents…";
    agentsList.innerHTML = "";
    if (agentsCount) agentsCount.hidden = true;

    const qs = new URLSearchParams({ district });
    if (citySel?.value) qs.set("city", citySel.value);

    try {
      const res = await fetch(`/api/agents?${qs}`);
      const json = await res.json();
      if (token !== requestToken) return; // a newer selection superseded this one
      if (!res.ok) throw new Error(json?.error || "Could not load agents.");

      const agents: Agent[] = json.data ?? [];
      const where = cityName() || districtName();

      if (agentsTitle) agentsTitle.textContent = `Authorised agents in ${where}`;

      if (agents.length === 0) {
        agentsState.hidden = false;
        agentsState.innerHTML = citySel?.value
          ? `No agent is listed for ${cityName()} yet. Try “All towns” in ${districtName()}, or call our hotline below.`
          : `No agent is listed for ${districtName()} yet. Please call our hotline below and we will direct you.`;
        return;
      }

      agentsState.hidden = true;
      agentsList.innerHTML = agents.map(agentCard).join("");
      if (agentsCount) {
        agentsCount.hidden = false;
        agentsCount.textContent = `${agents.length} ${agents.length === 1 ? "agent" : "agents"}`;
      }
    } catch (err: any) {
      if (token !== requestToken) return;
      agentsState.hidden = false;
      agentsState.textContent =
        "We could not load agents just now. Please call our hotline below.";
    }
  }

  function renderStatus() {
    if (!statusEl) return;
    if (!districtSel?.value) {
      statusEl.textContent = "Choose your district to see refill prices.";
      return;
    }
    const where = cityName() ? `${cityName()}, ${districtName()}` : districtName();
    statusEl.textContent = `Showing refill prices and agents for ${where}.`;
  }

  /** Keep the URL in step so a chosen price/location can be shared. */
  function syncUrl() {
    const url = new URL(window.location.href);
    const set = (k: string, v: string) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k));
    set("district", districtSel?.value ?? "");
    set("city", citySel?.value ?? "");
    set("size", size);
    window.history.replaceState({}, "", url);
  }

  // ---- Wiring -------------------------------------------------------------
  sizeCards.forEach((card) =>
    card.addEventListener("click", () => {
      size = card.dataset.size ?? size;
      renderSize();
      syncUrl();
    }),
  );

  districtSel?.addEventListener("change", () => {
    store.set(DISTRICT_KEY, districtSel.value);
    store.set(CITY_KEY, "");
    renderCities();
    renderCardPrices();
    renderSize();
    renderStatus();
    syncUrl();
    void loadAgents();
  });

  citySel?.addEventListener("change", () => {
    store.set(CITY_KEY, citySel.value);
    renderStatus();
    syncUrl();
    void loadAgents();
  });

  // ---- Initial state: URL wins, then whatever was chosen last -------------
  const params = new URLSearchParams(window.location.search);
  const startDistrict = params.get("district") || store.get(DISTRICT_KEY);
  const startCity = params.get("city") || store.get(CITY_KEY);
  const startSize = params.get("size");

  if (startSize && products.some((p) => p.slug === startSize)) size = startSize;
  if (
    startDistrict &&
    districtSel &&
    Array.from(districtSel.options).some((o) => o.value === startDistrict)
  ) {
    districtSel.value = startDistrict;
  }
  renderCities(startCity);
  renderCardPrices();
  renderSize();
  renderStatus();
  if (districtSel?.value) void loadAgents();
}
