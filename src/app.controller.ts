import { Controller, Param, Post, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api/webhook')
  getHello(): string {
    return this.appService.getHello();
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
}
