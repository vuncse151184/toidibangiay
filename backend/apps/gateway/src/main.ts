import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { env } from './shared/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  const allowedOrigins = [
    env.FRONTEND_URL,
    'https://toidibangiay.vercel.app',
    'https://toidibangiay.shop',
  ].filter(Boolean)
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Toidibangiay API')
    .setDescription('E-commerce shoes store API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication')
    .addTag('products', 'Product catalog')
    .addTag('categories', 'Product categories')
    .addTag('cart', 'Shopping cart')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(env.PORT);
  console.log(`Gateway running on http://localhost:${env.PORT}/api`);
}

bootstrap();
