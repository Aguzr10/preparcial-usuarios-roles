import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Public, TokenService } from '@nestjs/authentication';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { RegisterDto } from './dto/register.dto.js';

// @Public() en la clase: ninguna de estas rutas pide token
@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
  ) {}

  // POST /auth/register · público
  // 201 { message, userId } | 400 Email inválido | 409 Email ya registrado
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.users.register(dto);
  }

  // POST /auth/login · público
  // 200 { accessToken, refreshToken, expiresIn } | 401 Credenciales incorrectas | 423 Usuario desactivado
  // Máximo 5 intentos por minuto por IP (frena a quien prueba contraseñas)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.users.verifyCredentials(dto.email, dto.password);
    // Mismo mensaje para correo inexistente y contraseña mala
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    // El 423 va después de revisar la contraseña: así no revela qué cuentas existen
    if (!user.is_active) {
      throw new HttpException('Usuario desactivado', HttpStatus.LOCKED);
    }
    return this.tokens.issue(user.id, { method: 'password' });
  }

  // POST /auth/refresh · público · body { refreshToken }
  // 200 { accessToken, refreshToken, expiresIn } | 400 refreshToken es requerido
  // 401 si el refresh token es inválido, ya se usó o fue revocado
  // Rotación: el refresh token usado deja de servir. Reusarlo revoca toda la sesión.
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.tokens.refresh(dto.refreshToken);
  }

  // POST /auth/logout · público · body { refreshToken }
  // 204 | 400 refreshToken es requerido
  // Responde 204 aunque el token no exista: no revela si era válido.
  // El access token sigue sirviendo hasta que vence (2 min): por eso dura poco.
  @HttpCode(204)
  @Post('logout')
  async logout(@Body() dto: RefreshDto) {
    await this.tokens.revoke(dto.refreshToken);
  }
}
