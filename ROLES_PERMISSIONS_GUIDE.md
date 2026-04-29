# 🛡️ Guía de Roles y Permisos - LMS Smart Costa

Esta guía detalla la configuración necesaria en el panel de administración de Strapi para que el Frontend funcione correctamente.

## 1. Roles Requeridos (Settings > Users & Permissions Plugin > Roles)

Debe existir un rol con el nombre exacto **"Administrador"** (el sistema no distingue mayúsculas/minúsculas).

### 2. Configuración de Permisos por Rol

#### A. Rol: Public
Este rol se usa para usuarios no autenticados (Registro y Login).
- **Auth**: `register`, `callback`, `login`
- **Solicitud**: `create` (Permite que el usuario cree su solicitud al registrarse)

#### B. Rol: Authenticated (Usuario Estándar/Estudiante)
Asigna estos permisos para que el usuario pueda ver sus cursos:
- **Capacitacion**: `find`, `findOne`
- **Contenido**: `find`, `findOne`
- **Empresa**: `find`, `findOne` (Solo lectura de su propia empresa)
- **Solicitud**: `find`, `findOne` (Para verificar su estado de aprobación)
- **Users-Permissions (User)**: `me` (Fundamental para el AuthContext)

#### C. Rol: Administrador
- Acceso total (`find`, `findOne`, `create`, `update`, `delete`) a todas las APIs.

## 3. Estados de Usuario en el Frontend
El acceso en el React se determina por la lógica de **AuthContext.tsx**:
1. **Admin**: Si el nombre del rol es "Administrador".
2. **Authenticated**: Si el usuario tiene una `empresa` asignada Y su `solicitud.aprobado` es `true`.
3. **Pending Approval**: Si el usuario está logueado pero no cumple los requisitos anteriores.

---

## 🚀 Optimización de Base de Datos (PostgreSQL)
El sistema ha sido configurado para instancias de baja capacidad:
- **Límite de RAM**: 256MB.
- **Shared Buffers**: 64MB (Optimizado para poca memoria).
- **Conexiones**: Máximo 20 (Para evitar saturar la CPU).
- **WAL Mode**: Activado por defecto en Postgres para mejor concurrencia.
