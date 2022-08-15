import { environment } from 'src/environments/environment';

import { Model } from '../objects/model';
import { User } from './user';
import { fixnumber } from '../helpers/strings.helpers';

export class Community extends Model<Community> {
  owner: User;
  name: string;
  kindcode: string;
  image?: string;
  email?: string;
  purpose?: string;
  mission?: string;
  media?: string[];
  queens?: User[];
  members?: User[];
  collected!: number;
  tocollect!: number;
  cashout?: number;
  reason?: string;
  category?: string;
  collaborationMethod?: string;
  activity: string;

  get invitationLink() {
    return `${environment.uri}/invitation/community/${this._id}`;
  }
}
