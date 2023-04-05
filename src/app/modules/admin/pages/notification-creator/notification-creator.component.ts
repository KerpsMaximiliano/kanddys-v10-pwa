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
  orderHasNotification: boolean = false;

  notificationText: string = "";
  notification: Notification;

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
      const { redirectTo, orderId } = queryParams;

      this.redirectTo = redirectTo;
      this.orderId = orderId;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;
      if (typeof orderId === 'undefined') this.orderId = null;

      
      await this.getMerchant();
      const notificationId = this.route.snapshot.paramMap.get('notificationId');
      if (notificationId) await this.getNotification(this.merchant._id, notificationId);
      else await this.checkIfOrderHasNotification(orderId, this.merchant._id);
      
    });
  }

  async save() {
    console.log("Saving...");

    try {
      lockUI();
      if (!this.orderHasNotification) {
        const notification = await this.notificationsService.createNotification(
          {
            message: this.notificationText,
            entity: "order",
            merchant: this.merchant._id,
            phoneNumbers: [],
            trigger: [
              {
                key: "orderStatusDelivery",
                value: "pending"
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
          { message: this.notificationText },
          this.notification._id
        );
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

  async checkIfOrderHasNotification(orderId: string, merchanId: string) {
    try {
      const { order } = await this.ordersService.order(orderId);
      if (order.notifications.length > 0) {
        this.orderHasNotification = true;
        const notification = await this.notificationsService.notification(merchanId, order.notifications[0]);
        this.notification = notification;
        this.notificationText = this.notification.message;
      }
    } catch (error) {
      console.log(error);
      // this.returnEvent();
    }
  }

  async getNotification(merchantId: string, notificationId: string) {
    try {
      const result = await this.notificationsService.notification(merchantId, notificationId);
      this.notification = result;
      this.notificationText = result.message;
      this.orderHasNotification = true;
      // TODO validar si la notificación está contenida en el array de notificaciones de la orden
    } catch (error) {
      console.log(error);
      // this.returnEvent();
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

}
