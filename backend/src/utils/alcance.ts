/**
 * Reglas de alcance compartidas por policies y middlewares.
 *
 * La empresa asignada acota los datos que un usuario puede ver o gestionar, y lo
 * hace tambien cuando es administrador. Solo un administrador SIN empresa
 * conserva alcance global.
 */

export const ROL_ADMINISTRADOR = 'administrador';

export interface UsuarioConAlcance {
  id: number;
  documentId?: string;
  rol?: { nombre?: string | null } | null;
  empresa?: { documentId?: string | null } | null;
}

export const esAdministrador = (usuario?: UsuarioConAlcance | null): boolean =>
  usuario?.rol?.nombre?.toLowerCase() === ROL_ADMINISTRADOR;

/** documentId de la empresa que acota al usuario, o null si su alcance es global. */
export const empresaDe = (usuario?: UsuarioConAlcance | null): string | null =>
  usuario?.empresa?.documentId ?? null;

/**
 * Carga un usuario con las relaciones que definen su alcance. ctx.state.user solo
 * trae el rol de Strapi, no las relaciones propias "rol" y "empresa".
 */
export const cargarConAlcance = async (
  strapi: any,
  id: number
): Promise<UsuarioConAlcance | null> => {
  if (!id) return null;

  return strapi.db.query('plugin::users-permissions.user').findOne({
    where: { id },
    populate: { rol: true, empresa: true },
  });
};

/**
 * Resuelve el nombre de un rol a partir de como lo manda el cliente: un id
 * numerico, una cadena, o un objeto con id/documentId.
 */
export const nombreDelRol = async (strapi: any, referencia: any): Promise<string | null> => {
  if (referencia === null || referencia === undefined) return null;

  const valor = typeof referencia === 'object' ? referencia.id ?? referencia.documentId : referencia;
  if (valor === null || valor === undefined) return null;

  const where = Number.isNaN(Number(valor)) ? { documentId: String(valor) } : { id: Number(valor) };
  const rol = await strapi.db.query('api::rol.rol').findOne({ where });

  return rol?.nombre ?? null;
};
