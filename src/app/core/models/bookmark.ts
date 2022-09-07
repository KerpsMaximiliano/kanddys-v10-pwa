import { Model } from '../objects/model';
import { Code } from './codes';
import { Community } from './community';
import { Gift } from './gift';
import { Currency, Item } from './item';
import { Merchant } from './merchant';
import { Post } from './post';
import { IpUser, User } from './user';

export class Category extends Model<Category> {
  merchant: Merchant;
  name: string;
  description: string;
}

export class Need extends Model<Need> {
  name: string;
  image: string;
  description: string;
  isPhysical: boolean;
  purchaseLocations: string[];
  tags: string[];
  currency: Currency;
  pricing: number;
  provider: Merchant;
  category: Category;
}

export class Mark extends Model<Mark> {
  post: Post;
  code: Code;
  gift: Gift;
  need: Need;
  item: Item;
  markType: String;
  tag: string[];
  own: boolean;
  refBookmark: string;
}

export class BookMark extends Model<BookMark> {
  marks: Mark[];
  user: User;
  community: Community;
  ipUser: IpUser;
}
