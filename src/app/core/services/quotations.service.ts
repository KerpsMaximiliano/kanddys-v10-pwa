import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { PaginationInput, PaginationOptionsInput } from '../models/saleflow';
import { Quotation, QuotationInput } from '../models/quotations';
import {
  createQuotation,
  deleteQuotation,
  quotation,
  quotationCoincidences,
  quotations,
  updateQuotation,
} from '../graphql/quotations.gql';
import { Subscription } from 'rxjs';
import { Item, ItemInput } from '../models/item';


@Injectable({
  providedIn: 'root',
})
export class QuotationsService {
  cartRouteChangeSubscription: Subscription = null;
  quotationItemsBeingEdited: Array<Item> = null;
  quotationItemsInputBeingEdited: Array<ItemInput> = null;
  quotationBeingEdited: Quotation = null;
  quotationInCart: Quotation = null;
  isANewMerchantAdjustingAQuotation: boolean = false;
  selectedItemsForQuotation: Array<string> = [];

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

  async quotationCoincidences(
    id: string,
    paginationOptionsInput: PaginationOptionsInput
  ): Promise<Array<any>> {
    try {
      const result = await this.graphql.query({
        query: quotationCoincidences,
        variables: { id, paginationOptionsInput },
        fetchPolicy: 'no-cache',
      });

      if (!result || result?.errors) return undefined;
      return result?.quotationCoincidences;
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

      return e;
    }
  }

  async createQuotation(
    merchantId: string,
    input: QuotationInput
  ): Promise<any> {
    const result = await this.graphql.mutate({
      mutation: createQuotation,
      variables: { merchantId, input },
    });
    return result?.createQuotation;
  }

  async updateQuotation(input: QuotationInput, id: string): Promise<Quotation> {
    const result = await this.graphql.mutate({
      mutation: updateQuotation,
      variables: { input, id },
    });
    return result?.updateQuotation;
  }

  async deleteQuotation(id: string): Promise<any> {
    const result = await this.graphql.mutate({
      mutation: deleteQuotation,
      variables: { id },
    });
    return result?.deleteQuotation;
  }
}
