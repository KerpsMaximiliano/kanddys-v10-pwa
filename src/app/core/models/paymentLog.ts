import { Model } from '../objects/model';

export class PaymentLog extends Model<PaymentLog> {
  user: string;
  paymentMethod: string;
  ammount: number;
  reason: string;
  merchant: string;
  order: string;
  paymentStatus: string;
  metadata: Record<string, any>;
}

export class PaymentLogInput {
  user?: string;
  paymentMethod?: string;
  ammount?: number;
  reason?: string;
  merchant?: string;
  order?: string;
  paymentStatus?: string;
  metadata?: Record<string, any>;
}
