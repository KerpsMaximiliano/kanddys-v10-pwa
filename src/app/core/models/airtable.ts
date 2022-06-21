import { Model } from '../objects/model';

export class TablesWebhooks {
  url: string;
  database: string;
}

export class AirtableConfiguration extends Model<AirtableConfiguration> {
  tableWebhooks: TablesWebhooks[];
}