import { ParsedMessage, SMSBody } from 'src/interface/types';

export function parseSingleMessage(message: SMSBody): ParsedMessage {
  const { smsBody } = message;
  const fullMessage = smsBody;

  const trxIdMatch = fullMessage.match(/(?:TrxID|tranId)[^\w]?([A-Z0-9]+)/i);
  const fromNumberMatch = fullMessage.match(/from\s+(\d{11})/i);
  const amountMatch = fullMessage.match(/(?:Tk|৳)\s?([\d,]+\.\d{2})/i);

  return {
    fullMessage,
    trxId: trxIdMatch?.[1],
    fromNumber: fromNumberMatch?.[1],
    amount: amountMatch
      ? parseFloat(amountMatch[1].replace(/,/g, ''))
      : undefined,
    senderNumber: message?.senderNumber,
  };
}
