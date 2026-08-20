/**
 * agent controller
 *
 * Agents are looked up by district (and optionally city) as the customer
 * narrows their location, so the list is always filtered server-side rather
 * than shipped whole to the browser.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::agent.agent', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        district: { fields: ['slug', 'name'] },
        city: { fields: ['slug', 'name'] },
      },
      sort: ['sortOrder:asc', 'name:asc'],
    };
    return await super.find(ctx);
  },
}));
