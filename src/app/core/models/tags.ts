import { Model } from "../objects/model"

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
  messageNotify: string;
  counter: number;
  name: string;
  notify: boolean;
  user: string;
  containers?: TagContainers[];
  notifyUserOrder: boolean;
  notifyMerchantOrder: boolean;
}

export class TagInput {
  messageNotify: string;
  name: string;
  notify: boolean;
}