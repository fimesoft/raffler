# Guía de Despliegue - Raffler App

Esta guía te ayudará a desplegar tu aplicación en Vercel (Frontend) y Railway/Render (Backend).

## Arquitectura de Despliegue

- **Frontend (Next.js)**: Vercel
- **Backend (Express API)**: Railway o Render
- **Base de datos**: Vercel Postgres (compartida entre ambos)

---

## PARTE 1: Configurar Vercel Postgres

### 1.1 Crear cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta o inicia sesión

### 1.2 Crear base de datos Postgres
1. En el dashboard de Vercel, ve a **Storage**
2. Click en **Create Database**
3. Selecciona **Postgres**
4. Dale un nombre a tu base de datos (ej: `raffler-db`)
5. Selecciona la región más cercana a tus usuarios
6. Click en **Create**

### 1.3 Obtener las variables de entorno de la base de datos
Una vez creada la base de datos, verás las siguientes variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

**Importante**: Copia estas variables, las necesitarás para ambos despliegues.

---

## PARTE 2: Desplegar el Frontend en Vercel

### 2.1 Preparar el repositorio
1. Asegúrate de que tu código esté en GitHub, GitLab o Bitbucket
2. Haz commit de todos los cambios:
   ```bash
   git add .
   git commit -m "Preparar para despliegue en Vercel"
   git push
   ```

### 2.2 Importar proyecto en Vercel
1. En Vercel dashboard, click en **Add New** → **Project**
2. Importa tu repositorio de Git
3. Configura el proyecto:
   - **Framework Preset**: Next.js (se detecta automáticamente)
   - **Root Directory**: `.` (raíz del proyecto)
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`

### 2.3 Configurar variables de entorno en Vercel
En la sección **Environment Variables**, agrega:

```bash
# NextAuth
NEXTAUTH_SECRET=tu-secret-aqui-genera-uno-seguro
NEXTAUTH_URL=https://tu-app.vercel.app

# Database - Estas las obtienes de Vercel Postgres
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
DATABASE_URL=${POSTGRES_PRISMA_URL}

# JWT
JWT_SECRET=tu-jwt-secret-aqui
JWT_REFRESH_SECRET=tu-jwt-refresh-secret-aqui

# Email (opcional si usas notificaciones)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password

# API Backend - Actualizarás esto después de desplegar el backend
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
```

**Generar secrets seguros**:
```bash
# Genera un NEXTAUTH_SECRET
openssl rand -base64 32

# Genera JWT_SECRET
openssl rand -base64 32

# Genera JWT_REFRESH_SECRET
openssl rand -base64 32
```

### 2.4 Conectar la base de datos al proyecto
1. En Vercel, ve a tu proyecto
2. Ve a **Storage** tab
3. Click en **Connect Store**
4. Selecciona la base de datos Postgres que creaste
5. Las variables de entorno se agregarán automáticamente

### 2.5 Deploy
1. Click en **Deploy**
2. Espera a que termine el build
3. Una vez desplegado, copia la URL de tu app (ej: `https://tu-app.vercel.app`)

### 2.6 Ejecutar migraciones de Prisma
Después del primer despliegue, ejecuta las migraciones:

1. En Vercel, ve a tu proyecto → **Settings** → **Functions**
2. O ejecuta desde tu terminal local apuntando a la DB de producción:
   ```bash
   # Cambia temporalmente DATABASE_URL en .env.local a la de producción
   npx prisma db push
   # O si tienes migraciones:
   npx prisma migrate deploy
   ```

---

## PARTE 3: Desplegar el Backend en Railway

### 3.1 Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta (puedes usar GitHub)

### 3.2 Crear nuevo proyecto
1. Click en **New Project**
2. Selecciona **Deploy from GitHub repo**
3. Autoriza Railway a acceder a tu repositorio
4. Selecciona tu repositorio

### 3.3 Configurar el servicio
1. Railway detectará automáticamente que es un proyecto Node.js
2. Configura el **Root Directory**: `server`
3. **Start Command**: `npm start`
4. **Build Command**: `npm install && npm run db:generate`

### 3.4 Configurar variables de entorno en Railway
En **Variables**, agrega:

```bash
# Database - USA LAS MISMAS de Vercel Postgres
DATABASE_URL=postgresql://... (la misma POSTGRES_PRISMA_URL de Vercel)
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...

# JWT - DEBEN SER LOS MISMOS que en Vercel
JWT_SECRET=tu-jwt-secret (el mismo que en Vercel)
JWT_REFRESH_SECRET=tu-jwt-refresh-secret (el mismo que en Vercel)

# Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password

# Server
PORT=5001
NODE_ENV=production

# Frontend URL - La URL de tu app en Vercel
FRONTEND_URL=https://tu-app.vercel.app
```

### 3.5 Deploy
1. Railway desplegará automáticamente
2. Una vez desplegado, copia la URL del backend (ej: `https://tu-backend.railway.app`)

### 3.6 Actualizar NEXT_PUBLIC_API_URL en Vercel
1. Ve a Vercel → Tu proyecto → **Settings** → **Environment Variables**
2. Edita `NEXT_PUBLIC_API_URL` con la URL de Railway
3. **Re-deploy** tu aplicación en Vercel para que tome el nuevo valor

---

## ALTERNATIVA: Desplegar Backend en Render

Si prefieres Render en lugar de Railway:

### 1. Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Crea una cuenta

### 2. Crear nuevo Web Service
1. Click en **New** → **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: raffler-api
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run db:generate`
   - **Start Command**: `npm start`
   - **Plan**: Free (o el que prefieras)

### 3. Variables de entorno
Agrega las mismas variables que en Railway

### 4. Deploy
Render desplegará automáticamente

---

## Verificación del Despliegue

### Frontend (Vercel)
1. Visita tu URL de Vercel: `https://tu-app.vercel.app`
2. Deberías ver la página principal
3. Verifica que puedas registrarte/iniciar sesión

### Backend (Railway/Render)
1. Visita: `https://tu-backend.railway.app/health`
2. Deberías ver:
   ```json
   {
     "status": "OK",
     "timestamp": "2025-...",
     "uptime": 123
   }
   ```

### Base de datos
1. En Vercel → Storage → Tu base de datos
2. Click en **Data** para ver las tablas
3. Deberías ver las tablas: `users`, `raffles`, `tickets`, etc.

---

## Troubleshooting

### Error: "Cannot connect to database"
- Verifica que las variables `DATABASE_URL` sean correctas
- Asegúrate de estar usando `POSTGRES_PRISMA_URL` para conexiones desde serverless
- Verifica que la base de datos esté en la misma región que tus servicios

### Error: "CORS policy"
- Verifica que `FRONTEND_URL` en el backend tenga la URL correcta de Vercel
- Asegúrate de que no haya barras diagonales al final

### Error: "Prisma Client not generated"
- Ejecuta `npm run db:generate` manualmente
- Verifica que el `postinstall` script esté en package.json

### Los datos no se guardan
- Verifica que ambos servicios (Vercel y Railway) usen la MISMA `DATABASE_URL`
- Revisa los logs en Vercel y Railway para ver errores específicos

---

## Comandos Útiles

```bash
# Ver logs en Vercel (desde tu terminal)
vercel logs tu-app.vercel.app

# Ejecutar migraciones en producción
DATABASE_URL="tu-postgres-url" npx prisma migrate deploy

# Ver base de datos con Prisma Studio (apuntando a producción)
DATABASE_URL="tu-postgres-url" npx prisma studio
```

---

## Mantenimiento

### Actualizar la aplicación
1. Haz cambios en tu código local
2. Commit y push a GitHub
3. Vercel y Railway/Render desplegarán automáticamente

### Ejecutar nuevas migraciones
```bash
# En desarrollo
npm run db:migrate

# En producción
DATABASE_URL="tu-postgres-url" npx prisma migrate deploy
```

### Monitorear logs
- **Vercel**: Dashboard → Tu proyecto → Deployments → Logs
- **Railway**: Dashboard → Tu proyecto → Deployments → View Logs
- **Render**: Dashboard → Tu servicio → Logs

---

## Seguridad

- ✅ Nunca commitees archivos `.env` o `.env.local`
- ✅ Usa secrets seguros generados aleatoriamente
- ✅ Mantén las mismas secrets en Frontend y Backend
- ✅ Configura CORS correctamente
- ✅ Usa HTTPS siempre (Vercel y Railway lo proveen automáticamente)

---

## Soporte

Si tienes problemas:
1. Revisa los logs en Vercel y Railway/Render
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que la base de datos esté accesible desde ambos servicios

¡Listo! Tu aplicación debería estar funcionando en producción.
