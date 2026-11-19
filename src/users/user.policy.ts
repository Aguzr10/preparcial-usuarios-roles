import { Policy, type PolicyBefore } from '@nestjs/authorization';
import { isAdmin } from '../auth/is-admin.js';
import { User } from './entities/user.entity.js';

// Reglas de quién puede hacer qué con los usuarios.
// Cada método es una regla (ability): true deja pasar, false responde 403.
// GET /users/me no está aquí: usa @Can.Anyone() (cualquiera con token).
@Policy()
export class UserPolicy implements PolicyBefore<User> {
  // Corre antes de cada regla: el admin pasa siempre.
  before(user: User | null) {
    if (isAdmin(user)) return true;
  }

  // GET /users: solo admin (lo resuelve before)
  list(_user: User | null) {
    return false;
  }

  // PATCH /users/:id/roles: solo admin (lo resuelve before)
  assignRoles(_user: User | null) {
    return false;
  }
}
