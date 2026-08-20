/**
 * page controller
 *
 * Deep-populates the `sections` dynamic zone (per-component media + nested
 * components) so a page can be fetched in a single request.
 */
import { factories } from '@strapi/strapi';

const populate = {
  seo: { populate: ['shareImage'] },
  sections: {
    on: {
      'sections.hero': { populate: ['poster'] },
      'sections.capabilities': { populate: { heading: true, items: { populate: ['image'] } } },
      'sections.energy': { populate: ['heading'] },
      'sections.numbers': { populate: { heading: true, stats: true } },
      'sections.product': { populate: { heading: true, image: true, specs: true } },
      'sections.safety': { populate: { heading: true, tips: true } },
      'sections.maritime': { populate: { heading: true, image: true, vessels: true } },
      'sections.story': { populate: ['image'] },
      'sections.investors': { populate: { heading: true, reports: { populate: ['file'] } } },
      'sections.media': { populate: { cards: true } },
    },
  },
};

export default factories.createCoreController('api::page.page', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, populate };
    return await super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query = { ...ctx.query, populate };
    return await super.findOne(ctx);
  },
}));
