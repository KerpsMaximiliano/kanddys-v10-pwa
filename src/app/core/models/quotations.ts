import { Model } from '../objects/model';
import { Merchant } from './merchant';

export class Quotation extends Model<Quotation> {
  name: string;
  items: Array<string>;
  merchant: string;
}

export class QuotationMatches {
  items: Array<string>;
  itemsMax?: number;
  merchant: Merchant;
  total: number;
}

export class QuotationInput {
  name?: string;
  items?: Array<string>;
  merchant?: string;
}
