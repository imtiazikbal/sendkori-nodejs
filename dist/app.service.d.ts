import { ICancelPayment, IPaymentValidate, PaymentData } from './types';
export declare class AppService {
    getHello(): string;
    payment(): {
        url: string;
    };
    paymentData({ sessionId }: {
        sessionId: string;
    }): {
        status: string;
        data: PaymentData;
        message: string;
    };
    paymentValidate({ sessionId, method, transactionId }: IPaymentValidate): {
        status: string;
        data: {
            url: string;
            id: string;
            status: string;
            amount: number;
            appName: string;
        };
        message: string;
    };
    paymentCancel({ sessionId }: ICancelPayment): {
        status: string;
        data: {
            url: string;
            id: string;
            status: string;
            amount: number;
            appName: string;
        };
        message: string;
    };
}
