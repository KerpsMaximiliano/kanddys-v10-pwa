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
  images?: [string];
  notifications: string[];
  merchant: string;
  entity?: string;
  index?: number;
  containers?: TagContainers[];
}

type TagEntityEnum = 'user' | 'order' | 'item' | 'recipient' | 'merchant';

export class TagInput {
  name?: string;
  images?: File[];
  notify?: boolean;
  notifyUserOrder?: boolean;
  notifyMerchantOrder?: boolean;
  status?: string;
  merchant?: string;
  index?: number;
  entity?: TagEntityEnum;
}
