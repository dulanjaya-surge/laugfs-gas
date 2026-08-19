/**
 * global controller
 */
import { factories } from '@strapi/strapi';

const populate = {
  defaultSeo: { populate: ['shareImage'] },
  logo: true,
  logoOnDark: true,
  favicon: true,
  navLinks: true,
  footerColumns: { populate: ['links'] },
};

export default factories.createCoreController('api::global.global', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, populate };
    return await super.find(ctx);
  },
}));
