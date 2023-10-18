import { Model } from '../objects/model';

export class ContactInput {
  description?: string;
  image?: any;
  merchant?: string;
  type?: 'user' | 'merchant';
  name?: String;
  decription?: String;
  banner?: string;
  default?: boolean;
}

export class LinkInput {
  image?: File;
  name?: string;
  value?: string;
}

export class Link extends Model<Link> {
  image: string;
  name: string;
  value: string;
}

export class Contact extends Model<Contact> {
  description: string;
  image: string;
  merchant: string;
  user: string;
  type: 'user';
  name: string;
  decription: string;
  link: Link[];
  banner: string;
  default: boolean;
}
