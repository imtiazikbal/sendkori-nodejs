import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PaymentService } from './../service/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentService.create({
      createPaymentDto,
      request: req,
    });
  }

  @Get(':sessionId')
  async findOne(@Param('sessionId') sessionId: string, @Req() req: Request) {
    console.log({ sessionId });
    return await this.paymentService.findOne({
      request: req,
      sessionId,
    });
  }
}
