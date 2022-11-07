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
  containers?: TagContainers[];
}

export class TagInput {
  name?: string;
  images?: File[];
  notify?: boolean;
  status?: string;
  merchant?: string;
}
