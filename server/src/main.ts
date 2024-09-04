import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set the global prefix for all routes
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Furniro API')
    .setDescription('The Furniro API documentation')
    .setVersion('1.0')
    //.addBearerAuth() // Add JWT or API key support if needed
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // This can remain outside the '/api' prefix

  await app.listen(3000);
}
bootstrap();
