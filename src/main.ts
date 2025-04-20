import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000' , 'https://financial-tracker.railway.app'],  // Specify your frontend URLs
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
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ Server is running on port ${port}`);
 
}
bootstrap();