import { Injectable } from '@nestjs/common';
import {
  IAuthPaymentTran,
  ICancelPayment,
  IPaymentData,
  IPaymentValidate,
  SMSBody,
} from '../../interface/types';
import { AuthService } from 'src/auth/service/auth.service';
import { parseSingleMessage } from 'src/utils/utils';

@Injectable()
export class AppService {
  constructor(private readonly authService: AuthService) {}
  getHello(): string {
    return 'Hello World!';
  }

  async paymentWebHook({ smsBody }: { smsBody: any }) {
    const { fullMessage, trxId, fromNumber, amount, senderNumber } =
      parseSingleMessage(smsBody);
    return this.authService.storeAuthPaymentTran({
      fullMessage,
      incomingTime: smsBody?.incomingTime,
      key: smsBody?.key,
      senderNumber,
      amount,
      fromNumber,
      trxId: trxId,
    });
  }
}
