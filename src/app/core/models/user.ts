import { Form, Control } from '@mukuve/ngx-forms';
import { Community } from 'src/app/core/models/community';
import { Model } from './../objects/model';
import {
  DeliveryLocation,
  SocialMediaModel,
  DeliveryLocationInput,
} from './saleflow';
import { Tag } from './tags';

export class IpUser extends Model<IpUser> {
  ip: string;
  country: string;
  city: string;
  user: User;
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
  clientOfMerchants?: string[];

  hasRoles(...roles: string[]): boolean {
    return (this.roles || []).some((r) => roles.includes(r.code));
  }
}

export type MagicLinkEntities =
  | 'Order'
  | 'NonExistingOrder'
  | 'UserAccess'
  | 'PostAccess'
  | 'TemplateAccess'
  | 'MerchantAccess'
  | 'Item'
  | 'NewUser'
  | 'NewMerchant'
  | 'UserUpdate'
  | 'MerchantUpdate'
  | 'NewMerchantToExistingUser';

export class UserInput {
  phone?: string;
  name?: string;
  lastname?: string;
  title?: string;
  email?: string;
  password?: string;
  birthdate?: Date;
  image?: File;
  roles?: string[];
  defaultCommunity?: string;
  facebook?: string;
  instagram?: string;
  web?: string;
  bio?: string;
  deliveryLocations?: DeliveryLocationInput[];
  social?: SocialMediaModel[];
  tags?: string[];
  clientOfMerchants?: string[];
}

export class RecurrentUserData {
  _id: string;
  count: number;
  user: User;
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
