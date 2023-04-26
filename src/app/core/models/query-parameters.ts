import { Model } from '../objects/model';

export class QueryParameter extends Model<QueryParameter> {
  name: string;
  description: string;
  merchant: string;
  from: QueryParameterDate;
  until: QueryParameterDate;
  entity: string;
  order: string;
  findBy: Record<string, any>;
  active: boolean;
}

export class QueryParameterDate {
  date: Date;
  active: boolean
}


export class QueryParameterInput {
    name?: string;
    description?: string;
    from?: QueryParameterDateInput;
    until?: QueryParameterDateInput;
    entity?: string;
    findBy?: Record<string, any>;
    active?: boolean;
}

export class QueryParameterDateInput {
    date: Date;
    active?: boolean
}