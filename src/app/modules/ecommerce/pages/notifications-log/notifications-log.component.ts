import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { NotificationChecker } from 'src/app/core/models/notification';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

interface ExtraNotificationChecker extends NotificationChecker {
  showMessage?: boolean;
  action?: string;
}

@Component({
  selector: 'app-notifications-log',
  templateUrl: './notifications-log.component.html',
  styleUrls: ['./notifications-log.component.scss'],
})
export class NotificationsLogComponent implements OnInit {
  notifications: ExtraNotificationChecker[];
  allShow: boolean = false;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  merchant: Merchant;

  constructor(
    private merchantsService: MerchantsService,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    lockUI();
    this.authService.ready.subscribe(async (observer) => {
      if (observer != undefined) {
        this.status = 'loading';
        const user = await this.authService.me();
        if (!user) this.errorScreen();

        await this.getMerchant();
        await this.getNotifications();
        this.status = 'complete';
        unlockUI();
      } else {
        this.errorScreen();
      }
    });
  }

  async getMerchant() {
    try {
      this.merchant = await this.merchantsService.merchantDefault();
    } catch (error) {
      this.status = 'error';
      console.log(error);
    }
  }

  async getNotifications() {
    try {
      this.notifications = await this.notificationsService.notificationCheckers(
        {
          findBy: {
            merchant: this.merchant._id,
            status: 'sent',
          },
        }
      );
      if(!this.notifications?.length) return;
      this.notifications.forEach((notification) => {
        notification.date = new Date(notification.date);
        const phoneUtil = PhoneNumberUtil.getInstance();
        const phoneNumber = phoneUtil.parse('+'+notification.user.phone);
        const phone = phoneUtil.format(phoneNumber, PhoneNumberFormat.INTERNATIONAL);
        notification.user.phone = phone;
        notification.action = this.notificationsService.getNotificationAction(notification)?.action;
      });
    } catch (error) {
      this.status = 'error';
      console.log(error);
    }
  }

  showAll = () => {
    this.notifications.forEach((item) => {
      item.showMessage = true;
    });
    this.allShow = true;
  };

  return() {
    if(!this.allShow) return this.location.back();
    this.notifications.forEach((item) => {
      item.showMessage = false;
    });
    this.allShow = false;
  }

  errorScreen() {
    unlockUI();
    this.status = 'error';
    this.router.navigate([`ecommerce/error-screen/`]);
  }
}
