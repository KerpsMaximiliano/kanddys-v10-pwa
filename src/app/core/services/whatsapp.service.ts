import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { PaginationInput, PaginationOptionsInput } from '../models/saleflow';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WhatsappService {
  constructor(private graphql: GraphQLWrapper) {}

  async requestAuthQrCode(): Promise<string | null> {
    try {
      let requestResponse = await fetch(
        `${environment.api.url}/whatsapp/qrcode`,
        {
          headers: {
            'App-Key': `${environment.api.key}`,
            Authorization: 'Bearer ' + localStorage.getItem('session-token'),
          },
        }
      );

      let base64 = await requestResponse.text();

      return base64;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async createClient(): Promise<string | null> {
    try {
      let requestResponse = await fetch(
        `${environment.api.url}/whatsapp/createClient`,
        {
          method: 'POST',
          headers: {
            'App-Key': `${environment.api.key}`,
            Authorization: 'Bearer ' + localStorage.getItem('session-token'),
          },
        }
      );

      let base64 = await requestResponse.text();

      return base64;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async clientConnectionStatus() {
    try {
      let requestResponse = await fetch(
        `${environment.api.url}/whatsapp/clientConnectionStatus`,
        {
          headers: {
            'App-Key': `${environment.api.key}`,
            Authorization: 'Bearer ' + localStorage.getItem('session-token'),
          },
        }
      );

      let data = await requestResponse.json();

      if(typeof data === 'boolean') return data;
      else {
        throw Error('Error while checking whatsapp status')
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async destroyClient(): Promise<boolean> {
    let requestResponse = await fetch(
      `${environment.api.url}/whatsapp/destroyClient`,
      {
        method: 'POST',
        headers: {
          'App-Key': `${environment.api.key}`,
          Authorization: 'Bearer ' + localStorage.getItem('session-token'),
        },
      }
    );

    let destroyed = await requestResponse.json();

    console.log('destroyed', destroyed);

    return destroyed;
  }
}
