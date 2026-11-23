// NO TOCAR · Carga el usuario (con sus roles) desde el token en cada petición. Si se daña, nadie puede autenticarse.
import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  JwtBearerProvider,
  type JwtClaims,
} from '@nestjs/authentication';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

// Le dice al paquete cómo es "el usuario" que devuelve @CurrentUser()
declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: User;
  }
}

// En cada petición: el paquete lee "Authorization: Bearer <token>", revisa
// firma y expiración, y nos pasa los datos (claims). Nosotros solo cargamos al usuario.
@Injectable()
export class JwtAuth extends JwtBearerProvider<User> {
  constructor(
    private readonly users: UsersService,
    registry: AuthenticationRegistry,
  ) {
    super(); // sin opciones: usa la misma configuración de accessToken del módulo
    registry.registerProvider(this);
  }

  // sub = id del usuario. Devolver null = 401.
  // Se carga CON sus roles: las policies (Fase 6) deciden con ellos.
  // Un usuario desactivado tampoco pasa, aunque su token siga vigente.
  async validate({ sub }: JwtClaims) {
    if (!sub) return null;
    const user = await this.users.findById(sub);
    return user?.is_active ? user : null;
  }
}
