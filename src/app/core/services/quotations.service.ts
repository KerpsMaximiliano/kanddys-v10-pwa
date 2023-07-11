import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { createQuotation } from '../graphql/quotations.gql';

@Injectable({
  providedIn: 'root',
})
export class QuotationsService {
  constructor(private graphql: GraphQLWrapper) {}

  async createQuotation(merchantId: string, input: any): Promise<any> {
    const result = await this.graphql.mutate({
      mutation: createQuotation,
      variables: { merchantId, input },
    });
    return result?.createQuotation;
  }
}
