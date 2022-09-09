import { Receipt } from './receipt';
import { Model } from '../objects/model';
import * as moment from 'moment';

export class Trigger extends Model<Trigger> {
  image: string;
  kindcode?: string;
  result?: Receipt;

  get status() {
    return this.result ? 'Accepted' : 'Pending';
  }
}
