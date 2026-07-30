/**
 * Inyecta el filtro por empresa en los listados, para que el alcance no dependa
 * de que el cliente lo pida. Si el usuario tiene empresa asignada, el filtro se
 * aplica aunque sea administrador; con alcance global no se toca la consulta.
 *
 * Se configura por ruta con la relacion que lleva a la empresa:
 *
 *   { name: 'global::acota-por-empresa', config: { relacion: 'empresa' } }   // users
 *   { name: 'global::acota-por-empresa', config: { relacion: null } }        // empresas
 *   { name: 'global::acota-por-empresa', config: { relacion: 'empresas' } }  // capacitaciones
 */

import { cargarConAlcance, empresaDe } from '../utils/alcance';

export default (config: { relacion?: string | null }, { strapi }: any) => {
  return async (ctx: any, next: any) => {
    const autenticado = ctx.state?.user;
    if (!autenticado) return next();

    const solicitante = await cargarConAlcance(strapi, autenticado.id);
    const alcance = empresaDe(solicitante);
    if (!alcance) return next();

    const { relacion } = config ?? {};

    // Se escribe despues de los filtros del cliente para que no pueda anularlo.
    // Las claves de primer nivel se combinan con AND, asi que acota siempre.
    const condicion = relacion
      ? { [relacion]: { documentId: { $eq: alcance } } }
      : { documentId: { $eq: alcance } };

    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query?.filters as Record<string, unknown>),
        ...condicion,
      },
    };

    return next();
  };
};
