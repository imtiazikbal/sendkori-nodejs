import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/module/app.module';
import * as dotenv from 'dotenv';
dotenv.config();
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static /uploads as /images
  const uploadPath = join(__dirname, '..', '..', 'uploads');

  app.useStaticAssets(uploadPath, {
    prefix: '/images/',
  });

  app.enableCors({
    origin: [
      'https://payment.cedhan.site',
      'https://sendkori.vercel.app',
      'https://bondhu-pay-mercehant.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  });

  await app.listen(Number(process.env.PORT) || 3001);
}
bootstrap();
