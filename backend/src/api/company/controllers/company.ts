/**
 * company controller
 *
 * The whole page comes back in one request. Components are not auto-populated,
 * so every nested list and media field is named explicitly — add here when you
 * add a field to the schema, or it will silently arrive as null.
 */
import { factories } from '@strapi/strapi';

const populate = {
  seo: { populate: ['shareImage'] },
  intro: true,
  stats: true,
  reach: { populate: { sites: true, routes: true } },
  mission: { populate: { points: true } },
  valuesBlock: { populate: { items: true } },
  timeline: { populate: { eras: true, items: true } },
  group: {
    populate: {
      items: { populate: { image: true, facts: true } },
      chain: true,
    },
  },
  recognition: { populate: { items: { populate: { image: true } } } },
  commitment: { populate: { items: { populate: { image: true } } } },
  governance: { populate: { items: { populate: { file: true } } } },
  films: { populate: { items: { populate: { poster: true, languages: true } } } },
  cta: { populate: { links: true } },
};

export default factories.createCoreController('api::company.company', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, populate };
    return await super.find(ctx);
  },
}));
