import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { WhatsappMessageComponent } from 'src/app/shared/dialogs/whatsapp-message/whatsapp-message.component';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  order,
  preOrder,
  authOrder,
  orderStatus,
  createOrder,
  createPreOrder,
  payOrder,
  ordersByUser,
  toggleUserNotifications,
  updateTagsInOrder,
  ordersTotal,
  ordersByItem,
  createOCR,
  createPartialOCR,
  orderSetStatus,
  ordersByItemHot,
  orderSetStatusDelivery,
  orders,
  orderBenefitsByMerchant,
  orderBenefits,
  expenditure,
  expenditures,
  createExpenditure,
  updateExpenditure,
  orderAddExpenditure,
  orderRemoveExpenditure,
  orderByMerchantDelivery,
  hotOrderByMerchantDelivery,
  updateOrderDeliveryData,
  orderSetStatusDeliveryWithoutAuth,
  orderSetDeliveryZone,
  orderConfirm,
  incomes,
  expendituresTotal,
  expenditureTypesCustom,
  itemRemoveExpenditure,
  deleteExpenditure,
  expendituresTotalById,
  answerIncomeTotal,
  incomeTypes,
  incomeTotalByType,
  orderByDateId,
  expendituresTotalByTypeConstant,
  ordersIncomeMerchantByUser,
  createOrderExternal,
  orderQuantityOfFiltersStatusDelivery,
  orderQuantityOfFiltersDeliveryZone,
  orderQuantityOfFiltersShippingType,
} from '../graphql/order.gql';
import {
  ItemOrder,
  ItemOrderInput,
  OCR,
  OCRInput,
  OrderStatusNameType,
  OrderStatusType,
  OrderStatusType2,
  OrderStatusDeliveryType,
  Expenditure,
  ExpenditureInput,
  Benefits,
  OrderBenefits,
  DeliveryDataInput,
  ExpenditureActiveDateRangeInput,
  ItemOrderExternalInput,
} from '../models/order';

import { PaginationInput, PaginationRangeInput } from '../models/saleflow';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(
    private graphql: GraphQLWrapper,
    private dialogService: DialogService
  ) {}

  orders: any = [];
  itemsReady: boolean = false;

  async createOrder(
    input: ItemOrderInput
  ): Promise<{ createOrder: { _id: string } }> {
    const result = await this.graphql.mutate({
      mutation: createOrder,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async createPreOrder(
    input: ItemOrderInput
  ): Promise<{ createPreOrder: { _id: string } }> {
    const result = await this.graphql.mutate({
      mutation: createPreOrder,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async payOrder(
    ocr: OCRInput,
    userId: string,
    payMode: string,
    orderId: string,
    setting?: {
      income?: string;
      paymentMethod: string;
      paymentReceiverId: string;
    }
  ): Promise<{ payOrder: { _id: string } }> {
    const result = await this.graphql.mutate({
      mutation: payOrder,
      variables: { setting, ocr, userId, payMode, orderId },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;

    return result;
  }

  async ordersByUser(
    pagination?: PaginationInput
  ): Promise<{ ordersByUser: ItemOrder[] }> {
    try {
      const response = await this.graphql.query({
        query: ordersByUser,
        variables: { pagination },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async ordersTotal(
    status: OrderStatusType[],
    merchantId: string,
    orders: string[] = [],
    itemCategoryId?: string
  ): Promise<{ total: number; length: number; items: number }> {
    try {
      const response = await this.graphql.query({
        query: ordersTotal,
        variables: { status, merchantId, orders, itemCategoryId },
        fetchPolicy: 'no-cache',
      });
      if (!response || response?.errors) return undefined;
      return response.ordersTotal;
    } catch (e) {
      console.log(e);
    }
  }

  async authOrder(
    orderId: string,
    userId?: string
  ): Promise<{ authOrder: ItemOrder }> {
    const result = await this.graphql.mutate({
      mutation: authOrder,
      variables: { orderId, userId },
    });

    if (!result || result?.errors) return undefined;
    return result;
  }

  async order(
    orderId: string,
    cache: boolean = true
  ): Promise<{ order: ItemOrder }> {
    try {
      const response = await this.graphql.query({
        query: order,
        fetchPolicy: cache ? 'cache-first' : 'no-cache',
        variables: { orderId },
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async orderByDateId(dateId: string): Promise<ItemOrder> {
    try {
      const response = await this.graphql.query({
        query: orderByDateId,
        variables: { dateId },
      });
      return response?.orderByDateId;
    } catch (e) {
      console.log(e);
    }
  }

  async ordersPaginate(
    pagination: PaginationInput
  ): Promise<Array<{ order: ItemOrder }>> {
    try {
      const response = await this.graphql.query({
        query: orders,
        variables: { pagination },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async preOrder(orderId: string): Promise<{ order: ItemOrder }> {
    try {
      const response = await this.graphql.query({
        query: preOrder,
        variables: { orderId },
        fetchPolicy: 'no-cache',
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async getOrderStatus(orderId: string): Promise<ItemOrder> {
    try {
      const { order } = await this.graphql.query({
        query: orderStatus,
        variables: { orderId },
        fetchPolicy: 'no-cache',
      });
      return order;
    } catch (error) {
      console.log(error);
    }
  }

  async toggleUserNotifications(
    active: boolean,
    orderId: string
  ): Promise<ItemOrder> {
    try {
      const result = await this.graphql.mutate({
        mutation: toggleUserNotifications,
        variables: { active, orderId },
      });

      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async updateTagsInOrder(orderId: any, tags: any, merchantId: any) {
    console.log(tags);
    const result = await this.graphql.mutate({
      mutation: updateTagsInOrder,
      variables: { orderId, tags, merchantId },
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async orderSetStatus(
    status: OrderStatusType2,
    id: string
  ): Promise<ItemOrder> {
    const result = await this.graphql.mutate({
      mutation: orderSetStatus,
      variables: { status, id },
    });

    if (!result || result?.errors) return undefined;

    return result.orderSetStatus;
  }

  async ordersByItem(
    paginate: PaginationInput,
    returnPromise?: boolean
  ): Promise<{ ordersByItem: ItemOrder[] }> {
    let result = null;

    if (!returnPromise) {
      result = await this.graphql.query({
        query: ordersByItem,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
    } else {
      result = this.graphql.query({
        query: ordersByItem,
        variables: { paginate },
        fetchPolicy: 'no-cache',
      });
    }

    if (!result || result?.errors) return undefined;

    return result;
  }

  async hotOrdersByItem(
    paginate?: PaginationInput
  ): Promise<{ ordersByItem: ItemOrder[] }> {
    const response = await this.graphql.query({
      query: ordersByItemHot,
      variables: { paginate },
      fetchPolicy: 'no-cache',
    });
    return response;
  }

  async createOCR(input: OCRInput) {
    const result = await this.graphql.mutate({
      mutation: createOCR,
      variables: { input },
      context: { useMultipart: true },
    });
    return result;
  }

  async createPartialOCR(
    subtotal: number,
    merchant: string,
    image: File,
    userID?: string,
    code?: string
  ): Promise<OCR> {
    const result = await this.graphql.mutate({
      mutation: createPartialOCR,
      variables: { subtotal, userID, merchant, code, image },
      context: { useMultipart: true },
    });
    return result?.createPartialOCR;
  }

  async expenditure(id: string): Promise<Expenditure> {
    const result = await this.graphql.query({
      query: expenditure,
      variables: { id },
    });
    return result?.expenditure;
  }

  async expenditures(paginate: PaginationInput): Promise<Expenditure[]> {
    const result = await this.graphql.query({
      query: expenditures,
      fetchPolicy: 'no-cache',
      variables: { paginate },
    });
    return result?.expenditures;
  }

  async createExpenditure(
    merchantId: string,
    input: ExpenditureInput
  ): Promise<Expenditure> {
    const result = await this.graphql.mutate({
      mutation: createExpenditure,
      variables: { merchantId, input },
    });
    return result.createExpenditure;
  }

  async updateExpenditure(
    input: ExpenditureInput,
    id: string
  ): Promise<Expenditure> {
    const result = await this.graphql.mutate({
      mutation: updateExpenditure,
      variables: { input, id },
    });
    return result.updateExpenditure;
  }

  async orderAddExpenditure(
    expenditureId: string,
    id: string
  ): Promise<ItemOrder> {
    const result = await this.graphql.mutate({
      mutation: orderAddExpenditure,
      variables: { expenditureId, id },
    });
    return result.orderAddExpenditure;
  }

  async orderRemoveExpenditure(
    expenditureId: string,
    id: string
  ): Promise<ItemOrder> {
    const result = await this.graphql.mutate({
      mutation: orderRemoveExpenditure,
      fetchPolicy: 'no-cache',
      variables: { expenditureId, id },
    });
    return result.orderRemoveExpenditure;
  }

  async orderBenefits(id: string): Promise<OrderBenefits> {
    const result = await this.graphql.query({
      query: orderBenefits,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    return result?.orderBenefits;
  }

  async orderBenefitsByMerchant(
    pagination: PaginationInput
  ): Promise<Benefits> {
    const result = await this.graphql.query({
      query: orderBenefitsByMerchant,
      variables: { pagination },
    });
    return result?.orderBenefitsByMerchant;
  }

  getOrderStatusName(status: OrderStatusType): OrderStatusNameType {
    return (
      {
        cancelled: 'cancelado',
        started: 'empezado',
        verifying: 'verificando',
        'in progress': 'en revisión',
        'to confirm': 'por confirmar',
        completed: 'completado',
        draft: 'por terminar',
        paid: 'pagada',
      }[status] ?? 'error'
    );
  }

  async getOrderData(id: string, preOrder?: boolean): Promise<ItemOrder> {
    if (!preOrder) return (await this.order(id))?.order;
    return (await this.preOrder(id))?.order;
  }

  async orderByMerchantDelivery(
    pagination: PaginationInput
  ): Promise<ItemOrder[]> {
    const result = await this.graphql.query({
      query: hotOrderByMerchantDelivery,
      variables: { pagination },
    });

    if (!result || result?.errors) return undefined;

    return result?.orderByMerchantDelivery;
  }

  async orderSetStatusDelivery(orderStatusDelivery: string, id: string) {
    const result = await this.graphql.mutate({
      mutation: orderSetStatusDelivery,
      variables: { orderStatusDelivery, id },
      context: { useMultipart: true },
    });
    if (!result || result?.errors) return undefined;
    return result.orderSetStatusDelivery;
  }

  async updateOrderDeliveryData(
    input: DeliveryDataInput,
    id: string
  ): Promise<ItemOrder> {
    const result = await this.graphql.mutate({
      mutation: updateOrderDeliveryData,
      variables: { input, id },
      fetchPolicy: 'no-cache',
      context: { useMultipart: true },
    });
    if (!result || result?.errors) return undefined;
    return result.updateOrderDeliveryData;
  }

  async orderSetStatusDeliveryWithoutAuth(
    orderStatusDelivery: string,
    id: string
  ): Promise<boolean> {
    const result = await this.graphql.mutate({
      mutation: orderSetStatusDeliveryWithoutAuth,
      variables: { orderStatusDelivery, id },
      fetchPolicy: 'no-cache',
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async orderSetDeliveryZone(
    deliveryZoneId: string,
    id: string,
    userId?: string
  ): Promise<ItemOrder> {
    const result = await this.graphql.mutate({
      mutation: orderSetDeliveryZone,
      variables: { deliveryZoneId, id, userId },
      fetchPolicy: 'no-cache',
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async orderConfirm(merchantId: string, orderId: string): Promise<ItemOrder> {
    const result = await this.graphql.mutate({
      mutation: orderConfirm,
      variables: { merchantId, orderId },
    });
    if (!result || result?.errors) return undefined;
    return result?.orderConfirm;
  }

  orderDeliveryStatus(status: OrderStatusDeliveryType) {
    return (
      {
        'in progress': 'En preparación',
        pending: 'Listo para enviarse',
        pickup: 'Listo para pick-up',
        shipped: 'De camino a ser entregado',
        delivered: 'Entregado',
      }[status] || 'Desconocido'
    );
  }

  async incomes(paginate: PaginationInput): Promise<Expenditure[]> {
    console.log(paginate);
    const result = await this.graphql.query({
      query: incomes,
      fetchPolicy: 'no-cache',
      variables: { paginate },
    });
    return result?.incomes;
  }

  async expendituresTotal(
    type,
    merchantId,
    typeCustomId: string,
    range?: PaginationRangeInput
  ) {
    const result = await this.graphql.query({
      query: expendituresTotal,
      fetchPolicy: 'no-cache',
      variables: { type, merchantId, typeCustomId, range },
    });
    return result;
  }

  async expenditureTypesCustom(merchantId) {
    const result = await this.graphql.query({
      query: expenditureTypesCustom,
      fetchPolicy: 'no-cache',
      variables: { merchantId },
    });
    return result?.expenditureTypesCustom;
  }

  async itemRemoveExpenditure(id: string, webformId: string) {
    const result = await this.graphql.mutate({
      mutation: itemRemoveExpenditure,
      variables: { id, webformId },
      fetchPolicy: 'no-cache',
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async deleteExpenditure(id: string) {
    const result = await this.graphql.mutate({
      mutation: deleteExpenditure,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    if (!result || result?.errors) return undefined;
    return result;
  }

  async expendituresTotalById(type: string, merchantId: string) {
    const result = await this.graphql.query({
      query: expendituresTotalById,
      fetchPolicy: 'no-cache',
      variables: { merchantId, type },
    });
    return result;
  }

  async expendituresTotalByTypeConstant(
    paginate: PaginationInput,
    activeDateRange?: ExpenditureActiveDateRangeInput
  ) {
    const result = await this.graphql.query({
      query: expendituresTotalByTypeConstant,
      fetchPolicy: 'no-cache',
      variables: { activeDateRange, paginate },
    });
    return result;
  }

  async answerIncomeTotal(webformId) {
    const result = await this.graphql.query({
      query: answerIncomeTotal,
      fetchPolicy: 'no-cache',
      variables: { webformId },
    });
    return result;
  }

  async incomeTypes(merchantId: string) {
    const result = await this.graphql.query({
      query: incomeTypes,
      fetchPolicy: 'no-cache',
      variables: { merchantId },
    });
    return result?.incomeTypes;
  }

  async incomeTotalByType(
    typeId: string,
    merchantId: string,
    subType: string,
    range?: PaginationRangeInput
  ) {
    const result = await this.graphql.query({
      query: incomeTotalByType,
      fetchPolicy: 'no-cache',
      variables: { typeId, merchantId, subType, range },
    });
    return result?.incomeTotalByType;
  }

  async ordersIncomeMerchantByUser(userId: string, merchantId: string) {
    const result = await this.graphql.query({
      query: ordersIncomeMerchantByUser,
      fetchPolicy: 'no-cache',
      variables: { userId, merchantId },
    });
    return result?.ordersIncomeMerchantByUser;
  }

  async createOrderExternal(input : ItemOrderExternalInput) {
    const result = await this.graphql.mutate({
      mutation: createOrderExternal,
      variables: { input },
      fetchPolicy: 'no-cache',
      context:{ useMultipart: true }
    });
    return result?.createOrderExternal;
  }

  async orderQuantityOfFiltersStatusDelivery(pagination: PaginationInput) {
    const result = await this.graphql.query({
      query: orderQuantityOfFiltersStatusDelivery,
      variables: { pagination },
      fetchPolicy: 'no-cache',
    });
    return result?.orderQuantityOfFiltersStatusDelivery;
  }

  async orderQuantityOfFiltersDeliveryZone(pagination: PaginationInput) {
    const result = await this.graphql.query({
      query: orderQuantityOfFiltersDeliveryZone,
      variables: { pagination },
      fetchPolicy: 'no-cache',
    });
    return result?.orderQuantityOfFiltersDeliveryZone;
  }

  async orderQuantityOfFiltersShippingType(pagination: PaginationInput) {
    const result = await this.graphql.query({
      query: orderQuantityOfFiltersShippingType,
      variables: { pagination },
      fetchPolicy: 'no-cache',
    });
    return result?.orderQuantityOfFiltersShippingType;
  }
}
