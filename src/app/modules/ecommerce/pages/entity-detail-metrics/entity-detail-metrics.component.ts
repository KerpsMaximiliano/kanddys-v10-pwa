import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Calendar } from 'src/app/core/models/calendar';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';

const days = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const dayNames = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

interface ExtraCalendar extends Calendar {
  subtitle?: string;
}

@Component({
  selector: 'app-entity-detail-metrics',
  templateUrl: './entity-detail-metrics.component.html',
  styleUrls: ['./entity-detail-metrics.component.scss'],
})
export class EntityDetailMetricsComponent implements OnInit {
  URI: string = environment.uri;
  merchant: Merchant;
  items: Item[];
  user: User;
  users: User[];
  mode: 'collections' | 'store' = 'store';
  ordersTotal: {
    total: number;
    length: number;
  };
  tags: { text: string }[];
  categories: { text: string }[];
  admin: boolean;
  saleflow: SaleFlow;
  calendars: ExtraCalendar[];

  constructor(
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private ordersService: OrderService,
    private itemsService: ItemsService,
    private saleflowService: SaleFlowService,
    private dialogService: DialogService,
    private headerService: HeaderService,
    private calendarService: CalendarService,
    private location: Location
  ) {}

  async ngOnInit(): Promise<void> {
    lockUI();
    this.merchant = await this.merchantsService.merchantDefault();
    if (!this.merchant) {
      this.router.navigate([`ecommerce/error-screen/`]);
      return;
    }
    this.items = (
      await this.merchantsService.itemsByMerchant(this.merchant._id)
    )?.itemsByMerchant;

    this.user = await this.authService.me();
    if (this.user) {
      if (this.merchant.owner._id !== this.user._id) return unlockUI();
      this.admin = true;
      await Promise.all([
        this.getOrderTotal(),
        this.getMerchantBuyers(),
        this.getTags(),
        this.getCategories(),
        this.getSaleflow(),
        this.getCalendars(),
      ]);
    }
    unlockUI();
  }

  async getCalendars() {
    try {
      this.calendars = await this.calendarService.getCalendarsByMerchant(
        this.merchant._id
      );
      this.calendars = this.calendars.map((calendar) => {
        calendar.subtitle =
          calendar.reservationLimits +
          ' reservaciones cada ' +
          (calendar.timeChunkSize - calendar.breakTime) +
          ' min + ' +
          calendar.breakTime +
          ' min receso \nLaboral: ' +
          (calendar.limits
            ? this.changeHourFormat(calendar.limits.fromHour) +
              ' a ' +
              this.changeHourFormat(calendar.limits.toHour) +
              '\nDias: ' +
              calendar.limits.fromDay +
              ' a ' +
              calendar.limits.toDay
            : 'Todo el dia' + '\nDias: Todos los días');
        return calendar;
      });
    } catch (error) {
      console.log(error);
    }
  }

  changeHourFormat(hour: string) {
    return new Date('1970-01-01T' + hour + 'Z').toLocaleTimeString('en-US', {
      timeZone: 'UTC',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
    });
  }

  async getOrderTotal() {
    try {
      this.ordersTotal = await this.ordersService.ordersTotal(
        ['in progress', 'to confirm', 'completed'],
        this.merchant._id
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getMerchantBuyers() {
    try {
      this.users = await this.merchantsService.usersOrderMerchant(
        this.merchant._id
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getTags() {
    try {
      const tags = (
        await this.merchantsService.tagsByMerchant(this.merchant._id)
      )?.tagsByMerchant;
      if (!tags) return;
      this.tags = tags
        .filter((tag) => tag.tags?.name)
        .map((tag) => ({ text: tag.tags.name }));
    } catch (error) {
      console.log(error);
    }
  }

  async getCategories() {
    try {
      const categories = (
        await this.itemsService.itemCategories(this.merchant._id, {
          options: {
            limit: 1000,
          },
        })
      )?.itemCategoriesList;
      if (!categories) return;
      this.categories = categories
        .filter((category) => category.name)
        .map((category) => ({ text: category.name }));
    } catch (error) {
      console.log(error);
    }
  }

  async getSaleflow() {
    try {
      this.saleflow = await this.saleflowService.saleflowDefault(
        this.merchant._id
      );
    } catch (error) {
      console.log(error);
    }
  }

  onShareClick = () => {
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}/ecommerce/store/${this.saleflow._id}`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/store/${this.saleflow._id}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/store/${this.saleflow._id}`,
          },
          {
            text: 'Ir a la vista del visitante',
            mode: 'func',
            func: () =>
              this.router.navigate([`/ecommerce/store/${this.saleflow._id}`]),
          },
        ],
      },
    ];
    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  onPencilClick = () => {
    this.router.navigate(['ecommerce/user-creator']);
  };

  redirectToCreateItem = () => {
    this.headerService.flowRoute = this.router.url;
    this.itemsService.temporalItem = null;
    this.router.navigate(['ecommerce/item-creator']);
  };

  redirectMerchantItems = (url: string) => {
    this.router.navigate(['/ecommerce/' + url]);
  };

  back() {
    this.location.back();
  }
}
