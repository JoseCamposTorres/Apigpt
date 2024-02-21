import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // Carga las variables de entorno desde .env
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  

  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
   );
  await app.listen(3022);
}
bootstrap();
