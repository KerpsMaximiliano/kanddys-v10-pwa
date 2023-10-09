import { Model } from '../objects/model';

interface Owner extends Model<Owner> {
  connected: boolean;
  socketsId: Array<string>;
  userId: string;
}

export interface Chat extends Model<Chat> {
  name?: string;
  description?: string;
  owners: Array<Owner>;
  messages: Array<any>;
  admins: Array<string>;
  isGroup: boolean;
  lastMessageWritten?: string;
  _id: string;
}

export interface Message {
  message: string;
  sender: string;
  chatId: string;
}
