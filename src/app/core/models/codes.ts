import { Model } from '../objects/model';
import { IpUser, User } from './user';
import { CommunityCategory } from './community-categories';

export class Code extends Model<Code> {
  description?: string;
  reference?: string;
  keyword: string;
  link: string;
  qrColor: string;
  image: string;
  user?: User;
  category?: CommunityCategory
  status?: boolean;
  ipUser?: IpUser
  type?: string
}

export class CodeInput {
  description?: string;
  user?: string;
  keyword: string;
  link?: string;
  qrColor?: string;
  image?: File;
  model?: string;
  type?: string;
  reference?: string;
  category?: string;
  quantity?: number;
}
