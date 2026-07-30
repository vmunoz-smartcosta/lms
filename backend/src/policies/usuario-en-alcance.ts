/**
 * Restringe GET /api/users/:id a usuarios dentro del alcance de quien consulta.
 *
 * El filtro por empresa del listado no sirve aqui, porque findOne resuelve por
 * id: sin esta comprobacion, un administrador acotado podria leer a cualquiera
 * probando ids.
 */

import { cargarConAlcance, empresaDe } from '../utils/alcance';

export default async (policyContext: any, _config: any, { strapi }: any) => {
  const autenticado = policyContext.state?.user;
  if (!autenticado) return false;

  const solicitante = await cargarConAlcance(strapi, autenticado.id);
  const alcance = empresaDe(solicitante);

  // Alcance global: sin restriccion adicional.
  if (!alcance) return true;

  const idObjetivo = Number(policyContext.params?.id);
  if (!idObjetivo) return false;

  // Consultarse a uno mismo siempre esta permitido.
  if (idObjetivo === autenticado.id) return true;

  const objetivo = await cargarConAlcance(strapi, idObjetivo);
  if (!objetivo) return false;

  return empresaDe(objetivo) === alcance;
};
