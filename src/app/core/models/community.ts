import { environment } from 'src/environments/environment';

import { Model } from '../objects/model';
import { CardData } from './../../shared/components/card/card.component';
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

  toCard(medatata?: any): CardData {
    const { user } = medatata || {};
    const defaultId = user?.defaultCommunity?._id;
    return {
      image: this.image || `${environment.assetsUrl}/noimage.png`,
      title: `${this.name}`,
      content: `
        ${this.kindcode}
        ${
          defaultId === this._id
            ? '<br/><br/><span class="text-primary" style="align-self: flex-end"> This is your default hive </span>'
            : ''
        }
      `,
      accent: {
        content: `
          <span> $${fixnumber(this.tocollect)} </span>
          <span class="text-small text-nowrap"> to collect </span>
        `,
      },
      metadata: {
        recordId: this._id,
        invitation: this.invitationLink,
      },
    };
  }
}
