import { environment } from 'src/environments/environment';
import { CardData } from 'src/app/shared/components/card/card.component';

import { Model } from '../objects/model';
import { Community } from './community';
import { Merchant } from './merchant';

export class Partner extends Model<Partner> {
  merchant: Merchant;
  community: Community;
  percent!: number;
  userPercent!: number;

  get receiptsLink() {
    return `${environment.uri}/partner/receipts/${this._id}`;
  }

  toCard(): CardData {
    return {
      title: this.merchant.name,
      image: this.merchant.image || `${environment.assetsUrl}/noimage.png`,
      content: `
        <b> Hive profit: </b> ${this.percent || 0}%
        <br/>
        <b> Bee profit: </b> ${this.userPercent || 0}%
      `,
      metadata: {
        receiptsLink: this.receiptsLink,
        merchantName: this.merchant.name,
        recordId: this._id,
      },
    };
  }
}
