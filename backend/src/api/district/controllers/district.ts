/**
 * district controller
 *
 * Deep-populates the price rows with the product each one points at, so the
 * frontend can build a district -> size -> price lookup in one request.
 */
import { factories } from '@strapi/strapi';

const populate = { prices: { populate: { product: true } } };

export default factories.createCoreController('api::district.district', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, populate, sort: ['sortOrder:asc', 'name:asc'] };
    return await super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query = { ...ctx.query, populate };
    return await super.findOne(ctx);
  },
}));
