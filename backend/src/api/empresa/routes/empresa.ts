/**
 * empresa router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::empresa.empresa', {
  config: {
    // Con empresa asignada solo se lista la propia; sin ella, todas.
    find: {
      middlewares: [{ name: 'global::acota-por-empresa', config: { relacion: null } }],
    },
  },
});
