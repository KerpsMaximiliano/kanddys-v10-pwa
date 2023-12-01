import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Chat } from '../models/chat';
import { User } from '../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private graphql: GraphQLWrapper, private http: HttpClient) {}

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

  async getConfiguration(): Promise<any> {
    try {
      const response = await fetch(environment.chatAPI.url + '/configuration', {
        headers: {
          "App-key": "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI",
          token: localStorage.getItem('session-token'),
        },
      });

      const configuration = await response.json();

      return configuration;
    } catch (error) {
      console.error(error);
    }
  }

  async updateConfiguration(body: any): Promise<any> {
    try {
      let response = await fetch(
        `${environment.chatAPI.url}/configuration`,
        {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'App-Key': "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI",
            'token': localStorage.getItem('session-token'),
            'content-Type': 'application/json',
            'accept': '*/*',
          },
        }
      );

      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async addDomain(body: any): Promise<any> {
    try {
      let response = await fetch(
        `${environment.chatAPI.url}/configuration/domain/add`,
        {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'App-Key': "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI",
            'token': localStorage.getItem('session-token'),
            'content-Type': 'application/json',
            'accept': '*/*',
          },
        }
      );

      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async removeDomain(domainId: string): Promise<any> {
    try {
      let response = await fetch(
        `${environment.chatAPI.url}/configuration/domain/remove/${domainId}`,
        {
          method: 'POST',
          headers: {
            'App-Key': "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI",
            'token': localStorage.getItem('session-token'),
            // 'content-Type': 'application/json',
            'accept': '*/*',
          },
        }
      );

      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
