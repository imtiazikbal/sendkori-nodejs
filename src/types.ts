type PaymentMethodType = 'mobile_payment' | 'card' | 'bank_transfer';

interface PaymentMethod {
  name: string;
  type: PaymentMethodType;
  provider: string;
}

export interface PaymentData {
  url: string;
  id: string;
  appName: string;
  status: 'pending' | 'completed' | 'failed' | 'initial';
  amount: number;
  paymentMethod: PaymentMethod[];
}
