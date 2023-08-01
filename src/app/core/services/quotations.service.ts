import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { PaginationInput, PaginationOptionsInput } from '../models/saleflow';
import { Quotation, QuotationInput } from '../models/quotations';
import {
  createQuotation,
  deleteQuotation,
  quotation,
  quotationCoincidences,
  quotationCoincidencesByItem,
  quotationPublic,
  quotations,
  updateQuotation,
} from '../graphql/quotations.gql';
import { Subscription } from 'rxjs';
import { Item, ItemInput } from '../models/item';
import { ExtendedItemInput } from './items.service';

export interface QuotationItem extends Item {
  inSaleflow?: boolean;
  valid: boolean;
  indexInFullList?: number;
}

@Injectable({
  providedIn: 'root',
})
export class QuotationsService {
  cartRouteChangeSubscription: Subscription = null;
  quotationItemsBeingEdited: Array<Item> = null;
  quotationItemsInputBeingEdited: Array<ItemInput> = null;
  quotationBeingEdited: Quotation = null;
  quotationInCart: Quotation = null;

  //Variables for keeping track of the items that are being added to a quotation before said quotation is created
  //Or while you are editing it
  selectedItemsForQuotation: Array<string> = [];
  quotationToUpdate: Quotation = null; 

  typeOfQuotationBeingEdited: 'DATABASE_QUOTATION' | 'TEMPORAL_QUOTATION' = 'DATABASE_QUOTATION';
  typeOfProvider: 'REGISTERED_SUPPLIER' | 'NEW_SUPPLIER' = null;

  //specific variables for the case when no user session is found when creating a quotation
  temporalQuotations: Array<QuotationInput> = [];
  selectedTemporalQuotation: QuotationInput = null;

  //specific variables for when a provider is adjusting item information of a quotation
  temporalQuotationBeingEdited: QuotationInput = null;

  supplierItemBeingEdited: Item = null;
  fetchSupplierItem: boolean = true;
  
  supplierItemsAdjustmentsConfig: {
    typeOfProvider: 'REGISTERED_SUPPLIER' | 'NEW_SUPPLIER',
    typeOfRequester: 'REGISTERED_USER' | 'UNSPECIFIED_USER',
    typeOfQuotationBeingEdited: 'DATABASE_QUOTATION' | 'TEMPORAL_QUOTATION',
    requesterId?: string,
    supplierMerchantId?: string;
    globalSupplieritemIdsInQuotation: Array<string>,
    supplierSpecificOtemIdsInQuotation: Array<string>,
    quotationItems: Array<QuotationItem>,
    itemsThatArentInSupplierSaleflow?: Array<ItemInput>,
    quotationId?: string;
    quotationItemBeingEdited?: {
      id?: string,
      inSaleflow: boolean
      indexInQuotations: number;
      quotationItemInMemory: boolean,
    };
  } = null;

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

  async quotationCoincidencesByItem(
    paginationOptionsInput: PaginationOptionsInput,
    categories: Array<string>,
    itemId: Array<string>
  ): Promise<Array<any>> {
    try {
      const result = await this.graphql.query({
        query: quotationCoincidencesByItem,
        variables: {
          paginationOptionsInput,
          categories,
          itemId,
        },
        fetchPolicy: 'no-cache',
      });

      if (!result || result?.errors) return undefined;
      return result?.quotationCoincidencesByItem;
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

  async quotationPublic(id: string): Promise<Quotation> {
    try {
      const result = await this.graphql.query({
        query: quotationPublic,
        variables: { id },
        fetchPolicy: 'no-cache',
      });

      if (!result || result?.errors) return undefined;
      return result?.quotationPublic;
    } catch (e) {
      console.log(e);

      return e;
    }
  }


  async createQuotation(
    merchantId: string,
    input: QuotationInput
  ): Promise<Quotation> {
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
