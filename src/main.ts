import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/module/app.module';
import * as dotenv from 'dotenv';
dotenv.config();
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadPath = resolve(process.env.UPLOAD_DIR || './uploads');

  app.useStaticAssets(uploadPath, {
    prefix: '/images/',
  });
  app.enableCors({
    origin: [
      'https://payment.cedhan.site',
      'https://sendkori.vercel.app',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3000',
    ],
    credentials: true,
  });
  await app.listen(Number(process.env.PORT) || 3001);
}
bootstrap();
