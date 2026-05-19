# 🛡️ Guía de Roles y Permisos - LMS Smart Costa

Esta guía detalla la configuración necesaria en el panel de administración de Strapi para que el Frontend funcione correctamente.

## 1. Roles de la Aplicación (Colección Personalizada `rol`)
El administrador puede asignar estos roles a los usuarios desde la vista de gestión de usuarios:
- **Administrador**: Acceso total al panel y todas las secciones.
- **Cliente**: Usuario final/estudiante de una empresa cliente.
- **Partner**: Socios estratégicos u organizaciones asociadas.
- **Colaborador**: Personal interno de la organización o instructores.

---

## 2. Configuración de Permisos por Rol de Seguridad (Settings > Users & Permissions Plugin > Roles)

### A. Rol: Public
Este rol se usa para usuarios no autenticados (Registro y Login).
- **Auth**: `register`, `callback`, `login`
- **Solicitud**: `create` (Permite que el usuario cree su solicitud al registrarse)

### B. Rol: Authenticated (Para Cliente, Partner y Colaborador)
Asigna estos permisos en Strapi para que los usuarios autenticados puedan acceder a sus cursos:
- **Capacitacion**: `find`, `findOne`
- **Contenido**: `find`, `findOne`
- **Empresa**: `find`, `findOne` (Solo lectura de su propia empresa)
- **Solicitud**: `find`, `findOne` (Para verificar su estado de aprobación)
- **Users-Permissions (User)**: `me` (Fundamental para el AuthContext)

### C. Rol: Administrador
- Acceso total (`find`, `findOne`, `create`, `update`, `delete`) a todas las APIs.

---

## 3. Estados de Usuario en el Frontend
El acceso en el React se determina en **AuthContext.tsx** según el rol de la aplicación asignado:
1. **Admin**: Si el nombre de su rol (`user.rol.nombre`) es "Administrador".
2. **Authenticated**: Si el usuario tiene un rol asignado (ej. "Cliente", "Partner", "Colaborador"), tiene una `empresa` asignada Y su `solicitud.aprobado` es `true`.
3. **Pending Approval**: Si el usuario está logueado pero no cumple con los requisitos anteriores (esperando asignación de rol/empresa y aprobación del administrador).

### 📖 Filtro de Capacitaciones
Para los usuarios autenticados ordinarios (no administradores), el frontend filtra dinámicamente el listado de capacitaciones según dos criterios relacionales en Strapi:
- **Empresa**: `filters[empresas][documentId][$eq]=user.empresa.documentId`
- **Rol de la Aplicación**: `filters[rols][documentId][$eq]=user.rol.documentId`

Esto asegura que un usuario pertenezca tanto a la empresa asignada como al rol específico exigido por la capacitación (por ejemplo, capacitaciones destinadas solo a "Partner" de "Empresa X").

---

## 🚀 Optimización de Base de Datos (PostgreSQL)
El sistema ha sido configurado para instancias de baja capacidad:
- **Límite de RAM**: 256MB.
- **Shared Buffers**: 64MB (Optimizado para poca memoria).
- **Conexiones**: Máximo 20 (Para evitar saturar la CPU).
- **WAL Mode**: Activado por defecto en Postgres para mejor concurrencia.
