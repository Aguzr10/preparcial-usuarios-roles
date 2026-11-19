import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthenticationModule, type Duration } from '@nestjs/authentication';
import { AuthModule } from './auth/auth.module.js';
import { RolesModule } from './roles/roles.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
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
        // false: las tablas las crean las migraciones (src/migrations), no las entidades
        synchronize: false,
      }),
    }),

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

    // Límite de peticiones: por defecto 100 por minuto; el login baja a 5 con @Throttle
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    AuthModule,
    RolesModule,
    UsersModule,
  ],
  providers: [
    // Aplica @Exclude() a todas las respuestas (el password nunca sale)
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    // Responde 429 Too Many Requests al pasar el límite
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
