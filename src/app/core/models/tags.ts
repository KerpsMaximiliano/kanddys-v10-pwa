import { Model } from '../objects/model';

export class TagContainers extends Model<TagContainers> {
  phone: string;
  notify: boolean;
  name: string;
}

export class TagContainersInput {
  phone: string;
  notify?: boolean;
  name?: string;
}

export class Tag extends Model<Tag> {
  counter: number;
  name: string;
  user?: string;
  status: string;
  notifications: string[];
  merchant: string;
}

export class TagInput {
  name?: string;
  notifyUserOrder?: boolean;
  notifyMerchantOrder?: boolean;
  status?: string;
  merchant?: string;
}
