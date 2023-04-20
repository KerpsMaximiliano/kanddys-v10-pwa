import { Model } from '../objects/model';
import { AirtableConfiguration } from './airtable';

export class Integration extends Model<Integration> {
  entity: string;
  reference: string;
  merchant: string;
  airtable?: AirtableConfiguration;
  azul?: {
    id: string;
  };
  key: string;
  active: boolean;
}
