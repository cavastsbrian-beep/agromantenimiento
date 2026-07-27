# AgroMantenimiento — Guía de despliegue

Este proyecto ya está conectado a tu base de datos de Supabase. Seguí estos pasos
EN ORDEN, desde la computadora.

## 1. Correr el SQL de permisos que falta

Andá al SQL Editor de tu proyecto Supabase y corré el contenido del archivo
`supabase-permisos.sql` (está en esta misma carpeta). Esto habilita que la app
pueda agregar, editar y borrar datos, y subir archivos.

## 2. Subir el proyecto a GitHub (sin usar la terminal)

1. Entrá a https://github.com/new
2. Nombre del repositorio: `agromantenimiento`
3. Dejalo en "Public" o "Private" (cualquiera funciona), NO marques ningún checkbox
   adicional
4. Tocá "Create repository"
5. En la página que aparece, buscá el enlace que dice **"uploading an existing file"**
6. Arrastrá TODA esta carpeta (o todos sus archivos y carpetas) a esa página
7. Abajo escribí un mensaje como "Primera versión" y tocá **"Commit changes"**

## 3. Desplegar en Vercel

1. Entrá a https://vercel.com/new
2. Elegí "Import" al lado del repositorio `agromantenimiento` que acabás de subir
3. Antes de tocar "Deploy", abrí la sección **"Environment Variables"** y cargá
   estas tres (los valores salen de Supabase → Settings → API):

   | Name                          | Value                                    |
   |-------------------------------|-------------------------------------------|
   | NEXT_PUBLIC_SUPABASE_URL      | (tu Project URL de Supabase)              |
   | NEXT_PUBLIC_SUPABASE_ANON_KEY | (tu clave "anon public" de Supabase)      |
   | ADMIN_PASSWORD                | (la contraseña que quieras para el admin) |

4. Tocá **"Deploy"** y esperá 1-2 minutos
5. Al terminar, Vercel te da una URL como `agromantenimiento.vercel.app` — esa es
   tu aplicación real, ya funcionando en internet

## 4. Probarla

- Entrá a tu URL de Vercel — deberías ver la portada
- Tocá "Iniciar sesión" y probá con la contraseña que pusiste en ADMIN_PASSWORD
- Agregá una máquina de prueba y un mantenimiento con un Excel real

## Notas importantes

- Cada máquina tiene una página pública en `/m/<id-de-la-maquina>` con su
  historial y un código QR que apunta a esa misma página — podés imprimir ese QR
  y pegarlo en la máquina física.
- Si en el futuro querés cambiar la contraseña de administrador, hacelo en
  Vercel → tu proyecto → Settings → Environment Variables → editá
  `ADMIN_PASSWORD` → Vercel va a pedirte volver a desplegar (Redeploy), solo
  tocá ese botón.
- Este proyecto usa una única contraseña de administrador compartida (no hay
  usuarios individuales). Es el mismo nivel de protección que ya tenías, pero
  ahora la contraseña nunca queda visible en el código del navegador, ya que
  se valida en el servidor.
