/**
 * product controller
 *
 * Populates the cylinder image so a size can be rendered in one request.
 */
import { factories } from '@strapi/strapi';

const populate = { image: true };

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, populate, sort: ['sortOrder:asc', 'weightKg:asc'] };
    return await super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query = { ...ctx.query, populate };
    return await super.findOne(ctx);
  },
}));
