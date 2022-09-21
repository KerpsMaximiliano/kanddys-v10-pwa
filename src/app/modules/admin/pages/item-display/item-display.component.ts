import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemCategory } from 'src/app/core/models/item';
import { Notification } from 'src/app/core/models/notification';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { UsersService } from 'src/app/core/services/users.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

interface ExtraNotification extends Notification {
  date?: string;
}

@Component({
  selector: 'app-item-display',
  templateUrl: './item-display.component.html',
  styleUrls: ['./item-display.component.scss'],
})
export class ItemDisplayComponent implements OnInit {
  URI: string = environment.uri;
  item: Item;
  shouldRedirectToPreviousPage: boolean = false;
  buyersByItem: User[];
  totalByItem: any;
  env: string = environment.assetsUrl;
  notifications: ExtraNotification[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private usersService: UsersService,
    private headerService: HeaderService,
    private notificationsService: NotificationsService,
    private clipboard: Clipboard,
    private toastr: ToastrService
  ) {}

  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 5,
  };

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      lockUI();
      this.item = await this.itemsService.item(params.itemId);
      if (!this.item) return this.redirect();
      if (this.merchantsService.merchantData._id !== this.item.merchant?._id)
        return this.redirect();
      if (this.item.images.length > 1)
        this.swiperConfig.pagination = {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true,
        };

      this.shouldRedirectToPreviousPage = true;
      await Promise.all([
        this.getTotalByItem(this.item._id),
        this.getBuyersByItem(this.item._id),
        this.getNotifications(),
      ]);
      unlockUI();
    });
  }

  async getNotifications() {
    if (!this.item.notifications?.length) return;
    try {
      const [notifications, notificationCheckers] = await Promise.all([
        this.notificationsService.notifications(
          {},
          this.merchantsService.merchantData._id,
          this.item.notifications
        ),
        this.notificationsService.notificationCheckers({
          findBy: {
            merchant: this.merchantsService.merchantData._id,
            status: 'sent',
            notification: this.item.notifications,
          },
          options: {
            limit: 25,
            page: 1,
            sortBy: 'createdAt:desc',
          },
        }),
      ]);
      this.notifications = notifications;
      this.notifications.forEach((notification) => {
        notification.action =
          this.notificationsService.getNotificationAction(notification).action;
        const date = notificationCheckers.find(
          (checker) => checker.notification._id === notification._id
        )?.date;
        if (!date) return;
        notification.date = `${date
          .toLocaleString('es-MX', {
            weekday: 'long',
          })
          .toUpperCase()}, ${date.getDate()} DE ${date
          .toLocaleString('es-MX', {
            month: 'long',
          })
          .toUpperCase()} DE ${date.getFullYear()}, ${date.toLocaleTimeString()}`;
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalByItem(itemID: string) {
    try {
      this.totalByItem = (
        await this.itemsService.totalByItem(
          this.merchantsService.merchantData._id,
          [itemID]
        )
      )[0];
    } catch (error) {
      console.log(error);
    }
  }

  async getBuyersByItem(itemID: string) {
    try {
      this.buyersByItem = (
        await this.usersService.buyersByItem(itemID)
      )?.buyersByItem;
    } catch (error) {
      console.log(error);
    }
  }

  goToNotificationsLog = (id: string) => {
    this.router.navigate([`/admin/notifications-log/${id}`]);
  };

  goToAuth() {
    this.router.navigate([
      `/auth/authentication/${this.item._id}`,
      ,
      {
        queryParams: {
          type: 'create-item',
        },
      },
    ]);
  }

  goToMerchantStore() {
    // this.router.navigate([`/admin/merchant-dashboard/${this.merchantsService.merchantData._id}/my-store`]);
    this.router.navigate([`/admin/merchant-items`]);
  }

  toggleActivateItem = () => {
    this.itemsService
      .updateItem(
        {
          status:
            this.item.status === 'disabled'
              ? 'active'
              : this.item.status === 'active'
              ? 'featured'
              : 'disabled',
        },
        this.item._id
      )
      .catch((error) => {
        console.log(error);
      });
    this.item.status =
      this.item.status === 'disabled'
        ? 'active'
        : this.item.status === 'active'
        ? 'featured'
        : 'disabled';
  };

  openShareDialog = () => {
    const styles = [
      { 'background-color': '#82F18D', color: '#174B72' },
      { 'background-color': '#B17608', color: '#FFFFFF' },
    ];
    const list: StoreShareList[] = [
      {
        title: 'Sobre ' + (this.item.name || 'el artículo'),
        label: {
          text:
            this.item.status === 'active'
              ? 'VISIBLE (NO DESTACADO)'
              : this.item.status === 'featured'
              ? 'VISIBLE (Y DESTACADO)'
              : 'INVISIBLE',
          labelStyles: this.item.status === 'disabled' ? styles[1] : styles[0],
        },
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/item-detail/${this.saleflowService.saleflowData._id}/${this.item._id}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/item-detail/${this.saleflowService.saleflowData._id}/${this.item._id}`,
            icon: {
              src: '/upload.svg',
              size: {
                width: 20,
                height: 26,
              },
            },
          },
          {
            text: 'Ir a la vista del visitante',
            mode: 'func',
            func: () => {
              this.router.navigate([
                `/ecommerce/item-detail/${this.saleflowService.saleflowData._id}/${this.item._id}`,
              ]);
            },
          },
        ],
      },
    ];
    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        hideCancelButtton: true,
        dynamicStyles: {
          titleWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingBottom: '26px',
          },
          dialogCard: {
            paddingTop: '0px',
          },
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  openImageModal(imageSourceURL: string) {
    this.dialogService.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  redirect() {
    unlockUI();
    if (!this.shouldRedirectToPreviousPage) {
      this.router.navigate([`others/error-screen/`], {
        queryParams: { type: 'item' },
      });
    } else {
      this.router.navigate([`/admin/merchant-items`]);
    }
  }

  redirectTo = (route: string, params = null) => {
    if (!params) this.router.navigate([route]);
    else
      this.router.navigate(
        [route],
        params
          ? {
              ...params,
            }
          : null
      );
  };

  openDialog() {
    const styles = [
      {
        'background-color': '#82F18D',
        color: '#174B72',
        'margin-top': this.item.name ? 0 : '40px',
      },
      {
        'background-color': '#82F18D',
        color: '#174B72',
        'margin-top': this.item.name ? 0 : '40px',
      },
      {
        'background-color': '#B17608',
        color: '#FFFFFF',
        'margin-top': this.item.name ? 0 : '40px',
      },
    ];
    const list: StoreShareList[] = [
      {
        title: this.item.name,
        label: {
          text:
            this.item.status === 'active'
              ? 'VISIBLE (NO DESTACADO)'
              : this.item.status === 'featured'
              ? 'VISIBLE (Y DESTACADO)'
              : 'INVISIBLE',
          textArray: [
            'VISIBLE (NO DESTACADO)',
            'VISIBLE (Y DESTACADO)',
            'INVISIBLE',
          ],
          func: this.toggleActivateItem,
          valueUpdate: () => {
            return this.item.status === 'disabled'
              ? 0
              : this.item.status === 'active'
              ? 1
              : 2;
          },
          stylesArray: styles,
          labelStyles: this.item.status === 'disabled' ? styles[2] : styles[0],
        },
        options: [
          {
            text: 'Editar producto',
            mode: 'func',
            func: () => {
              if (this.item.params.length === 0) {
                this.router.navigate([`admin/create-item/${this.item._id}`]);
              } else if (
                this.item.params.length > 0 &&
                this.item.params[0].values.length > 0
              ) {
                this.router.navigate([`admin/create-item/${this.item._id}`], {
                  queryParams: {
                    justdynamicmode: true,
                  },
                });
              }
            },
          },
          {
            text: 'Adicionar nuevo Item',
            mode: 'func',
            func: () => {
              this.router.navigate([`/admin/create-item`]);
            },
          },
          // {
          //   text: 'Adiciona una venta',
          //   mode: 'func',
          //   func: () =>{
          //       this.router.navigate([`/admin/entity-detail-metrics`]);
          //   }
          // },
          // {
          //   text: 'Adiciona un Nuevo tag',
          //   mode: 'func',
          //   func: () =>{
          //       this.router.navigate([`admin/tag-creator`])
          //   }
          // }
          /* {
            text:'Ocultar item',
            mode: 'func',
            func: async () =>{
                await this.itemsService.updateItem({status: 'disabled'}, this.item._id);
                this.item.status = this.item.status === 'disabled' ? 'active' : 'disabled';
                this.toastr.info('Producto oculto', null, {timeOut: 2500});
            }
          } */
        ],
      },
    ];
    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
        hideCancelButtton: true,
        dynamicStyles: {
          titleWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingBottom: '42px',
            paddingTop: '25px',
          },
          dialogCard: {
            paddingTop: '0px',
          },
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  editItem = () => {
    this.headerService.flowRoute = this.router.url;

    this.itemsService.temporalItem = null;
    this.router.navigate(['/admin/create-item/' + this.item._id]);
  };

  copyLink() {
    this.clipboard.copy(
      `${this.URI}/ecommerce/item-detail/${this.saleflowService.saleflowData._id}/${this.item._id}`
    );
    this.toastr.info('Enlace del producto copiado en el clipboard', null, {
      timeOut: 2000,
    });
  }
}
