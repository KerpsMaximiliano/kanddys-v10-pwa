import { Injectable } from '@angular/core';

import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  item,
  authItem,
  items,
  itemCategory,
  itemCategoriesList,
  createItem,
  createItemParam,
  createPreItem,
  addImageItem,
  deleteImageItem,
  itemsByMerchant,
  addItem,
  itemextra,
  itemPackage,
  createItemPackage,
  itemExtraByMerchant,
  createItemCategory,
  updateItemCategory,
  deleteItemCategory,
  itemPackageByMerchant,
  listItemPackage,
  listItems,
  itemCategoryHeadlineByMerchant,
  itemsByCategory,
  bestSellersByMerchant,
  totalByItem,
  itemExtras,
  updateItem,
  deleteItem,
  addItemParamValue,
  deleteItemParamValue,
} from '../graphql/items.gql';
import {
  Item,
  ItemCategory,
  ItemCategoryHeadline,
  ItemCategoryInput,
  ItemInput,
  ItemPackage,
  ItemParam,
  ItemParamInput,
  ItemParamValueInput,
} from '../models/item';
import { PaginationInput } from '../models/saleflow';
import { ListParams } from '../types/general.types';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  temporalItem: Item = null;
  temporalItemParams: ItemParamInput[];
  temporalImages: {
    old: string[];
    new: File[];
  };
  hasTemporalItemNewImages: boolean = null;

  storeTemporalItem(item: any) {
    this.temporalItem = item;
  }

  removeTemporalItem() {
    this.temporalItem = null;
    this.temporalImages = null;
    this.hasTemporalItemNewImages = null;
  }

  constructor(private graphql: GraphQLWrapper) {}

  async item(id: string): Promise<Item> {
    const result = await this.graphql.query({
      query: item,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result.item;
  }

  async itemextra(id: string) {
    const response = await this.graphql.query({
      query: itemextra,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    return response;
  }

  async itemPacakge(id: string): Promise<{ itemPackage: ItemPackage }> {
    const response = await this.graphql.query({
      query: itemPackage,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    return response;
  }

  async items(merchantId: string, params: ListParams = {}): Promise<Item[]> {
    const { items: result = [] } = await this.graphql.query({
      query: items,
      variables: { params, merchantId },
      fetchPolicy: 'no-cache',
    });
    return (result || []).map((r: any) => new Item(r));
  }

  async updateItem(input: ItemInput, id: string) {
    const response = await this.graphql.query({
      query: updateItem,
      variables: { input, id },
      context: { useMultipart: true },
      fetchPolicy: 'no-cache',
    });
    return response;
  }

  async addImageItem(images: File[], id: string) {
    const result = await this.graphql.mutate({
      mutation: addImageItem,
      variables: { images, id },
      fetchPolicy: 'no-cache',
      context: {
        useMultipart: true,
      },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async deleteImageItem(images: string[], id: string) {
    const result = await this.graphql.mutate({
      mutation: deleteImageItem,
      variables: { images, id },
      fetchPolicy: 'no-cache',
      context: {
        useMultipart: true,
      },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async authItem(merchantId: string, id: string) {
    const result = await this.graphql.mutate({
      mutation: authItem,
      variables: { merchantId, id },
      fetchPolicy: 'no-cache',
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async itemsByMerchant(
    id: string,
    sort?: boolean
  ): Promise<{ itemsByMerchant: Item[] }> {
    try {
      const response = await this.graphql.query({
        query: itemsByMerchant,
        variables: { id, sort },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }
  async itemPackageByMerchant(merchant: string) {
    try {
      const response = await this.graphql.query({
        query: itemPackageByMerchant,
        variables: { merchant },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {}
  }

  async itemsByCategory(
    categoryID: string,
    params?: PaginationInput,
    saleflowID?: string
  ): Promise<Item[]> {
    try {
      const response = await this.graphql.query({
        query: itemsByCategory,
        variables: { categoryID, params, saleflowID },
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) return undefined;
      return response.itemsByCategory;
    } catch (e) {
      console.log(e);
    }
  }

  async bestSellersByMerchant(
    limit: number,
    merchantID: string
  ): Promise<string[]> {
    try {
      const response = await this.graphql.query({
        query: bestSellersByMerchant,
        variables: { limit, merchantID },
        fetchPolicy: 'no-cache',
      });
      return response.bestSellersByMerchant;
    } catch (e) {
      console.log(e);
    }
  }

  async totalByItem(
    merchantId: string,
    itemId?: string[]
  ): Promise<{ item: Item; itemInOrder: number; total: number }[]> {
    try {
      const response = await this.graphql.query({
        query: totalByItem,
        variables: { merchantId, itemId },
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) return undefined;
      return response.totalByItem;
    } catch (e) {
      console.log(e);
    }
  }

  async listItemPackage(params: any) {
    try {
      const response = await this.graphql.query({
        query: listItemPackage, //add listItemPackage to gqls,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }
  async listItems(params: any) {
    try {
      const response = await this.graphql.query({
        query: listItems, //add listItems to gqls,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async itemExtras(params: any) {
    try {
      const response = await this.graphql.query({
        query: itemExtras, //add listItems to gqls,
        variables: { params },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async itemCategory(id: string): Promise<ItemCategory> {
    try {
      const response = await this.graphql.query({
        query: itemCategory,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) return undefined;
      return response.itemCategory;
    } catch (e) {
      console.log(e);
    }
  }

  async itemCategories(
    merchantId: string,
    params: PaginationInput
  ): Promise<{ itemCategoriesList: ItemCategory[] }> {
    try {
      const response = await this.graphql.query({
        query: itemCategoriesList,
        variables: { merchantId, params },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  // Agregar categoria
  async createItemCategory(input: ItemCategoryInput): Promise<ItemCategory> {
    const result = await this.graphql.mutate({
      mutation: createItemCategory,
      variables: { input },
      context: { useMultipart: true },
    });
    if (!result || result?.errors) return undefined;
    return result.createItemCategory;
  }

  // Actualizar categoria
  async updateItemCategory(
    input: ItemCategoryInput,
    id: string
  ): Promise<ItemCategory> {
    const result = await this.graphql.mutate({
      mutation: updateItemCategory,
      variables: { input, id },
      context: { useMultipart: true },
    });
    if (!result || result?.errors) return undefined;
    return result.updateItemCategory;
  }

  // Eliminar Categoria
  async deleteItemCategory(id: string) {
    const result = await this.graphql.mutate({
      mutation: deleteItemCategory,
      variables: { id },
      context: { useMultipart: true },
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async itemCategoryHeadlineByMerchant(
    merchant: string
  ): Promise<ItemCategoryHeadline[]> {
    try {
      const response = await this.graphql.query({
        query: itemCategoryHeadlineByMerchant,
        variables: { merchant },
        fetchPolicy: 'no-cache',
      });
      return response.itemCategoryHeadlineByMerchant;
    } catch (e) {
      console.log(e);
    }
  }

  async createItem(input: ItemInput): Promise<{ createItem: Item }> {
    const result = await this.graphql.mutate({
      mutation: createItem,
      variables: { input },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async createItemParam(merchantId: string, itemId: string, input: any) {
    const result = await this.graphql.mutate({
      mutation: createItemParam,
      variables: { merchantId, itemId, input },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async addItemParamValue(
    input: ItemParamValueInput[],
    itemParamId: string,
    merchantId: string,
    itemId: string
  ) {
    const result = await this.graphql.mutate({
      mutation: addItemParamValue,
      variables: { itemParamId, merchantId, itemId, input },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async deleteItemParamValue(
    itemParamValueId: string,
    itemParamId: string,
    merchantId: string,
    itemId: string
  ) {
    const result = await this.graphql.mutate({
      mutation: deleteItemParamValue,
      variables: { itemParamId, merchantId, itemId, itemParamValueId },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async createPreItem(input: ItemInput): Promise<{ createPreItem: Item }> {
    const result = await this.graphql.mutate({
      mutation: createPreItem,
      variables: { input },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async addItem(input: any) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: addItem,
      variables: { input },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await this.graphql.mutate({
      mutation: deleteItem,
      variables: { id },
      context: { useMultipart: true },
    });
    return result?.deleteItem;
  }

  async createItemPackage(input: any) {
    const result = await this.graphql.mutate({
      mutation: createItemPackage,
      variables: { input },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async itemExtraByMerchant(merchantId: string) {
    try {
      const response = await this.graphql.query({
        query: itemExtraByMerchant,
        variables: { merchantId },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }
}
