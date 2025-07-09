import { IPaymentMethod } from 'src/payment/schema/payment.schema';

type PaymentMethodType = 'mobile_payment' | 'card' | 'bank_transfer';

interface PaymentMethod {
  name: string;
  type: PaymentMethodType;
  provider: string;
}

export interface IPaymentData {
  appName: string;
  amount: number;
  paymentMethod: PaymentMethod[];
}

export interface IPaymentValidate {
  paymentMethod: IPaymentMethod;
  sessionId?: string;
  transactionId: string;
}

export interface ICancelPayment {
  sessionId?: string;
}

export interface IAuth {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export interface IJwtPayload {
  sub: string; // user ID
  email: string;
}

export enum StatusEnum {
  ACTIVE = '1',
  INACTIVE = '0',
}

export interface ICreateApi {
  name: string;
}

export interface IAuthPaymentTran {
  key: string;
  senderNumber: string;
  incomingTime: number;
  fullMessage?: string;
  trxId?: string;
  fromNumber?: string;
  amount?: number;
}

export type SMSBody = {
  key: string;
  senderNumber: string;
  smsBody: string;
  incomingTime: number;
};

export type ParsedMessage = {
  fullMessage: string;
  trxId?: string;
  fromNumber?: string;
  amount?: number;
  senderNumber: string;
};
