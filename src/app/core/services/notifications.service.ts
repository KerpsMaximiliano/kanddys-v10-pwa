import { Injectable } from '@angular/core';
import {
  notification,
  notifications,
  createNotification,
  updateNotification,
  itemAddNotification,
  notificationCheckers,
  addNotificationInTag,
} from '../graphql/notifications.gql';
import { Item } from '../models/item';
import { Tag } from '../models/tags';
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
   temporalNotification: NotificationInput;
  constructor(private graphql: GraphQLWrapper) {}

  async notification(merchantId: string, id: string): Promise<Notification> {
    const result = await this.graphql.mutate({
      mutation: notification,
      variables: { merchantId, id },
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
    (<NotificationChecker[]>result?.notificationCheckers).forEach(
      (notification) => {
        notification.date = new Date(notification.date);
      }
    );
    return result?.notificationCheckers;
  }

  // This one will be deprecated soon
  getNotificationAction(notification: Notification | NotificationChecker) {
    let action: string;
    let index: number;
    if (
      ('offsetTime' in notification && !notification.trigger?.length) ||
      ('notification' in notification &&
        !notification.notification.trigger?.length)
    )
      return;
    const trigger =
      'offsetTime' in notification
        ? notification.trigger[0]
        : notification.notification.trigger[0];
    if (trigger.key === 'generic') {
      if (trigger.value === 'create') {
        if (
          ('offsetTime' in notification && !notification.offsetTime?.length) ||
          ('notification' in notification &&
            !notification.notification.offsetTime?.length)
        ) {
          action = 'Al venderse para comprador';
          index = 0;
        } else {
          const offsetTime =
            'offsetTime' in notification
              ? notification.offsetTime[0]
              : notification.notification.offsetTime[0];
          const unit =
            offsetTime.unit === 'days'
              ? 'días'
              : offsetTime.unit === 'minutes'
              ? 'minutos'
              : offsetTime.unit === 'weeks' && 'semanas';
          action = `A los ${offsetTime.quantity} ${unit} después de la venta`;
          if (offsetTime.hour) {
            action = action + ` a las ${offsetTime.hour}`;
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

  async addNotificationInTag(
   merchantId: string,
   notificationId: string,
   tagId: string
 ): Promise<Tag> {
   const result = await this.graphql.mutate({
     mutation: addNotificationInTag,
     variables: { merchantId, notificationId, tagId },
   });
   return result?.addNotificationInTag;
 }


  // This is the correct one, stil in progress
  // getNotificationAction(notification: Notification | NotificationChecker) {
  //   let action: string;
  //   let index: number;
  //   if (
  //     ('offsetTime' in notification && !notification.trigger?.length) ||
  //     ('notification' in notification && !notification.trigger)
  //   )
  //     return;
  //   const trigger =
  //     'offsetTime' in notification
  //       ? notification.trigger[0]
  //       : notification.trigger;
  //   if (trigger.key === 'generic') {
  //     if (trigger.value === 'create') {
  //       if (
  //         ('offsetTime' in notification && !notification.offsetTime?.length) ||
  //         ('notification' in notification && !notification.trigger)
  //       ) {
  //         action = 'Al venderse para comprador';
  //         index = 0;
  //       } else {
  //         const offsetTime =
  //           'offsetTime' in notification
  //             ? notification.offsetTime[0]
  //             : notification.notification.offsetTime[0];
  //         const unit =
  //           offsetTime.unit === 'days'
  //             ? 'días'
  //             : offsetTime.unit === 'minutes'
  //             ? 'minutos'
  //             : offsetTime.unit === 'weeks' && 'semanas';
  //         action = `A los ${offsetTime.quantity} ${unit} después de la venta`;
  //         if (offsetTime.hour) {
  //           action = action + ` a las ${offsetTime.hour}}`;
  //           index = 3;
  //         } else {
  //           index = 4;
  //         }
  //       }
  //     }
  //   } else if (trigger.key === 'status') {
  //     action = 'status id para comprador';
  //     index = 2;
  //   }
  //   return {
  //     action,
  //     index,
  //   };
  // }
}
