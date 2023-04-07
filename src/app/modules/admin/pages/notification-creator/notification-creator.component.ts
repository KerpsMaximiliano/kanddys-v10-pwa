import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ViewEncapsulation } from '@angular/core';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { Merchant } from 'src/app/core/models/merchant';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { OrderService } from 'src/app/core/services/order.service';
import { Notification } from 'src/app/core/models/notification';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemOrder, OrderStatusDeliveryType } from 'src/app/core/models/order';

@Component({
  selector: 'app-notification-creator',
  templateUrl: './notification-creator.component.html',
  styleUrls: ['./notification-creator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationCreatorComponent implements OnInit {

  env: string = environment.assetsUrl;

  redirectTo: string = null;
  orderId: string = null;
  status: string = null;
  orderHasNotification: boolean = false;

  notificationText: string = "";
  notification: Notification;

  order: ItemOrder;

  merchant: Merchant;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private merchantsService: MerchantsService,
    private ordersService: OrderService,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { redirectTo, orderId, status } = queryParams;

      this.redirectTo = redirectTo;
      this.orderId = orderId;
      this.status = status;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;
      if (typeof orderId === 'undefined') this.orderId = null;
      if (typeof status === 'undefined') this.status = null;

      
      await this.getMerchant();
      const notificationId = this.route.snapshot.paramMap.get('notificationId');
      if (notificationId) await this.getNotification(this.merchant._id, notificationId);
      if (status) await this.getDeliveryNotifications(this.merchant._id, status);

      if (orderId) await this.getOrder(orderId);
      if (this.notification) this.checkIfOrderHasNotification(this.order, this.notification._id);
    });
  }

  async save() {
    console.log("Saving...");
    console.log(this.status);

    const message = this.replaceWord(this.notificationText, "comprador", "[name]");
    try {
      lockUI();
      if (!this.notification) {
        const notification = await this.notificationsService.createNotification(
          {
            message,
            entity: "order",
            merchant: this.merchant._id,
            phoneNumbers: [],
            trigger: [
              {
                key: "orderStatusDelivery",
                value: this.status as OrderStatusDeliveryType
              }
            ],
            offsetTime: []
          }
        );

        await this.notificationsService.orderAddNotification(
          [notification._id],
          this.orderId
        );
        this.notification = notification;
        this.orderHasNotification = true;
        this.snackBar.open('El mensaje ha sido guardado', '', {
          duration: 2000,
        });
      } else {
        await this.notificationsService.updateNotification(
          { message },
          this.notification._id
        );

        if (!this.orderHasNotification) {
          await this.notificationsService.orderAddNotification(
            [this.notification._id],
            this.orderId
          );
          this.orderHasNotification = true;
        }
        this.snackBar.open('El mensaje ha sido actualizado', '', {
          duration: 2000,
        });
      }
      unlockUI();
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  async getMerchant() {
    try {
      const result = await this.merchantsService.merchantDefault();
      this.merchant = result;
    } catch (error) {
      console.log(error);
      // this.returnEvent();
    }
  }

  async getOrder(orderId: string) {
    try {
      const { order } = await this.ordersService.order(orderId);
      this.order = order;
    } catch (error) {
      console.log(error);
      this.returnEvent();
    }
  }

  private checkIfOrderHasNotification(order: ItemOrder, notificationId: string) {
    if (
      order.notifications.length > 0 && 
      order.notifications.find((notification) => notification === notificationId)
    ) this.orderHasNotification = true;
  }

  async getNotification(merchantId: string, notificationId: string) {
    try {
      const result = await this.notificationsService.notification(merchantId, notificationId);
      this.notification = result;
      this.notificationText = this.replaceWord(result.message, this.escapeRegExp("[name]"), "comprador");
      // TODO validar si la notificación está contenida en el array de notificaciones de la orden
    } catch (error) {
      console.log(error);
      // this.returnEvent();
    }
  }

  async getDeliveryNotifications(merchantId: string, status: string) {
    try {

      if (!this.notification) {
        const result = await this.notificationsService.notifications(
          {
            options: {
              limit: -1,
              sortBy: 'createdAt:desc',
            },
            findBy: {
              entity: "order",
              type: "standard",
              mode: "default"
            }
          },
          merchantId
        );
  
        const notification = result.find((notification) => {
          return notification.trigger[0].key === 'orderStatusDelivery' && notification.trigger[0].value === status;
        });
  
        if (notification) {
          this.notification = notification;
          this.notificationText = this.replaceWord(notification.message, this.escapeRegExp("[name]"), "comprador");
        }
      } else {
        const notification = (this.notification.trigger[0].key === 'orderStatusDelivery' && this.notification.trigger[0].value === status) ? this.notification : null;
        if (!notification) this.returnEvent();
      }
      
    } catch (error) {
      console.log(error);
    }
  }

  returnEvent() {
    let queryParams = {};
    if (this.redirectTo && this.redirectTo.includes('?')) {
      const url = this.redirectTo.split('?');
      this.redirectTo = url[0];
      const queryParamList = url[1].split('&');
      for (const param in queryParamList) {
        const keyValue = queryParamList[param].split('=');
        queryParams[keyValue[0]] = keyValue[1];
      }
    }
    this.router.navigate([this.redirectTo], {
      queryParams,
    });
  }

  private replaceWord(original, formerWord, newWord) {
    const regex = new RegExp(formerWord, "g");
    return original.replace(regex, newWord);
  }

  private escapeRegExp(cadena) {
    return cadena.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

}
