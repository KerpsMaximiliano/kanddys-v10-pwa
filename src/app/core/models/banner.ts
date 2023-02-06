import { Model } from "../objects/model";

export class Banner extends Model<Banner> {
  _id: string;
  image: string;
  name: string;
  description: string;
  user: string;
  type: string;
  contact: string;
}

export class BannerInput {
  _id?: string;
  image?: string;
  name?: string;
  description?: string;
  user?: string;
  type?: string;
  contact?: string;
}