import { PaymentData } from './types';
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
}
