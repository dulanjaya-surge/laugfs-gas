/**
 * Shop seed — cylinder sizes, delivery districts and the district price list.
 *
 * Prices are the client's published district-wise refill price list. They are
 * seeded once; after that the CMS is the source of truth, so a price revision
 * is made in Strapi and never here.
 */
import type { Core } from '@strapi/strapi';

const PRODUCT_UID = 'api::product.product';
const DISTRICT_UID = 'api::district.district';
const CITY_UID = 'api::city.city';
const AGENT_UID = 'api::agent.agent';

// Cylinder sizes. `key` ties a product to its column in the price table below.
const products = [
  {
    key: '2kg',
    name: '2kg Cylinder',
    slug: '2kg-cylinder',
    weightKg: 2,
    weightLabel: '2kg',
    tagline: 'Portable and light',
    useCase: 'Small households, portable cookers and travel',
    description:
      'The lightest cylinder in the range. Easy to carry, and sized for single-burner cookers, small kitchens and trips away from home.',
    sortOrder: 1,
  },
  {
    key: '5kg',
    name: '5kg Cylinder',
    slug: '5kg-cylinder',
    weightKg: 5,
    weightLabel: '5kg',
    tagline: 'For smaller kitchens',
    useCase: 'Couples, small families and secondary kitchens',
    description:
      'A middle size that lasts a small household several weeks, while staying light enough for one person to carry and change.',
    sortOrder: 2,
  },
  {
    key: '12.5kg',
    name: '12.5kg Domestic Cylinder',
    slug: '12-5kg-domestic-cylinder',
    weightKg: 12.5,
    weightLabel: '12.5kg',
    tagline: 'The household standard',
    useCase: 'The everyday cylinder for a family kitchen',
    description:
      'The cylinder found in most Sri Lankan kitchens. Pressure-tested, sealed and inspected before it leaves the plant, and delivered through a dealer network reaching every district.',
    sortOrder: 3,
  },
  {
    key: '37.5kg',
    name: '37.5kg Industrial Cylinder',
    slug: '37-5kg-industrial-cylinder',
    weightKg: 37.5,
    weightLabel: '37.5kg',
    tagline: 'Built for continuous use',
    useCase: 'Hotels, restaurants, bakeries and industrial plants',
    description:
      'The largest cylinder in the range, for kitchens and plants that run all day and cannot afford to change a cylinder mid-service.',
    sortOrder: 4,
  },
];

// District-wise refill prices, in rupees: [12.5kg, 5kg, 2kg, 37.5kg] — the
// column order of the client's published table.
const priceTable: Array<[string, number, number, number, number]> = [
  ['Colombo', 4965, 1988, 795, 19000],
  ['Gampaha', 4965, 1988, 795, 19000],
  ['Kalutara', 5026, 2023, 810, 19051],
  ['Kandy', 5088, 2061, 824, 19249],
  ['Matale', 5114, 2077, 835, 19277],
  ['Nuwara Eliya', 5184, 2119, 850, 19486],
  ['Batticaloa', 5265, 2168, 867, 19611],
  ['Trincomalee', 5191, 2124, 852, 19413],
  ['Ampara', 5310, 2195, 878, 19622],
  ['Jaffna', 5336, 2210, 888, 19668],
  ['Mannar', 5218, 2140, 856, 19571],
  ['Mullaitivu', 5268, 2169, 868, 19594],
  ['Vavuniya', 5218, 2140, 856, 19520],
  ['Anuradhapura', 5149, 2098, 840, 19395],
  ['Polonnaruwa', 5132, 2088, 835, 19395],
  ['Kurunegala', 5054, 2042, 820, 19164],
  ['Puttalam', 5052, 2040, 816, 19148],
  ['Ratnapura', 5078, 2056, 826, 19192],
  ['Kegalle', 5007, 2013, 805, 19170],
  ['Galle', 5064, 2047, 820, 19192],
  ['Matara', 5096, 2066, 827, 19271],
  ['Hambantota', 5150, 2098, 840, 19413],
  ['Badulla', 5252, 2160, 866, 19520],
  ['Monaragala', 5249, 2158, 867, 19599],
  ['Kilinochchi', 5268, 2170, 868, 19599],
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// One city per district to begin with, so the finder works out of the box.
// The client adds the towns they actually cover in Strapi.
const seedCities = priceTable.map(([district]) => district);

export async function seedShop(strapi: Core.Strapi) {
  // ---- Products -----------------------------------------------------------
  const bySlug = new Map<string, any>();
  for (const p of products) {
    const { key, ...data } = p;
    let doc = await strapi.documents(PRODUCT_UID).findFirst({ filters: { slug: data.slug } });
    if (!doc) {
      doc = await strapi.documents(PRODUCT_UID).create({ data: { ...data, active: true } as any });
      await strapi.documents(PRODUCT_UID).publish({ documentId: doc.documentId });
      strapi.log.info(`[seed] Product ${data.name} created.`);
    }
    bySlug.set(key, doc);
  }

  // ---- Districts + their price rows ---------------------------------------
  for (const [i, row] of priceTable.entries()) {
    const [name, p125, p5, p2, p375] = row;
    const slug = slugify(name);
    const existing = await strapi.documents(DISTRICT_UID).findFirst({ filters: { slug } });
    if (existing) continue;

    // Same column order as the table, mapped back to the right product.
    const prices = [
      { product: bySlug.get('2kg')?.documentId, price: p2 },
      { product: bySlug.get('5kg')?.documentId, price: p5 },
      { product: bySlug.get('12.5kg')?.documentId, price: p125 },
      { product: bySlug.get('37.5kg')?.documentId, price: p375 },
    ].filter((r) => r.product);

    const doc = await strapi.documents(DISTRICT_UID).create({
      data: { name, slug, prices, sortOrder: i + 1, active: true } as any,
    });
    await strapi.documents(DISTRICT_UID).publish({ documentId: doc.documentId });
  }
  strapi.log.info(`[seed] Districts ensured (${priceTable.length}).`);

  // ---- Cities (one per district to start; the client adds their towns) ----
  for (const [i, name] of seedCities.entries()) {
    const slug = slugify(name);
    const existing = await strapi.documents(CITY_UID).findFirst({ filters: { slug } });
    if (existing) continue;
    const district = await strapi
      .documents(DISTRICT_UID)
      .findFirst({ filters: { slug: slugify(name) } });
    const doc = await strapi.documents(CITY_UID).create({
      data: { name, slug, district: district?.documentId, sortOrder: i + 1, active: true } as any,
    });
    await strapi.documents(CITY_UID).publish({ documentId: doc.documentId });
  }
  strapi.log.info(`[seed] Cities ensured (${seedCities.length}).`);
}

/**
 * Sample agents, off by default.
 *
 * Real dealer names, addresses and phone numbers are the client's data — this
 * seed must not invent business records that could be mistaken for genuine.
 * Set SEED_SAMPLE_AGENTS=true in .env to load obviously-labelled placeholders
 * for working on the page, then delete them in Strapi.
 */
export async function seedSampleAgents(strapi: Core.Strapi) {
  if (process.env.SEED_SAMPLE_AGENTS !== 'true') return;

  const samples = [
    { district: 'Colombo', name: 'SAMPLE — Borella Gas Centre', addressLine: 'Sample address, Borella, Colombo 08', hours: '8.00am – 7.00pm, daily' },
    { district: 'Colombo', name: 'SAMPLE — Wellawatte Gas Depot', addressLine: 'Sample address, Wellawatte, Colombo 06', hours: '8.30am – 6.30pm, Mon–Sat' },
    { district: 'Gampaha', name: 'SAMPLE — Negombo Road Dealers', addressLine: 'Sample address, Gampaha', hours: '8.00am – 6.00pm, daily' },
    { district: 'Kandy', name: 'SAMPLE — Peradeniya Road Agencies', addressLine: 'Sample address, Kandy', hours: '8.00am – 6.00pm, Mon–Sat' },
  ];

  for (const [i, a] of samples.entries()) {
    const exists = await strapi.documents(AGENT_UID).findFirst({ filters: { name: a.name } });
    if (exists) continue;
    const slug = slugify(a.district);
    const district = await strapi.documents(DISTRICT_UID).findFirst({ filters: { slug } });
    const city = await strapi.documents(CITY_UID).findFirst({ filters: { slug } });
    const doc = await strapi.documents(AGENT_UID).create({
      data: {
        name: a.name,
        addressLine: a.addressLine,
        phone: '+94 11 5 566 222', // the public hotline, not an invented number
        hours: a.hours,
        district: district?.documentId,
        city: city?.documentId,
        deliversHome: true,
        sortOrder: i + 1,
        active: true,
      } as any,
    });
    await strapi.documents(AGENT_UID).publish({ documentId: doc.documentId });
  }
  strapi.log.warn('[seed] SAMPLE agents loaded (SEED_SAMPLE_AGENTS=true). Delete them before launch.');
}

export const SHOP_PUBLIC_ACTIONS = [
  `${CITY_UID}.find`,
  `${CITY_UID}.findOne`,
  `${AGENT_UID}.find`,
  `${AGENT_UID}.findOne`,
  `${PRODUCT_UID}.find`,
  `${PRODUCT_UID}.findOne`,
  `${DISTRICT_UID}.find`,
  `${DISTRICT_UID}.findOne`,
];
