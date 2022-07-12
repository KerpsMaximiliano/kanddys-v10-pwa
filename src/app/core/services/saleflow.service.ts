import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { ListParams } from '../types/general.types';
import { AppService } from './../../app.service';
import {
  saleflow,
  saleflowDefault,
  setDefaultSaleflow,
  hotSaleflow,
  listItems,
  saleflows,
  addItemToSaleFlow,
  addLocation,
  listPackages,
  updateSaleflow,
  createSaleflow,
  createSaleFlowModule,
  updateSaleFlowModule,
} from './../graphql/saleflow.gql';
import { itemCategoriesList } from './../graphql/items.gql';
import { Community } from './../models/community';
import { User } from './../models/user';
import { PaginationInput, SaleFlow, SaleFlowModule, SaleFlowModuleInput } from '../models/saleflow';
import { Item, ItemPackage } from '../models/item';

@Injectable({ providedIn: 'root' })
export class SaleFlowService {
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
        fetchPolicy: 'no-cache'
      });

      if(response) {
        const { saleflowDefault: saleflowDefaultResponse } = response;
        return saleflowDefaultResponse;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async listItems(params: any): Promise<{ listItems: Item[] }> {
    try {
      const response = await this.graphql.query({
        query: listItems,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async listPackages(params: PaginationInput): Promise<{ listItemPackage: ItemPackage[] }> {
    try {
      const response = await this.graphql.query({
        query: listPackages,
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

  async addLocation(input: any) {
    const result = await this.graphql.mutate({
      mutation: addLocation,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async addItemToSaleFlow(item: { item: string, customizer?: string, index?: number }, id: string) {
    console.log(id);
    const result = await this.graphql.mutate({
      mutation: addItemToSaleFlow,
      variables: { item, id },
    });
  }

  async createSaleflow(input: any) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createSaleflow,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async setDefaultSaleflow(merchantId: string, id: string): Promise<{ saleflowSetDefault: SaleFlow }> {
    const result = await this.graphql.mutate({
      mutation: setDefaultSaleflow,
      variables: { merchantId, id },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async updateSaleflow(input: any, id: any) {
    console.log(input, id);
    const result = await this.graphql.mutate({
      mutation: updateSaleflow,
      variables: { input, id },
    });
    if (!result || result?.errors) return undefined;
    console.log(result);
    return result;
  }

  async createSaleFlowModule(input: SaleFlowModuleInput): Promise<SaleFlowModule> {
    const result = await this.graphql.mutate({
      mutation: createSaleFlowModule,
      variables: { input },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async updateSaleFlowModule(input: SaleFlowModuleInput, id: string): Promise<SaleFlowModule> {
    const result = await this.graphql.mutate({
      mutation: updateSaleFlowModule,
      variables: { input, id },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }
}
