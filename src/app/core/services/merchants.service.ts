import { Injectable } from '@angular/core';

import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Item } from '../models/item';
import { ItemOrder } from '../models/order';
import { PaginationInput } from '../models/saleflow';
import { Tag } from '../models/tags';
import { User } from '../models/user';
import { ListParams } from '../types/general.types';
import {
  merchant,
  isMerchant as isMerchantQuery,
  myMerchants,
  merchants,
  addMerchant,
  createMerchant,
  merchantDefault,
  setDefaultMerchant,
  hotMerchant,
  hotMerchants,
  itemsByMerchant,
  item,
  ordersByMerchant,
  createEmployeeContract,
  employeeContractByMerchant,
  tagsByMerchant,
  uploadDataToClientsAirtable,
  uploadAirtableAttachments,
  usersOrderMerchant
} from './../graphql/merchants.gql';
import { EmployeeContract, Merchant } from './../models/merchant';

@Injectable({ providedIn: 'root' })
export class MerchantsService {
  constructor(private graphql: GraphQLWrapper) { }

  async merchant(id: string, isHot?: boolean): Promise<Merchant> {
    try {
      if (isHot) {
        const merchantResult = await this.graphql.query({
          query: hotMerchant,
          variables: { id },
          fetchPolicy: 'no-cache',
        });
        if (!merchantResult) return;
        return new Merchant(merchantResult.merchant);
      } else {
        const merchantResult = await this.graphql.query({
          query: merchant,
          variables: { id },
          fetchPolicy: 'no-cache',
        });
        if (!merchantResult) return;
        return new Merchant(merchantResult.merchant);
      }
    } catch (error) {
      return error;
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

  async ordersByMerchant(merchant: string, pagination?: PaginationInput): Promise<{ ordersByMerchant: ItemOrder[] }> {
    const response = await this.graphql.query({
      query: ordersByMerchant,
      variables: { pagination, merchant },
      fetchPolicy: 'no-cache',
    });
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

  async usersOrderMerchant(merchantId: string): Promise<User[]> {
    const response = await this.graphql.query({
      query: usersOrderMerchant,
      variables: { merchantId },
      fetchPolicy: 'no-cache',
    });
    if(!response || response?.errors) return undefined;
    return response.usersOrderMerchant;
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

  async merchantDefault(): Promise<Merchant> {
    try {
      const response = await this.graphql.query({
        query: merchantDefault,
        fetchPolicy: 'no-cache',
      });
      if(!response || response?.errors) return undefined;
      return new Merchant(response.merchantDefault);
    } catch (error) {
      console.log(error);
    }
  }

  async setDefaultMerchant(id: string): Promise<{ merchantSetDefault: Merchant }> {
    const result = await this.graphql.mutate({
      mutation: setDefaultMerchant,
      variables: { id },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    console.log(result);
    return result;
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

  async uploadAirtableAttachments(
    files: any
  ): Promise<Array<String>> {
    try {
      const { uploadAirtableAttachments: result } = await this.graphql.mutate({
        mutation: uploadAirtableAttachments,
        variables: { files },
        fetchPolicy: 'no-cache',
        context: { useMultipart: true }
      });

      if (!result || result?.errors) return undefined;
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async uploadDataToClientsAirtable(
    merchantId: string,
    databaseName: string,
    data: Record<string, any>
  ): Promise<boolean> {
    try {
      const result = await this.graphql.mutate({
        mutation: uploadDataToClientsAirtable,
        variables: { merchantId, databaseName, data },
        fetchPolicy: 'no-cache',
      });

      if (!result || result?.errors) return undefined;
      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async tagsByMerchant(merchantId: string): Promise<{ tagsByMerchant: { orders: number, tags: Tag }[] }> {
    const response = await this.graphql.query({
      query: tagsByMerchant,
      variables: { merchantId },
      fetchPolicy: 'no-cache',
    });
    if(!response || response?.errors) return undefined;
    return response;
  }
}
