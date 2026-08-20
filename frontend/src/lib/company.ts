// Merges the Company page's CMS record over the hardcoded fallbacks in
// data/about.ts, and hands the page exactly the shapes it already renders.
//
// Every field falls back individually rather than all-or-nothing: an empty
// box in Strapi shows the original copy instead of a gap, and the page still
// renders in full if the CMS is unreachable.
import { mediaUrl, mediaAlt } from "./strapi";
import * as fallback from "../data/about";

const str = (v: unknown, fb: string): string =>
  typeof v === "string" && v.trim() !== "" ? v : fb;

const num = (v: unknown, fb: number): number =>
  v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? fb : Number(v);

/** Use the CMS list when it has entries, otherwise the fallback list. */
const list = <T,>(v: unknown, fb: T[]): any[] =>
  Array.isArray(v) && v.length > 0 ? v : fb;

/** Was this list authored in the CMS, or are we looking at the fallback? */
const fromCms = (v: unknown): boolean => Array.isArray(v) && v.length > 0;

/**
 * When a list comes from the CMS but an image was never uploaded, recover the
 * client's own photograph from the fallback data by matching on name — so
 * editing the copy in Strapi never silently drops the picture beside it.
 */
const fbImages = {
  subsidiary: new Map(
    fallback.subsidiaries.map((s) => [s.name, { url: s.image ?? "", alt: s.imageAlt ?? "" }]),
  ),
  film: new Map(
    fallback.films.map((v) => [v.title, { url: v.poster ?? "", alt: v.posterAlt ?? "" }]),
  ),
};

export function buildCompany(cms: any) {
  const f = fallback;
  const intro = cms?.intro ?? {};
  const reach = cms?.reach ?? {};
  const mission = cms?.mission ?? {};
  const valuesBlock = cms?.valuesBlock ?? {};
  const timeline = cms?.timeline ?? {};
  const group = cms?.group ?? {};
  const recognition = cms?.recognition ?? {};
  const commitment = cms?.commitment ?? {};
  const governance = cms?.governance ?? {};
  const films = cms?.films ?? {};
  const cta = cms?.cta ?? {};

  return {
    seo: cms?.seo ?? null,

    opening: {
      eyebrow: str(intro.eyebrow, f.opening.eyebrow),
      title: str(intro.title, f.opening.title),
      accent: str(intro.accent, f.opening.accent),
      body: str(intro.body, f.opening.body),
      standfirst: str(intro.standfirst, f.opening.standfirst),
      since: num(intro.since, f.opening.since),
    },

    stats: list(cms?.stats, f.stats).map((s: any) => ({
      value: String(s.value ?? ""),
      to: s.to ?? undefined,
      unit: s.unit ?? "",
      label: s.label ?? "",
      note: s.note ?? "",
    })),

    reach: {
      eyebrow: str(reach.eyebrow, f.reach.eyebrow),
      title: str(reach.title, f.reach.title),
      accent: str(reach.accent, f.reach.accent),
      body: str(reach.body, f.reach.body),
      hint: str(reach.hint, f.reach.hint),
    },

    hotspots: list(reach.sites, f.hotspots).map((h: any, i: number) => ({
      id: h.id ?? `site-${i}`,
      name: h.name ?? "",
      kind: h.kind ?? "",
      figure: h.figure ?? "",
      body: h.body ?? "",
      x: Number(h.x),
      y: Number(h.y),
      lx: Number(h.lx),
      ly: Number(h.ly),
      anchor: h.anchor ?? "start",
    })),

    routes: list(reach.routes, f.routes).map((r: any, i: number) => ({
      id: r.id ?? `route-${i}`,
      label: r.label ?? "",
      note: r.note ?? "",
      d: r.d ?? "",
      lx: Number(r.lx),
      ly: Number(r.ly),
      anchor: r.anchor ?? "start",
    })),

    mission: {
      eyebrow: str(mission.eyebrow, f.mission.eyebrow),
      lead: str(mission.lead, f.mission.lead),
      points: fromCms(mission.points)
        ? mission.points.map((p: any) => p.text).filter(Boolean)
        : f.mission.points,
      philosophyTitle: str(mission.philosophyTitle, f.mission.philosophyTitle),
      philosophy: str(mission.philosophy, f.mission.philosophy),
    },

    values: list(valuesBlock.items, f.values).map((v: any) => ({
      name: v.name ?? "",
      body: v.body ?? "",
      proof: v.proof ?? "",
    })),

    milestones: list(timeline.items, f.milestones).map((m: any) => ({
      year: m.year ?? "",
      era: m.era ?? "",
      title: m.title ?? "",
      body: m.body ?? "",
    })),

    eras: fromCms(timeline.eras)
      ? timeline.eras.map((e: any) => e.label).filter(Boolean)
      : f.eras,

    subsidiaries: list(group.items, f.subsidiaries).map((s: any) => ({
      name: s.name ?? "",
      role: s.role ?? "",
      body: s.body ?? "",
      href: s.href ?? "",
      // An uploaded image wins; otherwise the client's own photography.
      image: mediaUrl(s.image, fbImages.subsidiary.get(s.name)?.url ?? ""),
      imageAlt: mediaAlt(
        s.image,
        s.imageAlt ?? fbImages.subsidiary.get(s.name)?.alt ?? s.name ?? "",
      ),
      facts: Array.isArray(s.facts)
        ? s.facts.map((x: any) => (typeof x === "string" ? x : x.label)).filter(Boolean)
        : [],
    })),

    chain: list(group.chain, f.chain).map((c: any) => ({
      step: c.step ?? "",
      body: c.body ?? "",
    })),

    awards: list(recognition.items, f.awards).map((a: any) => ({
      year: a.year ?? "",
      name: a.name ?? "",
      result: a.result ?? "",
      category: a.category ?? "",
      image: mediaUrl(a.image, ""),
      imageAlt: mediaAlt(a.image, `${a.name ?? ""}, ${a.year ?? ""}`),
    })),

    isoAward: {
      title: str(recognition.isoTitle, f.isoAward.title),
      claim: str(recognition.isoClaim, f.isoAward.claim),
      body: str(recognition.isoBody, f.isoAward.body),
    },

    commitment: {
      eyebrow: str(commitment.eyebrow, f.commitment.eyebrow),
      title: str(commitment.title, f.commitment.title),
      accent: str(commitment.accent, f.commitment.accent),
      intro: str(commitment.intro, f.commitment.intro),
      items: list(commitment.items, f.commitment.items).map((i: any) => ({
        name: i.name ?? "",
        body: i.body ?? "",
        caption: i.caption ?? "",
        image: mediaUrl(i.image, ""),
        imageAlt: mediaAlt(i.image, i.caption ?? i.name ?? ""),
      })),
    },

    policies: list(governance.items, f.policies).map((p: any) => ({
      name: p.name ?? "",
      group: p.group ?? "",
      href: p.href || mediaUrl(p.file, ""),
    })),

    films: list(films.items, f.films).map((v: any) => ({
      title: v.title ?? "",
      body: v.body ?? "",
      year: v.year ?? "",
      url: v.url ?? "",
      poster: mediaUrl(v.poster, fbImages.film.get(v.title)?.url ?? ""),
      posterAlt: mediaAlt(
        v.poster,
        v.posterAlt ?? fbImages.film.get(v.title)?.alt ?? v.title ?? "",
      ),
      languages: Array.isArray(v.languages) ? v.languages : [],
    })),

    close: {
      title: str(cta.title, f.close.title),
      accent: str(cta.accent, f.close.accent),
      links: list(cta.links, f.close.links).map((l: any) => ({
        label: l.label ?? "",
        href: l.href ?? "#",
        primary: Boolean(l.primary),
      })),
    },

    headings: {
      values: {
        eyebrow: str(valuesBlock.eyebrow, f.headings.values.eyebrow),
        title: str(valuesBlock.title, f.headings.values.title),
      },
      timeline: {
        eyebrow: str(timeline.eyebrow, f.headings.timeline.eyebrow),
        title: str(timeline.title, f.headings.timeline.title),
        hint: str(timeline.hint, f.headings.timeline.hint),
      },
      group: {
        eyebrow: str(group.eyebrow, f.headings.group.eyebrow),
        title: str(group.title, f.headings.group.title),
        body: str(group.body, f.headings.group.body),
        chainLabel: str(group.chainLabel, f.headings.group.chainLabel),
      },
      recognition: {
        eyebrow: str(recognition.eyebrow, f.headings.recognition.eyebrow),
        title: str(recognition.title, f.headings.recognition.title),
      },
      governance: {
        eyebrow: str(governance.eyebrow, f.headings.governance.eyebrow),
        title: str(governance.title, f.headings.governance.title),
        body: str(governance.body, f.headings.governance.body),
      },
      films: {
        eyebrow: str(films.eyebrow, f.headings.films.eyebrow),
        title: str(films.title, f.headings.films.title),
        body: str(films.body, f.headings.films.body),
      },
    },

    sections: f.sections,
  };
}
