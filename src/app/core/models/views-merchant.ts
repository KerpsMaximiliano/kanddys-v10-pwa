import { Model } from '../objects/model';
import { SocialMediaModel, SocialMediaModelInput } from './saleflow';

export enum TypeViewsMerchantEnum {
  POLITICS = 'politics',
  TERMS = 'terms',
  CONTACT = 'contact',
  REFUND = 'refund',
  DELIVERY = 'delivery-politics',
}

export class NumerationInput {
  value: string;
}

export class Numeration extends Model<Numeration> {
  value: string;
}

export class ViewsMerchantInput {
  merchant: string;
  type: TypeViewsMerchantEnum;
  description: string;
  numeration: Array<NumerationInput>;
  socialMedia: Array<SocialMediaModelInput>;
}

export class ViewsMerchant extends Model<ViewsMerchant> {
  merchant: string;
  type: TypeViewsMerchantEnum;
  description: string;
  numeration: Array<Numeration>;
  socialMedia: Array<SocialMediaModel>;
}
