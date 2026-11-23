# Preparcial: sistema de usuarios y roles

API REST con NestJS para el preparcial de ISIS3710 (Programación con Tecnologías Web).

- **Autenticación** con JWT (access token y refresh token con rotación) usando `@nestjs/authentication`.
- **Autorización** por roles con policies de `@nestjs/authorization`.
- **PostgreSQL** con TypeORM y migraciones SQL. Relación muchos a muchos entre usuarios y roles.

## Requisitos

- Node.js 22
- Docker Desktop

## Cómo correrlo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia la plantilla y pon tus valores:

```bash
cp .env.example .env
```

| Variable | Para qué | Ejemplo |
|---|---|---|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL en tu máquina | `5435` |
| `DB_USER` | Usuario de la base | `user` |
| `DB_PASS` | Contraseña de la base | — |
| `DB_NAME` | Nombre de la base | `usuarios_roles_db` |
| `JWT_SECRET` | Firma los tokens. Mínimo 32 caracteres aleatorios | ver abajo |
| `JWT_EXPIRES_IN` | Duración del access token | `2m` |
| `JWT_REFRESH_EXPIRES_IN` | Duración del refresh token | `7d` |

Para generar `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

El `.env` no se sube al repositorio (está en `.gitignore`).

### 3. Levantar PostgreSQL

`docker-compose.yml` lee `DB_USER`, `DB_PASS`, `DB_NAME` y `DB_PORT` del `.env`:

```bash
docker compose up -d
```

### 4. Correr las migraciones

```bash
npm run migration:run
```

Crean las tablas `roles`, `users` y `user_roles`, el rol `admin` y el usuario admin inicial.

| Comando | Qué hace |
|---|---|
| `npm run migration:run` | Corre las migraciones pendientes |
| `npm run migration:revert` | Deshace la última |
| `npm run migration:show` | Muestra cuáles corrieron `[X]` |

### 5. Iniciar la API

```bash
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api` (botón **Authorize** para pegar el `accessToken`)

## Usuario admin inicial

Lo crea la migración `SeedAdmin`:

| Correo | Contraseña |
|---|---|
| `admin@admin.com` | `webparcial2611` |

## Endpoints

| Método | URI | Acceso | Éxito | Errores |
|---|---|---|---|---|
| POST | `/auth/register` | público | 201 `{ message, userId }` | 400 Email inválido · 409 Email ya registrado |
| POST | `/auth/login` | público | 200 `{ accessToken, refreshToken, expiresIn }` | 401 Credenciales incorrectas · 423 Usuario desactivado |
| POST | `/auth/refresh` | público | 200 `{ accessToken, refreshToken, expiresIn }` | 400 refreshToken es requerido · 401 inválido, ya usado o revocado |
| POST | `/auth/logout` | público | 204 | 400 refreshToken es requerido |
| POST | `/roles` | admin | 201 `{ message, roleId }` | 400 role_name es requerido · 401 · 403 · 409 role_name ya existe |
| GET | `/roles` | admin | 200 `[{ id, role_name, description }]` | 401 · 403 · 500 Error al obtener roles |
| PATCH | `/users/:id/roles` | admin | 200 `{ message: "Roles asignados" }` | 400 roles inválidos · 401 · 403 · 404 Usuario no encontrado |
| GET | `/users/me` | autenticado | 200 `{ id, email, name, phone, roles }` | 401 · 404 Usuario no encontrado |
| GET | `/users` | admin | 200 `[{ id, email, name, roles }]` | 401 · 403 · 500 Error al listar usuarios |

- **401** `"Token inválido o faltante"`: sin token, token vencido o alterado. Lo detecta `@nestjs/authentication`.
- **403** `"No autorizado"`: con token, pero sin el rol requerido. Lo detecta `@nestjs/authorization`.
- Los textos de 401/403 los pone `AuthMessagesFilter` (`src/common/`); las rutas `/auth/*` conservan los suyos.
- El token va en el header `Authorization: Bearer <accessToken>`.
- `PATCH /users/:id/roles` **reemplaza** los roles del usuario por los enviados.
- El registro no asigna roles: los asigna un admin.

## Decisiones técnicas

- **Contraseñas**: se guarda el hash con `PasswordHasher` del paquete (scrypt). Nunca se devuelven: `@Exclude()` en la entidad y `ClassSerializerInterceptor` global.
- **Login**: mismo mensaje para correo inexistente y contraseña mala, y el 423 se revisa después de la contraseña, para no revelar qué cuentas existen. Máximo 5 intentos por minuto por IP (`@nestjs/throttler`).
- **Refresh tokens**: un solo uso (rotación). Reusar uno revoca toda la sesión. Se guardan en memoria (`allowInMemoryStorage: true`), así que se pierden al reiniciar la API.
- **Policies** (`RolePolicy`, `UserPolicy`): el admin pasa todas las reglas con `before()`. Cerrado por defecto: toda ruta lleva `@Can()`, `@Can.Anyone()` o `@Public()`.
- **JwtAuth** carga el usuario con sus roles en cada petición: un cambio de roles o una desactivación aplica de inmediato.
- **Validación**: DTOs con `class-validator`. `whitelist` + `forbidNonWhitelisted`: un campo que no está en el DTO (por ejemplo `roles` en el registro) responde 400.
- **Ids uuid**: no se pueden adivinar. `ParseUUIDPipe` responde 400 si el id no es uuid.
- **Esquema**: las tablas del preparcial las crean las migraciones (release v1.0.0 con `synchronize: false`). Para el parcial se activó `synchronize: true` (permitido por el profesor) para crear tablas nuevas desde las entidades. Se probó que activarlo sobre la base ya migrada no borra datos: solo agrega índices en `user_roles` y renombra sus llaves foráneas.
- **helmet**: headers de seguridad.

## Entregables SQL

- Migraciones: [`src/migrations/`](src/migrations)
- Estructura de la base (`CREATE TABLE`): [`sql/estructura.sql`](sql/estructura.sql)
- Script de usuarios y roles probados: [`sql/usuarios-roles-probados.sql`](sql/usuarios-roles-probados.sql)

```bash
docker exec -i usuarios_roles_db psql -U <DB_USER> -d <DB_NAME> < sql/usuarios-roles-probados.sql
```

## Estructura

```
src/
├── auth/
│   ├── auth.controller.ts   register, login, refresh, logout
│   ├── jwt.auth.ts          carga el usuario (con roles) desde el token
│   ├── is-admin.ts          lo usan los before() de las policies
│   └── dto/
├── roles/
│   ├── role.policy.ts       quién puede crear y listar roles
│   └── ...
├── users/
│   ├── user.policy.ts       quién puede listar usuarios y asignar roles
│   └── ...
├── migrations/              CreateUsersAndRoles, SeedAdmin
├── data-source.ts           conexión que usa el CLI de migraciones
├── app.module.ts            TypeORM, AuthenticationModule, AuthorizationModule
└── main.ts                  ValidationPipe, helmet, Swagger
```
