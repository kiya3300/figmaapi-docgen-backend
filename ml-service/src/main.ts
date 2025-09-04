import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS for your main backend
  app.enableCors({
    origin: process.env.BACKEND_URL || 'https://your-backend.onrender.com',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ML Model Service')
    .setDescription('External ML model deployment for FigmaAPI-DocGen')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`ML Service running on port ${port}`);
}
bootstrap(); 