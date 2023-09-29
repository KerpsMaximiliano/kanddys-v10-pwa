import { Model } from '../objects/model';
import { AirtableConfiguration, AirtableConfigurationInput } from './airtable';
import { SocialMediaModel, SocialMediaModelInput } from './saleflow';
import { User } from './user';

export class Category {
  _id: string;
  name: string;
  description: string;
  type: string;
}

export class Merchant extends Model<Merchant> {
  owner?: User;
  name: string;
  slug: string;
  clientMaxBalance: number;
  location?: { lat: number; long: number };
  title?: string;
  email?: string;
  image?: string;
  activity: string;
  bio?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  category?: String;
  categories?: Category[];
  active?: boolean;
  ipUser?: string;
  hasOwner?: boolean;
  approved?: boolean;
  customFee?: number;
  itemNickname?: String;
  packageNickname?: String;
  social: SocialMediaModel[];
  showItems: boolean;
  airtableConfiguration: AirtableConfiguration;
  contactFooter: boolean;
  tags?: string[];
  reference?: String;
  minPaymentQantity?: number;
  collaborationPaymentAmount?: number;
  receiveNotifications?: boolean;
  address?: string;
  notes?: String;
  receiveNotificationsMainPhone?: boolean;
  secondaryContacts?: string[];
  default?: boolean;
  roles?: Roles[]
}

interface Roles {
  _id: string
  code: 'STORE' | 'PROVIDERS' | 'PROVIDER' | 'DEFAULT'
  name: string
}

export class EmployeeContract extends Model<EmployeeContract> {
  merchant: Merchant;
  user: User;
  role: string;
}

export class MerchantInput {
  name?: string;
  owner?: string;
  clientMaxBalance?: number;
  image?: File;
  activity?: string;
  bio?: string;
  title?: string;
  email?: string;
  location?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  category?: string;
  customFee?: number;
  itemNickname?: string;
  packageNickname?: string;
  social?: SocialMediaModelInput[];
  showItems?: Boolean;
  airtableConfiguration?: AirtableConfigurationInput;
  contactFooter?: boolean;
  tags?: string[];
  reference?: string;
  minPaymentQantity?: number;
  collaborationPaymentAmount?: number;
  receiveNotifications?: Boolean;
  notes?: string;
  address?: string;
  slug?: string;
  categories?: string[];
}
