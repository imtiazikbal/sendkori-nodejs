import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { IPaymentSatus, Payment } from '../schema/payment.schema';
import { Model } from 'mongoose';
import { ResponseService } from 'src/common/error/response/response.service';
import { AuthService } from 'src/auth/service/auth.service';
import { CustomError } from 'src/common/error/errors';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import {
  ICancelPayment,
  IPaymentData,
  IPaymentValidate,
} from 'src/interface/types';
dotenv.config();

interface IPaymentReceive {
  id: string;
  title: string;
  type: string;
  amount: number;
  createdAt: string;
  status: string;
  transactionId: string;
  updatedAt: string;
  method: string;
}
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
          : this.configService.get<string>('FRONTEND_PAYMENT_URL');
      const url = `${redirectUrl}?sessionId=${sessionId}`;
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

      const authPaymentsMethods =
        await this.authService.getAuthPaymentGatewayByUserId({
          userId: payment?.userId,
        });

      const response: IPaymentData = {
        amount: payment?.totalAmount,
        appName: user?.firstName + ' ' + user?.lastName || 'Bondhu Pay',
        paymentMethod: authPaymentsMethods,
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

  // paymentValidate

  async paymentValidate({
    sessionId,
    paymentMethod,
    transactionId,
  }: IPaymentValidate) {
    try {
      // 1. Get payment record
      const payment = await this.paymentModel.findOne({ sessionId }).exec();

      if (!payment) {
        throw new CustomError(
          'Payment not found',
          'Could not find payment',
          HttpStatus.NOT_FOUND,
        );
      }

      if (payment?.sessionTimeout) {
        throw new CustomError(
          'Payment already validated',
          'Payment already validated',
          HttpStatus.NOT_FOUND,
        );
      }

      // 2. Check user is active
      await this.authService.checkUserIsActiveWithUserId({
        id: payment.userId,
      });

      // 3. Get user's auth payment transactions
      const authTransactions =
        await this.authService.findAuthPaymentTranByUserId({
          userId: payment.userId,
        });

      // 4. Match and validate transaction
      const matchedTransaction = authTransactions.find(
        (item) => item.trxId === transactionId,
      );

      if (!matchedTransaction) {
        throw new CustomError(
          'Transaction not found',
          `No matching transaction with ID: ${transactionId}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // 5. Update payment and mark transaction validated
      await this.paymentModel.updateOne(
        { sessionId },
        {
          $set: {
            status: IPaymentSatus.COMPLETED,
            sessionTimeout: true,
            paymentMethod,
          },
        },
      );

      await this.authService.authPaymentTranValidatedByTranId({
        tranId: transactionId,
      });

      return this.responseService.successResponse(
        payment?.successUrl,
        'Payment validated successfully',
      );
    } catch (error) {
      console.error('Payment validation error:', error);

      return this.responseService.throwError(
        error?.message || 'Internal Server Error',
        error?.details || 'Unexpected error occurred while validating payment',
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // canccel
  async paymentCancel({ sessionId }: ICancelPayment) {
    try {
      console.log({ sessionId });
      const payment = await this.paymentModel.findOne({ sessionId }).exec();

      if (!payment) {
        throw new CustomError(
          'Payment not found',
          'Could not find payment',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.paymentModel.updateOne(
        { sessionId },
        {
          $set: {
            status: IPaymentSatus.CANCELLED,
            sessionTimeout: true,
          },
        },
      );
      const res = {
        url: payment?.cancelUrl,
      };
      return this.responseService.successResponse(
        res,
        'Payment cancelled successfully',
      );
    } catch (error) {
      console.error('Payment cancel error:', error);
      return this.responseService.throwError(
        error?.message || 'Internal Server Error',
        error?.details || 'Unexpected error occurred while cancelling payment',
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // paymentReceive
  async paymentReceive({ request }: { request: any }) {
    try {
      console.log({ request });
      const userId = request?.user?.userId;
      const email = request?.user?.email;
      await this.authService.checkUserIsActive({
        id: userId,
        email: email || '',
      });
      const payment = await this.paymentModel
        .find({
          userId,
          status: IPaymentSatus.COMPLETED,
        })
        .exec();
      if (!payment) {
        throw new CustomError(
          'Payment not found',
          'Could not find payment',
          HttpStatus.NOT_FOUND,
        );
      }
      const mdata = payment.map((item) => {
        return {
          id: item?._id.toString(),
          title: item?.paymentMethod,
          type:
            item?.paymentMethod === 'BKASH'
              ? 'Mobile Banking'
              : 'Bank Transfer',
          amount: item?.totalAmount,
          createdAt: item?.['createdAt'],
          status: item?.status,
          transactionId: item?.tranId,
          updatedAt: item?.['updatedAt'],
          method: item?.paymentMethod,
        };
      });
      return this.responseService.successResponse(
        mdata,
        'Payment received successfully',
      );
    } catch (error) {
      console.error('Payment receive error:', error);
      return this.responseService.throwError(
        error?.message || 'Internal Server Error',
        error?.details || 'Unexpected error occurred while receiving payment',
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
