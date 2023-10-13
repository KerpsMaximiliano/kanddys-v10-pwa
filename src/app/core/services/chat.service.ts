import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Chat } from '../models/chat';

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
        },
      });

      const chats = await response.json();

      return chats;
    } catch (error) {
      console.error(error);
    }
  }
}
