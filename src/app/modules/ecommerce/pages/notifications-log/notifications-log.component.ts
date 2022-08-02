import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { NotificationChecker } from 'src/app/core/models/notification';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';

const completeItems = [
  {
    headline: 'DATE ID PARA (000) 000 - 0000',
    icon: '/whatsapp_verde.svg',
    data: [
      {
        name: {
          text: 'AL VENDERSE',
          fontSize: '13px',
          color: '#7B7B7B',
          fontFamily: 'RobotoMedium',
        },
        subtitle: {
          text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..',
          fontSize: '17px',
          color: '#202020',
          fontFamily: 'RobotoItalic',
        },
      },
    ],
    showSubtitle: false,
  },
  {
    headline: 'DATE ID PARA (000) 000 - 0000',
    icon: '/whatsapp_verde.svg',
    data: [
      {
        name: {
          text: 'AL VENDERSE',
          fontSize: '13px',
          color: '#7B7B7B',
          fontFamily: 'RobotoMedium',
        },
        subtitle: {
          text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..',
          fontSize: '17px',
          color: '#202020',
          fontFamily: 'RobotoItalic',
        },
      },
    ],
    showSubtitle: false,
  },
  {
    headline: 'DATE ID PARA (000) 000 - 0000',
    icon: '/whatsapp_verde.svg',
    data: [
      {
        name: {
          text: 'AL VENDERSE',
          fontSize: '13px',
          color: '#7B7B7B',
          fontFamily: 'RobotoMedium',
        },
        subtitle: {
          text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..',
          fontSize: '17px',
          color: '#202020',
          fontFamily: 'RobotoItalic',
        },
      },
    ],
    showSubtitle: false,
  },
  {
    headline: 'DATE ID PARA (000) 000 - 0000',
    icon: '/whatsapp_verde.svg',
    data: [
      {
        name: {
          text: 'AL VENDERSE',
          fontSize: '13px',
          color: '#7B7B7B',
          fontFamily: 'RobotoMedium',
        },
        subtitle: {
          text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..',
          fontSize: '17px',
          color: '#202020',
          fontFamily: 'RobotoItalic',
        },
      },
    ],
    showSubtitle: false,
  },
  {
    headline: 'DATE ID PARA (000) 000 - 0000',
    icon: '/whatsapp_verde.svg',
    data: [
      {
        name: {
          text: 'AL VENDERSE',
          fontSize: '13px',
          color: '#7B7B7B',
          fontFamily: 'RobotoMedium',
        },
        subtitle: {
          text: 'Aquí está el mensaje escrito que agregó el provider para que le llega al comprad..',
          fontSize: '17px',
          color: '#202020',
          fontFamily: 'RobotoItalic',
        },
      },
    ],
    showSubtitle: false,
  },
];

@Component({
  selector: 'app-notifications-log',
  templateUrl: './notifications-log.component.html',
  styleUrls: ['./notifications-log.component.scss'],
})
export class NotificationsLogComponent implements OnInit {
  completeItems: any[] = completeItems;
  notifications: NotificationChecker[];
  allShow: boolean = false;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  merchant: Merchant;

  constructor(
    private merchantsService: MerchantsService,
    private authService: AuthService,
    private notificationsService: NotificationsService,
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
      // this.saleflow = await this.saleflowService.saleflowDefault(this.merchant._id);
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
      console.log(this.notifications);
    } catch (error) {
      this.status = 'error';
      console.log(error);
    }
  }

  showAll = () => {
    this.completeItems.forEach((item) => {
      item.showSubtitle = true;
    });
    this.allShow = true;
  };

  return() {
    if (this.allShow) {
      this.completeItems.forEach((item) => {
        item.showSubtitle = false;
      });
      this.allShow = false;
    } else {
      console.log('Seria un location Back ');
    }
  }

  errorScreen() {
    unlockUI();
    this.status = 'error';
    this.router.navigate([`ecommerce/error-screen/`]);
  }
}
