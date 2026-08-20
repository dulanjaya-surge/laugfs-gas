/**
 * One-time link migration for the Global record.
 *
 * The nav and footer were seeded before the Company and Refill pages existed,
 * so their hrefs are in-page anchors that now point nowhere useful. This
 * rewrites those specific old values and leaves anything the client has since
 * edited alone.
 */
import type { Core } from '@strapi/strapi';

const GLOBAL_UID = 'api::global.global';

// Keyed by label, because the same old href ("#story") belongs in two
// different places now.
const NAV_HREFS: Record<string, string> = {
  INVESTORS: '/#investors',
  COMPANY: '/company',
  BUSINESS: '/#capabilities',
  SAFETY: '/#safety',
  MEDIA: '/company#films',
};

const FOOTER_HREFS: Record<string, string> = {
  'Investor relations': '/#investors',
  'Financial information': '/#investors',
  'Annual reports': '/company#recognition',
  'Share price & events': '/#investors',
  'At a glance': '/company#numbers',
  'Our story': '/company#timeline',
  Subsidiaries: '/company#companies',
  'Media releases': '/company#films',
  Domestic: '/refill',
  'Industrial and bulk': '/#capabilities',
  'Specialty services': '/refill#agents',
  Safety: '/#safety',
};

const SOCIAL = [
  { label: 'Facebook', href: 'https://www.facebook.com/LaugfsGasPLC' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/laugfs-gas-plc' },
  { label: 'Privacy', href: '/company#governance' },
];

/** Only rewrite links that are still the original in-page anchors. */
const stale = (href: unknown) => typeof href === 'string' && href.startsWith('#');

export async function migrateGlobalLinks(strapi: Core.Strapi) {
  const global: any = await strapi.documents(GLOBAL_UID).findFirst({
    populate: { navLinks: true, socialLinks: true, footerColumns: { populate: ['links'] } },
  });
  if (!global) return;

  const data: any = {};
  let changed: string[] = [];

  const nav = (global.navLinks ?? []).map((l: any) =>
    stale(l.href) && NAV_HREFS[l.label]
      ? { label: l.label, href: NAV_HREFS[l.label] }
      : { label: l.label, href: l.href },
  );
  if (JSON.stringify(nav) !== JSON.stringify((global.navLinks ?? []).map((l: any) => ({ label: l.label, href: l.href })))) {
    data.navLinks = nav;
    changed.push('navLinks');
  }

  const columns = (global.footerColumns ?? []).map((col: any) => ({
    title: col.title,
    links: (col.links ?? []).map((l: any) =>
      stale(l.href) && FOOTER_HREFS[l.label]
        ? { label: l.label, href: FOOTER_HREFS[l.label] }
        : { label: l.label, href: l.href },
    ),
  }));
  const before = (global.footerColumns ?? []).map((col: any) => ({
    title: col.title,
    links: (col.links ?? []).map((l: any) => ({ label: l.label, href: l.href })),
  }));
  if (JSON.stringify(columns) !== JSON.stringify(before)) {
    data.footerColumns = columns;
    changed.push('footerColumns');
  }

  if (!global.socialLinks || global.socialLinks.length === 0) {
    data.socialLinks = SOCIAL;
    changed.push('socialLinks');
  }
  if (!global.copyright) {
    data.copyright = `© ${new Date().getFullYear()} LAUGFS Gas PLC. All rights reserved.`;
    changed.push('copyright');
  }
  if (!global.exchangeNote) {
    data.exchangeNote = 'Colombo Stock Exchange — LGL.N0000';
    changed.push('exchangeNote');
  }

  if (changed.length === 0) return;
  await strapi.documents(GLOBAL_UID).update({ documentId: global.documentId, data });
  await strapi.documents(GLOBAL_UID).publish({ documentId: global.documentId });
  strapi.log.info(`[seed] Global links migrated: ${changed.join(', ')}`);
}
