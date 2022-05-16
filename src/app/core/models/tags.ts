import { Model } from "../objects/model"

export class Tag extends Model<Tag>{
  messageNotify: string;
  counter: number;
  name: string;
  notify: boolean;
  user: string;
}
export class TagInput {
  messageNotify: string;
  name: string;
  notify: boolean;
}