import { Form, Control } from '@mukuve/ngx-forms';
import { Community } from 'src/app/core/models/community';
import { CardData } from './../../shared/components/card/card.component';
import { Model } from './../objects/model';
import { DeliveryLocation, SocialMediaModel } from './saleflow';
import { Tag } from './tags';

export class IpUser extends Model<IpUser> {
  ip: string;
  country: string;
  city: string;
  user: User
}

export class Role {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  code: string;
  name: string;
  description: string;
  }

export class User extends Model<User> {
  email: string;
  phone?: string;
  name?: string;
  lastname: string;
  title?: string;
  birthdate?: Date;
  image?: string;
  roles?: Role[];
  social: SocialMediaModel[];
  defaultCommunity?: Community;
  validatedAt?: string;
  facebook: string;
  instagram: string;
  web: string;
  bio: string;
  deliveryLocations: DeliveryLocation[];
  tags?: string[];

  hasRoles(...roles: string[]): boolean {
    return (this.roles || []).some((r) => roles.includes(r.code));
  }

  toCard(): CardData {
    let title = this.name;
    if (!title.trim()) title = `Unnamed user`;
    return {
      title,
      image: this.image,
      content: `
        <b> Phone: </b> ${this.phone || 'n/a'} <br/>
        <b> Email: </b> ${this.email || 'n/a'} <br/>
      `,
      metadata: {
        recordId: this._id,
      },
    };
  }
}

export class UserForm extends Form {
  constructor(
    title: string = '',
    values?: any,
    morecontrols?: Record<string, Control>
  ) {
    super(title, {
      name: new Control(values?.name, { title: 'Name', order: 2 }),
      email: new Control(values?.email, {
        title: 'Email',
        type: 'input',
        props: { type: 'email' },
        order: 3,
      }),
      ...morecontrols,
    });
  }
}
