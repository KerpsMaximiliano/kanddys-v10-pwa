import { Injectable } from '@angular/core';
import {
  notification,
  notifications,
  createNotification,
  updateNotification,
  itemAddNotification,
  notificationCheckers,
} from '../graphql/notifications.gql';
import { Item } from '../models/item';
import {
  Notification,
  NotificationChecker,
  NotificationInput,
} from '../models/notification';
import { PaginationInput } from '../models/saleflow';
import { GraphQLWrapper } from './../graphql/graphql-wrapper.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  constructor(private graphql: GraphQLWrapper) {}

  async notification(id: string): Promise<Notification> {
    const result = await this.graphql.mutate({
      mutation: notification,
      variables: { id },
      context: { useMultipart: true },
    });
    return result?.notification;
  }

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

  async updateNotification(
    input: NotificationInput,
    id: string
  ): Promise<Notification> {
    const result = await this.graphql.mutate({
      mutation: updateNotification,
      variables: { input, id },
      context: { useMultipart: true },
    });
    return result?.updateNotification;
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

  async notificationCheckers(
    paginate: PaginationInput
  ): Promise<NotificationChecker[]> {
    const result = await this.graphql.mutate({
      mutation: notificationCheckers,
      variables: { paginate },
      context: { useMultipart: true },
    });
    (<NotificationChecker[]>result?.notificationCheckers).forEach((notification) => {
      notification.date = new Date(notification.date);
    });
    return result?.notificationCheckers;
  }

  getNotificationAction(notification: Notification) {
    let action: string;
    let index: number;
    const trigger = notification.trigger[0];
    if (trigger.key === 'generic') {
      if (trigger.value === 'create') {
        if (!notification.offsetTime?.length) {
          action = 'Al venderse para comprador';
          index = 0;
        } else {
          const offsetTime = notification.offsetTime[0];
          const unit =
            offsetTime.unit === 'days'
              ? 'días'
              : offsetTime.unit === 'minutes'
              ? 'minutos'
              : offsetTime.unit === 'weeks' && 'semanas';
          action = `A los ${offsetTime.quantity} ${unit} después de la venta`;
          if (offsetTime.hour) {
            action = action + ` a las ${offsetTime.hour}}`;
            index = 3;
          } else {
            index = 4;
          }
        }
      }
    } else if (trigger.key === 'status') {
      action = 'status id para comprador';
      index = 2;
    }
    return {
      action,
      index,
    };
  }
}
