import type { Core } from '@strapi/strapi';
import { seedShop, seedSampleAgents, SHOP_PUBLIC_ACTIONS } from './seed/shop';

const PAGE_UID = 'api::page.page';
const GLOBAL_UID = 'api::global.global';

// Site-wide content (nav + footer + default SEO), shared on every page.
const globalSeed = {
  defaultSeo: {
    metaTitle: 'LAUGFS Gas',
    metaDescription:
      'LAUGFS Gas PLC supplies LP Gas across Sri Lanka and operates the largest LPG transshipment terminal in South Asia.',
    noindex: true,
  },
  navLinks: [
    { label: 'INVESTORS', href: '#investors' },
    { label: 'COMPANY', href: '#story' },
    { label: 'BUSINESS', href: '#capabilities' },
    { label: 'SAFETY', href: '#safety' },
    { label: 'MEDIA', href: '#media' },
  ],
  footerColumns: [
    {
      title: 'INVESTORS',
      links: [
        { label: 'Investor relations', href: '#investors' },
        { label: 'Financial information', href: '#investors' },
        { label: 'Annual reports', href: '#investors' },
        { label: 'Share price & events', href: '#investors' },
      ],
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'At a glance', href: '#capabilities' },
        { label: 'Our story', href: '#story' },
        { label: 'Subsidiaries', href: '#maritime' },
        { label: 'Media releases', href: '#media' },
      ],
    },
    {
      title: 'BUSINESS & SUPPORT',
      links: [
        { label: 'Domestic', href: '#capabilities' },
        { label: 'Industrial and bulk', href: '#capabilities' },
        { label: 'Specialty services', href: '#capabilities' },
        { label: 'Safety', href: '#safety' },
      ],
    },
  ],
  footerAddress: '101, Maya Avenue, Colombo 06, Sri Lanka',
  footerPhone: 'Tel +94 11 5 566 222',
  footerFax: 'Fax +94 11 5 577 824',
};

// The home page, composed from section blocks in the dynamic zone. Media fields
// are left empty — the frontend falls back to the bundled default images.
// Typed as any[] so the literal `__component` strings satisfy the generated
// dynamic-zone union.
const homeSections: any[] = [
  {
    __component: 'sections.hero',
    title: 'Every cylinder is a unit of energy security.',
    accent: 'security',
    videoUrl: 'https://www.youtube.com/watch?v=cOwGuBiRu0A',
    lede: 'LAUGFS Gas PLC supplies LP Gas across Sri Lanka and operates the largest LPG transshipment terminal in South Asia, with its own fleet serving the Indian Ocean Rim.',
    phone: 'Tel +94 11 5 566 222',
    address: '101, Maya Avenue, Colombo 06',
  },
  {
    __component: 'sections.capabilities',
    heading: { heading: 'Three ways we reach every corner.', accent: 'every' },
    intro: 'From household kitchens to industrial plants and the ships that supply them, LP Gas moves through three connected lines of business.',
    statValue: '1.4M',
    statLabel: 'households served each year',
    items: [
      { title: 'Domestic', number: '01', href: '#energy', body: '2.3kg to 37.5kg cylinders delivered through a nationwide dealer network.' },
      { title: 'Industrial & bulk', number: '02', href: '#energy', body: 'Bulk supply, storage and reticulation for plants, hotels and factories.' },
      { title: 'Maritime', number: '03', href: '#maritime', body: 'A fleet of gas carriers moving LP Gas across regional trade routes.' },
    ],
  },
  {
    __component: 'sections.energy',
    heading: { heading: 'Energy that keeps a nation running.', accent: 'nation' },
    body: 'From the kitchens of ten thousand households to the industrial plants that keep production lines moving, LP Gas is the constant behind it.',
  },
  {
    __component: 'sections.numbers',
    heading: { eyebrow: 'BY THE NUMBERS', heading: 'The scale behind the supply.', accent: 'supply' },
    stats: [
      { number: '01', value: '30,000', unit: 'MT', label: 'TERMINAL STORAGE', body: 'Hambantota terminal capacity, the largest in the region.' },
      { number: '02', value: '10,000', unit: '+', label: 'DEALERS ISLAND WIDE', body: 'A distribution network reaching every district.' },
      { number: '03', value: '2001', unit: '', label: 'OPERATIONS BEGAN', body: 'Two decades supplying homes and industry in Sri Lanka.' },
      { number: '04', value: '3', unit: 'vessels', label: 'GAS CARRIERS AT SEA', body: 'Own fleet moving LPG across the Indian Ocean.' },
    ],
  },
  {
    __component: 'sections.product',
    heading: { eyebrow: 'THE CYLINDER', heading: 'Built for the kitchens of a nation.', accent: 'nation' },
    note: 'Pressure-tested, sealed and inspected before it leaves the plant.',
    specs: [
      { value: '12.5', unit: 'kg', label: 'DOMESTIC CYLINDER' },
      { value: '37.5', unit: 'kg', label: 'INDUSTRIAL CYLINDER' },
      { value: '10,000+', unit: '', label: 'DEALERS ISLAND WIDE' },
      { value: '26', unit: '', label: 'REGIONAL DISTRIBUTORS' },
    ],
  },
  {
    __component: 'sections.safety',
    heading: { eyebrow: 'SAFETY', heading: 'LP Gas is safe when it is handled properly.', accent: 'handled' },
    intro: 'Three habits cover almost every household risk. Keep them, and keep the hotline number where the family can find it.',
    hotline: '+94 11 5 566 222',
    tips: [
      { number: '01', title: 'Store it upright', body: 'Keep the cylinder standing on a firm, level surface in a ventilated space, away from drains and basements.' },
      { number: '02', title: 'Check the fittings', body: 'Use approved hoses and regulators, replace ageing parts, and never test for a leak with a flame.' },
      { number: '03', title: 'If you smell gas', body: 'Close the valve, open doors and windows, avoid switches and flames, and leave the area.' },
    ],
  },
  {
    __component: 'sections.maritime',
    heading: { eyebrow: 'MARITIME & LOGISTICS', heading: "Three ships carry the region's LP Gas.", accent: 'LP Gas' },
    intro: 'LAUGFS Maritime Services provides ocean freight and logistics to the LPG downstream industry across South and South-East Asia, on its own fleet.',
    linkLabel: 'LAUGFSMARITIME.COM →',
    vessels: [
      { number: '01', title: 'Gas Challenger', body: 'Regional LPG carrier serving the Indian Ocean Rim trade.' },
      { number: '02', title: 'Gas Success', body: 'Feeds the Hambantota terminal and downstream demand.' },
      { number: '03', title: 'Gas Courage', body: 'Ocean freight for South and South-East Asian routes.' },
    ],
  },
  {
    __component: 'sections.story',
    heading: "From a humble start to the country's second LPG downstream player.",
    bodyOne: 'In the year 2001, when the government of Sri Lanka decided to liberalize the LPG industry, LAUGFS Gas commenced its operations as a limited liability company in a humble way with an intention of becoming the second fully fledged LPG downstream player in Sri Lanka.',
    bodyTwo: 'The remarkable growth story of LAUGFS Gas was fuelled by a relentless pursuit for success, a pioneering vision and an unyielding commitment to quality and service excellence, that have made LAUGFS a household brand synonymous with trust.',
    badgeValue: '45,000MT',
    badgeLabel: 'TERMINAL EXTENSION UNDERWAY',
  },
  {
    __component: 'sections.investors',
    heading: { eyebrow: 'INVESTOR RELATIONS', heading: 'Every unit of energy is also a unit of return.', accent: 'return' },
    intro: 'Keep up to date with our share prices and upcoming events. Read our recent and archived releases, first half results, annual reports, presentations, publications and financial statements.',
    reports: [
      { title: 'Annual Report 2024/25', sub: 'Full year performance and governance', tag: 'PDF' },
      { title: 'Annual Report 2023/24', sub: 'Previous financial year, archived', tag: 'PDF' },
      { title: 'Quarterly financial statements', sub: 'Interim results, updated each quarter', tag: 'WEB' },
      { title: 'Releases & presentations', sub: 'Announcements and investor decks', tag: 'ARCHIVE' },
    ],
  },
  {
    __component: 'sections.media',
    heading: 'Media centre',
    cards: [
      { tag: 'INVESTOR', title: 'Annual Report 2024/25 published', foot: 'PDF' },
      { tag: 'MEDIA RELEASE', title: 'Latest company announcements and press coverage', foot: 'MEDIA CENTRE' },
      { tag: 'CONSUMER', title: 'District-wise domestic refill price list', foot: 'PRICES' },
    ],
  },
];

async function seedSingleType(strapi: Core.Strapi, uid: any, data: any, label: string) {
  const existing = await strapi.documents(uid).findFirst();
  if (existing) return;
  const created = await strapi.documents(uid).create({ data });
  await strapi.documents(uid).publish({ documentId: created.documentId });
  strapi.log.info(`[seed] ${label} created and published.`);
}

async function grantPublicRead(strapi: Core.Strapi, actions: string[]) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;
  for (const action of actions) {
    const existing = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });
    if (!existing) {
      await strapi
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: publicRole.id } });
      strapi.log.info(`[seed] Granted Public role: ${action}`);
    }
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * On first run: seed the Global single type and the home Page, then grant the
   * Public role read access. Everything is idempotent (skips if already done).
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await seedSingleType(strapi, GLOBAL_UID, globalSeed, 'Global');

      const homeExists = await strapi
        .documents(PAGE_UID)
        .findFirst({ filters: { slug: 'home' } });
      if (!homeExists) {
        const created = await strapi.documents(PAGE_UID).create({
          data: {
            title: 'Home',
            slug: 'home',
            seo: {
              metaTitle: 'LAUGFS Gas — Every cylinder is a unit of energy security',
              metaDescription:
                'LAUGFS Gas PLC supplies LP Gas across Sri Lanka and operates the largest LPG transshipment terminal in South Asia.',
              noindex: true,
            },
            sections: homeSections,
          } as any,
        });
        await strapi.documents(PAGE_UID).publish({ documentId: created.documentId });
        strapi.log.info('[seed] Home page created and published.');
      }
    } catch (err) {
      strapi.log.error('[seed] Failed to seed content:');
      strapi.log.error(err);
    }

    try {
      await seedShop(strapi);
      await seedSampleAgents(strapi);
    } catch (err) {
      strapi.log.error('[seed] Failed to seed shop content:');
      strapi.log.error(err);
    }

    try {
      await grantPublicRead(strapi, [
        `${PAGE_UID}.find`,
        `${PAGE_UID}.findOne`,
        `${GLOBAL_UID}.find`,
        ...SHOP_PUBLIC_ACTIONS,
      ]);
    } catch (err) {
      strapi.log.warn('[seed] Could not auto-grant public read access — set it in Settings → Roles → Public.');
    }
  },
};
