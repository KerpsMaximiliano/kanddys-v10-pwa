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
}
