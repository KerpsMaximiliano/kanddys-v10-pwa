import { SafeHtml } from '@angular/platform-browser';
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
  messages: Array<Message>;
  admins: Array<string>;
  isGroup: boolean;
  lastMessageWritten?: string;
  drafts?: Array<{
    userId: string;
    content: string;
  }>;
  _id: string;
}

export interface Message {
  message: string | SafeHtml;
  sender: string;
  chatId: string;
}
