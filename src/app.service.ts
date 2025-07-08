import { Injectable } from '@nestjs/common';
import { ICancelPayment, IPaymentValidate, PaymentData } from './types';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  payment() {
    const session = '55664477889900';
    const data = {
      url: `https://sendkori.vercel.app/?session_id=${session}`,
    };

    return data;
  }

  paymentData({ sessionId }: { sessionId: string }) {
    const data: PaymentData = {
      url: `https://sendkori.vercel.app/?session_id=${sessionId}`,
      id: '1',
      status: 'initial',
      amount: 1000,
      appName: 'Next Byte',
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

    return {
      status: 'success',
      data: data,
      message: 'Success',
    };
  }

  paymentValidate({ sessionId, method, transactionId }: IPaymentValidate) {
    console.log({ sessionId, method, transactionId });
    const data = {
      url: `https://request.hellotask.app/success.php`,
      id: '1',
      status: 'initial',
      amount: 1000,
      appName: 'Next Byte',
    };
    return {
      status: 'success',
      data: data,
      message: 'Success',
    };
  }

  paymentCancel({ sessionId }: ICancelPayment) {
    console.log({ sessionId });
    const data = {
      url: `https://request.hellotask.app`,
      id: '1',
      status: 'initial',
      amount: 1000,
      appName: 'Next Byte',
    };
    return {
      status: 'success',
      data: data,
      message: 'Success',
    };
  }
}
