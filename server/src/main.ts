import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',  // Allow requests from all origins, you can limit this to specific origins
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',  // Allow these methods
    allowedHeaders: 'Content-Type, Authorization',  // Allow specific headers
  });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Furniro API')
    .setDescription('The Furniro API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  app.use('/api/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
  await app.listen(3000);
}
bootstrap();
