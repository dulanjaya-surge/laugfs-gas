// Small content helpers shared across section components.
export { mediaUrl, mediaAlt, mediaMime } from "./strapi";

export const pick = (v: any, fallback: any) =>
  v === undefined || v === null || v === "" ? fallback : v;

export const arr = (v: any, fallback: any[]) =>
  Array.isArray(v) && v.length ? v : fallback;

// Split a heading, wrapping the accent substring so it can be italicised.
export function splitAccent(heading: string, accent?: string) {
  if (!accent || !heading || !heading.includes(accent))
    return [{ t: heading ?? "", em: false }];
  const i = heading.indexOf(accent);
  return [
    { t: heading.slice(0, i), em: false },
    { t: accent, em: true },
    { t: heading.slice(i + accent.length), em: false },
  ].filter((p) => p.t !== "");
}

// Split a title into words, flagging the one matching `accent` (used for the
// per-word hero/capabilities reveal animation).
export function splitWords(title: string, accent?: string) {
  const norm = (s: string) => s.replace(/[.,]/g, "").toLowerCase();
  return (title ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ t: w, accent: !!accent && norm(w) === norm(accent) }));
}
