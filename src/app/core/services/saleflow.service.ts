import { Injectable } from '@angular/core';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { ListParams } from '../types/general.types';
import { AppService } from './../../app.service';
import {
  saleflow,
  hotSaleflow,
  listItems,
  saleflows,
  addItemToSaleFlow,
  addLocation,
  listPackages,
  updateSaleflow,
  createSaleflow,
} from './../graphql/saleflow.gql';
import { itemCategoriesList } from './../graphql/items.gql';
import { Community } from './../models/community';
import { User } from './../models/user';
import { PaginationInput, SaleFlow } from '../models/saleflow';
import { Item, ItemPackage } from '../models/item';

@Injectable({ providedIn: 'root' })
export class SaleFlowService {
  constructor(private graphql: GraphQLWrapper, private app: AppService) {}

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

  async saleflows(id: string, params: any) {
    try {
      const response = await this.graphql.query({
        query: saleflows,
        variables: { id, params },
        fetchPolicy: 'no-cache',
      });
      return response;
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

  async addItemToSaleFlow(item: string, id: string) {
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
    console.log(result);
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
}
