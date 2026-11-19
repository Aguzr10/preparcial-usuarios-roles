import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Headers de seguridad (quita X-Powered-By: Express, agrega nosniff, etc.)
  app.use(helmet());

  // Valida todos los DTOs: campos de más → 400, tipos se convierten
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );

  // Swagger en http://localhost:3000/api
  const config = new DocumentBuilder()
    .setTitle('API de Usuarios y Roles')
    .setDescription(
      'Preparcial: autenticación con JWT y autorización por roles con NestJS',
    )
    .setVersion('1.0')
    .addBearerAuth() // botón "Authorize" para pegar el accessToken
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
