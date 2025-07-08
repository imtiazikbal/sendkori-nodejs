import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/module/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://payment.cedhan.site',
      'https://sendkori.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
