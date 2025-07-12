import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './../service/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ICancelPayment, IPaymentValidate } from 'src/interface/types';
import { AuthGuard } from '@nestjs/passport';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/initiate')
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    return this.paymentService.create({
      createPaymentDto,
      request: req,
    });
  }

  @Post('/validate')
  paymentValidate(@Body() body: IPaymentValidate) {
    return this.paymentService.paymentValidate({
      sessionId: body.sessionId,
      paymentMethod: body.paymentMethod,
      transactionId: body.transactionId,
    });
  }

  @Post('/cancel')
  paymentCancel(@Body() body: ICancelPayment) {
    return this.paymentService.paymentCancel({
      sessionId: body?.sessionId,
    });
  }

  // get auth receive payment
  @Get('/auth-payment')
  @UseGuards(AuthGuard('jwt'))
  paymentReceive(@Req() req: Request) {
    return this.paymentService.paymentReceive({
      request: req,
    });
  }

  @Get('/:sessionId')
  async findOne(@Param('sessionId') sessionId: string, @Req() req: Request) {
    console.log({ sessionId });
    console.log('hh');
    return await this.paymentService.findOne({
      request: req,
      sessionId,
    });
  }
}
