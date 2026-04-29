# 🚀 LMS Smart Costa - Guía de Instalación y Despliegue

Este proyecto contiene un backend desarrollado con **Strapi 5** y un frontend con **React**.

## 📋 Requisitos Previos
- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)

---

## 🚀 Configuración Recomendada de Memoria (SWAP)

Si tu instancia tiene 2GB de RAM o menos, es **obligatorio** configurar un archivo de intercambio (SWAP) de al menos 4GB para asegurar que Strapi pueda compilar correctamente.

```bash
# Desactivar swap actual si existe
sudo swapoff -a
sudo rm -f /swapfile

# Crear el nuevo swapfile de 4GB
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verificar configuración
free -h

# Hacerlo permanente (fstab)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Ajustar swappiness para servidor (uso óptimo)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

---

## 🛠️ Instalación Paso a Paso

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd lms
```

### 2. Configurar variables de entorno
Copia el archivo de ejemplo y ajusta los valores (especialmente las claves de Strapi y la base de datos):
```bash
cp .env.example .env
```

### 3. Instalación de dependencias (Local)
Para que el autocompletado y el entorno local funcionen correctamente, instala las dependencias en las subcarpetas:
```bash
# Instalar en backend
cd backend && npm install
cd ..

# Instalar en frontend
cd frontend && npm install
cd ..
```

---

## 🐳 Despliegue con Docker (Recomendado)

El despliegue está optimizado para instancias con **baja memoria RAM**.

### Gestión de Memoria en Strapi
El `Dockerfile.strapi` incluye una configuración especial para evitar errores de "Out of Memory" durante la compilación:
- `NODE_OPTIONS=--max-old-space-size=4096`: Asigna suficiente memoria al proceso de Node para compilar el panel de administración.

### Levantar los servicios
```bash
docker-compose up -d --build
```

Esto levantará 3 contenedores:
1.  **lms_db**: PostgreSQL optimizado para usar máximo 256MB de RAM.
2.  **lms_backend**: Strapi 5 (Backend).
3.  **lms_frontend**: React (Frontend).

---

## 🔑 Configuración Inicial de Strapi

Una vez que los contenedores estén corriendo:
1.  Accede a `http://tu-ip:1337/admin`.
2.  Crea el usuario administrador inicial.
3.  Sigue la guía de **[ROLES_PERMISSIONS_GUIDE.md](./ROLES_PERMISSIONS_GUIDE.md)** para configurar los permisos de la API.

---

## ⚙️ Optimización para Bajos Recursos
La base de datos PostgreSQL incluida en el `docker-compose.yml` está configurada con:
- `shared_buffers=64MB`
- `max_connections=20`
Esto garantiza que el sistema sea estable incluso en servidores pequeños (ej. 1GB o 2GB de RAM total).

---

# Configuración de Servidor: Amazon Linux 2023

Este documento detalla los pasos necesarios para instalar **Docker**, **Docker Compose** y **Node.js (v20.x)** en una instancia de Amazon Linux 2023.

## Requisitos Previos
* Acceso a la terminal de la instancia (vía SSH).
* Permisos de superusuario (`sudo`).

---

## 1. Instalación de Docker

Primero, instalaremos el motor de Docker, lo configuraremos para que inicie automáticamente con el sistema y añadiremos nuestro usuario al grupo `docker` para no tener que usar `sudo` en cada comando.

```bash
# Actualizar los paquetes del sistema (Recomendado)
sudo dnf update -y

# Instalar Docker
sudo dnf install -y docker

# Iniciar el servicio de Docker y habilitarlo para que arranque al inicio
sudo systemctl enable --now docker

# Añadir el usuario actual al grupo docker
sudo usermod -aG docker $USER

# Aplicar los cambios de grupo en la sesión actual
newgrp docker

# Verificar que Docker se instaló correctamente
docker --version
```

## 2. Instalación de Docker Compose

```bash
# Obtener la etiqueta de la última versión de Docker Compose
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
echo "Versión a instalar: $COMPOSE_VERSION"

# Descargar el binario en /usr/local/bin
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose

# Verificar que el archivo se ha descargado correctamente
ls -lh /usr/local/bin/docker-compose

# Otorgar permisos de ejecución al binario
sudo chmod +x /usr/local/bin/docker-compose

# Verificar la instalación
docker-compose --version
```

## 3. Instalación de Node.js (v20.x)

```bash
# Configurar repositorio de NodeSource para v20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Instalar Node.js
sudo dnf install -y nodejs

# Verificar versiones
node -v
npm -v
```

## 4. Instalación de Git

```bash
# Instalar git
sudo dnf install -y git

# Verificar instalación
git --version
```

## 5. Configuración de Git

```bash
# Configurar usuario global
git config --global user.name "Tu Nombre"
git config --global user.email "[EMAIL_ADDRESS]"
```

## 6. Clonar el Repositorio

```bash
# Clonar el proyecto
git clone https://github.com/vmunoz-smartcosta/lms.git
cd lms
```
