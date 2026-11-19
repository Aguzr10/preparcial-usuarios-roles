import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { JwtAuth } from './jwt.auth.js';

// La configuración de AuthenticationModule (secreto, duración de tokens) está en app.module.ts.
// Aquí van lo que escribimos nosotros: el controlador de tokens y JwtAuth.
@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [JwtAuth],
})
export class AuthModule {}
