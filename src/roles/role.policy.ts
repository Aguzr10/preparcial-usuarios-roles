import { Policy, type PolicyBefore } from '@nestjs/authorization';
import { isAdmin } from '../auth/is-admin.js';
import { User } from '../users/entities/user.entity.js';

// Reglas de quién puede hacer qué con los roles.
// Cada método es una regla (ability): true deja pasar, false responde 403.
@Policy()
export class RolePolicy implements PolicyBefore<User> {
  // Corre antes de cada regla: el admin pasa siempre.
  // undefined = "no decido yo", sigue a la regla.
  before(user: User | null) {
    if (isAdmin(user)) return true;
  }

  // POST /roles: solo admin (lo resuelve before)
  create(_user: User | null) {
    return false;
  }

  // GET /roles: solo admin (lo resuelve before)
  list(_user: User | null) {
    return false;
  }
}
