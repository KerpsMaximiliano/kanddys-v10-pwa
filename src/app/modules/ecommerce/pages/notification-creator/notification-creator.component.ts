import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import {
  Notification,
  NotificationInput,
  OffsetTimeInput,
  TriggerInput,
} from 'src/app/core/models/notification';
// import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { OptionAnswerSelector } from 'src/app/shared/components/answer-selector/answer-selector.component';

const actionList = [
  {
    value: 'Al venderse',
    status: true,
  },
  {
    value: 'Después de la entrega',
    status: true,
  },
  // {
  //   value: 'AirTable Status ID',
  //   status: true,
  // },
  {
    value: 'StatusID',
    status: true,
  },
  {
    valueArray: [
      {
        text: 'A',
        highlight: false,
      },
      {
        text: 'los',
        highlight: false,
      },
      {
        text: '45',
        highlight: true,
      },
      {
        text: 'dias',
        highlight: false,
      },
      {
        text: 'después',
        highlight: false,
      },
      {
        text: 'de',
        highlight: false,
      },
      {
        text: 'la',
        highlight: false,
      },
      {
        text: 'venta',
        highlight: false,
      },
      {
        text: 'a',
        highlight: false,
      },
      {
        text: 'las',
        highlight: false,
      },
      {
        text: '9:00 AM',
        highlight: true,
      },
    ],
    isOptionAnArray: true,
    status: true,
  },
  {
    valueArray: [
      {
        text: 'A',
        highlight: false,
      },
      {
        text: 'los',
        highlight: false,
      },
      {
        text: '10',
        highlight: true,
      },
      {
        text: 'minutos',
        highlight: false,
      },
      {
        text: 'después',
        highlight: false,
      },
      {
        text: 'de',
        highlight: false,
      },
      {
        text: 'la',
        highlight: false,
      },
      {
        text: 'venta.',
        highlight: false,
      },
    ],
    isOptionAnArray: true,
    status: true,
  },
  // {
  //   value: 'Conectar Status de AirTable',
  //   status: true,
  // },
];

const receiverOptions = [
  {
    value: 'El comprador',
    status: true,
  },
  {
    value: '(000) 000-0000 (WA salvado)',
    status: true,
  },
  {
    value: 'Adicionar otro WA',
    status: true,
  },
];

@Component({
  selector: 'app-notification-creator',
  templateUrl: './notification-creator.component.html',
  styleUrls: ['./notification-creator.component.scss'],
})
export class NotificationCreatorComponent implements OnInit {
  actionList: OptionAnswerSelector[] = actionList;
  receiverOptions: OptionAnswerSelector[] = receiverOptions;
  selectedAction: number;
  selectedReceiver: number;
  notificationMessage: string;
  merchant: Merchant;
  item: Item;
  notification: Notification;
  entity: 'item' = 'item';

  constructor(
    // private authService: AuthService,
    private merchantsService: MerchantsService,
    private notificationsService: NotificationsService,
    private itemsService: ItemsService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  async ngOnInit(): Promise<void> {
    // const user = await this.authService.me();
    // if (!user) this.router.navigate(['error-screen']);
    this.merchant = await this.merchantsService.merchantDefault();
    if (!this.merchant) {
      this.router.navigate(['error-screen']);
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    this.item = await this.itemsService.item(id);
    if (!this.item) {
      this.router.navigate(['error-screen']);
      return;
    }
    const notificationId = this.route.snapshot.paramMap.get('notificationId');
    if (!notificationId) return;
    this.notification = await this.notificationsService.notification(
      this.merchant._id,
      notificationId
    );
    if (!this.notification) {
      this.router.navigate(['error-screen']);
      return;
    }
    this.notificationMessage = this.notification.message;
    this.selectedAction = this.notificationsService.getNotificationAction(
      this.notification
    ).index;
  }

  async save() {
    if (!this.notificationMessage?.trim()) return;
    const notificationInput: NotificationInput = {
      message: this.notificationMessage,
      merchant: this.merchant._id,
      entity: this.entity,
      trigger: this.getTriggers(),
      offsetTime: this.getOffsetTime(),
      phoneNumbers: [],
    };
    try {
      lockUI();
      if (!this.notification) {
        const notification = await this.notificationsService.createNotification(
          notificationInput
        );
        await this.notificationsService.itemAddNotification(
          [notification._id],
          this.item._id
        );
      } else
        await this.notificationsService.updateNotification(
          notificationInput,
          this.notification._id
        );
      unlockUI();
      this.back();
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  getTriggers(): [TriggerInput] {
    if (
      this.selectedAction === 0 ||
      this.selectedAction === 3 ||
      this.selectedAction === 4
    ) {
      return [
        {
          key: 'generic',
          value: 'create',
        },
      ];
    }
    if (this.selectedAction === 1 || this.selectedAction === 2) {
      return [
        {
          key: 'status',
          value: 'to confirm',
        },
      ];
    }
  }

  getOffsetTime(): [OffsetTimeInput] {
    if (this.selectedAction === 3) {
      return [
        {
          quantity: 45,
          unit: 'days',
          hour: 9,
        },
      ];
    } else if (this.selectedAction === 4) {
      return [
        {
          quantity: 10,
          unit: 'minutes',
          hour: null,
        },
      ];
    } else {
      return;
    }
  }

  back() {
    this.location.back();
  }
}
