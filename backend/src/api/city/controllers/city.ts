/**
 * city controller
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::city.city', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: { district: { fields: ['slug', 'name'] } },
      sort: ['sortOrder:asc', 'name:asc'],
    };
    return await super.find(ctx);
  },
}));
