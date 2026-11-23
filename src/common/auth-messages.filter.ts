// NO TOCAR · Pone los mensajes del enunciado en el 401 y el 403 de toda la API.
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Request, Response } from 'express';

// Los paquetes de autenticación y autorización responden el 401 y el 403
// con sus propios textos ("Unauthorized", "Forbidden", "invalid signature").
// Este filtro los cambia por los mensajes del enunciado.
// Las rutas /auth/* quedan como están: ahí el 401 tiene su propio mensaje
// ("Credenciales incorrectas", "Refresh token reused"...).
@Catch(HttpException)
export class AuthMessagesFilter extends BaseExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const status = exception.getStatus();
    const isAuthRoute = request.path.startsWith('/auth');

    if (!isAuthRoute && status === HttpStatus.UNAUTHORIZED) {
      return this.reply(
        host,
        status,
        'Token inválido o faltante',
        'Unauthorized',
      );
    }
    if (!isAuthRoute && status === HttpStatus.FORBIDDEN) {
      return this.reply(host, status, 'No autorizado', 'Forbidden');
    }
    // Cualquier otro error: la respuesta normal de Nest
    return super.catch(exception, host);
  }

  private reply(
    host: ArgumentsHost,
    status: number,
    message: string,
    error: string,
  ) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ statusCode: status, error, message });
  }
}
