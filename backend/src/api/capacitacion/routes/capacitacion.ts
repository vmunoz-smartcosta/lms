/**
 * capacitacion router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::capacitacion.capacitacion', {
  config: {
    // Solo las capacitaciones vinculadas a la empresa del usuario.
    find: {
      middlewares: [{ name: 'global::acota-por-empresa', config: { relacion: 'empresas' } }],
    },
  },
});
