import { Module } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { PaymentController } from '../controller/payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../schema/payment.schema';
import { ResponseService } from 'src/common/error/response/response.service';
import { AuthModule } from 'src/auth/module/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    AuthModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, ResponseService],
})
export class PaymentModule {}
