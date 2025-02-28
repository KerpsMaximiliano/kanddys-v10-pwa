import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import { Item } from '../models/item';
import { ItemOrder } from '../models/order';
import { PaginationInput, SaleFlow } from '../models/saleflow';
import { Tag } from '../models/tags';
import { RecurrentUserData, User, UserInput } from '../models/user';
import { ViewsMerchant } from '../models/views-merchant';
import { ListParams } from '../types/general.types';
import {
  merchant,
  isMerchant as isMerchantQuery,
  myMerchants,
  merchants,
  addMerchant,
  createMerchant,
  updateMerchant,
  merchantDefault,
  setDefaultMerchant,
  merchantAuthorize,
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
  usersOrderMerchant,
  incomeMerchant,
  ordersByMerchantHot,
  merchantByName,
  merchantBySlug,
  viewsMerchants,
  viewsMerchant,
  createMerchantWhatsapp,
  buyersByMerchant,
  recurringBuyersByMerchant,
  hotBuyersByMerchant,
  orderByStatusDelivery,
  higherIncomeBuyersByMerchant,
  entryMerchant,
  currencyStartByMerchant,
  merchantFuncionality,
  updateMerchantFuncionality,
  walletsByCurrency,
  paginateUsers,
  payUserStarAffiliate,
  ordersCommissionableItemsCount,
  merchantGroupFiltersQuantity,
  merchantGroupByType,
  dataCountries,
  merchantQuantityOfFiltersRole,
  merchantQuantityOfFiltersCountry,
  merchantQuantityOfFiltersCampaign,
  merchantQuantityOfFiltersHaveDebt,
  merchantAddRole,
  rolesPublic,
  merchantRemoveRole,
  dataPagination,
} from './../graphql/merchants.gql';
import {
  EmployeeContract,
  Merchant,
  MerchantInput,
} from './../models/merchant';
import { Contact } from '../models/contact';
import { carts, getMe, taxesByMerchant } from '../graphql/cart.gql';
import { AffiliateService } from './affiliate.service';
import { AffiliateInput } from '../models/affiliate';
import { SaleFlowService } from './saleflow.service';

@Injectable({ providedIn: 'root' })
export class MerchantsService {
  loadedMerchantData = new Subject();
  merchantData: Merchant;
  temporalMerchantInput: any | null = null;
  merchantContact: Contact;
  merchantIncome: {
    orderAmount: number;
    income: number;
  };

  constructor(
    private graphql: GraphQLWrapper,
    private affiliateService: AffiliateService,
    private saleflowService: SaleFlowService
  ) { }

  async merchant(id: string, isHot?: boolean): Promise<Merchant> {
    try {
      if (isHot) {
        const merchantResult = await this.graphql.query({
          query: hotMerchant,
          variables: { id },
          fetchPolicy: 'no-cache',
        });
        if (!merchantResult) return;
        console.log("A")
        return new Merchant(merchantResult.merchant);
      } else {
        const merchantResult = await this.graphql.query({
          query: merchant,
          variables: { id },
          fetchPolicy: 'no-cache',
        });
        if (!merchantResult) return;
        console.log("B")
        return new Merchant(merchantResult.merchant);
      }
    } catch (error) {
      return error;
    }
  }

  async merchantByName(name: string): Promise<Merchant> {
    try {
      const result = await this.graphql.query({
        query: merchantByName,
        variables: { name },
        fetchPolicy: 'no-cache',
      });
      if (!result) return;
      return new Merchant(result.merchantByName);
    } catch (error) {
      return error;
    }
  }

  async merchantBySlug(slug: string): Promise<Merchant> {
    try {
      const result = await this.graphql.query({
        query: merchantBySlug,
        variables: { slug },
        fetchPolicy: 'no-cache',
      });
      if (!result) return;
      return new Merchant(result.merchantBySlug);
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

  async itemsByMerchant(id: string): Promise<{ itemsByMerchant: Item[] }> {
    const response = await this.graphql.query({
      query: itemsByMerchant,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    return response;
  }

  async ordersByMerchant(
    merchant: string,
    pagination?: PaginationInput,
    hotQuery?: boolean
  ): Promise<{ ordersByMerchant: ItemOrder[] }> {
    const response = await this.graphql.query({
      query: !hotQuery ? ordersByMerchant : ordersByMerchantHot,
      variables: { pagination, merchant },
      fetchPolicy: 'cache-first',
    });
    return response;
  }
  async getCarts(paginate: PaginationInput) {
    try {
      const response = await this.graphql.query({
        query: carts,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }
  async taxesByMerchant(paginate: PaginationInput) {
    try {
      const response = await this.graphql.query({
        query: taxesByMerchant,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }
  async getMe() {
    try {
      const response = await this.graphql.query({
        query: getMe,
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async hotOrdersByMerchant(
    merchant: string,
    pagination?: PaginationInput
  ): Promise<{ ordersByMerchant: ItemOrder[] }> {
    const response = await this.graphql.query({
      query: ordersByMerchantHot,
      variables: { pagination, merchant },
      fetchPolicy: 'cache-first',
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
    if (!response || response?.errors) return undefined;
    return response.usersOrderMerchant;
  }

  async merchants(
    input: PaginationInput = {},
    isHot?: boolean
  ): Promise<Merchant[]> {
    if (isHot) {
      const { merchants: result = [] } = await this.graphql.query({
        query: hotMerchants,
        variables: { input },
        fetchPolicy: 'no-cache',
      });
      console.log(result);
      return (result || []).map((r: any) => new Merchant(r));
    } else {
      const { merchants: result = [] } = await this.graphql.query({
        query: merchants,
        variables: { input },
        fetchPolicy: 'no-cache',
      });
      console.log(result);
      return (result || []).map((r: any) => new Merchant(r));
    }
  }

  async myMerchants(params: ListParams = {}): Promise<Merchant[]> {
    const result = await this.graphql.query({
      query: myMerchants,
      variables: { params },
      fetchPolicy: 'no-cache',
    });
    return (result?.myMerchants || []).map((r: any) => new Merchant(r));
  }

  async merchantDefault(userId?: string): Promise<Merchant> {
    try {
      const response = await this.graphql.query({
        query: merchantDefault,
        variables: { userId },
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) return undefined;
      return new Merchant(response.merchantDefault);
    } catch (error) {
      console.log(error);
    }
  }

  async setDefaultMerchant(
    id: string
  ): Promise<{ merchantSetDefault: Merchant }> {
    const result = await this.graphql.mutate({
      mutation: setDefaultMerchant,
      variables: { id },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async merchantAuthorize(
    merchantId: string
  ): Promise<{ merchantAuthorize: Merchant }> {
    const result = await this.graphql.mutate({
      mutation: merchantAuthorize,
      variables: { merchantId },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async createMerchant(
    input: MerchantInput,
    files?: any
  ): Promise<{ createMerchant: Merchant }> {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createMerchant,
      variables: { input, files },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    console.log(result.createMerchant);
    if (localStorage.getItem("affiliateCode")) {
      const input: AffiliateInput = {
        reference: result.createMerchant._id
      }
      try {
        this.affiliateService.createAffiliate(localStorage.getItem("affiliateCode"), input);
        localStorage.removeItem("affiliateCode");
      } catch (error) {
        console.log(error);

      }

    }
    return result;
  }

  async createMerchantWhatsapp(
    itemId: string,
    nameMerchant: String
  ): Promise<{ createMerchantWhatsapp: String }> {
    console.log(nameMerchant);
    const result = await this.graphql.mutate({
      mutation: createMerchantWhatsapp,
      variables: { itemId, nameMerchant },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    console.log(result);
    return result;
  }

  async updateMerchant(
    input: MerchantInput,
    id: string,
    files?: any
  ): Promise<Merchant> {
    const result = await this.graphql.mutate({
      mutation: updateMerchant,
      variables: { input, id, files },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result.updateMerchant;
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

  async uploadAirtableAttachments(files: any): Promise<Array<String>> {
    try {
      const { uploadAirtableAttachments: result } = await this.graphql.mutate({
        mutation: uploadAirtableAttachments,
        variables: { files },
        fetchPolicy: 'no-cache',
        context: { useMultipart: true },
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
    automation: string,
    data: Record<string, any>,
    route?: string
  ): Promise<boolean> {
    try {
      const result = await this.graphql.mutate({
        mutation: uploadDataToClientsAirtable,
        variables: { merchantId, automation, data, route },
        fetchPolicy: 'no-cache',
      });

      if (!result || result?.errors) return undefined;
      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async tagsByMerchant(
    merchantId: string
  ): Promise<{ tagsByMerchant: { orders: number; tags: Tag }[] }> {
    const response = await this.graphql.query({
      query: tagsByMerchant,
      variables: { merchantId },
      fetchPolicy: 'no-cache',
    });
    if (!response || response?.errors) return undefined;
    return response;
  }

  async incomeMerchant(input: PaginationInput) {
    const response = await this.graphql.query({
      query: incomeMerchant,
      variables: { input },
      fetchPolicy: 'no-cache',
    });
    if (!response || response?.errors) return undefined;
    return response?.incomeMerchant;
  }

  async viewsMerchants(
    paginate: PaginationInput
  ): Promise<Array<ViewsMerchant>> {
    try {
      const result = await this.graphql.query({
        query: viewsMerchants,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
      if (!result) return;
      return result.viewsMerchants;
    } catch (error) {
      return error;
    }
  }

  async viewsMerchant(id: string): Promise<ViewsMerchant> {
    try {
      const result = await this.graphql.query({
        query: viewsMerchant,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      if (!result) return;
      return result.viewsMerchant;
    } catch (error) {
      return error;
    }
  }

  async buyersByMerchant(
    paginate: PaginationInput,
    hot?: boolean
  ): Promise<User[]> {
    try {
      const result = await this.graphql.query({
        query: !hot ? buyersByMerchant : hotBuyersByMerchant,
        variables: { paginate },
        fetchPolicy: 'cache-first',
      });
      if (!result) return;
      return result.buyersByMerchant;
    } catch (error) {
      return error;
    }
  }

  async recurringBuyersByMerchant(
    paginate: PaginationInput
  ): Promise<RecurrentUserData[]> {
    try {
      const result = await this.graphql.query({
        query: recurringBuyersByMerchant,
        variables: { paginate },
        fetchPolicy: 'cache-first',
      });
      if (!result) return;
      return result.recurringBuyersByMerchant;
    } catch (error) {
      return error;
    }
  }

  async orderByStatusDelivery(
    merchantId: string
  ): Promise<Record<string, Array<ItemOrder>>> {
    const response = await this.graphql.query({
      query: orderByStatusDelivery,
      variables: { merchantId },
      fetchPolicy: 'cache-first',
    });

    return response?.orderByStatusDelivery;
  }

  async higherIncomeBuyersByMerchant(paginate: PaginationInput) {
    const response = await this.graphql.query({
      query: higherIncomeBuyersByMerchant,
      variables: { paginate },
      fetchPolicy: 'no-cache',
    });
    if (!response || response?.errors) return undefined;
    return response?.higherIncomeBuyersByMerchant;
  }

  async entryMerchant(
    merchantID: string,
    merchantInput: MerchantInput,
    userInput: UserInput,
    addressPickUp: string,
    deliveryLocations: { country: string, cityReference: string },
    role: string[],
  ) {
    const input = {
      merchantID,
      merchantInput,
      userInput,
      addressPickUp,
      deliveryLocations,
      role
    };
    Object.keys(input).forEach(key => {
      if (input[key] === null) {
        delete input[key];
      }
    });
    const result = await this.graphql.mutate({
      mutation: entryMerchant,
      variables: { input },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result.entryMerchant;
  }

  async currencyStartByMerchant(
    merchantId: string
  ) {
    const result = await this.graphql.query({
      query: currencyStartByMerchant,
      variables: { merchantId },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result.currencyStartByMerchant;
  }

  async merchantFuncionality(
    merchantId: string,
  ) {
    const result = await this.graphql.query({
      query: merchantFuncionality,
      variables: { merchantId },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result.merchantFuncionality;
  }

  async updateMerchantFuncionality(
    input: any,
    merchantId: string,
  ) {
    const result = await this.graphql.mutate({
      mutation: updateMerchantFuncionality,
      variables: { input, merchantId },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result.updateMerchantFuncionality;
  }

  async paginateUsers(input: PaginationInput) {
    const result = await this.graphql.query({
      query: paginateUsers,
      variables: { input },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result.paginateUsers;
  }

  async payUserStarAffiliate(
    screenshot: File,
    paymentMethod: string,
    userId: string,
    merchantId: string
  ) {
    const result = await this.graphql.mutate({
      mutation: payUserStarAffiliate,
      variables: { screenshot, paymentMethod, userId, merchantId },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result.payUserStarAffiliate;
  }

  async walletsByCurrency(
    paginate: PaginationInput
  ): Promise<any[]> {
    const response = await this.graphql.query({
      query: walletsByCurrency,
      variables: { paginate },
      fetchPolicy: 'no-cache'
    });

    return response?.walletsByCurrency;
  }

  async ordersCommissionableItemsCount(
    userId: string,
    merchantId: string,
  ): Promise<any[]> {
    const response = await this.graphql.query({
      query: ordersCommissionableItemsCount,
      variables: { userId: [userId], merchantId },
      fetchPolicy: 'cache-first',
    });

    return response?.ordersCommissionableItemsCount;
  }

  async merchantGroupFiltersQuantity(merchantId: string, type: string) {
    const result = await this.graphql.query({
      query: merchantGroupFiltersQuantity,
      variables: { merchantId, type },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.merchantGroupFiltersQuantity;
  }

  async merchantGroupByType(input: PaginationInput) {
    const result = await this.graphql.query({
      query: merchantGroupByType,
      variables: { input },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.merchantGroupByType;
  }

  async getDataCountries() {
    const result = await this.graphql.query({
      query: dataCountries,
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.dataCountries;
  }

  async getDataPagination(paginate: PaginationInput) {
    const result = await this.graphql.query({
      query: dataPagination,
      variables: { paginate },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.dataPagination;
  }

  async merchantQuantityOfFiltersRole() {
    const result = await this.graphql.query({
      query: merchantQuantityOfFiltersRole,
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.merchantQuantityOfFiltersRole;
  }

  async merchantQuantityOfFiltersCountry() {
    const result = await this.graphql.query({
      query: merchantQuantityOfFiltersCountry,
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.merchantQuantityOfFiltersCountry;
  }

  async merchantQuantityOfFiltersCampaign() {
    const result = await this.graphql.query({
      query: merchantQuantityOfFiltersCampaign,
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.merchantQuantityOfFiltersCampaign;
  }

  async merchantQuantityOfFiltersHaveDebt() {
    const result = await this.graphql.query({
      query: merchantQuantityOfFiltersHaveDebt,
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.merchantQuantityOfFiltersHaveDebt;
  }

  /**
   * Verifies if the merchant is valid.
   *
   * Retrieves the data of the default merchant and checks if it is valid.
   * If it is valid, retrieves the sale configuration for the default merchant
   * and checks if it is valid.
   *
   * @returns {Promise<boolean>} Indicates whether the merchant is valid or not.
   */
  async verifyValidMerchant(): Promise<boolean> {
    const merchant = this.merchantData;
    const isValidMerchant = merchant?._id && merchant?.slug && merchant?.roles.length > 0;

    if (!isValidMerchant) {
      return false;
    }

    const saleflow = this.saleflowService.saleflowData;
    if (!saleflow || !saleflow?.module) {
      return false;
    }

    const { paymentMethod, delivery } = saleflow.module;
    if (!paymentMethod.isActive || !paymentMethod.paymentModule._id) {
      return false;
    }

    if (!delivery.isActive || !delivery.pickUpLocations.length || !delivery.pickUpLocations[0]?.nickName) {
      return false;
    }

    return true;
  }

  async rolesPublic() {
    const result = await this.graphql.query({
      query: rolesPublic,
      variables: {},
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.rolesPublic;
  }

  async merchantAddRole(roleId, id) {
    const result = await this.graphql.mutate({
      mutation: merchantAddRole,
      variables: { roleId, id },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.merchantAddRole;
  }

  async merchantRemoveRole(roleId, id) {
    const result = await this.graphql.mutate({
      mutation: merchantRemoveRole,
      variables: { roleId, id },
      fetchPolicy: 'no-cache',
    });

    if (!result || result?.errors) return undefined;
    return result?.merchantRemoveRole;
  }

}




