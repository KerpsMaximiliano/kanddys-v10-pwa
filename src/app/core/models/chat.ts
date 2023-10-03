export interface Chat {
  name?: string;
  description?: string;
  owners: Array<string>;
  messages: Array<any>;
  admins: Array<string>;
  isGroup: boolean;
  _id: string;
}

export interface Message {
  message: string;
  sender: string;
  chatId: string;
}
