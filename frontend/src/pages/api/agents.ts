import type { APIRoute } from "astro";

export const prerender = false;

// The browser only ever talks to this origin: Strapi's URL stays server-side,
// there is no CORS to configure, and the agent list is filtered and trimmed
// here rather than shipped whole to the client.
const STRAPI_URL =
  import.meta.env.STRAPI_URL ||
  (typeof process !== "undefined" ? process.env.STRAPI_URL : undefined) ||
  "http://localhost:1337";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const GET: APIRoute = async ({ url }) => {
  const district = (url.searchParams.get("district") ?? "").trim();
  const city = (url.searchParams.get("city") ?? "").trim();

  if (!district) return json({ error: "Choose a district." }, 400);

  const qs = new URLSearchParams();
  qs.set("filters[district][slug][$eq]", district);
  if (city) qs.set("filters[city][slug][$eq]", city);
  qs.set("filters[active][$eq]", "true");
  qs.set("pagination[pageSize]", "60");

  try {
    const res = await fetch(`${STRAPI_URL}/api/agents?${qs}`);
    if (!res.ok) return json({ error: "Could not load agents." }, 502);
    const body = await res.json();
    const agents = (body?.data ?? []).map((a: any) => ({
      name: a.name,
      addressLine: a.addressLine,
      phone: a.phone,
      phoneAlt: a.phoneAlt ?? "",
      hours: a.hours ?? "",
      mapUrl: a.mapUrl ?? "",
      deliversHome: a.deliversHome !== false,
      cityName: a.city?.name ?? "",
      districtName: a.district?.name ?? "",
    }));
    return json({ data: agents });
  } catch (err) {
    console.error("[api] agents lookup failed:", err);
    return json({ error: "Could not load agents." }, 502);
  }
};
