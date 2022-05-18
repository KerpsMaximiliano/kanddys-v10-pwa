import { Injectable } from '@angular/core';

import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Item } from '../models/item';
import { ItemOrder } from '../models/order';
import { ListParams } from '../types/general.types';
import {
  merchant,
  isMerchant as isMerchantQuery,
  myMerchants,
  merchants,
  addMerchant,
  createMerchant,
  hotMerchant,
  hotMerchants,
  itemsByMerchant,
  item,
  ordersByMerchant,
  createEmployeeContract,
  employeeContractByMerchant,
  tagsByMerchant,
} from './../graphql/merchants.gql';
import { EmployeeContract, Merchant } from './../models/merchant';

@Injectable({ providedIn: 'root' })
export class MerchantsService {
  constructor(private graphql: GraphQLWrapper) {}

  async merchant(id: string, isHot?: boolean): Promise<Merchant> {
    if (isHot) {
      const { merchant: result } = await this.graphql.query({
        query: hotMerchant,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      return new Merchant(result);
    } else {
      const { merchant: result } = await this.graphql.query({
        query: merchant,
        variables: { id },
        fetchPolicy: 'no-cache',
      });

      return new Merchant(result);
    }
  }

  async isMerchant(id: string): Promise<Merchant> {
    console.log('ID: ', id);

    const { isMerchant: result } = await this.graphql.query({
      query: isMerchantQuery,
      variables: { user: id },
      fetchPolicy: 'no-cache',
    });

    console.log('RSULTADO', result);

    return result;
  }

  async itemsByMerchant(id: string) {
    console.log(id);

    const response = await this.graphql.query({
      query: itemsByMerchant,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    console.log(response);

    return response;
  }

  async ordersByMerchant(merchant: any, pagination?: any): Promise<{ ordersByMerchant: ItemOrder[] }> {
    console.log(merchant);

    const response = await this.graphql.query({
      query: ordersByMerchant,
      variables: { pagination, merchant },
      fetchPolicy: 'no-cache',
    });
    console.log(response);

    return response;
  }

  async item(id: string): Promise<{ item: Item }> {
    console.log(id);

    const response = await this.graphql.query({
      query: item,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    console.log(response);

    return response;
  }

  async merchants(
    params: ListParams = {},
    isHot?: boolean
  ): Promise<Merchant[]> {
    if (isHot) {
      const { merchants: result = [] } = await this.graphql.query({
        query: hotMerchants,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      console.log(result);
      return (result || []).map((r: any) => new Merchant(r));
    } else {
      const { merchants: result = [] } = await this.graphql.query({
        query: merchants,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      console.log(result);
      return (result || []).map((r: any) => new Merchant(r));
    }
  }

  async myMerchants(params: ListParams = {}): Promise<Merchant[]> {
    const { myMerchants: result = [] } = await this.graphql.query({
      query: myMerchants,
      variables: { params },
      fetchPolicy: 'no-cache',
    });
    return (result || []).map((r: any) => new Merchant(r));
  }

  async createMerchant(input): Promise<{ createMerchant: Merchant }> {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createMerchant,
      variables: { input },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    console.log(result);
    return result;
  }

  async addMerchant(emailOrPhone: string, input: any) {
    console.log(emailOrPhone, input);
    const result = await this.graphql.mutate({
      mutation: addMerchant,
      variables: { emailOrPhone, input },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    console.log(result);
    return result;
  }

  async createEmployeeContract(input) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createEmployeeContract,
      variables: { input },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    console.log(result);
    return result;
  }

  async employeeContractByMerchant(
    merchantId
  ): Promise<{ employeeContractByMerchant: EmployeeContract[] }> {
    console.log(merchantId);
    const result = await this.graphql.mutate({
      mutation: employeeContractByMerchant,
      variables: { merchantId },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    console.log(result);
    return result;
  }

  async tagsByMerchant(merchantId: any, input?: any) {
    console.log(merchantId);

    const response = await this.graphql.query({
      query: tagsByMerchant,
      variables: { input, merchantId },
      fetchPolicy: 'no-cache',
    });
    console.log(response);

    return response;
  }
}
