// Thin Strapi client for the Page collection + Global single type.
// Everything degrades gracefully: if Strapi is unreachable or a field is empty,
// the components fall back to their hardcoded defaults.

// `import.meta.env` is inlined at build (local .env); `process.env` covers
// runtime values set by the host (e.g. Railway). Fall back to local Strapi.
const STRAPI_URL =
  import.meta.env.STRAPI_URL ||
  (typeof process !== "undefined" ? process.env.STRAPI_URL : undefined) ||
  "http://localhost:1337";

type StrapiMedia =
  | { url?: string; alternativeText?: string | null; mime?: string | null }
  | null
  | undefined;

/** Absolute URL for a Strapi media object; returns `fallback` when missing. */
export function mediaUrl(media: StrapiMedia, fallback = ""): string {
  const url = media?.url;
  if (!url) return fallback;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

/** Alt text from a Strapi media object; returns `fallback` when unset. */
export function mediaAlt(media: StrapiMedia, fallback = ""): string {
  return media?.alternativeText || fallback;
}

/** MIME type of a Strapi media object; returns `fallback` when unset. */
export function mediaMime(media: StrapiMedia, fallback = ""): string {
  return media?.mime || fallback;
}

/** Fetch a Page by slug (sections are deep-populated by the controller). */
export async function getPage(slug: string): Promise<any | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}`
    );
    if (!res.ok) {
      console.warn(`[strapi] /api/pages?slug=${slug} returned ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json?.data?.[0] ?? null;
  } catch (err) {
    console.warn("[strapi] page fetch failed, using fallback content:", err);
    return null;
  }
}

/** Fetch the Global single type (nav + footer). */
export async function getGlobal(): Promise<any | null> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/global`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (err) {
    console.warn("[strapi] global fetch failed, using fallback content:", err);
    return null;
  }
}
