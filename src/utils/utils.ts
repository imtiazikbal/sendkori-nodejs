import { ParsedMessage, SMSBody } from 'src/interface/types';

export function parseSingleMessage({ message }: { message: string }) {
  const trxIdMatch = message.match(/(?:TrxID|tranId)[^\w]?([A-Z0-9]+)/i);
  const fromNumberMatch = message.match(/from\s+(\d{11})/i);
  const amountMatch = message.match(/(?:Tk|৳)\s?([\d,]+\.\d{2})/i);

  return {
    trxId: trxIdMatch?.[1],
    fromNumber: fromNumberMatch?.[1],
    amount: amountMatch
      ? parseFloat(amountMatch[1].replace(/,/g, ''))
      : undefined,
  };
}
