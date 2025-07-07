import { AppService } from './app.service';
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
}
