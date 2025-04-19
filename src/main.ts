import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],  // Specify your frontend URLs
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  // Allow all necessary methods
    credentials: true,  // If you're sending credentials (like cookies or authorization headers)
  });  // Allows requests from any origin, or specify origin using { origin: 'http://localhost:3000' } or an array of allowed origins

  const config = new DocumentBuilder()
    .setTitle('Financial Tracker')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth() // optional: if you're using JWT auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // localhost:3000/api
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
