import { Model } from '../objects/model';
import { Gift } from './gift';
import { Currency } from './item';
import { Merchant } from './merchant';
import { DateModel } from './calendar';
import { User } from './user';

export class PossibleDates extends Model<PossibleDates> {
  date: DateModel;
  vote: User[];
}

export class Voucher extends Model<Voucher> {
  name: string;
  description: string;
  creator: Merchant;
  owner: User;
  referralUser: User;
  users: User[];
  ammount: number;
  currency: Currency;
  gift: Gift;
  confirmedDate: DateModel;
  possibleDates: PossibleDates[];
  startDate: string;
  expirationDate: string;
  maxUsers: number;
  voucherStatus: string;
  voucherType: string;
  confirmation: Object;
  active: boolean;
  fixedCollaboration: number;
  percentageCollaboration: number;
  fixedReferralCollaboration: number;
  restrictions: string[];
}
