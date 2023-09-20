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
}
