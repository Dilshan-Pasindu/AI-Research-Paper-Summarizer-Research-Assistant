import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as express from 'express';
import { basename, join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: false, // Allow frontend to read PDFs
    frameguard: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'self'", 'http://localhost:3000', 'http://127.0.0.1:3000'],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      },
    },
  }));

  // Enable CORS for the frontend application
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Serve static files from the uploads directory
  const uploadDir = process.env.UPLOAD_DIR || join(__dirname, '..', 'uploads');
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Content-Disposition', `inline; filename="${basename(req.path)}"`);
    next();
  });
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

  const port = process.env.BACKEND_PORT || process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend API successfully launched on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
