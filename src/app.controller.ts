import { Controller, Param, Post, Get, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ICancelPayment, IPaymentValidate } from './types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api/webhook')
  getHello(@Body() body) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    console.log({ body });
  }

  @Post('payment')
  paymentMethod() {
    return this.appService.payment();
  }

  @Get('payment/:sessionId')
  paymentData(@Param('sessionId') sessionId: string) {
    return this.appService.paymentData({
      sessionId,
    });
  }

  @Post('payment/validate')
  paymentValidate(@Body() body: IPaymentValidate) {
    return this.appService.paymentValidate({
      sessionId: body.sessionId,
      method: body.method,
      transactionId: body.transactionId,
    });
  }

  @Post('payment/cancel')
  paymentCancel(@Body() body: ICancelPayment) {
    return this.appService.paymentCancel({
      sessionId: body.sessionId,
    });
  }
}
