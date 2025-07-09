import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/module/app.module';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://payment.cedhan.site',
      'https://sendkori.vercel.app',
      'http://localhost:3002',
    ],
    credentials: true,
  });
  await app.listen(Number(process.env.PORT) || 3001);
}
bootstrap();
