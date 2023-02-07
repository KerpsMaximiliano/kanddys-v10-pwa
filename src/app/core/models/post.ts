import { Model } from '../objects/model';
import { VisitorCounter } from './item';
import { SocialMediaModel, SocialMediaModelInput } from './saleflow';
import { IpUser, User } from './user';

export class Target extends Model<Target> {
  emailOrPhone: string;
  name: string;
}

export class TargetInput {
  emailOrPhone: string;
  name: string;
}

export class IlustrationInput {
  name: string;
  type: number;
  line1: string;
  line2: string;
  showDecoration: boolean;
  background: string;
  backgroundTextType: number;
  borderRadius: boolean;
  text: string;
}

export class SlideInput {
  media?: File;
  url?: string;
  ilustration?: IlustrationInput;
  title?: string;
  text: string;
  index: number;
  type: 'audio' | 'poster' | 'text';
}

export class Post extends Model<Post> {
  socialNetworks: SocialMediaModel[];
  to: string;
  title: string;
  author: User;
  from: string;
  headline: string;
  headlineBackground: string;
  occasion: string;
  message: string;
  targets: Target[];
  privateMessage: string;
  multimedia: string[];
  password: string;
  active: Boolean;
  address: string;
  type: string;
  validatedAt: Date;
  ipUser: IpUser;
  status: String;
  tags: string[];
  visitorCounter: VisitorCounter;
  joke?: string;
}

export class PostInput {
  socialNetworks?: SocialMediaModelInput[];
  to?: string;
  title?: string;
  from?: string;
  headline?: string;
  headlineBackground?: string;
  author?: string;
  message?: string;
  occasion?: string;
  targets?: TargetInput[];
  slides?: SlideInput[];
  privateMessage?: string;
  multimedia?: File[];
  address?: string;
  expiration?: string;
  password?: string;
  type?: string;
  joke?: string;
}

export class Slide extends Model<Slide> {
  media: string;
  ilustration: Ilustration;
  title: string;
  text: string;
  post: Post;
  index: number;
  expireAt: Date;
  isMediaText: boolean;
  type: 'audio' | 'poster' | 'text';
}

export class Ilustration extends Model<Ilustration> {
  name: string;
  type: number;
  line1: string;
  line2: string;
  showDecoration: boolean;
  background: string;
  backgroundTextType: number;
  borderRadius: boolean;
  text: string;
}
