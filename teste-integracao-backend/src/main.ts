import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AllExceptionsFilter } from './common/Filters/allExceptionFilter';
import { PrismaExceptionFilter } from './common/Filters/prismaFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';


// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Register CORS plugin for Fastify
  await app.getHttpAdapter().getInstance().register(fastifyCors as any, {
    origin: ['http://localhost:3003', 'https://integracaomp.tehkly.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  });

  await app.getHttpAdapter().getInstance().register(fastifyCookie as any, {
    secret: process.env.JWT_SECRET, // use uma variável de ambiente para isso em produção!
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');


  const httpAdapterHost = app.get(HttpAdapterHost);
  // app.useGlobalFilters(
  //   new AllExceptionsFilter(httpAdapterHost),
  //   new PrismaExceptionFilter(),
  // );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('123Conex API')
    .setDescription('API para sistema de agendamento médico - 123Conex')
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('accounts', 'Contas de usuários')
    .addTag('profiles', 'Perfis de médicos e pacientes')
    .addTag('appointments', 'Agendamentos')
    .addTag('activities', 'Atividades médicas')
    .addTag('specialties', 'Especialidades médicas')
    .addTag('reviews', 'Avaliações')
    .addTag('on-call', 'Atendimento domiciliar')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 4003);
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 4000}`);
  console.log(`📚 Swagger documentation: http://localhost:${process.env.PORT ?? 4000}/api/docs`);
}
bootstrap();
