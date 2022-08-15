import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  gift,
  availableGifts,
  grantMerchantGift,
  giftsByMerchant,
  createMerchantGift,
} from '../graphql/gifts.gql';
import { Router } from '@angular/router';
import { Gift } from '../models/gift';

@Injectable({
  providedIn: 'root',
})
export class GiftsService {
  constructor(
    private graphql: GraphQLWrapper,
    private http: HttpClient,
    private router: Router
  ) {}

  url = environment.APIREST;

  async gift(id: string): Promise<{ gift: Gift }> {
    let value = await this.graphql.query({
      query: gift,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    return value;
  }

  async availableGifts(params: any) {
    let value = await this.graphql.query({
      query: availableGifts,
      variables: { params },
      fetchPolicy: 'no-cache',
    });
    return value;
  }

  async grantMerchantGift(giftId: string) {
    console.log(giftId);
    const result = await this.graphql.mutate({
      mutation: grantMerchantGift,
      variables: { giftId },
    });
    return result;
  }

  async giftsByMerchant(merchantId: string) {
    const result = await this.graphql.query({
      query: giftsByMerchant,
      variables: { merchantId },
      fetchPolicy: 'no-cache',
    });
    return result;
  }

  async createMerchantGift(input) {
    try {
      const result = await this.graphql.mutate({
        mutation: createMerchantGift,
        variables: { input },
      });

      return result;
    } catch (e) {
      console.log(e);
      this.router.navigate(['others/error-screen']);
    }
  }
}
