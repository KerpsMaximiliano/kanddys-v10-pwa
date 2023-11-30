import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Chat } from '../models/chat';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private graphql: GraphQLWrapper) {}

  async listMyChats(): Promise<Array<Chat>> {
    try {
      const response = await fetch(environment.chatAPI.url + '/chats', {
        headers: {
          token: localStorage.getItem('session-token'),
          "App-key": "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI"
        },
      });

      const chats = await response.json();

      return chats;
    } catch (error) {
      console.error(error);
    }
  }

  async me(): Promise<{ socketUserId: string, userIdL: string}> {
    try {
      const response = await fetch(environment.chatAPI.url + '/me', {
        headers: {
          token: localStorage.getItem('session-token'),
          "App-key": "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI"
        },
      });

      const me = await response.json();

      return me;
    } catch (error) {
      console.error(error);
    }
  }
}
