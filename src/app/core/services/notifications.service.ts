import { Injectable } from '@angular/core';
import {
  notifications,
  createNotification,
  itemAddNotification,
} from '../graphql/notifications.gql';
import { Item } from '../models/item';
import { Notification, NotificationInput } from '../models/notification';
import { PaginationInput } from '../models/saleflow';
import { GraphQLWrapper } from './../graphql/graphql-wrapper.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  constructor(private graphql: GraphQLWrapper) {}

  async notifications(
    paginate: PaginationInput,
    merchantId: string,
    notificationId: string[]
  ): Promise<Notification[]> {
    const result = await this.graphql.mutate({
      mutation: notifications,
      variables: { paginate, merchantId, notificationId },
      context: { useMultipart: true },
    });
    return result?.notifications;
  }

  async createNotification(input: NotificationInput): Promise<Notification> {
    const result = await this.graphql.mutate({
      mutation: createNotification,
      variables: { input },
      context: { useMultipart: true },
    });
    return result?.createNotification;
  }

  async itemAddNotification(
    notificationId: string[],
    id: string
  ): Promise<Item> {
    const result = await this.graphql.mutate({
      mutation: itemAddNotification,
      variables: { notificationId, id },
      context: { useMultipart: true },
    });
    return result?.itemAddNotification;
  }
}
