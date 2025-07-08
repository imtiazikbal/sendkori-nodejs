import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from '../schema/payment.schema';
import { Model } from 'mongoose';
import { ResponseService } from 'src/common/error/response/response.service';
import { AuthService } from 'src/auth/service/auth.service';
import { CustomError } from 'src/common/error/errors';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { IPaymentData } from 'src/interface/types';
dotenv.config();
@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    private readonly responseService: ResponseService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  async create({
    createPaymentDto,
    request,
  }: {
    createPaymentDto: CreatePaymentDto;
    request: any;
  }) {
    try {
      const apiKey = request?.headers['x-api-key'];
      const userId = await this.authService.getUserIdByApiKey({ apiKey });
      await this.authService.checkUserIsActiveWithUserId({ id: userId });
      const sessionId = this.generate50DigitUniqueId();
      if (!apiKey) {
        throw new CustomError(
          'API key not found',
          'Could not find API key',
          HttpStatus.NOT_FOUND,
        );
      }
      if (!userId) {
        throw new CustomError(
          'User not found',
          'Could not find user',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!sessionId) {
        throw new CustomError(
          'Session not create',
          'Could not create session',
          HttpStatus.NOT_FOUND,
        );
      }
      const payment = await this.paymentModel.create({
        ...createPaymentDto,
        userId,
        sessionId,
        apiKey,
      });
      const env = this.configService.get<string>('NODE_ENV');
      const redirectUrl =
        env === 'production'
          ? this.configService.get<string>('FRONTEND_PRODUCTION_URL')
          : this.configService.get<string>('FRONTEND_DEVELOPMENT_URL');
      const url = `${redirectUrl}?session_id=${sessionId}`;
      return {
        data: url,
      };
    } catch (e) {
      console.error('Error details:', e); // Log the actual error object
      return this.responseService.throwError(
        e?.message || 'Server error',
        e?.details,
        e?.statusCode,
      );
    }
  }

  findAll() {
    return `This action returns all payment`;
  }

  async findOne({ request, sessionId }: { request: any; sessionId: string }) {
    try {
      const payment = await this.paymentModel
        .findOne({
          sessionId: sessionId,
        })
        .exec();
      if (!payment) {
        throw new CustomError(
          'Payment not found',
          'Could not find payment',
          HttpStatus.NOT_FOUND,
        );
      }

      const user = await this.authService.checkUserIsActiveWithUserId({
        id: payment?.userId,
      });

      const response: IPaymentData = {
        amount: payment?.totalAmount,
        appName: user?.firstName + ' ' + user?.lastName || 'Bondhu Pay',
        paymentMethod: [
          {
            name: 'bKash',
            type: 'mobile_payment',
            provider: 'bKash',
          },
          {
            name: 'Nagad',
            type: 'mobile_payment',
            provider: 'Nagad',
          },
          {
            name: 'Rocket',
            type: 'mobile_payment',
            provider: 'Rocket',
          },
          {
            name: 'Visa',
            type: 'card',
            provider: 'Visa',
          },
          {
            name: 'Mastercard',
            type: 'card',
            provider: 'Mastercard',
          },
          {
            name: 'American Express',
            type: 'card',
            provider: 'Amex',
          },
          {
            name: 'Bank Transfer',
            type: 'bank_transfer',
            provider: 'Local Banks',
          },
        ],
      };
      return this.responseService.successResponse(response, 'Payment data');
    } catch (error) {}
  }

  private generate50DigitUniqueId(): string {
    const timestamp = Date.now().toString(); // 13 digits (ms since 1970)

    // We want 50 digits total, so generate 37 random digits
    let randomDigits = '';
    for (let i = 0; i < 37; i++) {
      randomDigits += Math.floor(Math.random() * 10).toString();
    }

    return timestamp + randomDigits;
  }
}
