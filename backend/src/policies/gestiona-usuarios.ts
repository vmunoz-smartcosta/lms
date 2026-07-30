/**
 * Restringe PUT /api/users/:id.
 *
 * El controlador de users-permissions no comprueba propiedad, asi que con el
 * permiso "user.update" concedido al rol Authenticated cualquier usuario
 * autenticado podia modificar a cualquier otro, incluido asignarse el rol
 * administrador. Esta policy cierra esa via.
 *
 * Ante cualquier caso que no se pueda determinar con certeza, deniega.
 */

import {
  cargarConAlcance,
  empresaDe,
  esAdministrador,
  nombreDelRol,
  ROL_ADMINISTRADOR,
} from '../utils/alcance';

export default async (policyContext: any, _config: any, { strapi }: any) => {
  const autenticado = policyContext.state?.user;
  if (!autenticado) return false;

  const solicitante = await cargarConAlcance(strapi, autenticado.id);

  // Gestionar usuarios desde la API publica queda reservado a administradores.
  if (!esAdministrador(solicitante)) return false;

  const idObjetivo = Number(policyContext.params?.id);
  if (!idObjetivo) return false;

  const objetivo = await cargarConAlcance(strapi, idObjetivo);
  if (!objetivo) return false;

  // A un administrador no se le toca desde la aplicacion, solo desde el panel.
  if (esAdministrador(objetivo)) return false;

  const alcance = empresaDe(solicitante);
  const cuerpo = policyContext.request?.body ?? {};

  // Un administrador acotado solo gestiona usuarios de su propia empresa...
  if (alcance && empresaDe(objetivo) !== alcance) return false;

  // ...y no puede sacarlos de ella.
  if (alcance && cuerpo.empresa !== undefined) {
    const destino =
      typeof cuerpo.empresa === 'object'
        ? cuerpo.empresa?.documentId ?? cuerpo.empresa?.id
        : cuerpo.empresa;

    if (destino === null) return false;

    const empresaDestino = await strapi.db.query('api::empresa.empresa').findOne({
      where: Number.isNaN(Number(destino))
        ? { documentId: String(destino) }
        : { id: Number(destino) },
    });

    if (empresaDestino?.documentId !== alcance) return false;
  }

  // El rol administrador no se asigna nunca desde la API.
  if (cuerpo.rol !== undefined && cuerpo.rol !== null) {
    const nombre = await nombreDelRol(strapi, cuerpo.rol);
    if (!nombre) return false;
    if (nombre.toLowerCase() === ROL_ADMINISTRADOR) return false;
  }

  return true;
};
