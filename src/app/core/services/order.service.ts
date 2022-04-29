import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GraphQLWrapper } from '../graphql/graphql-wrapper.service';
import {
  order,
  createOrder,
  payOrder,
  ordersByUser,
  addTagsInOrder,
  toggleUserNotifications,
  updateTagsInOrder,
} from '../graphql/order.gql';
import { ItemOrder } from '../models/order';
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private graphql: GraphQLWrapper) {}

  orders: any = [];

  async createOrder(input: any) {
    console.log(input);
    const result = await this.graphql.mutate({
      mutation: createOrder,
      variables: { input },
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
  }

  async payOrder(ocr: any, userId: string, payMode: string, orderId: string) {
    console.log(ocr, userId, payMode, orderId);

    const result = await this.graphql.mutate({
      mutation: payOrder,
      variables: { ocr, userId, payMode, orderId },
      context: { useMultipart: true },
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
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

  async addTagsInOrder(orderId: any, tags: any, merchantId: any) {
    console.log(tags);
    const result = await this.graphql.mutate({
      mutation: addTagsInOrder,
      variables: { orderId, tags, merchantId },
    });

    if (!result || result?.errors) return undefined;

    console.log(result);
    return result;
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
