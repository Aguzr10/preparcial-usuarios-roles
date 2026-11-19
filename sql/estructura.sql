-- Estructura de la base de datos (la misma que crea la migración CreateUsersAndRoles)
-- Sirve para leer cómo está armada la base, o para crearla a mano en una base vacía:
--   docker exec -i usuarios_roles_db psql -U <DB_USER> -d <DB_NAME> < sql/estructura.sql
-- Si ya corriste las migraciones, NO lo corras: las tablas ya existen.

-- Roles: admin, supervisor, ...
CREATE TABLE roles (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name   VARCHAR(50)  NOT NULL UNIQUE,
  description VARCHAR(255)
);

-- Usuarios. password guarda el hash (scrypt), nunca la contraseña.
CREATE TABLE users (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(100),
  phone      VARCHAR(20),
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,   -- false: el login responde 423
  created_at TIMESTAMP    NOT NULL DEFAULT now()
);

-- Relación muchos a muchos: qué roles tiene cada usuario.
-- Llave compuesta: un usuario no puede tener el mismo rol dos veces.
-- ON DELETE CASCADE: si se borra un usuario o un rol, sus filas aquí se borran solas.
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Para ver la estructura real de la base en psql:
--   \d roles
--   \d users
--   \d user_roles
