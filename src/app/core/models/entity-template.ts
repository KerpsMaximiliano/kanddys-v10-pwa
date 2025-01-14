import { Model } from '../objects/model';

export class EntityTemplate extends Model<EntityTemplate> {
  reference: string;
  entity: string;
  status: string;
  dateId: string;
  user: string;
  recipients: any;
  hasPassword: boolean;
  access: string;
}

export class EntityTemplateInput {
  reference: string;
  entity: string;
  status?: string;
  dateId?: string;
  user?: string;
  recipients?: any;
  access?: string;
  templateNotifications?: Array<{
    key: string;
    message: string;
  }>;
}

export class RecipientsInput {
  edit: boolean;
  recipient: string;
}

export class RecipientInput {
  phone?: string;
  email?: string;
  nickname?: string;
  name?: string;
  lastName?: string;
  image?: File;
}
