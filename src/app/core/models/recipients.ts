import { Model } from '../objects/model';

export class Recipient extends Model<Recipient> {
  name?: string;
  lastName?: string;
  phone: string;
  email: string;
  nickname?: string;
  image?: any;
  tags?: string[];
}

export class RecipientInput {
  name?: string;
  lastName?: string;
  phone: string;
  email: string;
  nickname?: string;
  image?: any;
  tags?: string[];
}
