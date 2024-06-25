import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cors from 'cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const config = new DocumentBuilder()
    .setTitle('alt-bootcamp')
    .setDescription('The alt-bootcamp API description')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apiDoc', app, document);
  app.use(
    cors({
      origin: 'http://localhost:5173', // Autoriser seulement cette origine ou '*' pour toutes
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true, // Activer les cookies CORS (si nécessaire)
    }),
  );
  await app.listen(3001);
}

bootstrap();
