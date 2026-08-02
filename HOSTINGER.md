# Despliegue en Hostinger Business Web Hosting

## Requisitos

- Plan con Node.js Web App y base de datos MySQL.
- Runtime Node.js 22, definido también en .nvmrc y package.json.
- Dominio o subdominio apuntando a la aplicación.

## Base de datos

Crea una base MySQL y un usuario desde hPanel. Copia env.gibbor.example a .env y reemplaza DATABASE_URL con las credenciales suministradas por Hostinger. Si la contraseña contiene caracteres especiales, codifícalos para URL.

## Configuración de la aplicación

En hPanel, crea una Node.js Web App con:

- Versión: 22.x
- Directorio: raíz de este proyecto
- Comando de instalación: npm install
- Comando de compilación: npm run build
- Comando de inicio: npm start
- Puerto: el asignado por la variable PORT de Hostinger

Carga como variables de entorno todos los valores de env.gibbor.example. No subas .env al repositorio.

## Crear tablas

Desde la terminal de Hostinger ejecuta npx prisma generate, npx prisma db push y npm run build. Luego reinicia la aplicación desde hPanel.

## Soportes

La primera versión incluye el flujo de selección y trazabilidad documental. Para archivos persistentes conecta S3, Cloudinary o almacenamiento de objetos y guarda la URL en Document.url; no guardes archivos críticos dentro del filesystem del proceso Node.js.

## Seguridad antes de producción

- Cambia ADMIN_EMAIL, ADMIN_PASSWORD y AUTH_SECRET.
- Activa HTTPS y copias automáticas de MySQL.
- Sustituye la persistencia demo del navegador por los route handlers Prisma en la siguiente iteración.
