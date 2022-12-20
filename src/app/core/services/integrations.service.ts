import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  integrations,
  integrationPaymentMethod,
} from '../graphql/integrations.gql';
import { PaginationInput } from '../models/saleflow';

@Injectable({
  providedIn: 'root',
})
export class IntegrationsService {
  constructor(private graphql: GraphQLWrapper) {}

  async integrations(
    paginate: PaginationInput = {
      findBy: {
        entity: 'merchant',
      },
    }
  ): Promise<any[]> {
    try {
      const result = await this.graphql.query({
        query: integrations,
        variables: { pagination: paginate },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.integrations;
    } catch (e) {
      console.log(e);
    }
  }

  async integrationPaymentMethod(
    paymentMethod: string,
    merchantId: string
  ): Promise<boolean> {
    try {
      const result = await this.graphql.query({
        query: integrationPaymentMethod,
        variables: { paymentMethod, merchantId },
        fetchPolicy: 'no-cache',
      });
      if (!result) return undefined;
      return result.integrationPaymentMethod;
    } catch (e) {
      console.log(e);
    }
  }
}
