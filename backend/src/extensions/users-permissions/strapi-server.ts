/**
 * Aplica el alcance por empresa y la proteccion de administradores sobre las
 * rutas de usuarios del plugin users-permissions, que no admiten configuracion
 * desde src/api al pertenecer al plugin.
 */

export default (plugin: any) => {
  const rutas = plugin.routes['content-api'].routes as any[];

  const buscar = (handler: string, method: string) =>
    rutas.find((ruta) => ruta.handler === handler && ruta.method === method);

  const configurar = (
    ruta: any,
    { policies = [], middlewares = [] }: { policies?: any[]; middlewares?: any[] }
  ) => {
    if (!ruta) return;
    ruta.config = ruta.config ?? {};
    ruta.config.policies = [...(ruta.config.policies ?? []), ...policies];
    ruta.config.middlewares = [...(ruta.config.middlewares ?? []), ...middlewares];
  };

  configurar(buscar('user.find', 'GET'), {
    middlewares: [{ name: 'global::acota-por-empresa', config: { relacion: 'empresa' } }],
  });

  configurar(buscar('user.findOne', 'GET'), {
    policies: ['global::usuario-en-alcance'],
  });

  configurar(buscar('user.update', 'PUT'), {
    policies: ['global::gestiona-usuarios'],
  });

  return plugin;
};
