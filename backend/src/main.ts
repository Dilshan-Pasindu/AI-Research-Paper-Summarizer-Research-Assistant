import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: false, // Allow frontend to read PDFs
  }));

  // Enable CORS
  app.enableCors({
    origin: '*', // In production, replace with specific domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Serve static files from the uploads directory
  const uploadDir = process.env.UPLOAD_DIR || join(__dirname, '..', 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('AI Research Paper Summarizer API')
    .setDescription('Full REST API endpoints for user authentication, paper library management, summary generation, citations log, RAG chats, and comparison tables.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend API successfully launched on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
