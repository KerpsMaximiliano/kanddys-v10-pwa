import { Model } from "../objects/model";

export class ContactInput {
  description?: string;
  image?: any;
  merchant?: string;
  name?: String;
  decription?: String;
  banner?: string;
}

export class Link extends Model<Link> {
  _id: string;
  image: String;
  name: String;
  value: String;
}

export class Contact extends Model<Contact> {
  _id: string;
  description: string;
  image: string;
  merchant: string;
  name: string;
  decription: string;
  link: Link[];
  banner: string;
  default: boolean;
}