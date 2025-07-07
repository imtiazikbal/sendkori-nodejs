"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = class AppService {
    getHello() {
        return 'Hello World!';
    }
    payment() {
        const session = '55664477889900';
        const data = {
            url: `https://sendkori.vercel.app/?session_id=${session}`,
        };
        return data;
    }
    paymentData({ sessionId }) {
        const data = {
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
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map