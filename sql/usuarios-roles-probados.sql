-- Script SQL de usuarios y roles probados
-- Correr DESPUÉS de las migraciones (npm run migration:run), por ejemplo:
--   docker exec -i usuarios_roles_db psql -U <DB_USER> -d <DB_NAME> < sql/usuarios-roles-probados.sql

-- 1. Datos de prueba: rol supervisor y un usuario con ese rol
--    Usuario: supervisor@prueba.com / Contraseña: supervisor-prueba-123
--    (hash generado con el PasswordHasher de @nestjs/authentication, scrypt)
INSERT INTO roles (role_name, description)
VALUES ('supervisor', 'Supervisor de prueba')
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO users (email, password, name, phone)
VALUES (
  'supervisor@prueba.com',
  '$scrypt$ln=17,r=8,p=1$hqSDzGLST1Trcp+nL2CpOQ$KP0X4QBuRgJfFvvxepdjSkrWCtTVh14+7ljwix+4kA0',
  'Supervisor de prueba',
  '3001234567'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'supervisor@prueba.com' AND r.role_name = 'supervisor'
ON CONFLICT DO NOTHING;

-- 2. Consultas para comprobar

-- Todos los roles
SELECT id, role_name, description FROM roles ORDER BY role_name;

-- Cada usuario con sus roles (sin el password)
SELECT u.email, u.name, u.is_active,
       COALESCE(string_agg(r.role_name, ', ' ORDER BY r.role_name), '(sin roles)') AS roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
GROUP BY u.id, u.email, u.name, u.is_active
ORDER BY u.created_at;

-- El admin de la migración SeedAdmin tiene el rol admin (debe dar 1)
SELECT COUNT(*) AS admin_con_rol_admin
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'admin@admin.com' AND r.role_name = 'admin';
