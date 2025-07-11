import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from 'src/common/google/google.strategy';
import { AuthController } from '../controller/auth.controller';
import { ResponseService } from 'src/common/error/response/response.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from '../schema/auth.schema';
import { JwtStrategy } from 'src/common/jwt/jwt.strategy';
import { AuthService } from '../service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();
import { Auth_API_key, Auth_API_keySchema } from '../schema/auth-api.schema';
import {
  Auth_Payment_Tran,
  Auth_Payment_TranSchema,
} from '../schema/auth-payment-tran.schema';
import {
  Auth_Payment_Gateway,
  Auth_Payment_GatewaySchema,
} from '../schema/auth-payment-gateway';
@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      {
        name: Auth.name,
        schema: AuthSchema,
      },
      {
        name: Auth_API_key.name,
        schema: Auth_API_keySchema,
      },
      {
        name: Auth_Payment_Tran.name,
        schema: Auth_Payment_TranSchema,
      },
      {
        name: Auth_Payment_Gateway.name,
        schema: Auth_Payment_GatewaySchema,
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'my-secret-key', // move to .env in real app
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, ResponseService, JwtStrategy, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
