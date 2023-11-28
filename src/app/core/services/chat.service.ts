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
    const url = `${environment.api.url}/configuration`;
    const headers = new HttpHeaders()
      .set('App-Key', "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI")
      .set('token', localStorage.getItem('session-token'));
    this.http.post(url, body, { headers }).toPromise();
    try {
      const response = await this.http.post(url, body, { headers }).toPromise();

     console.log(response);

      return response;
    } catch (error) {
      console.error(error);
    }
  }
}
