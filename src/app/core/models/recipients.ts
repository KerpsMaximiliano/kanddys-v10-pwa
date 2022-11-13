import { Model } from '../objects/model';

export class Recipient extends Model<Recipient> {
  phone: string;
  email: string;
  nickname: string;
}

export class RecipientInput {
  phone: string;
  email: string;
  nickname: string;
}
