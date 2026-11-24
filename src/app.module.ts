import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthMessagesFilter } from './common/auth-messages.filter.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthenticationModule, type Duration } from '@nestjs/authentication';
import { AuthorizationModule } from '@nestjs/authorization';
import { AuthModule } from './auth/auth.module.js';
import { RolesModule } from './roles/roles.module.js';
import { UsersModule } from './users/users.module.js';
import { ReservationsModule } from './reservations/reservations.module.js';
import { ParkingspotsModule } from './parkingspots/parkingspots.module.js';

@Module({
  imports: [
    // SÍ SE PUEDE: agregar módulos nuevos al final de esta lista (nest g resource lo hace solo).
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASS'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        // true (para el parcial, lo permitió el profe): al arrancar, TypeORM crea las
        // tablas nuevas a partir de las entidades. La base del preparcial la crean las
        // migraciones (src/migrations), que siguen siendo el respaldo.
        // ⚠️ Con true, BORRAR o RENOMBRAR un campo de una entidad borra esa columna y sus datos.
        synchronize: true,
      }),
    }),

    // NO TOCAR (AuthenticationModule y AuthorizationModule): son el 401 y el 403 de toda la API.
    // Autenticación: con solo importarlo, TODA ruta pide token (guard global).
    // Las que no, llevan @Public().
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        accessToken: {
          key: config.getOrThrow<string>('JWT_SECRET'), // firma los tokens (mín. 32 caracteres)
          issuer: 'usuarios-roles-api', // quién emite el token
          audience: 'usuarios-roles-clients', // para quién es
          ttl: config.getOrThrow<Duration>('JWT_EXPIRES_IN'), // '2m'. Texto con unidad: un número serían ms
        },
        refreshToken: {
          ttl: config.getOrThrow<Duration>('JWT_REFRESH_EXPIRES_IN'), // '7d'
        },
        // Los refresh tokens se guardan en memoria (se pierden al reiniciar la API)
        allowInMemoryStorage: true,
      }),
    }),

    // Autorización: DESPUÉS de AuthenticationModule (su guard necesita el usuario).
    // Cerrado por defecto: toda ruta necesita @Can(), @Can.Anyone() o @Public(); si no, 403.
    AuthorizationModule.forRoot(),

    // Límite de peticiones: por defecto 100 por minuto; el login baja a 5 con @Throttle
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    AuthModule,
    RolesModule,
    UsersModule,
    ReservationsModule,
    ParkingspotsModule,
  ],
  providers: [
    // Aplica @Exclude() a todas las respuestas (el password nunca sale)
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    // Responde 429 Too Many Requests al pasar el límite
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // 401 → "Token inválido o faltante", 403 → "No autorizado" (como el enunciado)
    { provide: APP_FILTER, useClass: AuthMessagesFilter },
  ],
})
export class AppModule {}
