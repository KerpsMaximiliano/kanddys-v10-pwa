import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { formatPhoneNumber } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Notification } from 'src/app/core/models/notification';
import { OrderStatusDeliveryType } from 'src/app/core/models/order';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-notification-creator',
  templateUrl: './notification-creator.component.html',
  styleUrls: ['./notification-creator.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationCreatorComponent implements OnInit {
  env: string = environment.assetsUrl;

  redirectTo: string = null;
  orderId: string = null;
  status: OrderStatusDeliveryType = null;
  notification: Notification;
  notifications: Notification[] = [];

  notificationForm = this.formBuilder.group({
    // name: [null, [Validators.required, Validators.pattern(/[\S]/)]],
    message: [null, [Validators.required, Validators.pattern(/[\S]/)]],
  });
  merchantNumber: string;

  // order: ItemOrder;
  orderDeliveryStatus = this.orderService.orderDeliveryStatus;
  statusList: OrderStatusDeliveryType[] = [
    'in progress',
    'pending',
    'pickup',
    'shipped',
    'delivered',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private merchantsService: MerchantsService,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { redirectTo, orderId, status } = queryParams;

      this.redirectTo = redirectTo;
      this.orderId = orderId;
      // this.status = status;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;
      if (typeof orderId === 'undefined') this.orderId = null;
      if (typeof status === 'undefined') this.status = null;

      this.merchantNumber = formatPhoneNumber(
        this.merchantsService.merchantData.owner.phone
      );
      // await this.getMerchant();
      const notificationId = this.route.snapshot.paramMap.get('notificationId');
      if (notificationId) await this.getNotification(notificationId);
      await this.getDeliveryNotifications();
      if (status) this.setStatus(status);

      // if (orderId) await this.getOrder(orderId);
      // if (this.notification) this.checkIfOrderHasNotification(this.order, this.notification._id);
    });
  }

  async save() {
    const { message } = this.notificationForm.value;
    const replaced_message = this.replaceWord(message, 'comprador', '[name]');
    try {
      lockUI();
      if (!this.notification) {
        const notification = await this.notificationsService.createNotification(
          {
            // name,
            message: replaced_message,
            entity: 'order',
            merchant: this.merchantsService.merchantData._id,
            phoneNumbers: [],
            trigger: [
              {
                key: 'orderStatusDelivery',
                value: this.status as OrderStatusDeliveryType,
              },
            ],
            offsetTime: [],
          }
        );

        // await this.notificationsService.orderAddNotification(
        //   [notification._id],
        //   this.orderId
        // );
        this.notification = notification;
        unlockUI();
        this.snackBar.open('El mensaje ha sido guardado', 'Ok', {
          duration: 4000,
        });
      } else {
        await this.notificationsService.updateNotification(
          { message: replaced_message },
          this.notification._id
        );

        // if (!this.orderHasNotification) {
        //   await this.notificationsService.orderAddNotification(
        //     [this.notification._id],
        //     this.orderId
        //   );
        //   this.orderHasNotification = true;
        // }
        unlockUI();
        this.snackBar.open('El mensaje ha sido actualizado', 'Ok', {
          duration: 4000,
        });
      }
    } catch (error) {
      console.log(error);
      unlockUI();
      this.snackBar.open(
        `Hubo un error al ${
          this.notification ? 'actualizar' : 'crear'
        } la notificación`,
        '',
        {
          duration: 3000,
        }
      );
    }
  }

  // async getOrder(orderId: string) {
  //   try {
  //     const { order } = await this.ordersService.order(orderId);
  //     this.order = order;
  //   } catch (error) {
  //     console.log(error);
  //     this.returnEvent();
  //   }
  // }

  // private checkIfOrderHasNotification(order: ItemOrder, notificationId: string) {
  //   if (
  //     order.notifications.length > 0 &&
  //     order.notifications.find((notification) => notification === notificationId)
  //   ) this.orderHasNotification = true;
  // }

  setStatus(status: OrderStatusDeliveryType) {
    if (this.status === status) return;
    this.status = status;
    this.notification = this.checkNotificationDeliveryStatus(status);
    if (!this.notification) {
      this.notificationForm.reset();
      return;
    }
    this.notificationForm.patchValue({
      name: this.notification.name,
      message: this.replaceWord(
        this.notification.message,
        this.escapeRegExp('[name]'),
        'comprador'
      ),
    });
  }

  async getNotification(notificationId: string) {
    try {
      const result = await this.notificationsService.notification(
        this.merchantsService.merchantData._id,
        notificationId
      );
      this.notification = result;
      const index = this.statusList.findIndex(
        (value) => value === result.trigger[0].value
      );
      this.statusList.unshift(this.statusList.splice(index, 1)[0]);
      this.notificationForm.patchValue({
        name: result.name,
        message: this.replaceWord(
          result.message,
          this.escapeRegExp('[name]'),
          'comprador'
        ),
      });
      // TODO validar si la notificación está contenida en el array de notificaciones de la orden
    } catch (error) {
      console.log(error);
      // this.returnEvent();
    }
  }

  async getDeliveryNotifications() {
    try {
      const result = await this.notificationsService.notifications(
        {
          options: {
            limit: -1,
            sortBy: 'createdAt:desc',
          },
          findBy: {
            entity: 'order',
            type: 'standard',
            mode: 'default',
            active: true,
          },
        },
        this.merchantsService.merchantData._id
      );

      this.notifications = result.filter(
        (notification) => notification.trigger[0].key === 'orderStatusDelivery'
      );
    } catch (error) {
      console.log(error);
    }
  }

  checkNotificationDeliveryStatus(status: OrderStatusDeliveryType) {
    return this.notifications.find(
      (option) => option.trigger[0].value === status
    );
  }

  getNameError() {
    if (this.notificationForm.get('name').hasError('required')) {
      return 'Este campo es obligatorio';
    }
  }

  getMessageError() {
    if (this.notificationForm.get('message').hasError('required')) {
      return 'Este campo es obligatorio';
    }
  }

  async returnEvent() {
    if (this.notificationForm.dirty) {
      if (this.notificationForm.invalid) return;
      await this.save();
    }
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

  private replaceWord(original: string, formerWord: string, newWord: string) {
    const regex = new RegExp(formerWord, 'g');
    return original.replace(regex, newWord);
  }

  private escapeRegExp(cadena: string) {
    return cadena.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // mouseDown: boolean;
  // startX: number;
  // scrollLeft: number;

  // stopDragging() {
  //   this.mouseDown = false;
  // }

  // startDragging(e: MouseEvent, el: HTMLDivElement) {
  //   this.mouseDown = true;
  //   this.startX = e.pageX - el.offsetLeft;
  //   this.scrollLeft = el.scrollLeft;
  // }

  // moveEvent(e: MouseEvent, el: HTMLDivElement) {
  //   e.preventDefault();
  //   if (!this.mouseDown) {
  //     return;
  //   }
  //   const x = e.pageX - el.offsetLeft;
  //   const scroll = x - this.startX;
  //   el.scrollLeft = this.scrollLeft - scroll;
  // }
}
