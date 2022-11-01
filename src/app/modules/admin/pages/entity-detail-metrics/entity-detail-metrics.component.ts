import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { PaginationInput, SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { Answer, Webform } from 'src/app/core/models/webform';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SettingsComponent } from 'src/app/shared/dialogs/settings/settings.component';
import { environment } from 'src/environments/environment';

// interface ExtraCalendar extends Calendar {
//   subtitle?: string;
// }

@Component({
  selector: 'app-entity-detail-metrics',
  templateUrl: './entity-detail-metrics.component.html',
  styleUrls: ['./entity-detail-metrics.component.scss'],
})
export class EntityDetailMetricsComponent implements OnInit {
  URI: string = environment.uri;
  items: Item[];
  activeItems: Item[];
  inactiveItems: Item[];
  highlightedItems: Item[];
  // user: User;
  users: User[];
  mode: 'collections' | 'store' = 'store';
  ordersTotal: {
    total: number;
    length: number;
  };
  // tags: { text: string }[];
  // categories: { text: string }[];
  saleflow: SaleFlow;
  webforms: Webform[];
  answers: Answer[];
  // calendars: ExtraCalendar[];

  constructor(
    public merchantsService: MerchantsService,
    private router: Router,
    private authService: AuthService,
    private ordersService: OrderService,
    private itemsService: ItemsService,
    private saleflowService: SaleFlowService,
    private dialogService: DialogService,
    private headerService: HeaderService,
    // private calendarService: CalendarService,
    private location: Location,
    private webformsService: WebformsService,
    private ngNavigatorShareService: NgNavigatorShareService
  ) {}

  async ngOnInit(): Promise<void> {
    lockUI();
    await Promise.all([
      this.getItemsByMerchant(),
      this.getOrderTotal(),
      this.getMerchantBuyers(),
      this.getWebformsData(),
    ]);
    unlockUI();
  }

  async getItemsByMerchant() {
    try {
      this.items = (
        await this.merchantsService.itemsByMerchant(
          this.merchantsService.merchantData._id
        )
      )?.itemsByMerchant;
      this.activeItems = this.items.filter(
        (item) => item.status === 'active' || item.status === 'featured'
      );
      this.inactiveItems = this.items.filter(
        (item) => item.status === 'disabled'
      );
      this.highlightedItems = this.items.filter(
        (item) => item.status === 'featured'
      );
    } catch (error) {
      console.log(error);
    }
  }

  // async getCalendars() {
  //   try {
  //     this.calendars = await this.calendarService.getCalendarsByMerchant(
  //       this.merchantsService.merchantData._id
  //     );
  //     this.calendars = this.calendars.map((calendar) => {
  //       calendar.subtitle =
  //         calendar.reservationLimits +
  //         ' reservaciones cada ' +
  //         (calendar.timeChunkSize - calendar.breakTime) +
  //         ' min + ' +
  //         calendar.breakTime +
  //         ' min receso \nLaboral: ' +
  //         (calendar.limits
  //           ? this.changeHourFormat(calendar.limits.fromHour) +
  //             ' a ' +
  //             this.changeHourFormat(calendar.limits.toHour) +
  //             '\nDias: ' +
  //             calendar.limits.fromDay +
  //             ' a ' +
  //             calendar.limits.toDay
  //           : 'Todo el dia' + '\nDias: Todos los días');
  //       return calendar;
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

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
      const ordersTotalResponse = await this.ordersService.ordersTotal(
        ['in progress', 'to confirm', 'completed'],
        this.merchantsService.merchantData._id
      );

      const incomeMerchantResponse = await this.merchantsService.incomeMerchant(
        this.merchantsService.merchantData._id
      );

      if (ordersTotalResponse !== null && incomeMerchantResponse !== null) {
        this.ordersTotal = { length: null, total: null };
        this.ordersTotal.length = ordersTotalResponse.length;
        this.ordersTotal.total = incomeMerchantResponse;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getMerchantBuyers() {
    try {
      this.users = await this.merchantsService.usersOrderMerchant(
        this.merchantsService.merchantData._id
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getWebformsData() {
    try {
      this.webforms = await this.webformsService.webformsByMerchant(
        this.merchantsService.merchantData._id
      );
      console.log(this.webforms);

      const webformIDs = this.webforms.map((value) => value._id);

      await this.getWebformsAnswers({
        findBy: {
          webform: webformIDs,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getWebformsAnswers(input: PaginationInput) {
    try {
      this.answers = await this.webformsService.answerPaginate(input);
    } catch (error) {
      console.log(error);
    }
  }

  // async getTags() {
  //   try {
  //     const tags = (
  //       await this.merchantsService.tagsByMerchant(this.merchantsService.merchantData._id)
  //     )?.tagsByMerchant;
  //     if (!tags) return;
  //     this.tags = tags
  //       .filter((tag) => tag.tags?.name)
  //       .map((tag) => ({ text: tag.tags.name }));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async getCategories() {
  //   try {
  //     const categories = (
  //       await this.itemsService.itemCategories(this.merchantsService.merchantData._id, {
  //         options: {
  //           limit: 1000,
  //         },
  //       })
  //     )?.itemCategoriesList;
  //     if (!categories) return;
  //     this.categories = categories
  //       .filter((category) => category.name)
  //       .map((category) => ({ text: category.name }));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  onOptionsClick = () => {
    const list = [
      {
        text: 'Crea un nuevo artículo',
        callback: () => {
          this.headerService.flowRoute = this.router.url;
          this.router.navigate([`admin/create-item`]);
        },
      },
      {
        text: 'Vende online. Comparte el link',
        callback: async () => {
          await this.ngNavigatorShareService
            .share({
              title: '',
              url:
                environment.uri +
                '/ecommerce/store/' +
                this.saleflowService.saleflowData._id,
            })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            });
        },
      },
      {
        text: 'Cerrar Sesión',
        styles: {
          color: '#ad2828',
        },
        asyncCallback: () => {
          return new Promise((resolve) => {
            this.authService.signoutThree();
            this.headerService.flowRoute = this.router.url;
            this.router.navigate([`auth/login`], {
              queryParams: {
                redirect: '/admin/items-dashboard'
              }
            });
            resolve(true);
          });
        },
      },
    ];

    this.dialogService.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: this.merchantsService.merchantData
          ? 'Sobre ' + this.merchantsService.merchantData.name
          : 'Sobre Tienda anonima',
        optionsList: list,
        //qrCode: `${this.URI}/ecommerce/store/${this.saleflow._id}`,
        cancelButton: {
          text: 'cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  onShareOrdersClick = () => {
    const list = [
      {
        text: 'Vende online. Comparte el link',
        callback: async () => {
          const link = `${this.URI}/ecommerce/store/${this.saleflowService.saleflowData._id}`;

          await this.ngNavigatorShareService
            .share({
              title: '',
              url: link,
            })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            });
        },
      },
    ];

    this.dialogService.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        optionsList: list,
        title: 'Sobre las facturas',
        cancelButton: {
          text: 'Cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  onShareItemsClick = () => {
    const list = [
      {
        text: 'Crea un nuevo artículo',
        callback: () => {
          this.headerService.flowRoute = this.router.url;
          this.router.navigate([`admin/create-item`]);
        },
      },
      {
        text: 'Vende online. Comparte el link',
        callback: async () => {
          const link = `${this.URI}/ecommerce/store/${this.saleflowService.saleflowData._id}`;
          await this.ngNavigatorShareService
            .share({
              title: '',
              url: link,
            })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            });
        },
      },
    ];

    this.dialogService.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: 'Sobre los articulos',
        optionsList: list,
        cancelButton: {
          text: 'Cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  onPencilClick = () => {
    this.headerService.flowRoute = this.router.url;
    this.router.navigate(['admin/create-item']);
  };

  redirectToCreateItem = () => {
    this.headerService.flowRoute = this.router.url;
    this.itemsService.temporalItem = null;
    this.router.navigate(['admin/create-item']);
  };

  redirectMerchantItems = (url: string) => {
    this.headerService.flowRoute = this.router.url;
    this.router.navigate(['/admin/' + url]);
  };

  back() {
    this.location.back();
  }
}
