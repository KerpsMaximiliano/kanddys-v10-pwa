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
  itemAddImage,
  itemRemoveImage,
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
  itemsArchived,
  duplicateItem,
  itemUpdateImage,
  itemTotalPagination,
  itemsByMerchantNosale,
  salesPositionOfItemByMerchant,
  buyersByItemInMerchantStore,
  itemsQuantityOfFilters,
  providersItemMetrics,
  itemsSuppliersPaginate,
} from '../graphql/items.gql';
import {
  Item,
  ItemCategory,
  ItemCategoryHeadline,
  ItemCategoryInput,
  ItemImageInput,
  ItemInput,
  ItemPackage,
  ItemParam,
  ItemParamInput,
  ItemParamValueInput,
} from '../models/item';
import { PaginationInput } from '../models/saleflow';
import { ListParams } from '../types/general.types';
import { ExtendedQuestionInput } from 'src/app/shared/components/form-creator/form-creator.component';
import { SlideInput } from '../models/post';
import { Tag } from '../models/tags';
import { CommunityCategory } from '../models/community-categories';

export interface ExtendedItemInput extends ItemInput {
  slides?: Array<SlideInput>;
}

@Injectable({ providedIn: 'root' })
export class ItemsService {
  temporalItem: Item = null;
  temporalItemInput: ExtendedItemInput = null;
  temporalItemParams: ItemParamInput[];
  temporalImages: {
    old: string[];
    new: File[];
  };
  itemImages: File[] = [];
  itemUrls: string[] = [];
  itemPrice: number;
  itemName: string;
  itemDesc: string;
  itemPassword: string;
  editingImageId: string;
  editingSlide: number = null;
  questionsToAddToItem: Array<ExtendedQuestionInput> = [];
  modifiedImagesFromExistingItem: boolean = false;
  createUserAlongWithItem: boolean = false;
  tagDataForTheItemEdition: {
    allTags: Array<Tag>;
    tagsInItem: Record<string, boolean>;
    tagsById: Record<string, Tag>;
    itemTagsIds: Array<string>;
    tagsString: string;
    tagsToCreate: Array<Tag>;
  };
  categoriesDataForTheItemEdition: {
    allCategories: Array<ItemCategory>;
    categoriesInItem: Record<string, boolean>;
    categoryById: Record<string, ItemCategory>;
    itemCategoriesIds: Array<string>;
    categoriesString: string;
    categoriesToCreate: Array<ItemCategory>;
  };

  storeTemporalItem(item: any) {
    this.temporalItem = item;
  }

  removeTemporalItem() {
    this.temporalItem = null;
    this.temporalImages = null;
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

  async itemAddImage(input: ItemImageInput[], id: string): Promise<Item> {
    const result = await this.graphql.mutate({
      mutation: itemAddImage,
      variables: { input, id },
      fetchPolicy: 'no-cache',
      context: {
        useMultipart: true,
      },
    });
    if (!result || result?.errors) return undefined;
    return result.itemAddImage;
  }

  async itemRemoveImage(imageId: string[], itemId: string): Promise<Item> {
    const result = await this.graphql.mutate({
      mutation: itemRemoveImage,
      variables: { imageId, itemId },
      fetchPolicy: 'no-cache',
      context: {
        useMultipart: true,
      },
    });
    if (!result || result?.errors) return undefined;
    return result.itemRemoveImage;
  }

  async itemUpdateImage(
    input: ItemImageInput,
    imageId: string,
    id: string
  ): Promise<Item> {
    const result = await this.graphql.mutate({
      mutation: itemUpdateImage,
      variables: { input, imageId, id },
      fetchPolicy: 'no-cache',
      context: {
        useMultipart: true,
      },
    });
    if (!result || result?.errors) return undefined;
    return result.itemUpdateImage;
  }

  async authItem(merchantId: string, id: string): Promise<Item> {
    const result = await this.graphql.mutate({
      mutation: authItem,
      variables: { merchantId, id },
      fetchPolicy: 'no-cache',
    });
    if (!result || result?.errors) return undefined;
    return result.authItem;
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
    isObjectID: boolean,
    paginate: PaginationInput
  ): Promise<string[] | Item[]> {
    try {
      const response = await this.graphql.query({
        query: bestSellersByMerchant,
        variables: { isObjectID, paginate },
        fetchPolicy: 'no-cache',
      });
      return response?.bestSellersByMerchant;
    } catch (e) {
      console.log(e);
    }
  }

  async salesPositionOfItemByMerchant(
    itemID: string,
    paginate: PaginationInput
  ): Promise<number> {
    try {
      const response = await this.graphql.query({
        query: salesPositionOfItemByMerchant,
        variables: { itemID, paginate },
        fetchPolicy: 'no-cache',
      });
      return response?.salesPositionOfItemByMerchant;
    } catch (e) {
      console.log(e);
    }
  }

  async buyersByItemInMerchantStore(
    itemID: string,
    paginate: PaginationInput
  ): Promise<number> {
    try {
      const response = await this.graphql.query({
        query: buyersByItemInMerchantStore,
        variables: { itemID, paginate },
        fetchPolicy: 'no-cache',
      });
      return response?.buyersByItemInMerchantStore;
    } catch (e) {
      console.log(e);
    }
  }

  async totalByItem(
    merchantId: string,
    itemId?: string[]
  ): Promise<
    { item: Item; itemInOrder: number; total: number; itemUnits: number }[]
  > {
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
  async createItemCategory(
    input: ItemCategoryInput,
    isAdmin = false
  ): Promise<ItemCategory> {
    const result = await this.graphql.mutate({
      mutation: createItemCategory,
      variables: { isAdmin, input },
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

  async duplicateItem(id: string): Promise<Item> {
    const result = await this.graphql.mutate({
      mutation: duplicateItem,
      variables: { id },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;
    return result.duplicateItem;
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

  async itemsArchived(params: PaginationInput) {
    const result = await this.graphql.query({
      query: itemsArchived,
      variables: {},
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result.itemsArchived;
  }

  async itemTotalPagination(paginate: PaginationInput) {
    const result = await this.graphql.query({
      query: itemTotalPagination,
      variables: { paginate },
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result;
  }

  async itemsByMerchantNosale(paginate: PaginationInput) {
    const result = await this.graphql.query({
      query: itemsByMerchantNosale,
      variables: { paginate },
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result;
  }

  itemsQuantityOfFilters = async (
    merchantId: string,
    typeOfItem: string = null
  ): Promise<{
    all: number;
    archived: number;
    commissionable: number;
    hidden: number;
    lowStock: number;
    noSale: number;
  }> => {
    try {
      const response = await this.graphql.query({
        query: itemsQuantityOfFilters, //add listItems to gqls,
        variables: { merchantId, typeOfItem },
        fetchPolicy: 'no-cache',
      });
      if (!response) return;

      return response?.itemsQuantityOfFilters;
    } catch (e) {
      console.log(e);
    }
  };

  providersItemMetrics = async (): Promise<any> => {
    try {
      const response = await this.graphql.query({
        query: providersItemMetrics, //add listItems to gqls,
        fetchPolicy: 'no-cache',
      });
      if (!response) return;

      return response?.providersItemMetrics;
    } catch (e) {
      console.log(e);
    }
  };

  async itemsSuppliersPaginate(paginate: PaginationInput) {
    const result = await this.graphql.query({
      query: itemsSuppliersPaginate,
      variables: { paginate },
      fetchPolicy: 'no-cache',
    });
    if (!result) return;
    return result;
  }
}
