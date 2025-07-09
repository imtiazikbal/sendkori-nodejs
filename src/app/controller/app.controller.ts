import { Controller, Param, Post, Get, Body } from '@nestjs/common';
import { AppService } from 'src/app/service/app.service';
import {
  IAuthPaymentTran,
  ICancelPayment,
  IPaymentValidate,
  SMSBody,
} from 'src/interface/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api/webhook')
  async paymentWebHook(@Body() body: SMSBody) {
    console.log({ body });
    return await this.appService.paymentWebHook({
      smsBody: body,
    });
  }
}
