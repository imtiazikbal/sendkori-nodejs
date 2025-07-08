import { AppService } from './app.service';
import { ICancelPayment, IPaymentValidate } from './types';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(body: any): void;
    paymentMethod(): {
        url: string;
    };
    paymentData(sessionId: string): {
        status: string;
        data: import("./types").PaymentData;
        message: string;
    };
    paymentValidate(body: IPaymentValidate): {
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
    paymentCancel(body: ICancelPayment): {
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
