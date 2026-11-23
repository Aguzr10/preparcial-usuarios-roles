import { User } from '../users/entities/user.entity.js';

// ¿El usuario tiene este rol? Sirve para cualquier rol (supervisor, conductor...).
// Los roles vienen cargados por JwtAuth en cada petición.
export function hasRole(user: User | null, role: string): boolean {
  return user?.roles?.some((r) => r.role_name === role) ?? false;
}

// Lo usan los before() de las policies: el admin pasa todo.
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}
