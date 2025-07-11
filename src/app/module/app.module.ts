import { Module } from '@nestjs/common';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/module/auth.module';
import { PaymentModule } from 'src/payment/module/payment.module';
import { GatewayModule } from 'src/gateway/module/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const env = config.get<string>('NODE_ENV');
        return {
          uri:
            env === 'production'
              ? config.get<string>('DB_URL')
              : env === 'development'
                ? config.get<string>('DEVELOPMENT_URL')
                : config.get<string>('DB_URL_LOCAL'),
        };
      },
    }),
    AuthModule,
    PaymentModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
