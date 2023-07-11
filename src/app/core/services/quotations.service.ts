import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { PaginationInput } from '../models/saleflow';
import { Quotation } from '../models/quotations';
import {
  createQuotation,
  deleteQuotation,
  quotation,
  quotations,
} from '../graphql/quotations.gql';

@Injectable({
  providedIn: 'root',
})
export class QuotationsService {
  constructor(private graphql: GraphQLWrapper) {}

  async quotations(input?: PaginationInput): Promise<Quotation[]> {
    try {
      const result = await this.graphql.query({
        query: quotations,
        variables: { input },
        fetchPolicy: 'no-cache',
      });

      if (!result || result?.errors) return undefined;
      return result.quotations;
    } catch (e) {
      console.log(e);
    }
  }

  async quotation(id: string): Promise<Quotation> {
    try {
      const result = await this.graphql.query({
        query: quotation,
        variables: { id },
        fetchPolicy: 'no-cache',
      });

      if (!result || result?.errors) return undefined;
      return result?.quotation;
    } catch (e) {
      console.log(e);
    }
  }

  async createQuotation(merchantId: string, input: any): Promise<any> {
    const result = await this.graphql.mutate({
      mutation: createQuotation,
      variables: { merchantId, input },
    });
    return result?.createQuotation;
  }

  async deleteQuotation(id: string): Promise<any> {
    const result = await this.graphql.mutate({
      mutation: deleteQuotation,
      variables: { id },
    });
    return result?.deleteQuotation;
  }
}
