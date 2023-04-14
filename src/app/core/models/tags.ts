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

export type TagStatus = 'active' | 'disabled' | 'featured';

export class Tag extends Model<Tag> {
  counter: number;
  name: string;
  notes?: string;
  user?: string;
  status: TagStatus;
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
  notes?: string;
  images?: File[];
  notify?: boolean;
  notifyUserOrder?: boolean;
  notifyMerchantOrder?: boolean;
  status?: string;
  merchant?: string;
  index?: number;
  entity?: TagEntityEnum;
}
