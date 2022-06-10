import { Model } from '../objects/model';
import { User } from './user';

export class PaymentReceiver extends Model<PaymentReceiver> {
    name: string;
    image: string;
}

export class ElectronicPayment extends Model<ElectronicPayment> {
    paymentReceiver: PaymentReceiver;
    isActive: boolean;
    email: string;
}

export class ExchangeData extends Model<ExchangeData> {
    electronicPayment: ElectronicPayment[]
    bank: Bank[];
    user: User;
}

export class Bank extends Model<Bank> {
    typeAccount: string;
    ownerAccount: string;
    paymentReceiver: PaymentReceiver;
    isActive: boolean
    account: string;
    routingNumber: number;

    name?: string;
}

export class ElectronicPaymentInput {
    paymentReceiver: string;
    isActive?: boolean;
    email: string;
}

export class BankInput {
    paymentReceiver: string;
    typeAccount: string;
    ownerAccount: string;
    isActive: boolean;
    account: string;
    routingNumber: number;
}

export class ExchangeDataInput {
    electronicPayment?: ElectronicPaymentInput[];
    bank: BankInput[];
}