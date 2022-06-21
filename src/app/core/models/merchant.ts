import { Model } from '../objects/model';
import { AirtableConfiguration } from './airtable';
import { SocialMediaModel } from './saleflow';
import { User } from './user';

export class Merchant extends Model<Merchant> {
  owner?: User;
  name: string;
  clientMaxBalance: number;
  location?: { lat: number; long: number };
  email?: string;
  image?: string;
  activity: string;
  bio?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  category?: String
  active?: boolean;
  ipUser?: string;
  hasOwner?: boolean;
  approved?: boolean;
  customFee?: number;
  itemNickname?: String
  packageNickname?: String
  social: SocialMediaModel[];
  airtableConfiguration: AirtableConfiguration;
  tags?: string[];
  reference?: String
  minPaymentQantity?: number;
  collaborationPaymentAmount?: number;
  receiveNotifications?: boolean;
  notes?: String
}

export class EmployeeContract extends Model<EmployeeContract> {
  merchant: Merchant;
  user: User;
  role: string;
}
