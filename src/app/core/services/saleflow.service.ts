import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Item, ItemPackage, SearchKeyword } from '../models/item';
import {
  PaginationInput,
  SaleFlow,
  SaleFlowInput,
  SaleFlowModule,
  SaleFlowModuleInput,
} from '../models/saleflow';
import { AppService } from './../../app.service';
import {
  addItemToSaleFlow,
  codeSearchKeywordByType,
  createSaleflow,
  createSaleFlowModule,
  hotListItems,
  hotSaleflow,
  listItemPackage,
  listItems,
  removeItemFromSaleFlow,
  saleflow,
  saleflowDefault,
  saleflows,
  setDefaultSaleflow,
  updateSaleflow,
  updateSaleFlowModule,
} from './../graphql/saleflow.gql';

@Injectable({ providedIn: 'root' })
export class SaleFlowService {
  saleflowLoaded = new Subject();
  saleflowData: SaleFlow;

  private triggerSubject = new Subject<any>();
  trigger = this.triggerSubject.asObservable();

  constructor(private graphql: GraphQLWrapper, private app: AppService) { }

  async saleflow(id: string, isHot?: boolean): Promise<{ saleflow: SaleFlow }> {
    try {
      if (!isHot) {
        const response = await this.graphql.query({
          query: saleflow,
          variables: { id },
          fetchPolicy: 'no-cache',
        });
        return response;
      } else {
        const response = await this.graphql.query({
          query: hotSaleflow,
          variables: { id },
          fetchPolicy: 'no-cache',
        });
        return response;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async saleflowDefault(merchantId: string): Promise<SaleFlow> {
    try {
      const response = await this.graphql.query({
        query: saleflowDefault,
        variables: { merchantId },
        fetchPolicy: 'no-cache',
      });

      if (response) {
        const { saleflowDefault: saleflowDefaultResponse } = response;
        return saleflowDefaultResponse;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async listItems(
    params: PaginationInput,
    justPromise?: boolean,
    searchName?: string
  ): Promise<{ listItems: Item[] }> {
    try {
      if (!justPromise) {
        const response = await this.graphql.query({
          query: listItems,
          variables: { params, searchName },
          fetchPolicy: 'no-cache',
        });
        return response;
      } else {
        const promise = this.graphql.query({
          query: listItems,
          variables: { params, searchName },
          fetchPolicy: 'no-cache',
        });
        return promise;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async codeSearchKeywordByType(
    pagination: PaginationInput,
  ): Promise<SearchKeyword> {
    try {
      const response = await this.graphql.query({
        query: codeSearchKeywordByType,
        variables: { pagination },
        fetchPolicy: 'no-cache',
      });
      return response.codeSearchKeywordByType;
    } catch (e) {
      console.log(e.error);
      return null;
    }
  }

  async hotListItems(params: PaginationInput): Promise<{ listItems: Item[] }> {
    try {
      const response = await this.graphql.query({
        query: hotListItems,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async listItemPackage(
    params: PaginationInput
  ): Promise<{ listItemPackage: ItemPackage[] }> {
    try {
      const response = await this.graphql.query({
        query: listItemPackage,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async saleflows(merchant: string, params: any): Promise<SaleFlow[]> {
    try {
      const response = await this.graphql.query({
        query: saleflows,
        variables: { merchant, params },
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) return undefined;
      return response.saleflows;
    } catch (e) {
      console.log(e);
    }
  }

  async addItemToSaleFlow(
    item: { item: string; customizer?: string; index?: number },
    id: string
  ) {
    const result = await this.graphql.mutate({
      mutation: addItemToSaleFlow,
      variables: { item, id },
    });
  }

  async removeItemFromSaleFlow(item: string, id: string): Promise<SaleFlow> {
    const response = await this.graphql.query({
      query: removeItemFromSaleFlow,
      variables: { item, id },
      fetchPolicy: 'no-cache',
    });
    return response?.removeItemFromSaleFlow;
  }

  async createSaleflow(input: SaleFlowInput) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createSaleflow,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async setDefaultSaleflow(
    merchantId: string,
    id: string
  ): Promise<{ saleflowSetDefault: SaleFlow }> {
    const result = await this.graphql.mutate({
      mutation: setDefaultSaleflow,
      variables: { merchantId, id },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async updateSaleflow(input: SaleFlowInput, id: string): Promise<SaleFlow> {
    const result = await this.graphql.mutate({
      mutation: updateSaleflow,
      variables: { input, id },
    });
    if (!result || result?.errors) return undefined;
    return result.updateSaleflow;
  }

  async createSaleFlowModule(
    input: SaleFlowModuleInput
  ): Promise<SaleFlowModule> {
    const result = await this.graphql.mutate({
      mutation: createSaleFlowModule,
      variables: { input },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async updateSaleFlowModule(
    input: SaleFlowModuleInput,
    id: string
  ): Promise<SaleFlowModule> {
    const result = await this.graphql.mutate({
      mutation: updateSaleFlowModule,
      variables: { input, id },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  notifyTrigger(data: any) {
    this.triggerSubject.next(data);
  }
}
