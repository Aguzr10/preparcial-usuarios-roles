import { User } from '../users/entities/user.entity.js';

// Lo usan los before() de las policies. Los roles vienen cargados por JwtAuth.
export function isAdmin(user: User | null): boolean {
  return user?.roles?.some((role) => role.role_name === 'admin') ?? false;
}
