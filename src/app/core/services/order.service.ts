import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
} from '../graphql/order.gql';
import { ItemOrder, ItemOrderInput, OCRInput } from '../models/order';
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private graphql: GraphQLWrapper) {}

  orders: any = [];

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
    orderId: string
  ): Promise<{ payOrder: { _id: string } }> {
    const result = await this.graphql.mutate({
      mutation: payOrder,
      variables: { ocr, userId, payMode, orderId },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;

    return result;
  }

  async ordersByUser(pagination?: any): Promise<{ ordersByUser: ItemOrder[] }> {
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

  async ordersTotal(status: 
    (| 'cancelled'
    | 'started'
    | 'verifying'
    | 'in progress'
    | 'to confirm'
    | 'completed'
    | 'error'
    | 'draft')[], merchantId?: string, orders?: string[]): Promise<{ total: number, length: number }> {
    try {
      const response = await this.graphql.query({
        query: ordersTotal,
        variables: { status, merchantId, orders },
        fetchPolicy: 'no-cache',
      });
      if(!response || response?.errors) return undefined;
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

  async order(orderId: string): Promise<{ order: ItemOrder }> {
    try {
      const response = await this.graphql.query({
        query: order,
        variables: { orderId },
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
}
